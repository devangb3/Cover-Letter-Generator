"""Expected workflow failures, translated to HTTP by the routes layer."""


class ServiceError(Exception):
    def __init__(self, error, status=400):
        self.payload = error if isinstance(error, dict) else {'error': error}
        self.status = status
        super().__init__(self.payload['error'])
