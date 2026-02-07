from app.core.config import get_settings
from app.services.openai_client import get_openai_client


def heuristic_is_complex(text: str) -> bool:
    if len(text) > 240:
        return True
    keywords = ["complaint", "refund", "cancel", "legal", "contract", "outage", "chargeback", "dispute"]
    return any(keyword in text.lower() for keyword in keywords)


async def llm_is_complex(text: str) -> bool:
    client = get_openai_client()
    prompt = (
        "Classify if this user request requires a complex model. "
        "Respond with only 'yes' or 'no'.\n\n"
        f"Text:\n{text}"
    )
    response = await client.responses.create(model="gpt-4o-mini", input=prompt)
    return "yes" in response.output_text.lower()


async def choose_model(text: str) -> str:
    settings = get_settings()
    if heuristic_is_complex(text):
        return settings.openai_complex_model
    if await llm_is_complex(text):
        return settings.openai_complex_model
    return settings.openai_primary_model
