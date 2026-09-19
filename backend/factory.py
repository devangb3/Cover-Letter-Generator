"""Application construction and dependency wiring."""
import logging
from pathlib import Path

from flask import Flask

from backend.api_service.model_config import load_model_config
from backend.http import register_http_handlers
from backend.routes import files, frontend, generation, profile, settings
from backend.storage.local import data_dir


def create_app(config=None):
    app = Flask(__name__, static_folder=str(Path(__file__).resolve().parent.parent / 'frontend/build'))
    app.config.from_mapping(MAX_CONTENT_LENGTH=10 * 1024 * 1024)
    if config:
        app.config.update(config)
    load_model_config()
    if not app.testing:
        handler = logging.FileHandler(data_dir() / 'backend.log')
        handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.INFO)
    register_http_handlers(app)
    for blueprint in (generation.api, profile.api, settings.api, files.api, frontend.pages):
        app.register_blueprint(blueprint)
    return app
