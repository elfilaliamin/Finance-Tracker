# Finance-Tracker

Self-hosted personal finance web application engineered for privacy, multi-currency accounting, and low-resource home-server deployment.

[![Stack: React + Node.js + PostgreSQL](https://img.shields.io/badge/Stack-React%20%7C%20Node%20%7C%20Postgres-blue.svg)](#architecture)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Docker Ready](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](#deployment)

---

## 1. Architectural Highlights & Invariants

- **Multi-Tenant / Multi-User Ready:** Open registration (`/register`), session authentication via Argon2id password hashing and HTTP-only JWT cookies (`ft_auth_token`), and strict database tenant scoping (`user_id` on every domain table).
- **Income Never Affects Wallets:** Income records track revenues and categories with color-coded sources, but **never** link to or modify wallet balances.
- **Spending Deducts from Wallets:** Spending is modeled like itemized bills/invoices. When an optional paying wallet is chosen, the amount is deducted atomically via a database transaction.
- **Manual Balance Adjustments (Snapshots):** Wallet balances update via manual delta adjustments (`+`/`-`) or exact count reconciliation.
- **Multi-Currency Engine:** Native support for `MAD`, `USD`, and `EUR` with live rates from Open Exchange Rates and point-in-time valuation using `decimal.js` half-up rounding.
- **Ultra Low-Resource Footprint:** Capped to <832 MiB total stack RAM (PostgreSQL 384M cap, Node.js 384M cap, Nginx 64M cap). Runs comfortably on an old dual-core i5-2410M with 3.8 GiB RAM.
- **Responsive Everywhere:** Designed mobile-first. Tested across 360px, 390px, 768px, 1024px, and 1280px with zero horizontal page scroll and minimum 44x44px touch targets.
- **English Only:** Single language web app without translation frameworks or runtime i18n overhead.
- **Zero Mock / Demo Data:** No dummy or fake records. Only essential system seeds (MAD/USD/EUR currencies and an initial admin account).

---

## 2. Directory Structure

```
Finance-Tracker/
  ├── backend/                  # Node.js 22 + Express (TypeScript) + Drizzle ORM
  │   ├── drizzle/              # SQL migrations
  │   ├── src/
  │   │   ├── db/               # PostgreSQL schema & migration runner
  │   │   ├── middleware/       # Auth, error handling, rate limiting, validation
  │   │   ├── modules/          # Auth, Wallets, Income, Spending, Budgets, Reports, etc.
  │   │   └── utils/            # Money arithmetic, logger
  │   └── Dockerfile
  ├── frontend/                 # React 18 + Vite + TypeScript + Tailwind CSS
  │   ├── src/
  │   │   ├── api/              # Strongly typed API client & endpoint modules
  │   │   ├── components/       # Adaptive layout, modals, tables, chart wrappers
  │   │   ├── hooks/            # useAuth, useBreakpoint
  │   │   ├── pages/            # Public, Dashboard, Income, Net Worth, Spending, etc.
  │   │   └── routes/           # React Router route hierarchy
  │   ├── tests/                # Playwright responsive test suite
  │   ├── nginx/default.conf    # Production SPA routing & API reverse proxy
  │   └── Dockerfile
  ├── scripts/
  │   ├── backup.sh             # Local automated pg_dump with 7-day rotation
  │   └── restore.sh            # Disaster recovery restoration script
  ├── understand/               # Architecture and specification documentation
  │   ├── 01-architecture.md
  │   ├── 02-infrastructure.md
  │   ├── 03-database-api.md
  │   ├── 04-pages.md
  │   ├── 05-tasks.md
  │   └── 06-clean-code-rules.md
  ├── docker-compose.yml        # Production deployment stack
  ├── docker-compose.test.yml   # Playwright testing container
  └── .env.example              # Environment variables template
```

---

## 3. Quickstart & Deployment

### Step 1: Clone and Configure Environment

```sh
cp .env.example .env
nano .env
```

Ensure you set strong passwords for `POSTGRES_PASSWORD`, `JWT_SECRET`, and `ADMIN_PASSWORD`.

### Step 2: Launch Stack with Docker Compose

```sh
docker compose up -d --build
```

The stack exposes:
- **Web Application & API:** `http://127.0.0.1:3004/` (served by Nginx, reverse-proxying `/api` to backend).
- **Internal Database:** Unexposed, bound to private bridge network `finance-tracker-net`.

### Step 3: Run Automated Backend Tests

```sh
cd backend
npm test
```

### Step 4: Run Automated Responsive Playwright Tests

```sh
docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm playwright
```

---

## 4. Automated Local Backups

Automated backups are configured via BusyBox cron (`crond`) on Alpine Linux or system cron on the host:

```sh
# Add to crontab (runs nightly at 03:00)
0 3 * * * /opt/finance-tracker/scripts/backup.sh >> /var/log/finance-tracker-backup.log 2>&1
```

To restore from a backup:

```sh
sh scripts/restore.sh /var/backups/finance-tracker/ft-db-backup-YYYYMMDD_HHMMSS.sql.gz
```

---

## 5. Security & Network Routing

- **Same-Origin Architecture:** Nginx serves the static SPA build and proxies `/api` calls directly to the Express backend container, eliminating CORS overhead and cookie complications.
- **Rate Limiting:** Keyed by `CF-Connecting-IP` behind Cloudflare Tunnel, falling back to connection IP.
- **Streaming Exports:** CSV, XLSX, and PDF files are generated on the fly via Node streams, keeping memory constant and protecting against formula injection.
- **Argon2id Password Hashing:** Memory-hard password hashing with salt and secret pepper.

