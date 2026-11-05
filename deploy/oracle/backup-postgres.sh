#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

APP_DIR=/opt/wire
ENV_FILE="$APP_DIR/.env.production"
BACKUP_DIR="$APP_DIR/backups"

: "${OCI_BACKUP_BUCKET:?Set OCI_BACKUP_BUCKET in /etc/wire-backup.env}"
: "${OCI_REGION:?Set OCI_REGION in /etc/wire-backup.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE." >&2
  exit 2
fi

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

backup_name="wire-$(date -u +%Y%m%dT%H%M%SZ).dump"
backup_file="$BACKUP_DIR/$backup_name"
trap 'rm -f "$backup_file"' EXIT

docker compose --env-file "$ENV_FILE" -f "$APP_DIR/compose.yaml" \
  exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB"' \
  > "$backup_file"
pg_restore --list "$backup_file" >/dev/null

/opt/oci-cli/bin/oci \
  --auth instance_principal \
  --region "$OCI_REGION" \
  os object put \
  --bucket-name "$OCI_BACKUP_BUCKET" \
  --name "postgres/$backup_name" \
  --file "$backup_file"

echo "Uploaded OCI Object Storage backup: postgres/$backup_name"
