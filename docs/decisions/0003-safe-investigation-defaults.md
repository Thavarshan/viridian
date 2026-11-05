# ADR 0003: Start investigations with read-only, bounded, sanitized evidence

- Status: Accepted
- Date: 2026-11-05

## Context

Viridian may inspect private repositories and sensitive production logs. Agent
tooling and untrusted text introduce risks including secret exposure, prompt
injection, uncontrolled costs, and unsafe production changes.

## Decision

Initial integrations are read-only. Incident Intelligence begins with manually
submitted sanitized evidence. Tools are allow-listed, time-limited, budgeted,
cancellable, and auditable. No arbitrary production code execution or autonomous
remediation is allowed. Model outputs remain hypotheses until supported and
explicitly confirmed.

## Consequences

- Evidence fixtures must avoid real secrets and support offline testing.
- Provider credentials require least privilege, secure storage, revocation, and
  tenant isolation.
- Any future write action requires a separate product decision and explicit user
  authorization.
- Reports expose uncertainty and missing evidence instead of filling gaps with
  model guesses.
