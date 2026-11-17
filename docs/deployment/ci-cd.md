# CI/CD & Automated Pruning

Finance Tracker leverages GitHub Actions for automated continuous integration, container packaging to GitHub Container Registry (GHCR), and Portainer webhook deployment.

---

## Deployment Pipeline Overview

```
 [Push to main]
        |
        v
 [GitHub Actions Workflow]
   - Matrix Build:
       * ft-backend (Node 22 Builder -> Node 22 Runner)
       * ft-frontend (React Builder + Docs Builder -> Nginx Runner)
   - Push latest tags to ghcr.io
        |
        v
 [Portainer Webhook Trigger]
   - Portainer receives POST webhook
   - Pulls updated :latest images
   - Restarts containers with zero downtime
        |
        v
 [ft-auto-prune Background Worker]
   - Automatically prunes dangling (untagged) images
   - Prevents host disk exhaustion
```

---

## Continuous Integration Workflow

The GitHub Actions workflow defined in `.github/workflows/build.yml` runs on every push to the `main` branch:

1. **Checkout Repository:** Fetches source code.
2. **Setup Docker Buildx:** Enables advanced layer caching via `type=gha`.
3. **Registry Authentication:** Authenticates against `ghcr.io` using the repository's `GITHUB_TOKEN`.
4. **Build & Push:** Compiles images in parallel:
   - `ghcr.io/<owner>/ft-backend:latest`
   - `ghcr.io/<owner>/ft-frontend:latest`
5. **Webhook Dispatch:** Sends a POST request to `PORTAINER_WEBHOOK` secret to instruct Portainer to pull and recreate the application stack.

---

## Automated Dangling Image Pruning

### The Problem
Whenever Portainer or Docker pulls a newer `:latest` image tag, the previous image version loses its tag and becomes an orphaned, dangling image (`<none>:<none>`). Over time, these images consume server storage.

### The Solution: `ft-auto-prune`
The stack includes a background worker service in `docker-compose.yml`:

```yaml
auto-prune:
  image: docker:cli
  container_name: ft-auto-prune
  restart: unless-stopped
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
  command: >
    sh -c "while true; do
      sleep 86400;
      docker image prune -f;
    done"
```

- Mounts the host Docker socket in read-only mode (`:ro`).
- Runs every 24 hours (`86400` seconds).
- Safely removes only untagged dangling images without interrupting running containers or named cached layers.
