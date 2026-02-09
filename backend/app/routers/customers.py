from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, require_same_business
from app.db.models import CustomerProfile, User
from app.db.session import get_session
from app.schemas.customers import CustomerProfileResponse, CustomerProfileUpdate


router = APIRouter()


@router.get("/customers/{caller_number}", response_model=CustomerProfileResponse)
async def get_customer_profile(
    caller_number: str,
    business_id: str = Query(...),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CustomerProfileResponse:
    require_same_business(current_user, business_id)
    result = await session.execute(
        select(CustomerProfile).where(
            CustomerProfile.business_id == business_id,
            CustomerProfile.caller_number == caller_number,
        )
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return CustomerProfileResponse.model_validate(profile)


@router.put("/customers/{profile_id}", response_model=CustomerProfileResponse)
async def update_customer_profile(
    profile_id: str,
    payload: CustomerProfileUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CustomerProfileResponse:
    result = await session.execute(select(CustomerProfile).where(CustomerProfile.id == profile_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    require_same_business(current_user, profile.business_id)
    if payload.name is not None:
        profile.name = payload.name
    if payload.preferences is not None:
        profile.preferences = payload.preferences
    if payload.history is not None:
        profile.history = payload.history
    await session.commit()
    await session.refresh(profile)
    return CustomerProfileResponse.model_validate(profile)
