# Day 77: Building Alerts and Incident Response
[← Previous Day](../day-76-log-management/README.md) | [Next Day →](../day-78-cloud-security-fundamentals/README.md)

## Goal
Design actionable alert rules, define severity escalation matrices, prevent alert fatigue, and practice an incident response triage runbook.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Google Site Reliability Engineering: Being On-Call](https://sre.google/sre-book/being-on-call/) — Essential principles for sustainable on-call rotations, runbooks, and psychological safety.
- 📖 [Prometheus Documentation: Alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/) — How to write declarative Prometheus alert rules and configure Alertmanager routing.

## Do
1. **Understand Alerting Philosophy & Avoiding Alert Fatigue**:
   - **The Problem with Alert Fatigue**: When engineers receive dozens of non-actionable, flaky, or low-urgency notifications daily, they instinctively silence or ignore alerts. When a genuine outage strikes, it goes unnoticed.
   - **The Golden Rule of Paging**: Every alert that pages an on-call engineer in the middle of the night MUST require urgent, human intervention to prevent or resolve severe user-facing downtime. If a problem can wait until morning business hours, it should be a ticket or email, never a page.
   - **Severity Levels**:
     - **P1 / Critical (Page)**: Complete service outage or severe data loss affecting majority of users. Response SLA: < 15 minutes.
     - **P2 / High (Page during working hours)**: Degraded functionality, redundancy lost (e.g., secondary DB replica down), or high error rates on non-critical endpoints. Response SLA: < 1 hour.
     - **P3 / Medium (Ticket)**: Minor bugs, non-urgent capacity warning (e.g., disk at 75%). Addressed during standard sprint backlog.
     - **P4 / Low (Informational)**: Automated routine notices or metric deviations that require no immediate action.

2. **Structure an Actionable Alert**:
   Every alert rule must include actionable context and a direct link to a runbook:
   ```yaml
   groups:
     - name: production-alerts
       rules:
         - alert: HighErrorRate5xx
           expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100 > 5
           for: 2m
           labels:
             severity: critical
           annotations:
             summary: "High 5xx HTTP Error Rate on {{ $labels.service }}"
             description: "Error rate is {{ $value | printf \"%.2f\" }}% over the last 5 minutes."
             runbook_url: "https://wiki.internal/ops/runbooks/high-error-rate"
   ```

3. **Write an Incident Response Runbook**:
   Create a standard operating procedure (SOP) runbook for your web service:
   ```bash
   mkdir -p /tmp/incident-response && cd /tmp/incident-response

   cat << 'EOF' > RUNBOOK_5XX_OUTAGE.md
   # Runbook: High 5xx HTTP Error Rate

   ## Severity: P1 / Critical
   ## Symptoms:
   - CloudWatch Alarm / Prometheus alert `HighErrorRate5xx` firing.
   - Users seeing 502 Bad Gateway or 500 Internal Server Error.

   ## Immediate Triage Steps (First 5 Minutes):
   1. **Verify user impact**:
      Check status page and run health check probe:
      `curl -I https://api.example.com/health`
   2. **Inspect recent deployments**:
      Check GitHub Actions CD workflow to see if a release was completed within the last 15 minutes.
      If a bad release occurred:
      `aws ecs update-service --cluster task-cluster --service task-service --task-definition task-service:PREVIOUS_REVISION`
   3. **Check database connectivity and CPU saturation**:
      `aws rds describe-db-instances --query "DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus]"`
   4. **Inspect real-time container application logs**:
      `aws logs tail /aws/ecs/task-manager --since 10m --filter-pattern "ERROR"`
   5. **Escalation**:
      If cause is not identified within 15 minutes, notify Incident Commander and page Database On-Call.
   EOF
   cat RUNBOOK_5XX_OUTAGE.md
   ```

4. **Practice a Blameless Post-Mortem (Post-Incident Review)**:
   A blameless post-mortem focuses on systemic improvements rather than human error. Examine the key sections of an incident report:
   ```bash
   cat << 'EOF' > post_mortem_template.md
   # Post-Mortem: Incident INC-2026-10-01

   ## Incident Summary
   - **Date**: October 1, 2026
   - **Duration**: 24 minutes (14:12 UTC - 14:36 UTC)
   - **Impact**: 14% of API requests returned 500 errors during database pool exhaustion.
   - **Lead Investigator**: Cloud On-Call Engineer

   ## Timeline (UTC)
   - 14:12 - Deployment #142 promoted to production via GitHub Actions.
   - 14:15 - CloudWatch Alarm `HighErrorRate5xx` triggered PagerDuty incident.
   - 14:18 - On-call engineer acknowledged page and opened triage war room.
   - 14:24 - Root cause identified: DB connection timeout parameter set to 1s instead of 30s.
   - 14:30 - Rollback to deployment #141 initiated.
   - 14:36 - Error rate returned to 0.01%. Incident marked resolved.

   ## Root Cause Analysis (5 Whys)
   Why did requests fail? Database connection timed out.
   Why? Connection pool timeout was reduced in configuration.
   Why? Configuration change was untested against slow queries.

   ## Corrective Action Items
   - [ ] Add integration test verifying connection timeout defaults (Owner: DevOps).
   - [ ] Implement canary release with 10% traffic routing before full rollout (Owner: Infra).
   - [ ] Add CloudWatch alert for RDS Active Connections approaching max pool (Owner: SRE).
   EOF
   cat post_mortem_template.md
   ```

## Done When
- [ ] You can define the criteria for what warrants a P1 page versus a P3 backlog ticket.
- [ ] You understand how `for: 2m` duration windows in Prometheus prevent alerts from firing on momentary transient spikes.
- [ ] You wrote a triage runbook and understand the core structure of a blameless post-mortem.

## Cost and Cleanup
$0 — no cloud resources used.

Clean up local files:
```bash
rm -rf /tmp/incident-response
```

## Stretch Goal
Learn how PagerDuty, Opsgenie, or Alertmanager manage on-call schedules, escalation policies (e.g., escalating to secondary engineer if primary does not acknowledge within 10 minutes), and alert deduplication/grouping.

## Common Mistakes
- **Alerting without an associated runbook**: Alerting an engineer in the middle of the night without documenting the initial diagnostic commands or remediation options dramatically increases Mean Time to Recovery (MTTR).
- **Setting thresholds too sensitive without duration filters**: Triggering an alarm the instant CPU spikes to 81% for 3 seconds generates dozens of false alarms during routine garbage collection or process starts. Always require the threshold to persist (e.g., `for: 5m` or 2 consecutive periods).
- **Conducting punitive instead of blameless post-mortems**: Blaming individuals causes engineers to hide mistakes or avoid taking calculated architectural risks. Systems should be resilient to single-human errors.
