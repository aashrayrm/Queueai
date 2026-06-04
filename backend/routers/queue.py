# ============================================================
# queue.py — QueueAI Backend
# Queue routes: join a queue & retrieve queue/confirmation.
# ============================================================

from fastapi import APIRouter

from schemas import JoinQueueRequest
from services import queue_service
from responses import ok

router = APIRouter(prefix="/queue", tags=["queue"])


@router.post("/join")
def join_queue(body: JoinQueueRequest):
    data = queue_service.join_queue(
        body.place_id, body.customer_name, body.number_of_persons
    )
    return ok(data)


@router.get("/{entry_id}")
def get_queue_entry(entry_id: int):
    return ok(queue_service.get_entry(entry_id))
