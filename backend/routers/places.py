# ============================================================
# places.py — QueueAI Backend
# Places routes: list all places & get a single place.
# ============================================================

from fastapi import APIRouter

from services import places_service
from responses import ok

router = APIRouter(prefix="/places", tags=["places"])


@router.get("")
def list_places():
    return ok(places_service.get_all_places())


@router.get("/{place_id}")
def get_place(place_id: int):
    return ok(places_service.get_place(place_id))
