from fastapi import APIRouter

from backend.responses import ok
from backend.schemas import NotificationCreateRequest
from backend.services import notifications_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def list_notifications():
    return ok(notifications_service.list_notifications())


@router.post("")
def create_notification(body: NotificationCreateRequest):
    return ok(
        notifications_service.create_notification(
            {
                "type": body.type,
                "icon": body.icon,
                "message": body.message,
                "read": False,
            }
        )
    )


@router.post("/read-all")
def mark_all_read():
    notifications_service.mark_all_read()
    return ok({"updated": True})


@router.delete("/{notification_id}")
def dismiss(notification_id: int):
    notifications_service.dismiss(notification_id)
    return ok({"deleted": True})
