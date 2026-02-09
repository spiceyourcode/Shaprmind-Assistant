from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.common import APIModel


class CustomerProfileResponse(APIModel):
    id: UUID
    business_id: UUID
    caller_number: str
    name: str | None
    preferences: dict | None
    history: dict | None
    updated_at: datetime


class CustomerProfileUpdate(BaseModel):
    name: str | None = None
    preferences: dict | None = None
    history: dict | None = None
