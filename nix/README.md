# Nix packaging

The root `devenv.nix` owns the shared development environment and declares the
`outputs.agent-api` Nix package through devenv's Python packaging integration.
The package definition consumes `apps/agent-api/pyproject.toml` and `uv.lock`.

Run `devenv build outputs.agent-api` to build that Nix output. The AdonisJS
production build remains `npm run build` through the `build:web` task; it is a
verified native npm build and is not claimed as a sandboxed Nix derivation.
