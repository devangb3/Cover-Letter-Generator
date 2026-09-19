"""Validate and persist connection and generation preferences."""
from pydantic import ValidationError

from backend.api_service.model_config import get_default_model, is_allowed_model
from backend.models.profile import Preferences
from backend.services.errors import ServiceError
from backend.storage import local as store


def read_settings():
    return {'preferences': store.get_preferences(), 'hasApiKey': bool(store.get_api_key())}


def update_settings(payload):
    if not isinstance(payload, dict):
        raise ServiceError('Settings must be an object.')
    try:
        preferences = Preferences.model_validate(payload.get('preferences', store.get_preferences())).model_dump()
        if preferences['defaultModel'] and not is_allowed_model(preferences['defaultModel']):
            raise ValueError('Unknown model')
        key = payload.get('apiKey')
        if key is not None and (not isinstance(key, str) or not key.strip() or any(c.isspace() for c in key.strip())):
            raise ValueError('Invalid API key')
    except (ValidationError, ValueError, TypeError):
        raise ServiceError('Check the API key and selected model.')
    if key is not None:
        store.save_api_key(key)
    store.write_value('preferences', preferences)
    return read_settings()


def resolve_model(model=None):
    if model:
        return model
    saved_model = store.get_preferences().get("defaultModel")
    return saved_model if is_allowed_model(saved_model) else get_default_model()
