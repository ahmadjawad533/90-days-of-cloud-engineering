# Day 65: What Is CI/CD?
[← Previous Day](../day-64-intro-to-ansible/README.md) | [Next Day →](../day-66-github-actions-basics/README.md)

## Goal
Understand the core principles, business benefits, and terminology of Continuous Integration, Continuous Delivery, and Continuous Deployment in modern cloud engineering.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [GitHub Actions Documentation: Understanding GitHub Actions](https://docs.github.com/en/actions/about-continuous-integration/about-continuous-integration) — Official guide on Continuous Integration concepts and automation workflows.
- 📖 [AWS DevOps Resource Guide: What is CI/CD?](https://aws.amazon.com/devops/what-is-devops/) — Cloud-native overview of automated delivery pipelines, release patterns, and DevOps cultural practices.

## Do
1. **Explore the differences between CI, CD (Delivery), and CD (Deployment)**:
   - **Continuous Integration (CI)**: Developers merge code changes frequently into a shared repository. Every push triggers automated builds, unit tests, and code quality checks to detect regressions early.
   - **Continuous Delivery (CD)**: Every verified build is packaged and automatically released to staging environments, producing an artifact that is ready for manual one-click deployment to production at any time.
   - **Continuous Deployment (CD)**: Fully automated path from commit to production. Every change that passes automated tests and security gates deploys directly to production with zero manual intervention.

   ```
   [Developer Commit]
          │
          ▼
   [CI: Automated Build & Test] ──> Passes?
          │
          ▼
   [CD: Package & Deploy to Staging]
          │
          ├──> Manual Approval ──> [Production] (Continuous Delivery)
          │
          └──> Automatic Push  ──> [Production] (Continuous Deployment)
   ```

2. **Simulate a local automated CI check using a shell script**:
   Create a test project directory to understand how a runner executes pipeline stages:
   ```bash
   mkdir -p /tmp/cicd-simulation && cd /tmp/cicd-simulation
   git init
   ```

3. **Create a sample application file and a basic test script**:
   ```bash
   cat << 'EOF' > app.py
   def add(a, b):
       return a + b

   if __name__ == "__main__":
       print(f"App running: 2 + 2 = {add(2, 2)}")
   EOF

   cat << 'EOF' > test_app.py
   from app.py import add  # deliberate error to demonstrate failure, or write clean import:
   EOF

   cat << 'EOF' > test_app.py
   import app

   def test_addition():
       assert app.add(2, 3) == 5
       assert app.add(-1, 1) == 0
       print("All unit tests passed successfully!")

   if __name__ == "__main__":
       test_addition()
   EOF
   ```

4. **Write a simulated pipeline runner script**:
   ```bash
   cat << 'EOF' > pipeline.sh
   #!/usr/bin/env bash
   set -euo pipefail

   echo "==> Stage 1: Static Code Linting"
   python3 -m py_compile app.py test_app.py
   echo "Linting check passed."

   echo "==> Stage 2: Automated Unit Testing"
   python3 test_app.py
   echo "Tests passed."

   echo "==> Stage 3: Artifact Packaging"
   tar -czf release-v1.tar.gz app.py
   echo "Artifact release-v1.tar.gz ready for deployment."
   EOF

   chmod +x pipeline.sh
   ./pipeline.sh
   ```

5. **Test pipeline failure handling**:
   Modify `app.py` to introduce a regression and run the pipeline again to witness how CI protects production:
   ```bash
   sed -i 's/a + b/a - b/' app.py
   if ! ./pipeline.sh; then
     echo "Pipeline caught the bug before deployment!"
   fi
   # Revert the regression
   sed -i 's/a - b/a + b/' app.py
   ./pipeline.sh
   ```

## Done When
- [ ] You can explain the technical difference between Continuous Delivery and Continuous Deployment.
- [ ] You understand the standard pipeline stages: Lint, Build, Test, Security Scan, Package, and Deploy.
- [ ] You ran the local simulation script and verified how test failures halt the pipeline before release.

## Cost and Cleanup
$0 — no cloud resources used.

Clean up the temporary simulation directory:
```bash
rm -rf /tmp/cicd-simulation
```

## Stretch Goal
Read about deployment strategies such as Blue/Green deployments, Canary releases, and Rolling updates. Write down how a CI/CD pipeline enables canary releases by routing 10% of user traffic to the newly released version before rolling it out to 100% of users.

## Common Mistakes
- **Confusing Continuous Delivery with Continuous Deployment**: In Continuous Delivery, deployment to production requires human approval; in Continuous Deployment, passing pipeline gates automatically releases to production.
- **Treating CI/CD as merely a tool rather than a process**: Tools like GitHub Actions or GitLab CI only execute what you specify; if your automated test coverage is low, broken code will still reach production rapidly.
- **Infrequent commits with giant diffs**: CI relies on small, frequent pull requests merged multiple times per day. Large feature branches defeat early conflict detection.
