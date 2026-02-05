from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, require_owner, require_same_business
from app.db.models import Business, KnowledgeBase, User
from app.db.session import get_session
from app.schemas.businesses import BusinessCreate, BusinessResponse, KnowledgeBaseUpload
from app.services.knowledge_base import embed_text


router = APIRouter()


@router.post("", response_model=BusinessResponse)
async def create_business(
    payload: BusinessCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> BusinessResponse:
    require_owner(current_user)
    existing = await session.execute(select(Business).where(Business.phone_number == payload.phone_number))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone number already in use")

    business = Business(name=payload.name, phone_number=payload.phone_number, owner_user_id=current_user.id)
    session.add(business)
    await session.commit()
    await session.refresh(business)
    return BusinessResponse.model_validate(business)


@router.get("/{business_id}", response_model=BusinessResponse)
async def get_business(
    business_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> BusinessResponse:
    require_same_business(current_user, business_id)
    result = await session.execute(select(Business).where(Business.id == business_id))
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Business not found")
    return BusinessResponse.model_validate(business)


@router.put("/{business_id}/knowledge", response_model=dict)
async def upload_knowledge(
    business_id: str,
    payload: KnowledgeBaseUpload,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    require_owner(current_user)
    require_same_business(current_user, business_id)
    embedding = await embed_text(payload.content)
    kb = KnowledgeBase(
        business_id=business_id,
        category=payload.category,
        content=payload.content,
        embedding=embedding,
    )
    session.add(kb)
    await session.commit()
    return {"status": "ok"}
