import json

import pytest

from app.services.action_points import extract_action_points


@pytest.mark.asyncio
async def test_extract_action_points_parses_json(monkeypatch):
    class DummyResponse:
        output_text = json.dumps(
            [
                {"type": "sms", "details": {"to": "+15555555", "body": "Hello"}},
                {"type": "email", "details": {"to": "a@b.com", "subject": "Hi", "body": "Body"}},
            ]
        )

    class DummyClient:
        class responses:
            @staticmethod
            async def create(model, input):
                return DummyResponse()

    monkeypatch.setattr("app.services.action_points.get_openai_client", lambda: DummyClient())
    items = await extract_action_points("summary")
    assert items[0]["type"] == "sms"
