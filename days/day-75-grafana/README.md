# Day 75: Grafana Dashboards
[← Previous Day](../day-74-prometheus/README.md) | [Next Day →](../day-76-log-management/README.md)

## Goal
Connect Grafana to a Prometheus data source, design an observability dashboard with time-series panels, and import community dashboards for production Linux monitoring.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Grafana Documentation: Getting Started with Grafana](https://grafana.com/docs/grafana/latest/getting-started/) — Official guide on navigating Grafana, configuring datasources, and constructing visualization panels.
- 📖 [Grafana Documentation: Prometheus data source](https://grafana.com/docs/grafana/latest/datasources/prometheus/) — Query editor options, exemplar correlation, and variable templating for Prometheus.

## Do
In this lab, you will use the full Docker Compose monitoring stack located at [`labs/monitoring/docker-compose.yml`](../../labs/monitoring/docker-compose.yml).

1. **Launch the complete monitoring stack**:
   Start Prometheus, Node Exporter, and Grafana:
   ```bash
   cd "/home/jawad/90 Days of Cloud Engineering/labs/monitoring"
   docker compose up -d
   docker compose ps
   ```

2. **Access Grafana and log in**:
   - URL: `http://localhost:3000`
   - Default Username: `admin`
   - Default Password: `admin` (or configured via environment variables)

3. **Configure Prometheus as the default Data Source**:
   Because Grafana and Prometheus run on the same Docker network bridge defined in `docker-compose.yml`, Grafana reaches Prometheus using its container name:
   - Data Source Type: **Prometheus**
   - Prometheus server URL: `http://prometheus:9090`
   - Click **Save & test** to verify the connection.

   You can also configure this automatically via curl using the Grafana HTTP API:
   ```bash
   curl -s -X POST -H "Content-Type: application/json" -u admin:admin \
     http://localhost:3000/api/datasources \
     -d '{
       "name": "Prometheus",
       "type": "prometheus",
       "url": "http://prometheus:9090",
       "access": "proxy",
       "isDefault": true
     }'
   echo "Prometheus data source configured in Grafana."
   ```

4. **Create a custom visualization dashboard**:
   Build panels monitoring the Golden Signals:
   - **Panel 1: CPU Utilization % (Time Series)**:
     - Query: `100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)`
     - Unit: `Percent (0-100)`
   - **Panel 2: Available Memory (Stat / Gauge)**:
     - Query: `node_memory_MemAvailable_bytes`
     - Unit: `Data (IEC) -> bytes`
   - **Panel 3: Disk Space Used % (Bar Gauge)**:
     - Query: `100 - ((node_filesystem_avail_bytes{mountpoint="/"} * 100) / node_filesystem_size_bytes{mountpoint="/"})`
     - Thresholds: Green (< 70%), Yellow (70-85%), Red (> 85%)

5. **Import standard community dashboard (Node Exporter Full - ID 1860)**:
   In Grafana UI:
   - Go to **Dashboards** -> **New** -> **Import**.
   - Enter Dashboard ID `1860` (or `12486`) and click **Load**.
   - Select the `Prometheus` data source and click **Import**.
   - Observe immediate visibility into system load, network throughput, memory buffers, and disk I/O.

## Done When
- [ ] You have launched Grafana alongside Prometheus and Node Exporter via Docker Compose.
- [ ] You authenticated to Grafana and connected the Prometheus data source at `http://prometheus:9090`.
- [ ] You constructed a dashboard with time-series and stat panels displaying CPU and memory metrics.

## Cost and Cleanup
$0 — all containers run locally with no cloud infrastructure dependencies.

To stop and remove containers and networks:
```bash
cd "/home/jawad/90 Days of Cloud Engineering/labs/monitoring"
docker compose down
```
If you wish to wipe persisted dashboard data volumes:
```bash
docker compose down -v
```

## Stretch Goal
Create dashboard template variables (`$instance` and `$interval`): Learn how Grafana variables enable a single dashboard to dynamically switch between multiple servers or adjust scrape calculation windows without modifying individual panel queries.

## Common Mistakes
- **Using `localhost:9090` instead of `http://prometheus:9090` inside Docker**: When Grafana runs in a Docker container, `localhost` refers to the container itself, not your host machine. Use the Docker service name `http://prometheus:9090`.
- **Failing to configure panel units**: Displaying raw bytes without selecting the `Data (IEC) -> bytes` unit produces unreadable numbers like `16472819200` instead of `15.3 GiB`.
- **Setting scrape intervals faster than panel refresh windows**: Refreshing a dashboard every 5 seconds when Prometheus only scrapes every 15 seconds causes unnecessary query load on the server without showing newer data.
