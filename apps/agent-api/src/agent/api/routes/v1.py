"""Versioned API entry point."""

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from agent.config import Settings, get_settings


class ApiInfoResponse(BaseModel):
    service: str
    version: str


router = APIRouter(prefix="/v1", tags=["v1"])


@router.get("/", response_model=ApiInfoResponse)
async def api_info(
    settings: Annotated[Settings, Depends(get_settings)],
) -> ApiInfoResponse:
    """Expose the current API version without requiring authentication."""

    return ApiInfoResponse(service=settings.app_name, version="v1")
