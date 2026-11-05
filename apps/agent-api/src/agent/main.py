"""FastAPI application entry point."""

import logging
import logging.config
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from agent import __version__
from agent.api.routes import health, v1
from agent.config import Settings, get_settings
from agent.logging_config import JsonFormatter


def configure_logging(level: str) -> None:
    """Configure JSON logs without serializing configuration values."""

    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {"json": {"()": JsonFormatter}},
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "json",
                    "stream": "ext://sys.stdout",
                }
            },
            "root": {"handlers": ["console"], "level": level},
        }
    )


def create_app(settings: Settings | None = None) -> FastAPI:
    """Build an application instance suitable for serving and tests."""

    active_settings = settings or get_settings()
    configure_logging(active_settings.log_level)

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        application.state.ready = True
        try:
            yield
        finally:
            application.state.ready = False

    application = FastAPI(
        title=active_settings.app_name,
        version=__version__,
        description="HTTP foundation for Viridian's agent execution service.",
        lifespan=lifespan,
    )
    application.state.ready = False
    application.include_router(health.router)
    application.include_router(v1.router)

    @application.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logging.getLogger("agent.api").error(
            "Unhandled application exception",
            extra={"error_type": type(exc).__name__},
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )

    return application


app = create_app()


def run() -> None:
    """Start Uvicorn using the validated application host and port."""

    settings = get_settings()
    uvicorn.run(
        app,
        host=settings.host,
        port=settings.port,
        log_config=None,
        access_log=False,
    )
