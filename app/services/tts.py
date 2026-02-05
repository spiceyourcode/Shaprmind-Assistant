class TTSStream:
    async def send_stream(self, text: str) -> None:
        return

    def flush_stream(self) -> None:
        return

    def is_active(self) -> bool:
        return False


async def create_tts_stream() -> TTSStream:
    return TTSStream()
