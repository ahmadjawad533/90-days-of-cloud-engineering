# Day 43: Dockerfiles and Building Images
[← Previous Day](../day-42-docker-basics/README.md) | [Next Day →](../day-44-docker-networking-volumes/README.md)

## Goal
Write an optimized Dockerfile, understand how layer caching accelerates builds, package a custom Python Flask application into an image, and run it locally.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Dockerfile Reference](https://docs.docker.com/reference/dockerfile/) — Official specification for all Dockerfile instructions including `FROM`, `WORKDIR`, `COPY`, `RUN`, `ENV`, `EXPOSE`, and `CMD`.
- 📖 [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) — Official best practices covering image layer minimization, build cache optimization, and security hygiene.

## Do
In this lab, you will use the sample application and Dockerfile located in the repository under [`labs/docker/`](../../labs/docker/).

1. Navigate to the Docker lab folder in your terminal:
   ```bash
   cd "labs/docker"
   ```

2. Inspect the application files:
   - Examine [`app.py`](../../labs/docker/app.py) — a simple Flask web service that provides a greeting and a `/health` endpoint.
   - Examine [`requirements.txt`](../../labs/docker/requirements.txt) — declares dependencies (`flask`, `redis`).
   - Examine [`Dockerfile`](../../labs/docker/Dockerfile):
     ```dockerfile
     # Use an official lightweight Python image
     FROM python:3.11-slim

     # Set working directory inside container
     WORKDIR /app

     # Set environment variables to prevent Python from writing pyc files and buffering stdout/stderr
     ENV PYTHONDONTWRITEBYTECODE=1 \
         PYTHONUNBUFFERED=1

     # Copy requirements file first for layer caching
     COPY requirements.txt .

     # Install dependencies
     RUN pip install --no-cache-dir -r requirements.txt

     # Copy application source code
     COPY app.py .

     # Expose port 5000 for web traffic
     EXPOSE 5000

     # Run Flask application using python
     CMD ["python", "app.py"]
     ```

3. Notice the layer caching design:
   - `COPY requirements.txt .` and `RUN pip install ...` come **before** `COPY app.py .`.
   - When you edit your application code in `app.py`, Docker will reuse the cached dependency layer and skip re-downloading packages, saving substantial build time!

4. Build your custom Docker image with the tag `cloud-flask-app:1.0`:
   ```bash
   docker build -t cloud-flask-app:1.0 .
   ```
   *(Note the period `.` at the end, which sets the current directory as the build context).*

5. Inspect your newly created image and its constituent layers:
   ```bash
   # List images to verify size and image ID
   docker images | grep cloud-flask-app

   # Inspect each layer instruction and its size contribution
   docker history cloud-flask-app:1.0
   ```

6. Run a container from your custom image in detached mode:
   ```bash
   docker run -d --name my-flask-app -p 5000:5000 cloud-flask-app:1.0
   ```

7. Test your running container endpoints:
   ```bash
   # Check the main greeting endpoint
   curl http://localhost:5000/

   # Check the health check endpoint
   curl http://localhost:5000/health
   ```

8. Test layer caching in practice:
   - Add a comment or print statement to `app.py`.
   - Rebuild the image with tag `cloud-flask-app:1.1`:
     ```bash
     docker build -t cloud-flask-app:1.1 .
     ```
   - Notice how steps 1 through 5 output `CACHED` and finish in under 1 second.

## Done When
- [ ] You reviewed and can explain every instruction in [`labs/docker/Dockerfile`](../../labs/docker/Dockerfile).
- [ ] You built the image using `docker build -t cloud-flask-app:1.0 .`.
- [ ] You inspected image layers using `docker history`.
- [ ] You ran the container and received HTTP 200 JSON responses on port 5000.
- [ ] You experienced Docker layer caching when rebuilding the image.

## Cost and Cleanup
$0 — no cloud resources used (runs locally).

To tear down the running container and clean up the test images:
```bash
docker stop my-flask-app 2>/dev/null || true
docker rm my-flask-app 2>/dev/null || true
docker rmi cloud-flask-app:1.0 cloud-flask-app:1.1 2>/dev/null || true
```

## Stretch Goal
Create a `.dockerignore` file in `labs/docker/` with the following contents:
```
__pycache__/
*.pyc
*.pyo
*.pyd
.git
.env
.pytest_cache/
```
Verify that excluded files are no longer sent to the Docker daemon build context. Read about multi-stage builds in the Docker documentation to see how compiled languages separate the build environment from the minimal runtime image.

## Common Mistakes
- **Forgetting the build context dot (`.`):** Running `docker build -t my-app` without the final dot will result in a syntax error because Docker requires the path to the build context.
- **Copying source code before installing dependencies:** Placing `COPY . .` before `RUN pip install` causes Docker to invalidate the cache and reinstall all packages whenever any file in the directory changes.
- **Using heavy base images:** Using `FROM python:3.11` (full Debian, ~1GB) instead of `FROM python:3.11-slim` or `alpine` produces bloated images that take longer to build, pull, and scan.
