# Backup & Disaster Recovery

Finance Tracker includes automated database backup and restore scripts located in the `scripts/` directory.

---

## Automated Backups (`scripts/backup.sh`)

The backup script connects to the running PostgreSQL container via Docker Compose, performs an atomic `pg_dump`, and streams it through `gzip` compression with level 9.

### Execution

```bash
sh scripts/backup.sh
```

### Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `BACKUP_DIR` | `/var/backups/finance-tracker` | Target storage folder for `.sql.gz` files. |
| `PROJECT_DIR` | `/opt/finance-tracker` | Absolute path containing `docker-compose.yml`. |
| `RETENTION_DAYS` | `7` | Retention period; older backups are purged automatically. |

### Setting Up a Cron Job

To run the backup automatically every night at 02:00 UTC:

```bash
0 2 * * * cd /opt/finance-tracker && sh scripts/backup.sh >> /var/log/ft-backup.log 2>&1
```

---

## Disaster Recovery & Restoration (`scripts/restore.sh`)

In the event of hardware failure, database corruption, or testing a rollback:

### 1. Execute Restore Script

```bash
sh scripts/restore.sh /var/backups/finance-tracker/ft-db-backup-20261117_020000.sql.gz
```

### 2. Safeguards
- Verifies the backup archive exists and has a non-zero byte size.
- Displays an interactive warning prompt requiring the operator to type `RESTORE` before proceeding.
- Decompresses and streams SQL directly into `psql` within the running database container.
