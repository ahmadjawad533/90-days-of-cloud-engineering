# Day 85: Capstone Architecture Design
[← Previous Day](../day-84-capstone-kickoff/README.md) | [Next Day →](../day-86-capstone-infra-code/README.md)

## Goal
Design the detailed cloud architecture, document system network flows, and build the core Python Flask CRUD REST API backend.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [AWS Architecture Center](https://aws.amazon.com/architecture/) — Official reference architectures, diagrams, and best practices for multi-tier web applications.
- 📖 [Pallets Flask Documentation](https://flask.palletsprojects.com/) — Official documentation for building lightweight Python REST APIs with routing and JSON serialization.

## Do
In today's capstone sprint, you will formalize the network and component architecture diagrams, then implement the Flask application codebase implementing the full Task Manager API specification.

1. **Document the Architecture Diagram**:
   Navigate to your capstone directory and create `docs/ARCHITECTURE.md`:
   ```bash
   cd "$HOME/cloud-native-task-manager"
   cat <<'EOF' > docs/ARCHITECTURE.md
   # Cloud-Native Task Manager Architecture

   ## Network Topology
   - **VPC CIDR**: `10.0.0.0/16` across 2 Availability Zones (`us-east-1a`, `us-east-1b`)
   - **Public Subnets**: `10.0.1.0/24`, `10.0.2.0/24` (Hosts Application Load Balancer & NAT Gateways)
   - **Private App Subnets**: `10.0.11.0/24`, `10.0.12.0/24` (Hosts ECS Fargate container tasks)
   - **Private DB Subnets**: `10.0.21.0/24`, `10.0.22.0/24` (Hosts RDS PostgreSQL instance)

   ```mermaid
   flowchart TD
       Client["User / HTTP Client"] --> ALB["Application Load Balancer (Public)"]
       ALB --> ECS1["ECS Fargate Task A (Private App AZ1)"]
       ALB --> ECS2["ECS Fargate Task B (Private App AZ2)"]
       ECS1 --> RDS[("Amazon RDS PostgreSQL (Private DB)")]
       ECS2 --> RDS
       ECS1 -.-> CW["AWS CloudWatch Logs & Metrics"]
       ECS2 -.-> CW
   ```
   EOF
   ```

2. **Define Application Dependencies**:
   Create `app/requirements.txt`:
   ```bash
   cat <<EOF > app/requirements.txt
   flask==3.0.3
   psycopg2-binary==2.9.9
   gunicorn==22.0.0
   pytest==8.2.0
   EOF
   ```

3. **Implement the Core Application API**:
   Create `app/app.py` with support for database connectivity, in-memory fallback for local testing, health checks, and CRUD routes:
   ```bash
   cat <<'EOF' > app/app.py
   import os
   import uuid
   from flask import Flask, request, jsonify

   app = Flask(__name__)

   # In-memory storage fallback for local testing without DB
   TASKS = {}

   @app.route("/health", methods=["GET"])
   def health_check():
       return jsonify({
           "status": "healthy",
           "service": "cloud-native-task-manager",
           "version": "1.0.0"
       }), 200

   @app.route("/api/v1/tasks", methods=["GET"])
   def get_tasks():
       return jsonify({"tasks": list(TASKS.values())}), 200

   @app.route("/api/v1/tasks", methods=["POST"])
   def create_task():
       data = request.get_json() or {}
       title = data.get("title")
       if not title:
           return jsonify({"error": "Title is required"}), 400

       task_id = str(uuid.uuid4())
       task = {
           "id": task_id,
           "title": title,
           "description": data.get("description", ""),
           "status": data.get("status", "pending")
       }
       TASKS[task_id] = task
       return jsonify(task), 201

   @app.route("/api/v1/tasks/<task_id>", methods=["GET"])
   def get_task(task_id):
       task = TASKS.get(task_id)
       if not task:
           return jsonify({"error": "Task not found"}), 404
       return jsonify(task), 200

   @app.route("/api/v1/tasks/<task_id>", methods=["PUT"])
   def update_task(task_id):
       task = TASKS.get(task_id)
       if not task:
           return jsonify({"error": "Task not found"}), 404
       data = request.get_json() or {}
       task["title"] = data.get("title", task["title"])
       task["description"] = data.get("description", task["description"])
       task["status"] = data.get("status", task["status"])
       return jsonify(task), 200

   @app.route("/api/v1/tasks/<task_id>", methods=["DELETE"])
   def delete_task(task_id):
       if task_id in TASKS:
           del TASKS[task_id]
           return jsonify({"message": f"Task {task_id} deleted successfully"}), 200
       return jsonify({"error": "Task not found"}), 404

   if __name__ == "__main__":
       port = int(os.environ.get("PORT", 5000))
       app.run(host="0.0.0.0", port=port)
   EOF
   ```

4. **Write Automated Unit Tests for the API**:
   Create `tests/test_app.py`:
   ```bash
   cat <<'EOF' > tests/test_app.py
   import pytest
   import json
   from app.app import app

   @pytest.fixture
   def client():
       app.config["TESTING"] = True
       with app.test_client() as client:
           yield client

   def test_health_check(client):
       response = client.get("/health")
       assert response.status_code == 200
       data = json.loads(response.data)
       assert data["status"] == "healthy"

   def test_create_and_get_task(client):
       # Create task
       response = client.post("/api/v1/tasks", json={
           "title": "Setup VPC Terraform",
           "description": "Create subnets and route tables"
       })
       assert response.status_code == 201
       task_data = json.loads(response.data)
       task_id = task_data["id"]
       assert task_data["title"] == "Setup VPC Terraform"

       # Fetch task
       get_res = client.get(f"/api/v1/tasks/{task_id}")
       assert get_res.status_code == 200
       assert json.loads(get_res.data)["id"] == task_id
   EOF
   ```

5. **Run the Unit Tests**:
   Install pytest in a temporary virtual environment or test directly:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r app/requirements.txt
   pytest tests/
   deactivate
   ```

6. **Commit the application code and documentation**:
   ```bash
   git add docs/ app/ tests/
   git commit -m "feat: architecture design and core Flask CRUD API with tests"
   ```

## Done When
- [ ] Architecture design document `docs/ARCHITECTURE.md` is written with network topology and diagram.
- [ ] Flask REST API is written in `app/app.py` supporting `/health` and CRUD `/api/v1/tasks`.
- [ ] Automated tests in `tests/test_app.py` execute and pass via `pytest`.
- [ ] Code and docs are committed to local Git repository.

## Cost and Cleanup
Expected Cost: **$0.00** — Local application development and testing do not use cloud resources.

No teardown required today. Keep all project files ready for Day 86.

## Stretch Goal
Add SQLite or local PostgreSQL integration to `app/app.py` using SQLAlchemy so the application dynamically binds to a database when `DATABASE_URL` is configured in the environment.

## Common Mistakes
- **Hardcoding host IP `127.0.0.1`**: In containers, web servers must bind to `0.0.0.0` so traffic routed through Docker port mappings can reach the process.
- **Missing `/health` endpoint**: Load balancers (ALBs) and container orchestrators (ECS/Kubernetes) rely on health check probes to monitor container readiness and liveness.
- **Omitting input validation**: Always check that required parameters (like `title`) exist before saving records to prevent `KeyError` crashes.
