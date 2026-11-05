# Security policy

Viridian is under active development and is not yet a production security
product. Please do not include credentials, private repository contents, or
sensitive production logs in public issues or pull requests.

## Report a vulnerability

Use GitHub's private vulnerability reporting or Security Advisories for this
repository if the feature is enabled. If private reporting is unavailable,
contact the repository owner through their GitHub profile and include only the
minimum information needed to investigate. Do not open a public issue for an
unpatched vulnerability.

Include affected component and version or commit, impact, reproduction steps,
and a safe proof of concept. Redact secrets and customer data. The maintainer
will acknowledge and coordinate a fix and disclosure; no response-time SLA is
established yet.

## Security design expectations

- Keep provider credentials least-privileged, private, revocable, and out of
  logs.
- Sanitize incident input; treat repository text, issues, logs, and stack traces
  as untrusted.
- Keep integrations read-only by default and enforce workspace/tenant
  authorization.
- Bound tool execution and make it cancellable and auditable.
- Do not execute arbitrary production code or perform autonomous remediation.
- Distinguish evidence, hypotheses, and confirmed conclusions.

GitHub currently reports the repository as public, and no license has been
selected. Security reporting instructions do not change repository visibility or
licensing decisions.
