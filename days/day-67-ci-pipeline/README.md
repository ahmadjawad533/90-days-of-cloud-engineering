# Day 67: Building a CI Pipeline
[← Previous Day](../day-66-github-actions-basics/README.md) | [Next Day →](../day-68-cd-pipeline/README.md)

## Goal
Build an end-to-end Continuous Integration (CI) pipeline with GitHub Actions that checks out code, sets up runtimes, caches dependencies, runs static linting, and executes automated test suites on pull requests.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [GitHub Actions: Building and testing Python](https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-python) — Official guide on Python language setups, dependency caching, and pytest integration.
- 📖 [GitHub Actions: Caching dependencies to speed up workflows](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows) — How to optimize runner performance and cut execution time using action cache.

## Do
In this lab, you will build a complete Continuous Integration workflow for a Python web service using the reference workflow at [`labs/github-actions/ci.yml`](../../labs/github-actions/ci.yml).

1. **Set up a sample project repository**:
   ```bash
   mkdir -p /tmp/ci-pipeline-lab/.github/workflows
   cd /tmp/ci-pipeline-lab
   git init
   ```

2. **Create the application and requirements**:
   ```bash
   cat << 'EOF' > requirements.txt
   flask==3.0.0
   pytest==7.4.3
   flake8==6.1.0
   pytest-cov==4.1.0
   EOF

   cat << 'EOF' > app.py
   from flask import Flask, jsonify

   app = Flask(__name__)

   @app.route("/health")
   def health_check():
       return jsonify({"status": "healthy", "service": "task-api"}), 200

   if __name__ == "__main__":
       app.run(host="0.0.0.0", port=5000)
   EOF

   cat << 'EOF' > test_app.py
   import pytest
   from app import app

   @pytest.fixture
   def client():
       app.config["TESTING"] = True
       with app.test_client() as client:
           yield client

   def test_health_check(client):
       response = client.get("/health")
       assert response.status_code == 200
       data = response.get_json()
       assert data["status"] == "healthy"
       assert data["service"] == "task-api"
   EOF
   ```

3. **Configure the CI workflow file**:
   Copy the curriculum reference workflow or write it to `.github/workflows/ci.yml`:
   ```bash
   cat << 'EOF' > .github/workflows/ci.yml
   name: CI Pipeline

   on:
     push:
       branches: [ "main" ]
     pull_request:
       branches: [ "main" ]

   jobs:
     test:
       name: Run Unit Tests & Linting
       runs-on: ubuntu-latest

       steps:
         - name: Check out repository
           uses: actions/checkout@v4

         - name: Set up Python
           uses: actions/setup-python@v5
           with:
             python-version: "3.11"
             cache: "pip"

         - name: Install dependencies
           run: |
             python -m pip install --upgrade pip
             if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

         - name: Lint with flake8
           run: |
             # Stop build if there are Python syntax errors or undefined names
             flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
             # Warning-level linting with exit-zero for style guidelines
             flake8 . --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

         - name: Run automated tests with pytest
           run: |
             pytest --cov=. --cov-report=term-missing
   EOF
   ```

4. **Test the pipeline steps locally in a virtual environment**:
   Verify that what the runner executes passes in your local environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
   pytest --cov=. --cov-report=term-missing
   deactivate
   ```

5. **Commit the project structure**:
   ```bash
   git add .
   git commit -m "feat: Add Flask app with comprehensive CI workflow"
   ```

## Done When
- [ ] You have a complete `.github/workflows/ci.yml` with checkout, setup-python, dependency caching, flake8 linting, and pytest steps.
- [ ] You understand why `actions/checkout@v4` is necessary in every workflow job needing repository files.
- [ ] All unit tests and code coverage reports pass locally without syntax or linting errors.

## Cost and Cleanup
$0 — no cloud resources used.

Remove local test directory:
```bash
rm -rf /tmp/ci-pipeline-lab
```

## Stretch Goal
Add step timeouts (`timeout-minutes: 10`) and branch protection rules concept: learn how GitHub branch protection rules require the `Run Unit Tests & Linting` job to pass before merging any pull request into the `main` branch.

## Common Mistakes
- **Forgetting `actions/checkout@v4`**: GitHub Actions runners launch in a clean VM container with an empty workspace. Without checking out your code, tools like `pytest` or `flake8` fail immediately because no files exist.
- **Skipping dependency caching**: Re-downloading large packages on every run slows down workflows and wastes bandwidth. Using `cache: "pip"` in `actions/setup-python` speeds up runs drastically.
- **Failing silently on lint errors**: Running tools without checking exit codes causes broken builds to be reported as successful.
