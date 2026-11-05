# ADR-0001: One evidence contract for release and incident investigations

- **Status:** Proposed — review before implementation
- **Date:** 2026-11-05
- **Related roadmap:** [#8](https://github.com/Thavarshan/viridian/issues/8)
- **Scope:** Architecture contract, not an implemented feature

## Context

Viridian is an open-source, evidence-first **Software Delivery Intelligence** platform with two complementary workflows:

1. **Release Intelligence:** Before shipping, assess whether issues and PRs have implementation evidence, whether checks are relevant to the release revision, and whether configurable release policies identify blockers.
2. **Incident Intelligence:** After shipping, inspect sanitized error signals, deployment history, and code changes to identify **possible** causes and recommend safe diagnostic steps.

These workflows should not become two unrelated agents or two copies of a GitHub integration. A release finding should eventually help investigate an incident, and a *confirmed* incident should eventually inform future release policies. This requires consistent source identity, timing, uncertainty, and relationships.

The present repository contains the AdonisJS/React shell, a FastAPI `agent` package, development tooling, and tests. It **does not yet implement** the evidence model or either product workflow.

## Decision

### 1. Share evidence and provenance; specialize the investigations

Build a small, typed domain in `apps/agent-api/src/agent`:

```text
Source adapters (GitHub, manual incident intake, later deployments/observability)
              |
              v
    Normalized Evidence + Relationships
              |
        +-----+------+
        |            |
 Release investigation   Incident investigation
        |            |
 Release findings      Diagnostic findings + hypotheses
        +-----+------+
              |
       Shared report references
```

Keep **observation** separate from **interpretation**:

- **Evidence:** what a source actually said or showed, with retrieval provenance.
- **Deterministic finding:** what explicit rules establish from evidence.
- **Hypothesis:** a candidate explanation to investigate, never presented as a verified root cause.
- **Confirmation:** a separately recorded human-verified or independently reproduced conclusion, with its evidence and actor.

An LLM may help identify useful next steps, interpret code, or explain findings. It must not fabricate evidence IDs, silently change source facts, grant itself tool permissions, or turn a hypothesis into a confirmed cause.

### 2. Begin with a minimal source-backed evidence record

Proposed fields (exact Pydantic names/shape can be refined in P1):

| Field | Purpose |
| --- | --- |
| `id` | Stable internal identifier within the investigation or evidence store |
| `kind` | Source type: issue, PR, commit, check, release, deployment, error, log, trace, source-file, test, etc. |
| `provider` | Origin of data: GitHub, manual input, future observability integration |
| `source_id` and `source_url` | Provider-native identity and a user-verifiable link where available |
| `repository_id` / `service_id` | Authorized scope; absent when inapplicable, never guessed |
| `revision_sha` | Immutable code revision if applicable, distinct from a movable branch name |
| `deployment_id` / `environment` | Deployed artifact and environment, if supplied by trusted evidence |
| `occurred_at` | Time the source event occurred (when known) |
| `observed_at` | Time Viridian collected it |
| `content` | Bounded, sanitized normalized fields/excerpt, not arbitrary full raw payloads |
| `collection_status` | `complete`, `partial`, `unavailable`, or `error` |
| `limitations` | Missing pages/permissions, truncation, time skew, stale results, other gaps |

Every relevant source should retain the canonical provider reference and, for code, a **commit-pinned** reference where possible. A branch or tag name by itself is not sufficient for an immutable audit.

Example **illustrative contract**, not current API output:

```json
{
  "id": "ev-001",
  "kind": "deployment",
  "provider": "manual",
  "source_id": "deploy-example-42",
  "source_url": null,
  "repository_id": "owner/repo",
  "service_id": "checkout-api",
  "revision_sha": "0123456789abcdef0123456789abcdef01234567",
  "deployment_id": "deploy-example-42",
  "environment": "production",
  "occurred_at": "2026-11-05T09:00:00Z",
  "observed_at": "2026-11-05T09:12:00Z",
  "content": {"result": "completed"},
  "collection_status": "complete",
  "limitations": []
}
```

The sample is fictional; do not use it as a real deployment.

### 3. Model relationships as evidence, not assumptions

Keep relationships explicit and attributed:

- Issue **mentions / closes / is linked to** PR.
- PR **contains / is represented by** code changes or commits.
- CI check **executed against** a specific revision.
- Deployment **used** a specific artifact/revision in a specific environment.
- Incident **was observed in** a service/environment/time window.
- Incident **may be related to** a deployment or change (a *candidate* relationship).
- A confirmed incident **was attributed to** a change, only after verification.

Relationships need `from`, `to`, `kind`, `source_evidence_ids`, and a `status` such as `observed`, `derived`, `candidate`, `verified`. Preserve contradictory relationship data instead of silently selecting the most convenient interpretation.

**Correlate by deployment identity and immutable revision first.** Time proximity is supporting context, not proof of causality. Git commit time, PR merge time, deployment time, and error occurrence time are different events.

### 4. Give the two workflows different conclusion semantics

**Release requirement assessment:**

- `supported` — examined evidence supports the stated requirement, without claiming universal correctness.
- `partial` — some aspects have support and others do not.
- `contradicted` — positive evidence conflicts with the claim.
- `insufficient_evidence` — available evidence cannot justify a conclusion.
- `not_assessable` — cannot be evaluated with available methods/data.

A *release policy* can independently classify findings as `blocker`, `needs_review`, `warning`, or `informational`. A policy result is not a claim that a deployment is bug-free.

**Incident investigation:**

- `observation` — directly sourced error, event, or metric.
- `diagnostic_finding` — reproducible relation or rule derived from observations.
- `hypothesis` — possible cause, with supporting and contradicting evidence and next tests.
- `confirmed_cause` — requires explicit human confirmation or independently verified reproduction, recorded in the audit trail.
- `unresolved` — insufficient evidence to establish a cause.

Do not offer model-generated numeric confidence percentages as if they were calibrated probabilities. Use explainable evidence strength and limitations until calibrated evaluations exist.

### 5. Use a shared investigation envelope

Each run should eventually record:

- `run_id`, `workspace_id`, `workflow_type` (`release` or `incident`).
- Authorized resource scope and immutable input snapshot.
- `status`, start/finish times, cancellation and failure reasons.
- Retrieved evidence IDs, tool calls, collection warnings.
- Findings with validated source references, unknowns, and proposed next steps.
- Rule/policy version; agent/prompt/model versions **when AI is used**.
- Optional links to earlier runs connected by the **same deployed revision**.

AdonisJS owns users, permissions, repository connections, and browser-facing workflows. Python owns investigation logic. Each service owns its persistence boundary; **do not share ORM tables**.

### 6. Start read-only with safe synthetic inputs

Initial release investigation: public GitHub issue/PR/CI metadata at a pinned target SHA.

Initial incident investigation: **manually submitted sanitized** exception/stack/log excerpt, service/environment, UTC time window, and known deployment revision. No mandatory production agent, telemetry credentials, log ingestion, or arbitrary system shell commands in the first milestone.

Apply data minimization, secrets/PII redaction, bounded excerpts, per-workspace access controls, retention/deletion rules, and prompt-injection protections before adding private repositories or third-party observability.

### 7. Shared acceptance tests

Before declaring the shared evidence contract complete, fixture-based tests must show:

1. One immutable revision can link a release report to a deployment and incident.
2. A moving branch, missing SHA, or missing deployment identity remains explicitly ambiguous.
3. `occurred_at` and `observed_at` retain distinct meanings and timezone-aware timestamps.
4. Missing pages, rate limits, and forbidden resources remain visible in collection results.
5. A GitHub merged PR and green CI do **not** automatically imply a supported requirement.
6. An incident shortly after a deployment does **not** automatically imply that deployment caused it.
7. Invalid citation IDs and cross-workspace evidence references are rejected.
8. A model-generated hypothesis cannot become `confirmed_cause` without recorded verification.
9. Synthetic tests run offline without a GitHub token or paid model.
10. Source/log content cannot instruct the agent to access unauthorized tools or reveal secrets.

## Consequences

**Benefits:** one evidence spine for both workflows; reusable adapters and tests; auditability; future release-to-incident feedback without false certainty.

**Trade-offs:** a little domain-contract design before the first agent demo; provider adapters must supply provenance and completeness; later changes to evidence schemas require versioning.

**Deliberately deferred:** graph databases, vector storage, general-purpose agent frameworks, autonomous remediation, remote code execution, production ingestion, and multi-cloud deployment.

## Proposed implementation sequence

1. **P1:** evidence, revisions/time semantics, relationships, completeness, GitHub adapter, fixture tests.
2. **P2:** deterministic release verification using the shared contract.
3. **P3:** deterministic incident intake, temporal/revision correlation, and hypothesis reports using the same contract.
4. **P4+:** bounded LLM assistance, durable execution, AdonisJS/React UI, secure integrations and cross-run correlation.

Open questions for implementation issues: Does `workspace_id` live directly on every evidence row or only on its parent run? Which evidence excerpts are retained, for how long, and with what deletion guarantees? How are release baseline/version and deployment artifacts identified when GitHub's SHA alone is insufficient? Resolve these with small ADRs and tests, not premature abstraction.
