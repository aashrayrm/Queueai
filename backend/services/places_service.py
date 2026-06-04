# ============================================================
# places_service.py — QueueAI Backend
# Reads places from Supabase and maps DB rows into the shape
# the existing React UI expects (preserves the original design).
# ============================================================

from datetime import datetime, timezone

from backend.db import get_supabase
from backend.responses import ServiceError

_CATEGORY_SERVICE_MINUTES = {
    "Café": 4,
    "Salon": 14,
    "Clinic": 11,
    "Restaurant": 6,
}

_BEST_TIMES = {
    "Café": "2:00 PM - 3:30 PM",
    "Salon": "10:00 AM - 11:30 AM",
    "Clinic": "8:00 AM - 9:00 AM",
    "Restaurant": "3:00 PM - 5:00 PM",
}


def _status_for(queue_length: int, max_queue: int) -> tuple[str, str]:
    pct = queue_length / max(max_queue or 1, 1)
    if pct <= 0.35:
        return "low", "Short Wait"
    if pct <= 0.70:
        return "moderate", "Moderate Wait"
    return "busy", "Busy Now"


def _hour_factor(category: str) -> float:
    """Small deterministic demand factor based on current local-ish hour."""
    hour = datetime.now(timezone.utc).hour
    peak_hours = {
        "Café": {8, 9, 16, 17},
        "Salon": {12, 13, 17, 18},
        "Clinic": {10, 11, 12},
        "Restaurant": {12, 13, 19, 20, 21},
    }
    quiet_hours = {
        "Café": {14, 15},
        "Salon": {10, 11},
        "Clinic": {8, 9},
        "Restaurant": {15, 16, 17},
    }
    if hour in peak_hours.get(category, set()):
        return 1.2
    if hour in quiet_hours.get(category, set()):
        return 0.85
    return 1.0


def calculate_live_metrics(place: dict, waiting_entries: list[dict] | None = None) -> dict:
    """Calculate DB-backed queue status and AI-style recommendation fields."""
    waiting_count = len(waiting_entries or [])
    avg_service = int(
        place.get("avg_service_minutes")
        or _CATEGORY_SERVICE_MINUTES.get(place.get("category"), 8)
    )
    party_load = sum(int(e.get("number_of_persons") or 1) for e in (waiting_entries or []))
    per_party_wait = max(avg_service, round(avg_service * 0.75))
    estimated = round((waiting_count * per_party_wait + party_load) * _hour_factor(place["category"]))
    estimated = max(1 if waiting_count else avg_service, estimated)
    status, label = _status_for(waiting_count, int(place.get("max_queue") or 20))
    confidence = max(72, min(96, 96 - abs(waiting_count - (place.get("queue_length") or 0)) * 3))
    return {
        "queue_length": waiting_count,
        "estimated_wait_time": estimated,
        "queue_status": status,
        "status_label": label,
        "best_time_to_visit": place.get("best_time_to_visit")
        or _BEST_TIMES.get(place.get("category"), "Mid afternoon"),
        "ai_confidence": confidence,
    }


def _waiting_entries_for_place(place_id: int) -> list[dict]:
    sb = get_supabase()
    res = (
        sb.table("queue_entries")
        .select("*")
        .eq("place_id", place_id)
        .eq("status", "waiting")
        .order("created_at")
        .execute()
    )
    return res.data or []


def _sync_place_metrics(row: dict) -> dict:
    sb = get_supabase()
    waiting = _waiting_entries_for_place(row["id"])
    metrics = calculate_live_metrics(row, waiting)
    row = {**row, **metrics}
    try:
        sb.table("places").update(metrics).eq("id", row["id"]).execute()
    except Exception:
        # Returning calculated data is more useful than failing the page load.
        pass
    return row


def _map_place(row: dict) -> dict:
    """Map a DB row to the UI-friendly object used by the frontend."""
    return {
        "id": row["id"],
        "name": row["name"],
        "category": row["category"],
        "categoryIcon": row.get("category_icon"),
        "address": row.get("address"),
        "hours": row.get("hours"),
        "rating": float(row["rating"]) if row.get("rating") is not None else None,
        "reviews": row.get("reviews"),
        "description": row.get("description"),
        "currentQueue": row.get("queue_length", 0),
        "maxQueue": row.get("max_queue", 20),
        "estimatedWait": _format_wait(row.get("estimated_wait_time", 0)),
        "estimatedWaitMinutes": row.get("estimated_wait_time", 0),
        "bestTimeToVisit": row.get("best_time_to_visit"),
        "status": row.get("queue_status", "low"),
        "statusLabel": row.get("status_label"),
        "aiConfidence": row.get("ai_confidence"),
        "color": row.get("color"),
        "bgGradient": row.get("bg_gradient"),
    }


def _format_wait(mins: int) -> str:
    mins = int(mins or 0)
    if mins < 60:
        return f"{mins} min"
    h, m = divmod(mins, 60)
    return f"{h}h {m}min" if m else f"{h}h"


def get_all_places() -> list[dict]:
    sb = get_supabase()
    try:
        res = sb.table("places").select("*").order("id").execute()
    except Exception:
        raise ServiceError("Could not load places.", 500)
    return [_map_place(_sync_place_metrics(r)) for r in (res.data or [])]


def get_place(place_id: int) -> dict:
    sb = get_supabase()
    try:
        res = sb.table("places").select("*").eq("id", place_id).limit(1).execute()
    except Exception:
        raise ServiceError("Could not load place.", 500)
    rows = res.data or []
    if not rows:
        raise ServiceError("Place not found.", 404)
    return _map_place(_sync_place_metrics(rows[0]))
