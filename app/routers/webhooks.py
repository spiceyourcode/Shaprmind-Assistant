from fastapi import APIRouter, Request

from app.schemas.webhooks import ActionPointWebhook
from app.core.rate_limit import limiter
from app.services.notifications import trigger_action_point


router = APIRouter()


@router.post("/actions", response_model=dict)
@limiter.limit("30/minute")
async def actions(request: Request, payload: ActionPointWebhook) -> dict:
    await trigger_action_point(payload.type, payload.details)
    return {"status": "queued"}
