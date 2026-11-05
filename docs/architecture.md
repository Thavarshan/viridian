# Architecture

The repository has one browser-facing AdonisJS application and one independent
FastAPI service.

```text
React / Inertia → AdonisJS → FastAPI → future agent execution
```

AdonisJS remains the owner of authentication, users, workspaces, authorization,
GitHub connection management, browser APIs, and the current frontend. Python
will own agent orchestration, investigation workflows, tools, evidence analysis,
and structured findings. Python does not implement user authentication and does
not access the AdonisJS database directly. Cross service API integration is a
later phase.

The `agent-api` application currently exposes only liveness, readiness, and a
versioned API root. Readiness reflects completion of the FastAPI lifespan; the
service has no required database, Redis, or model dependency yet.

End-to-end checks live in `packages/e2e`, where one Playwright setup starts and
tests both services. Hosting and deployment infrastructure is deferred until a
target is selected.

The repository root owns shared editor, formatting, lint, and TypeScript
settings, plus shared Python lint, type checking, and test discovery settings.
App directories retain framework configuration, runtime environment examples,
dependency manifests, and build metadata required by each framework.
