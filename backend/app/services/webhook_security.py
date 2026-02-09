import base64
import time

from nacl.signing import VerifyKey

from app.core.config import get_settings
from app.core.logging import get_logger


logger = get_logger()


def verify_telnyx_signature(raw_body: bytes, headers: dict, tolerance_seconds: int = 300) -> bool:
    settings = get_settings()
    if not settings.telnyx_webhook_secret:
        logger.warning("telnyx_webhook_secret_missing")
        return True

    signature = headers.get("telnyx-signature-ed25519")
    timestamp = headers.get("telnyx-timestamp")
    if not signature or not timestamp:
        return False

    try:
        ts_int = int(timestamp)
        if abs(int(time.time()) - ts_int) > tolerance_seconds:
            return False
        signed_payload = f"{timestamp}|".encode("utf-8") + raw_body
        sig_bytes = base64.b64decode(signature)
        key_bytes = base64.b64decode(settings.telnyx_webhook_secret)
        verify_key = VerifyKey(key_bytes)
        verify_key.verify(signed_payload, sig_bytes)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.warning("telnyx_signature_failed", error=str(exc))
        return False
