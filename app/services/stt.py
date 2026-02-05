from typing import Any


class STTStream:
    async def receive_interim(self) -> str:
        return ""

    async def finalize(self) -> str:
        return ""

    @property
    def metadata(self) -> dict[str, Any]:
        return {}


async def create_stt_stream() -> STTStream:
    return STTStream()
