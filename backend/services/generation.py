"""Application-generation use cases using the saved candidate."""
from backend.api_service import ai_service
from backend.errors import InvalidStructuredOutputError, ServiceError
from backend.api_service.model_config import is_allowed_model
from backend.services.profile import personal_info
from backend.services.resume import generate_resume
from backend.services.settings import resolve_model
from pdf_service.pdf_generator import generate_cover_letter_pdf


def generate_application(kind, data):
    model = resolve_model(data.get('model'))
    questions = data.get('questions', '')
    if kind == 'questions' and not str(questions).strip():
        raise ServiceError('Please provide at least one application question')
    if not is_allowed_model(model):
        raise ServiceError(f"Invalid model '{model}'. Please select a model from /api/models.")
    args = (
        data.get('jobDescription', ''), data.get('companyName', ''),
        data.get('customInstructions', ''), personal_info(),
    )
    if kind == 'questions':
        try:
            result = ai_service.generate_job_question_answers(*args, questions, model)
        except InvalidStructuredOutputError as exc:
            raise ServiceError('The model returned an invalid response. Please try again.', 502) from exc
    elif kind == 'cover-letter':
        result = ai_service.generate_cover_letter(*args, model)
    elif kind == 'email':
        result = ai_service.generate_recruiting_email(*args, model)
    elif kind == 'resume':
        result = generate_resume(*args, model)
    else:
        raise ValueError(f'Unknown generation workflow: {kind}')
    if 'error' in result:
        status = 400 if kind == 'questions' and 'Please provide at least one application question' in result['error'] else 500
        raise ServiceError(result, status)
    return result


def generate_letter_pdf(data):
    filename = generate_cover_letter_pdf({**data, 'personalInfo': personal_info()})
    return {'coverLetterFile': filename}
