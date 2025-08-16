import os
import logging
import traceback
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

def generate_cover_letter(job_description, company_name, custom_instructions, personal_info):
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
            
        logger.info("Preparing prompt for Gemini API")
        system_instruction_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'system_instruction.txt')
        with open(system_instruction_path, 'r') as file:
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