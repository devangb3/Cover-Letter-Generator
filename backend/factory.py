"""Application construction and dependency wiring."""
import logging
from pathlib import Path

from flask import Flask
from flask.logging import default_handler

from backend.api_service.model_config import load_model_config
from backend.http import register_http_handlers
from backend.routes import files, frontend, generation, profile, settings
from backend.storage.local import PROJECT_ROOT


def configure_logging():
    log_dir = PROJECT_ROOT / 'logs'
    log_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    root = logging.getLogger()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    if not any(handler.name == 'cover-letter-file' for handler in root.handlers):
        handler = logging.FileHandler(log_dir / 'backend.log')
        handler.set_name('cover-letter-file')
        handler.setFormatter(formatter)
        root.addHandler(handler)
    if not any(isinstance(handler, logging.StreamHandler) and
               not isinstance(handler, logging.FileHandler) for handler in root.handlers):
        handler = logging.StreamHandler()
        handler.set_name('cover-letter-console')
        handler.setFormatter(formatter)
        root.addHandler(handler)
    root.setLevel(logging.INFO)


def create_app(config=None):
    app = Flask(__name__, static_folder=str(Path(__file__).resolve().parent.parent / 'frontend/build'))
    app.config.from_mapping(MAX_CONTENT_LENGTH=10 * 1024 * 1024)
    if config:
        app.config.update(config)
    load_model_config()
    if not app.testing:
        configure_logging()
        app.logger.removeHandler(default_handler)
        app.logger.setLevel(logging.INFO)
    register_http_handlers(app)
    for blueprint in (generation.api, profile.api, settings.api, files.api, frontend.pages):
        app.register_blueprint(blueprint)
    return app
