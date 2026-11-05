#!/usr/bin/env bash

set -Eeuo pipefail

if [[ "$EUID" -ne 0 ]]; then
  echo 'Run this script with sudo.' >&2
  exit 1
fi

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_USER="${SUDO_USER:-ubuntu}"

if [[ "$DEPLOY_USER" != ubuntu ]]; then
  echo 'Run this script from the Ubuntu VM account using sudo.' >&2
  exit 1
fi

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  echo "Deployment user $DEPLOY_USER does not exist." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install --no-install-recommends -y \
  ca-certificates \
  docker.io \
  docker-compose-v2 \
  postgresql-client-16 \
  unattended-upgrades \
  python3-venv

systemctl enable --now docker
systemctl enable --now apt-daily.timer apt-daily-upgrade.timer
usermod -aG docker "$DEPLOY_USER"

install -d -o "$DEPLOY_USER" -g docker -m 0750 /opt/wire
install -d -o "$DEPLOY_USER" -g docker -m 0700 /opt/wire/backups

python3 -m venv /opt/oci-cli
/opt/oci-cli/bin/pip install --upgrade pip
/opt/oci-cli/bin/pip install -r "$SCRIPT_DIR/requirements.txt"

install -o "$DEPLOY_USER" -g docker -m 0750 \
  "$SCRIPT_DIR/backup-postgres.sh" /opt/wire/backup-postgres.sh
install -o root -g root -m 0644 \
  "$SCRIPT_DIR/wire-backup.service" /etc/systemd/system/wire-backup.service
install -o root -g root -m 0644 \
  "$SCRIPT_DIR/wire-backup.timer" /etc/systemd/system/wire-backup.timer

if [[ ! -f /etc/wire-backup.env ]]; then
  cat > /etc/wire-backup.env <<'EOF'
OCI_BACKUP_BUCKET=replace-with-your-private-bucket-name
OCI_REGION=replace-with-your-home-region
EOF
  chmod 600 /etc/wire-backup.env
fi

systemctl daemon-reload
systemctl enable --now wire-backup.timer

echo "Host setup complete. Reconnect as $DEPLOY_USER so the docker group is"
echo 'active.'
echo 'Set OCI_BACKUP_BUCKET and OCI_REGION in /etc/wire-backup.env.'
