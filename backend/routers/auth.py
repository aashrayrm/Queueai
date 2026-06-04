# ============================================================
# auth.py — QueueAI Backend
# Authentication routes: register & login.
# ============================================================

from fastapi import APIRouter

from schemas import RegisterRequest, LoginRequest
from services import auth_service
from responses import ok

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(body: RegisterRequest):
    data = auth_service.register(body.email, body.password)
    return ok(data)


@router.post("/login")
def login(body: LoginRequest):
    data = auth_service.login(body.email, body.password)
    return ok(data)
