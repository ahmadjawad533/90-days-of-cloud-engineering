# Cloud Engineering Certification Guide

A pragmatic, no-hype roadmap to industry certifications across AWS, Azure, Google Cloud, HashiCorp Terraform, and the Cloud Native Computing Foundation (CNCF).

---

## Which Certification Should You Pursue?

Certifications demonstrate baseline competence and validate that you understand cloud terminology, architectural patterns, and operational practices. However, **practical projects, hands-on lab experience, and code in GitHub always outweigh badges alone**.

Use this roadmap to select the certification that fits your current level:

1. **Brand New to Tech & Cloud**: Start with AWS Certified Cloud Practitioner (CLF-C02) or Microsoft Azure Fundamentals (AZ-900).
2. **Aspiring Cloud Engineer / DevOps Associate**: Target AWS Certified Solutions Architect - Associate (SAA-C03) or Google Cloud Associate Cloud Engineer (ACE).
3. **Infrastructure as Code Specialization**: HashiCorp Certified: Terraform Associate (003).
4. **Container & Kubernetes Specialization**: Certified Kubernetes Administrator (CKA).

---

## 1. AWS Certified Cloud Practitioner (CLF-C02)

- **Official Link**: 📖 [AWS Certified Cloud Practitioner](https://aws.amazon.com/certification/certified-cloud-practitioner/)
- **Who It's For**: Beginners, career switchers, managers, or anyone seeking a foundational understanding of the AWS cloud ecosystem, billing models, and core services.
- **Approximate Cost**: $100 USD (+ local taxes).
- **Exam Format**:
  - 65 multiple-choice or multiple-response questions.
  - Duration: 90 minutes.
  - Passing score: 700 / 1000.
  - Delivered via Pearson VUE online proctoring or in-person test center.
- **Key Domains Covered**:
  - Cloud Concepts (24%)
  - Security and Compliance (30%)
  - Cloud Technology and Services (34%)
  - Billing, Pricing, and Support (12%)
- **Suggested Study Timeline**: 2 to 4 weeks (1 hour per day).
- **Preparation Strategy**:
  - Review the official AWS exam guide and whitepapers ("Overview of Amazon Web Services" and "Architecting for the Cloud").
  - Complete the free AWS Skill Builder Cloud Practitioner Essentials course.
  - Create a free tier AWS account and interact with S3, EC2, IAM, and VPC directly.

---

## 2. AWS Certified Solutions Architect – Associate (SAA-C03)

- **Official Link**: 📖 [AWS Certified Solutions Architect - Associate](https://aws.amazon.com/certification/certified-solutions-architect-associate/)
- **Who It's For**: Cloud engineers, DevOps practitioners, software developers, and system administrators looking to design resilient, high-performing, secure, and cost-optimized architectures on AWS. This is the gold standard associate-level cloud certification.
- **Approximate Cost**: $150 USD (+ local taxes).
- **Exam Format**:
  - 65 scenario-based multiple-choice or multiple-response questions.
  - Duration: 130 minutes.
  - Passing score: 720 / 1000.
  - Delivered via Pearson VUE online or testing center.
- **Key Domains Covered**:
  - Design Secure Architectures (30%)
  - Design Resilient Architectures (26%)
  - Design High-Performing Architectures (24%)
  - Design Cost-Optimized Architectures (20%)
- **Suggested Study Timeline**: 6 to 10 weeks (1.5–2 hours per day).
- **Preparation Strategy**:
  - Deep-dive into AWS Well-Architected Framework pillars.
  - Master VPC design (subnets, route tables, NAT gateways, peering, transit gateways), compute scaling (Auto Scaling Groups, ALB, ECS), storage trade-offs (S3 tiers, EBS types, EFS), and databases (RDS Multi-AZ, Aurora, DynamoDB).
  - Build hands-on architectures: deploy three-tier web applications, configure cross-region replication, and set up least-privilege IAM roles.

---

## 3. Microsoft Certified: Azure Fundamentals (AZ-900)

- **Official Link**: 📖 [Microsoft Learn Exam AZ-900: Microsoft Azure Fundamentals](https://learn.microsoft.com/en-us/certifications/exams/az-900)
- **Who It's For**: Anyone looking to validate foundational knowledge of cloud services and how Microsoft Azure delivers compute, networking, storage, security, and governance.
- **Approximate Cost**: $99 USD (varies by region/country).
- **Exam Format**:
  - 35 to 55 multiple-choice, drag-and-drop, and matching questions.
  - Duration: 45–60 minutes.
  - Passing score: 700 / 1000.
  - Delivered via Pearson VUE.
- **Key Domains Covered**:
  - Describe Cloud Concepts (25–30%)
  - Describe Azure Architecture and Services (35–40%)
  - Describe Azure Management and Governance (30–35%)
- **Suggested Study Timeline**: 2 to 3 weeks (1 hour per day).
- **Preparation Strategy**:
  - Follow the free official Microsoft Learn AZ-900 learning paths.
  - Create a free Azure subscription ($200 credit) to explore Resource Groups, Virtual Networks, Azure VMs, Azure Blob Storage, and Entra ID (formerly Azure AD).
  - Focus on Azure-specific concepts like Management Groups, Subscriptions, Azure Policy, and Cost Management.

---

## 4. Google Cloud Associate Cloud Engineer (ACE)

- **Official Link**: 📖 [Google Cloud Associate Cloud Engineer Certification](https://cloud.google.com/learn/certification/cloud-engineer)
- **Who It's For**: Cloud engineers who deploy applications, monitor operations, and manage enterprise solutions on Google Cloud Platform using both the Google Cloud Console and the `gcloud` command-line interface.
- **Approximate Cost**: $125 USD (+ tax).
- **Exam Format**:
  - 50 to 60 multiple-choice and multiple-select questions.
  - Duration: 120 minutes.
  - Passing score: Pass / Fail (scaled score not disclosed).
  - Delivered via Webassessor (online or in-person).
- **Key Domains Covered**:
  - Setting up a cloud solution environment (projects, billing, IAM)
  - Planning and configuring a cloud solution (Compute Engine, GKE, Cloud Run)
  - Deploying and implementing a cloud solution
  - Ensuring successful operation of a cloud solution (monitoring, logging)
  - Configuring access and security (service accounts, IAM roles)
- **Suggested Study Timeline**: 6 to 8 weeks (1.5 hours per day).
- **Preparation Strategy**:
  - Complete Google Cloud Skills Boost interactive quests.
  - Practice real CLI commands: master `gcloud`, `gsutil`, and `kubectl` syntax.
  - Build projects combining Google Kubernetes Engine (GKE), Cloud Storage, BigQuery, and Cloud IAM.

---

## 5. HashiCorp Certified: Terraform Associate (003)

- **Official Link**: 📖 [HashiCorp Certified: Terraform Associate](https://www.hashicorp.com/certifications/terraform-associate)
- **Who It's For**: Cloud engineers, DevOps engineers, and SREs specializing in Infrastructure as Code (IaC) who want to prove proficiency with open-source Terraform syntax, workflows, state management, and Terraform Cloud.
- **Approximate Cost**: $70.50 USD (+ tax).
- **Exam Format**:
  - 57 multiple-choice, multiple-select, and true/false questions.
  - Duration: 60 minutes.
  - Passing score: ~70%.
  - Delivered online via PSI.
- **Key Domains Covered**:
  - Understand Infrastructure as Code (IaC) concepts
  - Understand Terraform's purpose and basic CLI commands
  - Understand Terraform modules and state management
  - Read, write, and modify configurations (HCL syntax)
  - Terraform Cloud and Enterprise capabilities
- **Suggested Study Timeline**: 3 to 5 weeks (1 hour per day).
- **Preparation Strategy**:
  - Read the official Terraform documentation on HashiCorp Developer portal.
  - Understand the lifecycle of state: remote backends, state locking, `terraform import`, `state rm`, and `state mv`.
  - Practice building modular infrastructure for AWS or local Docker containers.

---

## 6. Certified Kubernetes Administrator (CKA)

- **Official Link**: 📖 [Linux Foundation Certified Kubernetes Administrator (CKA)](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/)
- **Who It's For**: Systems engineers, cloud architects, and platform engineers responsible for installing, configuring, securing, and managing production Kubernetes clusters.
- **Approximate Cost**: $395 USD (includes one free exam retake).
- **Exam Format**:
  - 100% performance-based hands-on practical exam in a real terminal environment.
  - 15 to 20 cluster administration tasks.
  - Duration: 120 minutes.
  - Passing score: 66%.
  - Delivered online by the Linux Foundation with remote proctoring.
- **Key Domains Covered**:
  - Storage (10%)
  - Troubleshooting (30%)
  - Workloads & Scheduling (15%)
  - Cluster Architecture, Installation & Configuration (25%)
  - Services & Networking (20%)
- **Suggested Study Timeline**: 8 to 12 weeks (2 hours per day).
- **Preparation Strategy**:
  - Master `kubectl` imperative commands (`kubectl run`, `kubectl create`, `kubectl expose --dry-run=client -o yaml`) to generate manifests quickly.
  - Practice setting up a multi-node cluster from scratch using `kubeadm`.
  - Practice diagnosing broken control planes, expired TLS certificates, misconfigured CNI plugins, and broken kubelet systemd services under timed pressure.

---

## Comparison Summary Table

| Certification | Provider | Level | Focus | Cost (USD) | Format |
|---|---|---|---|:---:|---|
| **AWS Cloud Practitioner (CLF-C02)** | AWS | Entry | Cloud Fundamentals | $100 | Multiple Choice |
| **AWS Solutions Architect Associate (SAA-C03)** | AWS | Associate | Architecture Design | $150 | Scenario Multiple Choice |
| **Azure Fundamentals (AZ-900)** | Microsoft | Entry | Azure Ecosystem | $99 | Multiple Choice |
| **Associate Cloud Engineer (ACE)** | Google Cloud | Associate | Operations & CLI | $125 | Multiple Choice |
| **Terraform Associate (003)** | HashiCorp | Associate | IaC & HCL | $70.50 | Multiple Choice |
| **Certified Kubernetes Admin (CKA)** | CNCF / Linux Foundation | Intermediate | Hands-On Terminal | $395 | Performance Lab |
