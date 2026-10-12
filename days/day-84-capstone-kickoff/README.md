# Day 84: Capstone Project Kickoff
[← Previous Day](../day-83-tagging-cost-reports/README.md) | [Next Day →](../day-85-capstone-architecture/README.md)

## Goal
Initialize your capstone project repository, review the complete architecture specification, and establish local development tooling and environments.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Capstone Project Specification](../../projects/capstone/README.md) — Comprehensive architecture, requirements, milestone schedule, and rubric for the Cloud-Native Task Manager.
- 📖 [GitHub Repositories and Project Templates](https://docs.github.com/en/repositories/creating-and-managing-repositories) — GitHub documentation on setting up clean repositories, branch protection, and project structures.

## Do
Today begins the 7-day Capstone Project sprint (Days 84-90). You will build and deploy a production-grade, three-tier cloud-native web application: **The Cloud-Native Task Manager**. In today's kickoff, you will set up your project workspace, create directory scaffolds, and verify your local toolchain.

1. **Review the Capstone Scope and Architecture**:
   Inspect the full design specification located at [projects/capstone/README.md](../../projects/capstone/README.md).
   Your application will consist of:
   - A Python/Flask REST API supporting full CRUD operations (`GET`, `POST`, `PUT`, `DELETE /api/v1/tasks` and `GET /health`).
   - A PostgreSQL database for persistent storage.
   - Containerization with Docker and local testing via Docker Compose.
   - Terraform modules for VPC, Subnets, Security Groups, RDS PostgreSQL, and ECS Fargate.
   - A GitHub Actions CI/CD pipeline running linting, tests, Trivy security scans, and deployment.
   - CloudWatch monitoring, metrics, and least-privilege IAM policies.

2. **Create the Capstone Project Workspace Structure**:
   Set up your dedicated capstone project layout:
   ```bash
   CAPSTONE_DIR="$HOME/cloud-native-task-manager"
   mkdir -p "$CAPSTONE_DIR"/{app,terraform/modules/{vpc,rds,ecs,security_groups},.github/workflows,docs,tests}
   cd "$CAPSTONE_DIR"
   git init
   ```

3. **Verify all prerequisite CLI tools**:
   Ensure your workstation has all required utilities installed:
   ```bash
   echo "Checking toolchain prerequisites..."
   git --version || echo "Git missing"
   docker --version || echo "Docker missing"
   docker compose version || echo "Docker Compose missing"
   terraform -version || echo "Terraform missing"
   aws --version || echo "AWS CLI missing"
   python3 --version || echo "Python missing"
   ```

4. **Initialize the local Git configuration and `.gitignore`**:
   Ensure state files, secrets, and cache artifacts are never tracked:
   ```bash
   cat <<EOF > .gitignore
   # Byte-compiled / cache
   __pycache__/
   *.py[cod]
   *.venv
   .env

   # Terraform local state and files
   **/.terraform/*
   *.tfstate
   *.tfstate.*
   *.tfvars
   !*.tfvars.example
   crash.log

   # OS / Editor
   .DS_Store
   .idea/
   .vscode/
   EOF
   ```

5. **Create the Project Milestone Tracking Document**:
   Create `docs/MILESTONES.md` to track your progress across the next 7 days:
   ```markdown
   # Capstone Sprint Milestones

   - [x] Day 84: Project Kickoff & Local Scaffolding
   - [ ] Day 85: Architecture Diagrams & Application API Skeleton
   - [ ] Day 86: Terraform Infrastructure Modules (VPC, RDS, ECS)
   - [ ] Day 87: Dockerization & ECS Application Deployment
   - [ ] Day 88: GitHub Actions CI/CD Pipeline & Automated Tests
   - [ ] Day 89: Monitoring, CloudWatch Dashboards & Security Hardening
   - [ ] Day 90: Documentation, Presentation, Video Walkthrough & Teardown
   ```

6. **Create an initial Git commit**:
   ```bash
   git add .
   git commit -m "feat: capstone project kickoff and workspace scaffold"
   ```

## Done When
- [ ] Capstone directory hierarchy (`app`, `terraform`, `.github/workflows`, `docs`, `tests`) is created.
- [ ] Prerequisite CLI tools (Git, Docker, Terraform, AWS CLI, Python) are verified.
- [ ] `.gitignore` is created to protect state and secrets.
- [ ] Initial project commit is made to the local Git repository.
- [ ] Milestone tracking checklist is established in `docs/MILESTONES.md`.

## Cost and Cleanup
Expected Cost: **$0.00** — Non-cloud day. All scaffolding and setup are conducted locally on your workstation.

No teardown required today. Keep your `$HOME/cloud-native-task-manager` workspace intact for tomorrow's architecture and backend development.

## Stretch Goal
Create a remote repository on GitHub (e.g. `your-username/cloud-native-task-manager`), configure a `main` branch with branch protection rules requiring status checks to pass before merging, and push your kickoff commit.

## Common Mistakes
- **Skipping the initial planning phase**: Diving straight into writing Terraform without planning directory structure or understanding networking requirements leads to refactoring delays later.
- **Committing secrets or `.tfstate` files**: Never commit credentials or local `.tfstate` files to git. Ensure `.gitignore` is committed first.
- **Neglecting CLI version compatibility**: Running outdated versions of Terraform or AWS CLI can cause provider deprecation issues. Use Terraform 1.5+ and AWS CLI v2.
