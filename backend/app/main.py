from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.core.rate_limit import limiter
from app.realtime.socket import socket_app
from app.routers import analytics, auth, businesses, calls, customers, escalation_rules, media, supabase, webhooks

OPENAPI_TAGS = [
    {"name": "auth", "description": "Authentication and token management."},
    {"name": "businesses", "description": "Business profile management."},
    {"name": "escalation-rules", "description": "Escalation rules and policies."},
    {"name": "calls", "description": "Call session management and logs."},
    {"name": "customers", "description": "Customer records and lookup."},
    {"name": "analytics", "description": "Analytics queries and reports."},
    {"name": "webhooks", "description": "Inbound webhook handlers."},
    {"name": "media", "description": "Media uploads and retrieval."},
    {"name": "supabase", "description": "Supabase demo endpoints."},
]


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.app_env)
    logger = get_logger()

    if settings.cors_allow_origins:
        cors_origins = [origin.strip() for origin in settings.cors_allow_origins.split(",") if origin.strip()]
    else:
        cors_origins = [
            "http://localhost:5173",
            "http://localhost:8080",
        ]

    app = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description=(
            "Sharp Mind AI Rep API. Use the Swagger UI to exercise endpoints and "
            "review request/response schemas."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        openapi_tags=OPENAPI_TAGS,
    )
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(businesses.router, prefix="/api/v1/businesses", tags=["businesses"])
    app.include_router(escalation_rules.router, prefix="/api/v1", tags=["escalation-rules"])
    app.include_router(calls.router, prefix="/api/v1", tags=["calls"])
    app.include_router(customers.router, prefix="/api/v1", tags=["customers"])
    app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
    app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["webhooks"])
    app.include_router(media.router, prefix="/api/v1", tags=["media"])
    app.include_router(supabase.router, prefix="/api/v1", tags=["supabase"])

    app.mount("/ws/alerts", socket_app)

    logger.info("app_initialized", env=settings.app_env)
    return app


app = create_app()
