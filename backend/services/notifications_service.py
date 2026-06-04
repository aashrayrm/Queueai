import ast
from datetime import datetime, timezone

from postgrest.exceptions import APIError

from db import get_supabase
from responses import ServiceError


def _time_ago(value: str | None) -> str:
    if not value:
        return "just now"
    try:
        created = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return "just now"
    delta = datetime.now(timezone.utc) - created
    seconds = max(0, int(delta.total_seconds()))
    if seconds < 60:
        return "just now" if seconds < 5 else f"{seconds}s ago"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes} min ago"
    hours = minutes // 60
    return f"{hours}h ago"


def _map_notification(row: dict) -> dict:
    return {
        "id": row["id"],
        "type": row.get("type", "info"),
        "icon": row.get("icon", "🔔"),
        "message": row.get("message", ""),
        "time": _time_ago(row.get("created_at")),
        "read": bool(row.get("read", False)),
    }


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


def _is_missing_table_error(exc: APIError) -> bool:
    payload = _get_api_error_payload(exc)
    return isinstance(payload, dict) and payload.get("code") == "PGRST205"


def list_notifications(limit: int = 20) -> list[dict]:
    sb = get_supabase()
    try:
        res = (
            sb.table("notifications")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
    except APIError as exc:
        if _is_missing_table_error(exc):
            return []
        raise ServiceError("Could not load notifications.", 500)
    except Exception:
        raise ServiceError("Could not load notifications.", 500)
    return [_map_notification(row) for row in (res.data or [])]


def create_notification(data: dict) -> dict:
    sb = get_supabase()
    try:
        res = sb.table("notifications").insert(data).execute()
    except APIError as exc:
        if _is_missing_table_error(exc):
            return {
                "id": None,
                "type": data.get("type", "info"),
                "icon": data.get("icon", "🔔"),
                "message": data.get("message", ""),
                "time": "just now",
                "read": bool(data.get("read", False)),
            }
        raise ServiceError("Could not save notification.", 500)
    except Exception:
        raise ServiceError("Could not save notification.", 500)
    rows = res.data or []
    if not rows:
        raise ServiceError("Could not save notification.", 500)
    return _map_notification(rows[0])


def mark_all_read() -> None:
    sb = get_supabase()
    try:
        sb.table("notifications").update({"read": True}).eq("read", False).execute()
    except APIError as exc:
        if _is_missing_table_error(exc):
            return
        raise ServiceError("Could not update notifications.", 500)
    except Exception:
        raise ServiceError("Could not update notifications.", 500)


def dismiss(notification_id: int) -> None:
    sb = get_supabase()
    try:
        sb.table("notifications").delete().eq("id", notification_id).execute()
    except APIError as exc:
        if _is_missing_table_error(exc):
            return
        raise ServiceError("Could not dismiss notification.", 500)
    except Exception:
        raise ServiceError("Could not dismiss notification.", 500)
