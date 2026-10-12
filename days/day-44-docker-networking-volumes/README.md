# Day 44: Docker Networking and Volumes
[← Previous Day](../day-43-dockerfiles/README.md) | [Next Day →](../day-45-docker-compose/README.md)

## Goal
Master Docker networking to enable secure inter-container communication using built-in DNS, and configure Docker volumes and bind mounts for robust data persistence.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Docker Networking Overview](https://docs.docker.com/network/) — Official documentation on Docker network drivers (bridge, host, overlay), network isolation, and user-defined bridge networks.
- 📖 [Docker Storage and Volumes Guide](https://docs.docker.com/storage/) — Official guide detailing the key differences between named volumes, bind mounts, and temporary storage (tmpfs).

## Do
### Part 1: Docker Networking and DNS Resolution

1. View the default networks created by the Docker daemon:
   ```bash
   docker network ls
   ```
   You will see three default networks: `bridge`, `host`, and `none`.

2. Create a user-defined bridge network named `app-net`:
   ```bash
   docker network create app-net
   ```
   > **Why custom bridge networks matter:** Containers attached to user-defined bridge networks automatically resolve each other by container name via Docker's embedded DNS server. The default `bridge` network does NOT support automatic name resolution!

3. Launch a Redis container attached to `app-net`:
   ```bash
   docker run -d --name redis-server --network app-net redis:7-alpine
   ```

4. Verify DNS resolution from another container on the same network:
   ```bash
   docker run --rm --network app-net alpine ping -c 3 redis-server
   ```
   Notice that `redis-server` resolves directly to the internal IP address assigned by Docker!

5. Connect the Flask web application from Day 43 to the same network:
   ```bash
   docker run -d \
     --name flask-app \
     --network app-net \
     -e REDIS_HOST=redis-server \
     -p 5000:5000 \
     cloud-flask-app:1.0
   ```

6. Send requests to the web app:
   ```bash
   curl http://localhost:5000/
   curl http://localhost:5000/
   ```
   Notice that `redis_connected` is now `true`, and the `visits` counter increments with every request.

---

### Part 2: Persistent Storage with Docker Volumes

7. Inspect container ephemeral behavior: By default, any data written inside a container lives in the writable container layer and is permanently lost when the container is deleted. To persist data, we use **Docker Volumes**.

8. Create a named volume for database persistence:
   ```bash
   docker volume create db-data
   docker volume ls
   docker volume inspect db-data
   ```

9. Launch a Redis container using the volume:
   ```bash
   docker run -d --name persistent-redis -v db-data:/data redis:7-alpine
   ```

10. Store a key-value pair in Redis and force an immediate save to disk:
    ```bash
    docker exec persistent-redis redis-cli set engineer "Cloud Hero"
    docker exec persistent-redis redis-cli save
    docker exec persistent-redis redis-cli get engineer
    ```

11. Simulate a container failure by forcefully stopping and deleting the container:
    ```bash
    docker rm -f persistent-redis
    ```

12. Start a brand-new container attached to the existing `db-data` volume:
    ```bash
    docker run -d --name new-redis -v db-data:/data redis:7-alpine
    ```

13. Retrieve the key from the new container:
    ```bash
    docker exec new-redis redis-cli get engineer
    ```
    The value `"Cloud Hero"` is retrieved! Your data survived the container destruction.

14. Test a host **Bind Mount** (commonly used in development environments for live code reloading):
    ```bash
    # Mount the current directory into an alpine container's /workspace
    docker run --rm -v "$(pwd):/workspace" -w /workspace alpine ls -la
    ```

## Done When
- [ ] You created a custom bridge network and verified container name resolution with `ping`.
- [ ] You connected two separate containers (`flask-app` and `redis-server`) across a shared custom network.
- [ ] You created a named Docker volume (`db-data`) and mounted it to a container.
- [ ] You verified data persistence by deleting a container and recovering its state in a replacement container.
- [ ] You can describe the differences between named volumes and host bind mounts.

## Cost and Cleanup
$0 — all resources run locally on your system.

Clean up the lab containers, network, and volume:
```bash
docker rm -f flask-app redis-server new-redis 2>/dev/null || true
docker network rm app-net 2>/dev/null || true
docker volume rm db-data 2>/dev/null || true
```

## Stretch Goal
Inspect a running container's network namespace and settings using `docker inspect flask-app --format '{{json .NetworkSettings.Networks}}' | jq`. Research the `host` network driver (`--network host`) to understand how high-performance services bypass the Docker virtual bridge.

## Common Mistakes
- **Assuming the default `bridge` provides DNS lookup:** Containers on the default `bridge` network cannot resolve each other by container name (e.g. `ping redis-server` fails). Always create a user-defined network (`docker network create`) for multi-container communication.
- **Forgetting that container storage is ephemeral:** Writing database files or stateful uploads directly into the container filesystem without a volume means data will be destroyed when the container is recreated or upgraded.
- **Using relative paths for bind mounts:** Bind mounts require absolute paths (e.g., `-v "$(pwd)/data:/data"` instead of `-v "./data:/data"`).
