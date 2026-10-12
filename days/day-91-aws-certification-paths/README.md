# Day 91: AWS Certification Paths
[← Previous Day](../day-90-capstone-docs-presentation/README.md) | [Next Day →](../day-92-study-strategies/README.md)

## Goal
Understand cloud certification roadmaps, select the right entry and associate-level certifications for your career trajectory, and map exam domains to your hands-on experience.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [AWS Certification Overview](https://aws.amazon.com/certification/) — Official catalog of AWS Foundational, Associate, Professional, and Specialty credentials.
- 📖 [AWS Certified Solutions Architect - Associate Exam Guide](https://d1.awsstatic.com/training-and-certification/docs-sa-assoc/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf) — Official blueprint detailing exam content domains and score weighting.

## Do
In today's session, you will review the major cloud certification tracks, identify the high-impact credentials for cloud engineering roles, map your completed 90 days of coursework against official exam blueprints, and formulate an actionable target exam timeline.

1. **Compare Foundational vs. Associate vs. Professional Tiers**:
   - **Foundational (AWS Certified Cloud Practitioner - CLF-C02)**: Focuses on broad concepts, billing, cloud economics, and high-level service naming. Good for non-technical roles or complete beginners, but often skipped by engineering candidates.
   - **Associate Tiers (Core Engineering Focus)**:
     - **AWS Certified Solutions Architect – Associate (SAA-C03)**: Broad architectural patterns, resilience, high availability, VPC networking, compute, storage, databases, and cost optimization. The most recognized industry baseline.
     - **AWS Certified SysOps Administrator – Associate (SOA-C02)**: Operational monitoring, deployment automation, troubleshooting, CloudWatch, and systems administration.
     - **AWS Certified Developer – Associate (DVA-C03)**: Application development on AWS, Lambda, API Gateway, DynamoDB, CI/CD with CodePipeline.
   - **Multi-Cloud Alternatives**:
     - **Azure**: AZ-900 (Fundamentals), AZ-104 (Azure Administrator Associate), AZ-305 (Azure Solutions Architect Expert).
     - **GCP**: Cloud Digital Leader, Associate Cloud Engineer (ACE).
     - **Specialty / Tool-Specific**: HashiCorp Certified: Terraform Associate, Linux Foundation CKA (Certified Kubernetes Administrator).

2. **Map 90 Days Experience to SAA-C03 Domains**:
   Review how the curriculum maps directly to the four core SAA-C03 domains:
   - **Domain 1: Design Secure Architectures (30%)**: Days 32 (IAM), 35 (Security Groups), 78-81 (Security, Least Privilege, Secrets, Container Scanning).
   - **Domain 2: Design Resilient Architectures (26%)**: Days 6 (Load Balancing), 33-34 (VPC & Subnets), 40 (Three-Tier VPC), 85-87 (Capstone Architecture & ECS).
   - **Domain 3: Design High-Performing Architectures (24%)**: Days 36-39 (EC2, S3, RDS), 41-47 (Docker), 48-56 (Kubernetes), 73-77 (Observability).
   - **Domain 4: Design Cost-Optimized Architectures (20%)**: Days 82 (Cost Optimization), 83 (Tagging & Budgets), 86 (IaC Sizing).

3. **Assess Skill Readiness**:
   Create a local markdown file `certification_plan.md` on your workstation:
   ```markdown
   # Cloud Certification Strategy

   ## Target Exam
   - **Primary Goal**: AWS Certified Solutions Architect - Associate (SAA-C03)
   - **Secondary Tool Goal**: HashiCorp Certified Terraform Associate (003)
   - **Target Exam Date**: 4 to 6 weeks from curriculum completion

   ## Self-Assessment Audit
   - [x] VPC Networking & Subnet routing (Hands-on complete)
   - [x] IAM Roles, Policies, and Boundaries (Hands-on complete)
   - [x] Containerization & Orchestration (Hands-on complete)
   - [x] Terraform Infrastructure Automation (Hands-on complete)
   - [ ] Managed Storage tiers (S3 lifecycle transitions, EFS vs EBS nuances)
   - [ ] Serverless compute services (AWS Lambda event sources, Step Functions)
   ```

4. **Review Official Exam Logistics**:
   - Exam format: 65 questions (multiple choice / multiple response).
   - Time limit: 130 minutes.
   - Passing score: 720 / 1000.
   - Delivery: Pearson VUE testing center or online proctored exam.
   - Retake policy: 14-day mandatory waiting period if unsuccessful on first attempt.

## Done When
- [ ] Understand the differences between Foundational, Associate, and Specialty certifications.
- [ ] Read the official SAA-C03 exam guide domains.
- [ ] Create `certification_plan.md` with targeted certifications, target dates, and knowledge gap self-assessment.

## Cost and Cleanup
Expected Cost: **$0.00 — no cloud resources used.**

Study planning is free. (Note: Scheduling the SAA exam is $150 USD or $75 if using an AWS 50% discount voucher from a previous exam).

## Stretch Goal
Explore vendor-neutral certifications such as the [HashiCorp Terraform Associate](https://www.hashicorp.com/certifications/terraform-associate) or [Linux Foundation CKA](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/) and determine if adding an IaC or Kubernetes credential strengthens your target role profile.

## Common Mistakes
- **Collecting certifications without building projects**: Certifications validate knowledge, but projects prove competence. A resume with 4 certificates and no GitHub portfolio raises red flags. Pair certs with code.
- **Spending months on Cloud Practitioner (CLF-C02)**: If you completed these 90 days of hands-on engineering, you already have the practical knowledge to jump straight into the Solutions Architect Associate (SAA-C03).
- **Cramming exam dumps instead of understanding concepts**: Memorizing leaked questions leaves you unprepared for technical interviews and troubleshooting on the job. Focus on understanding *why* an architectural choice is right.
