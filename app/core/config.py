from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
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
    deepgram_api_key: str
    elevenlabs_api_key: str
    elevenlabs_voice_id: str | None = None
    telnyx_api_key: str
    telnyx_webhook_secret: str | None = None

    twilio_sid: str | None = None
    twilio_token: str | None = None
    twilio_from_number: str | None = None

    sendgrid_api_key: str | None = None
    sendgrid_from_email: str | None = None

    fcm_credentials: str | None = None

    s3_bucket: str | None = None
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    aws_region: str = "us-east-1"

    call_audio_ttl_days: int = 30
    rate_limit_per_minute: int = 120
    public_base_url: str | None = None

    class Config:
        env_file = ".env"
        env_prefix = ""
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
