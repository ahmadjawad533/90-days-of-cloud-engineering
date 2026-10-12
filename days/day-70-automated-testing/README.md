# Day 70: Automated Testing in Pipelines
[← Previous Day](../day-69-pipeline-security/README.md) | [Next Day →](../day-71-capstone-pipeline/README.md)

## Goal
Implement a test automation pyramid inside CI pipelines encompassing unit tests, integration tests with database services, and code coverage threshold gates.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [GitHub Actions: Creating PostgreSQL service containers](https://docs.github.com/en/actions/use-cases-and-examples/using-containerized-services/about-service-containers) — Official guide on spinning up ephemeral databases in GitHub Actions jobs for integration testing.
- 📖 [Pytest Documentation: Getting Started](https://docs.pytest.org/en/stable/getting-started.html) — Comprehensive guide to assertions, test discovery, and fixtures in Python.

## Do
1. **Understand the Test Automation Pyramid**:
   - **Unit Tests**: Test individual functions and classes in isolation without external dependencies. Fast, deterministic, and plentiful.
   - **Integration Tests**: Verify interactions between application components and external services (e.g., PostgreSQL databases, Redis caches).
   - **End-to-End (E2E) Tests**: Validate full workflows from ingress to database. Slower and resource-intensive, fewer in count.

   ```
        /\
       /E2E\      <-- Fewest, slowest, runs against staging
      /Integration\ <-- Test against service containers (PostgreSQL)
     /  Unit Tests  \ <-- Most, fastest, test business logic
    /────────────────\
   ```

2. **Set up the test repository**:
   ```bash
   mkdir -p /tmp/automated-testing-lab/.github/workflows
   cd /tmp/automated-testing-lab
   git init
   ```

3. **Create an application with PostgreSQL integration**:
   ```bash
   cat << 'EOF' > requirements.txt
   psycopg2-binary==2.9.9
   pytest==7.4.3
   pytest-cov==4.1.0
   EOF

   cat << 'EOF' > db.py
   import os
   import psycopg2

   def get_db_connection():
       return psycopg2.connect(
           host=os.getenv("DB_HOST", "localhost"),
           port=os.getenv("DB_PORT", "5432"),
           database=os.getenv("DB_NAME", "testdb"),
           user=os.getenv("DB_USER", "postgres"),
           password=os.getenv("DB_PASSWORD", "postgres")
       )

   def init_schema(conn):
       with conn.cursor() as cur:
           cur.execute("""
               CREATE TABLE IF NOT EXISTS items (
                   id SERIAL PRIMARY KEY,
                   title VARCHAR(100) NOT NULL,
                   status VARCHAR(20) DEFAULT 'pending'
               );
           """)
           conn.commit()

   def insert_item(conn, title):
       with conn.cursor() as cur:
           cur.execute("INSERT INTO items (title) VALUES (%s) RETURNING id;", (title,))
           item_id = cur.fetchone()[0]
           conn.commit()
           return item_id
   EOF

   cat << 'EOF' > test_db.py
   import os
   import pytest
   from db import get_db_connection, init_schema, insert_item

   # Skip if live database isn't reachable (for local runs without running PG)
   @pytest.fixture(scope="module")
   def db():
       try:
           conn = get_db_connection()
           init_schema(conn)
           yield conn
           conn.close()
       except Exception as e:
           pytest.skip(f"Database not available: {e}")

   def test_insert_item(db):
       item_id = insert_item(db, "Complete Day 70 Lab")
       assert item_id is not None
       assert item_id > 0
   EOF
   ```

4. **Write a GitHub Actions workflow using Service Containers**:
   Notice how `services.postgres` starts an ephemeral PostgreSQL database runner container accessible on `localhost:5432`:
   ```bash
   cat << 'EOF' > .github/workflows/test-pipeline.yml
   name: Automated Integration Tests

   on:
     push:
       branches: [ "main" ]
     pull_request:
       branches: [ "main" ]

   jobs:
     integration-test:
       runs-on: ubuntu-latest

       services:
         postgres:
           image: postgres:15-alpine
           env:
             POSTGRES_DB: testdb
             POSTGRES_USER: postgres
             POSTGRES_PASSWORD: postgrespassword
           ports:
             - 5432:5432
           options: >-
             --health-cmd pg_isready
             --health-interval 10s
             --health-timeout 5s
             --health-retries 5

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
             pip install --upgrade pip
             pip install -r requirements.txt

         - name: Run Test Suite with Coverage Gate
           env:
             DB_HOST: localhost
             DB_PORT: 5432
             DB_NAME: testdb
             DB_USER: postgres
             DB_PASSWORD: postgrespassword
           run: |
             # Enforce at least 80% test coverage or fail build
             pytest --cov=. --cov-fail-under=80 --cov-report=term-missing
   EOF
   ```

5. **Commit the integration test pipeline configuration**:
   ```bash
   git add .
   git commit -m "ci: Add automated PostgreSQL integration test workflow"
   ```

## Done When
- [ ] You understand how GitHub Actions `services:` containers enable ephemeral integration testing.
- [ ] You know how to enforce code coverage requirements using `--cov-fail-under=80`.
- [ ] You can explain why mocking unit tests and executing service container integration tests serve different purposes.

## Cost and Cleanup
$0 — no cloud resources used.

Clean up the local test directory:
```bash
rm -rf /tmp/automated-testing-lab
```

## Stretch Goal
Explore test matrix execution: modify the workflow to test your code concurrently against multiple database versions (`postgres:14`, `postgres:15`, and `postgres:16`) using GitHub Actions matrix strategies.

## Common Mistakes
- **Not defining health checks on service containers**: If your integration tests execute before PostgreSQL finishes initializing, tests fail with connection refused errors. Always supply `--health-cmd pg_isready`.
- **Hardcoding credentials in test scripts**: Keep database hosts, ports, and credentials in environment variables rather than hardcoded string literals.
- **Ignoring coverage thresholds**: Without automated gates like `--cov-fail-under`, test coverage gradually erodes as new untested code is merged.
