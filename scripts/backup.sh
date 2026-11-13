#!/bin/sh
# ==============================================================================
# Finance-Tracker Local Automated Database Backup Script
# Suitable for Alpine Linux crond execution
# ==============================================================================
set -eu

BACKUP_DIR="${BACKUP_DIR:-/var/backups/finance-tracker}"
PROJECT_DIR="${PROJECT_DIR:-/opt/finance-tracker}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"
BACKUP_FILE="${BACKUP_DIR}/ft-db-backup-${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Starting automated database backup..."

cd "${PROJECT_DIR}"

# Dump PostgreSQL database via Docker Compose and compress on the fly
docker compose exec -T db pg_dump \
  -U "${POSTGRES_USER:-ft_user}" \
  -d "${POSTGRES_DB:-financetracker}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  | gzip -9 > "${BACKUP_FILE}"

# Verify file existence and non-zero size
if [ -s "${BACKUP_FILE}" ]; then
  BACKUP_SIZE="$(du -h "${BACKUP_FILE}" | cut -f1)"
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Backup succeeded: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] ERROR: Backup file is empty or missing!" >&2
  exit 1
fi

# Rotate backups older than retention window
echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Cleaning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "ft-db-backup-*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;

echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Backup process complete."

