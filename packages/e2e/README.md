# Shared end-to-end tests

This package owns Playwright and the end-to-end suites for both Viridian
services. The `web-chromium` project runs browser flows against AdonisJS. The
`agent-api` project checks the FastAPI HTTP contract with Playwright's request
fixture, so those checks do not need a browser.

From the repository root, install dependencies and Chromium once:

```sh
devenv tasks run install:e2e
cd packages/e2e
npx playwright install chromium
cd ../..
devenv tasks run test:e2e
```

The suite starts both services automatically. The web app uses the isolated
PostgreSQL database `wire_e2e` and applies pending migrations before serving;
the API starts from `apps/agent-api` and does not use PostgreSQL. In CI, install
Chromium and its Linux dependencies with
`npx playwright install --with-deps chromium`.

The web project retains the existing signup, password reset, profile, and theme
flows. The API project verifies liveness, readiness, the versioned entry point,
and the generated OpenAPI schema.
