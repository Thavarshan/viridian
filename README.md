# Viridian

Viridian is a developer platform for evidence-based GitHub issue verification,
software auditing, and release readiness analysis. This repository keeps the
existing AdonisJS application and the new Python service independently managed
under one Git root.

## Repository layout

```text
apps/
  web/                 Existing AdonisJS 7 + Inertia React application
  agent-api/            FastAPI service (Python package: agent)
packages/
  e2e/                 Shared Playwright suites for web and agent-api
deploy/
  web/                 Web container build configuration
  oracle/              Oracle host and production deployment files
nix/
  tasks.nix             devenv task definitions
docs/
  architecture.md      Service boundaries and ownership
.github/workflows/
  ci.yml                CI, image publishing, and guarded manual deployment
devenv.nix              Shared Nix development environment and build output
devenv.yaml             devenv input sources and CLI version requirement
package.json            Shared JavaScript tooling and monorepo commands
tsconfig.base.json       Shared strict TypeScript compiler options
ruff.toml               Shared Python lint settings
mypy.ini                 Shared Python type checking settings
pytest.ini               Shared Python test discovery settings
```

See [docs/architecture.md](docs/architecture.md) for ownership and service
boundaries. Apps and the E2E package keep independent runtime dependency
lockfiles. Shared JavaScript tooling, editor settings, formatting rules, lint
rules, and strict TypeScript options live at the repository root. Python lint,
type, and test settings also live at the root. No JavaScript workspace manager
is used.

## Prerequisites

- macOS Apple Silicon (`aarch64-darwin`) or Linux (`x86_64-linux`)
- Nix with flakes and `nix-command` enabled, plus the
  [devenv CLI](https://devenv.sh/getting-started/)
- Node.js 24 through devenv, npm, Python 3.13, and uv (provided by devenv)
- direnv is optional; `.envrc` enables automatic devenv activation if installed

Install Nix and devenv using the official devenv instructions. Nix is the
toolchain source; `devenv.lock` pins the environment inputs. The project uses
devenv's native process manager, tasks, PostgreSQL service, and Python package
output without a direct `flake.nix`. Nix input sources are declared in
`devenv.yaml`. The first devenv invocation creates `devenv.lock`; commit that
file so later installs use the same input revisions. Run `devenv update` only
when intentionally refreshing those revisions.

## First setup

```sh
devenv tasks run install:all
cp apps/web/.env.example apps/web/.env
cp apps/agent-api/.env.example apps/agent-api/.env
devenv shell
```

Inside the devenv shell, run `cd apps/web && node ace generate:key` and save the
generated value as `APP_KEY` in `apps/web/.env`.

The first `devenv` command resolves the declared inputs and creates
`devenv.lock` if it is absent. Review and commit the generated lockfile before
sharing the setup with CI or other developers.

The AdonisJS application uses PostgreSQL. The devenv PostgreSQL service creates
the local `wire`, `wire_test`, and `wire_e2e` databases for the existing
application tests. The agent API does not depend on the database. Local
PostgreSQL uses loopback-only trust authentication; the sample app database
password is not a production credential.

If direnv is installed, approve the environment once with `direnv allow`.

## Run both applications

From the repository root:

```sh
devenv shell
devenv up
```

The native process manager starts PostgreSQL, runs AdonisJS migrations, then
starts AdonisJS with HMR and FastAPI with source watching. Stop the foreground
stack with Ctrl-C. The processes bind to loopback: AdonisJS at
`http://127.0.0.1:3333` and FastAPI at `http://127.0.0.1:8000`. FastAPI serves
`/health`, `/ready`, `/v1/`, `/docs`, and `/openapi.json`.

To start a single process, use `devenv up agent-api` or `devenv up web`.
Starting only `agent-api` does not start PostgreSQL.

## Build and validation tasks

Install dependencies once after checkout, then run tasks from the repository
root:

```sh
devenv tasks run install:all
devenv tasks run build:web
devenv tasks run build:agent
devenv tasks run build:all
devenv tasks run test:web
devenv tasks run test:agent
devenv tasks run test:e2e
devenv tasks run test:all
devenv tasks run lint:all
devenv tasks run typecheck:web
devenv tasks run typecheck:agent
devenv tasks run typecheck:e2e
devenv tasks run format:check
devenv tasks run audit:tools
devenv tasks run audit:web
devenv tasks run audit:e2e
devenv tasks run ci:check
```

`packages/e2e` owns the Playwright configuration and tests for both services.
`test:e2e` starts AdonisJS on port 3334 and FastAPI on port 8000, then runs the
existing browser flows and API HTTP checks. Install Chromium on a new machine
with `cd packages/e2e && npx playwright install chromium`. CI installs Chromium
and its Linux system dependencies.

`build:web` runs the existing production `npm run build`; the output is
`apps/web/build/`. `build:agent` creates `apps/agent-api/dist/` source and wheel
artifacts, then installs the wheel into a clean temporary environment and
imports `agent.main:app`. `devenv build outputs.agent-api` additionally builds
the Python package as a Nix output from `pyproject.toml` and `uv.lock`.

The web build is a genuine, lockfile-driven native npm build. It is not a
sandboxed Nix derivation. The Python service has both a native uv package build
and a devenv Nix package output.

## Configuration and security

- Keep real secrets in ignored `.env` files; commit only `.env.example` files.
- AdonisJS owns authentication and authorization. Python has no user auth system
  or privileged routes.
- AdonisJS, Inertia, and Playwright share root lint, formatting, and TypeScript
  settings. The Playwright package owns browser tests for both services.
- Python dependencies and build metadata stay in
  `apps/agent-api/pyproject.toml`; shared Ruff, mypy, and pytest settings stay
  at the repository root.
- Python binds to `127.0.0.1` by default and does not require credentials,
  PostgreSQL, Redis, or an LLM key.
- Never reuse the sample development database values in production.

## CI

GitHub Actions installs Nix and devenv, runs the shared devenv tasks, validates
the Nix Python output, and runs the PostgreSQL-backed AdonisJS tests, shared
Playwright suites, formatting, lint, type checks, audit, and production build.
The web Dockerfile and Oracle deployment bundle live under `deploy/`. The
existing workflow publishes the web image from `main` after checks pass.
Deployment still requires a manually dispatched workflow with its deploy input
enabled and the existing protected production environment; this setup does not
deploy anything.

## Troubleshooting

- If devenv reports a version mismatch, update the CLI to meet the constraint in
  `devenv.yaml`.
- If Nix cannot fetch GitHub inputs, configure a GitHub access token in the
  local Nix configuration; do not put tokens in repository files.
- If AdonisJS cannot connect to PostgreSQL, start `devenv up` or run a test
  task, and confirm port 5432 is free.
- If the web app rejects `APP_KEY`, generate one with `node ace generate:key`
  from `apps/web/` and store it in the ignored `.env` file.
- If Playwright cannot find Chromium locally, install the browser from
  `packages/e2e/` as shown above.
- Shared JavaScript tooling dependencies are in the root `package.json` and
  `package-lock.json`. App dependencies remain in each app's package manifest
  and lockfile. Update the matching lockfile when dependencies change.
- Shared Python quality settings are in root `ruff.toml`, `mypy.ini`, and
  `pytest.ini`; Python dependencies and packaging metadata remain in
  `apps/agent-api/pyproject.toml` and `uv.lock`.
- Update Nix inputs with `devenv update`.

## Next implementation steps

1. Define the internal AdonisJS-to-FastAPI contract and service authentication.
2. Add issue investigation domain models and evidence schemas in Python.
3. Add GitHub client integration and audit workflows after those boundaries are
   reviewed.
