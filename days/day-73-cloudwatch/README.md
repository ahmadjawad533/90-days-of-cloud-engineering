# Day 73: AWS CloudWatch Deep Dive
[← Previous Day](../day-72-intro-to-monitoring/README.md) | [Next Day →](../day-74-prometheus/README.md)

## Goal
Master Amazon CloudWatch by creating custom metrics, querying log groups with CloudWatch Logs Insights, and configuring CloudWatch Alarms with SNS notifications using the AWS CLI.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Amazon CloudWatch Documentation: What is Amazon CloudWatch?](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/) — AWS documentation on metrics, logs, dashboards, and automated alarms.
- 📖 [Amazon CloudWatch Logs: Analyzing Log Data with CloudWatch Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html) — Query syntax, aggregation functions, and real-time log exploration.

## Do
1. **Understand Amazon CloudWatch Architecture**:
   - **Metrics & Namespaces**: AWS services emit standard metrics (e.g., `AWS/EC2`, `AWS/RDS`) every 5 minutes (standard, free) or 1 minute (detailed). Custom metrics allow publishing application-specific telemetry under your own namespace.
   - **Logs**: Log Events are collected into Log Streams, grouped by Log Groups with configurable retention periods.
   - **Alarms**: Watch metric thresholds over evaluation periods (e.g., CPU > 80% for 2 consecutive 5-minute periods) and transition states (`OK`, `ALARM`, `INSUFFICIENT_DATA`), triggering Amazon SNS notifications or auto-scaling actions.

2. **Publish custom application metrics using AWS CLI**:
   Send custom business metrics to CloudWatch under the namespace `CloudNativeApp`:
   ```bash
   REGION="us-east-1"

   aws cloudwatch put-metric-data \
     --region "${REGION}" \
     --namespace "CloudNativeApp" \
     --metric-data \
       MetricName=ActiveUsers,Value=142,Unit=Count \
       MetricName=OrderProcessingTime,Value=48.5,Unit=Milliseconds
   echo "Custom metrics published."
   ```

3. **Create a CloudWatch Log Group and send structured log events**:
   ```bash
   LOG_GROUP="/aws/apps/task-manager-dev"
   LOG_STREAM="instance-app-01"

   aws logs create-log-group --region "${REGION}" --log-group-name "${LOG_GROUP}"
   aws logs put-retention-policy --region "${REGION}" --log-group-name "${LOG_GROUP}" --retention-in-days 7
   aws logs create-log-stream --region "${REGION}" --log-group-name "${LOG_GROUP}" --log-stream-name "${LOG_STREAM}"

   # Send sample timestamped log events
   TIMESTAMP=$(date +%s%03d)
   aws logs put-log-events \
     --region "${REGION}" \
     --log-group-name "${LOG_GROUP}" \
     --log-stream-name "${LOG_STREAM}" \
     --log-events \
       timestamp=${TIMESTAMP},message='{"level":"INFO","route":"/api/v1/tasks","status":200,"duration_ms":18}' \
       timestamp=${TIMESTAMP},message='{"level":"WARN","route":"/api/v1/tasks","status":429,"duration_ms":5,"client_ip":"192.0.2.1"}' \
       timestamp=${TIMESTAMP},message='{"level":"ERROR","route":"/api/v1/tasks/99","status":500,"duration_ms":120,"error":"DB timeout"}'
   echo "Logs sent to CloudWatch."
   ```

4. **Query logs with CloudWatch Logs Insights**:
   Run an analytical query filtering for errors and high-latency requests:
   ```bash
   QUERY_ID=$(aws logs start-query \
     --region "${REGION}" \
     --log-group-name "${LOG_GROUP}" \
     --start-time $(($(date +%s) - 3600)) \
     --end-time $(date +%s) \
     --query-string 'fields @timestamp, status, duration_ms, error | filter status >= 400 | sort duration_ms desc | limit 20' \
     --query "queryId" \
     --output text)

   sleep 3
   aws logs get-query-results --region "${REGION}" --query-id "${QUERY_ID}"
   ```

5. **Configure an SNS Topic and a CloudWatch Alarm**:
   ```bash
   # Create SNS topic for alarm notifications
   TOPIC_ARN=$(aws sns create-topic --region "${REGION}" --name "task-manager-alerts" --query "TopicArn" --output text)

   # Create high error alarm
   aws cloudwatch put-metric-alarm \
     --region "${REGION}" \
     --alarm-name "HighErrorRateAlarm" \
     --alarm-description "Triggers if error count exceeds 5 in a 5-minute period" \
     --metric-name "ActiveUsers" \
     --namespace "CloudNativeApp" \
     --statistic "Average" \
     --period 300 \
     --evaluation-periods 1 \
     --threshold 150 \
     --comparison-operator "GreaterThanOrEqualToThreshold" \
     --alarm-actions "${TOPIC_ARN}"

   echo "Alarm created: HighErrorRateAlarm"
   ```

6. **Inspect the alarm state**:
   ```bash
   aws cloudwatch describe-alarms --region "${REGION}" --alarm-names "HighErrorRateAlarm" --query "MetricAlarms[*].[AlarmName,StateValue,Threshold]"
   ```

## Done When
- [ ] You published custom metric data points using `aws cloudwatch put-metric-data`.
- [ ] You created a log group, configured a 7-day retention policy, and queried logs with CloudWatch Logs Insights.
- [ ] You created a CloudWatch Metric Alarm associated with an SNS topic.

## Cost and Cleanup
AWS Free Tier includes 10 custom metrics, 5GB of log ingestion/storage, and 10 alarm metrics free per month.
Clean up the created test resources immediately:
```bash
REGION="us-east-1"
aws cloudwatch delete-alarms --region "${REGION}" --alarm-names "HighErrorRateAlarm"
aws sns delete-topic --region "${REGION}" --topic-arn "${TOPIC_ARN}"
aws logs delete-log-group --region "${REGION}" --log-group-name "/aws/apps/task-manager-dev"
echo "CloudWatch resources deleted."
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Amazon CloudWatch Metrics | Azure Monitor Metrics | Google Cloud Monitoring Metrics |
| Amazon CloudWatch Logs | Azure Log Analytics / Azure Monitor Logs | Google Cloud Logging |
| CloudWatch Logs Insights | Kusto Query Language (KQL) | Cloud Logging Logs Explorer |
| CloudWatch Alarms + SNS | Azure Monitor Alerts + Action Groups | Cloud Monitoring Alerting Policies + Cloud Pub/Sub |

- 📖 [Azure Monitor Overview](https://learn.microsoft.com/en-us/azure/azure-monitor/)
- 📖 [Google Cloud Monitoring Overview](https://cloud.google.com/monitoring/docs)

## Stretch Goal
Create a metric filter on your log group: use `aws logs put-metric-filter` to automatically parse JSON log messages and increment a custom metric count whenever `status >= 500` appears in application logs.

## Common Mistakes
- **Never configuring Log Group retention policies**: By default, CloudWatch Log Groups are set to "Never Expire". Over months and years, forgotten log groups accumulate terabytes of debug logs, resulting in unexpected storage costs.
- **Using 1-second/detailed monitoring when standard 5-minute is sufficient**: Detailed monitoring on EC2 instances incurs an extra fee per instance metric.
- **Missing SNS topic permissions or unconfirmed subscriptions**: If email or SMS subscribers do not confirm the SNS subscription email, alarm notifications are never received.
