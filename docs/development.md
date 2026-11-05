# Development guide

## Toolchain

Use Nix with flakes and `nix-command`, plus the
[devenv CLI](https://devenv.sh/getting-started/). The declared environment
provides Node.js 24, Python 3.13, uv, PostgreSQL, and project tasks. `direnv` is
optional. Shared JavaScript and Python quality configuration is at the
repository root; app manifests keep framework and runtime dependencies.

```sh
devenv tasks run install:all
cp apps/web/.env.example apps/web/.env
cp apps/agent-api/.env.example apps/agent-api/.env
devenv shell
```

Generate `APP_KEY` from `apps/web` with `node ace generate:key`, then put the
value in the ignored `apps/web/.env`. Start PostgreSQL and both applications
with `devenv up`; web binds to `127.0.0.1:3333`, API to `127.0.0.1:8000`. Local
PostgreSQL is configured for development only. The Python service currently has
no database or model requirement.

## Common checks

Run from the repository root:

```sh
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
devenv tasks run ci:check
```

`packages/e2e` owns Playwright configuration and the browser/API checks across
both services. Install Chromium when needed with
`cd packages/e2e && npx playwright install chromium`. E2E tasks start AdonisJS
on port 3334 and FastAPI on port 8000.

See `devenv.nix` and `nix/tasks.nix` for the current process and task
definitions. Run `devenv update` only when intentionally refreshing Nix inputs;
review and commit lockfile changes with the corresponding tooling issue.

## Known environment and CI blocker

At the 2026-11-05 review, `devenv.lock` was absent from the repository, so
declared Nix inputs were not pinned. Two recent `main` CI runs failed before
installing app dependencies while realizing the Python environment. The logs
show the `python3-3.13.18` derivation applying Nix's `mimetypes.patch` to
`Lib/mimetypes.py`, with `Hunk #1 FAILED at 40`; the Python derivation and then
devenv shell exit unsuccessfully.

This is the observed failure, not a claim that application tests or builds fail.
Fixing the Nix input/patch issue and restoring reproducible clean setup is
tracked in phase P0. Nix is not available in the current review environment, so
local reproduction was not performed. Recheck the linked CI workflow before
treating the blocker as resolved.

## Environment and data safety

- Keep actual secrets in ignored `.env` files; commit only `.env.example` files.
- Never put GitHub, model-provider, or production credentials into fixtures or
  issue bodies.
- Sanitize incident logs and stack traces before sharing them, even in private
  repositories.
- Do not use local sample PostgreSQL credentials outside development.
- Basic tests should use deterministic synthetic fixtures and must not require
  paid model services.
- Do not run production actions or arbitrary code as part of an investigation.

## Contribution flow

Select a scoped issue in the
[Engineering Roadmap](https://github.com/users/Thavarshan/projects/2), check its
dependencies, and open a focused PR that references the issue. Follow
[CONTRIBUTING.md](../CONTRIBUTING.md) and the shared root configuration. See
[AGENTS.md](../AGENTS.md) for product and architecture constraints.
