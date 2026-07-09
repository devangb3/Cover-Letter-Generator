import logging
import os
from typing import Mapping
from urllib.parse import unquote

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from openinference.instrumentation.openai import OpenAIInstrumentor

_CONFIGURED = False


def _is_enabled() -> bool:
    enabled = os.environ.get("PILOTCREW_OBSERVABILITY_ENABLED", "true").strip().lower()
    return enabled not in {"0", "false", "no", "off"}


def _get_otlp_endpoint() -> str:
    traces_endpoint = (
        os.environ.get("OTEL_EXPORTER_OTLP_TRACES_ENDPOINT")
        or ""
    ).strip()
    if traces_endpoint:
        return traces_endpoint

    otlp_endpoint = os.environ.get("OTEL_EXPORTER_OTLP_ENDPOINT", "").strip().rstrip("/")
    if not otlp_endpoint:
        return ""
    return f"{otlp_endpoint}/v1/traces"


def _build_headers() -> Mapping[str, str]:
    raw_headers = (
        os.environ.get("OTEL_EXPORTER_OTLP_TRACES_HEADERS")
        or os.environ.get("OTEL_EXPORTER_OTLP_HEADERS")
        or ""
    ).strip()
    return _parse_key_value_list(raw_headers)


def _parse_key_value_list(raw_value: str) -> dict[str, str]:
    values: dict[str, str] = {}
    if not raw_value:
        return values

    for item in raw_value.split(","):
        key, separator, value = item.partition("=")
        if separator and key.strip() and value.strip():
            values[key.strip()] = unquote(value.strip())
    return values


def _build_resource_attributes():
    attributes = _parse_key_value_list(os.environ.get("OTEL_RESOURCE_ATTRIBUTES", ""))
    attributes["service.name"] = (
        os.environ.get("OTEL_SERVICE_NAME")
        or attributes.get("service.name")
        or "cover-letter-generator"
    )

    service_namespace = os.environ.get("OTEL_SERVICE_NAMESPACE")
    app_version = os.environ.get("APP_VERSION")
    if service_namespace:
        attributes["service.namespace"] = service_namespace
    if app_version:
        attributes["service.version"] = app_version

    return Resource.create(attributes)


def configure_observability(app, logger: logging.Logger) -> None:
    global _CONFIGURED
    if _CONFIGURED:
        return

    if not _is_enabled():
        logger.info("PilotCrew observability disabled by PILOTCREW_OBSERVABILITY_ENABLED")
        return

    endpoint = _get_otlp_endpoint()
    if not endpoint:
        logger.info("PilotCrew observability OTLP endpoint not configured; skipping trace export")
        return

    headers = _build_headers()
    provider = TracerProvider(resource=_build_resource_attributes())
    exporter = OTLPSpanExporter(endpoint=endpoint, headers=headers or None)
    provider.add_span_processor(BatchSpanProcessor(exporter))
    trace.set_tracer_provider(provider)

    FlaskInstrumentor().instrument_app(app)
    HTTPXClientInstrumentor().instrument()
    OpenAIInstrumentor().instrument(tracer_provider=provider)
    _CONFIGURED = True
    logger.info("PilotCrew observability exporting traces to %s", endpoint)
