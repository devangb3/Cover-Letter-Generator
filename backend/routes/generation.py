"""HTTP endpoints for application materials."""
from flask import Blueprint, jsonify, request

from backend.services.generation import generate_application, generate_letter_pdf

api = Blueprint('generation', __name__, url_prefix='/api')


@api.post('/analyze')
def analyze():
    return jsonify(generate_application('cover-letter', request.get_json(silent=True) or {}))


@api.post('/answer-questions')
def answer_questions():
    return jsonify(generate_application('questions', request.get_json(silent=True) or {}))


@api.post('/draft-recruiting-email')
def draft_email():
    return jsonify(generate_application('email', request.get_json(silent=True) or {}))


@api.post('/generate-full-resume')
def full_resume():
    return jsonify(generate_application('resume', request.get_json(silent=True) or {}))


@api.post('/generate-pdf')
def letter_pdf():
    return jsonify(generate_letter_pdf(request.get_json()))
