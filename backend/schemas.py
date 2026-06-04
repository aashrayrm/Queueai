# ============================================================
# schemas.py — QueueAI Backend
# Pydantic models for request validation and typed responses.
# ============================================================

from typing import Any, Optional
from pydantic import BaseModel, EmailStr, Field


# ---------- Consistent API envelope ----------
class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None


# ---------- Auth ----------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


# ---------- Queue ----------
class JoinQueueRequest(BaseModel):
    place_id: int
    customer_name: str = Field(min_length=2, max_length=50)
    number_of_persons: int = Field(ge=1, le=20, default=1)


# ---------- Notifications ----------
class NotificationCreateRequest(BaseModel):
    type: str = Field(default="info", max_length=20)
    icon: str = Field(default="🔔", max_length=8)
    message: str = Field(min_length=1, max_length=240)
