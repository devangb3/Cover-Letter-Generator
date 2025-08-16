import os
import json
import logging
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from google.genai import types
from google.genai.types import GenerateContentConfig
from pypdf import PdfReader
import httpx

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('api_service.log')
    ]
)
logger = logging.getLogger('api_service')

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not set in environment")
else:
    logger.info("GEMINI_API_KEY found in environment")

def load_resume():
    try:
        pdf_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static', 'resume.pdf')
        logger.info(f"Loading resume from: {pdf_path}")
        
        if not os.path.exists(pdf_path):
            logger.error(f"Resume file not found at: {pdf_path}")
            return "Error: Resume file not found"
            
        reader = PdfReader(pdf_path)
        logger.info(f"Resume PDF loaded successfully with {len(reader.pages)} pages")
        
        resume_text = ""
        for i, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text()
                resume_text += page_text
                logger.debug(f"Extracted text from page {i+1}, length: {len(page_text)}")
            except Exception as e:
                logger.error(f"Error extracting text from page {i+1}: {str(e)}")
                
        logger.info(f"Total resume text length: {len(resume_text)}")
        return resume_text
    except Exception as e:
        logger.error(f"Error loading resume: {str(e)}")
        logger.error(traceback.format_exc())
        return f"Error loading resume: {str(e)}"

@app.route('/process', methods=['POST'])
def process():
    try:
        logger.info("Received processing request")
        data = request.json
        job_description = data.get('jobDescription', '')
        company_name = data.get('companyName', '')
        custom_instructions = data.get('customInstructions', '')
        personal_info = data.get('personalInfo', {})
        
        logger.debug(f"Job description length: {len(job_description)}")
        logger.debug(f"Company name: {company_name}")
        logger.debug(f"Custom instructions length: {len(custom_instructions)}")
        logger.debug(f"Personal info: {personal_info}")
        
        personal_info_text = ""
        if personal_info:
            personal_info_text = "About me:\n"
            for key, value in personal_info.items():
                if value and key != 'address' and key != 'linkedin' and key != 'website':
                    personal_info_text += f"{key.capitalize()}: {value}\n"
        
        resume_text = load_resume()
        if resume_text.startswith("Error"):
            logger.error("Failed to load resume text")
            return jsonify({'error': resume_text}), 500
            
        logger.info("Preparing prompt for Gemini API")
        system_instruction = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'system_instruction.txt')
        with open(system_instruction, 'r') as file:
            system_instruction = file.read()         

        prompt = f"""
        
        Write a professional cover letter for a job application to {company_name}. I need ONLY the main body text of the cover letter.
        DO NOT include any formatting, header, address, date, greeting, or signature - those will be added later.
        
        My Resume is attached as a PDF file in the data. 
        
        {personal_info_text}

        Job Description:
        {job_description}

        Company Name: {company_name}

        {custom_instructions if custom_instructions else ""}
        """
        logger.info("Downloading resume")
        doc_url = "https://devang-borkar.netlify.app/Devang_Resume.pdf"
        doc_data = httpx.get(doc_url).content
        logger.info("Downloaded resume")

        logger.info("Calling Gemini API")
        client = genai.Client(api_key=GEMINI_API_KEY)
        logger.debug("Gemini model initialized")
        try:
            logger.debug("Sending request to Gemini API")
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=[types.Part.from_bytes(
                    data=doc_data,
                    mime_type="application/pdf"
                ),
                prompt
                ],
                config=GenerateContentConfig(
                    system_instruction=system_instruction,
                )
            )
            logger.info("Received response from Gemini API")
            
            cover_letter_text = response.text.strip()
            logger.debug(f"Cover letter text length: {len(cover_letter_text)}")
            
            result = {
                'coverLetter': cover_letter_text,
                'personalInfo': personal_info,
                'companyName': company_name
            }
                
            return jsonify(result), 200
            
        except Exception as e:
            logger.error(f"Error generating cover letter: {str(e)}")
            logger.error(traceback.format_exc())
            
            return jsonify({
                "error": f"Failed to generate cover letter: {str(e)}"
            }), 500
            
    except Exception as e:
        logger.error(f"Error in process endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

if __name__ == '__main__':
    logger.info("Starting API service on port 5001")
    app.run(debug=True, port=5001)