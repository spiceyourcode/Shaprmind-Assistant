from datetime import datetime, timedelta

import boto3

from app.core.config import get_settings


def _get_s3_client():
    settings = get_settings()
    if not settings.aws_access_key_id or not settings.aws_secret_access_key:
        return None
    return boto3.client(
        "s3",
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region,
    )


def generate_audio_signed_url(audio_url: str | None, expires_seconds: int = 300) -> str | None:
    if not audio_url:
        return None
    settings = get_settings()
    client = _get_s3_client()
    if not client or not settings.s3_bucket:
        return audio_url
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.s3_bucket, "Key": audio_url},
        ExpiresIn=expires_seconds,
    )


def audio_should_expire(created_at: datetime) -> bool:
    settings = get_settings()
    return created_at + timedelta(days=settings.call_audio_ttl_days) < datetime.utcnow()
