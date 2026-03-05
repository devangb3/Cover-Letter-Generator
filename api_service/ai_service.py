import base64
import json
import logging
import os
import re
import traceback

import httpx

from api_service.model_config import (
    get_base_url,
    get_default_model,
    is_allowed_model,
    load_model_config,
)

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("api_service")

try:
    load_model_config()
except Exception as exc:
    raise RuntimeError(f"Failed to load model configuration: {exc}") from exc

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    logger.warning("OPENROUTER_API_KEY not set in environment")


def load_projects():
    """Load projects from constants.js and format them for the prompt."""
    try:
        constants_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "..", "static", "constants.js"
        )
        logger.info(f"Loading projects from: {constants_path}")

        if not os.path.exists(constants_path):
            logger.error(f"Constants file not found at: {constants_path}")
            return ""

        with open(constants_path, "r", encoding="utf-8") as file:
            content = file.read()

        start_match = re.search(r"export\s+const\s+projects\s*=\s*\[", content, re.DOTALL)
        if not start_match:
            logger.warning("Could not find projects array in constants.js")
            return ""

        start_pos = start_match.end() - 1
        bracket_count = 0
        i = start_pos

        while i < len(content):
            if content[i] == "[":
                bracket_count += 1
            elif content[i] == "]":
                bracket_count -= 1
                if bracket_count == 0:
                    array_content = content[start_pos + 1 : i].strip()
                    break
            i += 1
        else:
            logger.warning("Could not find matching closing bracket for projects array")
            return ""

        projects_text = "Projects I have worked on:\n\n" + array_content
        logger.info(f"Loaded projects, content length: {len(projects_text)}")
        return projects_text
    except Exception as exc:
        logger.error(f"Error loading projects: {exc}")
        logger.error(traceback.format_exc())
        return ""


def load_resume_pdf():
    """Read resume bytes from static/resume.pdf."""
    resume_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "..", "static", "resume.pdf"
    )
    logger.info(f"Loading resume from: {resume_path}")
    if not os.path.exists(resume_path):
        raise FileNotFoundError(f"Resume file not found at: {resume_path}")

    with open(resume_path, "rb") as file:
        resume_bytes = file.read()
    logger.info(f"Loaded resume PDF, size: {len(resume_bytes)} bytes")
    return resume_bytes


def parse_openrouter_content(content):
    """Normalize OpenRouter content payloads into plain text."""
    if isinstance(content, str):
        return content.strip()

    if isinstance(content, dict):
        text_value = content.get("text")
        return text_value.strip() if isinstance(text_value, str) else json.dumps(content)

    if isinstance(content, list):
        text_segments = []
        for item in content:
            if isinstance(item, dict):
                text_value = item.get("text")
                if isinstance(text_value, str):
                    text_segments.append(text_value.strip())
        if text_segments:
            return "\n".join(segment for segment in text_segments if segment)
        return json.dumps(content)

    return str(content)


def generate_cover_letter(job_description, company_name, custom_instructions, personal_info, model=None):
    """Generate a cover letter using OpenRouter chat completions."""
    try:
        logger.info("Received processing request via service")
        logger.debug(f"Job description length: {len(job_description)}")
        logger.debug(f"Company name: {company_name}")
        logger.debug(f"Custom instructions length: {len(custom_instructions)}")
        logger.debug(f"Personal info keys: {list((personal_info or {}).keys())}")

        if not OPENROUTER_API_KEY:
            return {"error": "OPENROUTER_API_KEY not configured"}

        selected_model = model or get_default_model()
        if not is_allowed_model(selected_model):
            return {"error": f"Model '{selected_model}' is not allowed by server configuration"}
        logger.debug(f"Selected model: {selected_model}")

        personal_info_text = ""
        if personal_info:
            personal_info_text = "About me:\n"
            for key, value in personal_info.items():
                if value and key not in {"address", "linkedin", "website"}:
                    personal_info_text += f"{key.capitalize()}: {value}\n"

        projects_text = load_projects()
        if projects_text:
            logger.info("Projects loaded successfully")
        else:
            logger.warning("No projects loaded")

        system_instruction_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "system_instruction.txt"
        )
        with open(system_instruction_path, "r", encoding="utf-8") as file:
            system_instruction = file.read()

        prompt = f"""
        Write a professional cover letter for a job application to {company_name}. I need ONLY the main body text of the cover letter.
        DO NOT include any formatting, header, address, date, greeting, or signature - those will be added later.

        My Resume is attached as a PDF file in the data.

        {personal_info_text}

        {projects_text if projects_text else ""}

        Job Description:
        {job_description}

        Company Name: {company_name}

        {custom_instructions if custom_instructions else ""}
        """

        resume_bytes = load_resume_pdf()
        resume_data_b64 = base64.b64encode(resume_bytes).decode("utf-8")
        resume_data_url = f"data:application/pdf;base64,{resume_data_b64}"

        payload = {
            "model": selected_model,
            "messages": [
                {"role": "system", "content": system_instruction},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "file",
                            "file": {
                                "filename": "resume.pdf",
                                "file_data": resume_data_url,
                            },
                        },
                    ],
                },
            ],
        }

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }
        http_referer = os.environ.get("OPENROUTER_HTTP_REFERER")
        app_title = os.environ.get("OPENROUTER_APP_TITLE")
        if http_referer:
            headers["HTTP-Referer"] = http_referer
        if app_title:
            headers["X-Title"] = app_title

        endpoint = f"{get_base_url().rstrip('/')}/chat/completions"
        logger.info(f"Calling OpenRouter chat completions at: {endpoint}")
        response = httpx.post(endpoint, headers=headers, json=payload, timeout=120.0)

        if response.status_code >= 400:
            logger.error(f"OpenRouter API error {response.status_code}: {response.text}")
            return {"error": f"OpenRouter API request failed with status {response.status_code}"}

        response_data = response.json()
        choices = response_data.get("choices") or []
        if not choices:
            logger.error("OpenRouter response did not include any choices")
            return {"error": "OpenRouter response did not include any choices"}

        message = choices[0].get("message", {})
        cover_letter_text = parse_openrouter_content(message.get("content"))
        if not cover_letter_text:
            logger.error("No response text received from OpenRouter")
            return {"error": "No response text received from OpenRouter"}

        return {
            "coverLetter": cover_letter_text,
            "personalInfo": personal_info,
            "companyName": company_name,
        }
    except Exception as exc:
        logger.error(f"Error generating cover letter: {exc}")
        logger.error(traceback.format_exc())
        return {"error": str(exc), "traceback": traceback.format_exc()}
