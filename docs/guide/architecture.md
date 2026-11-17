# System Architecture

Finance Tracker is built with a decoupled client-server architecture designed for high stability, memory efficiency on modest hardware (e.g., 1 GB RAM VPS), and reliable data modeling.

```
+-------------------------------------------------------------------------------+
|                                Client Browser                                 |
|          +----------------------------+  +----------------------------+       |
|          | React SPA (Vite) @ /       |  | VitePress Docs @ /docs/    |       |
+----------+----------------------------+--+----------------------------+-------+
                                  |                     |
                                  v                     v
+-------------------------------------------------------------------------------+
|                               Nginx (Alpine)                                  |
|   - Port :80 (Mapped to :3004 on Host)                                        |
|   - Reverse Proxy: /api/* -> Backend:4000                                     |
|   - Static Routing: / -> /usr/share/nginx/html/ (React SPA)                   |
|   - Docs Routing:   /docs/* -> /usr/share/nginx/html/docs/ (VitePress)        |
|   - Low-RAM Buffer Tuning, Gzip Compression, Security Headers                 |
+-------------------------------------------------------------------------------+
                                         |
                                         v
+-------------------------------------------------------------------------------+
|                         Backend Service (Node.js 22)                          |
|   - Express 4 REST API (/api/v1/*)                                            |
|   - Drizzle ORM (Type-Safe SQL Query Builder & Auto-Migrations)               |
|   - Argon2id Password Hashing & Stateless JWT Auth (HTTP-Only Cookie)         |
|   - Zod Input Validation & Rate Limiting                                      |
+-------------------------------------------------------------------------------+
                                         |
                                         v
+-------------------------------------------------------------------------------+
|                         PostgreSQL 16 (Alpine)                                |
|   - Relational Data Model (14 Normalized Tables)                              |
|   - Memory-tuned: shared_buffers=64MB, work_mem=4MB, max_connections=25       |
|   - Decimal 12,2 precision for financial amounts                              |
+-------------------------------------------------------------------------------+
```

---

## Directory Organization

The repository is structured into modular isolated domains:

| Path | Purpose | Technologies |
| :--- | :--- | :--- |
| `frontend/` | Client single-page application | React 18, TypeScript, Tailwind CSS, Vite, TanStack Query |
| `backend/` | Application server and business logic | Node.js 22, Express, TypeScript, Drizzle ORM, Zod |
| `backend/drizzle/` | Auto-generated SQL schema migrations | Drizzle Kit SQL migration scripts |
| `docs/` | Isolated technical documentation | VitePress, Markdown, Vue |
| `scripts/` | Operational automation | Bash backup and restore utilities |
| `.github/workflows/` | Continuous integration & container builds | GitHub Actions CI/CD pipeline |

---

## Technical Stack Deep-Dive

### 1. Frontend Client
- **React 18 & TypeScript:** Strict type checking across UI components, forms, and API state.
- **Vite:** High-performance ES module bundler producing optimized production chunks.
- **Tailwind CSS:** Responsive styling featuring customized emerald/teal palettes, dark mode toggles, and mobile-friendly drawer layouts.
- **TanStack React Query:** Server state synchronization, optimistic caching, and automated invalidation across wallet balances, spendings, and analytics.

### 2. Backend Engine
- **Node.js 22 LTS & Express:** Asynchronous REST API under `/api/v1/`.
- **Drizzle ORM:** Schema-as-code mapping with compile-time SQL query validation and zero runtime overhead compared to heavy ORMs.
- **Argon2id:** Memory-hard cryptographic hashing for user passwords.
- **Stateless JWT:** Authenticated sessions issued into secure, HTTP-only, SameSite cookies.
- **Zod:** Runtime request body and query parameter validation with descriptive error payloads.

### 3. Database Layer
- **PostgreSQL 16:** Relational database with full ACID compliance.
- **Numeric Precision:** All monetary amounts are stored as `numeric(12, 2)` or `numeric(14, 4)` to eliminate IEEE 754 floating-point inaccuracies.
- **Foreign Key Constraints:** Cascade deletions ensure transaction histories, adjustments, and receipt items remain referentially sound.

### 4. Reverse Proxy & Web Server
- **Nginx Alpine:** Handles static file serving for both the React web application and VitePress documentation.
- **Proxy Buffering:** Tuned for low memory footprints (`proxy_buffers 8 16k; proxy_buffer_size 16k`).
- **Security Headers:** Strict Content Security Policy (`CSP`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
