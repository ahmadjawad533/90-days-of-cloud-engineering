# Day 88: Capstone CI/CD Pipeline
[← Previous Day](../day-87-capstone-app-deployment/README.md) | [Next Day →](../day-89-capstone-monitoring-security/README.md)

## Goal
Build an end-to-end GitHub Actions CI/CD pipeline that automates testing, Trivy vulnerability scanning, container builds, and deployment verification.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions) — Official guide on defining jobs, steps, matrix builds, and triggers.
- 📖 [Configuring OpenID Connect (OIDC) in AWS](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services) — Documentation on keyless authentication from GitHub Actions into AWS IAM.

## Do
In today's milestone, you will author the automated CI/CD pipeline for the Cloud-Native Task Manager. Every push or pull request will run code linting, automated unit tests, Trivy vulnerability scans, Terraform validation, and container registry publishing.

1. **Create the GitHub Actions Workflow Directory and File**:
   In your capstone repository, create `.github/workflows/pipeline.yml`:
   ```bash
   cd "$HOME/cloud-native-task-manager"
   mkdir -p .github/workflows
   ```

2. **Author the Comprehensive CI/CD Pipeline**:
   Write `.github/workflows/pipeline.yml`:
   ```yaml
   name: Task Manager CI/CD Pipeline

   on:
     push:
       branches: [ main ]
     pull_request:
       branches: [ main ]

   jobs:
     test:
       name: Lint and Unit Tests
       runs-on: ubuntu-latest
       steps:
         - name: Check out source code
           uses: actions/checkout@v4

         - name: Set up Python
           uses: actions/setup-python@v5
           with:
             python-version: "3.11"
             cache: "pip"

         - name: Install dependencies
           run: |
             python -m pip install --upgrade pip
             pip install flake8 pytest
             pip install -r app/requirements.txt

         - name: Lint Python code
           run: |
             flake8 app/ --count --select=E9,F63,F7,F82 --show-source --statistics
             flake8 app/ --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

         - name: Execute Pytest test suite
           run: |
             pytest tests/ -v

     security-scan:
       name: Container & Dependency Security Scan
       runs-on: ubuntu-latest
       steps:
         - name: Check out source code
           uses: actions/checkout@v4

         - name: Build local container image
           run: |
             docker build -t task-manager-ci:${{ github.sha }} -f app/Dockerfile app/

         - name: Run Aqua Trivy Vulnerability Scanner
           uses: aquasecurity/trivy-action@master
           with:
             image-ref: "task-manager-ci:${{ github.sha }}"
             format: "table"
             exit-code: "1"
             ignore-unfixed: true
             vuln-type: "os,library"
             severity: "CRITICAL,HIGH"

     terraform-checks:
       name: Terraform Validate and Format
       runs-on: ubuntu-latest
       steps:
         - name: Check out source code
           uses: actions/checkout@v4

         - name: Setup Terraform
           uses: hashicorp/setup-terraform@v3
           with:
             terraform_version: "1.7.0"

         - name: Terraform Format Check
           run: terraform fmt -check -recursive terraform/

         - name: Terraform Validate
           run: |
             cd terraform
             terraform init -backend=false
             terraform validate

     build-and-push:
       name: Build & Push Container to ECR
       needs: [test, security-scan, terraform-checks]
       if: github.ref == 'refs/heads/main' && github.event_name == 'push'
       runs-on: ubuntu-latest
       steps:
         - name: Check out source code
           uses: actions/checkout@v4

         - name: Configure AWS Credentials
           uses: aws-actions/configure-aws-credentials@v4
           with:
             aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
             aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
             aws-region: us-east-1

         - name: Log in to Amazon ECR
           id: login-ecr
           uses: aws-actions/amazon-ecr-login@v2

         - name: Build, tag, and push Docker image
           env:
             REGISTRY: ${{ steps.login-ecr.outputs.registry }}
             REPOSITORY: cloud-task-manager
             IMAGE_TAG: ${{ github.sha }}
           run: |
             docker build -t "$REGISTRY/$REPOSITORY:$IMAGE_TAG" -f app/Dockerfile app/
             docker build -t "$REGISTRY/$REPOSITORY:latest" -f app/Dockerfile app/
             docker push "$REGISTRY/$REPOSITORY:$IMAGE_TAG"
             docker push "$REGISTRY/$REPOSITORY:latest"
   ```

3. **Validate GitHub Workflow Syntax Locally**:
   Use Python or basic YAML parser to confirm `.github/workflows/pipeline.yml` has no indentation or syntax errors:
   ```bash
   python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pipeline.yml'))" && echo "YAML syntax is valid!"
   ```

4. **Document CI/CD Setup in Project Documentation**:
   Update `docs/CICD.md` with instructions on configuring GitHub repository secrets:
   ```bash
   cat <<'EOF' > docs/CICD.md
   # CI/CD Pipeline Documentation

   The Task Manager CI/CD pipeline is implemented with GitHub Actions:

   ## Pipeline Stages
   1. **Lint and Unit Tests**: Runs flake8 and pytest against Python 3.11.
   2. **Security Scan**: Builds the Docker container and scans with Trivy; fails on HIGH or CRITICAL vulnerabilities.
   3. **Terraform Checks**: Runs `terraform fmt -check` and `terraform validate`.
   4. **Build & Push**: Authenticates to AWS ECR, tags with Git commit SHA and `latest`, and pushes the release image.

   ## Required GitHub Secrets
   Configure in **Settings > Secrets and variables > Actions**:
   - `AWS_ACCESS_KEY_ID`: IAM user access key with ECR permissions (or OIDC Role ARN).
   - `AWS_SECRET_ACCESS_KEY`: IAM user secret key.
   EOF
   ```

5. **Commit the Pipeline to Git**:
   ```bash
   git add .github/workflows/pipeline.yml docs/CICD.md
   git commit -m "feat: complete github actions ci/cd pipeline with testing and trivy security scan"
   ```

## Done When
- [ ] Workflow file `.github/workflows/pipeline.yml` is created with test, security-scan, terraform-checks, and build-and-push jobs.
- [ ] Trivy vulnerability scanner is configured to fail on `CRITICAL,HIGH` severity issues.
- [ ] Documentation `docs/CICD.md` details pipeline stages and required secrets.
- [ ] Local YAML syntax check passes without errors.

## Cost and Cleanup
Expected Cost: **$0.00** — GitHub Actions provides 2,000 free runner minutes per month for public repositories.

No teardown required today. Push changes to GitHub if using a remote repository.

## Stretch Goal
Replace static `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` credentials in your pipeline with keyless AWS IAM OpenID Connect (OIDC) federation using `aws-actions/configure-aws-credentials` with `role-to-assume`.

## Common Mistakes
- **Putting hardcoded credentials in workflow files**: Never paste AWS access keys or secrets directly into workflow YAML. Always reference `${{ secrets.SECRET_NAME }}`.
- **Skipping the security scan in pull requests**: Run Trivy scans on every PR so vulnerabilities are caught before merging into `main`.
- **Using mutable `:latest` tags only**: Always tag container images with both `${{ github.sha }}` and `latest` so you can roll back to exact commit builds.
