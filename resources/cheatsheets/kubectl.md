# Kubernetes (`kubectl`) Cheatsheet

A concise, structured reference for managing Kubernetes clusters, inspecting workloads, operating deployments, and troubleshooting production incidents.

---

## Table of Contents
- [Cluster Information & Health](#cluster-information--health)
- [Context & Kubeconfig Management](#context--kubeconfig-management)
- [Namespaces](#namespaces)
- [General Resource Management](#general-resource-management)
- [Pods & Debugging](#pods--debugging)
- [Deployments & Workloads](#deployments--workloads)
- [Services & Networking](#services--networking)
- [ConfigMaps & Secrets](#configmaps--secrets)
- [Output Formatting & Filtering](#output-formatting--filtering)
- [Cluster Troubleshooting & Events](#cluster-troubleshooting--events)

---

## Cluster Information & Health

Inspect cluster endpoints, API versions, and control plane nodes:

```bash
kubectl cluster-info                         # Display master and core service endpoints
kubectl cluster-info dump                    # Dump cluster debug state
kubectl version --short                      # Display client and server Kubernetes versions
kubectl get nodes                            # List all worker and control plane nodes
kubectl get nodes -o wide                    # Nodes with internal IP, external IP, OS, kernel, runtime
kubectl describe node <node-name>            # View node conditions, taints, capacity, and allocated resources
kubectl top nodes                            # Display CPU and memory utilization per node (requires Metrics Server)
kubectl api-resources                        # List all supported API resource types and short names
kubectl api-versions                         # List active API group versions on the cluster
```

---

## Context & Kubeconfig Management

Switch between clusters, user credentials, and active namespaces:

```bash
kubectl config view                          # View kubeconfig settings (redacts sensitive tokens)
kubectl config view --raw                    # Display raw unmasked kubeconfig
kubectl config get-contexts                  # List all available contexts (* = current)
kubectl config current-context               # Display current active context
kubectl config use-context <context-name>    # Switch to another cluster context
kubectl config set-context --current --namespace=<ns> # Set default namespace for current context
kubectl config delete-context <context-name> # Delete context entry from kubeconfig
```

---

## Namespaces

Isolate resources and manage multi-tenant environments:

```bash
kubectl get namespaces                       # List all namespaces (alias: get ns)
kubectl create namespace staging             # Create a new namespace
kubectl delete namespace staging             # Delete namespace and all contained resources
kubectl describe namespace staging           # View quotas and resource limits for namespace
```

---

## General Resource Management

Apply, inspect, modify, and delete resources declaratively and imperatively:

```bash
# Declarative management
kubectl apply -f deployment.yaml             # Create or update resource from manifest
kubectl apply -f ./k8s-manifests/            # Recursively apply all manifests in directory
kubectl delete -f deployment.yaml            # Delete resources defined in manifest
kubectl diff -f deployment.yaml              # Compare live cluster state with local manifest

# Generic resource inspection
kubectl get <resource-type>                  # List resources (e.g. pods, svc, ingress, pv, pvc)
kubectl get all                              # List all core workloads in current namespace
kubectl get all -A                           # List all core workloads across all namespaces
kubectl describe <resource-type> <name>      # Detailed specs, status conditions, and events
kubectl edit <resource-type> <name>          # Open resource YAML in default text editor
kubectl delete <resource-type> <name>        # Delete specific resource
kubectl delete <resource-type> -l app=backend# Delete resources matching label selector
```

---

## Pods & Debugging

Inspect individual Pod containers, tail logs, and run diagnostic commands:

```bash
# Pod listing and status
kubectl get pods                             # List pods in active namespace
kubectl get pods -A                          # List pods across all namespaces
kubectl get pods -o wide                     # Show pods with assigned Node and Pod IP
kubectl get pods --watch                     # Stream pod status changes live

# Logs
kubectl logs <pod-name>                      # Print stdout/stderr from pod
kubectl logs -f <pod-name>                   # Stream/follow live logs
kubectl logs -f <pod-name> -c <container>    # Follow logs of specific container in multi-container pod
kubectl logs <pod-name> --previous           # View logs from previous crashed container instance
kubectl logs -l app=frontend --tail=50       # Tail last 50 log lines across all pods matching label

# Execution and port-forwarding
kubectl exec -it <pod-name> -- /bin/sh       # Interactive shell inside container
kubectl exec <pod-name> -- env               # Execute single command inside pod
kubectl port-forward pod/<pod-name> 8080:80  # Forward local port 8080 to pod port 80
kubectl port-forward svc/<svc-name> 5432:5432 # Forward local port to service port

# Resource consumption
kubectl top pods                             # Show CPU/memory consumption per pod
kubectl top pod <pod-name> --containers      # Show resource usage broken down by container
```

---

## Deployments & Workloads

Manage scalable applications, updates, and rollbacks:

```bash
# Imperative creation & scaling
kubectl create deployment web --image=nginx:1.25 # Create deployment imperatively
kubectl scale deployment web --replicas=5       # Scale deployment to 5 replicas
kubectl autoscale deployment web --min=2 --max=10 --cpu-percent=80 # Create HPA for deployment

# Rolling updates
kubectl set image deployment/web nginx=nginx:1.26 # Update container image triggering rolling update
kubectl rollout status deployment/web           # Monitor rollout progression
kubectl rollout history deployment/web          # View revision history
kubectl rollout history deployment/web --revision=2 # View details of revision 2
kubectl rollout undo deployment/web             # Roll back to the previous revision
kubectl rollout undo deployment/web --to-revision=1 # Roll back to specific revision
kubectl rollout restart deployment/web          # Perform rolling restart of all pods
kubectl rollout pause deployment/web            # Pause rollout
kubectl rollout resume deployment/web           # Resume paused rollout
```

---

## Services & Networking

Expose pods internally and externally:

```bash
# Create services
kubectl expose deployment web --port=80 --target-port=8080 --type=ClusterIP # Expose as ClusterIP
kubectl expose deployment web --port=80 --target-port=80 --type=NodePort    # Expose as NodePort
kubectl expose deployment web --port=80 --type=LoadBalancer                 # Cloud Load Balancer

# Inspect services
kubectl get svc                              # List services in namespace
kubectl get svc -o wide                      # Include cluster-ip, external-ip, and ports
kubectl describe svc web                     # View endpoints connected to service
kubectl get endpoints <service-name>         # Inspect pod IPs mapped to service endpoints
kubectl get ingress                          # List Ingress routing rules
```

---

## ConfigMaps & Secrets

Inject application configuration and sensitive credentials:

```bash
# ConfigMaps
kubectl create configmap app-config --from-literal=ENV=prod --from-literal=DEBUG=false
kubectl create configmap app-config --from-file=config.json
kubectl get configmaps                       # List ConfigMaps (alias: get cm)
kubectl describe configmap app-config        # View ConfigMap keys and values

# Secrets
kubectl create secret generic db-creds \
  --from-literal=username=admin \
  --from-literal=password='S3cr3tP@ss!'
kubectl create secret tls tls-secret --cert=cert.crt --key=priv.key
kubectl create secret docker-registry reg-cred \
  --docker-server=https://index.docker.io/v1/ \
  --docker-username=myuser \
  --docker-password=mypass \
  --docker-email=user@example.com
kubectl get secrets                          # List Secrets
kubectl get secret db-creds -o jsonpath='{.data.password}' | base64 --decode # Decode secret value
```

---

## Output Formatting & Filtering

Slice and query Kubernetes objects:

```bash
# Common output formats
kubectl get pods -o wide                     # Wide output (Node name, Pod IP)
kubectl get pod <pod-name> -o yaml           # Export full pod definition in YAML
kubectl get pod <pod-name> -o json           # Export full pod definition in JSON

# Label filtering
kubectl get pods -l app=frontend             # Filter pods with label app=frontend
kubectl get pods -l 'environment in (prod, staging)' # Set-based filter
kubectl get pods -l app!=frontend            # Filter pods not matching label
kubectl get nodes --show-labels              # Display all node labels
kubectl label pods <pod-name> tier=backend   # Add or modify label on pod

# Sorting
kubectl get pods --sort-by=.metadata.name    # Sort alphabetically by pod name
kubectl get pods --sort-by=.status.startTime # Sort by pod start time

# JSONPath extraction
kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}'
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\n"}{end}'
```

---

## Cluster Troubleshooting & Events

Locate root causes for failures (`CrashLoopBackOff`, `Pending`, `ImagePullBackOff`):

```bash
# Cluster events
kubectl get events --sort-by=.metadata.creationTimestamp # List latest cluster events
kubectl get events -n <namespace> --watch    # Stream namespace events live
kubectl get events --field-selector type=Warning # Filter warning events only

# Ephemeral debug container (Kubernetes 1.23+)
kubectl debug -it <pod-name> --image=busybox:1.36 --target=<container-name>

# Generate YAML without applying (Dry run template)
kubectl create deployment test --image=nginx --dry-run=client -o yaml > deployment.yaml
kubectl expose deployment test --port=80 --dry-run=client -o yaml > service.yaml
```
