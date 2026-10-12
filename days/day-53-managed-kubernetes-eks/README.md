# Day 53: Managed Kubernetes (EKS Overview)
[← Previous Day](../day-52-configmaps-secrets-storage/README.md) | [Next Day →](../day-54-deploy-to-eks/README.md)

## Goal
Understand the architecture, pricing, networking, and security models of managed Kubernetes on AWS (Amazon EKS) compared to self-hosted clusters.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Amazon EKS User Guide](https://docs.aws.amazon.com/eks/latest/userguide/) — Official documentation detailing EKS control plane architecture, managed node groups, and cluster networking.
- 📖 [Getting Started with Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/getting-started.html) — Official AWS guide on cluster creation, authentication, and tooling with `eksctl`.

## Do
Running Kubernetes yourself (self-hosted or bare metal) requires you to install, patch, secure, backup, and maintain highly available `kube-apiserver` instances and `etcd` consensus clusters across multiple availability zones.

**Amazon Elastic Kubernetes Service (EKS)** is AWS's managed container orchestration service. AWS manages and guarantees the availability of the Kubernetes Control Plane across 3 Availability Zones, while you focus on running your container workloads.

> [!WARNING]
> 💳 **COST WARNING:** Unlike local Minikube or Kind clusters, Amazon EKS is **NOT completely free**.
> - AWS charges **$0.10 per hour** (~$73.00/month) for each active EKS cluster control plane.
> - Worker node EC2 instances (e.g., two `t3.medium` instances) incur standard EC2 and EBS storage fees (~$0.0416/hr each).
> - You can complete today's lab by analyzing cluster specifications, testing dry runs with `eksctl`, and querying AWS APIs, or run a short live cluster (under 1 hour, costing ~$0.20) ensuring you tear it down immediately afterward.

### Architectural Breakdown

```
AWS-Managed Control Plane (Single-Tenant, Multi-AZ)
┌────────────────────────────────────────────────────────┐
│  API Server (NLB)  │  etcd (3 AZs)  │  Controllers     │
└────────────────────────────────────────────────────────┘
                           ▲
                           │ ENI Cross-Account Tunnel
                           ▼
Customer VPC (Worker Compute Plane)
┌───────────────────────────────┬────────────────────────┐
│ Managed Node Group (EC2)      │ AWS Fargate            │
│  - kubelet, kube-proxy        │  - Serverless pods     │
│  - AWS VPC CNI plugin         │  - No EC2 management   │
└───────────────────────────────┴────────────────────────┘
```

### Key Differences from Local Kubernetes

1. **Networking (AWS VPC CNI):** Unlike local clusters that use overlay networks, EKS uses the AWS VPC CNI plugin. Every Pod receives a real, routable IP address directly from your VPC subnet!
2. **Identity & Access Management:** Kubernetes RBAC integrates with AWS IAM. Modern clusters use **EKS Access Entries** and **IAM Roles for Service Accounts (IRSA)** or **EKS Pod Identity** to grant pods fine-grained AWS permissions.
3. **Compute Options:**
   - **Managed Node Groups:** AWS provisions and manages the lifecycle of EC2 instances in an Auto Scaling Group.
   - **AWS Fargate:** Serverless compute where AWS manages the underlying node entirely, running each Pod on an isolated microVM.

### Hands-on: Cluster Planning and `eksctl` Setup

1. Check or install `eksctl` (the official CLI tool for Amazon EKS):
   ```bash
   # Check if eksctl is installed
   eksctl version 2>/dev/null || echo "eksctl not installed"

   # On Linux x86_64:
   # ARCH=amd64
   # PLATFORM=$(uname -s)_$ARCH
   # curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_$PLATFORM.tar.gz"
   # tar -xzf eksctl_$PLATFORM.tar.gz -C /tmp && sudo mv /tmp/eksctl /usr/local/bin
   ```

2. Verify AWS CLI access and identity:
   ```bash
   aws sts get-caller-identity
   ```

3. Review a declarative EKS cluster definition file (`eks-cluster-config.yaml`):
   ```yaml
   apiVersion: eksctl.io/v1alpha5
   kind: ClusterConfig

   metadata:
     name: cloud-eng-cluster
     region: us-east-1
     version: "1.30"

   vpc:
     cidr: 10.0.0.0/16
     nat:
       gateway: Single # Use single NAT gateway to minimize VPC cost

   managedNodeGroups:
     - name: standard-workers
       instanceType: t3.medium
       desiredCapacity: 2
       minSize: 1
       maxSize: 3
       volumeSize: 20
       ssh:
         allow: false
   ```

4. Perform a dry-run validation with `eksctl` to verify AWS permissions and network topology without incurring costs:
   ```bash
   eksctl create cluster --config-file=eks-cluster-config.yaml --dry-run
   ```

5. Understand how `kubectl` communicates with EKS:
   When an EKS cluster is created, you configure local `kubectl` using the AWS CLI:
   ```bash
   aws eks update-kubeconfig --region us-east-1 --name cloud-eng-cluster
   ```
   This inserts an `exec` credential plugin in `~/.kube/config` that invokes `aws eks get-token` to authenticate API requests with IAM.

6. List existing EKS clusters in your AWS account:
   ```bash
   aws eks list-clusters --region us-east-1
   ```

## Done When
- [ ] You understood the shared responsibility model of EKS (AWS manages Control Plane; customer manages Worker Nodes).
- [ ] You verified `eksctl` and reviewed the declarative `ClusterConfig` specification.
- [ ] You understood why the AWS VPC CNI assigns native VPC IP addresses to Pods.
- [ ] You executed an `eksctl` dry-run or examined cluster schema validation.
- [ ] You understood the $0.10/hour EKS pricing model and teardown procedures.

## Cost and Cleanup
If you created a live EKS cluster during this day or plan to launch one on Day 54, remember:
💳 **EKS clusters cost $0.10/hour**.

Always delete your cluster immediately when finished:
```bash
eksctl delete cluster --name cloud-eng-cluster --region us-east-1
# Wait until all CloudFormation stacks and resources are completely deleted
```

If you only reviewed configurations and ran dry-runs, your cost is **$0.00**.

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Amazon Elastic Kubernetes Service (EKS) | Azure Kubernetes Service (AKS) | Google Kubernetes Engine (GKE) |
| Managed Node Groups / AWS Fargate | Virtual Machine Scale Sets / Azure Container Instances (Virtual Nodes) | GKE Standard Node Pools / GKE Autopilot |
| AWS VPC CNI (native VPC pod IPs) | Azure CNI | GKE VPC-native (Alias IP) |
| IAM Roles for Service Accounts (IRSA) / EKS Pod Identity | Azure Workload Identity | GKE Workload Identity |
| Control Plane: $0.10/hour | Free tier available for standard cluster management | One free zonal cluster per billing account |

- 📖 [Azure Kubernetes Service (AKS) Documentation](https://learn.microsoft.com/en-us/azure/aks/)
- 📖 [Google Kubernetes Engine (GKE) Documentation](https://cloud.google.com/kubernetes-engine/docs)

## Stretch Goal
Explore **AWS Fargate for EKS**. Create an `eksctl` profile configuration snippet that defines a Fargate profile for a specific namespace (e.g., `fargate-workloads`). Note why serverless pods running on Fargate eliminate node patching and OS maintenance completely.

## Common Mistakes
- **Leaving an EKS cluster running overnight:** Because the EKS control plane incurs a fixed hourly charge regardless of workload activity, leaving a test cluster running for days can generate unexpected cloud bills. Always delete the cluster immediately when your lab session concludes.
- **Subnet IP exhaustion with the AWS VPC CNI:** Since the AWS VPC CNI allocates real private IP addresses to every pod from your subnet CIDR block, creating small subnets (such as `/24` or `/25`) can quickly exhaust available IPs. Ensure your VPC subnets have ample address space (such as `/20` or `/19`).
- **Cluster creator lock-out:** In older EKS clusters, only the IAM principal that ran `create-cluster` could access the API server until the `aws-auth` ConfigMap was updated. With modern EKS clusters, leverage **EKS Access Entries** to manage administrator permissions explicitly.
