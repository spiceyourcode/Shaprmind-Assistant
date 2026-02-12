from openai import AsyncOpenAI

from app.core.config import get_settings


_client: AsyncOpenAI | None = None


def get_openai_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        settings = get_settings()
        api_key = settings.openai_api_key.strip()
        _client = AsyncOpenAI(api_key=api_key)
    return _client
