# Configuration Reference

All application settings are configured via environment variables passed into the containers or local shell environment.

## Environment Variables

### Database Settings

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `POSTGRES_DB` | No | `financetracker` | Target database name inside PostgreSQL. |
| `POSTGRES_USER` | No | `ft_user` | Database user with ownership privileges. |
| `POSTGRES_PASSWORD` | **Yes** | *None* | Secure database user password. Must be at least 16 characters. |
| `DATABASE_URL` | Local only | *Generated in Compose* | Full connection string (e.g. `postgresql://user:pass@host:5432/dbname`). |

### Backend API Settings

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | No | `production` | Environment mode (`production`, `development`, or `test`). |
| `PORT` | No | `4000` | Port the Node.js Express server listens on internally. |
| `JWT_SECRET` | **Yes** | *None* | Secret key for signing and validating session JWTs (minimum 32 characters). |
| `ADMIN_EMAIL` | No | `admin@financetracker.local` | Email address for initial bootstrap administrator account. |
| `ADMIN_PASSWORD` | **Yes** | *None* | Initial password for the bootstrap administrator account. |
| `TRUST_PROXY` | No | `1` | Enables Express proxy trust for client IP determination behind Nginx. |
| `NODE_OPTIONS` | No | `--max-old-space-size=256` | Limits V8 heap allocation to prevent out-of-memory crashes on low-RAM hosts. |

### Frontend & Nginx Settings

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `FRONTEND_PORT` | No | `3004` | Host port mapped to Nginx port 80 in Docker Compose. |
| `PORT` | No | `3004` | Alternative port variable supported in Compose configuration. |

---

## Security Recommendations

1. **JWT Secret Generation:**
   Generate a cryptographically random string using OpenSSL or Node:
   ```bash
   openssl rand -hex 32
   ```

2. **Production Reverse Proxy (Cloudflare / Traefik):**
   If hosting behind Cloudflare or another upstream reverse proxy:
   - Ensure SSL/TLS is terminated at the edge.
   - Forward `X-Forwarded-Proto: https` so secure cookies are transmitted appropriately.
   - Nginx handles incoming Cloudflare headers via `$http_cf_connecting_ip`.
