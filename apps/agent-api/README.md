# Viridian Agent API

The independently managed FastAPI service. It currently provides liveness,
readiness, and a versioned API entry point; agent workflows and integrations
will be added in later phases.

## Local setup

From the repository root, activate devenv and install dependencies:

```sh
devenv shell
uv sync --locked
```

Or use uv directly from this directory:

```sh
uv sync --locked
uv run agent-api
```

The service does not require PostgreSQL, Redis, an LLM key, or authentication.
Its default bind address is loopback. Copy `.env.example` to `.env` to adjust
`AGENT_*` settings. The devenv process manager watches `src/` and restarts the
server when Python files change.

Python dependencies and package metadata live in this app's `pyproject.toml`.
Shared Ruff, mypy, and pytest configuration lives at the repository root.

## Checks and package build

```sh
uv run pytest
uv run ruff check src tests
uv run ruff format --check src tests
uv run mypy src
uv build --sdist --wheel
```

The wheel and source distribution are written to `dist/`. The import package is
`agent` (`agent.main:app`); the distribution name is `agent-api`.
