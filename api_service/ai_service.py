import os
import logging
import traceback
import json
import re
import io
import time
from google import genai
from google.genai import types
from google.genai.types import GenerateContentConfig
from pypdf import PdfReader
import httpx

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('api_service')

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not set in environment")
else:
    logger.info("GEMINI_API_KEY found in environment")

def load_projects():
    """Service function to load projects from constants.js and format them for the prompt"""
    try:
        constants_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static', 'constants.js')
        logger.info(f"Loading projects from: {constants_path}")
        
        if not os.path.exists(constants_path):
            logger.error(f"Constants file not found at: {constants_path}")
            return ""
            
        with open(constants_path, 'r', encoding='utf-8') as file:
            content = file.read()
            
        start_match = re.search(r'export\s+const\s+projects\s*=\s*\[', content, re.DOTALL)
        if not start_match:
            logger.warning("Could not find projects array in constants.js")
            return ""
        
        start_pos = start_match.end() - 1  # Position of the opening [
        bracket_count = 0
        i = start_pos
        
        while i < len(content):
            if content[i] == '[':
                bracket_count += 1
            elif content[i] == ']':
                bracket_count -= 1
                if bracket_count == 0:
                    # Found the matching closing bracket
                    array_content = content[start_pos + 1:i].strip()
                    break
            i += 1
        else:
            logger.warning("Could not find matching closing bracket for projects array")
            return ""
        
        projects_text = "Projects I have worked on:\n\n" + array_content
        
        logger.info(f"Loaded projects, content length: {len(projects_text)}")
        return projects_text
            
    except Exception as e:
        logger.error(f"Error loading projects: {str(e)}")
        logger.error(traceback.format_exc())
        return ""

def load_resume():
    """Service function to load resume text from PDF"""
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

def generate_cover_letter(job_description, company_name, custom_instructions, personal_info, model='gemini-2.5-flash'):
    """
    Service function to generate a cover letter using Gemini API.
    This can be imported and used by other modules without Flask.
    """
    try:
        logger.info("Received processing request via service")
        
        logger.debug(f"Job description length: {len(job_description)}")
        logger.debug(f"Company name: {company_name}")
        logger.debug(f"Custom instructions length: {len(custom_instructions)}")
        logger.debug(f"Personal info: {personal_info}")
        logger.debug(f"Selected model: {model}")
        
        personal_info_text = ""
        if personal_info:
            personal_info_text = "About me:\n"
            for key, value in personal_info.items():
                if value and key != 'address' and key != 'linkedin' and key != 'website':
                    personal_info_text += f"{key.capitalize()}: {value}\n"
        
        resume_text = load_resume()
        if resume_text.startswith("Error"):
            logger.error("Failed to load resume text")
            return {'error': resume_text}
        
        projects_text = load_projects()
        if projects_text:
            logger.info("Projects loaded successfully")
        else:
            logger.warning("No projects loaded")
            
        logger.info("Preparing prompt for Gemini API")
        system_instruction_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'system_instruction.txt')
        with open(system_instruction_path, 'r') as file:
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
        
        logger.info("Initializing Gemini client")
        client = genai.Client(api_key=GEMINI_API_KEY)
        logger.debug("Gemini model initialized")
        
        try:
            logger.info("Downloading resume PDF from URL")
            doc_url = "https://devang-borkar.netlify.app/Devang_Resume.pdf"
            doc_data = httpx.get(doc_url).content
            logger.info(f"Downloaded resume, size: {len(doc_data)} bytes")
            
            # Use File API for better PDF processing (handles images, diagrams, charts, tables)
            # Create BytesIO object for upload
            doc_io = io.BytesIO(doc_data)
            
            logger.info("Uploading resume PDF using File API")
            uploaded_file = client.files.upload(
                file=doc_io,
                config=dict(
                    mime_type='application/pdf',
                    display_name='Devang_Resume.pdf'
                )
            )
            logger.info(f"File uploaded, name: {uploaded_file.name}")
            
            # Wait for file to be processed
            logger.info("Waiting for file processing...")
            get_file = client.files.get(name=uploaded_file.name)
            while get_file.state == 'PROCESSING':
                logger.debug(f"File state: {get_file.state}, waiting...")
                time.sleep(2)  # Wait 2 seconds before checking again
                get_file = client.files.get(name=uploaded_file.name)
            
            if get_file.state == 'FAILED':
                logger.error("File processing failed")
                return {
                    "error": "Resume PDF processing failed. Please try again."
                }
            
            logger.info(f"File processing complete, state: {get_file.state}")
            
            logger.debug("Sending request to Gemini API with uploaded file")
            response = client.models.generate_content(
                model=model,
                contents=[uploaded_file, prompt],
                config=GenerateContentConfig(
                    system_instruction=system_instruction,
                )
            )
            logger.info("Received response from Gemini API")
            
            if response.text:
                cover_letter_text = response.text.strip()
                logger.debug(f"Cover letter text length: {len(cover_letter_text)}")
            else:
                logger.error("No response text received from Gemini API")
                return {
                    "error": "No response text received from Gemini API"
                }
            
            result = {
                'coverLetter': cover_letter_text,
                'personalInfo': personal_info,
                'companyName': company_name
            }
                
            return result
            
        except Exception as e:
            logger.error(f"Error generating cover letter: {str(e)}")
            logger.error(traceback.format_exc())
            
            return {
                "error": f"Failed to generate cover letter: {str(e)}"
            }
            
    except Exception as e:
        logger.error(f"Error in generate_cover_letter: {str(e)}")
        logger.error(traceback.format_exc())
        return {'error': str(e), 'traceback': traceback.format_exc()}