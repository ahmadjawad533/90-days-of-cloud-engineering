# Day 52: ConfigMaps, Secrets, and Storage
[← Previous Day](../day-51-services-networking/README.md) | [Next Day →](../day-53-managed-kubernetes-eks/README.md)

## Goal
Externalize configuration, protect sensitive credentials, and persist application data using Kubernetes ConfigMaps, Secrets, and PersistentVolumeClaims.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Kubernetes ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/) — Official guide on injecting non-confidential configuration into containers via environment variables or file volumes.
- 📖 [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/) — Official guide on creating, encoding, and mounting confidential data such as passwords, tokens, and TLS keys.
- 📖 [Kubernetes Persistent Volumes and Claims](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) — Official documentation explaining storage abstractions (PV, PVC, and StorageClasses).

## Do
Following 12-Factor App principles, container images should remain immutable across environments (Dev, Staging, Production). Environment-specific configuration and credentials must be injected dynamically, and stateful workloads must retain data across pod restarts.

### Part 1: Managing Configuration with ConfigMaps

1. Create a ConfigMap imperatively from key-value literals:
   ```bash
   kubectl create configmap app-settings \
     --from-literal=ENVIRONMENT=production \
     --from-literal=LOG_LEVEL=info \
     --from-literal=FEATURE_FLAG_ANALYTICS=true
   ```

2. Inspect the created ConfigMap:
   ```bash
   kubectl get configmap app-settings -o yaml
   ```

3. Review the declarative ConfigMap file in [`labs/kubernetes/configmap.yaml`](../../labs/kubernetes/configmap.yaml) and apply it:
   ```bash
   kubectl apply -f labs/kubernetes/configmap.yaml
   ```

### Part 2: Handling Sensitive Credentials with Secrets

4. Create a Secret containing database credentials:
   ```bash
   kubectl create secret generic db-credentials \
     --from-literal=DB_USERNAME=cloud_admin \
     --from-literal=DB_PASSWORD="MySecurePassword#90"
   ```

5. Inspect the Secret in YAML format:
   ```bash
   kubectl get secret db-credentials -o yaml
   ```
   Notice that the values in `data:` are base64-encoded strings, not plaintext.

6. Decode the base64 password to verify:
   ```bash
   ENCODED_PW=$(kubectl get secret db-credentials -o jsonpath="{.data.DB_PASSWORD}")
   echo "${ENCODED_PW}" | base64 --decode
   echo ""
   ```
   *(Base64 is obfuscation, not encryption! Production clusters encrypt etcd at rest using KMS).*

### Part 3: Consuming ConfigMaps and Secrets in a Pod

7. Launch a Pod that injects the ConfigMap and Secret as environment variables and files:
   ```bash
   cat << 'EOF' | kubectl apply -f -
   apiVersion: v1
   kind: Pod
   metadata:
     name: config-demo-pod
     labels:
       app: demo
   spec:
     containers:
       - name: test-app
         image: alpine:latest
         command: ["sh", "-c", "echo 'Pod initialized with env vars'; sleep 3600"]
         env:
           - name: APP_ENV
             valueFrom:
               configMapKeyRef:
                 name: app-settings
                 key: ENVIRONMENT
           - name: SECRET_DB_PASS
             valueFrom:
               secretKeyRef:
                 name: db-credentials
                 key: DB_PASSWORD
         volumeMounts:
           - name: config-vol
             mountPath: /etc/config
     volumes:
       - name: config-vol
         configMap:
           name: web-config
   EOF
   ```

8. Verify the injected environment variables inside the running container:
   ```bash
   kubectl exec config-demo-pod -- printenv | grep -E "(APP_ENV|SECRET_DB_PASS)"
   ```

9. Verify the mounted ConfigMap files inside `/etc/config`:
   ```bash
   kubectl exec config-demo-pod -- ls -la /etc/config
   kubectl exec config-demo-pod -- cat /etc/config/APP_MESSAGE
   ```

### Part 4: Persistent Storage with PVCs

10. Inspect the default StorageClass provided by your cluster:
    ```bash
    kubectl get storageclass
    ```

