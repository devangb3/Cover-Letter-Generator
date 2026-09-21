"""Serve generated documents from the user's output directory."""
from flask import Blueprint, send_from_directory
from werkzeug.exceptions import NotFound

from backend.errors import ServiceError
from backend.storage.local import output_dir

api = Blueprint('files', __name__, url_prefix='/api')


def document(filename, attachment):
    try:
        return send_from_directory(output_dir(), filename, as_attachment=attachment, mimetype='application/pdf')
    except NotFound:
        raise ServiceError('File not found', 404)


@api.get('/download/<filename>')
def download(filename):
    return document(filename, attachment=True)


@api.get('/view/<filename>')
def view(filename):
    return document(filename, attachment=False)
