# Migrations & Database Seeding

Finance Tracker manages database schema evolution using **Drizzle Kit** and automatically executes pending migrations at backend container boot.

---

## Migration Architecture

All migration SQL files are located in `backend/drizzle/`:

- `0000_clammy_shaman.sql`: Initial 13-table foundational schema.
- `0001_uneven_ultimates.sql`: Foreign exchange rate caching indices and constraints.
- `0002_quiet_captain_universe.sql`: Wallet adjustments and reconciliation enhancements.
- `0003_happy_rictor.sql`: Direct wallet deposit linking on incomes (`wallet_id`).

---

## Automatic Boot Execution

When the backend container starts, `runMigrationsAndSeed()` in `backend/src/db/migrate.ts` executes automatically before the Express HTTP server accepts incoming traffic:

1. **Schema Check:** Validates that PostgreSQL is reachable using exponential backoff retry.
2. **Migration Run:** Applies unapplied SQL files from `drizzle/` using Drizzle's migration client.
3. **Currency Seeding:** Seeds essential world and regional currencies (`MAD`, `USD`, `EUR`, `GBP`, `CAD`, `BTC`, `ETH`).
4. **Bootstrap Admin User:** Checks if `ADMIN_EMAIL` exists; if not, hashes `ADMIN_PASSWORD` using Argon2id, generates default wallet types, and establishes default income and spending categories.

---

## Developer Migration Workflow

When modifying `backend/src/db/schema.ts` in local development:

### 1. Generate New Migration SQL

```bash
cd backend
npm run db:generate
```

Drizzle Kit compares the TypeScript schema against previous snapshots and outputs an incremental `.sql` script in `backend/drizzle/`.

### 2. Apply Migrations Locally

```bash
npm run db:migrate
```

Or push schema changes directly to a development sandbox:

```bash
npm run db:push
```

### 3. Inspect Schema via Drizzle Studio

To browse and inspect database records visually in your browser:

```bash
npm run db:studio
```
Opens Drizzle Studio at `https://local.drizzle.studio`.
