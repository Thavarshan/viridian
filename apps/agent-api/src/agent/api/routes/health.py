"""Liveness and readiness endpoints."""

from typing import Literal

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: Literal["ok"]


class ReadinessResponse(BaseModel):
    status: Literal["ready"]


router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Report that the HTTP process is alive."""

    return HealthResponse(status="ok")


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    responses={503: {"description": "Application startup is incomplete"}},
)
async def readiness(request: Request) -> ReadinessResponse:
    """Report readiness after the application lifespan has initialized."""

    if not getattr(request.app.state, "ready", False):
        raise HTTPException(status_code=503, detail="Application is not ready")
    return ReadinessResponse(status="ready")
