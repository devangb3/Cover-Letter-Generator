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

API_SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
OPTIONAL_PERSONAL_INFO_FIELDS = {"address", "linkedin", "website"}
WEB_SEARCH_TOOL = {
    "type": "openrouter:web_search",
    "parameters": {
        "max_results": 3,
        "max_total_results": 3,
        "search_context_size": "low",
    },
}
COMPANY_RESEARCH_QUESTION_PATTERN = re.compile(
    r"\b("
    r"why\s+(?:do\s+you\s+)?(?:want|interested)|"
    r"why\s+(?:this\s+)?company|"
    r"why\s+(?:are\s+you\s+)?(?:interested\s+in\s+)?(?:us|our)|"
    r"what\s+do\s+you\s+know\s+about|"
    r"company|product|mission|team|culture"
    r")\b",
    re.IGNORECASE,
)


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

        projects_text = "\n\n".join(
            [
                "Full project evidence bank:",
                "Use every project below as candidate evidence. Internally rank the projects against the job description or question, then cite the strongest matching projects in the final answer.",
                array_content,
            ]
        )
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


def load_instruction(filename):
    instruction_path = os.path.join(API_SERVICE_DIR, filename)
    with open(instruction_path, "r", encoding="utf-8") as file:
        return file.read()


def build_personal_info_text(personal_info):
    if not personal_info:
        return ""

    lines = []
    for key, value in personal_info.items():
        if value and key not in OPTIONAL_PERSONAL_INFO_FIELDS:
            lines.append(f"{key.capitalize()}: {value}")

    if not lines:
        return ""

    return "About me:\n" + "\n".join(lines)


def build_application_context(job_description, company_name, custom_instructions, personal_info):
    sections = ["My resume is attached as a PDF file in the request."]

    personal_info_text = build_personal_info_text(personal_info)
    if personal_info_text:
        sections.append(personal_info_text)

    projects_text = load_projects()
    if projects_text:
        logger.info("Projects loaded successfully")
        sections.append(projects_text)
    else:
        logger.warning("No projects loaded")

    if job_description:
        sections.append(f"Job Description:\n{job_description.strip()}")

    if company_name:
        sections.append(f"Company Name: {company_name.strip()}")

    if custom_instructions:
        sections.append(f"Additional Important Instruction you need to follow:\n{custom_instructions.strip()}")

    return "\n\n".join(section for section in sections if section)


def build_resume_data_url():
    resume_bytes = load_resume_pdf()
    resume_data_b64 = base64.b64encode(resume_bytes).decode("utf-8")
    return f"data:application/pdf;base64,{resume_data_b64}"


def should_enable_question_web_search(questions):
    """Return True when application questions ask for company-specific context."""
    return True
    # return any(COMPANY_RESEARCH_QUESTION_PATTERN.search(question) for question in questions)


def call_openrouter(system_instruction, prompt, selected_model, enable_web_search=False):
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY not configured")

    if not is_allowed_model(selected_model):
        raise ValueError(f"Model '{selected_model}' is not allowed by server configuration")

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
                            "file_data": build_resume_data_url(),
                        },
                    },
                ],
            },
        ],
    }
    if enable_web_search:
        payload["tools"] = [WEB_SEARCH_TOOL]

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
        raise RuntimeError(f"OpenRouter API request failed with status {response.status_code}")

    response_data = response.json()
    choices = response_data.get("choices") or []
    if not choices:
        logger.error("OpenRouter response did not include any choices")
        raise RuntimeError("OpenRouter response did not include any choices")

    message = choices[0].get("message", {})
    response_text = parse_openrouter_content(message.get("content"))
    if not response_text:
        logger.error("No response text received from OpenRouter")
        raise RuntimeError("No response text received from OpenRouter")

    return response_text


def parse_questions(questions):
    if isinstance(questions, list):
        raw_items = [str(item).strip() for item in questions]
    else:
        normalized_questions = str(questions or "").replace("\r\n", "\n").strip()
        if not normalized_questions:
            return []

        separator_pattern = r"\n\s*\n+" if re.search(r"\n\s*\n", normalized_questions) else r"\n+"
        raw_items = [item.strip() for item in re.split(separator_pattern, normalized_questions) if item.strip()]

    parsed_questions = []
    for item in raw_items:
        cleaned_item = re.sub(r"^\s*(?:[-*•]\s*|\d+[\).\s-]+)", "", item).strip()
        if cleaned_item:
            parsed_questions.append(cleaned_item)

    return parsed_questions


