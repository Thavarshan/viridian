#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

APP_DIR=/opt/wire
COMPOSE_FILE="$APP_DIR/compose.yaml"
ENV_FILE="$APP_DIR/.env.production"
IMAGE_REF="${1:-}"
IMAGE_REF_PATTERN='^ghcr\.io/[a-z0-9._-]+/[a-z0-9._-]+@sha256:[a-f0-9]{64}$'

if [[ ! "$IMAGE_REF" =~ $IMAGE_REF_PATTERN ]]; then
  echo 'Expected an immutable GHCR image reference with a SHA-256 digest.' >&2
  exit 2
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Create it from .env.production.example first." >&2
  exit 2
fi

IFS= read -r GHCR_PULL_USERNAME || {
  echo 'Missing GHCR pull username on standard input.' >&2
  exit 2
}
IFS= read -r GHCR_PULL_TOKEN || {
  echo 'Missing GHCR pull token on standard input.' >&2
  exit 2
}

if [[ -z "$GHCR_PULL_USERNAME" || -z "$GHCR_PULL_TOKEN" ]]; then
  echo 'GHCR pull credentials cannot be empty.' >&2
  exit 2
fi

DOCKER_CONFIG="$(mktemp -d)"
export DOCKER_CONFIG
cleanup() {
  docker logout ghcr.io >/dev/null 2>&1 || true
  rm -rf "$DOCKER_CONFIG"
}
trap cleanup EXIT

printf '%s' "$GHCR_PULL_TOKEN" |
  docker login ghcr.io --username "$GHCR_PULL_USERNAME" --password-stdin

cd "$APP_DIR"
exec 9>"$APP_DIR/.deploy.lock"
if ! flock -n 9; then
  echo 'Another deployment is already running.' >&2
  exit 1
fi

chmod 600 "$ENV_FILE"
mkdir -p "$APP_DIR/backups"
chmod 700 "$APP_DIR/backups"

previous_image_setting="$(sed -n 's/^WIRE_IMAGE=//p' "$ENV_FILE" | tail -n 1)"
previous_container_image="$(
  docker inspect --format '{{.Config.Image}}' wire-app 2>/dev/null || true
)"
deployment_started=false

set_image() {
  local image="$1"
  local temp_file

  temp_file="$(mktemp "$APP_DIR/.env.production.XXXXXX")"
  awk -v image="$image" '
    /^WIRE_IMAGE=/ {
      print "WIRE_IMAGE=" image
      replaced = 1
      next
    }
    { print }
    END {
      if (!replaced) {
        print "WIRE_IMAGE=" image
      }
    }
  ' "$ENV_FILE" > "$temp_file"
  chmod 600 "$temp_file"
  mv "$temp_file" "$ENV_FILE"
}

rollback() {
  local exit_code="$1"
  local rollback_image="$previous_container_image"

  trap - ERR
  if [[ "$deployment_started" != true ]]; then
    exit "$exit_code"
  fi

  if [[ -z "$rollback_image" ]]; then
    rollback_image="$previous_image_setting"
  fi

  if [[ -n "$rollback_image" ]]; then
    echo "Deployment failed; restoring image reference $rollback_image" >&2
    set_image "$rollback_image" || true
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull app || true
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
      up -d --no-deps app || true
  fi

  exit "$exit_code"
}

trap 'rollback "$?"' ERR

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config --quiet
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull db proxy
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d db

for attempt in $(seq 1 60); do
  if docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
    exec -T db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
    >/dev/null 2>&1; then
    break
  fi

  if [[ "$attempt" -eq 60 ]]; then
    echo 'PostgreSQL did not become ready within five minutes.' >&2
    exit 1
  fi

  sleep 5
done

backup_file="$APP_DIR/backups/predeploy-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' \
  > "$backup_file"
pg_restore --list "$backup_file" >/dev/null
find "$APP_DIR/backups" -type f -name 'predeploy-*.dump' -mtime +7 -delete

deployment_started=true
set_image "$IMAGE_REF"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" pull app
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  run --rm --no-deps app node ace migration:run --force --no-schema-generate
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" \
  up -d --no-deps app

for attempt in $(seq 1 36); do
  health_status="$(
    docker inspect --format '{{.State.Health.Status}}' \
      wire-app 2>/dev/null || true
  )"

  if [[ "$health_status" == healthy ]]; then
    break
  fi

  if [[ "$attempt" -eq 36 ]]; then
    echo 'Application health check did not pass within three minutes.' >&2
    exit 1
  fi

  sleep 5
done

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d proxy
deployment_started=false
echo "Deployment healthy: $IMAGE_REF"
