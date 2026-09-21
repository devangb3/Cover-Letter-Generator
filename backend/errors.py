"""Shared exceptions for backend workflows and provider integrations."""


class ServiceError(Exception):
    """An expected workflow failure translated to HTTP by the routes layer."""

    def __init__(self, error, status=400):
        self.payload = error if isinstance(error, dict) else {'error': error}
        self.status = status
        super().__init__(self.payload['error'])


class ProviderRequestError(RuntimeError):
    """An upstream HTTP failure, retaining the provider's status code."""

    def __init__(self, message, status_code):
        self.status_code = status_code
        super().__init__(message)


class InvalidProviderResponseError(RuntimeError):
    """A provider response is missing required response data."""


class InvalidStructuredOutputError(Exception):
    """The provider returned invalid output after exhausting corrective retries."""
