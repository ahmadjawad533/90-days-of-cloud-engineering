# Day 42: Docker Installation and Basics
[← Previous Day](../day-41-what-are-containers/README.md) | [Next Day →](../day-43-dockerfiles/README.md)

## Goal
Install the Docker Engine and master essential Docker CLI commands to run, inspect, manage, and remove containerized applications.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Docker Engine Installation Guides](https://docs.docker.com/engine/install/) — Official documentation detailing installation steps across Ubuntu, Debian, Fedora, macOS, and Windows.
- 📖 [Docker CLI Container Run Reference](https://docs.docker.com/reference/cli/docker/container/run/) — Official reference for `docker run`, flags (`-d`, `-it`, `-p`, `--name`), and process execution.

## Do
1. Verify or install Docker on your machine.
   - For Ubuntu / Debian / WSL2:
     ```bash
     # Check if Docker is already installed
     docker --version
     ```
     If Docker is not installed, install the Docker Engine following the [official Ubuntu guide](https://docs.docker.com/engine/install/ubuntu/):
     ```bash
     sudo apt-get update
     sudo apt-get install -y ca-certificates curl gnupg
     sudo install -m 0755 -d /etc/apt/keyrings
     curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
     sudo chmod a+r /etc/apt/keyrings/docker.gpg

     echo \
       "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
       $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
       sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

     sudo apt-get update
     sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
     ```

2. Test your Docker installation with the standard hello-world container:
   ```bash
   sudo docker run hello-world
   ```
   Observe the output: Docker looks for the image locally, doesn't find it, downloads it from Docker Hub, and runs it inside a new container.

3. Run an interactive container using an official Ubuntu image:
   ```bash
   sudo docker run -it --name my-ubuntu ubuntu:22.04 bash
   ```
   You are now inside the container shell! Test a few commands inside the container:
   ```bash
   cat /etc/os-release
   whoami
   exit
   ```

4. Run a background (detached) web server using Nginx with port forwarding:
   ```bash
   sudo docker run -d --name my-web -p 8080:80 nginx:alpine
   ```

5. Verify that the web server is running and accessible:
   ```bash
   curl http://localhost:8080
   ```
   You should see the default "Welcome to nginx!" HTML response.

6. Inspect active and stopped containers:
   ```bash
   # List currently running containers
   sudo docker ps

   # List all containers (including exited ones)
   sudo docker ps -a

   # Check logs of the running web container
   sudo docker logs my-web

   # Check resource usage (CPU/Memory)
   sudo docker stats --no-stream
   ```

7. Stop and clean up the test containers:
   ```bash
   sudo docker stop my-web
   sudo docker rm my-web my-ubuntu
   ```

## Done When
- [ ] `docker --version` reports a modern Docker version.
- [ ] You successfully ran `docker run hello-world` and inspected the download process.
- [ ] You interacted with a container shell using `docker run -it`.
- [ ] You ran a detached web container (`-d`), mapped port `8080:80`, and verified the response via `curl`.
- [ ] You practiced container lifecycle commands: `docker ps`, `docker logs`, `docker stop`, and `docker rm`.

## Cost and Cleanup
$0 — no cloud resources used (runs 100% locally).

Clean up local images and containers created during this lab:
```bash
sudo docker stop my-web 2>/dev/null || true
sudo docker rm my-web my-ubuntu 2>/dev/null || true
sudo docker rmi hello-world nginx:alpine ubuntu:22.04 2>/dev/null || true
```

## Stretch Goal
Avoid typing `sudo` for every Docker command by adding your Linux user account to the `docker` group:
```bash
sudo usermod -aG docker $USER
```
Log out and log back in (or run `newgrp docker`) to apply the change, then verify running `docker ps` without `sudo`. Research the security implication: members of the `docker` group have privileges equivalent to root on the host system because the Docker daemon runs with root privileges.

## Common Mistakes
- **Permission denied connecting to docker.sock:** If running `docker ps` throws `permission denied while trying to connect to the Docker daemon socket`, either prepend commands with `sudo` or add your user to the `docker` group and re-authenticate.
- **Port mapping confusion (`-p HOST:CONTAINER`):** A common mistake is flipping the ports. The syntax is always `host_port:container_port`. For example, `-p 8080:80` maps host port 8080 to container port 80.
- **Thinking `docker stop` deletes the container:** Stopping a container only halts its execution. The container files and configuration still exist on disk. Use `docker rm <container-id>` to permanently delete the container, or use `docker run --rm` to auto-remove when it exits.
