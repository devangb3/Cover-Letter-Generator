import json
import logging
import os
import re
import traceback
from typing import Type, TypeVar

import httpx
from pydantic import BaseModel, ValidationError

from backend.storage.local import get_api_key, get_profile, get_preferences

from backend.errors import (
    InvalidProviderResponseError,
    InvalidStructuredOutputError,
    ProviderRequestError,
)
from backend.api_service.model_config import (
    get_base_url,
    get_default_model,
    is_allowed_model,
)
from backend.models.llm_outputs import (
    FullResumeDraft,
    JobQuestionAnswerResponse,
    RecruitingEmailDraft,
)

logger = logging.getLogger("api_service")
ResponseModel = TypeVar("ResponseModel", bound=BaseModel)


API_SERVICE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(API_SERVICE_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)
WEB_SEARCH_TOOL = {
    "type": "openrouter:web_search",
    "parameters": {
        "max_results": 3,
        "max_total_results": 3,
        "search_context_size": "low",
    },
}

def get_pydantic_json_schema(model):
    if hasattr(model, "model_json_schema"):
        return model.model_json_schema()
    return model.schema()


def get_strict_json_schema(model):
    """Prepare Pydantic schemas for providers that enforce strict JSON output."""
    schema = get_pydantic_json_schema(model)

    def normalize(node):
        node.pop("default", None)
        if node.get("type") == "object":
            node["additionalProperties"] = False
            node["required"] = list(node.get("properties", {}))
        for key in ("properties", "$defs", "definitions"):
            for child in node.get(key, {}).values():
                normalize(child)
        if isinstance(node.get("items"), dict):
            normalize(node["items"])
        for key in ("anyOf", "oneOf", "allOf"):
            for child in node.get(key, []):
                normalize(child)

    normalize(schema)
    return schema


def validate_pydantic_model(model, payload):
    if hasattr(model, "model_validate"):
        return model.model_validate(payload)
    return model.parse_obj(payload)


def dump_pydantic_model(model_instance):
    if hasattr(model_instance, "model_dump"):
        return model_instance.model_dump()
    return model_instance.dict()


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


def build_application_context(job_description, company_name, custom_instructions, personal_info):
    candidate = get_profile()
    if not candidate:
        raise ValueError("Save your profile before generating application materials.")
    sections = ["Verified candidate profile:\n" + json.dumps(candidate, indent=2)]
    preferences = get_preferences()
    if preferences.get("instructions"):
        sections.append("Default writing preferences:\n" + preferences["instructions"])

    if job_description:
        sections.append(f"Job Description:\n{job_description.strip()}")

    if company_name:
        sections.append(f"Company Name: {company_name.strip()}")

    if custom_instructions:
        sections.append(f"Additional Important Instruction you need to follow:\n{custom_instructions.strip()}")

    return "\n\n".join(section for section in sections if section)


