from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.knowledge_base import embed_text


async def rag_query(session: AsyncSession, business_id: str, query: str, limit: int = 5) -> list[str]:
    embedding = await embed_text(query)
    sql = text(
        """
        SELECT content
        FROM knowledge_bases
        WHERE business_id = :business_id
        ORDER BY embedding <-> :embedding
        LIMIT :limit
        """
    )
    result = await session.execute(sql, {"business_id": business_id, "embedding": embedding, "limit": limit})
    return [row[0] for row in result.fetchall()]
