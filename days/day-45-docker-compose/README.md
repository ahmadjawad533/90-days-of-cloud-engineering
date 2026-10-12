# Day 45: Docker Compose
[← Previous Day](../day-44-docker-networking-volumes/README.md) | [Next Day →](../day-46-container-registries/README.md)

## Goal
Declaratively define, configure, and orchestrate a multi-container application stack (web application + database) using Docker Compose.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Docker Compose Overview](https://docs.docker.com/compose/) — Official documentation explaining multi-container orchestration, Compose commands, and project lifecycles.
- 📖 [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/) — Official reference covering `services`, `build`, `ports`, `environment`, `depends_on`, and `volumes`.

## Do
Rather than typing lengthy `docker run` commands with dozens of flags for every container, network, and volume, **Docker Compose** lets you define your entire application architecture in a single declarative YAML configuration.

1. Verify that the Docker Compose CLI plugin is installed:
   ```bash
   docker compose version
   ```
   *(Note: Modern Docker uses `docker compose` with a space, which replaces the legacy standalone `docker-compose` v1 tool).*

2. Navigate to the lab directory:
   ```bash
   cd "labs/docker"
   ```

3. Review the declarative configuration in [`docker-compose.yml`](../../labs/docker/docker-compose.yml):
   ```yaml
   services:
     web:
       build: .
       container_name: cloud-web-app
       ports:
         - "5000:5000"
       environment:
         - REDIS_HOST=redis
         - REDIS_PORT=6379
       depends_on:
         - redis
       restart: unless-stopped

     redis:
       image: redis:7-alpine
       container_name: cloud-redis
       ports:
         - "6379:6379"
       volumes:
         - redis_data:/data
       restart: unless-stopped

   volumes:
     redis_data:
   ```

4. Key concepts to note in this file:
   - **Automatic Networking:** Docker Compose automatically creates a shared default network for all services in the file. The `web` service can communicate with Redis using the hostname `redis`.
   - **`build: .`**: Directs Compose to build the local Dockerfile before launching the service.
   - **`depends_on`**: Dictates container startup order (`redis` starts before `web`).
   - **`volumes`**: Declaratively defines persistent storage (`redis_data`) mounted to `/data`.

5. Launch the entire application stack in detached mode:
   ```bash
   docker compose up -d --build
   ```
   Notice how Docker builds the image, creates the network, creates the volume, and starts both containers simultaneously.

6. Inspect running services and their health status:
   ```bash
   docker compose ps
   ```

7. Stream unified, color-coded logs across all containers in the stack:
   ```bash
   docker compose logs -f --tail=20
   ```
   *(Press `Ctrl+C` to stop streaming logs).*

8. Test the running multi-tier application:
   ```bash
   curl http://localhost:5000/
   curl http://localhost:5000/
   curl http://localhost:5000/
   ```
   Each request increments the visitor counter stored inside Redis!

9. Run an ad-hoc command inside one of the managed containers:
   ```bash
   docker compose exec redis redis-cli get visits
   ```

10. Practice Compose lifecycle commands:
    ```bash
    # Temporarily pause containers
    docker compose stop

    # Resume containers
    docker compose start

    # View process list in the stack
    docker compose top
    ```

11. Tear down the stack:
    ```bash
    docker compose down
    ```
    To also delete the persistent volume, run:
    ```bash
    docker compose down -v
    ```

## Done When
- [ ] You confirmed Docker Compose plugin is working (`docker compose version`).
- [ ] You reviewed each section of [`labs/docker/docker-compose.yml`](../../labs/docker/docker-compose.yml).
- [ ] You started the entire two-tier stack with `docker compose up -d`.
- [ ] You verified container status with `docker compose ps` and logs with `docker compose logs`.
- [ ] You verified that `web` successfully communicated with `redis` over the automatic Compose network.
- [ ] You gracefully stopped and tore down the stack using `docker compose down -v`.

## Cost and Cleanup
$0 — no cloud resources used (runs completely on your local workstation).

To ensure all containers, networks, and lab volumes are completely cleaned up:
```bash
cd "labs/docker"
docker compose down -v 2>/dev/null || true
```

## Stretch Goal
Create a `.env` file in `labs/docker/` with the following variables:
```
WEB_PORT=8000
REDIS_VERSION=7-alpine
```
Update [`docker-compose.yml`](../../labs/docker/docker-compose.yml) to use `${WEB_PORT}:5000` and `image: redis:${REDIS_VERSION}`. Relaunch with `docker compose up -d` to see how environment variables make Compose configurations dynamic across development and production environments.

## Common Mistakes
- **Assuming `depends_on` waits for application readiness:** `depends_on` only waits until the container has started, not until the application inside (like Redis or PostgreSQL) is ready to accept socket connections. For production systems, combine `depends_on` with `condition: service_healthy` and a container `healthcheck`.
- **Typing legacy `docker-compose` instead of `docker compose`:** The hyphenated command `docker-compose` is v1 (deprecated Python binary). Always use the modern `docker compose` CLI plugin.
- **Forgetting that `docker compose down` preserves volumes:** Running `docker compose down` stops containers and removes networks, but preserves named volumes to prevent accidental data loss. Add the `-v` flag (`docker compose down -v`) if you explicitly want a completely fresh database state.
