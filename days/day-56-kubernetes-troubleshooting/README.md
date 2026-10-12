# Day 56: Kubernetes Troubleshooting
[← Previous Day](../day-55-helm-charts/README.md) | [Next Day →](../day-57-what-is-iac/README.md)

## Goal
Diagnose and resolve common Kubernetes failures—including CrashLoopBackOff, ImagePullBackOff, Pending pods, and Service routing failures—using a systematic debugging methodology.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Debug Applications in Kubernetes](https://kubernetes.io/docs/tasks/debug/debug-application/) — Official guide detailing step-by-step diagnostics for Pods, ReplicaSets, and Services.
- 📖 [Troubleshooting Kubernetes Clusters](https://kubernetes.io/docs/tasks/debug/) — Official guide covering node diagnostics, event streaming, and cluster-level failure identification.

## Do
In production cloud environments, Kubernetes will continuously try to reconcile desired state, but incorrect container configurations, missing images, insufficient compute resources, or label typos will cause workloads to fail. As a cloud engineer, mastering the diagnostic triage loop is an essential skill.

### The 4-Step Diagnostic Triage Loop

```
1. STATUS CHECK     ──>  kubectl get pods -o wide
2. EVENT INSPECTION ──>  kubectl describe pod <name>
3. LOG ANALYSIS     ──>  kubectl logs <name> [--previous]
4. LIVE PROBE       ──>  kubectl exec -it <name> -- sh  (or kubectl debug)
```

---

### Scenario 1: `ImagePullBackOff` and `ErrImagePull`

1. Deploy a Pod referencing an image tag that does not exist:
   ```bash
   cat << 'EOF' | kubectl apply -f -
   apiVersion: v1
   kind: Pod
   metadata:
     name: broken-image-pod
   spec:
     containers:
       - name: web
         image: nginx:tag-that-does-not-exist-999
   EOF
   ```

2. Check the Pod status:
   ```bash
   kubectl get pod broken-image-pod
   ```
   You will see `ErrImagePull` or `ImagePullBackOff`.

3. Diagnose using `kubectl describe`:
   ```bash
   kubectl describe pod broken-image-pod
   ```
   Inspect the **Events** section at the bottom. You will see:
   `Failed to pull image ... manifest unknown`.

4. Fix the issue by setting a valid image tag:
   ```bash
   kubectl set image pod/broken-image-pod web=nginx:alpine
   kubectl get pod broken-image-pod -w
   ```
   Clean up: `kubectl delete pod broken-image-pod`

---

### Scenario 2: `CrashLoopBackOff`

5. Deploy a Pod whose container exits with an error immediately upon launch:
   ```bash
   cat << 'EOF' | kubectl apply -f -
   apiVersion: v1
   kind: Pod
   metadata:
     name: crashloop-pod
   spec:
     containers:
       - name: failing-app
         image: alpine:latest
         command: ["sh", "-c", "echo 'Starting up... missing DB_URL configuration!'; exit 1"]
   EOF
   ```

6. Observe the status transition from `Error` to `CrashLoopBackOff`:
   ```bash
   kubectl get pod crashloop-pod
   ```
   Notice the `RESTARTS` count increments with an exponential backoff delay (10s, 20s, 40s, up to 5m).

7. Retrieve logs from the crashed container:
   ```bash
   kubectl logs crashloop-pod
   ```
   *(If the container is currently restarting, use `--previous` to see the logs from the previous terminated instance)*:
   ```bash
   kubectl logs crashloop-pod --previous
   ```
   Notice the error: `Starting up... missing DB_URL configuration!`.

8. Inspect the exit code:
   ```bash
   kubectl describe pod crashloop-pod | grep -E "(Exit Code:|Reason:)"
   ```
   Clean up: `kubectl delete pod crashloop-pod`

---

### Scenario 3: `Pending` Pods (Resource Constraints)

9. Deploy a Pod requesting an impossible quantity of CPU cores:
   ```bash
   cat << 'EOF' | kubectl apply -f -
   apiVersion: v1
   kind: Pod
   metadata:
     name: pending-pod
   spec:
     containers:
       - name: heavy-app
         image: nginx:alpine
         resources:
           requests:
             cpu: "128" # Requests 128 CPU cores
   EOF
   ```

10. Check the Pod status:
    ```bash
    kubectl get pod pending-pod
    ```
    The status remains stuck at `Pending`.

11. Diagnose why the scheduler could not place the pod:
    ```bash
    kubectl describe pod pending-pod
    ```
    Under **Events**, the `kube-scheduler` reports:
    `0/1 nodes available: 1 Insufficient cpu.`

12. Clean up:
    ```bash
    kubectl delete pod pending-pod
    ```

---

### Scenario 4: Silent Service Routing Failure (Empty Endpoints)

13. Deploy a valid web pod:
    ```bash
    kubectl run debug-web --image=nginx:alpine --labels="app=web-server,tier=backend"
    ```

14. Deploy a Service with an intentionally mistyped selector:
    ```bash
    cat << 'EOF' | kubectl apply -f -
    apiVersion: v1
    kind: Service
    metadata:
      name: broken-service
    spec:
      type: ClusterIP
      selector:
        app: webserver-typo # Does not match 'web-server'
      ports:
        - port: 80
          targetPort: 80
    EOF
    ```

15. Check the Service endpoints:
    ```bash
    kubectl get endpoints broken-service
    ```
    Notice `ENDPOINTS: <none>`. This means traffic sent to `broken-service` will be blackholed!

16. Fix the selector to match the running Pod labels:
    ```bash
    kubectl patch svc broken-service -p '{"spec": {"selector": {"app": "web-server"}}}'
    kubectl get endpoints broken-service
    ```
    The endpoint immediately registers the Pod IP address.

17. Clean up all troubleshooting resources:
    ```bash
    kubectl delete pod debug-web
    kubectl delete svc broken-service
    ```

## Done When
- [ ] You applied the 4-step diagnostic loop across 4 distinct failure modes.
- [ ] You identified and resolved an `ImagePullBackOff` error using `kubectl describe`.
- [ ] You analyzed a `CrashLoopBackOff` failure using `kubectl logs --previous` and exit codes.
- [ ] You identified scheduling capacity bottlenecks causing `Pending` pods.
- [ ] You diagnosed and fixed an empty Endpoints service failure caused by label mismatches.

## Cost and Cleanup
$0 — no cloud resources used (runs completely on your local workstation).

Clean up any lingering test resources:
```bash
kubectl delete pod broken-image-pod crashloop-pod pending-pod debug-web 2>/dev/null || true
kubectl delete svc broken-service 2>/dev/null || true
```

## Stretch Goal
Use `kubectl debug` to attach an ephemeral container equipped with network utilities (`curl`, `drill`, `netstat`) to a minimal container without restarting it:
```bash
kubectl run scratch-app --image=alpine:latest -- sleep 3600
kubectl debug -it scratch-app --image=busybox:latest --target=scratch-app
kubectl delete pod scratch-app
```

## Common Mistakes
- **Running `kubectl logs` without `--previous` on crashing pods:** When a container crashes and is between restarts, running `kubectl logs` without `--previous` often yields empty logs because the new instance hasn't logged anything yet.
- **Ignoring Exit Code 137 (OOMKilled):** When Linux kernel Out-Of-Memory Killer kills a container that exceeds its `limits.memory`, the container exits with `Exit Code 137` (128 + 9 SIGKILL). Look for `Reason: OOMKilled` in `kubectl describe pod`.
- **Assuming Pod readiness equals container running:** A Pod can be in the `Running` phase while remaining `0/1 Ready` because its `readinessProbe` is failing. Traffic will NOT be routed to unready Pods by Services.