11. Create a PersistentVolumeClaim (PVC) requesting 1Gi of persistent storage:
    ```bash
    cat << 'EOF' | kubectl apply -f -
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: my-app-pvc
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
    EOF
    ```

12. Verify that the PVC is dynamically bound:
    ```bash
    kubectl get pvc my-app-pvc
    ```
    Status should show `Bound`.

13. Launch a pod mounting this PVC, write persistent data, and delete the pod:
    ```bash
    cat << 'EOF' | kubectl apply -f -
    apiVersion: v1
    kind: Pod
    metadata:
      name: storage-writer-pod
    spec:
      containers:
        - name: writer
          image: alpine:latest
          command: ["sh", "-c", "echo 'Persistent data written on Day 52' > /data/message.txt; sleep 3600"]
          volumeMounts:
            - name: storage-volume
              mountPath: /data
      volumes:
        - name: storage-volume
          persistentVolumeClaim:
            claimName: my-app-pvc
    EOF

    # Wait for pod and verify written file
    kubectl wait --for=condition=Ready pod/storage-writer-pod --timeout=30s
    kubectl exec storage-writer-pod -- cat /data/message.txt

    # Delete the writer pod
    kubectl delete pod storage-writer-pod
    ```

14. Launch a *new* reader pod mounting the same PVC and verify the data survived pod destruction:
    ```bash
    cat << 'EOF' | kubectl apply -f -
    apiVersion: v1
    kind: Pod
    metadata:
      name: storage-reader-pod
    spec:
      containers:
        - name: reader
          image: alpine:latest
          command: ["sh", "-c", "cat /data/message.txt; sleep 3600"]
          volumeMounts:
            - name: storage-volume
              mountPath: /data
      volumes:
        - name: storage-volume
          persistentVolumeClaim:
            claimName: my-app-pvc
    EOF

    kubectl wait --for=condition=Ready pod/storage-reader-pod --timeout=30s
    kubectl exec storage-reader-pod -- cat /data/message.txt
    ```
    The data persisted completely across independent Pod lifecycles!

## Done When
- [ ] You created a ConfigMap imperatively and verified its key-value pairs.
- [ ] You created a Secret with `kubectl create secret generic` and decoded the base64 value.
- [ ] You launched a Pod injecting both a ConfigMap and a Secret via `env` and `volumeMounts`.
- [ ] You created a PersistentVolumeClaim and verified it was `Bound`.
- [ ] You wrote a file to the persistent volume, deleted the writer Pod, and verified data retention in a new reader Pod.

## Cost and Cleanup
$0 — no cloud resources used (runs completely on your local workstation).

Clean up all lab resources:
```bash
kubectl delete pod config-demo-pod storage-reader-pod 2>/dev/null || true
kubectl delete pvc my-app-pvc 2>/dev/null || true
kubectl delete secret db-credentials 2>/dev/null || true
kubectl delete configmap app-settings 2>/dev/null || true
```

## Stretch Goal
Use `envFrom` in a pod specification to automatically export *all* key-value pairs from a ConfigMap or Secret as environment variables without declaring each key individually:
```yaml
envFrom:
  - configMapRef:
      name: app-settings
  - secretRef:
      name: db-credentials
```

## Common Mistakes
- **Confusing Base64 encoding with encryption:** Base64 is only a transmission encoding format, not security. Anyone with `kubectl get secret -o yaml` access can decode secrets instantly. In production, protect secrets with Kubernetes RBAC, KMS envelope encryption at rest, and tools like HashiCorp Vault or AWS Secrets Manager CSI Driver.
- **Expecting environment variable changes to take effect immediately:** When you update a ConfigMap, pods that consume it as environment variables do NOT update automatically until they are restarted. Volume mounts do update periodically, but container applications must support reloading files.
- **Misunderstanding `ReadWriteOnce` access mode:** In Kubernetes storage, `ReadWriteOnce` (RWO) means the volume can be mounted as read-write by a single *node* at a time, not by a single *pod*. Multiple pods on the same node can mount an RWO volume, but pods on different nodes cannot.
