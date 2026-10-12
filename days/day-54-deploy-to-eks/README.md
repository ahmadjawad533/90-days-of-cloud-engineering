# Day 54: Deploy an App to EKS
[← Previous Day](../day-53-managed-kubernetes-eks/README.md) | [Next Day →](../day-55-helm-charts/README.md)

## Goal
Deploy a multi-replica containerized web application to Amazon EKS and expose it to internet traffic using an AWS Cloud Load Balancer.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Amazon EKS Application Deployment](https://docs.aws.amazon.com/eks/latest/userguide/sample-apps.html) — Official AWS guide covering sample microservice deployments on EKS.
- 📖 [Kubernetes Type LoadBalancer](https://kubernetes.io/docs/concepts/services-networking/service/#loadbalancer) — Official documentation explaining how cloud providers provision external load balancers for Kubernetes services.
- 📖 [AWS Load Balancer Controller](https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html) — Official documentation on integrating EKS with AWS Application Load Balancers (ALB) and Network Load Balancers (NLB).

## Do
> [!WARNING]
> 💳 **COST & TEARDOWN ALERT:**
> - Amazon EKS costs **$0.10/hour** for the control plane plus standard EC2 rates for worker nodes.
> - AWS Load Balancers (ELB/NLB) provisioned by Kubernetes services cost **~$0.0225/hour** plus data processing.
> - **CRITICAL TEARDOWN ORDER:** You must ALWAYS delete Kubernetes `LoadBalancer` services *before* deleting your EKS cluster. If you delete the cluster first, the AWS ELB will become orphaned in your VPC and continue billing indefinitely!
> - *(If you prefer $0 spend today, you can run these exact manifests in your local Minikube cluster using `minikube tunnel` to simulate cloud LoadBalancers).*

### Part 1: Connect and Prepare the EKS Cluster

1. Update your local `kubectl` context to target your Amazon EKS cluster:
   ```bash
   export AWS_REGION="us-east-1"
   export CLUSTER_NAME="cloud-eng-cluster"

   aws eks update-kubeconfig --region "${AWS_REGION}" --name "${CLUSTER_NAME}"
   ```

2. Confirm your connection to the cloud cluster:
   ```bash
   kubectl get nodes -o wide
   ```
   Notice the node names are EC2 private DNS hostnames, and internal IPs belong to your AWS VPC subnets.

3. Create a dedicated Kubernetes namespace for your application:
   ```bash
   kubectl create namespace prod-web
   ```

### Part 2: Deploy Application Workloads

4. Deploy the ConfigMap into the `prod-web` namespace:
   ```bash
   kubectl apply -f labs/kubernetes/configmap.yaml -n prod-web
   ```

5. Deploy the 3-replica application deployment into the namespace:
   ```bash
   kubectl apply -f labs/kubernetes/deployment.yaml -n prod-web
   ```

6. Verify that all 3 pods are scheduled and running across the AWS worker nodes:
   ```bash
   kubectl get pods -n prod-web -o wide
   ```

### Part 3: Expose via Cloud LoadBalancer

7. Create a LoadBalancer Service manifest that instructs AWS to provision an external Network Load Balancer (NLB):
   ```bash
   cat << 'EOF' > eks-service.yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: cloud-web-lb
     namespace: prod-web
     labels:
       app: cloud-web
     annotations:
       service.beta.kubernetes.io/aws-load-balancer-type: "external"
       service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: "instance"
       service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
   spec:
     type: LoadBalancer
     selector:
       app: cloud-web
     ports:
       - protocol: TCP
         port: 80
         targetPort: 80
   EOF
   ```

8. Apply the LoadBalancer service:
   ```bash
   kubectl apply -f eks-service.yaml
   ```

9. Watch the external service endpoint until AWS provisions the load balancer DNS hostname:
   ```bash
   kubectl get svc cloud-web-lb -n prod-web -w
   ```
   *(Wait 2–3 minutes until the `EXTERNAL-IP` field changes from `<pending>` to an AWS hostname ending in `.elb.amazonaws.com`)*. Press `Ctrl+C` once the URL appears.

10. Save the Load Balancer DNS URL and test traffic:
    ```bash
    LB_HOSTNAME=$(kubectl get svc cloud-web-lb -n prod-web -o jsonpath="{.status.loadBalancer.ingress[0].hostname}")
    echo "Public URL: http://${LB_HOSTNAME}"

    # Wait 60 seconds for AWS DNS propagation and health checks
    sleep 60
    curl -I "http://${LB_HOSTNAME}"
    ```
    You will receive `HTTP/1.1 200 OK` from the container running inside Amazon EKS!

### Part 4: Safe Teardown Process

11. **Step 1:** Delete the Kubernetes Service first so AWS deletes the underlying Load Balancer:
    ```bash
    kubectl delete -f eks-service.yaml
    echo "Waiting for AWS to remove the Load Balancer..."
    sleep 30
    ```

12. **Step 2:** Delete the deployment, configmap, and namespace:
    ```bash
    kubectl delete -f labs/kubernetes/deployment.yaml -n prod-web
    kubectl delete -f labs/kubernetes/configmap.yaml -n prod-web
    kubectl delete namespace prod-web
    rm -f eks-service.yaml
    ```

13. **Step 3:** Delete the EKS cluster via `eksctl`:
    ```bash
    eksctl delete cluster --name "${CLUSTER_NAME}" --region "${AWS_REGION}"
    ```

## Done When
- [ ] You connected `kubectl` to Amazon EKS using `aws eks update-kubeconfig`.
- [ ] You created a dedicated `prod-web` namespace and deployed workloads from [`labs/kubernetes/`](../../labs/kubernetes/).
- [ ] You exposed the deployment using a Kubernetes `LoadBalancer` service.
- [ ] You verified that AWS provisioned an external `.elb.amazonaws.com` DNS hostname.
- [ ] You successfully tested the web application using `curl`.
- [ ] You deleted the `LoadBalancer` service BEFORE deleting the cluster to prevent orphaned AWS resources.

## Cost and Cleanup
💳 **EKS costs $0.10/hour and Load Balancers cost ~$0.0225/hour.**

Ensure your resources are completely terminated:
```bash
# 1. Verify no load balancers remain in AWS
aws elb describe-load-balancers --region us-east-1 --query "LoadBalancerDescriptions[*].LoadBalancerName" --output text
aws elbv2 describe-load-balancers --region us-east-1 --query "LoadBalancers[*].LoadBalancerArn" --output text

# 2. Verify the EKS cluster deletion completed
aws eks list-clusters --region us-east-1
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Amazon EKS with NLB / ALB | Azure Kubernetes Service (AKS) with Azure Standard Load Balancer | Google Kubernetes Engine (GKE) with Cloud Load Balancing |
| AWS Load Balancer Controller | Azure Application Routing / Application Gateway Ingress Controller (AGIC) | GKE Ingress Controller |
| Service annotation `aws-load-balancer-type` | Service annotation `service.beta.kubernetes.io/azure-load-balancer-internal` | Service annotation `cloud.google.com/load-balancer-type` |

- 📖 [Azure Kubernetes Service (AKS) Load Balancers](https://learn.microsoft.com/en-us/azure/aks/)
- 📖 [Google Kubernetes Engine (GKE) Cloud Load Balancing](https://cloud.google.com/kubernetes-engine/docs)

## Stretch Goal
Explore Kubernetes **Ingress** on EKS. Research how the AWS Load Balancer Controller dynamically creates an AWS Application Load Balancer (ALB) based on an `Ingress` resource, allowing multiple Kubernetes services to share a single ALB using path-based (`/api`, `/web`) or host-based (`api.example.com`) routing rules.

## Common Mistakes
- **Deleting the EKS cluster before deleting the LoadBalancer Service:** This is the most expensive mistake beginners make. When the cluster is deleted first, Kubernetes loses the ability to call the AWS API to delete the ELB. The Load Balancer remains active and quietly charges money every single month. Always delete the Service first!
- **Missing public subnet tags for AWS ELB discovery:** In custom VPCs, Kubernetes will fail to create internet-facing load balancers if public subnets lack the tag `kubernetes.io/role/elb = 1`.
- **Querying the ELB URL immediately before health checks pass:** After AWS creates the ELB, target instances take 60–120 seconds to pass health checks. Attempting to `curl` immediately often results in `502 Bad Gateway` or connection timeout until the targets become healthy.
