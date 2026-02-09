from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import EscalationRule
from app.services.openai_client import get_openai_client


async def detect_sensitive(
    session: AsyncSession,
    business_id: str,
    text: str,
    metadata: dict | None,
) -> tuple[bool, str, int]:
    rules_result = await session.execute(
        select(EscalationRule).where(EscalationRule.business_id == business_id)
    )
    rules = rules_result.scalars().all()

    score = 0
    reason = ""
    lower = text.lower()
    for rule in rules:
        if any(keyword in lower for keyword in rule.keyword_or_phrase):
            score += rule.priority
            reason = reason or "Keyword rule match"

    if metadata:
        sentiment = metadata.get("sentiment", 0)
        tone = " ".join(metadata.get("tone", []))
        if sentiment < -0.5 or "aggressive" in tone:
            score += 5
            reason = reason or "Frustration detected"

    if score >= 3:
        client = get_openai_client()
        prompt = f"Determine if this is sensitive or requires escalation:\n{text}"
        response = await client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
        )
        content = response.output_text.lower()
        if "yes" in content or "sensitive" in content:
            score += 5
            reason = reason or "LLM sensitive classification"

    return score > 5, reason, score
