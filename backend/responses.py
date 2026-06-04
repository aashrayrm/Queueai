# ============================================================
# responses.py — QueueAI Backend
# Helpers for the consistent { success, data, error } envelope
# and a shared domain exception type.
# ============================================================

from typing import Any, Optional


class ServiceError(Exception):
    """Raised by the service layer for expected, client-facing errors."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def ok(data: Any = None) -> dict:
    return {"success": True, "data": data, "error": None}


def fail(error: str) -> dict:
    return {"success": False, "data": None, "error": error}
