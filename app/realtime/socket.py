import socketio
from fastapi import HTTPException

from app.core.security import decode_token
from app.core.logging import get_logger
from app.services.session_state import update_session


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


@sio.event
async def request_takeover(sid, data):
    session = await sio.get_session(sid)
    user_id = session.get("user_id") if session else None
    call_id = data.get("call_id")
    phone_number = data.get("phone_number")
    if not user_id or not call_id or not phone_number:
        return {"status": "error", "message": "Missing data"}
    await update_session(
        call_id,
        {"takeover_requested": True, "takeover_user_id": user_id, "takeover_phone": phone_number},
        ttl_seconds=3600,
    )
    return {"status": "ok"}


async def emit_escalation(business_id: str, payload: dict) -> None:
    await sio.emit("escalation", payload, room=f"business:{business_id}")
