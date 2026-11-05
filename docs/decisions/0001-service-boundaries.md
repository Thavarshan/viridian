# ADR 0001: Keep the existing web and analysis service boundaries

- Status: Accepted
- Date: 2026-11-05

## Context

Viridian already has an AdonisJS + React/Inertia application and a Python
FastAPI service. The product needs authenticated user workflows as well as
evidence analysis and investigation execution. Replacing the web app or
duplicating identity would add cost without a demonstrated need.

## Decision

AdonisJS owns authentication, users and workspaces, authorization, repository
connections, and browser-facing APIs. React/Inertia stays within `apps/web`.
FastAPI owns evidence analysis, investigation workflows, tools, orchestration,
and structured findings. Browser requests to privileged Python routes go through
authenticated server-to-server calls from AdonisJS. The services do not share an
ORM or Python-side user authentication system.

## Consequences

- The internal service contract and authentication must be explicit before
  user-facing investigation calls are implemented.
- The current Python API remains small until evidence and workflow contracts
  justify additional routes.
- Shared evidence concepts are service contracts, not permission to share a
  database model layer.
- Reconsider only when measured requirements demonstrate a better boundary.
