# Contributing to Viridian

Viridian is building one Software Delivery Intelligence platform with Release
Intelligence, Incident Intelligence, and shared evidence infrastructure. The
repository is currently a foundation. Review the
[product specification](docs/product.md), [architecture](docs/architecture.md),
[roadmap](docs/roadmap.md), and root [AGENTS.md](AGENTS.md) before proposing a
broad change.

## Find a task

Use the
[Engineering Roadmap project](https://github.com/users/Thavarshan/projects/2)
and its [master tracker #8](https://github.com/Thavarshan/viridian/issues/8).
Check milestone, labels, and issue dependencies before starting. For substantial
work, discuss scope in the linked issue first.

## Make a focused change

- Keep pull requests small and tied to an issue where possible.
- Preserve the existing AdonisJS + React/Inertia and FastAPI boundaries.
- Keep shared configuration at the repository root and cross-service E2E tests
  in `packages/e2e`.
- Prefer deterministic, typed, fixture-backed behavior. Do not add a model
  provider requirement to basic tests.
- Treat model-generated explanations as cited hypotheses, not facts.
- Keep integrations read-only; do not add arbitrary production execution or
  autonomous remediation.
- Never commit secrets, private repository contents, or unredacted production
  logs.

## Run checks

Follow [docs/development.md](docs/development.md) for the devenv setup and task
commands. Run checks relevant to changed files and report anything you could not
run. The repository currently has a documented Nix shell realization blocker;
check the latest P0 issue and CI run before assuming setup is fixed.

## Pull requests

Use the pull request template. State the issue number, user-visible behavior,
design choices, checks run, and any known limitations. Do not claim unverified
tests or CI success. Ask for review before merging; do not merge your own
changes without the repository's normal review policy.

## License and publication

GitHub currently reports this repository as public, and no root license has been
selected or added. Do not infer a license decision from repository visibility.
Do not add a license file or change visibility without the owner's explicit
approval.
