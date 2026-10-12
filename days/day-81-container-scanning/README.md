# Day 81: Container and Image Scanning
[← Previous Day](../day-80-secrets-management/README.md) | [Next Day →](../day-82-cost-optimization/README.md)

## Goal
Implement container security scanning using Trivy to detect OS and application vulnerabilities, misconfigurations, and leaked secrets prior to registry push and deployment.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Trivy Documentation](https://trivy.dev/latest/docs/) — Official documentation for Aqua Security's Trivy vulnerability, secret, and misconfiguration scanner.
- 📖 [Amazon ECR Image Scanning](https://docs.aws.amazon.com/AmazonECR/latest/userguide/image-scanning.html) — AWS documentation on automated basic and enhanced scanning for container repositories.

## Do
In this lab, you will install Trivy, build a Docker container with an intentionally vulnerable dependency, scan the image locally for CVEs and hardcoded secrets, fail a build based on severity threshold, and remediate the identified findings.

1. **Install Trivy CLI locally**:
   ```bash
   # On Debian/Ubuntu Linux:
   sudo apt-get update && sudo apt-get install -y wget apt-transport-https gnupg lsb-release
   wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
   echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
   sudo apt-get update && sudo apt-get install -y trivy || curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /tmp
   export PATH="/tmp:$PATH"
   trivy --version
   ```

2. **Create a sample application with deliberate vulnerabilities**:
   Create a directory and Dockerfile with an outdated base image and hardcoded fake secret:
   ```bash
   mkdir -p /tmp/trivy-lab && cd /tmp/trivy-lab

   cat <<EOF > requirements.txt
   flask==1.1.2
   requests==2.20.0
   EOF

   cat <<EOF > Dockerfile
   FROM python:3.7-slim

   WORKDIR /app
   ENV API_KEY="AKIAIOSFODNN7EXAMPLE"

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .
   CMD ["python", "app.py"]
   EOF

   cat <<EOF > app.py
   from flask import Flask
   app = Flask(__name__)

   @app.route("/")
   def index():
       return "Vulnerable App Test"

   if __name__ == "__main__":
       app.run(host="0.0.0.0", port=5000)
   EOF
   ```

3. **Build the container image**:
   ```bash
   docker build -t test-vulnerable-app:1.0 .
   ```

4. **Run a full vulnerability scan with Trivy**:
   Scan the image for OS and language-package vulnerabilities:
   ```bash
   trivy image test-vulnerable-app:1.0
   ```
   Notice the CVEs detected in the Python 3.7 base image and outdated Flask/requests libraries.

5. **Scan for secret leaks and misconfigurations**:
   ```bash
   # Scan container image for embedded secrets
   trivy image --scanners secret test-vulnerable-app:1.0

   # Scan Dockerfile for configuration best practices (e.g. running as root, outdated syntax)
   trivy config Dockerfile
   ```

6. **Integrate a CI gate (fail pipeline on CRITICAL vulnerabilities)**:
   Test CI exit code behavior: Trivy returns exit code 1 if vulnerabilities matching the severity filter exist:
   ```bash
   trivy image --severity HIGH,CRITICAL --exit-code 1 test-vulnerable-app:1.0 || echo "Scan failed due to HIGH/CRITICAL CVEs! Build stopped."
   ```

7. **Remediate vulnerabilities**:
   Upgrade the base image to `python:3.11-slim`, remove the embedded secret, upgrade dependencies, and introduce a non-root user:
   ```bash
   cat <<EOF > requirements.txt
   flask>=3.0.0
   requests>=2.31.0
   EOF

   cat <<EOF > Dockerfile
   FROM python:3.11-slim

   WORKDIR /app

   RUN groupadd -r appgroup && useradd -r -g appgroup appuser

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY app.py .
   USER appuser

   EXPOSE 5000
   CMD ["python", "app.py"]
   EOF

   docker build -t test-vulnerable-app:2.0 .
   trivy image --severity HIGH,CRITICAL --exit-code 1 test-vulnerable-app:2.0
   ```
   The scan now passes cleanly with 0 HIGH/CRITICAL vulnerabilities.

## Done When
- [ ] Trivy is installed and operational.
- [ ] Sample Docker image is scanned for CVEs, secrets, and configuration flaws.
- [ ] Automated gate test (`--exit-code 1`) halts execution when vulnerabilities are detected.
- [ ] Dockerfile and dependencies are patched to modern versions, passing the Trivy gate cleanly.

## Cost and Cleanup
Expected Cost: **$0.00** — Local Docker image scanning and Trivy open-source engine do not incur any cloud costs.

Clean up local containers and files:
```bash
docker rmi test-vulnerable-app:1.0 test-vulnerable-app:2.0 || true
rm -rf /tmp/trivy-lab
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Trivy Open Source Scanner | Microsoft Defender for Containers / Trivy | Google Artifact Registry Container Scanning / Trivy |
| Amazon ECR Enhanced Scanning (Inspector) | Azure Container Registry (ACR) Vulnerability Assessment | Google Cloud Artifact Analysis |
| AWS Secrets Manager secret leak checks | Azure Key Vault scanning / GitHub Secret Scanning | GCP Secret Manager / Sensitive Data Protection |

- 📖 [Azure Container Registry Vulnerability Scanning](https://learn.microsoft.com/en-us/azure/container-registry/container-registry-transfer-images)
- 📖 [Google Artifact Analysis Overview](https://cloud.google.com/artifact-analysis/docs/overview)

## Stretch Goal
Create a `.trivyignore` file to ignore an acceptable low-risk CVE with an approved expiration date and business justification comment, and re-run Trivy to verify how exemptions are managed in enterprise environments.

## Common Mistakes
- **Running containers as root user**: Always declare `USER <non-root>` in your Dockerfile so compromised containers cannot easily break out to the host.
- **Using `:latest` or unpinned base images**: Unpinned base tags lead to unpredictable builds and unmonitored vulnerability introductions. Always pin specific minor or digest versions.
- **Scanning only at build time**: Vulnerabilities are discovered continuously. Images sitting in registries must be periodically re-scanned (e.g. via AWS ECR enhanced scanning).
