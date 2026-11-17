# Getting Started

Finance Tracker is a containerized, self-hosted web application for personal wealth management, itemized bill tracking, multi-currency budgeting, and net worth analytics.

## Prerequisites

- **Docker & Docker Compose** (v2.20+ recommended)
- **Node.js 22 LTS** and **npm** (for local development)
- **PostgreSQL 16** (if running without Docker)

---

## Quick Start with Docker Compose

The simplest way to deploy the complete stack is using Docker Compose.

### 1. Clone & Configure Environment

Create an environment configuration file from the template:

```bash
git clone <repository-url> finance-tracker
cd finance-tracker
cp .env.example .env
```

Edit `.env` with secure credentials:

```dotenv
# Production Database Credentials
POSTGRES_DB=financetracker
POSTGRES_USER=ft_user
POSTGRES_PASSWORD=your-super-secure-database-password-min-16-chars

# Backend Configuration
JWT_SECRET=your-random-64-char-hex-secret-do-not-share
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-initial-admin-password-min-12-chars
PORT=4000
NODE_ENV=production
TRUST_PROXY=1

# Frontend Port (Port exposed on the host machine)
FRONTEND_PORT=3004
```

### 2. Launch the Application

```bash
docker compose up -d
```

Docker will:
1. Initialize the PostgreSQL 16 database volume.
2. Spin up the Express backend, automatically execute Drizzle database migrations, and seed initial currencies and admin accounts.
3. Start the Nginx web server on the configured port.
4. Start the background auto-prune container to clean up dangling images automatically.

### 3. Access the Application

- **Web Application:** `http://localhost:3004/`
- **Documentation:** `http://localhost:3004/docs/`
- **Backend Health Check:** `http://localhost:3004/api/v1/health`

---

## Local Development Setup

To run both services natively on your local development workstation:

### 1. Database

Start PostgreSQL locally or via Docker:

```bash
docker run -d \
  --name ft-dev-db \
  -e POSTGRES_DB=financetracker \
  -e POSTGRES_USER=ft_user \
  -e POSTGRES_PASSWORD=devpassword \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Backend Service

```bash
cd backend
npm install
cp .env.example .env
```

Ensure `DATABASE_URL` in `backend/.env` points to your PostgreSQL instance:

```dotenv
DATABASE_URL=postgresql://ft_user:devpassword@localhost:5432/financetracker
JWT_SECRET=dev-secret-key-at-least-32-chars-long
PORT=4000
NODE_ENV=development
```

Run database migrations and start the development server:

```bash
npm run db:push
npm run dev
```

The API will be available at `http://localhost:4000/api/v1/`.

### 3. Frontend Service

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5173/`, proxying `/api` requests to `http://localhost:4000`.

### 4. Documentation Service

To develop or preview the VitePress documentation locally:

```bash
cd docs
npm install
npm run docs:dev
```

The documentation dev server will run at `http://localhost:5173/docs/`.