def call_openrouter(system_instruction, prompt, selected_model, enable_web_search=False):
    api_key = get_api_key()
    if not api_key:
        raise RuntimeError("Save your OpenRouter API key in Settings first.")

    if not is_allowed_model(selected_model):
        raise ValueError("Select a configured model.")

    payload = {
        "model": selected_model,
        "messages": [
            {"role": "system", "content": system_instruction},
            {
                "role": "user",
                "content": prompt,
            },
        ],
    }
    if enable_web_search:
        payload["tools"] = [WEB_SEARCH_TOOL]

    headers = {
        "Authorization": f"Bearer {api_key}",
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
        raise ProviderRequestError(
            f"OpenRouter API request failed with status {response.status_code}",
            response.status_code,
        )

    response_data = response.json()
    choices = response_data.get("choices") or []
    if not choices:
        logger.error("OpenRouter response did not include any choices")
        raise InvalidProviderResponseError("OpenRouter response did not include any choices")

    message = choices[0].get("message", {})
    response_text = parse_openrouter_content(message.get("content"))
    if not response_text:
        logger.error("No response text received from OpenRouter")
        raise InvalidProviderResponseError("No response text received from OpenRouter")

    return response_text


def call_openrouter_json(
    system_instruction,
    prompt,
    selected_model,
    max_tokens=800,
    temperature=0.2,
    enable_web_search=False,
    *,
    response_model: Type[ResponseModel],
    max_retries: int = 1,
) -> ResponseModel:
    """Return validated output, retrying invalid output up to max_retries times."""

    api_key = get_api_key()
    if not api_key:
        raise RuntimeError("Save your OpenRouter API key in Settings first.")

    if not is_allowed_model(selected_model):
        raise ValueError("Select a configured model.")

    payload = {
        "model": selected_model,
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt},
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": response_model.__name__,
                "strict": True,
                "schema": get_strict_json_schema(response_model),
            },
        },
    }
    if max_tokens is not None:
        payload["max_tokens"] = max_tokens
    if temperature is not None:
        payload["temperature"] = temperature
    if enable_web_search:
        payload["tools"] = [WEB_SEARCH_TOOL]

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    endpoint = f"{get_base_url().rstrip('/')}/chat/completions"
    attempts = 1 + max_retries
    for attempt in range(1, attempts + 1):
        response = httpx.post(endpoint, headers=headers, json=payload, timeout=120.0)
        if response.status_code >= 400:
            raise ProviderRequestError(
                f"OpenRouter API request failed with status {response.status_code}",
                response.status_code,
            )

        response_data = response.json()
        choices = response_data.get("choices") or []
        if not choices:
            raise InvalidProviderResponseError("OpenRouter response did not include any choices")

        message = choices[0].get("message", {})
        response_text = parse_openrouter_content(message.get("content"))
        if not response_text and max_retries == 0:
            raise InvalidProviderResponseError("No response text received from OpenRouter")
        try:
            json_response = parse_json_response(response_text)
            return validate_pydantic_model(response_model, json_response)
        except (json.JSONDecodeError, ValidationError) as exc:
            if max_retries == 0:
                raise
            if isinstance(exc, ValidationError):
                feedback = "; ".join(
                    f"{'.'.join(map(str, error['loc']))}: {error['msg']}"
                    for error in exc.errors(include_input=False, include_context=False)
                )
            else:
                feedback = f"Invalid JSON: {exc.msg} at line {exc.lineno}, column {exc.colno}"
            logger.warning(
                "Invalid structured output attempt=%s/%s requested_model=%s model=%s "
                "provider=%s response_id=%s finish_reason=%s validation=%s",
                attempt, attempts, selected_model, response_data.get('model'),
                response_data.get('provider'), response_data.get('id'),
                choices[0].get('finish_reason'), feedback,
            )
            if attempt == attempts:
                raise InvalidStructuredOutputError(
                    "The model returned an invalid response. Please try again."
                ) from exc
            correction = (
                "Your previous response failed validation: " + feedback
                + ". Generate the complete response again as valid JSON matching the schema. "
            )
            if response_model is JobQuestionAnswerResponse:
                correction += "Each answers entry must be an object containing question and answer, not a string."
            payload = {**payload, "messages": [
                *payload["messages"], {"role": "user", "content": correction},
            ]}


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


UNICODE_DASH_CHARS = "\u2013\u2014\u2015"
SPACED_UNICODE_DASH_RE = re.compile(f"[ \t]+[{UNICODE_DASH_CHARS}][ \t]+")
UNICODE_DASH_RE = re.compile(f"[{UNICODE_DASH_CHARS}]")


def normalize_generated_text(value):
    """Normalize user-facing model output before display or PDF rendering."""
    if isinstance(value, str):
        normalized = SPACED_UNICODE_DASH_RE.sub("; ", value)
        normalized = UNICODE_DASH_RE.sub("-", normalized)
        normalized = re.sub(r"[ \t]{2,}", " ", normalized)
        return normalized.strip()

    if isinstance(value, list):
        return [normalize_generated_text(item) for item in value]

    if isinstance(value, dict):
        return {key: normalize_generated_text(item) for key, item in value.items()}

    return value


