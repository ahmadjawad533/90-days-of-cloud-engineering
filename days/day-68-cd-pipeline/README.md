# Day 68: Building a CD Pipeline
[← Previous Day](../day-67-ci-pipeline/README.md) | [Next Day →](../day-69-pipeline-security/README.md)

## Goal
Design and configure an automated Continuous Deployment (CD) pipeline with GitHub Actions that authenticates securely to AWS, builds container images, pushes to Amazon ECR, and deploys updates to container runtimes.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [GitHub Actions: Deploying with GitHub Actions](https://docs.github.com/en/actions/deployment/about-deployments/about-continuous-deployment) — Official architectural guide on environments, deployment branches, and release automation.
- 📖 [AWS Documentation: Deploying to Amazon ECS using GitHub Actions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-cd-pipeline.html) — Best practices for automated container releases, task definition registration, and zero-downtime service updates.

## Do
Review the reference CD workflow in [`labs/github-actions/cd.yml`](../../labs/github-actions/cd.yml). In this hands-on lab, you will configure a Continuous Deployment workflow using Docker Buildx and AWS deployment steps.

1. **Set up the project repository**:
   ```bash
   mkdir -p /tmp/cd-pipeline-lab/.github/workflows
   cd /tmp/cd-pipeline-lab
   git init
   ```

2. **Create a production multi-stage Dockerfile**:
   ```bash
   cat << 'EOF' > Dockerfile
   FROM python:3.11-slim as builder
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir --user -r requirements.txt

   FROM python:3.11-slim
   WORKDIR /app
   COPY --from=builder /root/.local /root/.local
   COPY app.py .
   ENV PATH=/root/.local/bin:$PATH
   EXPOSE 8080
   CMD ["python", "app.py"]
   EOF

   cat << 'EOF' > requirements.txt
   flask==3.0.0
   gunicorn==21.2.0
   EOF

   cat << 'EOF' > app.py
   from flask import Flask
   app = Flask(__name__)

   @app.route("/")
   def index():
       return "Cloud-Native Task API v1.0 running on ECS!"

   @app.route("/health")
   def health():
       return {"status": "ok"}, 200

   if __name__ == "__main__":
       app.run(host="0.0.0.0", port=8080)
   EOF
   ```

3. **Write the CD workflow using AWS OpenID Connect (OIDC)**:
   Modern cloud security avoids long-lived secret access keys in CI/CD by assuming AWS IAM roles directly via GitHub OIDC tokens:
   ```bash
   cat << 'EOF' > .github/workflows/cd.yml
   name: CD Pipeline

   on:
     push:
       branches: [ "main" ]

   permissions:
     id-token: write   # Required for requesting the JWT OIDC token
     contents: read    # Required for actions/checkout

   jobs:
     build-and-deploy:
       name: Build Image and Deploy
       runs-on: ubuntu-latest
       environment: production

       steps:
         - name: Check out repository
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

         - name: Build and Push Docker image
           env:
             REGISTRY: ${{ steps.login-ecr.outputs.registry }}
             REPOSITORY: ${{ vars.ECR_REPOSITORY || 'cloud-native-task-manager' }}
             IMAGE_TAG: ${{ github.sha }}
           run: |
             docker build -t "$REGISTRY/$REPOSITORY:$IMAGE_TAG" -t "$REGISTRY/$REPOSITORY:latest" .
             docker push "$REGISTRY/$REPOSITORY:$IMAGE_TAG"
             docker push "$REGISTRY/$REPOSITORY:latest"

         - name: Deploy update to AWS ECS
           env:
             CLUSTER_NAME: ${{ vars.ECS_CLUSTER_NAME || 'task-manager-cluster' }}
             SERVICE_NAME: ${{ vars.ECS_SERVICE_NAME || 'task-manager-service' }}
           run: |
             echo "Updating ECS service $SERVICE_NAME on cluster $CLUSTER_NAME..."
             aws ecs update-service --cluster "$CLUSTER_NAME" --service "$SERVICE_NAME" --force-new-deployment
   EOF
   ```

4. **Test Docker build locally**:
   Ensure your Dockerfile compiles clean and test that the built image responds:
   ```bash
   docker build -t local-test-app:latest .
   docker run -d --name test-container -p 8080:8080 local-test-app:latest
   sleep 3
   curl http://localhost:8080/health
   docker stop test-container && docker rm test-container
   ```

5. **Commit the CD pipeline definition**:
   ```bash
   git add .
   git commit -m "ci/cd: Add automated container packaging and deployment workflow"
   ```

## Done When
- [ ] You understand why `id-token: write` is needed for passwordless AWS OIDC authentication.
- [ ] You have written a complete `.github/workflows/cd.yml` workflow covering image building, tagging with `${{ github.sha }}`, and deployment execution.
- [ ] You tested the Docker container build locally and verified the `/health` endpoint responds.

## Cost and Cleanup
$0 — no cloud resources created in this exercise.

Clean up local test resources:
```bash
docker rmi local-test-app:latest || true
rm -rf /tmp/cd-pipeline-lab
```

## Stretch Goal
Explore GitHub Environment protections: read how GitHub Environments allow you to configure manual reviewers ("Required reviewers") before a deployment job running against the `production` environment can execute, effectively turning Continuous Deployment into gated Continuous Delivery.

## Common Mistakes
- **Hardcoding static AWS Access Keys in repository secrets**: Static credentials risk leakage and expiration. Industry best practice is to configure IAM OpenID Connect (OIDC) roles for GitHub Actions.
- **Using only `latest` image tag without SHA tags**: Deploying only `latest` makes it impossible to roll back to a specific previous commit or trace which git commit is currently running in production. Always tag with `${{ github.sha }}` in addition to `latest`.
- **Missing `permissions: id-token: write`**: Forgetting this permission in your workflow prevents GitHub from issuing the JWT token needed by AWS STS to assume the role.
