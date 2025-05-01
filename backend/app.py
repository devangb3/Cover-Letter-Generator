import os
import logging
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import json
import requests
import traceback

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('backend.log')
    ]
)
logger = logging.getLogger('backend')

app = Flask(__name__, static_folder='../static')
CORS(app)

# Configure API keys from environment
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY') 
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not set in environment")
API_SERVICE_URL = os.environ.get('API_SERVICE_URL', 'http://localhost:5001')
if not API_SERVICE_URL:
    logger.warning("API_SERVICE_URL not set in environment")
PDF_SERVICE_URL = os.environ.get('PDF_SERVICE_URL', 'http://localhost:5002')
if not PDF_SERVICE_URL:
    logger.warning("PDF_SERVICE_URL not set in environment")

@app.route('/')
def index():
    logger.info("Serving index page")
    return app.send_static_file('index.html')

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    try:
        logger.info("Received analyze request")
        data = request.json
        job_description = data.get('jobDescription', '')
        company_name = data.get('companyName', '')
        custom_instructions = data.get('customInstructions', '')
        personal_info = data.get('personalInfo', {})
        
        logger.debug(f"Job description length: {len(job_description)}")
        logger.debug(f"Company name: {company_name}")
        logger.debug(f"Custom instructions length: {len(custom_instructions)}")
        logger.debug(f"Personal info: {personal_info}")
        
        # Forward the request to the API service
        logger.info("Forwarding request to API service")
        api_response = requests.post(
            API_SERVICE_URL + '/process',
            json={
                'jobDescription': job_description,
                'companyName': company_name,
                'customInstructions': custom_instructions,
                'personalInfo': personal_info
            }
        )
        
        # Forward the response from the API service
        if api_response.status_code == 200:
            logger.info("Successfully received API response")
            response_data = api_response.json()
            logger.debug(f"API response keys: {list(response_data.keys())}")
            return jsonify(response_data), 200
        else:
            logger.error(f"API service error: {api_response.status_code} - {api_response.text}")
            return jsonify({'error': 'Failed to process with AI service', 'details': api_response.text}), 500
    
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
        
        # Forward the request to the PDF service
        logger.info("Forwarding request to PDF service")
        pdf_response = requests.post(
            PDF_SERVICE_URL + '/generate',
            json=data
        )
        
        if pdf_response.status_code == 200:
            logger.info("Successfully received PDF generation response")
            response_data = pdf_response.json()
            logger.debug(f"PDF response: {response_data}")
            return jsonify(response_data), 200
        else:
            logger.error(f"PDF service error: {pdf_response.status_code} - {pdf_response.text}")
            return jsonify({'error': 'Failed to generate PDF', 'details': pdf_response.text}), 500
    
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