# ============================================================
# health.py — QueueAI Backend
# Simple system health check endpoint.
# ============================================================

from fastapi import APIRouter

from backend.responses import ok

router = APIRouter(tags=["system"])


@router.get("/health")
def health():
    return ok({"status": "ok", "service": "queueai-backend"})
