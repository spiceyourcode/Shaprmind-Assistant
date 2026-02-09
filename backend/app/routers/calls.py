from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, status
from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, require_same_business
from app.core.rate_limit import limiter
from app.db.models import Call, CallMessage, User, UserRole
from app.db.session import get_session
from app.schemas.calls import (
    CallDetailResponse,
    CallListResponse,
    CallMessageCreate,
    CallMessageResponse,
    InboundCallWebhook,
)
from app.services.call_handler import handle_inbound_call
from app.services.webhook_security import verify_telnyx_signature
from app.services.storage import generate_audio_signed_url


router = APIRouter()


@router.get("/calls", response_model=list[CallListResponse])
async def list_calls(
    business_id: str = Query(...),
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    limit: int = 20,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[CallListResponse]:
    require_same_business(current_user, business_id)
    filters = [Call.business_id == business_id]
    if current_user.role == UserRole.staff:
        filters.append(Call.escalated_to_user_id == current_user.id)
    if date_from:
        filters.append(Call.started_at >= date_from)
    if date_to:
        filters.append(Call.started_at <= date_to)
    query = select(Call).where(and_(*filters)).order_by(Call.started_at.desc()).limit(limit).offset(offset)
    result = await session.execute(query)
    return [CallListResponse.model_validate(call) for call in result.scalars().all()]


@router.get("/calls/{call_id}", response_model=CallDetailResponse)
async def get_call(
    call_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CallDetailResponse:
    result = await session.execute(select(Call).where(Call.id == call_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    require_same_business(current_user, call.business_id)
    if current_user.role == UserRole.staff and call.escalated_to_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return CallDetailResponse.model_validate(call)


@router.get("/calls/{call_id}/audio", response_model=dict)
async def get_call_audio(
    call_id: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict:
    result = await session.execute(select(Call).where(Call.id == call_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    require_same_business(current_user, call.business_id)
    if current_user.role == UserRole.staff and call.escalated_to_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    signed_url = generate_audio_signed_url(call.audio_url)
    return {"url": signed_url}


@router.post("/calls/{call_id}/messages", response_model=CallMessageResponse)
async def add_call_message(
    call_id: str,
    payload: CallMessageCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> CallMessageResponse:
    result = await session.execute(select(Call).where(Call.id == call_id))
    call = result.scalar_one_or_none()
    if not call:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Call not found")
    require_same_business(current_user, call.business_id)
    if current_user.role == UserRole.staff and call.escalated_to_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    message = CallMessage(
        call_id=call_id,
        sender=payload.sender,
        content=payload.content,
        sentiment_score=payload.sentiment,
    )
    session.add(message)
    await session.commit()
    await session.refresh(message)
    return CallMessageResponse.model_validate(message)


@router.post("/calls/inbound", response_model=dict)
@limiter.limit("60/minute")
async def inbound_call(
    request: Request,
    background: BackgroundTasks,
) -> dict:
    raw_body = await request.body()
    if not verify_telnyx_signature(raw_body, request.headers):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Telnyx signature")
    try:
        payload = InboundCallWebhook.model_validate_json(raw_body)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload") from exc
    background.add_task(handle_inbound_call, payload)
    return {"status": "accepted"}
