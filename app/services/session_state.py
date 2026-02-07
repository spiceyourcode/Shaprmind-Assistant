import json
from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

import httpx
from redis.asyncio import Redis

from app.core.config import get_settings


_redis: Redis | None = None
_upstash_client: httpx.AsyncClient | None = None


def _use_upstash() -> bool:
    settings = get_settings()
    return bool(settings.upstash_redis_rest_url and settings.upstash_redis_rest_token)


def get_redis() -> Redis:
    global _redis
    if _redis is None:
        settings = get_settings()
        _redis = Redis.from_url(settings.redis_url, decode_responses=True)
    return _redis


def _get_upstash_client() -> httpx.AsyncClient:
    global _upstash_client
    if _upstash_client is None:
        settings = get_settings()
        _upstash_client = httpx.AsyncClient(
            base_url=settings.upstash_redis_rest_url,
            headers={
                "Authorization": f"Bearer {settings.upstash_redis_rest_token}",
            },
            timeout=10,
        )
    return _upstash_client


async def _upstash_get(key: str) -> str | None:
    client = _get_upstash_client()
    safe_key = quote(key, safe="")
    response = await client.get(f"/get/{safe_key}")
    response.raise_for_status()
    payload = response.json()
    return payload.get("result")


async def _upstash_set(key: str, value: str, ttl_seconds: int) -> None:
    client = _get_upstash_client()
    safe_key = quote(key, safe="")
    safe_value = quote(value, safe="")
    response = await client.post(f"/set/{safe_key}/{safe_value}", params={"ex": ttl_seconds})
    response.raise_for_status()


async def get_session(call_id: str) -> dict[str, Any]:
    if _use_upstash():
        data = await _upstash_get(f"call:{call_id}")
    else:
        redis = get_redis()
        data = await redis.get(f"call:{call_id}")
    return json.loads(data) if data else {}


async def set_session(call_id: str, state: dict[str, Any], ttl_seconds: int = 3600) -> None:
    state["updated_at"] = datetime.now(timezone.utc).isoformat()
    payload = json.dumps(state)
    if _use_upstash():
        await _upstash_set(f"call:{call_id}", payload, ttl_seconds)
    else:
        redis = get_redis()
        await redis.set(f"call:{call_id}", payload, ex=ttl_seconds)


async def update_session(call_id: str, updates: dict[str, Any], ttl_seconds: int = 3600) -> dict[str, Any]:
    state = await get_session(call_id)
    state.update(updates)
    await set_session(call_id, state, ttl_seconds=ttl_seconds)
    return state


def _is_stale(updated_at: str | None, max_age_seconds: int) -> bool:
    if not updated_at:
        return False
    try:
        parsed = datetime.fromisoformat(updated_at)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return (datetime.now(timezone.utc) - parsed).total_seconds() > max_age_seconds
    except Exception:
        return False


async def cleanup_stale_sessions(max_age_seconds: int = 3600) -> int:
    if _use_upstash():
        return 0
    redis = get_redis()
    deleted = 0
    cursor = b"0"
    while cursor:
        cursor, keys = await redis.scan(cursor=cursor, match="call:*", count=200)
        for key in keys:
            data = await redis.get(key)
            if not data:
                continue
            try:
                payload = json.loads(data)
            except Exception:
                continue
            if _is_stale(payload.get("updated_at"), max_age_seconds):
                await redis.delete(key)
                deleted += 1
        if cursor == 0 or cursor == "0":
            break
    return deleted
