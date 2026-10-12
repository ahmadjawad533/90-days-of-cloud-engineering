# Docker Cheatsheet

A practical quick reference for Docker engine operations, container management, networking, volumes, Compose orchestration, and Dockerfile optimization.

---

## Table of Contents
- [Image Management](#image-management)
- [Container Lifecycle](#container-lifecycle)
- [Common `docker run` Flags](#common-docker-run-flags)
- [Docker Networking](#docker-networking)
- [Volumes & Storage](#volumes--storage)
- [Docker Compose](#docker-compose)
- [Dockerfile Instructions](#dockerfile-instructions)
- [Multi-Stage Build Pattern](#multi-stage-build-pattern)
- [Containerization Best Practices](#containerization-best-practices)

---

## Image Management

Build, pull, tag, inspect, and remove OCI/Docker container images:

```bash
# Build images
docker build -t myapp:1.0.0 .                 # Build from Dockerfile in current directory
docker build -t myapp:latest -f Dockerfile.dev . # Build using specific Dockerfile
docker build --no-cache -t myapp:latest .     # Build without utilizing layer cache
docker build --build-arg ENV=production -t myapp:prod . # Pass build arguments

# Pull and Push
docker pull nginx:alpine                     # Pull image from Docker Hub
docker push registry.example.com/myapp:1.0.0 # Push image to remote registry

# Tagging and Listing
docker tag myapp:latest myrepo/myapp:v1.2.0  # Tag existing image with new alias
docker images                                # List local images (alias: docker image ls)
docker image history myapp:latest            # Inspect layer creation history

# Cleanup
docker rmi <image-id-or-name>                # Remove specific image
docker image prune                           # Remove dangling (untagged) images
docker image prune -a                        # Remove all unused images not tied to running containers
docker system prune -a --volumes             # Clean all unused containers, images, networks, and volumes
```

---

## Container Lifecycle

Run, manage, inspect, and troubleshoot containers:

```bash
# Starting and running
docker run -d --name web -p 8080:80 nginx:alpine # Run in background and publish port
docker start <container-id-or-name>          # Start an existing stopped container
docker restart <container-id-or-name>        # Restart container
docker stop <container-id-or-name>           # Graceful stop (sends SIGTERM then SIGKILL)
docker kill <container-id-or-name>           # Immediate stop (sends SIGKILL)

# Execution and interaction
docker exec -it web /bin/sh                  # Launch interactive shell inside running container
docker exec web printenv                     # Run single command inside container

# Listing and status
docker ps                                    # List running containers
docker ps -a                                 # List all containers (running and stopped)
docker ps -q                                 # Output container IDs only

# Logs and monitoring
docker logs <container-name>                 # Fetch container stdout/stderr
docker logs -f --tail 100 <container-name>   # Follow logs with last 100 lines
docker top <container-name>                  # Display active processes in container
docker stats                                 # Live stream of CPU, memory, network I/O per container

# Inspection and removal
docker inspect <container-name>              # Output detailed JSON metadata (IP, mounts, state)
docker rm <container-name>                   # Remove stopped container
docker rm -f <container-name>                # Force remove running container
docker container prune                       # Remove all stopped containers
```

---

## Common `docker run` Flags

| Flag | Meaning | Example |
| :--- | :--- | :--- |
| `-d` | Detached mode (runs in background) | `docker run -d nginx` |
| `-i` | Interactive (keeps STDIN open) | `docker run -i ubuntu` |
| `-t` | Allocate a pseudo-TTY terminal | `docker run -it alpine sh` |
| `-p <host>:<container>` | Publish container port to host port | `docker run -p 3000:80 app` |
| `-v <host>:<container>` | Bind mount or named volume | `docker run -v $(pwd):/app -v db_data:/var/lib/mysql mysql` |
| `-e <KEY=VALUE>` | Set environment variable | `docker run -e DB_PORT=5432 -e NODE_ENV=prod app` |
| `--env-file <file>` | Load variables from external file | `docker run --env-file .env.prod app` |
| `--name <name>` | Assign custom name to container | `docker run --name api-gateway app` |
| `--network <net>` | Attach container to user-defined network | `docker run --network backend-net redis` |
| `--rm` | Automatically remove container upon exit | `docker run --rm alpine uname -a` |
| `--restart <policy>` | Restart policy (`always`, `unless-stopped`, `on-failure`) | `docker run --restart unless-stopped web` |
| `-u <user>:<group>` | Run container as specific UID/GID | `docker run -u 1001:1001 node:alpine` |

---

## Docker Networking

Enable communication between containers and external services:

```bash
docker network ls                            # List all networks (bridge, host, none, custom)
docker network create my-net                 # Create custom bridge network
docker network create --driver bridge --subnet 172.28.0.0/16 app-net # Network with custom CIDR
docker network inspect my-net                # Inspect connected containers and IP leases
docker network connect my-net <container>    # Connect running container to network
docker network disconnect my-net <container> # Disconnect container from network
docker network rm my-net                     # Remove network
docker network prune                         # Remove all unused networks
```

> **DNS Note**: Containers connected to the default bridge can only reach each other by IP. Containers attached to a **user-defined bridge** network can resolve each other by container name via Docker's built-in DNS.

---

## Volumes & Storage

Manage persistent storage independent of container lifecycle:

```bash
docker volume ls                             # List all named volumes
docker volume create pg_data                 # Create named volume
docker volume inspect pg_data                # Inspect host mount point directory
docker volume rm pg_data                     # Remove specific volume
docker volume prune                          # Remove all unattached volumes

# Mount types:
# 1. Named volume:
docker run -d -v pg_data:/var/lib/postgresql/data postgres:16-alpine

# 2. Host Bind mount (read-write or read-only):
docker run -d -v /var/log/nginx:/var/log/nginx:ro nginx
```

---

## Docker Compose

Multi-container local orchestration utility (`docker compose` CLI):

```bash
docker compose up                            # Build and start services in foreground
docker compose up -d                         # Start services in detached background mode
docker compose up -d --build                 # Rebuild images before starting
docker compose down                          # Stop and remove containers and networks
docker compose down -v                       # Stop containers and remove named volumes
docker compose ps                            # List container states for current compose project
docker compose logs -f <service-name>        # Follow logs for specific service
docker compose exec <service-name> sh        # Execute interactive shell in running service
docker compose restart <service-name>        # Restart specific service container
docker compose config                        # Validate and view resolved Compose YAML file
```

---

## Dockerfile Instructions

| Instruction | Purpose & Description | Syntax Example |
| :--- | :--- | :--- |
| `FROM` | Sets the base image for subsequent instructions | `FROM python:3.11-slim` |
| `ARG` | Defines build-time variables passed via `--build-arg` | `ARG APP_VERSION=1.0.0` |
| `ENV` | Sets runtime environment variables inside container | `ENV PORT=8080 NODE_ENV=production` |
| `WORKDIR` | Sets the working directory for subsequent instructions | `WORKDIR /app` |
| `COPY` | Copies files from host build context into image | `COPY package*.json ./` |
| `ADD` | Copies files, automatically extracts tars, fetches remote URLs | `ADD https://example.com/asset.tar.gz /opt/` |
| `RUN` | Executes command during build and commits resulting layer | `RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*` |
| `EXPOSE` | Documents network ports intended for publishing | `EXPOSE 8080` |
| `USER` | Sets username/UID for subsequent commands and container execution | `USER nonroot:nonroot` |
| `HEALTHCHECK`| Configures health check test for container daemon | `HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8080/health || exit 1` |
| `ENTRYPOINT` | Configures container default executable | `ENTRYPOINT ["python", "app.py"]` |
| `CMD` | Provides default arguments for `ENTRYPOINT` or default command | `CMD ["--port", "8080"]` |

---

## Multi-Stage Build Pattern

Multi-stage builds decouple the build environment (compilers, build tools, SDKs) from the runtime environment, drastically reducing image size and attack surface:

```dockerfile
# --- Stage 1: Build & Compile ---
FROM golang:1.22-alpine AS builder

WORKDIR /src

# Leverage caching for Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source and compile static binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /bin/server .

# --- Stage 2: Minimal Runtime ---
FROM alpine:3.19

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /bin/server /app/server

USER appuser
EXPOSE 8080
ENTRYPOINT ["/app/server"]
```

---

## Containerization Best Practices

1. **Use Minimal Base Images**: Choose official minimal base images like Alpine Linux (`alpine`), Debian Slim (`-slim`), or Distroless (`gcr.io/distroless/static`).
2. **Combine `RUN` Commands**: Chain update and installation commands into a single `RUN` layer and clean package caches immediately in the same layer:
   ```dockerfile
   RUN apt-get update && apt-get install -y --no-install-recommends \
       curl \
       ca-certificates \
    && rm -rf /var/lib/apt/lists/*
   ```
3. **Never Run as Root**: Create and switch to a dedicated non-privileged user before the `ENTRYPOINT`:
   ```dockerfile
   RUN useradd -u 10001 -m appuser
   USER appuser
   ```
4. **Leverage Layer Caching**: Order instructions from least frequently changed to most frequently changed (copy lockfiles and download dependencies before copying source code).
5. **Always Use a `.dockerignore`**: Prevent build context bloat and credential leaks by ignoring unnecessary files:
   ```dockerignore
   .git
   node_modules
   __pycache__
   *.log
   .env
   Dockerfile
   .dockerignore
   ```
