"""Serve the built frontend and its client-side routes."""
from pathlib import Path
from flask import Blueprint, current_app, send_from_directory

pages = Blueprint('frontend', __name__)


@pages.route('/', defaults={'path': ''})
@pages.route('/<path:path>')
def serve(path):
    directory = current_app.static_folder
    if path and (Path(directory) / path).is_file():
        return send_from_directory(directory, path)
    return send_from_directory(directory, 'index.html')
