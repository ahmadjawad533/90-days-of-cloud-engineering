import os
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s", "level":"%(levelname)s", "message":"%(message)s"}'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Database configuration from environment variables
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "taskmanager")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "postgres")

def get_db_connection():
    """Establish and return a database connection."""
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        connect_timeout=5
    )

def init_db():
    """Create initial schema if it doesn't already exist."""
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    status VARCHAR(50) DEFAULT 'pending',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.commit()
        conn.close()
        logger.info("Database schema initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")

# Internal service binding (injected by Vercel Services)
DOCKER_SERVICE_URL = os.environ.get("DOCKER_SERVICE_URL")

# Initialize DB table on application startup
init_db()

@app.route("/", methods=["GET"])
@app.route("/api", methods=["GET"])
def root():
    """Root endpoint."""
    return jsonify({
        "service": "cloud-native-task-manager-api",
        "version": "1.0.0",
        "status": "online",
        "internal_services": {
            "docker_service_bound": bool(DOCKER_SERVICE_URL)
        }
    }), 200

@app.route("/health", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health():
    """Liveness and readiness probe checking application and DB connectivity."""
    db_status = "healthy"
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
        conn.close()
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
        logger.warning(f"Healthcheck database error: {str(e)}")
        return jsonify({
            "status": "degraded",
            "database": db_status,
            "timestamp": datetime.utcnow().isoformat()
        }), 503

    return jsonify({
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }), 200

@app.route("/api/v1/tasks", methods=["GET"])
def list_tasks():
    """List all tasks."""
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM tasks ORDER BY created_at DESC;")
            tasks = cur.fetchall()
        conn.close()
        return jsonify({"count": len(tasks), "tasks": tasks}), 200
    except Exception as e:
        logger.error(f"Error fetching tasks: {str(e)}")
        return jsonify({"error": "Failed to retrieve tasks"}), 500

@app.route("/api/v1/tasks", methods=["POST"])
def create_task():
    """Create a new task."""
    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "Field 'title' is required"}), 400

    title = data["title"].strip()
    description = data.get("description", "").strip()
    status = data.get("status", "pending").strip()

    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                INSERT INTO tasks (title, description, status)
                VALUES (%s, %s, %s)
                RETURNING *;
            """, (title, description, status))
            new_task = cur.fetchone()
            conn.commit()
        conn.close()
        logger.info(f"Task created with ID {new_task['id']}")
        return jsonify(new_task), 201
    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        return jsonify({"error": "Failed to create task"}), 500

@app.route("/api/v1/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    """Retrieve a single task by ID."""
    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM tasks WHERE id = %s;", (task_id,))
            task = cur.fetchone()
        conn.close()
        if not task:
            return jsonify({"error": f"Task {task_id} not found"}), 404
        return jsonify(task), 200
    except Exception as e:
        logger.error(f"Error retrieving task {task_id}: {str(e)}")
        return jsonify({"error": "Failed to retrieve task"}), 500

@app.route("/api/v1/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    """Update task title, description, or status."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body cannot be empty"}), 400

    try:
        conn = get_db_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM tasks WHERE id = %s;", (task_id,))
            existing = cur.fetchone()
            if not existing:
                conn.close()
                return jsonify({"error": f"Task {task_id} not found"}), 404

            title = data.get("title", existing["title"])
            description = data.get("description", existing["description"])
            status = data.get("status", existing["status"])

            cur.execute("""
                UPDATE tasks
                SET title = %s, description = %s, status = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING *;
            """, (title, description, status, task_id))
            updated_task = cur.fetchone()
            conn.commit()
        conn.close()
        return jsonify(updated_task), 200
    except Exception as e:
        logger.error(f"Error updating task {task_id}: {str(e)}")
        return jsonify({"error": "Failed to update task"}), 500

@app.route("/api/v1/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    """Delete a task by ID."""
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute("DELETE FROM tasks WHERE id = %s RETURNING id;", (task_id,))
            deleted = cur.fetchone()
            conn.commit()
        conn.close()
        if not deleted:
            return jsonify({"error": f"Task {task_id} not found"}), 404
        return jsonify({"message": f"Task {task_id} successfully deleted"}), 200
    except Exception as e:
        logger.error(f"Error deleting task {task_id}: {str(e)}")
@app.route("/api/v1/internal/docker", methods=["GET"])
def call_internal_docker():
    """Call internal 'docker' service using bound Vercel service URL."""
    if not DOCKER_SERVICE_URL:
        return jsonify({
            "error": "Internal service binding 'DOCKER_SERVICE_URL' is not configured",
            "message": "Set up a service binding in vercel.json targeting the 'docker' service."
        }), 503

    import urllib.request
    try:
        target_url = f"{DOCKER_SERVICE_URL.rstrip('/')}/health"
        req = urllib.request.Request(target_url, headers={"User-Agent": "CapstoneTaskManager/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            payload = json.loads(response.read().decode("utf-8"))
            return jsonify({
                "status": "success",
                "caller": "starter",
                "target_service": "docker",
                "target_url": target_url,
                "data": payload
            }), 200
    except Exception as e:
        logger.error(f"Failed to communicate with internal docker service: {str(e)}")
        return jsonify({
            "error": "Failed to communicate with internal docker service",
            "details": str(e),
            "target_url": DOCKER_SERVICE_URL
        }), 502

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
