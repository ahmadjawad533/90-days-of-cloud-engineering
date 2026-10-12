# Day 49: Kubernetes Architecture
[← Previous Day](../day-48-what-is-kubernetes/README.md) | [Next Day →](../day-50-pods-replicasets-deployments/README.md)

## Goal
Explore and inspect the core architecture of a Kubernetes cluster, distinguishing between Control Plane components and Worker Node components.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Kubernetes Cluster Architecture](https://kubernetes.io/docs/concepts/architecture/) — Official architecture guide detailing Control Plane and Worker Node separation.
- 📖 [Kubernetes Components Reference](https://kubernetes.io/docs/concepts/overview/components/) — In-depth breakdown of `kube-apiserver`, `etcd`, `kube-scheduler`, `kube-controller-manager`, `kubelet`, and `kube-proxy`.

## Do
A Kubernetes cluster consists of two distinct functional layers:
1. **Control Plane:** The cluster brain that makes global decisions (scheduling, detecting node failures, maintaining desired state).
2. **Worker Nodes:** The workhorse machines that run containerized workloads.

### Understanding the Key Components

| Component | Layer | Purpose |
|---|---|---|
| **kube-apiserver** | Control Plane | Front-end for the control plane. Exposes the Kubernetes HTTP REST API. All internal and external tools (`kubectl`, worker nodes) communicate solely through it. |
| **etcd** | Control Plane | Consistent, highly-available key-value store holding the entire cluster state and configuration. |
| **kube-scheduler** | Control Plane | Watches for newly created Pods with no assigned node and selects the best worker node for them based on resource requirements, taints, and affinity rules. |
| **kube-controller-manager**| Control Plane | Runs controller reconciliation processes (Node Controller, Job Controller, EndpointSlice Controller, ServiceAccount Controller). |
| **kubelet** | Worker Node | Agent running on each node ensuring that containers described in PodSpecs are running and healthy by communicating with the container runtime via CRI (Container Runtime Interface). |
| **kube-proxy** | Worker Node | Network proxy running on each node that maintains network rules (using iptables or IPVS) to allow network communication to Pods from inside or outside the cluster. |
| **CoreDNS** | Cluster Add-on | Provides internal cluster DNS resolution (translating service names like `redis` to cluster IP addresses). |

### Hands-on: Inspect Your Cluster Components

1. Ensure your local cluster (Minikube or Kind) is running:
   ```bash
   kubectl cluster-info
   ```

2. List all internal control plane and system pods running in the `kube-system` namespace:
   ```bash
   kubectl get pods -n kube-system -o wide
   ```
   Notice the pods: `kube-apiserver`, `etcd`, `kube-scheduler`, `kube-controller-manager`, `kube-proxy`, and `coredns`.

3. Inspect the `kube-apiserver` pod logs:
   ```bash
   APISERVER_POD=$(kubectl get pods -n kube-system -l component=kube-apiserver -o jsonpath="{.items[0].metadata.name}")
   kubectl logs -n kube-system "${APISERVER_POD}" --tail=30
   ```

4. Inspect the cluster node's hardware capacity, allocatable resources, and system details:
   ```bash
   NODE_NAME=$(kubectl get nodes -o jsonpath="{.items[0].metadata.name}")
   kubectl describe node "${NODE_NAME}"
   ```
   Scroll through the output and observe:
   - **Conditions:** `MemoryPressure`, `DiskPressure`, `PIDPressure`, `Ready`.
   - **Addresses:** InternalIP, Hostname.
   - **Capacity / Allocatable:** CPU cores, memory limits, and max pods allowed.
   - **System Info:** OS Image, Kernel Version, Container Runtime version (`containerd://...`), and Kubelet version.

5. View all supported API resource types in your cluster and their short names:
   ```bash
   kubectl api-resources
   ```
   Notice column values like `SHORTNAMES` (`po` for pods, `deploy` for deployments, `svc` for services) and `NAMESPACED` (whether the resource belongs to a namespace).

6. View recent cluster events across all namespaces to understand the control plane's reconciliation actions:
   ```bash
   kubectl get events -A --sort-by='.metadata.creationTimestamp' | tail -n 20
   ```

## Done When
- [ ] You identified the 4 main Control Plane components and 2 main Worker Node components.
- [ ] You listed all system pods running in the `kube-system` namespace.
- [ ] You inspected the node configuration, resource capacity, and container runtime using `kubectl describe node`.
- [ ] You explored supported API resources and shortnames using `kubectl api-resources`.
- [ ] You sorted and examined recent cluster events using `kubectl get events`.

## Cost and Cleanup
$0 — no cloud resources used (runs completely on your local workstation).

If you are pausing your study session, you can stop the local cluster:
```bash
minikube stop
```

## Stretch Goal
Inspect static pod manifests inside the control plane host. In standard Kubernetes installations, static pods for etcd, api-server, scheduler, and controller-manager are configured via YAML files in `/etc/kubernetes/manifests`:
```bash
# If using minikube:
minikube ssh "sudo ls -la /etc/kubernetes/manifests"
minikube ssh "sudo cat /etc/kubernetes/manifests/kube-apiserver.yaml | grep 'image:'"
```

## Common Mistakes
- **Believing `kube-apiserver` runs containers directly:** The API server never executes containers. It only validates and persists pod manifests to `etcd`. The `kubelet` agent on the worker node receives the pod specification and instructs the container runtime (`containerd` or `CRI-O`) to start the container.
- **Directly modifying `etcd`:** Never attempt to write to or edit `etcd` directly. All operations must pass through the `kube-apiserver` to ensure schema validation, authentication, and authorization.
- **Confusing scheduling with reconciliation:** The `kube-scheduler` only decides *which* node a pod should be placed on. The `kube-controller-manager` is responsible for detecting drift and creating replacement pods when nodes fail or pods crash.
