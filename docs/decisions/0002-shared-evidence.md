# ADR 0002: Use shared, provenance-bearing evidence for both workflows

- Status: Accepted
- Date: 2026-11-05

## Context

Release readiness and incident investigation need overlapping repository,
deployment, change, and CI evidence. Building unrelated evidence stores would
make future correlation fragile and duplicate provider integration work.

## Decision

Define a shared evidence contract before implementing either complete workflow.
Evidence records source and scope, provenance, immutable revision references
when applicable, event time, and observation time. Deterministic findings,
model-generated hypotheses, and human-confirmed conclusions are separate data.
Missing or incomplete evidence is explicit.

## Consequences

- P1 evidence contracts unblock Release and Incident Intelligence slices.
- Source adapters can be reused while workflow-specific rules remain
  specialized.
- Correlation is traceable to source evidence and time, not hidden model memory.
- Schema additions must preserve provenance and distinguish observed facts from
  conclusions.
