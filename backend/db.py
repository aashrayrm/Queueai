# ============================================================
# db.py — QueueAI Backend
# Supabase client singleton. The backend is the ONLY layer
# that talks to Supabase (frontend never connects directly).
# ============================================================

from functools import lru_cache
from supabase import create_client, Client

from config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Return a cached Supabase client using the service role key."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise RuntimeError(
            "Supabase credentials missing. Set SUPABASE_URL and "
            "SUPABASE_SERVICE_KEY in backend/.env"
        )
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
