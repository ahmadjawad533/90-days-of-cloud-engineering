# Day 90: Capstone Documentation and Presentation
[← Previous Day](../day-89-capstone-monitoring-security/README.md) | [Next Day →](../day-91-aws-certification-paths/README.md)

## Goal
Polish repository documentation, write an architectural case study, produce a portfolio-ready demonstration, and execute a complete infrastructure teardown.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Writing Great Technical Documentation](https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/) — Guide to structuring clear READMEs, quickstart instructions, and architecture diagrams.
- 📖 [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html) — Official guidance on reviewing cloud workloads against the six pillars of architecture.

## Do
Congratulations on reaching Day 90! Today you finalize your Cloud-Native Task Manager project, create a polished portfolio README, document key engineering decisions, and safely tear down all cloud resources.

1. **Author the Comprehensive Project README**:
   In your capstone directory root, finalize `README.md` with badging, architecture diagrams, live endpoints, and reproduction steps:
   ```bash
   cd "$HOME/cloud-native-task-manager"
   cat <<'EOF' > README.md
   # Cloud-Native Task Manager

   A production-grade, three-tier cloud application built with Python Flask, PostgreSQL, Docker, Terraform, GitHub Actions, and AWS ECS Fargate.

   [![CI/CD Pipeline](https://github.com/your-username/cloud-native-task-manager/actions/workflows/pipeline.yml/badge.svg)](actions)
   [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
   [![Terraform](https://img.shields.io/badge/IaC-Terraform-623CE4.svg)](https://terraform.io)

   ## 📐 Architecture
   ```mermaid
   flowchart TD
       User["HTTP Client / Browser"] --> ALB["AWS Application Load Balancer"]
       ALB --> ECS["Amazon ECS Fargate (Task Manager API)"]
       ECS --> RDS[("Amazon RDS PostgreSQL")]
       ECS -.-> CW["CloudWatch Logs & Metrics"]
       ECS -.-> SM["AWS Secrets Manager"]
   ```

   ## 🚀 Features
   - **RESTful API**: Full CRUD task management with `/health` liveness checks.
   - **Infrastructure as Code**: Modular Terraform configurations for VPC, subnets, ECS, and security groups.
   - **Zero-Trust Security**: Containers in private subnets, non-root Docker execution, and least-privilege IAM roles.
   - **Automated CI/CD**: GitHub Actions pipeline covering linting, pytest, Trivy container security scanning, and automated ECR builds.
   - **Observability**: CloudWatch metrics, alarms, and structured JSON logging.

   ## 🛠️ Quickstart (Local Development)
   ```bash
   git clone https://github.com/your-username/cloud-native-task-manager.git
   cd cloud-native-task-manager
   docker compose up -d
   curl http://localhost:5000/health
   ```

   ## 📖 Documentation
   - [Architecture Deep Dive](docs/ARCHITECTURE.md)
   - [CI/CD Workflow Details](docs/CICD.md)
   - [Security & Threat Model](docs/SECURITY.md)
   - [Milestones & Progress](docs/MILESTONES.md)
   EOF
   ```

2. **Conduct a Well-Architected Self-Review**:
   Evaluate your project against the 6 pillars of the AWS Well-Architected Framework:
   - **Operational Excellence**: IaC via Terraform, automated GitHub Actions CI/CD, structured JSON logs.
   - **Security**: Private subnets, non-root container, secrets in Secrets Manager, Trivy vulnerability gating.
   - **Reliability**: Multi-AZ subnet distribution, ALB health checks, container restart policies.
   - **Performance Efficiency**: Multi-stage lightweight Docker image, serverless ECS Fargate scaling.
   - **Cost Optimization**: Right-sized container tasks (256 CPU / 512 MB), automated cost alerts.
   - **Sustainability**: Serverless container execution minimizing idle compute overhead.

3. **Record or Document a Demo Walkthrough**:
   Write a script or record a 3-5 minute screen recording highlighting:
   - Git repository structure and clean commit history.
   - GitHub Actions pipeline passing automated tests and Trivy scans.
   - Terraform planning and infrastructure outputs.
   - Live HTTP request testing against `/health` and `/api/v1/tasks`.

4. **Execute Complete Infrastructure Teardown**:
   Destroy all live AWS resources to prevent ongoing cloud charges:
   ```bash
   cd "$HOME/cloud-native-task-manager/terraform"
   terraform destroy -auto-approve || echo "No active Terraform state to destroy."

   # Clean up ECR repository and images
   aws ecr delete-repository --repository-name cloud-task-manager --force || true
   ```

5. **Final Commit & Milestone Sign-off**:
   Update `docs/MILESTONES.md` marking all items complete, and commit:
   ```bash
   cd "$HOME/cloud-native-task-manager"
   sed -i 's/\[ \]/\[x\]/g' docs/MILESTONES.md 2>/dev/null || true
   git add .
   git commit -m "feat: complete capstone project documentation, architecture review, and cleanup"
   ```

## Done When
- [ ] Root `README.md` is complete with architecture diagrams, badges, and quickstart instructions.
- [ ] AWS Well-Architected Framework self-review is documented.
- [ ] All live AWS infrastructure is destroyed with `terraform destroy`.
- [ ] All 7 Capstone sprint milestones in `docs/MILESTONES.md` are checked off.

## Cost and Cleanup
Expected Cost: **$0.00** after cleanup.

Teardown must be complete:
```bash
cd "$HOME/cloud-native-task-manager/terraform"
terraform destroy -auto-approve
aws ecr delete-repository --repository-name cloud-task-manager --force 2>/dev/null || true
```
Verify via `aws ec2 describe-instances` and `aws ecs list-clusters` that no resources remain active.

## Stretch Goal
Publish your project repository publicly on GitHub, add a link in your LinkedIn profile or portfolio site, and write a LinkedIn post or blog article summarizing what you learned building your capstone.

## Common Mistakes
- **Leaving orphan resources running after demoing**: Always verify that ALBs, NAT Gateways, and RDS instances are destroyed. They incur continuous charges.
- **Incomplete README files**: Hiring managers review your GitHub README first. If setup steps or architecture diagrams are missing, they cannot evaluate your skills.
- **Skipping the retrospective**: Documenting what broke and how you fixed it demonstrates maturity and problem-solving ability to interviewers.
