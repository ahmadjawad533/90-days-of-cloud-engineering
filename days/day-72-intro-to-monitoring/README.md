# Day 72: Introduction to Monitoring
[← Previous Day](../day-71-capstone-pipeline/README.md) | [Next Day →](../day-73-cloudwatch/README.md)

## Goal
Understand the core tenets of modern cloud observability: the Three Pillars (Metrics, Logs, and Traces), the Golden Signals, and how to measure Service Level Objectives (SLOs).

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [Google Site Reliability Engineering Book: Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/) — The foundational industry text defining the Four Golden Signals and alert philosophy.
- 📖 [Prometheus Overview Documentation](https://prometheus.io/docs/introduction/overview/) — Official architecture and operational model of metrics-based monitoring systems.

## Do
1. **Learn the Three Pillars of Observability**:
   - **Metrics**: Numeric values aggregated over time intervals (e.g., CPU utilization %, request count, memory bytes). High throughput, efficient storage, best for dashboards and alerting.
   - **Logs**: Timestamped structured or unstructured event records (e.g., `{"level":"error","msg":"DB timeout","user_id":42}`). Essential for post-mortem debugging and detailed root-cause analysis.
   - **Traces**: Request journey representation through distributed microservices. Each unit of work has a span ID tracking latency across network hops.

2. **Understand the Four Golden Signals (Google SRE)**:
   - **Latency**: The time it takes to service a request (distinguish between successful requests and error latencies).
   - **Traffic**: A measure of demand on the system (e.g., HTTP requests per second, I/O operations).
   - **Errors**: The rate of requests that fail (explicit 5xx errors or implicit wrong-payload responses).
   - **Saturation**: How "full" your service is (e.g., memory usage at 90%, thread pool queue size).

   ```
   ┌────────────────────────────────────────────────────────┐
   │                   FOUR GOLDEN SIGNALS                  │
   ├──────────────┬──────────────┬──────────────┬───────────┤
   │   Latency    │   Traffic    │    Errors    │Saturation │
   │  Time taken  │   Requests   │  Failed req  │ How full  │
   │  per request │  per second  │     rate     │  is CPU?  │
   └──────────────┴──────────────┴──────────────┴───────────┘
   ```

3. **Distinguish SLA vs. SLO vs. SLI**:
   - **SLI (Service Level Indicator)**: A carefully defined quantitative measure of some aspect of the level of service (e.g., proportion of successful requests over the last 30 days).
   - **SLO (Service Level Objective)**: A target value or range for an SLI specified by business requirements (e.g., 99.9% of requests must complete in <200ms).
   - **SLA (Service Level Agreement)**: An explicit or implicit contract with end users that includes consequences (e.g., financial refund) if an SLO is missed.

4. **Simulate metric collection and error rate calculation in Python**:
   Create a small script that tracks request counts, simulates errors, and calculates SLI availability:
   ```bash
   mkdir -p /tmp/observability-intro && cd /tmp/observability-intro

   cat << 'EOF' > golden_signals.py
   import random
   import time

   total_requests = 0
   error_requests = 0
   latencies = []

   print("Simulating 50 incoming requests to calculate Golden Signals...")
   for i in range(50):
       total_requests += 1
       # Simulate random latency between 20ms and 350ms
       lat = random.uniform(20.0, 350.0)
       latencies.append(lat)
       
       # Simulate 5% random failure rate
       if random.random() < 0.05 or lat > 300:
           error_requests += 1

   successful_requests = total_requests - error_requests
   availability_sli = (successful_requests / total_requests) * 100
   avg_latency = sum(latencies) / len(latencies)
   p95_latency = sorted(latencies)[int(len(latencies) * 0.95)]

   print("\n--- Observability Report ---")
   print(f"Total Traffic:       {total_requests} requests")
   print(f"Error Count:         {error_requests} errors")
   print(f"Availability SLI:    {availability_sli:.2f}% (Target SLO: 99.0%)")
   print(f"Average Latency:     {avg_latency:.2f} ms")
   print(f"P95 Latency:         {p95_latency:.2f} ms")

   if availability_sli >= 99.0:
       print("STATUS: Within SLO budget.")
   else:
       print("STATUS: SLO Breached! Error budget depleted.")
   EOF

   python3 golden_signals.py
   ```

## Done When
- [ ] You can describe the differences between Metrics, Logs, and Traces and when to use each.
- [ ] You know the Four Golden Signals: Latency, Traffic, Errors, and Saturation.
- [ ] You understand the hierarchy and definitions of SLI, SLO, and SLA.

## Cost and Cleanup
$0 — no cloud resources used.

Clean up simulation directory:
```bash
rm -rf /tmp/observability-intro
```

## Stretch Goal
Read about the USE method (Utilization, Saturation, and Errors) for analyzing resource performance versus the RED method (Rate, Errors, and Duration) for analyzing microservice request performance. Write down which method you would apply when diagnosing high CPU load vs. troubleshooting an HTTP API endpoint.

## Common Mistakes
- **Confusing monitoring with observability**: Monitoring tells you *when* a system is broken (e.g., threshold alarm); observability allows you to ask arbitrary questions to deduce *why* it is broken without deploying new code.
- **Alerting on symptoms instead of user impact**: Waking up an on-call engineer for 80% CPU usage when requests are fast and healthy causes alert fatigue. Alert on SLO-impacting metrics like elevated error rates or unacceptable latencies.
- **Average latency trap**: Averages hide outliers. A service with an average latency of 50ms can still have 5% of users experiencing 5-second timeouts. Always measure percentiles (p90, p95, p99).
