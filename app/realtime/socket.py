import socketio
from fastapi import HTTPException

from app.core.security import decode_token
from app.core.logging import get_logger


logger = get_logger()
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
socket_app = socketio.ASGIApp(sio)


@sio.event
async def connect(sid, environ, auth):
    token = (auth or {}).get("token")
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        payload = decode_token(token)
    except Exception as exc:  # noqa: BLE001
        logger.warning("socket_auth_failed", error=str(exc))
        raise HTTPException(status_code=401, detail="Invalid token") from exc
    await sio.save_session(sid, {"user_id": payload.get("sub")})


@sio.event
async def join_business(sid, data):
    business_id = data.get("business_id")
    if not business_id:
        return
    await sio.enter_room(sid, f"business:{business_id}")


async def emit_escalation(business_id: str, payload: dict) -> None:
    await sio.emit("escalation", payload, room=f"business:{business_id}")
