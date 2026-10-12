# Day 46: Container Registries (ECR, Docker Hub)
[← Previous Day](../day-45-docker-compose/README.md) | [Next Day →](../day-47-multi-stage-builds/README.md)

## Goal
Build, tag, and publish container images to public and private container registries including Docker Hub and Amazon Elastic Container Registry (ECR).

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Docker Hub Quickstart](https://docs.docker.com/docker-hub/) — Official Docker guide explaining image repositories, tags, authentication, and push/pull workflows.
- 📖 [Amazon ECR User Guide](https://docs.aws.amazon.com/AmazonECR/latest/userguide/) — Official AWS guide covering private ECR repositories, authentication tokens, and lifecycle policies.

## Do
A container image built on your laptop only exists locally. To deploy it to servers, cloud virtual machines, or Kubernetes clusters, you store it in a centralized **container registry**.

### Part 1: Tagging and Docker Hub

1. Check your existing local image from the Day 43 lab or build one now:
   ```bash
   cd "labs/docker"
   docker build -t cloud-app:v1.0.0 .
   ```

2. Understand the Docker image tagging convention:
   ```
   [registry-host/][namespace/]repository-name:tag
   ```
   When no registry host is specified, Docker defaults to Docker Hub (`docker.io`).

3. Tag the image with your Docker Hub username (replace `YOUR_DOCKERHUB_USERNAME` with your handle, or test with a local dummy tag):
   ```bash
   export DOCKER_USER="YOUR_DOCKERHUB_USERNAME"
   docker tag cloud-app:v1.0.0 "${DOCKER_USER}/cloud-app:1.0.0"
   docker tag cloud-app:v1.0.0 "${DOCKER_USER}/cloud-app:latest"
   ```

4. View your tagged images:
   ```bash
   docker images | grep cloud-app
   ```
   Notice that both tags share the exact same `IMAGE ID`—tags are simply pointers (aliases) to immutable image digests.

5. (Optional, if you have a Docker Hub account) Authenticate and push:
   ```bash
   docker login -u "${DOCKER_USER}"
   docker push "${DOCKER_USER}/cloud-app:1.0.0"
   docker push "${DOCKER_USER}/cloud-app:latest"
   ```

### Part 2: Amazon Elastic Container Registry (ECR)

6. Set your target AWS region and create a private ECR repository:
   ```bash
   export AWS_REGION="us-east-1"
   export REPO_NAME="cloud-engineering-app"

   aws ecr create-repository \
     --repository-name "${REPO_NAME}" \
     --image-scanning-configuration scanOnPush=true \
     --region "${AWS_REGION}"
   ```

7. Retrieve your AWS Account ID and construct your ECR registry URI:
   ```bash
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
   ECR_REPO_URI="${ECR_REGISTRY}/${REPO_NAME}"
   echo "ECR Repository URI: ${ECR_REPO_URI}"
   ```

8. Authenticate your local Docker client to the private ECR registry:
   ```bash
   aws ecr get-login-password --region "${AWS_REGION}" | \
     docker login --username AWS --password-stdin "${ECR_REGISTRY}"
   ```
   *(The `aws ecr get-login-password` command generates a short-lived 12-hour authentication token that Docker uses as its password).*

9. Tag your local image for Amazon ECR:
   ```bash
   docker tag cloud-app:v1.0.0 "${ECR_REPO_URI}:1.0.0"
   docker tag cloud-app:v1.0.0 "${ECR_REPO_URI}:latest"
   ```

10. Push the image to Amazon ECR:
    ```bash
    docker push "${ECR_REPO_URI}:1.0.0"
    docker push "${ECR_REPO_URI}:latest"
    ```

11. Verify the uploaded image in ECR:
    ```bash
    aws ecr describe-images \
      --repository-name "${REPO_NAME}" \
      --region "${AWS_REGION}" \
      --query "imageDetails[*].[imageTags,imagePushedAt,imageSizeInBytes]" \
      --output table
    ```

12. Test pulling the image by digest or tag from ECR:
    ```bash
    # Remove local tag first
    docker rmi "${ECR_REPO_URI}:1.0.0"

    # Pull cleanly from ECR
    docker pull "${ECR_REPO_URI}:1.0.0"
    ```

## Done When
- [ ] You understood the anatomy of a container image URI and tag.
- [ ] You tagged a local image with both semantic version (`1.0.0`) and `latest`.
- [ ] You created a private Amazon ECR repository using the AWS CLI.
- [ ] You authenticated Docker against ECR using `aws ecr get-login-password`.
- [ ] You pushed your image to ECR and verified its presence with `aws ecr describe-images`.
- [ ] You cleaned up the cloud repository to prevent storage charges.

## Cost and Cleanup
Expected Cost: **$0.00** — ECR offers 500 MB/month of storage in the AWS Free Tier. However, repositories should be deleted to prevent ongoing storage charges.

Delete the ECR repository and its images:
```bash
aws ecr delete-repository \
  --repository-name "${REPO_NAME}" \
  --region "${AWS_REGION}" \
  --force

# Remove local cloud tags
docker rmi "${ECR_REPO_URI}:latest" 2>/dev/null || true
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Amazon Elastic Container Registry (ECR) | Azure Container Registry (ACR) | Artifact Registry (formerly Container Registry) |
| `aws ecr get-login-password` | `az acr login --name <registry>` | `gcloud auth configure-docker` |
| ECR Public Gallery | Microsoft Artifact Registry / Docker Hub | Artifact Registry Public Repositories |

- 📖 [Azure Container Registry Documentation](https://learn.microsoft.com/en-us/azure/container-registry/)
- 📖 [Google Cloud Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)

## Stretch Goal
Configure an **ECR Lifecycle Policy** JSON file that automatically expires untagged images older than 7 days, or keeps only the last 5 tagged images. Apply it with:
```bash
aws ecr put-lifecycle-policy \
  --repository-name "${REPO_NAME}" \
  --lifecycle-policy-text '{"rules":[{"rulePriority":1,"description":"Expire untagged images","selection":{"tagStatus":"untagged","countType":"sinceImagePushed","countUnit":"days","countNumber":7},"action":{"type":"expire"}}]}' \
  --region "${AWS_REGION}"
```

## Common Mistakes
- **Using `latest` in production environments:** The `latest` tag is mutable and can overwrite previous builds unexpectedly, making rollbacks unpredictable. Always push and deploy immutable semantic tags (e.g., `v1.2.3` or git commit hashes like `git-sha-7a3b4c`).
- **Token expiration with `docker login`:** ECR authorization tokens expire after 12 hours. If your push fails later with `denied: Your authorization token has expired`, rerun the `aws ecr get-login-password` pipe.
- **Forgetting the `--force` flag during repository deletion:** `aws ecr delete-repository` will fail if the repository still contains container images. Use `--force` to delete the repository along with all stored images.
