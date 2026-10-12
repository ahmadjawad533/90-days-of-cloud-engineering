# Day 71: Pipeline for the Capstone App
[← Previous Day](../day-70-automated-testing/README.md) | [Next Day →](../day-72-intro-to-monitoring/README.md)

## Goal
Assemble a complete, production-grade CI/CD pipeline for the Cloud-Native Task Manager Capstone project, integrating linting, unit testing, Trivy container security scans, ECR image registry publishing, and automated ECS deployment.

## Time
⏱️ Approximately 120 minutes

## Learn
- 📖 [GitHub Actions: Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions) — Complete reference for environments, condition expressions, artifacts, and multi-stage jobs.
- 📖 [AWS Architecture Center: Modern Application Deployment](https://aws.amazon.com/architecture/) — Official architecture guidelines for container pipelines and zero-downtime updates on AWS.

## Do
In this milestone project day, you will build the unified CI/CD workflow that satisfies Requirement 3 of the [Capstone Project: Cloud-Native Task Manager](../../projects/capstone/README.md).

```
[ Git Push to main / PR ]
           │
     ┌─────┴──────────────┐
     │  Job 1: ci-test    │ (Linting flake8 + Pytest coverage)
     └─────┬──────────────┘
           │ (Passes)
     ┌─────┴──────────────┐
     │  Job 2: security   │ (Docker build + Trivy vulnerability audit)
     └─────┬──────────────┘
           │ (Passes & branch == 'main')
     ┌─────┴──────────────┐
     │  Job 3: deploy-cd  │ (AWS OIDC auth -> Push ECR -> Deploy to ECS)
     └────────────────────┘
```

1. **Review the Capstone structure**:
   Review the specifications in [`projects/capstone/README.md`](../../projects/capstone/README.md). The Capstone API requires automated linting, tests on pull requests, vulnerability scanning, and automated deployment on merge to `main`.

2. **Create the workspace for the Capstone pipeline**:
   ```bash
   mkdir -p /tmp/capstone-pipeline/.github/workflows
   cd /tmp/capstone-pipeline
   git init
   ```

3. **Construct the comprehensive pipeline workflow**:
   ```bash
   cat << 'EOF' > .github/workflows/capstone-pipeline.yml
   name: Capstone CI/CD Pipeline

   on:
     push:
       branches: [ "main" ]
     pull_request:
       branches: [ "main" ]

   permissions:
     id-token: write
     contents: read
     security-events: write

   jobs:
     # -------------------------------------------------------------------------
     # Stage 1: Continuous Integration (Linting & Unit Tests)
     # -------------------------------------------------------------------------
     ci-test:
       name: Lint & Automated Tests
       runs-on: ubuntu-latest

       steps:
         - name: Checkout Code
           uses: actions/checkout@v4

         - name: Set up Python
           uses: actions/setup-python@v5
           with:
             python-version: "3.11"
             cache: "pip"

         - name: Install Dependencies
           run: |
             python -m pip install --upgrade pip
             if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
             pip install flake8 pytest pytest-cov

         - name: Run Flake8 Linter
           run: |
             flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
             flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

         - name: Run Unit Tests
           run: |
             pytest --cov=. --cov-report=term-missing

     # -------------------------------------------------------------------------
     # Stage 2: Security & Container Vulnerability Scanning
     # -------------------------------------------------------------------------
     security-scan:
       name: Container Security Audit
       needs: ci-test
       runs-on: ubuntu-latest

       steps:
         - name: Checkout Code
           uses: actions/checkout@v4

         - name: Build local container image
           run: |
             docker build -t task-manager-capstone:${{ github.sha }} .

         - name: Scan Image with Trivy
           uses: aquasecurity/trivy-action@0.16.1
           with:
             image-ref: 'task-manager-capstone:${{ github.sha }}'
             format: 'table'
             exit-code: '0' # Audit mode; set to 1 to block build on criticals
             ignore-unfixed: true
             severity: 'CRITICAL,HIGH'

     # -------------------------------------------------------------------------
     # Stage 3: Continuous Deployment (ECR Push & ECS Update)
     # -------------------------------------------------------------------------
     deploy-production:
       name: Deploy to AWS ECS
       needs: [ci-test, security-scan]
       if: github.ref == 'refs/heads/main' && github.event_name == 'push'
       runs-on: ubuntu-latest
       environment: production

       steps:
         - name: Checkout Code
           uses: actions/checkout@v4

         - name: Set up Docker Buildx
           uses: docker/setup-buildx-action@v3

         - name: Configure AWS Credentials via OIDC
           uses: aws-actions/configure-aws-credentials@v4
           with:
             role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
             aws-region: ${{ vars.AWS_REGION || 'us-east-1' }}

         - name: Log in to Amazon ECR
           id: login-ecr
           uses: aws-actions/amazon-ecr-login@v2

         - name: Build and Push Docker image to ECR
           env:
             REGISTRY: ${{ steps.login-ecr.outputs.registry }}
             REPOSITORY: ${{ vars.ECR_REPOSITORY || 'cloud-native-task-manager' }}
             IMAGE_TAG: ${{ github.sha }}
           run: |
             docker build -t "$REGISTRY/$REPOSITORY:$IMAGE_TAG" -t "$REGISTRY/$REPOSITORY:latest" .
             docker push "$REGISTRY/$REPOSITORY:$IMAGE_TAG"
             docker push "$REGISTRY/$REPOSITORY:latest"

         - name: Deploy new Task Definition to ECS
           env:
             CLUSTER_NAME: ${{ vars.ECS_CLUSTER_NAME || 'task-manager-cluster' }}
             SERVICE_NAME: ${{ vars.ECS_SERVICE_NAME || 'task-manager-service' }}
           run: |
             echo "Triggering ECS deployment for service: $SERVICE_NAME"
             aws ecs update-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --force-new-deployment
   EOF
   ```

4. **Verify workflow conditionals and security boundaries**:
   Notice the critical safeguards built into this pipeline:
   - PRs trigger `ci-test` and `security-scan` but will **never** trigger `deploy-production` because of `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`.
   - The deployment job strictly requires `needs: [ci-test, security-scan]`. If either stage fails, deployment is aborted.
   - Credentials use dynamic OIDC tokens without persistent AWS keys.

5. **Validate the workflow YAML**:
   ```bash
   python3 -c "import yaml; yaml.safe_load(open('.github/workflows/capstone-pipeline.yml')); print('Capstone CI/CD workflow YAML verified successfully!')"
   ```

## Done When
- [ ] You have assembled a multi-stage pipeline connecting CI, Security Scanning, and CD.
- [ ] You have configured workflow branch safeguards so deployments only run on merges to `main`.
- [ ] Your pipeline satisfies Requirement 3 of the Capstone project checklist.

## Cost and Cleanup
$0 — no cloud resources run during this pipeline design lab.

Clean up local temporary directory:
```bash
rm -rf /tmp/capstone-pipeline
```

## Stretch Goal
Add automated Slack or Discord notification steps using webhooks at the end of the deployment job, broadcasting commit details, deployer name, and deployment status (`success` or `failure`).

## Common Mistakes
- **Running deployment on Pull Requests**: Without checking `github.ref == 'refs/heads/main' && github.event_name == 'push'`, any developer submitting a PR could inadvertently deploy unreviewed code to production.
- **Skipping image vulnerability scans**: Container images frequently bundle base OS packages with critical vulnerabilities. Scanning before registry push ensures bad images never enter ECR.
- **Missing pipeline dependency graph**: Forgetting `needs: [ci-test, security-scan]` causes all three jobs to execute simultaneously, deploying broken code while tests are still running.
