from uuid import UUID

from pydantic import BaseModel

from app.schemas.common import APIModel


class BusinessCreate(BaseModel):
    name: str
    phone_number: str


class BusinessResponse(APIModel):
    id: UUID
    name: str
    phone_number: str
    owner_user_id: UUID


class KnowledgeBaseUpload(BaseModel):
    category: str
    content: str
