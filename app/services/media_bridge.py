import asyncio
from collections.abc import AsyncIterator


_audio_queues: dict[str, asyncio.Queue[bytes]] = {}


def register_call(call_id: str) -> asyncio.Queue[bytes]:
    queue = asyncio.Queue()
    _audio_queues[call_id] = queue
    return queue


def get_call_queue(call_id: str) -> asyncio.Queue[bytes] | None:
    return _audio_queues.get(call_id)


def unregister_call(call_id: str) -> None:
    _audio_queues.pop(call_id, None)


async def push_audio(call_id: str, data: bytes) -> None:
    queue = _audio_queues.get(call_id)
    if queue:
        await queue.put(data)


async def iter_audio(call_id: str) -> AsyncIterator[bytes]:
    queue = _audio_queues.get(call_id)
    if not queue:
        return
    while True:
        yield await queue.get()
