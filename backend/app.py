import os
import sys
import logging
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import traceback

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from api_service.ai_service import generate_cover_letter
from pdf_service.pdf_generator import generate_cover_letter_pdf

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('backend.log')
    ]
)
logger = logging.getLogger('backend')

app = Flask(__name__, static_folder='../frontend/build')
CORS(app)

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not set in environment")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    try:
        logger.info("Received analyze request")
        data = request.json
        job_description = data.get('jobDescription', '')
        company_name = data.get('companyName', '')
        custom_instructions = data.get('customInstructions', '')
        personal_info = data.get('personalInfo', {})
        model = data.get('model', 'gemini-2.5-flash')
        
        logger.debug(f"Job description length: {len(job_description)}")
        logger.debug(f"Company name: {company_name}")
        logger.debug(f"Custom instructions length: {len(custom_instructions)}")
        logger.debug(f"Personal info: {personal_info}")
        logger.debug(f"Selected model: {model}")
        
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

if __name__ == '__main__':
    logger.info("Starting backend server on port 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)