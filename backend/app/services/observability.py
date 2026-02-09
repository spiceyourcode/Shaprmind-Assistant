from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import CallEvent


async def record_call_event(session: AsyncSession, call_id: str, event_type: str, details: dict) -> None:
    event = CallEvent(call_id=call_id, event_type=event_type, details=details, timestamp=datetime.utcnow())
    session.add(event)
    await session.commit()
