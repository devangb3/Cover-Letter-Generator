"""Single-user local persistence, independent of the source checkout."""
import json
from contextlib import contextmanager
import os
from pathlib import Path
import sqlite3
import sys

from backend.models.profile import Preferences


def data_dir():
    override = os.environ.get("COVER_LETTER_DATA_DIR")
    if override:
        path = Path(override).expanduser()
    elif sys.platform == "win32":
        path = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "CoverLetterGenerator"
    elif sys.platform == "darwin":
        path = Path.home() / "Library/Application Support/CoverLetterGenerator"
    else:
        path = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local/share")) / "cover-letter-generator"
    path.mkdir(parents=True, exist_ok=True, mode=0o700)
    return path


def output_dir():
    path = data_dir() / "output"
    path.mkdir(exist_ok=True, mode=0o700)
    return path


def read_value(name, default=None):
    with connection() as db:
        row = db.execute("SELECT value FROM state WHERE name = ?", (name,)).fetchone()
    return json.loads(row[0]) if row else default


def write_value(name, value):
    with connection() as db:
        db.execute("INSERT OR REPLACE INTO state(name, value) VALUES (?, ?)", (name, json.dumps(value)))


@contextmanager
def connection():
    path = data_dir() / "profile.sqlite3"
    db = sqlite3.connect(path)
    path.chmod(0o600)
    db.execute("CREATE TABLE IF NOT EXISTS state (name TEXT PRIMARY KEY, value TEXT NOT NULL)")
    try:
        with db:
            yield db
    finally:
        db.close()


def get_profile():
    return read_value("profile")


def get_preferences():
    return read_value("preferences", Preferences().model_dump())


def get_api_key():
    path = data_dir() / "openrouter-key"
    return path.read_text().strip() if path.exists() else os.environ.get("OPENROUTER_API_KEY", "")


def save_api_key(key):
    path = data_dir() / "openrouter-key"
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as stream:
        stream.write(key.strip())
    path.chmod(0o600)


