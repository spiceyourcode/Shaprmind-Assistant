from datetime import datetime, timedelta

from sqlalchemy import select

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.models import Call
from app.db.session import AsyncSessionLocal
from app.services.storage import _get_s3_client


logger = get_logger()


async def cleanup_old_audio() -> int:
    settings = get_settings()
    cutoff = datetime.utcnow() - timedelta(days=settings.call_audio_ttl_days)
    client = _get_s3_client()
    if not client or not settings.s3_bucket:
        logger.warning("cleanup_skipped_missing_s3")
        return 0
    deleted = 0
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Call).where(Call.started_at < cutoff, Call.audio_url.is_not(None)))
        for call in result.scalars().all():
            try:
                client.delete_object(Bucket=settings.s3_bucket, Key=call.audio_url)
                call.audio_url = None
                deleted += 1
            except Exception as exc:  # noqa: BLE001
                logger.warning("cleanup_delete_failed", error=str(exc), call_id=str(call.id))
        await session.commit()
    return deleted
