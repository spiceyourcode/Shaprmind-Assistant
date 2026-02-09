import asyncio
from collections.abc import AsyncIterator


class CallMediaChannels:
    def __init__(self) -> None:
        self.inbound_audio: asyncio.Queue[bytes] = asyncio.Queue()
        self.outbound_audio: asyncio.Queue[bytes] = asyncio.Queue()


_channels: dict[str, CallMediaChannels] = {}


def register_call(call_id: str) -> CallMediaChannels:
    channels = CallMediaChannels()
    _channels[call_id] = channels
    return channels


def get_channels(call_id: str) -> CallMediaChannels | None:
    return _channels.get(call_id)


def unregister_call(call_id: str) -> None:
    _channels.pop(call_id, None)


async def push_audio(call_id: str, data: bytes) -> None:
    channels = _channels.get(call_id)
    if channels:
        await channels.inbound_audio.put(data)


async def push_tts_audio(call_id: str, data: bytes) -> None:
    channels = _channels.get(call_id)
    if channels:
        await channels.outbound_audio.put(data)


async def iter_audio(call_id: str) -> AsyncIterator[bytes]:
    channels = _channels.get(call_id)
    if not channels:
        return
    while True:
        yield await channels.inbound_audio.get()


async def iter_tts_audio(call_id: str) -> AsyncIterator[bytes]:
    channels = _channels.get(call_id)
    if not channels:
        return
    while True:
        yield await channels.outbound_audio.get()
