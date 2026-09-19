"""HTTP endpoints for settings and the allowed model catalog."""
from flask import Blueprint, jsonify, request

from backend.api_service.model_config import get_models
from backend.services.settings import resolve_model
from backend.services.settings import read_settings, update_settings

api = Blueprint('settings', __name__, url_prefix='/api')


@api.get('/models')
def models():
    return jsonify(models=get_models(), defaultModel=resolve_model())


@api.get('/settings')
def get_settings():
    return jsonify(read_settings())


@api.put('/settings')
def put_settings():
    return jsonify(update_settings(request.get_json(silent=True)))
