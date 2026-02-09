from uuid import UUID

from pydantic import BaseModel

from app.db.models import EscalationAction
from app.schemas.common import APIModel


class EscalationRuleCreate(BaseModel):
    keywords: list[str]
    priority: int = 1
    action: EscalationAction
    notify_user_ids: list[UUID] | None = None


class EscalationRuleUpdate(BaseModel):
    keywords: list[str] | None = None
    priority: int | None = None
    action: EscalationAction | None = None
    notify_user_ids: list[UUID] | None = None


class EscalationRuleResponse(APIModel):
    id: UUID
    business_id: UUID
    keyword_or_phrase: list[str]
    priority: int
    action: EscalationAction
    notify_user_ids: list[UUID] | None
