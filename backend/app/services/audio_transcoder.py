import asyncio

from app.core.config import get_settings
from app.core.logging import get_logger


logger = get_logger()


async def transcode_to_telnyx(audio_bytes: bytes) -> bytes:
    settings = get_settings()
    if not settings.ffmpeg_path:
        return audio_bytes

    # Transcode to 8k mu-law WAV for Telnyx media streams.
    cmd = [
        settings.ffmpeg_path,
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        "pipe:0",
        "-f",
        "wav",
        "-ar",
        str(settings.telnyx_sample_rate),
        "-ac",
        "1",
        "-acodec",
        "pcm_mulaw" if settings.telnyx_audio_format == "mulaw" else "pcm_s16le",
        "pipe:1",
    ]
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate(input=audio_bytes)
        if proc.returncode != 0:
            logger.warning("ffmpeg_transcode_failed", error=stderr.decode("utf-8", errors="ignore"))
            return audio_bytes
        return stdout
    except Exception as exc:  # noqa: BLE001
        logger.warning("ffmpeg_transcode_error", error=str(exc))
        return audio_bytes
