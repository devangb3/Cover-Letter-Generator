import os
import json
import logging
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.pdfgen import canvas
import uuid
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('pdf_service.log')
    ]
)
logger = logging.getLogger('pdf_service')

app = Flask(__name__)
CORS(app)

# Ensure output directory exists
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')
os.makedirs(OUTPUT_DIR, exist_ok=True)
logger.info(f"Output directory set to: {OUTPUT_DIR}")

def generate_cover_letter_pdf(data):
    try:
        logger.info("Generating cover letter PDF")
        # Generate a unique filename
        filename = f"cover_letter_{uuid.uuid4().hex}.pdf"
        file_path = os.path.join(OUTPUT_DIR, filename)
        logger.debug(f"Cover letter PDF will be saved as: {file_path}")
        
        # Create PDF document
        doc = SimpleDocTemplate(file_path, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        # Get personal information and company name
        personal_info = data.get('personalInfo', {})
        company_name = data.get('companyName', 'Company Name')
        logger.debug(f"Adding personal information to cover letter: {personal_info}")
        logger.debug(f"Company name: {company_name}")
        
        # Format elements based on a standard business letter format
        if personal_info:
            # Sender's information
            name = personal_info.get('name', '')
            if name:
                elements.append(Paragraph(name, ParagraphStyle(
                    name='SenderName',
                    parent=styles['Normal'],
                    fontName='Helvetica-Bold',
                    fontSize=12,
                    alignment=0  # Left alignment
                )))
                
            # Contact details
            if personal_info.get('email'):
                elements.append(Paragraph(personal_info.get('email', ''), styles['Normal']))
            if personal_info.get('phone'):
                elements.append(Paragraph(personal_info.get('phone', ''), styles['Normal']))
            if personal_info.get('address'):
                elements.append(Paragraph(personal_info.get('address', ''), styles['Normal']))
            if personal_info.get('linkedin'):
                elements.append(Paragraph(f"LinkedIn: {personal_info.get('linkedin', '')}", styles['Normal']))
            if personal_info.get('website'):
                elements.append(Paragraph(f"Website: {personal_info.get('website', '')}", styles['Normal']))
            
            # Date
            today = datetime.now().strftime("%B %d, %Y")
            elements.append(Spacer(1, 20))
            elements.append(Paragraph(today, styles['Normal']))
            elements.append(Spacer(1, 20))
            
            # Recipient information using company name
            elements.append(Paragraph("Hiring Manager", styles['Normal']))
            elements.append(Paragraph(company_name, styles['Normal']))
            elements.append(Spacer(1, 20))
            
            # Greeting
            elements.append(Paragraph(f"Dear Hiring Manager at {company_name},", styles['Normal']))
            elements.append(Spacer(1, 10))
        
        # Cover letter content - from AI
        cover_letter = data.get('coverLetter', '')
        logger.debug(f"Cover letter length: {len(cover_letter)}")
        
        if not cover_letter:
            logger.warning("Cover letter content is empty")
            elements.append(Paragraph("No cover letter content provided.", styles['Normal']))
        else:
            paragraphs = cover_letter.split('\n\n')
            if len(paragraphs) == 1:
                # Try splitting by single newline if only one paragraph detected
                paragraphs = cover_letter.split('\n')
                
            logger.debug(f"Number of paragraphs: {len(paragraphs)}")
            
            for paragraph in paragraphs:
                if paragraph.strip():
                    elements.append(Paragraph(paragraph.strip(), styles['Normal']))
                    elements.append(Spacer(1, 10))
        
        # Add closing
        elements.append(Spacer(1, 15))
        elements.append(Paragraph("Sincerely,", styles['Normal']))
        elements.append(Spacer(1, 30))  # Space for signature
        
        # Add name as signature
        if personal_info and personal_info.get('name'):
            elements.append(Paragraph(personal_info.get('name'), styles['Normal']))
        
        logger.info("Building PDF document")
        # Build PDF
        doc.build(elements)
        logger.info(f"Cover letter PDF generated successfully: {filename}")
        return filename
    except Exception as e:
        logger.error(f"Error generating cover letter PDF: {str(e)}")
        logger.error(traceback.format_exc())
        raise

@app.route('/generate', methods=['POST'])
def generate():
    try:
        logger.info("Received PDF generation request")
        data = request.json
        logger.debug(f"Received data with keys: {list(data.keys()) if data else 'No data'}")
        
        if not data:
            logger.error("No data received in request")
            return jsonify({'error': 'No data provided'}), 400
            
        # Validate required fields
        required_fields = ['coverLetter']
        missing_fields = [field for field in required_fields if field not in data]
        
        if missing_fields:
            logger.error(f"Missing required fields: {missing_fields}")
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400
        
        # Generate cover letter PDF
        logger.info("Generating cover letter PDF")
        cover_letter_filename = generate_cover_letter_pdf(data)
        
        # Verify file was created
        cover_letter_path = os.path.join(OUTPUT_DIR, cover_letter_filename)
        logger.debug(f"Checking if file exists - Cover Letter: {os.path.exists(cover_letter_path)}")
        
        response = {
            'coverLetterFile': cover_letter_filename
        }
        logger.info(f"Successfully generated PDF: {response}")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error in PDF generation: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

if __name__ == '__main__':
    logger.info("Starting PDF service on port 5002")
    app.run(debug=True, port=5002)