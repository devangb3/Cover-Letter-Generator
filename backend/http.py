"""Shared request guards and HTTP error translation."""
import traceback
from urllib.parse import urlsplit

from flask import current_app, jsonify, request
from werkzeug.exceptions import HTTPException

from backend.errors import ServiceError
from backend.storage.local import get_profile

GENERATION_PATHS = { #surely there is a better way of doing this, cant we use decorators or something?
    '/api/analyze', '/api/answer-questions', '/api/draft-recruiting-email',
    '/api/generate-full-resume', '/api/generate-pdf',
}


def guard_local_api():
    if not request.path.startswith('/api/'):
        return None
    if request.host.split(':')[0] not in ('localhost', '127.0.0.1'):
        return jsonify(error='Use the local application URL.'), 403
    origin = request.headers.get('Origin')
    if origin and urlsplit(origin).netloc != request.host:
        return jsonify(error='Cross-origin requests are not allowed.'), 403
    if request.method == 'POST' and request.path in GENERATION_PATHS and not get_profile():
        return jsonify(error='Save your profile before generating application materials.'), 400


def service_error(error):
    return jsonify(error.payload), error.status


def upload_too_large(error):
    return jsonify(error='Upload a PDF smaller than 10 MB.'), 413


def unexpected_error(error):
    if isinstance(error, HTTPException):
        return error
    current_app.logger.exception('Request failed')
    return jsonify(error=str(error), traceback=traceback.format_exc()), 500


def register_http_handlers(app):
    app.before_request(guard_local_api)
    app.register_error_handler(ServiceError, service_error)
    app.register_error_handler(413, upload_too_large)
    app.register_error_handler(Exception, unexpected_error)
