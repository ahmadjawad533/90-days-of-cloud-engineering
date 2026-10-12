# Day 50: Pods, ReplicaSets, and Deployments
[← Previous Day](../day-49-kubernetes-architecture/README.md) | [Next Day →](../day-51-services-networking/README.md)

## Goal
Deploy, scale, update, and roll back resilient application workloads using Kubernetes Pods, ReplicaSets, and declarative Deployments.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Kubernetes Pods Documentation](https://kubernetes.io/docs/concepts/workloads/pods/) — Official guide explaining the smallest deployable computing unit, shared network namespaces, and pod lifecycles.
- 📖 [Kubernetes Deployments Guide](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) — Official guide covering declarative workload management, rolling updates, rollbacks, and self-healing.

## Do
In Kubernetes, you rarely deploy standalone containers or naked Pods directly. Instead, you manage workloads through a clear hierarchical controller model:

```
Deployment
   └── ReplicaSet (Manages desired replica count & pod revisions)
         └── Pods (Run container instances)
```

### Part 1: Apply ConfigMap and Deployment

1. Review the declarative deployment manifest in [`labs/kubernetes/deployment.yaml`](../../labs/kubernetes/deployment.yaml) and the supporting configmap in [`labs/kubernetes/configmap.yaml`](../../labs/kubernetes/configmap.yaml).

2. Apply the ConfigMap first:
   ```bash
   kubectl apply -f labs/kubernetes/configmap.yaml
   ```

3. Deploy the application:
   ```bash
   kubectl apply -f labs/kubernetes/deployment.yaml
   ```

4. Inspect the created resources and observe the relationship between the Deployment, the ReplicaSet, and the Pods:
   ```bash
   kubectl get deployments
   kubectl get replicasets
   kubectl get pods -l app=cloud-web
   ```
   Notice that the Deployment generated a ReplicaSet named `cloud-web-deployment-<hash>`, which in turn scheduled 3 identical running Pods.

### Part 2: Test Self-Healing

5. Delete one of the running pods manually to observe Kubernetes self-healing:
   ```bash
   POD_TO_DELETE=$(kubectl get pods -l app=cloud-web -o jsonpath="{.items[0].metadata.name}")
   echo "Deleting pod: ${POD_TO_DELETE}"
   kubectl delete pod "${POD_TO_DELETE}"
   ```

6. Immediately view the pods list:
   ```bash
   kubectl get pods -l app=cloud-web
   ```
   The ReplicaSet detected that the actual pod count dropped to 2 while the desired state was 3. It immediately instantiated a brand-new replacement pod.

### Part 3: Scale Workloads

7. Scale the deployment from 3 replicas up to 5:
   ```bash
   kubectl scale deployment cloud-web-deployment --replicas=5
   kubectl get pods -l app=cloud-web
   ```

8. Scale the deployment back down to 3 replicas:
   ```bash
   kubectl scale deployment cloud-web-deployment --replicas=3
   kubectl get pods -l app=cloud-web
   ```

### Part 4: Rolling Updates and Rollbacks

9. Perform a zero-downtime rolling update by updating the container image:
   ```bash
   kubectl set image deployment/cloud-web-deployment web=nginx:1.26-alpine --record
   ```

10. Monitor the rolling update in real time:
    ```bash
    kubectl rollout status deployment/cloud-web-deployment
    ```
    Kubernetes gracefully spins up new Pods with the new version before terminating old ones, ensuring continuous availability.

11. Inspect the replica sets to observe how revision history is preserved:
    ```bash
    kubectl get replicasets -l app=cloud-web
    ```
    You will see two ReplicaSets: the new one with 3 active replicas, and the old one scaled down to 0.

12. Check the rollout history:
    ```bash
    kubectl rollout history deployment/cloud-web-deployment
    ```

13. Roll back to the previous stable revision:
    ```bash
    kubectl rollout undo deployment/cloud-web-deployment
    kubectl rollout status deployment/cloud-web-deployment
    ```

## Done When
- [ ] You applied [`labs/kubernetes/configmap.yaml`](../../labs/kubernetes/configmap.yaml) and [`labs/kubernetes/deployment.yaml`](../../labs/kubernetes/deployment.yaml).
- [ ] You verified that 3 replicas were launched across Pods, a ReplicaSet, and a Deployment.
- [ ] You deleted a Pod and watched the ReplicaSet immediately heal the cluster.
- [ ] You scaled the deployment up and down using `kubectl scale`.
- [ ] You executed a rolling update with `kubectl set image` and monitored it with `kubectl rollout status`.
- [ ] You rolled back the update using `kubectl rollout undo`.

## Cost and Cleanup
$0 — no cloud resources used (runs completely on your local workstation).

Delete the lab deployment and configmap:
```bash
kubectl delete -f labs/kubernetes/deployment.yaml -f labs/kubernetes/configmap.yaml
```

## Stretch Goal
Examine the rolling update strategy parameters in a deployment. Open [`labs/kubernetes/deployment.yaml`](../../labs/kubernetes/deployment.yaml) and add a `strategy` block under `spec:`:
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1        # Max number of extra pods above replicas during update
    maxUnavailable: 0  # Zero pods can be unavailable during update
```
Apply the changes with `kubectl apply -f labs/kubernetes/deployment.yaml` and test how `maxUnavailable: 0` prevents any capacity reduction during updates.

## Common Mistakes
- **Deploying bare Pods without a Deployment:** If a bare Pod crashes or its worker node dies, Kubernetes will never recreate it. Always wrap Pods in a Deployment or StatefulSet.
- **Mismatched label selectors:** The `spec.selector.matchLabels` in the Deployment must exactly match the `spec.template.metadata.labels` of the Pod template. If they do not match, `kubectl apply` will fail with validation errors.
- **Directly modifying ReplicaSets:** ReplicaSets are managed entirely by their parent Deployment controller. Editing a ReplicaSet directly causes configuration drift and will be overwritten during the next Deployment reconciliation loop.