def parse_json_response(response_text):
    cleaned_response = response_text.strip()
    if cleaned_response.startswith("```"):
        cleaned_response = re.sub(r"^```(?:json)?\s*", "", cleaned_response, flags=re.IGNORECASE)
        cleaned_response = re.sub(r"\s*```$", "", cleaned_response)

    try:
        return json.loads(cleaned_response)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", cleaned_response)
        if not match:
            raise
        return json.loads(match.group(0))


EM_DASH = "\u2014"


def strip_em_dashes(text: str) -> str:
    """Remove em dashes from model output (post-processing validation)."""
    return text.replace(EM_DASH, "")


def normalize_question_answers(response_payload, original_questions):
    answers = response_payload.get("answers")
    if not isinstance(answers, list):
        raise ValueError("Question answer response did not include an 'answers' array")

    normalized_answers = []
    for index, question in enumerate(original_questions):
        answer_item = answers[index] if index < len(answers) else None
        if not isinstance(answer_item, dict):
            raise ValueError(f"Missing structured answer for question {index + 1}")

        answer_text = answer_item.get("answer")
        if not isinstance(answer_text, str) or not answer_text.strip():
            raise ValueError(f"Missing answer text for question {index + 1}")

        normalized_answers.append(
            {
                "question": str(answer_item.get("question") or question).strip(),
                "answer": strip_em_dashes(answer_text.strip()),
            }
        )

    return normalized_answers


def generate_cover_letter(job_description, company_name, custom_instructions, personal_info, model=None):
    """Generate a cover letter using OpenRouter chat completions."""
    try:
        logger.info("Received processing request via service")
        logger.debug(f"Job description length: {len(job_description)}")
        logger.debug(f"Company name: {company_name}")
        logger.debug(f"Custom instructions length: {len(custom_instructions)}")
        logger.debug(f"Personal info keys: {list((personal_info or {}).keys())}")

        selected_model = model or get_default_model()
        logger.debug(f"Selected model: {selected_model}")

        system_instruction = load_instruction("system_instruction.txt")
        shared_context = build_application_context(
            job_description,
            company_name,
            custom_instructions,
            personal_info,
        )
        prompt = "\n\n".join(
            [
                f"Write a professional cover letter for a job application to {company_name}.",
                "Return only the main body text of the cover letter.",
                "Do not include formatting, header, address, date, greeting, or signature.",
                shared_context,
            ]
        )

        cover_letter_text = call_openrouter(
            system_instruction,
            prompt,
            selected_model,
            enable_web_search=True,
        )
        return {
            "coverLetter": cover_letter_text,
            "personalInfo": personal_info,
            "companyName": company_name,
        }
    except Exception as exc:
        logger.error(f"Error generating cover letter: {exc}")
        logger.error(traceback.format_exc())
        return {"error": str(exc), "traceback": traceback.format_exc()}


def generate_job_question_answers(
    job_description,
    company_name,
    custom_instructions,
    personal_info,
    questions,
    model=None,
):
    """Generate answers to job application questions using shared candidate context."""
    try:
        parsed_questions = parse_questions(questions)
        logger.info("Received job question answering request via service")
        logger.debug(f"Parsed {len(parsed_questions)} questions")

        if not parsed_questions:
            return {"error": "Please provide at least one application question"}

        selected_model = model or get_default_model()
        logger.debug(f"Selected model: {selected_model}")

        system_instruction = load_instruction("question_answer_system_instruction.txt")
        shared_context = build_application_context(
            job_description,
            company_name,
            custom_instructions,
            personal_info,
        )
        questions_block = "\n".join(
            f"{index + 1}. {question}" for index, question in enumerate(parsed_questions)
        )
        prompt = "\n\n".join(
            [
                f"Answer the following job application questions for {company_name} in first person as Devang Borkar.",
                "Return valid JSON only using this schema:",
                '{"answers":[{"question":"<original question>","answer":"<answer text>"}]}',
                "Preserve the original question order.",
                shared_context,
                f"Questions:\n{questions_block}",
            ]
        )

        response_text = call_openrouter(
            system_instruction,
            prompt,
            selected_model,
            enable_web_search=should_enable_question_web_search(parsed_questions),
        )
        response_payload = parse_json_response(response_text)
        normalized_answers = normalize_question_answers(response_payload, parsed_questions)

        return {
            "answers": normalized_answers,
            "companyName": company_name,
        }
    except Exception as exc:
        logger.error(f"Error generating job question answers: {exc}")
        logger.error(traceback.format_exc())
        return {"error": str(exc), "traceback": traceback.format_exc()}
