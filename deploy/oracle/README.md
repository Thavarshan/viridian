# Oracle Always Free deployment

This directory contains the production container stack and the host scripts for
an Oracle Cloud Infrastructure (OCI) Ampere VM. The web image Dockerfile is in
`deploy/web/`. No cloud resources or GitHub settings are changed by this
repository setup.

## Delivery flow

- Pull requests to `main` run formatting, lint, type checks, unit and feature
  tests, Playwright E2E tests, and a production build against PostgreSQL.
- A push to `main` publishes a private, ARM64 image to GitHub Container Registry
  (GHCR) only after the verification job passes. The image is tagged with the
  commit and addressed by its immutable digest. BuildKit emits an SBOM and
  provenance metadata.
- Production deployment is manual. From GitHub Actions, run **CI and Oracle
  deployment** on `main` and set `deploy` to `true`. The workflow runs CI and
  publishes the image for that commit before the `production` environment can
  release its credentials and start deployment.
- Configure `production` with `main` as its only deployment branch and at least
  one required reviewer. Keep `Prevent self-review` enabled. On a public
  repository, these environment protections and environment secrets are
  available on GitHub Free.

Set `main` branch rules to require a pull request, at least one review, and both
the `verify` and `dependency review` status checks before merging. Require the
branch to be up to date before merge if that option is available.

The workflow pins GitHub Actions to full commit SHAs, uses read-only token
permissions by default, and grants package write access only to the image
publishing job. Dependabot checks npm, GitHub Actions, and Docker dependencies
weekly. The `dependency review` PR check blocks newly introduced high or
critical severity vulnerabilities; enable Dependabot alerts and security updates
in the repository's Security settings as well. `npm audit` also blocks high and
critical findings in the complete lockfile. The app pins Nodemailer to the
supported 10.3.1 release line because Adonis Mail currently declares 9.x; review
this override when upgrading `@adonisjs/mail`.

## OCI resources

Create resources in the OCI home region and confirm each resource is marked
Always Free before creating it:

1. Create a private Object Storage bucket named `wire-backups`. Add a lifecycle
   rule to delete objects after 30 days so backups stay within the Always Free
   storage allowance.
2. Create a dynamic group named `WireProductionVm` that matches only the
   production VM, for example:

   ```text
   ALL {instance.id = 'ocid1.instance.oc1..your-instance-id'}
   ```

3. Add this policy in the compartment containing the bucket:

   ```text
   Allow dynamic-group WireProductionVm to manage objects in compartment <compartment-name> where target.bucket.name = 'wire-backups'
   ```

4. Create an Ubuntu 24.04 ARM64 VM using `VM.Standard.A1.Flex`, with up to 2
   OCPUs and 12 GB RAM. Keep the boot volume and all other block volumes within
   the tenancy's Always Free storage allowance. Assign a public IP and use an
   SSH key you control.
5. Add inbound TCP rules for port 22 from your administration IP and ports 80
   and 443 from the internet. Add UDP 443 if HTTP/3 is desired. Do not open
   ports 3333 or 5432. Point the application domain's A record at the VM public
   IP.

The OCI Always Free Ampere allocation is shared across the tenancy. Oracle
currently documents the Always Free A1 allocation as 2 OCPUs and 12 GB RAM, and
200 GB of total block volume storage. Check the tenancy usage before adding
other compute or storage resources.

## Prepare the VM

Connect as the Ubuntu image's `ubuntu` user, clone this repository, and run:

```sh
cd <checkout>/deploy/oracle
sudo bash install-host.sh
```

Reconnect after the script adds `ubuntu` to the Docker group. Configure the
private backup bucket and region:

```sh
sudoedit /etc/wire-backup.env
```

Set `OCI_BACKUP_BUCKET=wire-backups` and `OCI_REGION` to the region key shown
for your OCI home region. The host uses OCI instance principal authentication;
it does not need a user API key. Verify the identity and permissions with:

```sh
sudo -u ubuntu /opt/oci-cli/bin/oci \
  --auth instance_principal \
  --region <region-key> \
  os ns get
```

