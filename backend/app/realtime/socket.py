import socketio
from fastapi import HTTPException

from app.core.config import get_settings
from app.core.logging import get_logger
from app.core.security import decode_token
from app.services.session_state import update_session


logger = get_logger()
settings = get_settings()
if settings.cors_allow_origins:
    cors_origins = [origin.strip() for origin in settings.cors_allow_origins.split(",") if origin.strip()]
else:
    cors_origins = ["http://localhost:5173", "http://localhost:8080"]

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=cors_origins)
_raw_socket_app = socketio.ASGIApp(sio)


async def _socket_app(scope, receive, send):
    """Wrap Socket.IO app so stray WebSocket connections to non-Socket.IO paths
    are closed with a proper WebSocket close instead of an HTTP 404. Engine.IO
    would send http.response.start on a WebSocket scope and cause:
    RuntimeError: Expected ASGI message 'websocket.accept'... but got 'http.response.start'.
    """
    if scope.get("type") == "websocket":
        path = (scope.get("path") or "").rstrip("/")
        # Socket.IO uses path ending with /socket.io (e.g. /ws/alerts/socket.io)
        if not path.endswith("socket.io") and "/socket.io" not in path:
            # Accept then close so we never send HTTP on a WebSocket
            await send({"type": "websocket.accept"})
            await send({"type": "websocket.close", "code": 1000, "reason": "Use Socket.IO path"})
            return
    await _raw_socket_app(scope, receive, send)


socket_app = _socket_app


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
