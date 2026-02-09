from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class APIModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class IDResponse(APIModel):
    id: UUID


class Timestamped(APIModel):
    created_at: datetime | None = None
