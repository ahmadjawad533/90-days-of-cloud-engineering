# Day 87: Capstone Application Deployment
[← Previous Day](../day-86-capstone-infra-code/README.md) | [Next Day →](../day-88-capstone-cicd/README.md)

## Goal
Build a production-grade multi-stage Docker image for the application, push it to Amazon ECR, and deploy the containerized service to AWS ECS Fargate behind an Application Load Balancer.

## Time
⏱️ Approximately 100 minutes

## Learn
- 📖 [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/) — Official guide on minimizing container image attack surface and size.
- 📖 [Amazon ECS on AWS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html) — Documentation on defining task definitions, service configurations, and ALB target group routing.

## Do
In today's milestone, you will author the production Dockerfile, set up a local Docker Compose test environment, create an Amazon ECR repository, and deploy the application on ECS Fargate.

1. **Author the Production Multi-Stage Dockerfile**:
   Navigate to your capstone directory and create `app/Dockerfile`:
   ```bash
   cd "$HOME/cloud-native-task-manager"
   cat <<'EOF' > app/Dockerfile
   # Stage 1: Builder
   FROM python:3.11-slim AS builder

   WORKDIR /build
   COPY requirements.txt .
   RUN pip install --no-cache-dir --user -r requirements.txt

   # Stage 2: Minimal Production Runtime
   FROM python:3.11-slim

   WORKDIR /app

   # Create non-root user
   RUN groupadd -r appgroup && useradd -r -u 1001 -g appgroup appuser

   # Copy installed Python packages from builder
   COPY --from=builder /root/.local /home/appuser/.local
   COPY app.py .

   ENV PATH="/home/appuser/.local/bin:$PATH"
   ENV PYTHONUNBUFFERED=1
   ENV PORT=5000

   USER appuser
   EXPOSE 5000

   HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
     CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

   CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "app:app"]
   EOF
   ```

2. **Create Docker Compose for Zero-Config Local Testing**:
   Create `docker-compose.yml` in the project root:
   ```bash
   cat <<'EOF' > docker-compose.yml
   version: "3.8"

   services:
     api:
       build:
         context: ./app
         dockerfile: Dockerfile
       ports:
         - "5000:5000"
       environment:
         - PORT=5000
       restart: unless-stopped
   EOF

   # Test building and running locally
   docker compose up -d --build
   sleep 3
   curl -i http://localhost:5000/health
   docker compose down
   ```

3. **Create Amazon ECR Repository**:
   Authenticate with AWS and create an ECR repository for the capstone image:
   ```bash
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   AWS_REGION="us-east-1"
   REPO_NAME="cloud-task-manager"

   aws ecr describe-repositories --repository-names "$REPO_NAME" || \
     aws ecr create-repository \
       --repository-name "$REPO_NAME" \
       --image-scanning-configuration scanOnPush=true \
       --region "$AWS_REGION"

   ECR_URI="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}"
   ```

4. **Authenticate Docker, Build, and Push to Amazon ECR**:
   ```bash
   aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

   docker build -t "${ECR_URI}:latest" -f app/Dockerfile app/
   docker push "${ECR_URI}:latest"
   ```

5. **Deploy ECS Task Definition and Service with Terraform**:
   Add the ECS Task Definition, Service, and ALB resources into `terraform/ecs_alb.tf`:
   ```bash
   cat <<'EOF' > terraform/ecs_alb.tf
   # IAM Role for ECS Task Execution
   resource "aws_iam_role" "ecs_execution" {
     name = "${var.project_name}-ecs-execution-role"

     assume_role_policy = jsonencode({
       Version = "2012-10-17"
       Statement = [{
         Action    = "sts:AssumeRole"
         Effect    = "Allow"
         Principal = { Service = "ecs-tasks.amazonaws.com" }
       }]
     })
   }

   resource "aws_iam_role_policy_attachment" "ecs_execution" {
     role       = aws_iam_role.ecs_execution.name
     policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
   }

   # CloudWatch Log Group for Task Logs
   resource "aws_cloudwatch_log_group" "ecs" {
     name              = "/ecs/${var.project_name}"
     retention_in_days = 7
   }

   # ECS Task Definition
   resource "aws_ecs_task_definition" "app" {
     family                   = "${var.project_name}-task"
     network_mode             = "awsvpc"
     requires_compatibilities = ["FARGATE"]
     cpu                      = "256"
     memory                   = "512"
     execution_role_arn       = aws_iam_role.ecs_execution.arn

     container_definitions = jsonencode([{
       name      = "api"
       image     = "${var.ecr_image_uri}:latest"
       essential = true
       portMappings = [{
         containerPort = 5000
         hostPort      = 5000
       }]
       logConfiguration = {
         logDriver = "awslogs"
         options = {
           "awslogs-group"         = aws_cloudwatch_log_group.ecs.name
           "awslogs-region"        = var.aws_region
           "awslogs-stream-prefix" = "app"
         }
       }
     }])
   }
   EOF

   cat <<'EOF' >> terraform/variables.tf
   variable "ecr_image_uri" {
     type        = string
     description = "URI of the ECR image"
     default     = ""
   }
   EOF
   ```

6. **Commit the container and deployment configurations**:
   ```bash
   git add app/Dockerfile docker-compose.yml terraform/
   git commit -m "feat: multi-stage dockerfile, docker compose, and ecs task definitions"
   ```

## Done When
- [ ] Multi-stage `Dockerfile` is built with non-root user and health check.
- [ ] Local container test with `docker compose` passes cleanly (`curl http://localhost:5000/health`).
- [ ] Amazon ECR repository is provisioned and image tag `:latest` is pushed.
- [ ] ECS execution IAM role and Fargate task definition are defined in Terraform.

## Cost and Cleanup
Expected Cost: **~$0.05** (ECR storage is pennies; keeping ECS Fargate running is ~$0.012/hour).
If you apply the infrastructure live on AWS, remember you can tear it down anytime:
```bash
# Optional teardown if you deployed live resources:
# cd terraform && terraform destroy -auto-approve
```
To delete the ECR test image:
```bash
aws ecr batch-delete-image --repository-name "$REPO_NAME" --image-ids imageTag=latest || true
```

## Stretch Goal
Configure a public Application Load Balancer (ALB) and target group in Terraform with `/health` health checks, and register the ECS service into the target group to verify live HTTP access.

## Common Mistakes
- **Bloated container image sizes**: Failing to use multi-stage builds leaves compilers, pip caches, and unnecessary tooling in the runtime image.
- **Missing CloudWatch log permissions**: If the ECS execution role lacks `logs:CreateLogStream` and `logs:PutLogEvents`, container startup will hang silently.
- **Forgetting to authenticate Docker with ECR**: Running `docker push` without running `aws ecr get-login-password` results in authorization errors.
