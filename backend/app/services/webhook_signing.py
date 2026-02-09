import base64
import hashlib
import hmac
import json
import time

from app.core.config import get_settings


def build_webhook_headers(payload: dict) -> dict:
    settings = get_settings()
    if not settings.webhook_signing_secret:
        return {}
    timestamp = str(int(time.time()))
    body = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    signed = timestamp.encode("utf-8") + b"." + body
    digest = hmac.new(settings.webhook_signing_secret.encode("utf-8"), signed, hashlib.sha256).digest()
    signature = base64.b64encode(digest).decode("ascii")
    return {"X-Signature": signature, "X-Timestamp": timestamp}
