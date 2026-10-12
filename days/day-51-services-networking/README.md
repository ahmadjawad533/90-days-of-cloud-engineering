# Day 51: Services and Networking in Kubernetes
[← Previous Day](../day-50-pods-replicasets-deployments/README.md) | [Next Day →](../day-52-configmaps-secrets-storage/README.md)

## Goal
Expose, load-balance, and discover containerized applications using Kubernetes Services (ClusterIP, NodePort, LoadBalancer) and CoreDNS.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Kubernetes Services](https://kubernetes.io/docs/concepts/services-networking/service/) — Official documentation explaining how to expose applications running on a set of Pods as network services.
- 📖 [DNS for Services and Pods](https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/) — Official guide covering internal DNS name resolution, FQDN formatting, and CoreDNS lookups.

## Do
Because Pods are ephemeral—frequently created, destroyed, and rescheduled with dynamic IP addresses—clients cannot connect directly to Pod IPs. A **Kubernetes Service** provides a single stable IP address, a persistent internal DNS name, and automatic load balancing across all matching backend Pods.

### Service Types

| Type | Accessibility | Primary Use Case |
|---|---|---|
| **ClusterIP** | Internal cluster only (Default) | Communication between internal microservices (e.g., frontend talking to backend API or database). |
| **NodePort** | External via `<NodeIP>:<NodePort>` (Port range: 30000–32767) | Direct external debugging or non-cloud bare-metal environments. |
| **LoadBalancer** | External via cloud provider load balancer (e.g., AWS NLB/ALB) | Production internet-facing traffic in cloud environments like EKS, AKS, or GKE. |
| **ExternalName** | Internal alias pointing to an external DNS name (CNAME) | Mapping external third-party APIs into the cluster namespace. |

### Hands-on: Deploy and Expose Services

1. Ensure the ConfigMap and Deployment from Day 50 are deployed:
   ```bash
   kubectl apply -f labs/kubernetes/configmap.yaml
   kubectl apply -f labs/kubernetes/deployment.yaml
   kubectl get pods -l app=cloud-web
   ```

2. Review the declarative Service manifest in [`labs/kubernetes/service.yaml`](../../labs/kubernetes/service.yaml):
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: cloud-web-service
     labels:
       app: cloud-web
   spec:
     type: ClusterIP
     selector:
       app: cloud-web
     ports:
       - protocol: TCP
         port: 80
         targetPort: 80
   ```

3. Apply the Service:
   ```bash
   kubectl apply -f labs/kubernetes/service.yaml
   ```

4. Inspect the newly created service:
   ```bash
   kubectl get service cloud-web-service -o wide
   ```
   Note the assigned `CLUSTER-IP` and `PORT(S)`.

5. Inspect the Service's underlying **Endpoints** and **EndpointSlices**:
   ```bash
   kubectl get endpoints cloud-web-service
   ```
   Notice that the `ENDPOINTS` list displays the private IP addresses of all 3 Pods selected by `app=cloud-web`. Whenever Pods scale or crash, Kubernetes updates this list automatically.

6. Test internal service discovery and DNS resolution by launching a temporary test client Pod:
   ```bash
   kubectl run test-curl --rm -it --image=curlimages/curl --restart=Never -- \
     curl -s http://cloud-web-service
   ```
   Notice how CoreDNS instantly resolved `http://cloud-web-service` to the Service's internal ClusterIP address and returned the Nginx welcome response.

7. Test Full Qualified Domain Name (FQDN) resolution within the cluster:
   ```bash
   # Syntax: <service-name>.<namespace>.svc.cluster.local
   kubectl run test-curl --rm -it --image=curlimages/curl --restart=Never -- \
     curl -s http://cloud-web-service.default.svc.cluster.local
   ```

8. Convert the Service to `NodePort` to test external node routing:
   ```bash
   kubectl patch svc cloud-web-service -p '{"spec": {"type": "NodePort"}}'
   kubectl get svc cloud-web-service
   ```
   Look at the port mapping (e.g., `80:31234/TCP`). Kubernetes allocated a random high-range port on every node.

9. Test accessing the NodePort service:
   ```bash
   # If running Minikube:
   minikube service cloud-web-service --url
   ```
   *(Or query via `curl $(minikube ip):<NODEPORT>`)*.

10. Clean up test services:
    ```bash
    kubectl delete -f labs/kubernetes/service.yaml
    ```

## Done When
- [ ] You deployed the ClusterIP service using [`labs/kubernetes/service.yaml`](../../labs/kubernetes/service.yaml).
- [ ] You verified that `kubectl get endpoints cloud-web-service` correctly tracked the 3 Pod IPs.
- [ ] You performed an internal DNS HTTP request using a temporary `curlimages/curl` container.
- [ ] You explained the difference between `port`, `targetPort`, and `nodePort`.
- [ ] You patched the service to type `NodePort` and accessed it from your workstation.

## Cost and Cleanup
$0 — no cloud resources used (runs completely on your local workstation).

Delete lab resources:
```bash
kubectl delete -f labs/kubernetes/service.yaml 2>/dev/null || true
kubectl delete -f labs/kubernetes/deployment.yaml 2>/dev/null || true
kubectl delete -f labs/kubernetes/configmap.yaml 2>/dev/null || true
```

## Stretch Goal
Enable the Ingress controller in Minikube and route traffic using hostnames:
```bash
minikube addons enable ingress
```
Create a file `ingress.yaml` with an Ingress resource routing `app.local` to `cloud-web-service:80`, and inspect it with `kubectl get ingress`.

## Common Mistakes
- **Confusing `port` and `targetPort`:** `port` is the port exposed by the Service itself to other cluster clients. `targetPort` is the actual container port listening inside the Pod.
- **Label selector typos causing empty endpoints:** If your Service selector specifies `app: web` but your Pods are labeled `app: cloud-web`, the Service will be created successfully, but `kubectl get endpoints` will display `<none>`, causing all connection attempts to hang or fail.
- **Attempting to `ping` a ClusterIP:** ClusterIPs are virtual VIPs managed in Linux kernel tables by `kube-proxy` via iptables or IPVS. They do not respond to ICMP ping packets; always test with HTTP or TCP connection utilities (`curl`, `nc`, or `telnet`).
