from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.core.rate_limit import limiter
from app.db.models import User, UserRole
from app.deps import get_optional_user, require_owner, require_same_business
from app.db.session import get_session
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


router = APIRouter()


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, payload: LoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    result = await session.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.post("/register", response_model=TokenResponse)
@limiter.limit("5/minute")
async def register(
    request: Request,
    payload: RegisterRequest,
    session: AsyncSession = Depends(get_session),
    current_user: User | None = Depends(get_optional_user),
) -> TokenResponse:
    if payload.role == UserRole.staff:
        if payload.business_id is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Business ID required")
        if not current_user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Owner token required")
        require_owner(current_user)
        require_same_business(current_user, payload.business_id)

    existing = await session.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=payload.email,
        role=payload.role,
        business_id=payload.business_id,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)
