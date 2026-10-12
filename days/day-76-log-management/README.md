# Day 76: Log Management and Analysis
[← Previous Day](../day-75-grafana/README.md) | [Next Day →](../day-77-alerts-incident-response/README.md)

## Goal
Implement structured JSON application logging, configure log aggregation pipelines, and master log analysis patterns for debugging distributed cloud microservices.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [12-Factor App Methodology: XI. Logs (Treat logs as event streams)](https://12factor.net/logs) — The core cloud-native standard for process log routing and stream multiplexing.
- 📖 [Amazon CloudWatch Logs Documentation: Working with Log Groups and Streams](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html) — AWS best practices for centralized retention, structured logging, and filtering.

## Do
1. **Understand Modern Log Architectures**:
   - **Unstructured Logs (Anti-pattern)**: Free-form text lines like `User 42 logged in successfully at 10:45 AM`. Difficult to parse with automated regex, brittle across version changes.
   - **Structured Logs (Cloud-Native Best Practice)**: Serialized JSON events written directly to `stdout`/`stderr`. Enables fast indexing, arbitrary key filtering, and aggregation:
     ```json
     {"timestamp": "2026-10-12T11:00:00Z", "level": "INFO", "service": "task-api", "event": "user_login", "user_id": 42, "ip": "203.0.113.19"}
     ```
   - **Log Aggregation Pipelines**: Application writes to `stdout` -> Container runtime collects -> Daemon agent (Fluent Bit / Vector / CloudWatch Agent) ships -> Centralized Storage (CloudWatch Logs, OpenSearch, Loki, or Datadog).

2. **Create a structured logging utility in Python**:
   Set up a project directory to experiment with structured application logging:
   ```bash
   mkdir -p /tmp/log-management-lab && cd /tmp/log-management-lab

   cat << 'EOF' > logger_demo.py
   import json
   import sys
   import datetime
   import uuid

   def log_event(level, message, **kwargs):
       record = {
           "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
           "level": level.upper(),
           "service": "task-manager-api",
           "message": message,
           **kwargs
       }
       # Write serialized JSON to stdout
       sys.stdout.write(json.dumps(record) + "\n")
       sys.stdout.flush()

   # Simulate API lifecycle events
   req_id = str(uuid.uuid4())
   log_event("info", "Handling incoming HTTP request", request_id=req_id, path="/api/v1/tasks", method="GET")
   log_event("debug", "Database query executed", request_id=req_id, query_time_ms=12.4, rows=8)
   log_event("warn", "Cache miss on redis key", request_id=req_id, cache_key="tasks:all")
   log_event("error", "Database connection pool exhausted", request_id=req_id, error_code="DB_POOL_MAX", retry_count=3)
   EOF

   python3 logger_demo.py > app.log
   cat app.log
   ```

3. **Analyze and extract structured logs with `jq`**:
   `jq` is the command-line standard for parsing and filtering JSON log files:
   ```bash
   # Filter for ERROR logs only
   echo "=== ERROR LOGS ==="
   jq 'select(.level == "ERROR")' app.log

   # Extract only timestamp, level, and message fields in clean tabular format
   echo "=== FORMATTED REPORT ==="
   jq -r '[.timestamp, .level, .message] | @tsv' app.log

   # Filter by specific request_id across multiple log lines (trace correlation)
   REQ_TO_TRACE=$(jq -r '.request_id' app.log | head -n 1)
   echo "=== TRACING REQUEST: ${REQ_TO_TRACE} ==="
   jq --arg rid "${REQ_TO_TRACE}" 'select(.request_id == $rid)' app.log
   ```

4. **Understand Log Rotation and Retention**:
   In Linux systems, logs that are not rotated will eventually fill up the root partition. Inspect standard logrotate configuration patterns:
   ```bash
   cat << 'EOF' > /tmp/log-management-lab/sample-logrotate.conf
   /var/log/task-app/*.log {
       daily
       rotate 7
       compress
       delaycompress
       missingok
       notifempty
       create 0640 appuser appuser
   }
   EOF
   cat sample-logrotate.conf
   ```

## Done When
- [ ] You can explain why writing structured JSON logs to `stdout`/`stderr` is the cloud-native standard over writing to local disk files.
- [ ] You generated structured JSON logs and filtered them using `jq` commands.
- [ ] You understand how request IDs enable distributed tracing and log correlation across microservices.

## Cost and Cleanup
$0 — no cloud resources used.

Remove local experiment files:
```bash
rm -rf /tmp/log-management-lab
```

## Stretch Goal
Read about Grafana Loki: Understand how Grafana Loki indexes metadata labels rather than full text to store logs cheaply compared to Elasticsearch/OpenSearch, and how LogQL allows querying logs side-by-side with Prometheus metrics.

## Common Mistakes
- **Writing logs to local container disk instead of `stdout`**: Containers are ephemeral. If an application writes logs to `/var/log/app.log` inside a container, those logs are permanently lost when the container crashes, restarts, or scales down.
- **Logging sensitive Personal Identifiable Information (PII) or credentials**: Logging passwords, API tokens, credit card numbers, or personal user data violates regulatory compliance (GDPR, HIPAA, PCI-DSS). Always sanitize and mask payload data before logging.
- **Inconsistent timestamp formats**: Mixing local server time without timezone markers creates immense confusion during incident investigations across global clusters. Always log timestamps in UTC with ISO-8601 formatting (`YYYY-MM-DDTHH:MM:SSZ`).
