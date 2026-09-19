"""Tailored resume generation, rendering, and retry policy."""
import json
import logging
import shutil

from backend.services import profile as profile_store
from backend.services.errors import ServiceError
from backend.api_service.ai_service import build_full_resume_project_catalog, generate_full_resume_draft
from pdf_service.resume_generator import compile_tex_to_pdf, render_full_resume_tex

logger = logging.getLogger(__name__)


def json_dumps_for_prompt(payload, limit=6000):
    rendered = json.dumps(payload, indent=2)
    if len(rendered) > limit:
        return rendered[:limit] + "\n...[truncated]"
    return rendered


def generate_resume(job_description, company_name, custom_instructions, personal_info, model):
    if not (shutil.which('pdflatex') or shutil.which('tectonic')):
        raise ServiceError('Install pdflatex or Tectonic to generate tailored resume PDFs.', 400)
    resume_data = profile_store.resume_data()
    project_catalog = build_full_resume_project_catalog(resume_data)
    retry_history = []
    for attempt in range(1, 4):
        draft_payload = generate_full_resume_draft(
            job_description,
            company_name,
            custom_instructions,
            personal_info,
            resume_data,
            project_catalog,
            model,
            retry_history=retry_history,
        )
        if 'error' in draft_payload:
            raise ServiceError(draft_payload, 500)

        try:
            tex_content = render_full_resume_tex(resume_data, draft_payload, project_catalog)
        except Exception as render_error:
            logger.error("Full resume render failed on attempt %s: %s", attempt, render_error)
            retry_history.append(
                "\n".join(
                    [
                        f"Attempt {attempt} previous JSON draft:",
                        json_dumps_for_prompt(draft_payload),
                        f"Attempt {attempt} render error: {render_error}",
                        "Fix the JSON structure while preserving the supplied experience and education.",
                    ]
                )
            )
            continue

        compile_result = compile_tex_to_pdf(
            tex_content,
            company_name=company_name,
            require_single_page=True,
            min_text_chars=0,
        )
        if compile_result.get('ok'):
            return {'resumeFile': compile_result.get('resumeFile')}
        compiler_error = compile_result.get('compilerError', '')
        retry_instruction = (
            "Revise the draft using the PDF error. Preserve all supplied experience and education. "
            "Shorten supported bullets if necessary. Never invent content to fill space."
        )
        retry_history.append(
            "\n".join(
                [
                    f"Attempt {attempt} previous JSON draft:",
                    json_dumps_for_prompt(draft_payload),
                    f"Attempt {attempt} PDF result: {compiler_error}",
                    retry_instruction,
                ]
            )
        )

    raise ServiceError({'error': 'Failed to generate a one-page full resume after retries.', 'compilerError': retry_history[-1] if retry_history else ''}, 500)
