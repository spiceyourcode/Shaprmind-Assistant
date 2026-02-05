from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.db.models import CallStatus, MessageSender
from app.schemas.common import APIModel


class CallListResponse(APIModel):
    id: UUID
    business_id: UUID
    caller_number: str
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int | None
    status: CallStatus
    summary: str | None


class CallDetailResponse(CallListResponse):
    action_points: dict | None
    audio_url: str | None


class CallMessageCreate(BaseModel):
    sender: MessageSender
    content: str
    sentiment: float | None = None


class CallMessageResponse(APIModel):
    id: UUID
    call_id: UUID
    sender: MessageSender
    content: str
    timestamp: datetime
    sentiment_score: float | None


class InboundCallWebhook(BaseModel):
    call_control_id: str | None = None
    caller_number: str
    to_number: str | None = None
    business_id: UUID | None = None
