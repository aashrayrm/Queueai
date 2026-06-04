# ============================================================
# api/index.py — Vercel Python Serverless entry for QueueAI
# Exposes the FastAPI app so Vercel can serve it as a
# serverless function under /api/*.
# ============================================================

import os
import sys

# Make the backend package importable
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from backend.main import app  # noqa: E402  (FastAPI app)

# Vercel's Python runtime detects the ASGI `app` automatically.
