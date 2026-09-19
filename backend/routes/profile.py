"""HTTP endpoints for saved profiles and unsaved import drafts."""
from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from backend.models.profile import normalize_candidate
from backend.services.errors import ServiceError
from backend.services.extraction import extract_profile
from backend.storage import local as store

api = Blueprint('profile', __name__, url_prefix='/api/profile')


@api.get('')
def get_profile():
    return jsonify(profile=store.get_profile())


@api.put('')
def save_profile():
    try:
        candidate = normalize_candidate(request.get_json())
    except (ValidationError, ValueError, TypeError):
        raise ServiceError('Invalid profile. Enter a name and check the section fields.')
    store.write_value('profile', candidate)
    return jsonify(profile=candidate)


@api.post('/validate')
def validate_backup():
    try:
        candidate = normalize_candidate(request.get_json())
    except (ValidationError, ValueError, TypeError):
        raise ServiceError('Invalid profile backup. The saved profile has not changed.')
    return jsonify(profile=candidate)


@api.post('/extract')
def extract():
    upload = request.files.get('resume')
    if not upload:
        raise ServiceError('Upload a PDF resume.')
    candidate = extract_profile(upload.read(), upload.filename, request.form.get('model'))
    return jsonify(profile=candidate)
