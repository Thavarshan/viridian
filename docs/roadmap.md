# Viridian implementation roadmap

This is the authoritative product implementation plan. The older release-auditor
plan is archived at
[docs/archive/legacy-release-auditor-plan.md](archive/legacy-release-auditor-plan.md)
for historical research only. GitHub delivery tracking lives in the
[Engineering Roadmap project](https://github.com/users/Thavarshan/projects/2),
with [issue #8](https://github.com/Thavarshan/viridian/issues/8) as the master
tracker and phase milestones/issues linked from it.

Viridian is one agentic Software Delivery Intelligence platform with Release
Intelligence and Incident Intelligence on shared evidence infrastructure. The
repository is currently a monorepo foundation. No application feature work is
represented as complete unless code and tests demonstrate it.

## Delivery sequence

| Phase | Milestone                         | Tracker                                                 | Outcome                                                                                                                             |
| ----- | --------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| P0    | Foundation & Open Source          | [#9](https://github.com/Thavarshan/viridian/issues/9)   | Reproducible development, reliable CI, accurate project documentation, and considered contribution/security/licensing readiness.    |
| P1    | Evidence Infrastructure           | [#10](https://github.com/Thavarshan/viridian/issues/10) | Provenance-aware evidence contracts, immutable revisions and temporal data, reliable GitHub collection, and deterministic fixtures. |
| P2    | Release Intelligence MVP          | [#11](https://github.com/Thavarshan/viridian/issues/11) | A deterministic readiness investigation over requirements, source changes, and test/CI evidence.                                    |
| P3    | Incident Intelligence MVP         | [#12](https://github.com/Thavarshan/viridian/issues/12) | A useful incident investigation from sanitized manual evidence, correlated to deployments and code.                                 |
| P4    | Agent Orchestration & Evaluation  | [#13](https://github.com/Thavarshan/viridian/issues/13) | Bounded optional model reasoning and measurable quality for both workflows.                                                         |
| P5    | Application Integration & UX      | [#15](https://github.com/Thavarshan/viridian/issues/15) | Durable, authorized investigations surfaced through the existing AdonisJS app.                                                      |
| P6    | Secure Integrations & Correlation | [#16](https://github.com/Thavarshan/viridian/issues/16) | Least-privilege provider integrations and traceable cross-workflow evidence.                                                        |
| P7    | Open Source Beta                  | [#17](https://github.com/Thavarshan/viridian/issues/17) | Reviewed publication readiness, contributor experience, packaging, and validated beta release.                                      |

Phases P2 and P3 may progress in parallel after the shared P1 evidence contracts
are stable. P4 should consume deterministic reports from both. Cross-workflow
learning depends on both workflows and an explicit confirmation model.

## P0 — Foundation & Open Source

**Goal:** make the current repository reliable to develop and accurately
documented before adding product behavior.

- Reproduce and resolve the Nix shell realization failure. Recent CI logs show
  Python 3.13.18 derivation failure while applying `mimetypes.patch`
  (`Hunk #1 FAILED at 40`); the shell fails before dependency installation.
- Pin devenv inputs with a reviewed `devenv.lock`; validate clean setup and task
  execution in CI.
- Restore or define a dependable build, test, formatting, type, and audit path.
- Align README, agent instructions, architecture and product docs with the
  hybrid direction and current implementation status.
- Add contribution, issue, pull request, and security-reporting conventions.
  Select a Code of Conduct/reporting contact deliberately.
- Evaluate MIT, Apache-2.0, and alternatives, including dependency compatibility
  and patent implications. Do not apply a license until the owner approves.
- Review outstanding dependency upgrade PRs instead of auto-merging major or
  stale updates.
- Define initial synthetic evidence and report fixtures that require no paid AI
  service.

**Exit criteria:** a clean, pinned environment can run documented checks; CI is
actionable; docs state what exists; security/contribution paths are clear;
license and publication decisions are recorded as owner decisions rather than
assumed.

## P1 — Evidence Infrastructure

**Goal:** define shared source-backed contracts before specialized workflows
depend on them.

- Typed evidence schema with source identity, scope, references, and provenance.
- Immutable Git revisions and separate event-time and observation-time fields.
- Evidence quality/completeness and unknown representation.
- Read-only GitHub API client with pagination, retries, rate-limit behavior, and
  least privilege.
- Relationships among issues, pull requests, commits, and workflow runs.
- Deployment metadata model and shared evidence querying.
- Deterministic fixtures covering incomplete sources and provider failures.

**Exit criteria:** release and incident workflows can consume the same validated
evidence contract; fixture tests demonstrate provenance, revision pinning,
temporal semantics, and partial collection.

## P2 — Release Intelligence MVP

**Goal:** produce a useful deterministic readiness report for a fixed target
revision.

- Normalize issue requirements and acceptance criteria.
- Verify issue-to-PR relationships and target-revision inclusion.
- Summarize changed files and dependency/documentation changes.
- Collect relevant tests and CI evidence without treating a green run as proof
  of correctness.
- Compare a release baseline with the target revision.
- Add configurable deterministic readiness rules and structured findings.
- Evaluate with synthetic repositories and known expected reports.

**Exit criteria:** a fixture-backed report for a pinned revision links each
conclusion to evidence and identifies missing evidence, policy blockers,
limitations, and unknowns.

## P3 — Incident Intelligence MVP

**Goal:** investigate a sanitized manual incident and explain plausible
code/deployment relationships.

- Define incident intake and sanitize sensitive values.
- Normalize exception and stack trace evidence.
- Model deployment timelines and correlate commits/PRs in the incident window.
- Discover and rank candidate changes with deterministic rules.
- Produce structured findings, hypotheses, and safe diagnostic recommendations.
- Evaluate against synthetic incidents with known causes and ambiguous cases.

**Exit criteria:** a user can submit sanitized fixtures and receive a cited
report that separates facts, hypotheses, confidence, and unknowns; no live
production access is required.

## P4 — Agent Orchestration & Evaluation

**Goal:** add optional model-assisted reasoning only after evidence collection
and deterministic outcomes are testable.

- Small allow-listed tool registry and bounded orchestration lifecycle.
- Provider abstraction and structured tool-call handling.
- Deterministic result validation, citation checks, injection defenses, and
  abstention.
- Explicit time, token, and cost budgets, timeout, cancellation, and audit
  trail.
- Evaluation datasets and metrics for release and incident workflows, including
  citation accuracy and uncertainty.

**Exit criteria:** model assistance improves measured investigation quality
without changing facts, inventing citations, exceeding configured budgets, or
converting hypotheses into confirmed causes.

## P5 — Application Integration & UX

**Goal:** make investigations usable through the existing authenticated
application.

- Durable investigation and event persistence, worker lifecycle, retries, and
  cancellation.
- Authenticated AdonisJS-to-FastAPI internal contract.
- Workspace authorization and tenant isolation.
- Investigation creation forms, progress, evidence explorer, release and
  incident reports.
- End-to-end tests across the existing web app and Python service.

**Exit criteria:** authorized users can create, follow, cancel, and review an
investigation with traceable evidence and durable history.

## P6 — Secure Integrations & Correlation

**Goal:** safely connect provider data and close the evidence loop between
releases and incidents.

- GitHub App installation credentials and webhooks with scoped access.
- Deployment-source adapter and an initial external incident/error provider.
- Credential storage, tenant isolation, retention/deletion, quota management,
  and auditability.
- Correlation between deployments, release findings, and incident
  investigations.
- Link explicitly confirmed incidents to future release policies with
  provenance.

**Exit criteria:** provider access is least-privilege, auditable, revocable,
tenant-safe, and useful across both workflow types.

## P7 — Open Source Beta

**Goal:** prepare a reviewed, supportable beta without assuming a publication
decision.

- Stable API, examples, developer docs, and contributor onboarding.
- Security review, quality gates, operational/cost visibility, and packaging
  guidance.
- Release notes and release automation with maintainer review.
- Public beta validation and issue triage practices.
- Confirm repository visibility and publication plans with the owner before
  making further visibility changes, distributing release artifacts, or adding a
  license.

**Exit criteria:** owner-reviewed visibility, publication, and license
decisions; reviewed security posture; reproducible setup; useful documentation;
tested release process; and a clear support policy.

## Work-item rules

GitHub milestones and issues decompose these phases into solo-developer-sized
tasks. Each issue includes purpose, scope, dependencies, acceptance criteria,
tests, documentation, non-goals, priority, and effort. Issue bodies are the
detailed execution contracts; this document is the product and phase-level
source of truth. Keep GitHub project phase/priority/area fields and milestones
aligned with these phase names.

Never trade evidence quality for a model-generated answer. Keep the first slices
deterministic and fixture-driven; add external integrations and model services
only when a specific issue makes the value and safety boundary clear.
