# ============================================================
# auth_service.py — QueueAI Backend
# Custom authentication against the public.users table.
# Passwords are hashed with bcrypt and stored as password_hash.
# We never store plaintext passwords and never return the hash.
# ============================================================

import logging

import bcrypt

from db import get_supabase
from responses import ServiceError

logger = logging.getLogger("queueai.auth")


def _hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt and return a UTF-8 string."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def _verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"), password_hash.encode("utf-8")
        )
    except Exception:
        return False


def _public_user(row: dict) -> dict:
    """Return a safe user object (never includes the password hash)."""
    return {"id": str(row["id"]), "email": row["email"]}


def register(email: str, password: str) -> dict:
    email = email.strip().lower()
    sb = get_supabase()

    # 1. Reject duplicate emails
    try:
        existing = (
            sb.table("users").select("id").eq("email", email).limit(1).execute()
        )
    except Exception as exc:
        logger.exception("register: lookup failed")
        raise ServiceError(
            "Database error while checking the email. Is the 'users' table created?",
            500,
        )

    if existing.data:
        raise ServiceError("This email is already registered. Please sign in.", 409)

    # 2. Insert the new user with a hashed password
    try:
        res = (
            sb.table("users")
            .insert(
                {"email": email, "password_hash": _hash_password(password)}
            )
            .execute()
        )
    except Exception as exc:
        logger.exception("register: insert failed")
        raise ServiceError(
            "Could not create the account. Please try again.", 500
        )

    rows = res.data or []
    if not rows:
        raise ServiceError("Could not create the account. Please try again.", 500)

    logger.info("register: created user %s", email)
    return {"user": _public_user(rows[0]), "token": None}


def login(email: str, password: str) -> dict:
    email = email.strip().lower()
    sb = get_supabase()

    try:
        res = (
            sb.table("users")
            .select("*")
            .eq("email", email)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        logger.exception("login: lookup failed")
        raise ServiceError(
            "Database error during sign in. Is the 'users' table created?", 500
        )

    rows = res.data or []
    if not rows or not _verify_password(password, rows[0].get("password_hash", "")):
        raise ServiceError("Invalid email or password.", 401)

    logger.info("login: success for %s", email)
    return {"user": _public_user(rows[0]), "token": None}
