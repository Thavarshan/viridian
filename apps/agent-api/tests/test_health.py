"""Tests for the service health and API foundation."""

from collections.abc import AsyncIterator

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from agent.config import Settings
from agent.main import create_app


@pytest.fixture
def app() -> FastAPI:
    settings = Settings(environment="test", log_level="ERROR")
    return create_app(settings)


@pytest.fixture
async def client(app: FastAPI) -> AsyncIterator[AsyncClient]:
    async with app.router.lifespan_context(app):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as test_client:
            yield test_client


async def test_health_reports_live_process(client: AsyncClient) -> None:
    response = await client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_readiness_tracks_application_lifecycle(
    app: FastAPI, client: AsyncClient
) -> None:
    assert (await client.get("/ready")).json() == {"status": "ready"}
    app.state.ready = False
    response = await client.get("/ready")

    assert response.status_code == 503
    assert response.json() == {"detail": "Application is not ready"}


async def test_versioned_router_and_openapi_are_available(
    client: AsyncClient,
) -> None:
    info = await client.get("/v1/")
    schema = await client.get("/openapi.json")
    docs = await client.get("/docs")

    assert info.status_code == 200
    assert info.json() == {"service": "Viridian Agent API", "version": "v1"}
    assert schema.status_code == 200
    assert "/health" in schema.json()["paths"]
    assert "/ready" in schema.json()["paths"]
    assert docs.status_code == 200
