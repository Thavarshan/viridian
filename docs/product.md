# Product specification

## Product identity

Viridian is an open-source-intended, agentic Software Delivery Intelligence
platform. It helps engineering teams assess what is safe to ship, investigate
what broke after deployment, and connect delivery evidence with production
incident evidence.

Viridian is one platform with two specialized workflows: Release Intelligence
before deployment and Incident Intelligence after deployment. Evidence
collection, provenance, correlation, authorization, bounded tools, investigation
history, and evaluation are shared foundations.

## Target users

- Individual developers who want to check whether a change satisfies its issue
  and has relevant test evidence.
- Small engineering teams that need a repeatable release-readiness review and an
  understandable audit trail.
- Engineers responding to incidents who need to connect sanitized errors and
  deployment timing with relevant code changes.
- Open-source maintainers who want a self-hostable tool and evidence-based
  reports without requiring paid AI access for basic operation or testing.

## Problems to solve

Delivery status is spread across issue descriptions, pull requests, commits, CI
runs, dependency manifests, and release notes. A closed issue or passing test
suite does not prove that requirements are satisfied. After deployment, logs and
stack traces are often separated from the commits and release decisions that
might explain a failure. Teams need a consistent way to assemble evidence and
make uncertainty visible.

Viridian should reduce the manual effort of assembling that evidence while
keeping a human-readable trail from each finding to its source.

## Core workflows

### Release Intelligence

1. Select a repository and immutable target commit or release range.
2. Collect completed issues, related pull requests, changes, tests, CI evidence,
   dependency changes, and policy configuration.
3. Run deterministic checks for requirement links, revision inclusion, available
   test evidence, and configured policy rules.
4. Present evidence-backed findings with risks, blockers, missing evidence,
   limitations, and unknowns.
5. Optionally use a model to summarize relationships or rank areas for review;
   cite evidence and preserve uncertainty.

### Incident Intelligence

1. Submit a sanitized incident record manually, including incident window,
   normalized error and stack trace, and selected log evidence.
2. Identify relevant services, deployment events, revisions, pull requests, and
   dependency changes.
3. Run deterministic correlation and diagnostic rules over available evidence.
4. Present ranked root-cause hypotheses with source citations, confidence, gaps,
   and safe diagnostic steps.
5. Record explicit human confirmation separately from model-generated
   hypotheses.

The first useful incident demonstration must work without live production
access. Automatic remediation and arbitrary execution are not part of the
initial workflow.

## Shared intelligence and correlation

Both workflows use common evidence records, source references, immutable
revision identifiers, event and observation timestamps, adapters, tools,
authorization boundaries, investigation lifecycle, and evaluation fixtures.
Release investigations should eventually reference prior confirmed incidents;
incident investigations should retrieve release history and earlier release
risks. Cross-workflow behavior depends on stable contracts from both
investigation types.

## Initial integrations

- Start with read-only GitHub data for repositories, issues, pull requests,
  commits, and CI evidence, with pagination, rate-limit handling, and explicit
  permissions.
- Start incident input as manually supplied, sanitized JSON/text fixtures. Add
  external deployment and observability sources only after the core schema and
  correlation behavior are useful and testable.
- Keep basic deterministic workflows and tests independent of a paid model
  service. Model providers are optional adapters behind a small, testable
  interface.

## MVP scope

The roadmap delivers two useful vertical slices over shared evidence:

- A deterministic Release Intelligence report for a pinned revision, linked
  issue/PR evidence, and test/CI state.
- A deterministic Incident Intelligence report from sanitized manual evidence
  correlated with deployment and repository history.
- Clear provenance, limitations, and unknowns in both reports.
- Bounded optional model assistance after deterministic collection and
  validation work reliably.
- A user-facing flow integrated with the existing AdonisJS app and an
  authenticated internal FastAPI contract.

The milestones intentionally build foundations first. These are target
capabilities; they are not implemented in the current shell.

## Non-goals for early phases

- Two independent AI platforms or duplicate evidence stores.
- Replacing AdonisJS/React/Inertia or introducing another frontend.
- A complex multi-agent framework, vector database, or Kubernetes deployment
  before clear need.
- Direct browser access to privileged Python APIs.
- Required paid model access for core tests.
- Arbitrary code execution against production systems.
- Autonomous code changes, deployments, or remediation.
- Live production access as a prerequisite for the first Incident Intelligence
  demo.

## Privacy, security, and trust

Repository contents, issue text, logs, and stack traces are untrusted input and
may include secrets or prompt injection. Integrations start read-only.
Credentials require least privilege and secure storage; tenants and workspaces
must remain isolated. Incident evidence must be sanitized before submission.
Tool calls need allow-lists, timeouts, budgets, cancellation, and audit history.
Reports must distinguish observed facts, deterministic findings, hypotheses, and
confirmed conclusions. Retention and deletion behavior must be explicit before
storing sensitive production data.

## Long-term differentiation

Viridian connects the evidence behind a release decision with the evidence
behind later failures. Over time, confirmed incident causes can improve future
release assessments, and release findings can accelerate incident investigation.
This feedback loop should remain inspectable: prior conclusions inform a new
investigation only through traceable evidence and explicit policy, not hidden
model memory.
