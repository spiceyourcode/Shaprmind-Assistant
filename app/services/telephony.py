from app.core.config import get_settings
from app.core.logging import get_logger

try:
    import telnyx

    HAS_TELNYX = True
except Exception:  # noqa: BLE001
    HAS_TELNYX = False


logger = get_logger()


def _configure_telnyx() -> bool:
    settings = get_settings()
    if not settings.telnyx_api_key or not HAS_TELNYX:
        return False
    telnyx.api_key = settings.telnyx_api_key
    return True


def start_media_stream(call_control_id: str, stream_url: str) -> None:
    if not _configure_telnyx():
        logger.warning("telnyx_disabled")
        return
    try:
        telnyx.CallControl.start_streaming(call_control_id, stream_url=stream_url)
    except Exception as exc:  # noqa: BLE001
        logger.warning("telnyx_start_stream_failed", error=str(exc))


def stop_media_stream(call_control_id: str) -> None:
    if not _configure_telnyx():
        return
    try:
        telnyx.CallControl.stop_streaming(call_control_id)
    except Exception as exc:  # noqa: BLE001
        logger.warning("telnyx_stop_stream_failed", error=str(exc))


def transfer_call_to_human(call_control_id: str, phone_number: str) -> None:
    if not _configure_telnyx():
        return
    try:
        telnyx.CallControl.transfer(call_control_id, to=phone_number)
    except Exception as exc:  # noqa: BLE001
        logger.warning("telnyx_transfer_failed", error=str(exc))