def strip_em_dashes(text: str) -> str:
    """Backward-compatible wrapper for existing question answer cleanup."""
    return normalize_generated_text(text)


def normalize_question_answers(response_model: JobQuestionAnswerResponse, original_questions):
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
            "coverLetter": normalize_generated_text(cover_letter_text),
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
                f"Answer the following job application questions for {company_name} in first person as the candidate.",
                "Return valid JSON only that conforms to this Pydantic-generated JSON schema:",
                response_schema,
                "Preserve the original question order.",
                shared_context,
                f"Questions:\n{questions_block}",
            ]
        )

        response = call_openrouter_json(
            system_instruction,
            prompt,
            model,
            response_model=JobQuestionAnswerResponse,
            max_retries=1,
            max_tokens=None,
            temperature=None,
            enable_web_search=True,
        )
        normalized_answers = normalize_question_answers(response, parsed_questions)

        return {
            "answers": normalized_answers,
            "companyName": company_name,
        }
    except InvalidStructuredOutputError:
        logger.exception("Job question answers failed validation after exhausting retries")
        raise
    except Exception as exc:
        logger.error(f"Error generating job question answers: {exc}")
        logger.error(traceback.format_exc())
        return {"error": str(exc), "traceback": traceback.format_exc()}


def generate_recruiting_email(
    job_description,
    company_name,
    custom_instructions,
    personal_info,
    model="~google/gemini-flash-latest",
):
    """Draft a concise outreach email for a company's recruiting team."""
    try:
        system_instruction = load_instruction("prompts/recruiting_email_sys.txt")
        shared_context = build_application_context(
            job_description,
            company_name,
            custom_instructions,
            personal_info,
        )
        response_schema = json.dumps(
            get_pydantic_json_schema(RecruitingEmailDraft),
            indent=2,
        )
        prompt = "\n\n".join(
            [
                f"Target company: {company_name}",
                "Draft one outreach email to the people responsible for recruiting for this role.",
                "Return valid JSON only that conforms to this Pydantic-generated JSON schema:",
                response_schema,
                "Application context:",
                shared_context,
            ]
        )
        draft = call_openrouter_json(
            system_instruction,
            prompt,
            model,
            response_model=RecruitingEmailDraft,
            max_tokens=None,
            temperature=None,
            enable_web_search=True,
        )
        return normalize_generated_text(dump_pydantic_model(draft))
    except Exception as exc:
        logger.error(f"Error generating recruiting email: {exc}")
        logger.error(traceback.format_exc())
        return {"error": str(exc), "traceback": traceback.format_exc()}


def build_full_resume_project_catalog(resume_data):
    return resume_data.get("projects", [])


def generate_full_resume_draft(
    job_description,
    company_name,
    custom_instructions,
    personal_info,
    resume_data,
    project_catalog,
    model="~google/gemini-flash-latest",
    retry_history=None,
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
                "Choose up to 3 relevant projects from the project_catalog. Return an empty list when none are available. Never invent entries.",
                "Use only supported content. Short resumes are valid when the candidate has limited experience.",
                "Return valid JSON only that conforms to this Pydantic-generated JSON schema:",
                response_schema,
                "Resume source data and renderable project catalog:",
                json.dumps(resume_source, indent=2),
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
                    + "\n\n".join(history)
                    + f"\n\nFix this latest error: {last_error}"
                )
            try:
                draft = call_openrouter_json(
                    system_instruction,
                    base_prompt + retry_context,
                    model,
                    max_tokens=4200,
                    temperature=0.75,
                    enable_web_search=True,
                    response_model=FullResumeDraft,
                )
                return normalize_generated_text(dump_pydantic_model(draft))
            except ValueError as exc:
                last_error = f"Full resume draft validation error: {exc}"
                history.append(f"Attempt {attempt} validation error: {str(exc)[:4000]}")

        raise ValueError(f"Unable to generate a valid full resume draft after retries: {last_error}")
    except Exception as exc:
        logger.error(f"Error generating full resume draft: {exc}")
        logger.error(traceback.format_exc())
        return {"error": str(exc), "traceback": traceback.format_exc()}
