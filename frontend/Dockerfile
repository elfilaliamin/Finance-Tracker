# Stage 1: Build React Vite SPA
FROM node:22-alpine AS app-builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Standalone VitePress Documentation
FROM node:22-alpine AS docs-builder
RUN apk add --no-cache git
WORKDIR /docs

COPY docs/package*.json ./
RUN npm ci

COPY docs/ ./
RUN npm run docs:build

# Stage 3: Production Nginx Runner
FROM nginx:alpine AS runner
COPY frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=app-builder /app/dist /usr/share/nginx/html
COPY --from=docs-builder /docs/.vitepress/dist /usr/share/nginx/html/docs

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
