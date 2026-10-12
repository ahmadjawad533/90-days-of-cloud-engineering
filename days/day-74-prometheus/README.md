# Day 74: Introduction to Prometheus
[← Previous Day](../day-73-cloudwatch/README.md) | [Next Day →](../day-75-grafana/README.md)

## Goal
Deploy a local Prometheus server with Docker Compose, scrape host metrics using Node Exporter, and master core PromQL queries to inspect system telemetry.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Prometheus Documentation: Getting Started](https://prometheus.io/docs/prometheus/latest/getting_started/) — Official tutorial on Prometheus server configuration, scrape loops, and expression browser.
- 📖 [Prometheus Documentation: Querying Basics (PromQL)](https://prometheus.io/docs/prometheus/latest/querying/basics/) — Official reference for Prometheus Query Language, instant vectors, range vectors, and functions like `rate()`.

## Do
In this lab, you will use the reference files located at [`labs/monitoring/docker-compose.yml`](../../labs/monitoring/docker-compose.yml) and [`labs/monitoring/prometheus.yml`](../../labs/monitoring/prometheus.yml).

1. **Understand Prometheus Core Concepts**:
   - **Pull-based Architecture**: Unlike traditional push systems, Prometheus scrapes HTTP metrics endpoints (e.g., `http://target:9100/metrics`) at periodic intervals (`scrape_interval: 15s`).
   - **Metric Types**:
     - **Counter**: Cumulative value that only goes up (or resets to 0 on restart), e.g., `http_requests_total`. Always use with `rate()` or `increase()`.
     - **Gauge**: Numeric value that can arbitrarily go up or down, e.g., `node_memory_MemAvailable_bytes`, `temperature_celsius`.
     - **Histogram**: Samples observations into configurable buckets and counts occurrences, e.g., `http_request_duration_seconds_bucket`.
     - **Summary**: Similar to histogram with client-side calculated quantiles.
   - **Labels / Dimensionality**: Key-value pairs identifying dimensions (e.g., `http_requests_total{method="POST", handler="/tasks", status="200"}`).

2. **Inspect the Prometheus configuration file**:
   Check [`labs/monitoring/prometheus.yml`](../../labs/monitoring/prometheus.yml):
   ```yaml
   global:
     scrape_interval: 15s
     evaluation_interval: 15s

   scrape_configs:
     - job_name: "prometheus"
       static_configs:
         - targets: ["localhost:9090"]

     - job_name: "node_exporter"
       static_configs:
         - targets: ["node-exporter:9100"]
   ```

3. **Start the Prometheus and Node Exporter stack**:
   Run the stack from the `labs/monitoring` directory:
   ```bash
   cd "/home/jawad/90 Days of Cloud Engineering/labs/monitoring"
   docker compose up -d prometheus node-exporter
   ```

4. **Verify container health and scrape targets**:
   ```bash
   docker compose ps
   # Query Prometheus targets API to confirm both scrape jobs are UP
   sleep 3
   curl -s http://localhost:9090/api/v1/targets | grep -o '"health":"[^"]*"'
   ```

5. **Execute essential PromQL queries**:
   Use `curl` or open your browser to `http://localhost:9090` to execute queries in the Prometheus expression browser:
   - Check target uptime:
     ```bash
     curl -s -G --data-urlencode 'query=up' http://localhost:9090/api/v1/query | grep -o '"result":\[.*\]'
     ```
   - Calculate CPU idle percentage over a 1-minute window:
     ```promql
     100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)
     ```
   - Calculate available memory in Megabytes:
     ```promql
     node_memory_MemAvailable_bytes / 1024 / 1024
     ```
   - Calculate network receive bytes per second:
     ```promql
     rate(node_network_receive_bytes_total[1m])
     ```

## Done When
- [ ] You have launched Prometheus and Node Exporter via Docker Compose.
- [ ] You verified both scrape targets are reporting `health: "up"`.
- [ ] You executed PromQL queries calculating CPU usage percentage and available memory.

## Cost and Cleanup
$0 — runs entirely locally inside Docker containers.

To stop the running containers:
```bash
cd "/home/jawad/90 Days of Cloud Engineering/labs/monitoring"
docker compose stop prometheus node-exporter
```

## Stretch Goal
Instrument a simple Python application using the official `prometheus_client` library. Expose a `/metrics` endpoint on port `8000`, add your Python app as a new scrape target in `prometheus.yml`, and query your custom counter metric in Prometheus.

## Common Mistakes
- **Applying `rate()` directly to a Gauge**: The `rate()` function is specifically designed to calculate per-second increases on monotonic **Counters** and handles process resets. Using `rate()` on Gauges (like memory or temperature) produces meaningless or erroneous spikes.
- **High Cardinality explosion**: Storing unbounded strings (like user IDs, email addresses, or arbitrary request UUIDs) as label values causes combinatorial state explosions that consume massive RAM on the Prometheus server. Only use bounded dimensions (HTTP method, HTTP status code, service name) as labels.
- **Forgetting that Prometheus pulls metrics**: If firewall rules or network ACLs block incoming connections from the Prometheus server to the client host port `9100`, Prometheus will report the target as `DOWN`.
