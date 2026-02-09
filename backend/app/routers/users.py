from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.models import User, UserRole
from app.db.session import get_session
from app.deps import get_current_user, require_owner, require_same_business
from app.schemas.users import UserCreate, UserResponse, UserUpdate


router = APIRouter()


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[UserResponse]:
    require_owner(current_user)
    if not current_user.business_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Business not linked")
    result = await session.execute(select(User).where(User.business_id == current_user.business_id))
    return [UserResponse.model_validate(user) for user in result.scalars().all()]


@router.post("/users", response_model=UserResponse)
async def create_user(
    payload: UserCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    require_owner(current_user)
    if not current_user.business_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Business not linked")
    if payload.role == UserRole.owner:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Owner role not allowed here")
    existing = await session.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    user = User(
        email=payload.email,
        role=payload.role,
        business_id=current_user.business_id,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return UserResponse.model_validate(user)


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    payload: UserUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    require_owner(current_user)
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    require_same_business(current_user, user.business_id)
    if payload.role is not None:
        user.role = payload.role
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.push_token is not None:
        user.push_token = payload.push_token
    await session.commit()
    await session.refresh(user)
    return UserResponse.model_validate(user)


@router.delete("/users/{user_id}", response_model=dict)
async def delete_user(
    user_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    require_owner(current_user)
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    require_same_business(current_user, user.business_id)
    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete current user")
    await session.delete(user)
    await session.commit()
    return {"status": "deleted"}
