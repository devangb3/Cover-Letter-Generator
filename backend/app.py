import os
import sys
import logging
import json
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import traceback

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from backend.api_service.ai_service import (
    build_full_resume_project_catalog,
    generate_cover_letter,
    generate_full_resume_draft,
    generate_job_question_answers,
    generate_recruiting_email,
)
from backend.api_service.model_config import get_default_model, get_models, is_allowed_model, load_model_config
from pdf_service.pdf_generator import generate_cover_letter_pdf
from pdf_service.resume_generator import (
    compile_tex_to_pdf,
    load_resume_yaml,
    render_full_resume_tex,
)

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('backend.log')
    ]
)
logger = logging.getLogger('backend')


def json_dumps_for_prompt(payload, limit=6000):
    rendered = json.dumps(payload, indent=2)
    if len(rendered) > limit:
        return rendered[:limit] + "\n...[truncated]"
    return rendered

app = Flask(__name__, static_folder='../frontend/build')
CORS(app)

load_model_config()

OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY')
if not OPENROUTER_API_KEY:
    logger.warning("OPENROUTER_API_KEY not set in environment")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/models', methods=['GET'])
def get_model_catalog():
    try:
        return jsonify({
            'models': get_models(),
            'defaultModel': get_default_model()
        }), 200
    except Exception as e:
        logger.error(f"Error loading model catalog: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    try:
        logger.info("Received analyze request")
        data = request.get_json(silent=True) or {}
        job_description = data.get('jobDescription', '')
        company_name = data.get('companyName', '')
        custom_instructions = data.get('customInstructions', '')
        personal_info = data.get('personalInfo', {})
        model = data.get('model') or get_default_model()
        
        logger.debug(f"Job description length: {len(job_description)}")
        logger.debug(f"Company name: {company_name}")
        logger.debug(f"Custom instructions length: {len(custom_instructions)}")
        logger.debug(f"Personal info: {personal_info}")
        logger.debug(f"Selected model: {model}")

        if not is_allowed_model(model):
            return jsonify({
                'error': f"Invalid model '{model}'. Please select a model from /api/models."
            }), 400
        
        logger.info("Processing request with AI service directly")
        result = generate_cover_letter(job_description, company_name, custom_instructions, personal_info, model)
        
        if 'error' in result:
            logger.error(f"AI service error: {result['error']}")
            return jsonify(result), 500
        else:
            logger.info("Successfully generated cover letter")
            logger.debug(f"AI response keys: {list(result.keys())}")
            return jsonify(result), 200
    
    except Exception as e:
        logger.error(f"Error in analyze_resume: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


@app.route('/api/answer-questions', methods=['POST'])
def answer_questions():
    try:
        logger.info("Received question answering request")
        data = request.get_json(silent=True) or {}
        job_description = data.get('jobDescription', '')
        company_name = data.get('companyName', '')
        custom_instructions = data.get('customInstructions', '')
        personal_info = data.get('personalInfo', {})
        questions = data.get('questions', '')
        model = data.get('model') or get_default_model()

        logger.debug(f"Questions length: {len(str(questions))}")
        logger.debug(f"Company name: {company_name}")
        logger.debug(f"Selected model: {model}")

        if not str(questions).strip():
            return jsonify({'error': 'Please provide at least one application question'}), 400

        if not is_allowed_model(model):
            return jsonify({
                'error': f"Invalid model '{model}'. Please select a model from /api/models."
            }), 400

        result = generate_job_question_answers(
            job_description,
            company_name,
            custom_instructions,
            personal_info,
            questions,
            model,
        )

        if 'error' in result:
            logger.error(f"Question answering service error: {result['error']}")
            status_code = 400 if 'Please provide at least one application question' in result['error'] else 500
            return jsonify(result), status_code

        logger.info("Successfully generated question answers")
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error in answer_questions: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500



@app.route('/api/draft-recruiting-email', methods=['POST'])
def draft_recruiting_email():
    try:
        data = request.get_json(silent=True) or {}
        job_description = data.get('jobDescription', '')
        company_name = data.get('companyName', '')
        custom_instructions = data.get('customInstructions', '')
        personal_info = data.get('personalInfo', {})
        model = data.get('model') or get_default_model()

        if not is_allowed_model(model):
            return jsonify({'error': f"Invalid model '{model}'. Please select a model from /api/models."}), 400

        result = generate_recruiting_email(
            job_description,
            company_name,
            custom_instructions,
            personal_info,
            model,
        )
        if 'error' in result:
            return jsonify(result), 500
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error in draft_recruiting_email: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


@app.route('/api/generate-full-resume', methods=['POST'])
def generate_full_resume():
    try:
        data = request.get_json(silent=True) or {}
        job_description = data.get('jobDescription', '')
        company_name = data.get('companyName', '')
        custom_instructions = data.get('customInstructions', '')
        personal_info = data.get('personalInfo', {})
        model = data.get('model') or get_default_model()

        if not is_allowed_model(model):
            return jsonify({'error': f"Invalid model '{model}'. Please select a model from /api/models."}), 400

        resume_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'resume.yaml')
        resume_data = load_resume_yaml(resume_path)
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
                return jsonify(draft_payload), 500

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
                            "Fix the JSON structure while keeping PilotCrew AI, LearnHaus AI, Hexaview Technologies, and education.",
                        ]
                    )
                )
                continue

            compile_result = compile_tex_to_pdf(
                tex_content,
                company_name=company_name,
                require_single_page=True,
                min_text_chars=3600,
            )
            if compile_result.get('ok'):
                return jsonify({'resumeFile': compile_result.get('resumeFile')}), 200

            compiler_error = compile_result.get('compilerError', '')
            logger.error("Full resume PDF failed on attempt %s: %s", attempt, compiler_error[-1500:])
            if attempt == 3 and compile_result.get('pageCount', 1) > 1:
                fallback_result = compile_tex_to_pdf(
                    tex_content,
                    company_name=company_name,
                    require_single_page=False,
                    min_text_chars=0,
                )
                if fallback_result.get('ok'):
                    logger.warning(
                        "Returning best-effort first-page resume after final full-resume attempt: %s",
                        compiler_error[-1500:],
                    )
                    return jsonify({
                        'resumeFile': fallback_result.get('resumeFile'),
                        'warning': (
                            "Generated a first-page fallback after 3 attempts. "
                            f"Latest PDF result: {compiler_error}"
                        ),
                    }), 200
            if attempt == 3 and compile_result.get('textChars'):
                fallback_result = compile_tex_to_pdf(
                    tex_content,
                    company_name=company_name,
                    require_single_page=True,
                    min_text_chars=0,
                )
                if fallback_result.get('ok'):
                    logger.warning(
                        "Returning sparse one-page resume after final full-resume attempt: %s",
                        compiler_error[-1500:],
                    )
                    return jsonify({'resumeFile': fallback_result.get('resumeFile')}), 200

            if compile_result.get('pageCount', 1) > 1:
                if attempt == 1:
                    retry_instruction = (
                        "The previous draft was too long. Keep the same strong structure, but make each bullet "
                        "shorter and denser: keep 5 skill groups, keep PilotCrew AI, LearnHaus AI, Hexaview "
                        "Technologies, and education, keep 3 projects if possible, and target 1-line bullets. "
                        "Do not drop to a sparse resume."
                    )
                elif attempt == 2:
                    retry_instruction = (
                        "The previous draft is still too long. Compress moderately: use 4-5 skill groups, keep "
                        "2 bullets for PilotCrew AI, keep 2 bullets for LearnHaus AI if possible, keep 2 bullets "
                        "for Hexaview Technologies if possible, and choose 2-3 projects with compact 1-line bullets. "
                        "Avoid reducing LearnHaus and Hexaview to 1 bullet unless absolutely necessary."
                    )
                else:
                    retry_instruction = (
                        "The previous draft was too long. Make the smallest needed cuts while preserving substance: "
                        "keep PilotCrew AI, LearnHaus AI, Hexaview Technologies, education, and at least 2 projects. "
                        "Use compact 1-line bullets, but do not create a visibly sparse resume."
                    )
            elif compile_result.get('textChars'):
                retry_instruction = (
                    "The previous draft fit on one page but was too sparse. Expand it with stronger supported "
                    "content while staying on one page: prefer 5 skill groups, 2 bullets for each experience entry, "
                    "and 3 projects when possible. Keep bullets compact and evidence-backed."
                )
            else:
                retry_instruction = (
                    "Revise the same resume based on the PDF result. Keep PilotCrew AI, LearnHaus AI, "
                    "Hexaview Technologies, and education."
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

        return jsonify({'error': 'Failed to generate a one-page full resume after retries.', 'compilerError': retry_history[-1] if retry_history else ''}), 500
    except Exception as e:
        logger.error(f"Error in generate_full_resume: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500


@app.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    try:
        logger.info("Received PDF generation request")
        data = request.json
        logger.debug(f"PDF generation data keys: {list(data.keys())}")
        
        logger.info("Generating PDF directly using service")
        cover_letter_filename = generate_cover_letter_pdf(data)
        
        response = {
            'coverLetterFile': cover_letter_filename
        }
        logger.info(f"Successfully generated PDF: {response}")
        return jsonify(response), 200
    
    except Exception as e:
        logger.error(f"Error in generate_pdf: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/download/<filename>')
def download_file(filename):
    try:
        logger.info(f"Download request for file: {filename}")
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'pdf_service', 'output', filename)
        logger.debug(f"Attempting to send file from: {file_path}")

        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return jsonify({'error': 'File not found'}), 404

        return send_file(file_path, as_attachment=True)
    except Exception as e:
        logger.error(f"Error in download_file: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 404


@app.route('/api/view/<filename>')
def view_file(filename):
    """Serve a file inline (no download prompt) for embedding in iframes."""
    try:
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'pdf_service', 'output', filename)

        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404

        return send_file(file_path, as_attachment=False, mimetype='application/pdf')
    except Exception as e:
        logger.error(f"Error in view_file: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 404

if __name__ == '__main__':
    logger.info("Starting backend server on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
