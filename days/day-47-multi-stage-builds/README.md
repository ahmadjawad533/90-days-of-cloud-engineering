# Day 47: Multi-Stage Builds and Best Practices
[← Previous Day](../day-46-container-registries/README.md) | [Next Day →](../day-48-what-is-kubernetes/README.md)

## Goal
Optimize container images for minimal size and hardened security using multi-stage builds, non-root users, and `.dockerignore` files.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Multi-Stage Builds Documentation](https://docs.docker.com/build/building/multi-stage/) — Official Docker guide demonstrating how to separate build dependencies from runtime environments.
- 📖 [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) — Official Docker recommendations for caching, image layers, security, and smaller image footprint.

## Do
Single-stage Dockerfiles often bundle compilation tools, headers, test suites, and temporary artifacts into the production image, increasing image size and expanding the security attack surface. **Multi-stage builds** solve this by using multiple `FROM` instructions in a single Dockerfile, transferring only the required runtime artifacts to the final lightweight image.

1. Navigate to the lab directory:
   ```bash
   cd "labs/docker"
   ```

2. Inspect the multi-stage build file [`Dockerfile.multistage`](../../labs/docker/Dockerfile.multistage):
   ```dockerfile
   # Stage 1: Build stage (builder)
   FROM python:3.11-slim AS builder
   WORKDIR /build
   RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*
   COPY requirements.txt .
   RUN pip install --no-cache-dir --user -r requirements.txt

   # Stage 2: Final runtime stage
   FROM python:3.11-slim AS runner
   WORKDIR /app
   RUN groupadd -r appgroup && useradd -r -g appgroup -s /sbin/nologin appuser
   COPY --from=builder /root/.local /home/appuser/.local
   COPY --chown=appuser:appgroup app.py .
   ENV PATH=/home/appuser/.local/bin:$PATH PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
   USER appuser
   EXPOSE 5000
   CMD ["python", "app.py"]
   ```

3. Create a `.dockerignore` file to prevent unnecessary files from bloating build contexts and busting layer caches:
   ```bash
   cat << 'EOF' > .dockerignore
   .git
   .gitignore
   __pycache__
   *.pyc
   *.pyo
   *.pyd
   .env
   .venv
   env/
   venv/
   *.md
   Dockerfile*
   docker-compose.yml
   EOF
   ```

4. Build both the standard single-stage image and the multi-stage image to compare them:
   ```bash
   # Build single-stage image
   docker build -f Dockerfile -t app:single-stage .

   # Build multi-stage image
   docker build -f Dockerfile.multistage -t app:multi-stage .
   ```

5. Compare image sizes, layer counts, and security attributes:
   ```bash
   docker images | grep -E "app\s+(single-stage|multi-stage)"
   ```
   Notice the multi-stage image separates build dependencies cleanly while creating an unprivileged user.

6. Inspect image history to see layer creation:
   ```bash
   docker history app:multi-stage
   ```

7. Verify that the multi-stage container runs as a non-root user:
   ```bash
   # Run the container
   docker run -d --name test-secure-app -p 5000:5000 app:multi-stage

   # Verify the user ID inside the running container
   docker exec test-secure-app whoami
   docker exec test-secure-app id
   ```
   The output confirms the process is running as `appuser` (UID > 100) instead of `root` (UID 0).

8. Test that the application functions normally:
   ```bash
   curl http://localhost:5000/
   ```

9. Clean up test container:
   ```bash
   docker rm -f test-secure-app
   ```

## Done When
- [ ] You created a `.dockerignore` file in the lab directory.
- [ ] You built the multi-stage image using [`labs/docker/Dockerfile.multistage`](../../labs/docker/Dockerfile.multistage).
- [ ] You compared image layers and sizes using `docker images` and `docker history`.
- [ ] You verified that the container executes under an unprivileged user (`appuser`).
- [ ] You tested the running container using `curl` and cleaned up the test instance.

## Cost and Cleanup
$0 — no cloud resources used (runs completely on your local workstation).

Remove the locally built comparison images:
```bash
docker rmi app:single-stage app:multi-stage 2>/dev/null || true
rm -f "labs/docker/.dockerignore"
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| AWS CodeBuild / ECR Image Scanning | Azure Container Registry (ACR) Tasks / Microsoft Defender for Containers | Cloud Build / Artifact Registry Vulnerability Scanning |
| IAM Least Privilege for Task Roles | Managed Identities for Azure Container Instances | Workload Identity for Cloud Run / GKE |

- 📖 [Azure Container Registry Build Tasks](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-tasks-overview)
- 📖 [Google Cloud Build Multi-stage Builds](https://cloud.google.com/build/docs/optimizing-builds/additional-steps-to-speed-up-builds)

## Stretch Goal
Use Docker BuildKit target caching or distroless base images:
1. Build only the `builder` stage for testing or linting using the `--target` flag:
   ```bash
   docker build --target builder -f Dockerfile.multistage -t app:builder-only .
   ```
2. Research GoogleContainerTools' `gcr.io/distroless/python3-debian12`, which excludes package managers, shells, and system utilities altogether.

## Common Mistakes
- **Running containers as `root` (UID 0):** By default, Docker runs container processes as root. If an application vulnerability leads to remote code execution, an attacker has root privileges within the container namespace. Always create and switch to a non-root `USER`.
- **Forgetting `.dockerignore`:** Omitting `.dockerignore` sends `.git` directories, secrets, and virtual environment folders to the Docker daemon during build context evaluation, inflating build times and risking credential leaks.
- **Copying the entire source before installing dependencies:** Placing `COPY . .` before `RUN pip install` invalidates layer caching whenever any source file changes, forcing dependencies to reinstall on every build. Always copy dependency lists (`requirements.txt`, `package.json`) and run installations first.
