from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.core.rate_limit import limiter
from app.realtime.socket import socket_app
from app.routers import analytics, auth, businesses, calls, customers, escalation_rules, media, webhooks


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.app_env)
    logger = get_logger()

    app = FastAPI(title=settings.app_name, version="1.0.0")
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
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

    app.mount("/ws/alerts", socket_app)

    logger.info("app_initialized", env=settings.app_env)
    return app


app = create_app()
