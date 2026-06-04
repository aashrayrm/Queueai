# ============================================================
# queue_service.py — QueueAI Backend
# Handles joining a queue and retrieving queue/confirmation
# details. All DB writes go through Supabase here.
# ============================================================

import ast
import re
from datetime import datetime, timedelta, timezone

from postgrest.exceptions import APIError

from db import get_supabase
from responses import ServiceError
from services.places_service import get_place, _format_wait


# Prefix used for the generated queue number, by category
_PREFIX = {"Café": "C", "Salon": "S", "Clinic": "M", "Restaurant": "B"}


def _queue_number(category: str, place_id: int, position: int) -> str:
    prefix = _PREFIX.get(category, "Q")
    return f"{prefix}{place_id}-{position:03d}"


def _waiting_entries(place_id: int) -> list[dict]:
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


def _insert_notification(entry: dict, place: dict) -> None:
    sb = get_supabase()
    wait = _format_wait(entry.get("estimated_wait_time", 0))
    try:
        sb.table("notifications").insert(
            {
                "queue_entry_id": entry["id"],
                "place_id": place["id"],
                "type": "success",
                "icon": "✅",
                "message": (
                    f"You joined the queue at {place['name']}. "
                    f"Your number is {entry['queue_number']} and wait is about {wait}."
                ),
                "read": False,
            }
        ).execute()
    except Exception:
        # Notifications should never block the queue join.
        pass


def _get_api_error_payload(exc: APIError) -> dict:
    payload = exc.args[0] if exc.args else {}
    if isinstance(payload, dict):
        return payload
    if isinstance(payload, str):
        try:
            return ast.literal_eval(payload)
        except Exception:
            return {"message": payload}
    return {}


def _missing_columns_from_error(exc: APIError) -> list[str]:
    payload = _get_api_error_payload(exc)
    if not isinstance(payload, dict):
        return []
    message = str(payload.get("message", ""))
    return re.findall(r"Could not find the '([^']+)' column", message)


def _map_entry(row: dict, place: dict | None = None) -> dict:
    """Map a queue_entries row to the UI confirmation shape."""
    data = {
        "id": row["id"],
        "customerName": row["customer_name"],
        "partySize": row["number_of_persons"],
        "placeId": row["place_id"],
        "queueNumber": row["queue_number"],
        "estimatedWaitMinutes": row["estimated_wait_time"],
        "estimatedWait": _format_wait(row["estimated_wait_time"]),
        "status": row.get("status", "waiting"),
        "joinedAt": row.get("joined_at"),
        "createdAt": row.get("created_at"),
        "position": row.get("position_at_join"),
        "expectedServiceAt": row.get("expected_service_at"),
        "notifyAt": row.get("notify_at"),
    }
    if place:
        data["placeName"] = place["name"]
        data["placeIcon"] = place.get("categoryIcon")
    return data


def join_queue(place_id: int, customer_name: str, number_of_persons: int) -> dict:
    # Validate the place exists (raises 404 if not)
    place = get_place(place_id)

    waiting = _waiting_entries(place_id)
    position = len(waiting) + 1
    base = place.get("estimatedWaitMinutes", 0) or 0
    estimated = max(1, base + (number_of_persons - 1) * 2)
    now = datetime.now(timezone.utc)
    expected_service_at = now + timedelta(minutes=estimated)
    notify_at = now + timedelta(minutes=max(0, estimated - 3))

    entry = {
        "customer_name": customer_name.strip(),
        "number_of_persons": number_of_persons,
        "place_id": place_id,
        "queue_number": _queue_number(place["category"], place_id, position),
        "estimated_wait_time": estimated,
        "status": "waiting",
        "position_at_join": position,
        "expected_service_at": expected_service_at.isoformat(),
        "notify_at": notify_at.isoformat(),
    }

    sb = get_supabase()
    insert_values = entry.copy()
    while True:
        try:
            res = sb.table("queue_entries").insert(insert_values).execute()
            break
        except APIError as exc:
            missing_columns = [
                column for column in _missing_columns_from_error(exc) if column in insert_values
            ]
            if not missing_columns:
                raise ServiceError("Could not join the queue. Please try again.", 500)
            insert_values = {
                k: v
                for k, v in insert_values.items()
                if k not in missing_columns
            }
            continue
        except Exception:
            raise ServiceError("Could not join the queue. Please try again.", 500)

    rows = res.data or []
    if not rows:
        raise ServiceError("Could not join the queue. Please try again.", 500)

    _insert_notification(rows[0], place)
    try:
        sb.table("places").update({"queue_length": position}).eq("id", place_id).execute()
    except Exception:
        pass

    return _map_entry(rows[0], place)


def get_entry(entry_id: int) -> dict:
    sb = get_supabase()
    try:
        res = (
            sb.table("queue_entries")
            .select("*")
            .eq("id", entry_id)
            .limit(1)
            .execute()
        )
    except Exception:
        raise ServiceError("Could not load queue details.", 500)

    rows = res.data or []
    if not rows:
        raise ServiceError("Queue entry not found.", 404)

    row = rows[0]
    try:
        place = get_place(row["place_id"])
    except ServiceError:
        place = None
    return _map_entry(row, place)
