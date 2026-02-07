import uuid
from datetime import datetime

from sqlalchemy import select

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.models import Call, CallMessage, CallStatus, CustomerProfile, MessageSender, User, UserRole
from app.db.session import AsyncSessionLocal
from app.schemas.calls import InboundCallWebhook
from app.services.action_points import extract_action_points
from app.services.escalation import detect_sensitive
from app.services.media_bridge import push_tts_audio, register_call, unregister_call
from app.services.notifications import notify_escalation, notify_user_channels, trigger_action_point
from app.services.model_router import choose_model
from app.services.openai_client import get_openai_client
from app.services.rag import rag_query
from app.services.session_state import get_session, set_session
from app.services.stt import create_stt_stream
from app.services.telephony import start_media_stream, stop_media_stream, transfer_call_to_human
from app.services.tts import create_tts_stream


logger = get_logger()


async def handle_inbound_call(payload: InboundCallWebhook) -> None:
    async with AsyncSessionLocal() as session:
        call_id = uuid.uuid4()
        channels = register_call(str(call_id))
        stt = await create_stt_stream(channels.inbound_audio)
        tts = await create_tts_stream(lambda chunk: push_tts_audio(str(call_id), chunk))

        business_id = payload.business_id
        if not business_id:
            logger.warning("missing_business_id", caller_number=payload.caller_number)
            return

        profile_result = await session.execute(
            select(CustomerProfile).where(
                CustomerProfile.business_id == business_id,
                CustomerProfile.caller_number == payload.caller_number,
            )
        )
        profile = profile_result.scalar_one_or_none()

        call = Call(
            id=call_id,
            business_id=business_id,
            caller_number=payload.caller_number,
            started_at=datetime.utcnow(),
            status=CallStatus.completed,
        )
        session.add(call)
        await session.commit()

        greeting = _personalize_greeting(profile)
        await tts.send_stream(greeting)

        await set_session(str(call_id), {"status": "active", "caller": payload.caller_number})

        settings = get_settings()
        try:
            if payload.call_control_id and settings.public_base_url:
                stream_url = f"{settings.public_base_url}/api/v1/media/telnyx?call_id={call_id}"
                start_media_stream(payload.call_control_id, stream_url)

            # Live loop: wait for STT final transcripts (driven by Telnyx media stream).
            if stt.enabled:
                interim_text = ""
                prefetched: list[str] = []
                is_speaking = False
                for _ in range(200):
                    session_state = await get_session(str(call_id))
                    if session_state.get("takeover_requested") and payload.call_control_id:
                        phone = session_state.get("takeover_phone")
                        user_id = session_state.get("takeover_user_id")
                        if phone:
                            transfer_call_to_human(payload.call_control_id, phone)
                            call.status = CallStatus.transferred
                            call.escalated_to_user_id = user_id
                            await session.commit()
                            break
                    event = await stt.get_next_event(timeout=25)
                    if not event:
                        break
                    event_type = event.get("type")
                    if event_type == "vad_start":
                        is_speaking = True
                        if tts.is_active():
                            tts.flush_stream()
                        continue
                    if event_type == "vad_end":
                        is_speaking = False
                        continue
                    if event_type != "transcript":
                        continue
                    is_final = event.get("is_final", False)
                    text = event.get("text", "")
                    metadata = event.get("metadata", {})
                    if not is_final:
                        interim_text = text
                        if tts.is_active() and interim_text:
                            tts.flush_stream()
                        if len(interim_text) > 50 and not prefetched:
                            prefetched = await rag_query(session, str(call.business_id), interim_text)
                        continue
                    user_text = text or interim_text
                    if not user_text:
                        continue
                    if tts.is_active():
                        tts.flush_stream()
                    if is_speaking or user_text:
                        await _process_turn(session, call, user_text, metadata=metadata, prefetched=prefetched)
                    interim_text = ""
                    prefetched = []
            else:
                logger.warning("stt_not_enabled", call_id=str(call_id))

            call.ended_at = datetime.utcnow()
            call.duration_seconds = int((call.ended_at - call.started_at).total_seconds())
            await session.commit()

            await _post_call_summarize(session, call)
        finally:
            await stt.close()
            unregister_call(str(call_id))
            if payload.call_control_id:
                stop_media_stream(payload.call_control_id)


def _personalize_greeting(profile: CustomerProfile | None) -> str:
    if profile and profile.preferences and profile.preferences.get("greeting") == "formal":
        return f"Hello {profile.name or ''}. How may I assist you today?"
    return "Hi there! Thanks for calling. How can I help you today?"


async def _process_turn(
    session,
    call: Call,
    user_text: str,
    metadata: dict,
    prefetched: list[str] | None = None,
) -> None:
    rag_snippets = prefetched or await rag_query(session, str(call.business_id), user_text)
    model = await choose_model(user_text)
    response = await _generate_response(model, user_text, rag_snippets)

    session.add(
        CallMessage(
            call_id=call.id,
            sender=MessageSender.customer,
            content=user_text,
            sentiment_score=metadata.get("sentiment"),
        )
    )
    session.add(CallMessage(call_id=call.id, sender=MessageSender.ai, content=response))
    await session.commit()

    escalated, reason, score = await detect_sensitive(session, str(call.business_id), f"{user_text} {response}", metadata)
    if escalated:
        call.status = CallStatus.escalated
        staff_result = await session.execute(
            select(User).where(User.business_id == call.business_id, User.role == UserRole.staff)
        )
        staff = staff_result.scalars().first()
        if staff:
            call.escalated_to_user_id = staff.id
        await session.commit()
        await notify_escalation(str(call.business_id), {"call_id": str(call.id), "reason": reason, "score": score})
        result = await session.execute(select(User).where(User.business_id == call.business_id))
        for user in result.scalars().all():
            notify_user_channels(
                user.email,
                user.phone,
                user.push_token,
                "Call escalation",
                f"Call {call.id} escalated: {reason}",
            )


async def _generate_response(model: str, user_text: str, rag_snippets: list[str]) -> str:
    client = get_openai_client()
    context = "\n".join(rag_snippets)
    prompt = f"Context:\n{context}\n\nUser:\n{user_text}\n\nAssistant:"
    response = await client.responses.create(model=model, input=prompt)
    return response.output_text


async def _post_call_summarize(session, call: Call) -> None:
    messages = await session.execute(select(CallMessage).where(CallMessage.call_id == call.id))
    transcript = "\n".join([f"{m.sender}: {m.content}" for m in messages.scalars().all()])
    client = get_openai_client()
    summary = await client.responses.create(
        model="gpt-4o-mini",
        input=f"Summarize the call and list action points as JSON.\n\nTranscript:\n{transcript}",
    )
    call.summary = summary.output_text
    action_points = await extract_action_points(summary.output_text)
    call.action_points = {"items": action_points}
    await session.commit()

    for item in action_points:
        await trigger_action_point(item.get("type", ""), item.get("details", {}))
