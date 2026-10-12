# Day 69: Pipeline Security and Secrets
[← Previous Day](../day-68-cd-pipeline/README.md) | [Next Day →](../day-70-automated-testing/README.md)

## Goal
Harden CI/CD pipelines by implementing GitHub Encrypted Secrets, least-privilege permissions, secret scanning, and automated container vulnerability audits with Trivy.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [GitHub Actions: Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions) — Official guide on preventing script injection, securing tokens, and pinning third-party actions.
- 📖 [Aqua Security Trivy Documentation](https://aquasecurity.github.io/trivy/latest/) — Standard open-source container vulnerability and infrastructure scanner documentation.

## Do
1. **Understand CI/CD Attack Vectors and Defense Mechanisms**:
   - **Secret Exposure**: Accidental commits or printing secrets in runner logs. GitHub masks known secrets automatically, but environment inspection scripts can leak them if not guarded.
   - **Compromised Third-Party Actions**: Attackers may tamper with untagged action releases (`@main` or `@v1`). Pin actions to full commit SHAs or verified major versions (`@v4`).
   - **Overprivileged GITHUB_TOKEN**: By default, runners may receive excessive repository write permissions. Always enforce minimal workflow-level permissions:
     ```yaml
     permissions:
       contents: read
     ```

2. **Set up a test security workspace**:
   ```bash
   mkdir -p /tmp/pipeline-security/.github/workflows
   cd /tmp/pipeline-security
   git init
   ```

3. **Install Trivy locally to test vulnerability scanning**:
   On Ubuntu/Debian Linux:
   ```bash
   # Check if trivy is installed or download the binary release
   if ! command -v trivy &> /dev/null; then
     curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /tmp/bin v0.48.0
     export PATH="/tmp/bin:$PATH"
   fi
   trivy --version
   ```

4. **Create a sample Dockerfile with a known outdated base image to test scanning**:
   ```bash
   cat << 'EOF' > Dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY app.py .
   CMD ["python", "app.py"]
   EOF

   cat << 'EOF' > requirements.txt
   urllib3==1.26.4
   requests==2.25.0
   flask==2.0.1
   EOF

   cat << 'EOF' > app.py
   print("Vulnerability test application")
   EOF
   ```

5. **Run a local Trivy filesystem and dependency scan**:
   ```bash
   trivy fs --severity HIGH,CRITICAL .
   ```
   Notice how Trivy highlights known CVEs in outdated packages like `urllib3 1.26.4` and `requests 2.25.0`.

6. **Create a GitHub Actions security workflow**:
   Write a workflow incorporating secret scanning checks and Trivy container audits:
   ```bash
   cat << 'EOF' > .github/workflows/security-scan.yml
   name: Security & Vulnerability Scan

   on:
     push:
       branches: [ "main" ]
     pull_request:
       branches: [ "main" ]

   permissions:
     contents: read
     security-events: write

   jobs:
     scan:
       name: Container & Dependency Audit
       runs-on: ubuntu-latest

       steps:
         - name: Checkout Code
           uses: actions/checkout@v4

         - name: Build local Docker image for scanning
           run: docker build -t app-to-scan:local .

         - name: Run Trivy Vulnerability Scanner
           uses: aquasecurity/trivy-action@0.16.1
           with:
             image-ref: 'app-to-scan:local'
             format: 'table'
             exit-code: '1'
             ignore-unfixed: true
             vuln-type: 'os,library'
             severity: 'CRITICAL,HIGH'
   EOF
   ```

## Done When
- [ ] You can explain why `permissions: contents: read` is a mandatory security baseline.
- [ ] You ran Trivy locally and identified vulnerabilities in dependencies.
- [ ] You constructed a GitHub Actions security workflow that fails builds (`exit-code: '1'`) when CRITICAL vulnerabilities exist in images.

## Cost and Cleanup
$0 — no cloud resources used.

Clean up temporary files:
```bash
rm -rf /tmp/pipeline-security /tmp/bin
```

## Stretch Goal
Explore GitHub Secret Scanning and Push Protection: Learn how GitHub automatically blocks developers from pushing commits that contain live API keys, AWS credentials, or private SSH keys.

## Common Mistakes
- **Printing environment variables in debugging scripts**: Running `env` or `printenv` inside a workflow step can expose runtime tokens or unmasked variables in job logs.
- **Using mutable action tags without pinning**: Relying on unverified community actions with `@master` or `@latest` exposes your build environment to supply-chain attacks if the action repository is compromised.
- **Ignoring non-root user permissions in Docker**: Running containerized applications as `root` in production violates defense-in-depth principles. Always create and switch to a non-root user (`USER appuser`) in your `Dockerfile`.
