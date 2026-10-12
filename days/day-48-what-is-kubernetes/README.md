# Day 48: What Is Kubernetes?
[← Previous Day](../day-47-multi-stage-builds/README.md) | [Next Day →](../day-49-kubernetes-architecture/README.md)

## Goal
Understand the core purpose of container orchestration and install `kubectl` alongside a local development Kubernetes cluster using Minikube or Kind.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Kubernetes Documentation Overview](https://kubernetes.io/docs/home/) — Official introduction to Kubernetes, container orchestration challenges, and core platform capabilities.
- 📖 [Install and Set Up kubectl](https://kubernetes.io/docs/tasks/tools/) — Official installation instructions for the Kubernetes command-line interface (`kubectl`).
- 📖 [minikube Start Guide](https://minikube.sigs.k8s.io/docs/start/) — Official getting-started documentation for running a single-node Kubernetes cluster locally.

## Do
While Docker runs individual containers on a single host, production cloud systems require managing hundreds or thousands of containers across fleets of physical or virtual machines. **Kubernetes** (often abbreviated as **K8s**) is an open-source container orchestration engine that automates container deployment, scaling, health checking, self-healing, and networking.

### Part 1: Verify or Install `kubectl`

1. Check if `kubectl` is already installed on your system:
   ```bash
   kubectl version --client --output=yaml
   ```

2. If `kubectl` is not present, install the latest stable binary on Linux:
   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   chmod +x kubectl
   sudo mv kubectl /usr/local/bin/
   kubectl version --client
   ```

### Part 2: Start a Local Cluster (Minikube or Kind)

3. Verify that your Docker daemon is running (Minikube and Kind use Docker containers as cluster nodes):
   ```bash
   docker info >/dev/null && echo "Docker is running" || echo "Please start Docker first"
   ```

4. Choose either **Minikube** or **Kind** (Kubernetes in Docker). To start with Minikube:
   ```bash
   # If minikube is not installed:
   # curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
   # sudo install minikube-linux-amd64 /usr/local/bin/minikube

   minikube start --driver=docker
   ```

   *(Alternative using Kind):*
   ```bash
   # If using kind instead of minikube:
   # curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.22.0/kind-linux-amd64 && chmod +x ./kind && sudo mv ./kind /usr/local/bin/kind
   # kind create cluster --name local-dev
   ```

5. Confirm cluster connectivity and view cluster endpoints:
   ```bash
   kubectl cluster-info
   ```

6. Inspect the cluster nodes:
   ```bash
   kubectl get nodes -o wide
   ```
   You should see one node in the `Ready` status.

### Part 3: Deploy Your First Pod

7. Run an ad-hoc container (a Pod) using the imperative command:
   ```bash
   kubectl run test-nginx --image=nginx:alpine --port=80
   ```

8. Check the status of your Pod:
   ```bash
   kubectl get pods -o wide
   ```
   Wait until the Pod status transitions from `ContainerCreating` to `Running`.

9. View the Pod's detailed events and metadata:
   ```bash
   kubectl describe pod test-nginx
   ```
   Notice the events at the bottom showing image pulling, container creation, and startup.

10. Forward traffic from your local machine to the Pod port:
    ```bash
    kubectl port-forward pod/test-nginx 8080:80 &
    PORT_FORWARD_PID=$!
    sleep 2

    # Query the running Pod
    curl -s http://localhost:8080 | grep -i "Welcome to nginx"
    ```

11. Clean up the forward process and delete the test Pod:
    ```bash
    kill $PORT_FORWARD_PID 2>/dev/null || true
    kubectl delete pod test-nginx
    ```

## Done When
- [ ] `kubectl` is installed and verified via `kubectl version --client`.
- [ ] A local Kubernetes cluster (Minikube or Kind) is running.
- [ ] `kubectl cluster-info` and `kubectl get nodes` return an active node in `Ready` status.
- [ ] You launched an Nginx Pod with `kubectl run` and inspected it using `kubectl describe pod`.
- [ ] You accessed the Pod via `kubectl port-forward` and successfully deleted the Pod.

## Cost and Cleanup
$0 — no cloud resources used (runs completely on your local workstation using Minikube or Kind).

To stop the cluster when finished:
```bash
# If using minikube:
minikube stop

# To completely delete the local cluster VM/containers:
# minikube delete
# (or if using kind: kind delete cluster --name local-dev)
```

## Stretch Goal
Enable bash shell autocompletion for `kubectl` so you can press `Tab` to complete resource types and pod names:
```bash
echo "source <(kubectl completion bash)" >> ~/.bashrc
source ~/.bashrc
```
Try typing `kubectl get no` and press `Tab`—it will autocomplete to `kubectl get nodes`.

## Common Mistakes
- **Confusing Docker with Kubernetes:** Docker is a container runtime used to package and execute single containers. Kubernetes is an orchestrator that coordinates multiple hosts running Docker (or containerd) runtimes.
- **Running `kubectl` without a started cluster:** If you run `kubectl get nodes` before starting Minikube or Kind, you will see `The connection to the server localhost:8080 was refused`. Always start your local cluster first.
- **Using imperative `kubectl run` for production deployments:** `kubectl run` creates a standalone unmanaged Pod without replica guarantees or automatic healing. In production, always use declarative Deployments.
