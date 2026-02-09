import json

from app.core.logging import get_logger
from app.services.openai_client import get_openai_client


logger = get_logger()


async def extract_action_points(summary_text: str) -> list[dict]:
    client = get_openai_client()
    prompt = (
        "Extract action points as JSON array. "
        "Each item must include: type (sms|email|webhook), details. "
        "Respond with JSON only."
    )
    response = await client.responses.create(
        model="gpt-4o-mini",
        input=f"{prompt}\n\nSummary:\n{summary_text}",
    )
    try:
        parsed = json.loads(response.output_text)
        if isinstance(parsed, list):
            return parsed
    except Exception as exc:  # noqa: BLE001
        logger.warning("action_points_parse_failed", error=str(exc))
    return []
