import json
from typing import Any

from redis.asyncio import Redis

from app.core.config import get_settings


_redis: Redis | None = None


def get_redis() -> Redis:
    global _redis
    if _redis is None:
        settings = get_settings()
        _redis = Redis.from_url(settings.redis_url, decode_responses=True)
    return _redis


async def get_session(call_id: str) -> dict[str, Any]:
    redis = get_redis()
    data = await redis.get(f"call:{call_id}")
    return json.loads(data) if data else {}


async def set_session(call_id: str, state: dict[str, Any], ttl_seconds: int = 3600) -> None:
    redis = get_redis()
    await redis.set(f"call:{call_id}", json.dumps(state), ex=ttl_seconds)
