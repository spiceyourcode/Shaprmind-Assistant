from typing import Any

import firebase_admin
from firebase_admin import credentials, messaging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from twilio.rest import Client as TwilioClient
import httpx

from app.core.config import get_settings
from app.core.logging import get_logger
from app.realtime.socket import emit_escalation


logger = get_logger()
_fcm_initialized = False


def _init_fcm() -> None:
    global _fcm_initialized
    if _fcm_initialized:
        return
    settings = get_settings()
    if settings.fcm_credentials:
        cred = credentials.Certificate(settings.fcm_credentials)
        firebase_admin.initialize_app(cred)
        _fcm_initialized = True


async def notify_escalation(business_id: str, payload: dict) -> None:
    await emit_escalation(business_id, payload)


def notify_user_channels(email: str | None, phone: str | None, push_token: str | None, title: str, body: str) -> None:
    if push_token:
        send_fcm(push_token, title, body)
    if phone:
        send_sms(phone, body)
    if email:
        send_email(email, title, body)


def send_fcm(push_token: str, title: str, body: str) -> None:
    _init_fcm()
    if not push_token or not _fcm_initialized:
        return
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        token=push_token,
    )
    messaging.send(message)


def send_sms(phone: str, body: str) -> None:
    settings = get_settings()
    if not settings.twilio_sid or not settings.twilio_token or not settings.twilio_from_number:
        return
    client = TwilioClient(settings.twilio_sid, settings.twilio_token)
    client.messages.create(from_=settings.twilio_from_number, to=phone, body=body)


def send_email(to_email: str, subject: str, body: str) -> None:
    settings = get_settings()
    if not settings.sendgrid_api_key or not settings.sendgrid_from_email:
        return
    message = Mail(from_email=settings.sendgrid_from_email, to_emails=to_email, subject=subject, html_content=body)
    SendGridAPIClient(settings.sendgrid_api_key).send(message)


async def trigger_action_point(action_type: str, details: dict[str, Any]) -> None:
    logger.info("action_point_triggered", action_type=action_type, details=details)
    if action_type == "sms":
        send_sms(details.get("to"), details.get("body", ""))
    elif action_type == "email":
        send_email(details.get("to"), details.get("subject", "Notification"), details.get("body", ""))
    elif action_type == "webhook":
        url = details.get("url")
        if url:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.post(url, json=details.get("payload", {}))
