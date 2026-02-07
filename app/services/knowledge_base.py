from app.services.openai_client import get_openai_client


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> list[str]:
    if chunk_size <= 0:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = max(0, end - overlap)
    return chunks


async def embed_text(text: str) -> list[float]:
    client = get_openai_client()
    response = await client.embeddings.create(model="text-embedding-3-small", input=text)
    return response.data[0].embedding


async def embed_many(texts: list[str]) -> list[list[float]]:
    client = get_openai_client()
    response = await client.embeddings.create(model="text-embedding-3-small", input=texts)
    return [item.embedding for item in response.data]
