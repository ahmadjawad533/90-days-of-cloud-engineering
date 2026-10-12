import os
from flask import Flask, jsonify
import redis

app = Flask(__name__)

# Redis configuration via environment variables
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

def get_redis_client():
    try:
        r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True, socket_connect_timeout=1)
        r.ping()
        return r
    except Exception:
        return None

@app.route("/")
def hello():
    r = get_redis_client()
    if r:
        visits = r.incr("visits")
        return jsonify({
            "message": "Hello, Cloud Engineer! Welcome to 90 Days of Cloud Engineering.",
            "visits": visits,
            "redis_connected": True
        })
    else:
        return jsonify({
            "message": "Hello, Cloud Engineer! Welcome to 90 Days of Cloud Engineering.",
            "redis_connected": False,
            "note": "Redis is optional for Day 43, configured for Day 45 with Docker Compose."
        })

@app.route("/health")
def health():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
