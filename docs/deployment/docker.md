# Docker & Container Architecture

Finance Tracker is packaged into lightweight, secure container images based on Alpine Linux.

---

## Production Services

The production deployment consists of 4 Docker containers coordinated over an internal bridge network (`finance-tracker-net`):

```
                        +---------------------------+
                        |  Reverse Proxy / Nginx    |
                        |      (ft-frontend)        |
                        +-------------+-------------+
                                      |
                       +--------------+--------------+
                       |                             |
                       v                             v
           +-----------------------+     +-----------------------+
           |    Express API        |     |   PostgreSQL 16       |
           |    (ft-backend)       |---->|     (ft-db)           |
           +-----------------------+     +-----------------------+
                                                     ^
                                                     |
                                         +-----------+-----------+
                                         | Persistent Volume     |
                                         | (ft-pgdata)           |
                                         +-----------------------+

+-------------------------------------------------------------------------------+
|  Auxiliary Service: ft-auto-prune (Docker Socket cleaner for dangling images) |
+-------------------------------------------------------------------------------+
```

---

## Multi-Stage Container Builds

### Frontend & Docs Image (`ft-frontend`)
A 3-stage Dockerfile:
1. **Stage 1 (App Builder):** Builds the React Vite single-page application into static HTML/JS/CSS assets.
2. **Stage 2 (Docs Builder):** Installs isolated VitePress dependencies and builds static documentation to `.vitepress/dist/`.
3. **Stage 3 (Production Runner):** An Nginx Alpine image containing the Nginx reverse proxy configuration. It serves:
   - React SPA assets at `/usr/share/nginx/html/` (`/`)
   - VitePress docs assets at `/usr/share/nginx/html/docs/` (`/docs/`)

### Backend Image (`ft-backend`)
A 2-stage Dockerfile:
1. **Stage 1 (Builder):** Compiles TypeScript into JavaScript under `dist/`.
2. **Stage 2 (Runner):** Lightweight Node.js 22 runtime with only production dependencies (`npm ci --omit=dev`), the compiled `dist/` directory, and migration SQL files in `drizzle/`.

---

## Resource Constraints & Memory Optimization

To allow stable execution on small cloud instances (e.g., 1 GB VPS):

- **Database (`ft-db`):**
  - Memory limit: `384M` (reservation: `128M`).
  - PostgreSQL flags: `shared_buffers=64MB`, `work_mem=4MB`, `max_connections=25`.
- **Backend (`ft-backend`):**
  - Memory limit: `384M` (reservation: `128M`).
  - Node heap limit: `--max-old-space-size=256`.
- **Frontend / Nginx (`ft-frontend`):**
  - Memory limit: `64M` (reservation: `16M`).
  - Nginx proxy buffer tuning: 8 buffers of 16k.
