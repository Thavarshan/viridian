{ config, ... }:

let
  root = config.git.root;
  web = "${root}/apps/web";
  agent = "${root}/apps/agent-api";
  e2e = "${root}/packages/e2e";
in
{
  tasks = {
    "install:tools" = {
      exec = "npm ci";
      cwd = root;
    };
    "install:web" = {
      exec = "npm ci";
      cwd = web;
    };
    "install:agent" = {
      exec = "uv sync --locked";
      cwd = agent;
    };
    "install:e2e" = {
      exec = "npm ci";
      cwd = e2e;
    };
    "install:all" = {
      exec = "echo 'Dependencies installed'";
      after = [
        "install:tools"
        "install:web"
        "install:agent"
        "install:e2e"
      ];
    };

    "migrate:web" = {
      exec = "node ace migration:run --no-schema-generate";
      cwd = web;
      after = [ "devenv:processes:postgres" ];
    };

    "build:web" = {
      exec = "npm run build";
      cwd = web;
    };
    "build:agent" = {
      exec = ''
        set -eu
        uv build --no-build-isolation --sdist --wheel
        python - <<'PY'
        from pathlib import Path
        import subprocess
        import sys
        import tempfile

        root = Path.cwd()
        wheel = next((root / "dist").glob("agent_api-*.whl"))

        with tempfile.TemporaryDirectory(prefix="agent-api-wheel-") as temp_dir:
            environment = Path(temp_dir)
            virtualenv = environment / "venv"
            python = virtualenv / "bin" / "python"
            requirements = environment / "requirements.txt"

            subprocess.run(
                ["uv", "venv", "--python", sys.executable, str(virtualenv)],
                cwd=root,
                check=True,
            )
            subprocess.run(
                [
                    "uv", "export", "--locked", "--no-dev", "--no-emit-project",
                    "--format", "requirements.txt", "--output-file", str(requirements),
                ],
                cwd=root,
                check=True,
            )
            subprocess.run(
                ["uv", "pip", "install", "--python", str(python), "-r", str(requirements)],
                cwd=root,
                check=True,
            )
            subprocess.run(
                ["uv", "pip", "install", "--python", str(python), "--no-deps", str(wheel)],
                cwd=root,
                check=True,
            )
            subprocess.run(
                [str(python), "-c", "from agent.main import app; assert app.title == 'Viridian Agent API'"],
                cwd=environment,
                check=True,
            )
        PY
      '';
      cwd = agent;
    };
    "build:all" = {
      exec = "echo 'All application builds completed'";
      after = [
        "build:web"
        "build:agent"
      ];
    };

    "test:web" = {
      exec = "npm test";
      cwd = web;
      after = [ "devenv:processes:postgres" ];
    };
    "test:e2e" = {
      exec = "npm test";
      cwd = e2e;
      after = [ "devenv:processes:postgres" ];
    };
    "test:agent" = {
      exec = "uv run --locked pytest";
      cwd = agent;
    };
    "test:all" = {
      exec = "echo 'All application tests passed'";
      after = [
        "test:web"
        "test:e2e"
        "test:agent"
      ];
    };

    "lint:web" = {
      exec = "npm run lint:web";
      cwd = root;
    };
    "lint:e2e" = {
      exec = "npm run lint:e2e";
      cwd = root;
    };
    "lint:agent" = {
      exec = "uv run --locked ruff check src tests";
      cwd = agent;
    };
    "lint:all" = {
      exec = "echo 'All application lint checks passed'";
      after = [
        "lint:web"
        "lint:e2e"
        "lint:agent"
      ];
    };

    "typecheck:web" = {
      exec = "npm run typecheck:web";
      cwd = root;
    };
    "typecheck:agent" = {
      exec = "uv run --locked mypy src";
      cwd = agent;
    };
    "typecheck:e2e" = {
      exec = "npm run typecheck:e2e";
      cwd = root;
    };

    "format:check" = {
      exec = ''
        set -eu
        npm run format:check
        (cd "${agent}" && uv run --locked ruff format --check src tests)
        nixfmt --check "${root}/devenv.nix" "${root}/nix/tasks.nix"
      '';
      cwd = root;
    };
    "audit:web" = {
      exec = "npm run audit:web";
      cwd = root;
    };
    "audit:e2e" = {
      exec = "npm run audit:e2e";
      cwd = root;
    };
    "audit:tools" = {
      exec = "npm run audit:tools";
      cwd = root;
    };
    "actions:check" = {
      exec = "actionlint -color .github/workflows/*.yml";
      cwd = root;
    };

    "ci:check" = {
      exec = "echo 'Monorepo CI checks passed'";
      after = [
        "build:all"
        "test:all"
        "lint:all"
        "typecheck:web"
        "typecheck:agent"
        "typecheck:e2e"
        "format:check"
        "audit:tools"
        "audit:web"
        "audit:e2e"
        "actions:check"
      ];
      cwd = root;
    };
  };
}
