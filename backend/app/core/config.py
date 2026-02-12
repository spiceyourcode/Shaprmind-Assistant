import os
from functools import lru_cache
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the directory of the current file and find the .env file in the backend root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"

# Explicitly load .env with override=True to prioritize it over system environment variables
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    app_env: str = "development"
    app_name: str = "Sharp Mind AI Rep"
    jwt_secret: str

    database_url: str
    supabase_url: str | None = None
    supabase_key: str | None = None
    supabase_publishable_key: str | None = None
    supabase_anon_key: str | None = None

    redis_url: str = "redis://localhost:6379/0"
    upstash_redis_rest_url: str | None = None
    upstash_redis_rest_token: str | None = None

    openai_api_key: str
    openai_primary_model: str = "gpt-4o-mini"
    openai_complex_model: str = "gpt-4o"
    deepgram_api_key: str
    elevenlabs_api_key: str
    elevenlabs_voice_id: str | None = None
    telnyx_api_key: str
    telnyx_webhook_secret: str | None = None
    telnyx_audio_format: str = "mulaw"
    telnyx_sample_rate: int = 8000
    ffmpeg_path: str | None = None

    twilio_sid: str | None = None
    twilio_token: str | None = None
    twilio_from_number: str | None = None

    sendgrid_api_key: str | None = None
    sendgrid_from_email: str | None = None
    webhook_signing_secret: str | None = None
    cors_allow_origins: str | None = None

    fcm_credentials: str | None = None

    s3_bucket: str | None = None
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    aws_region: str = "us-east-1"

    call_audio_ttl_days: int = 30
    rate_limit_per_minute: int = 120
    public_base_url: str | None = None

    @field_validator("openai_api_key", "deepgram_api_key", "elevenlabs_api_key", "telnyx_api_key", mode="before")
    @classmethod
    def strip_keys(cls, v: Any) -> Any:
        if isinstance(v, str):
            return v.strip().strip("'").strip('"')
        return v



@lru_cache
def get_settings() -> Settings:
    return Settings()
