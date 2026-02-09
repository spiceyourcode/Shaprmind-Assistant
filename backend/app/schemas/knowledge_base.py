from datetime import datetime

from pydantic import BaseModel


class KnowledgeBaseCategoryResponse(BaseModel):
    category: str
    content: str
    updated_at: datetime | None
