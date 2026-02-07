# Sharp Mind AI Rep (Backend)

FastAPI backend for an AI-powered call representative. Integrates Telnyx, Deepgram, ElevenLabs, OpenAI, and Supabase Postgres with pgvector, plus Redis and S3.

## Setup

1. Create a virtual environment and install dependencies:
   - `python -m venv .venv`
   - `.\.venv\Scripts\Activate.ps1`
   - `pip install -r requirements.txt`
2. Configure environment variables (see `.env.example`).
3. Run migrations:
   - `alembic upgrade head`
4. Start the API:
   - `uvicorn app.main:app --reload`

## Local Notes

- Supabase Postgres needs the `pgvector` extension enabled.
- Redis is used for call session state.
- S3 is used for audio/transcript storage and signed URLs.
- Telnyx media streaming expects a public `PUBLIC_BASE_URL` and uses `/api/v1/media/telnyx`.
- Ensure ElevenLabs audio format is compatible with Telnyx media (transcode if needed).
- Telnyx webhook requests are verified using `TELNYX_WEBHOOK_SECRET` (Ed25519).
- Audio retention cleanup can be run via `python -m app.scripts.cleanup_runner`.
- Redis session cleanup can be run via `python -m app.scripts.session_cleanup_runner`.
- Optional: set `FFMPEG_PATH` to enable TTS audio transcoding for Telnyx compatibility.

## Deployment

Docker:
- `docker build -t sharpmind-agent .`
- `docker run -p 8000:8000 --env-file .env sharpmind-agent`

Render:
- Use the provided `Dockerfile`.
- Set environment variables in the Render dashboard.
