from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.models import User, UserRole
from app.db.session import get_session


security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    try:
        payload = decode_token(creds.credentials)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = payload.get("sub")
    try:
        user_uuid = UUID(str(user_id))
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    result = await session.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def get_optional_user(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(optional_security)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> User | None:
    if not creds:
        return None
    try:
        payload = decode_token(creds.credentials)
        user_uuid = UUID(str(payload.get("sub")))
    except Exception:
        return None
    result = await session.execute(select(User).where(User.id == user_uuid))
    return result.scalar_one_or_none()


def require_owner(user: User) -> None:
    if user.role != UserRole.owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Owner access required")


def require_same_business(user: User, business_id) -> None:
    if str(user.business_id) != str(business_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
