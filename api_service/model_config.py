import os
from typing import Any, Dict, List, Optional
import yaml



ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_CONFIG_PATH = os.path.join(ROOT_DIR, "config", "model.yaml")

_CONFIG: Optional[Dict[str, Any]] = None


def _parse_scalar(value: str) -> str:
    parsed = value.strip()
    if len(parsed) >= 2 and parsed[0] == parsed[-1] and parsed[0] in {"'", '"'}:
        return parsed[1:-1]
    return parsed


def _fallback_parse_model_yaml(raw_text: str) -> Dict[str, Any]:
    """
    Minimal YAML parser for environments without PyYAML.
    Supports only the config shape used by this project.
    """
    in_openrouter = False
    openrouter: Dict[str, Any] = {}
    models: List[Dict[str, str]] = []

    for line in raw_text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped == "openrouter:":
            in_openrouter = True
            continue
        if not in_openrouter:
            continue

        if stripped.startswith("base_url:"):
            openrouter["base_url"] = _parse_scalar(stripped.split(":", 1)[1])
        elif stripped.startswith("default_model:"):
            openrouter["default_model"] = _parse_scalar(stripped.split(":", 1)[1])
        elif stripped == "models:":
            continue
        elif stripped.startswith("- label:"):
            models.append({"label": _parse_scalar(stripped.split(":", 1)[1])})
        elif stripped.startswith("label:"):
            if not models:
                models.append({})
            models[-1]["label"] = _parse_scalar(stripped.split(":", 1)[1])
        elif stripped.startswith("slug:"):
            if not models:
                raise ValueError("openrouter.models entry is missing label before slug")
            models[-1]["slug"] = _parse_scalar(stripped.split(":", 1)[1])

    openrouter["models"] = models
    return {"openrouter": openrouter}


def _validate_model_config(config: Dict[str, Any]) -> None:
    openrouter_cfg = config.get("openrouter")
    if not isinstance(openrouter_cfg, dict):
        raise ValueError("model config must include an 'openrouter' mapping")

    base_url = openrouter_cfg.get("base_url")
    if not isinstance(base_url, str) or not base_url.strip():
        raise ValueError("openrouter.base_url is required and must be a non-empty string")

    default_model = openrouter_cfg.get("default_model")
    if not isinstance(default_model, str) or not default_model.strip():
        raise ValueError("openrouter.default_model is required and must be a non-empty string")

    models = openrouter_cfg.get("models")
    if not isinstance(models, list) or not models:
        raise ValueError("openrouter.models must be a non-empty list")

    seen_slugs = set()
    for idx, model in enumerate(models):
        if not isinstance(model, dict):
            raise ValueError(f"openrouter.models[{idx}] must be an object")

        label = model.get("label")
        slug = model.get("slug")
        if not isinstance(label, str) or not label.strip():
            raise ValueError(f"openrouter.models[{idx}].label must be a non-empty string")
        if not isinstance(slug, str) or not slug.strip():
            raise ValueError(f"openrouter.models[{idx}].slug must be a non-empty string")
        if slug in seen_slugs:
            raise ValueError(f"duplicate model slug in config: {slug}")

        seen_slugs.add(slug)

    if default_model not in seen_slugs:
        raise ValueError(
            f"openrouter.default_model '{default_model}' must be present in openrouter.models"
        )


def load_model_config(config_path: str = DEFAULT_CONFIG_PATH) -> Dict[str, Any]:
    global _CONFIG

    with open(config_path, "r", encoding="utf-8") as handle:
        raw_text = handle.read()

    if yaml is not None:
        parsed = yaml.safe_load(raw_text) or {}
    else:
        parsed = _fallback_parse_model_yaml(raw_text)

    if not isinstance(parsed, dict):
        raise ValueError("model config root must be an object")

    _validate_model_config(parsed)
    _CONFIG = parsed
    return _CONFIG


def _get_config() -> Dict[str, Any]:
    global _CONFIG
    if _CONFIG is None:
        _CONFIG = load_model_config()
    return _CONFIG


def get_models() -> List[Dict[str, str]]:
    models = _get_config()["openrouter"]["models"]
    return [{"label": item["label"], "slug": item["slug"]} for item in models]


def get_default_model() -> str:
    return _get_config()["openrouter"]["default_model"]


def get_base_url() -> str:
    return _get_config()["openrouter"]["base_url"]


def is_allowed_model(slug: str) -> bool:
    if not isinstance(slug, str) or not slug.strip():
        return False
    allowed = {item["slug"] for item in get_models()}
    return slug in allowed