Install an SSH public key for the GitHub deploy user in
`/home/ubuntu/.ssh/authorized_keys`. Generate the key pair on an administrator
workstation and keep its private half for the GitHub `production` environment.
Add the VM SSH host key to `known_hosts` after verifying its fingerprint over a
trusted channel. The workflow intentionally does not trust a host key learned
during deployment.

## Configure GitHub

Create the `production` environment and configure its deployment branch and
reviewer protection before storing credentials. Add these environment variables:

| Variable          | Value                              |
| ----------------- | ---------------------------------- |
| `OCI_DEPLOY_HOST` | VM public IP or DNS name           |
| `OCI_DEPLOY_USER` | `ubuntu`                           |
| `OCI_DEPLOY_PORT` | `22`, unless SSH uses another port |

Add these environment secrets:

| Secret                | Value                                             |
| --------------------- | ------------------------------------------------- |
| `OCI_SSH_PRIVATE_KEY` | Private half of the deploy SSH key                |
| `OCI_SSH_KNOWN_HOSTS` | Verified `known_hosts` entry for the VM           |
| `GHCR_PULL_USERNAME`  | GitHub username allowed to read the image package |
| `GHCR_PULL_TOKEN`     | GitHub classic PAT with `read:packages` only      |

The publishing job creates the GHCR package using `GITHUB_TOKEN`. Keep that
package private and grant the read token access to it. Use repository settings
to require approval for deployments and limit the `production` environment to
`main`.

## Configure the application

Create `/opt/wire/.env.production` from `deploy/oracle/.env.production.example`.
Replace every placeholder, use a strong random `APP_KEY` and database password,
and enter real SMTP credentials. Set `APP_DOMAIN` to the DNS name pointing to
the VM. Keep the bootstrap image line as-is; the deployment script replaces it
with the verified digest.

```sh
cd <checkout>
sudo -u ubuntu cp deploy/oracle/.env.production.example \
  /opt/wire/.env.production
sudo chown ubuntu:docker /opt/wire/.env.production
sudo chmod 600 /opt/wire/.env.production
```

Generate strong values on the VM with `openssl rand -hex 32`, then edit the
environment file with `sudoedit /opt/wire/.env.production` and replace the
`APP_KEY`, database, and SMTP placeholders.

Caddy obtains and renews TLS certificates automatically. The app and database
are not exposed directly on the VM; only Caddy publishes web ports. PostgreSQL
data lives in a named Docker volume. The app runs as a non-root user with a
read-only root filesystem.

## Backups, migrations, and recovery

The VM has two backup paths:

- Before each deployment, `deploy.sh` creates a local custom-format PostgreSQL
  dump and keeps seven days of these pre-deploy dumps.
- A systemd timer runs a daily custom-format dump and uploads it to the private
  `wire-backups` bucket using the VM's instance principal. Object Storage
  encrypts stored objects at rest by default. The bucket lifecycle rule should
  expire objects after 30 days.

Check the timer and latest run with:

```sh
systemctl list-timers wire-backup.timer
sudo journalctl -u wire-backup.service -n 100
```

To restore, stop the app, download the desired dump with the OCI CLI using
`--auth instance_principal`, and restore it into PostgreSQL with `pg_restore`.
For example, after setting `BACKUP_OBJECT` to the selected object name:

```sh
/opt/oci-cli/bin/oci --auth instance_principal --region <region-key> \
  os object get --bucket-name wire-backups --name "$BACKUP_OBJECT" \
  --file /tmp/wire-restore.dump
cd /opt/wire
docker compose --env-file .env.production -f compose.yaml stop app
cat /tmp/wire-restore.dump | docker compose \
  --env-file .env.production -f compose.yaml exec -T db sh -c \
  'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
docker compose --env-file .env.production -f compose.yaml up -d app
```

Test the restore procedure before relying on the backups. A restore replaces
database state, so take a fresh backup and schedule downtime first.

Migrations must remain backward compatible: add new columns/tables first, deploy
code that can handle both schemas, and remove old columns in a later release. If
a new app fails its health check, the deploy script restores the previous image,
but it does not reverse a completed migration.

This free-tier design is a single VM and a single PostgreSQL instance. It
provides an auditable CI gate, health-checked rollback, and off-host backups,
but it does not provide multi-zone high availability or an uptime SLA.
