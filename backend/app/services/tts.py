import asyncio
from collections.abc import Awaitable, Callable

import httpx

from app.core.config import get_settings
from app.core.logging import get_logger
from app.services.audio_transcoder import transcode_to_telnyx


logger = get_logger()
AudioSink = Callable[[bytes], Awaitable[None]]


class TTSStream:
    def __init__(self, audio_sink: AudioSink | None = None) -> None:
        self._audio_sink = audio_sink
        self._active = False
        self._lock = asyncio.Lock()

    async def send_stream(self, text: str) -> None:
        settings = get_settings()
        if not settings.elevenlabs_api_key or not settings.elevenlabs_voice_id:
            logger.warning("elevenlabs_disabled")
            return
        async with self._lock:
            self._active = True
            try:
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{settings.elevenlabs_voice_id}/stream"
                headers = {
                    "xi-api-key": settings.elevenlabs_api_key,
                    "accept": "audio/mpeg",
                }
                payload = {"text": text, "model_id": "eleven_turbo_v2"}
                audio_buffer = bytearray()
                async with httpx.AsyncClient(timeout=30) as client:
                    async with client.stream("POST", url, headers=headers, json=payload) as response:
                        response.raise_for_status()
                        async for chunk in response.aiter_bytes():
                            audio_buffer.extend(chunk)
                if self._audio_sink:
                    audio_bytes = bytes(audio_buffer)
                    audio_bytes = await transcode_to_telnyx(audio_bytes)
                    chunk_size = 8000
                    for i in range(0, len(audio_bytes), chunk_size):
                        await self._audio_sink(audio_bytes[i : i + chunk_size])
            finally:
                self._active = False

    def flush_stream(self) -> None:
        # Placeholder for barge-in: stop current stream if audio sink supports it
        return

    def is_active(self) -> bool:
        return self._active


async def create_tts_stream(audio_sink: AudioSink | None = None) -> TTSStream:
    return TTSStream(audio_sink=audio_sink)
