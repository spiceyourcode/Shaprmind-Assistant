import base64
import json

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.services.media_bridge import push_audio


router = APIRouter()


@router.websocket("/media/telnyx")
async def telnyx_media_stream(websocket: WebSocket, call_id: str = Query(...)) -> None:
    await websocket.accept()
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
        return
