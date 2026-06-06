import base64
import json
import logging
import os
import re
import traceback

import httpx

from backend.api_service.model_config import (
    get_base_url,
    get_default_model,
    is_allowed_model,
    load_model_config,
)
from backend.models.llm_outputs import (
    FullResumeDraft,
    JobQuestionAnswerResponse,
    ResumeBulletPatch,
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
BACKEND_DIR = os.path.dirname(API_SERVICE_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)
OPTIONAL_PERSONAL_INFO_FIELDS = {"address", "linkedin", "website", "email", "phone"}
WEB_SEARCH_TOOL = {
    "type": "openrouter:web_search",
    "parameters": {
        "max_results": 3,
        "max_total_results": 3,
        "search_context_size": "low",
    },
}
EXPERIENCE_OWNED_PROJECT_IDS = {"pilotcrew-gen-eval", "lh-multimodal-svc"}

def get_pydantic_json_schema(model):
    if hasattr(model, "model_json_schema"):
        return model.model_json_schema()
    return model.schema()


def validate_pydantic_model(model, payload):
    if hasattr(model, "model_validate"):
        return model.model_validate(payload)
    return model.parse_obj(payload)


def dump_pydantic_model(model_instance):
    if hasattr(model_instance, "model_dump"):
        return model_instance.model_dump()
    return model_instance.dict()


def load_project_catalog():
    """Load renderable project metadata from projects.json."""
    try:
        projects_path = os.path.join(ROOT_DIR, "static", "projects.json")
        logger.info(f"Loading project catalog from: {projects_path}")

        if not os.path.exists(projects_path):
            logger.error(f"Projects file not found at: {projects_path}")
            return []

        with open(projects_path, "r", encoding="utf-8") as file:
            projects = json.load(file)

        if not isinstance(projects, list):
            logger.warning("projects.json must contain a top-level array")
            return []

        logger.info("Loaded %s projects from projects.json", len(projects))
        return projects
    except Exception as exc:
        logger.error(f"Error loading project catalog: {exc}")
        logger.error(traceback.format_exc())
        return []


def load_projects():
    """Load projects from projects.json and format them for the prompt."""
    projects = load_project_catalog()
    if not projects:
        return ""

    projects_text = "\n\n".join(
        [
            "Full project evidence bank:",
            "Use every project below as candidate evidence. Internally rank the projects against the job description or question, then cite the strongest matching projects in the final answer.",
            json.dumps(projects, indent=2),
        ]
    )
    logger.info(f"Loaded projects, content length: {len(projects_text)}")
    return projects_text


def load_resume_pdf():
    """Read resume bytes from static/resume.pdf."""
    resume_path = os.path.join(
        ROOT_DIR, "static", "resume.pdf"
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


def build_file_data_url(file_path, mime_type):
    with open(file_path, "rb") as file:
        encoded_file = base64.b64encode(file.read()).decode("utf-8")
    return f"data:{mime_type};base64,{encoded_file}"


def _openrouter_headers():
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
    return headers


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

    headers = _openrouter_headers()

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


def call_openrouter_json(
    system_instruction,
    prompt,
    selected_model,
    max_tokens=800,
    temperature=0.2,
    enable_web_search=False,
):
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY not configured")

    payload = {
        "model": selected_model,
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    if enable_web_search:
        payload["tools"] = [WEB_SEARCH_TOOL]

    headers = _openrouter_headers()
    endpoint = f"{get_base_url().rstrip('/')}/chat/completions"
    response = httpx.post(endpoint, headers=headers, json=payload, timeout=120.0)
    if response.status_code >= 400:
        raise RuntimeError(f"OpenRouter API request failed with status {response.status_code}")

    response_data = response.json()
    choices = response_data.get("choices") or []
    if not choices:
        raise RuntimeError("OpenRouter response did not include any choices")

    message = choices[0].get("message", {})
    response_text = parse_openrouter_content(message.get("content"))
    if not response_text:
        raise RuntimeError("No response text received from OpenRouter")
    return response_text


def critique_resume_render(
    critique_prompt,
    selected_model,
    pdf_path="",
    image_path="",
    max_tokens=700,
):
    """Ask OpenRouter for a compact critique of a rendered resume attempt."""
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY not configured")

    if not is_allowed_model(selected_model):
        raise ValueError(f"Model '{selected_model}' is not allowed by server configuration")

    content = [{"type": "text", "text": critique_prompt}]

    if image_path and os.path.exists(image_path):
        content.append(
            {
                "type": "image_url",
                "image_url": {
                    "url": build_file_data_url(image_path, "image/png"),
                },
            }
        )

    payload = {
        "model": selected_model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a strict resume layout reviewer. Return concise, actionable feedback "
                    "for the next JSON resume draft only. Do not rewrite the whole resume."
                ),
            },
            {"role": "user", "content": content},
        ],
        "max_tokens": max_tokens,
        "temperature": 0.1,
    }


    endpoint = f"{get_base_url().rstrip('/')}/chat/completions"
    response = httpx.post(endpoint, headers=_openrouter_headers(), json=payload, timeout=120.0)
    if response.status_code >= 400 and image_path:
        logger.warning("Resume visual critique with image failed; retrying with PDF/text only: %s", response.text)
        return critique_resume_render(
            critique_prompt,
            selected_model,
            pdf_path=pdf_path,
            image_path="",
            max_tokens=max_tokens,
        )
    if response.status_code >= 400:
        raise RuntimeError(f"OpenRouter resume critique failed with status {response.status_code}: {response.text}")

    response_data = response.json()
    choices = response_data.get("choices") or []
    if not choices:
        raise RuntimeError("OpenRouter response did not include any choices")

    message = choices[0].get("message", {})
    response_text = parse_openrouter_content(message.get("content"))
    if not response_text:
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
    response_model = validate_pydantic_model(JobQuestionAnswerResponse, response_payload)
    answers = response_model.answers
    if len(answers) < len(original_questions):
        raise ValueError("Question answer response did not include an answer for every question")

    normalized_answers = []
    for index, question in enumerate(original_questions):
        answer_item = answers[index] if index < len(answers) else None
        if answer_item is None:
            raise ValueError(f"Missing structured answer for question {index + 1}")

        answer_text = answer_item.answer
        if not isinstance(answer_text, str) or not answer_text.strip():
            raise ValueError(f"Missing answer text for question {index + 1}")

        normalized_answers.append(
            {
                "question": question,
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


        selected_model = model or get_default_model()
        logger.debug(f"Selected model: {selected_model}")

        system_instruction = load_instruction("prompts/cover_letter_sys.txt")
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
    model="~google/gemini-flash-latest",
):
    try:
        parsed_questions = parse_questions(questions)
        logger.info("Received job question answering request via service")
        logger.debug(f"Parsed {len(parsed_questions)} questions")

        if not parsed_questions:
            return {"error": "Please provide at least one application question"}


        system_instruction = load_instruction("prompts/question_answer_sys.txt")
        shared_context = build_application_context(
            job_description,
            company_name,
            custom_instructions,
            personal_info,
        )
        questions_block = "\n".join(
            f"{index + 1}. {question}" for index, question in enumerate(parsed_questions)
        )
        response_schema = json.dumps(
            get_pydantic_json_schema(JobQuestionAnswerResponse),
            indent=2,
        )
        prompt = "\n\n".join(
            [
                f"Answer the following job application questions for {company_name} in first person as Devang Borkar.",
                "Return valid JSON only that conforms to this Pydantic-generated JSON schema:",
                response_schema,
                "Preserve the original question order.",
                shared_context,
                f"Questions:\n{questions_block}",
            ]
        )

        response_text = call_openrouter(
            system_instruction,
            prompt,
            model,
            enable_web_search=True,
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


def generate_resume_bullets(
    job_description,
    company_name,
    custom_instructions,
    personal_info,
    resume_targets,
    model="~google/gemini-flash-latest",
    retry_history=None,
):
    """Generate LaTeX-safe bullets for experience and projects only."""
    try:
        if not resume_targets:
            raise ValueError("No resume entries were provided for tailoring")

        system_instruction = load_instruction("prompts/resume_bullet_points_sys.txt")
        shared_context = build_application_context(
            job_description,
            company_name,
            custom_instructions,
            personal_info,
        )
        response_schema = json.dumps(
            get_pydantic_json_schema(ResumeBulletPatch),
            indent=2,
        )
        targets_json = json.dumps(resume_targets, indent=2)
        target_requirements = "\n".join(
            f"- {target['id']}: exactly {target['bullet_count']} bullets"
            for target in resume_targets
        )
        base_prompt = "\n\n".join(
            [
                f"Target company: {company_name}",
                "Update only bullet text for the provided resume.yaml entries.",
                "Return one update for every provided id.",
                "Bullet count requirements:",
                target_requirements,
                "Each bullet must be plain text.",
                "Rewrite strength requirements:",
                "- Make the bullets visibly different from the current_bullets; do not merely shorten, clean up, or swap a few words.",
                "- Preserve truthful facts, but recast the emphasis around the target role's strongest supported needs.",
                "- For AI/ML solution roles, prefer supported language around deployment, integration, RAG/search, evaluation, cloud, Docker, observability, customer or stakeholder workflows, enterprise scale, and performance optimization.",
                "- If a target entry is only weakly relevant, still improve the framing substantially instead of returning a generic paraphrase.",
                "Return valid JSON only that conforms to this Pydantic-generated JSON schema:",
                response_schema,
                "Resume entries available for tailoring:",
                targets_json,
                "Job Context:",
                shared_context,
            ]
        )

        history = list(retry_history or [])
        last_error = ""
        for attempt in range(1, 4):
            retry_context = ""
            if history:
                retry_context = (
                    "\n\nPrevious attempt history:\n"
                    + "\n".join(history)
                    + f"\nFix this latest error: {last_error}"
                )
            response_text = call_openrouter_json(
                system_instruction,
                base_prompt + retry_context,
                model,
                max_tokens=3200,
                temperature=0.7,
                enable_web_search=True,
            )
            try:
                payload = parse_json_response(response_text)
                patch = validate_pydantic_model(ResumeBulletPatch, payload)
                return dump_pydantic_model(patch)
            except Exception as exc:
                last_error = f"Resume bullet payload validation error: {exc}"
                history.append(f"Attempt {attempt} output: {response_text[:1200]}")

        raise ValueError(f"Unable to generate valid JSON after retries: {last_error}")
    except Exception as exc:
        logger.error(f"Error generating resume bullets: {exc}")
        logger.error(traceback.format_exc())
        return {"error": str(exc), "traceback": traceback.format_exc()}


def build_full_resume_project_catalog(resume_data):
    catalog_by_id = {}
    for project in resume_data.get("projects", []):
        project_id = project.get("id")
        if project_id:
            catalog_by_id[project_id] = {
                **project,
                "description": "",
                "technologies": [],
                "highlights": project.get("bullets", []),
            }

    for project in load_project_catalog():
        project_id = project.get("id")
        if project_id in EXPERIENCE_OWNED_PROJECT_IDS:
            continue
        if project_id and project_id not in catalog_by_id:
            catalog_by_id[project_id] = project

    return list(catalog_by_id.values())


def generate_full_resume_draft(
    job_description,
    company_name,
    custom_instructions,
    personal_info,
    resume_data,
    project_catalog,
    model="~google/gemini-flash-latest",
):
    """Generate a full one-page resume draft with mandatory experience and selected projects."""
    try:
        mandatory_experience = [
            {
                "id": entry.get("id"),
                "title": entry.get("title"),
                "organization": entry.get("organization"),
                "dates": entry.get("dates"),
                "location": entry.get("location"),
                "current_bullets": entry.get("bullets", []),
                "supporting_projects": entry.get("supporting_projects", []),
            }
            for entry in resume_data.get("experience", [])
        ]
        if not mandatory_experience:
            raise ValueError("No mandatory experience entries were provided")

        system_instruction = load_instruction("prompts/full_resume_sys.txt")
        shared_context = build_application_context(
            job_description,
            company_name,
            custom_instructions,
            personal_info,
        )
        response_schema = json.dumps(
            get_pydantic_json_schema(FullResumeDraft),
            indent=2,
        )
        resume_source = {
            "profile": resume_data.get("profile", {}),
            "skills": resume_data.get("skills", []),
            "education": resume_data.get("education", []),
            "mandatory_experience": mandatory_experience,
            "project_catalog": project_catalog,
        }
        mandatory_ids = ", ".join(entry["id"] for entry in mandatory_experience if entry.get("id"))
        base_prompt = "\n\n".join(
            [
                f"Target company: {company_name}",
                "Generate a completely new tailored resume draft.",
                "The backend will lock the header, education, experience metadata, project metadata, and PDF layout.",
                f"Mandatory experience ids that must all appear exactly once: {mandatory_ids}.",
                "Education is always included by the renderer; do not return education.",
                "Choose exactly 3 projects from the project_catalog.",
                "Use enough supported content to fill a strong one-page resume; avoid sparse drafts.",
                "Return valid JSON only that conforms to this Pydantic-generated JSON schema:",
                response_schema,
                "Resume source data and renderable project catalog:",
                json.dumps(resume_source, indent=2),
                "Job Context:",
                shared_context,
            ]
        )

        history = []
        last_error = ""
        for attempt in range(1, 4):
            retry_context = ""
            if history:
                retry_context = (
                    "\n\nPrevious attempt history:\n"
                    + "\n\n".join(history)
                    + f"\n\nFix this latest error: {last_error}"
                )
            response_text = call_openrouter_json(
                system_instruction,
                base_prompt + retry_context,
                model,
                max_tokens=4200,
                temperature=0.75,
                enable_web_search=True,
            )
            try:
                payload = parse_json_response(response_text)
                draft = validate_pydantic_model(FullResumeDraft, payload)
                return dump_pydantic_model(draft)
            except Exception as exc:
                last_error = f"Full resume draft validation error: {exc}"
                history.append(f"Attempt {attempt} output: {response_text[:4000]}")

        raise ValueError(f"Unable to generate a valid full resume draft after retries: {last_error}")
    except Exception as exc:
        logger.error(f"Error generating full resume draft: {exc}")
        logger.error(traceback.format_exc())
        return {"error": str(exc), "traceback": traceback.format_exc()}
