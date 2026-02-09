from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user, require_owner, require_same_business
from app.db.models import Call, CallMessage, User
from app.db.session import get_session
from app.schemas.analytics import AnalyticsSummaryResponse


router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummaryResponse)
async def summary(
    business_id: str = Query(...),
    period: str = Query("30d"),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> AnalyticsSummaryResponse:
    require_owner(current_user)
    require_same_business(current_user, business_id)
    days = int(period.rstrip("d"))
    since = datetime.utcnow() - timedelta(days=days)

    total_calls = await session.execute(
        select(func.count(Call.id)).where(Call.business_id == business_id, Call.started_at >= since)
    )
    avg_duration = await session.execute(
        select(func.avg(Call.duration_seconds)).where(Call.business_id == business_id, Call.started_at >= since)
    )
    escalated = await session.execute(
        select(func.count(Call.id)).where(
            Call.business_id == business_id,
            Call.started_at >= since,
            Call.status == "escalated",
        )
    )
    sentiment_avg = await session.execute(
        select(func.avg(CallMessage.sentiment_score))
        .join(Call, CallMessage.call_id == Call.id)
        .where(Call.business_id == business_id, Call.started_at >= since)
    )

    total = total_calls.scalar() or 0
    escalation_rate = (escalated.scalar() or 0) / total if total else 0

    return AnalyticsSummaryResponse(
        total_calls=total,
        avg_duration=float(avg_duration.scalar() or 0),
        escalation_rate=escalation_rate,
        sentiment_avg=sentiment_avg.scalar(),
    )
