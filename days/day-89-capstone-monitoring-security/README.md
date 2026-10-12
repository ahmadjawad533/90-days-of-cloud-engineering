# Day 89: Capstone Monitoring and Security
[← Previous Day](../day-88-capstone-cicd/README.md) | [Next Day →](../day-90-capstone-docs-presentation/README.md)

## Goal
Implement full observability, CloudWatch alarms, structured logging, and security controls for the deployed Capstone Task Manager application.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Amazon CloudWatch Alarms Guide](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html) — AWS documentation on creating metric alarms and SNS notification topics.
- 📖 [AWS Security Best Practices for Containers](https://aws.amazon.com/blogs/containers/security-best-practices-for-amazon-ecs/) — Guide on task role isolation, read-only root filesystems, and VPC endpoints.

## Do
In today's milestone, you will add CloudWatch alarms, configure an SNS topic for high-severity alerts, implement structured JSON logging in the application, and audit IAM security boundaries for ECS tasks.

1. **Add CloudWatch Alarms & SNS Topic in Terraform**:
   Navigate to your capstone directory and create `terraform/monitoring.tf`:
   ```bash
   cd "$HOME/cloud-native-task-manager"
   cat <<'EOF' > terraform/monitoring.tf
   # SNS Topic for Alarms
   resource "aws_sns_topic" "alerts" {
     name = "${var.project_name}-alerts"
   }

   # CloudWatch Metric Alarm for High CPU Utilization
   resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
     alarm_name          = "${var.project_name}-ecs-high-cpu"
     comparison_operator = "GreaterThanOrEqualToThreshold"
     evaluation_periods  = 2
     metric_name         = "CPUUtilization"
     namespace           = "AWS/ECS"
     period              = 60
     statistic           = "Average"
     threshold           = 80
     alarm_description   = "Triggers when ECS cluster CPU exceeds 80% for 2 minutes"
     alarm_actions       = [aws_sns_topic.alerts.arn]

     dimensions = {
       ClusterName = aws_ecs_cluster.main.name
     }
   }

   # CloudWatch Metric Alarm for Container Memory Utilization
   resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
     alarm_name          = "${var.project_name}-ecs-high-memory"
     comparison_operator = "GreaterThanOrEqualToThreshold"
     evaluation_periods  = 2
     metric_name         = "MemoryUtilization"
     namespace           = "AWS/ECS"
     period              = 60
     statistic           = "Average"
     threshold           = 80
     alarm_description   = "Triggers when ECS cluster memory exceeds 80% for 2 minutes"
     alarm_actions       = [aws_sns_topic.alerts.arn]

     dimensions = {
       ClusterName = aws_ecs_cluster.main.name
     }
   }
   EOF
   ```

2. **Add Structured JSON Logging to the Flask Application**:
   Update `app/app.py` or inspect logging integration to ensure log messages are emitted as machine-readable JSON strings:
   ```bash
   cat <<'EOF' > app/logger.py
   import json
   import logging
   from datetime import datetime, timezone

   class JSONFormatter(logging.Formatter):
       def format(self, record):
           log_record = {
               "timestamp": datetime.now(timezone.utc).isoformat(),
               "level": record.levelname,
               "message": record.getMessage(),
               "module": record.module,
               "line": record.lineno
           }
           if hasattr(record, "props"):
               log_record.update(record.props)
           return json.dumps(log_record)

   def setup_logger():
       handler = logging.StreamHandler()
       handler.setFormatter(JSONFormatter())
       logger = logging.getLogger("taskmanager")
       logger.setLevel(logging.INFO)
       logger.addHandler(handler)
       return logger
   EOF
   ```

3. **Verify Least-Privilege IAM Roles for ECS Tasks**:
   Audit the difference between the **ECS Task Execution Role** and the **ECS Task Role**:
   - `Task Execution Role`: Used by AWS ECS agent to pull images from ECR and send logs to CloudWatch.
   - `Task Role`: Used by the containerized code itself (e.g. reading from S3 or Secrets Manager).
   Ensure the Task Role grants zero EC2 or VPC administrative privileges.

4. **Add Security Checklist to Documentation**:
   Create `docs/SECURITY.md` detailing your defense-in-depth posture:
   ```bash
   cat <<'EOF' > docs/SECURITY.md
   # Security Architecture & Controls

   ## 1. Network Boundary
   - Database and containers reside in private subnets with no public IPs.
   - Ingress to containers is allowed strictly from the ALB security group on port 5000.

   ## 2. Container Security
   - Non-root user (`appuser`, UID 1001) enforced in `Dockerfile`.
   - Multi-stage build strips development tools and test dependencies.
   - Automated Trivy vulnerability scans in CI block builds on CRITICAL CVEs.

   ## 3. Secrets & IAM
   - Database credentials and API keys stored in AWS Secrets Manager / Parameter Store.
   - IAM Task Execution Role scoped strictly to required ECR and CloudWatch log groups.
   - Zero static AWS access keys baked into container images or Git repos.
   EOF
   ```

5. **Commit Monitoring and Security Configurations**:
   ```bash
   git add terraform/monitoring.tf app/logger.py docs/SECURITY.md
   git commit -m "feat: cloudwatch alarms, structured logging, and security documentation"
   ```

## Done When
- [ ] Terraform definitions for CPU and Memory CloudWatch alarms and SNS topic are added.
- [ ] Structured JSON logging utility `app/logger.py` is created.
- [ ] Security architecture document `docs/SECURITY.md` is authored and committed.
- [ ] Separation between ECS Task Role and Task Execution Role is verified.

## Cost and Cleanup
Expected Cost: **$0.00** — Adding metric alarms in Terraform without applying them incurs no cost. If applied, CloudWatch alarms are within the 10 free alarm limit per account.

No teardown required today. Prepare for final presentation and documentation on Day 90.

## Stretch Goal
Create a CloudWatch Dashboard resource in Terraform (`aws_cloudwatch_dashboard`) displaying widgets for HTTP 2XX/4XX/5XX request counts, response latency, and average container CPU utilization.

## Common Mistakes
- **Confusing Task Execution Role with Task Role**: Giving application code the Task Execution Role grants it container management permissions it does not need. Keep them strictly separate.
- **Using unstructured string logging**: Plain text strings make automated log parsing and CloudWatch Metric Filters difficult. Use structured JSON logs.
- **Alert fatigue**: Setting CPU thresholds too low (e.g. 50%) or evaluation periods too short (e.g. 10 seconds) triggers false alarms during normal spikes. Use at least 2 consecutive periods.
