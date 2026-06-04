# ============================================================
# main.py — QueueAI Backend
# FastAPI application entry point.
# - Mounts all routers under /api
# - Configures CORS for the frontend
# - Global exception handlers return the consistent envelope
# ============================================================

import logging
import os
import sys

# Ensure the project root is on sys.path so backend imports work whether
# running from the repo root or from the backend directory directly.
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from responses import ServiceError, fail
from routers import auth, places, queue, health, notifications

# ---------- Logging ----------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger("queueai")

app = FastAPI(title="QueueAI API", version="1.0.0")


# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Routers (all under /api) ----------
app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(places.router, prefix="/api")
app.include_router(queue.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")


# ---------- Global exception handlers (consistent envelope) ----------
@app.exception_handler(ServiceError)
async def service_error_handler(_: Request, exc: ServiceError):
    return JSONResponse(status_code=exc.status_code, content=fail(exc.message))


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError):
    # Surface the first validation message in a friendly way
    try:
        first = exc.errors()[0]
        field = first.get("loc", ["field"])[-1]
        msg = first.get("msg", "Invalid input")
        message = f"{field}: {msg}"
    except Exception:
        message = "Invalid request data."
    return JSONResponse(status_code=422, content=fail(message))


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content=fail("An unexpected error occurred. Please try again."),
    )


@app.get("/")
def root():
    return {"success": True, "data": {"name": "QueueAI API", "docs": "/docs"}, "error": None}


# If you run the backend directly, this entrypoint makes local development easy.
# Vercel ignores this block and discovers the `app` object automatically.
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
