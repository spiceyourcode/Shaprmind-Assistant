from datetime import datetime

from sqlalchemy import select

from app.core.logging import get_logger
from app.db.models import ActionDelivery, ActionDeliveryStatus
from app.db.session import AsyncSessionLocal


logger = get_logger()


async def create_delivery(call_id: str | None, action_type: str, target: str | None) -> ActionDelivery:
    async with AsyncSessionLocal() as session:
        delivery = ActionDelivery(
            call_id=call_id,
            action_type=action_type,
            target=target,
            status=ActionDeliveryStatus.pending,
            attempts=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(delivery)
        await session.commit()
        await session.refresh(delivery)
        return delivery


async def update_delivery(delivery_id, status: ActionDeliveryStatus, attempts: int, last_error: str | None) -> None:
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(ActionDelivery).where(ActionDelivery.id == delivery_id))
        delivery = result.scalar_one_or_none()
        if not delivery:
            return
        delivery.status = status
        delivery.attempts = attempts
        delivery.last_error = last_error
        delivery.updated_at = datetime.utcnow()
        await session.commit()
