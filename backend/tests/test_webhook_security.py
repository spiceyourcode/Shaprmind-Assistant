import base64
import time

from nacl.signing import SigningKey

from app.services.webhook_security import verify_telnyx_signature


def test_telnyx_signature_verification_roundtrip(monkeypatch):
    signing_key = SigningKey.generate()
    verify_key = signing_key.verify_key
    secret = base64.b64encode(verify_key.encode()).decode("ascii")

    class DummySettings:
        telnyx_webhook_secret = secret

    monkeypatch.setattr("app.services.webhook_security.get_settings", lambda: DummySettings())

    body = b'{"hello":"world"}'
    timestamp = str(int(time.time()))
    signed_payload = f"{timestamp}|".encode("utf-8") + body
    signature = base64.b64encode(signing_key.sign(signed_payload).signature).decode("ascii")

    headers = {"telnyx-signature-ed25519": signature, "telnyx-timestamp": timestamp}
    assert verify_telnyx_signature(body, headers)
