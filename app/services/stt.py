import asyncio
from typing import Any

from app.core.config import get_settings
from app.core.logging import get_logger

try:
    from deepgram import DeepgramClient, LiveOptions, LiveTranscriptionEvents

    HAS_DEEPGRAM = True
except Exception:  # noqa: BLE001
    HAS_DEEPGRAM = False


logger = get_logger()


class STTStream:
    enabled: bool = False

    async def start(self) -> None:
        return

    async def close(self) -> None:
        return

    async def get_next_final(self, timeout: float = 20.0) -> tuple[str, dict[str, Any]] | None:
        return None


class DeepgramSTTStream(STTStream):
    def __init__(self, audio_queue: asyncio.Queue[bytes]) -> None:
        self._audio_queue = audio_queue
        self._transcript_queue: asyncio.Queue[tuple[str, dict[str, Any]]] = asyncio.Queue()
        self._dg_connection = None
        settings = get_settings()
        self.enabled = bool(settings.deepgram_api_key and HAS_DEEPGRAM)

    async def start(self) -> None:
        if not self.enabled:
            logger.warning("deepgram_disabled")
            return
        settings = get_settings()
        client = DeepgramClient(settings.deepgram_api_key)
        self._dg_connection = client.listen.asyncwebsocket.v("1")
        options = LiveOptions(
            model="nova-2",
            interim_results=True,
            punctuate=True,
            endpointing=300,
            vad_events=True,
        )
        self._dg_connection.on(LiveTranscriptionEvents.Transcript, self._on_transcript)
        await self._dg_connection.start(options)
        asyncio.create_task(self._send_audio())

    async def _send_audio(self) -> None:
        if not self._dg_connection:
            return
        while True:
            audio = await self._audio_queue.get()
            await self._dg_connection.send(audio)

    async def _on_transcript(self, _, result) -> None:
        text = ""
        metadata: dict[str, Any] = {}
        try:
            text = result.channel.alternatives[0].transcript
            if not text:
                return
            metadata = {
                "sentiment": getattr(result, "sentiment", 0),
                "tone": getattr(result, "tone", []),
            }
        except Exception:  # noqa: BLE001
            return
        await self._transcript_queue.put((text, metadata))

    async def close(self) -> None:
        if self._dg_connection:
            await self._dg_connection.finish()

    async def get_next_final(self, timeout: float = 20.0) -> tuple[str, dict[str, Any]] | None:
        if not self.enabled:
            return None
        try:
            return await asyncio.wait_for(self._transcript_queue.get(), timeout=timeout)
        except asyncio.TimeoutError:
            return None


async def create_stt_stream(audio_queue: asyncio.Queue[bytes]) -> STTStream:
    stream = DeepgramSTTStream(audio_queue)
    await stream.start()
    return stream
