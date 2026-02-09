from uuid import UUID

from pydantic import BaseModel, EmailStr

from app.db.models import UserRole
from app.schemas.common import APIModel


class UserResponse(APIModel):
    id: UUID
    email: EmailStr
    role: UserRole
    business_id: UUID | None
    phone: str | None
    push_token: str | None


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.staff
    phone: str | None = None


class UserUpdate(BaseModel):
    role: UserRole | None = None
    phone: str | None = None
    push_token: str | None = None
