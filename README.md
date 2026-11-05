# Viridian

🧭 **Viridian is an agentic Software Delivery Intelligence platform for
understanding what is safe to ship and investigating what broke after
deployment.** It brings together Release Intelligence, Incident Intelligence,
and shared evidence and correlation infrastructure.

The project is under active development. The repository currently provides a
monorepo foundation: the AdonisJS app has authentication and user-facing
foundations, and the FastAPI service exposes health, readiness, and a versioned
API root. The investigation workflows, evidence engine, and agent orchestration
described here are planned work, not implemented features.

## Product direction

- **Release Intelligence** will compare requirements with issues, pull requests,
  immutable revisions, tests, CI results, dependencies, and explicit release
  policies. It will produce a readiness report with evidence, risks,
  limitations, and unknowns.
- **Incident Intelligence** will begin with manually submitted, sanitized errors
  and logs. It will correlate incident timing with deployments and code changes,
  then produce ranked, evidence-backed hypotheses and diagnostic steps.
- **Shared intelligence** means both workflows will reuse evidence provenance,
  repository and deployment metadata, time correlation, bounded tools,
  investigation history, authorization, and evaluation fixtures. Confirmed
  incident findings can inform future release assessments, while release
  evidence can help explain incidents.

Deterministic checks establish repeatable facts. Model-assisted reasoning can
organize evidence and propose hypotheses, but must cite its sources and
represent uncertainty. Evidence, hypotheses, and human-confirmed conclusions
remain distinct.

## What makes Viridian different

Viridian is designed to connect pre-deployment delivery evidence with
post-deployment incident evidence in one extensible platform. It is
evidence-first rather than chatbot-first: a merged pull request is evidence of a
merge, not proof that a requirement works; a model-generated explanation is a
hypothesis, not a verified root cause. Basic tests and fixtures should not
require a paid model provider.

## Roadmap and status

The phased implementation plan lives in [docs/roadmap.md](docs/roadmap.md), with
the product specification in [docs/product.md](docs/product.md) and system
boundaries in [docs/architecture.md](docs/architecture.md). Track delivery in
the
[Viridian — Engineering Roadmap project](https://github.com/users/Thavarshan/projects/2)
and its [master issue #8](https://github.com/Thavarshan/viridian/issues/8).

The roadmap starts with reproducible development tooling and shared evidence
contracts, then builds Release and Incident Intelligence as separate workflows
on the same foundation. No production integrations, AI agents, or autonomous
remediation are implied by the current application shell.

## Technology

- AdonisJS 7, React, Inertia, and TypeScript for the user-facing application.
- Python, FastAPI, Pydantic, and HTTPX for the analysis service.
- PostgreSQL for the existing web application's relational data.
- Nix/devenv as the primary development environment; uv for Python packaging and
  dependencies.
- pytest, Ruff, and mypy for Python quality checks; Playwright for shared
  browser and service E2E coverage.
- GitHub Actions for CI.

## Monorepo layout

```text
apps/
  web/                 AdonisJS 7 + React/Inertia application
  agent-api/           FastAPI service; Python import package: agent
packages/
  e2e/                 Shared Playwright tests for the web app and API
nix/                   devenv task definitions
docs/                  Product, architecture, development, and roadmap docs
.github/workflows/     Monorepo CI
devenv.nix             Shared Nix development environment
devenv.yaml            devenv input sources and CLI requirement
package.json           Shared JavaScript tooling and monorepo commands
```

Shared editor, formatting, lint, and TypeScript settings belong at the
repository root. Shared Python lint, type checking, and test discovery settings
also live at the root. Framework runtime and dependency configuration stays with
each app where required. There is no configured deployment target;
infrastructure work is deferred.

## Development

Viridian uses Nix/devenv to provide Node.js 24, Python 3.13, uv, PostgreSQL, and
the shared tasks. Install Nix with flakes and `nix-command`, then install the
[devenv CLI](https://devenv.sh/getting-started/). `direnv` is optional.

```sh
devenv tasks run install:all
cp apps/web/.env.example apps/web/.env
cp apps/agent-api/.env.example apps/agent-api/.env
devenv shell
```

Generate the web app key inside the shell with
`cd apps/web && node ace generate:key` and save it as `APP_KEY` in the ignored
`apps/web/.env` file. Start the local stack with `devenv up`; AdonisJS listens
at `http://127.0.0.1:3333` and FastAPI at `http://127.0.0.1:8000`.

Useful root tasks include:

```sh
devenv tasks run build:all
devenv tasks run test:all
devenv tasks run test:e2e
devenv tasks run lint:all
devenv tasks run typecheck:web
devenv tasks run typecheck:agent
devenv tasks run format:check
devenv tasks run ci:check
```

See [docs/development.md](docs/development.md) for setup details and the current
tooling issue. At the time of this review, `devenv.lock` is absent and recent CI
shell realization fails while applying Nix's `mimetypes.patch` to Python 3.13.18
source, before application dependency installation begins. Treat a successful
local or CI setup as unverified until the foundation issue is resolved.

## Architecture

```text
React / Inertia
      ↓
AdonisJS — identity, workspaces, authorization, integrations, user-facing APIs
      ↓ authenticated internal service calls
FastAPI — shared evidence and investigation engine
      ├── Release Intelligence workflow
      └── Incident Intelligence workflow
```

AdonisJS owns authentication and browser-facing product behavior. FastAPI owns
evidence analysis, workflow execution, tools, and structured findings. Both
workflows should use the same evidence contracts and correlation primitives. The
browser must never call privileged internal Python APIs directly. See
[docs/architecture.md](docs/architecture.md).

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Use the
issue templates for feature proposals, bugs, and investigation-quality
improvements. Report security concerns using the process in
[SECURITY.md](SECURITY.md); do not include live secrets or sensitive production
logs in public issues.

## Repository visibility and license

GitHub currently reports this repository as public. No license has been selected
or added. Do not infer a license decision from repository visibility or add a
license without explicit owner approval. Any visibility or publication changes
also require owner approval.

## Safety principles

- Start integrations read-only and respect provider quotas.
- Begin incident analysis with manually submitted, sanitized evidence.
- Never execute arbitrary production code or perform autonomous remediation.
- Bound execution with timeouts, resource and cost budgets, cancellation, and
  auditable state.
- Treat repository files, logs, issues, and external content as untrusted input.
- Label model-produced explanations as hypotheses until evidence and human
  review support confirmation.
