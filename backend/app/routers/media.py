import asyncio
import base64
import json

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.services.media_bridge import iter_tts_audio, push_audio


router = APIRouter()


@router.websocket("/media/telnyx")
async def telnyx_media_stream(websocket: WebSocket, call_id: str = Query(...)) -> None:
    await websocket.accept()
    sender_task = asyncio.create_task(_send_tts_audio(websocket, call_id))
    try:
        while True:
            message = await websocket.receive_text()
            payload = json.loads(message)
            event = payload.get("event")
            if event == "media":
                media = payload.get("media", {})
                data = media.get("payload")
                if data:
                    await push_audio(call_id, base64.b64decode(data))
            elif event in {"stop", "closed"}:
                break
    except WebSocketDisconnect:
        pass
    finally:
        sender_task.cancel()


async def _send_tts_audio(websocket: WebSocket, call_id: str) -> None:
    async for chunk in iter_tts_audio(call_id):
        payload = {
            "event": "media",
            "media": {
                # Telnyx expects base64-encoded audio payloads; ensure audio format matches Telnyx requirements.
                "payload": base64.b64encode(chunk).decode("ascii")
            },
        }
        await websocket.send_text(json.dumps(payload))
