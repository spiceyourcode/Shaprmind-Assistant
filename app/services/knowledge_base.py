from app.services.openai_client import get_openai_client


async def embed_text(text: str) -> list[float]:
    client = get_openai_client()
    response = await client.embeddings.create(model="text-embedding-3-small", input=text)
    return response.data[0].embedding
