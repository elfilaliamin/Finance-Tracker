#!/bin/sh
# ==============================================================================
# Finance-Tracker Disaster Recovery Restore Script
# Restores a compressed SQL dump into the PostgreSQL container
# ==============================================================================
set -eu

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path-to-backup.sql.gz>"
  echo "Example: $0 /var/backups/finance-tracker/ft-db-backup-20261113_120000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"
PROJECT_DIR="${PROJECT_DIR:-/opt/finance-tracker}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "ERROR: Backup file does not exist: ${BACKUP_FILE}" >&2
  exit 1
fi

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Preparing to restore database from ${BACKUP_FILE}..."
echo "WARNING: This will overwrite existing data in the database!"
printf "Type 'RESTORE' to proceed: "
read -r CONFIRM

if [ "${CONFIRM}" != "RESTORE" ]; then
  echo "Aborted by user."
  exit 0
fi

cd "${PROJECT_DIR}"

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Restoring database..."

gzip -dc "${BACKUP_FILE}" | docker compose exec -T db psql \
  -U "${POSTGRES_USER:-ft_user}" \
  -d "${POSTGRES_DB:-financetracker}"

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Database restoration finished successfully."

