from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.knowledge_base import embed_text


async def rag_query(
    session: AsyncSession,
    business_id: str,
    query: str,
    limit: int = 5,
    category: str | None = None,
) -> list[str]:
    embedding = await embed_text(query)
    if category:
        sql = text(
            """
            SELECT content
            FROM knowledge_bases
            WHERE business_id = :business_id AND category = :category
            ORDER BY embedding <-> :embedding
            LIMIT :limit
            """
        )
        params = {"business_id": business_id, "category": category, "embedding": embedding, "limit": limit}
    else:
        sql = text(
            """
            SELECT content
            FROM knowledge_bases
            WHERE business_id = :business_id
            ORDER BY embedding <-> :embedding
            LIMIT :limit
            """
        )
        params = {"business_id": business_id, "embedding": embedding, "limit": limit}
    result = await session.execute(sql, params)
    return [row[0] for row in result.fetchall()]
