from fastapi import APIRouter

from app.schemas.webhooks import ActionPointWebhook
from app.services.notifications import trigger_action_point


router = APIRouter()


@router.post("/actions", response_model=dict)
async def actions(payload: ActionPointWebhook) -> dict:
    await trigger_action_point(payload.type, payload.details)
    return {"status": "queued"}
