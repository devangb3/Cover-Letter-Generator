import os
import json
import logging
import traceback
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.pdfgen import canvas
import uuid
from datetime import datetime

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('pdf_service')

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output')
os.makedirs(OUTPUT_DIR, exist_ok=True)
logger.info(f"Output directory set to: {OUTPUT_DIR}")

def sanitize_filename(filename):
    """
    Sanitize a string to be safe for use as a filename.
    Removes or replaces characters that are not allowed in filenames.
    """
    # Remove or replace invalid characters (including periods and parentheses)
    filename = re.sub(r'[<>:"/\\|?*().]', '_', filename)
    # Remove extra spaces and replace with underscores
    filename = re.sub(r'\s+', '_', filename.strip())
    # Remove multiple consecutive underscores
    filename = re.sub(r'_+', '_', filename)
    # Remove leading/trailing underscores
    filename = filename.strip('_')
    # Limit length to avoid filesystem issues (accounting for "cover_letter_" prefix)
    if len(filename) > 37:  # 50 - 13 (length of "cover_letter_") = 37
        filename = filename[:37]
    return filename

def generate_cover_letter_pdf(data):
    """
    Service function to generate a cover letter PDF directly.
    This can be imported and used by other modules without Flask.
    """
    try:
        logger.info("Generating cover letter PDF via service")
        
        # Try to use company name in filename, fallback to random ID
        company_name = data.get('companyName', '').strip()
        if company_name:
            try:
                sanitized_company = sanitize_filename(company_name)
                if sanitized_company:  # Make sure sanitization didn't result in empty string
                    filename = f"cover_letter_{sanitized_company}.pdf"
                    logger.info(f"Using company name in filename: {filename}")
                else:
                    raise ValueError("Sanitized company name is empty")
            except Exception as e:
                logger.warning(f"Failed to use company name in filename: {e}. Falling back to random ID.")
                filename = f"cover_letter_{uuid.uuid4().hex}.pdf"
        else:
            logger.info("No company name provided, using random ID in filename")
            filename = f"cover_letter_{uuid.uuid4().hex}.pdf"
        
        file_path = os.path.join(OUTPUT_DIR, filename)
        logger.debug(f"Cover letter PDF will be saved as: {file_path}")
        
        doc = SimpleDocTemplate(file_path, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        personal_info = data.get('personalInfo', {})
        company_name = data.get('companyName', 'Company Name')
        logger.debug(f"Adding personal information to cover letter: {personal_info}")
        logger.debug(f"Company name: {company_name}")
        
        if personal_info:
            name = personal_info.get('name', '')
            if name:
                elements.append(Paragraph(name, ParagraphStyle(
                    name='SenderName',
                    parent=styles['Normal'],
                    fontName='Helvetica-Bold',
                    fontSize=12,
                    alignment=0
                )))
                
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
            
            today = datetime.now().strftime("%B %d, %Y")
            elements.append(Spacer(1, 20))
            elements.append(Paragraph(today, styles['Normal']))
            elements.append(Spacer(1, 20))
            
            elements.append(Paragraph("Hiring Manager", styles['Normal']))
            elements.append(Paragraph(company_name, styles['Normal']))
            elements.append(Spacer(1, 20))
            
            elements.append(Paragraph(f"Dear Hiring Manager at {company_name},", styles['Normal']))
            elements.append(Spacer(1, 10))
        
        cover_letter = data.get('coverLetter', '')
        logger.debug(f"Cover letter length: {len(cover_letter)}")
        
        if not cover_letter:
            logger.warning("Cover letter content is empty")
            elements.append(Paragraph("No cover letter content provided.", styles['Normal']))
        else:
            paragraphs = cover_letter.split('\n\n')
            if len(paragraphs) == 1:
                paragraphs = cover_letter.split('\n')
                
            logger.debug(f"Number of paragraphs: {len(paragraphs)}")
            
            for paragraph in paragraphs:
                if paragraph.strip():
                    elements.append(Paragraph(paragraph.strip(), styles['Normal']))
                    elements.append(Spacer(1, 10))
        
        elements.append(Spacer(1, 15))
        elements.append(Paragraph("Sincerely,", styles['Normal']))
        elements.append(Spacer(1, 30)) 
        
        if personal_info and personal_info.get('name'):
            elements.append(Paragraph(personal_info.get('name'), styles['Normal']))
        
        logger.info("Building PDF document")
        doc.build(elements)
        logger.info(f"Cover letter PDF generated successfully: {filename}")
        return filename
    except Exception as e:
        logger.error(f"Error generating cover letter PDF: {str(e)}")
        logger.error(traceback.format_exc())
        raise

