# Day 82: Cloud Cost Optimization
[← Previous Day](../day-81-container-scanning/README.md) | [Next Day →](../day-83-tagging-cost-reports/README.md)

## Goal
Implement proactive cloud cost governance by configuring AWS Budgets, analyzing spending anomalies with Cost Explorer, and identifying idle infrastructure.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [AWS Cost Management Documentation](https://docs.aws.amazon.com/cost-management/latest/userguide/) — Official guide for AWS Budgets, Cost Explorer, and cost allocation tags.
- 📖 [AWS Well-Architected Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html) — Framework best practices for expenditure awareness, rightsizing, and elasticity.

## Do
In this lab, you will configure an AWS zero-dollar / low-threshold budget alert via the AWS CLI, discover unused EBS volumes and dangling elastic IPs, and query historical billing metrics.

1. **Verify AWS Cost Explorer and Budgets CLI access**:
   ```bash
   aws sts get-caller-identity
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   ```

2. **Create an AWS Monthly Budget Alert**:
   Create a notification policy that sends an alert to your email if your monthly AWS spend exceeds $5.00:
   ```bash
   YOUR_EMAIL="your-email@example.com"  # Replace with your actual email address

   cat <<EOF > budget.json
   {
     "BudgetName": "Monthly-Account-Guardrail-Budget",
     "BudgetLimit": {
       "Amount": "5.0",
       "Unit": "USD"
     },
     "CostFilters": {},
     "CostTypes": {
       "IncludeTax": true,
       "IncludeSubscription": true,
       "UseBlended": false,
       "IncludeRefund": false,
       "IncludeCredit": false,
       "IncludeUpfront": true,
       "IncludeRecurring": true,
       "IncludeOtherSubscription": true,
       "IncludeSupport": true,
       "IncludeDiscount": true,
       "UseAmortized": false
     },
     "TimeUnit": "MONTHLY",
     "BudgetType": "COST"
   }
   EOF

   cat <<EOF > notifications-with-subscribers.json
   [
     {
       "Notification": {
         "NotificationType": "ACTUAL",
         "ComparisonOperator": "GREATER_THAN",
         "Threshold": 80.0,
         "ThresholdType": "PERCENTAGE"
       },
       "Subscribers": [
         {
           "SubscriptionType": "EMAIL",
           "Address": "${YOUR_EMAIL}"
         }
       ]
     }
   ]
   EOF

   aws budgets create-budget \
     --account-id "$ACCOUNT_ID" \
     --budget file://budget.json \
     --notifications-with-subscribers file://notifications-with-subscribers.json
   ```

3. **Inspect Active Budgets**:
   ```bash
   aws budgets describe-budgets --account-id "$ACCOUNT_ID"
   ```

4. **Audit for common cost waste — Unattached EBS Volumes**:
   Orphaned EBS volumes continue billing storage fees even after their EC2 instances are terminated:
   ```bash
   aws ec2 describe-volumes \
     --filters Name=status,Values=available \
     --query "Volumes[*].{ID:VolumeId,Size:Size,Type:VolumeType,Created:CreateTime}" \
     --output table
   ```

5. **Audit for unassociated Elastic IP addresses (EIPs)**:
   AWS bills for unassociated Elastic IPs that sit idle in your account:
   ```bash
   aws ec2 describe-addresses \
     --query "Addresses[?AssociationId==null].{IP:PublicIp,AllocationId:AllocationId}" \
     --output table
   ```

6. **Query Cost Explorer for Current Month Spend by Service**:
   Run a summary query of your account's unblended costs for the current calendar month:
   ```bash
   START_DATE=$(date -d "first day of this month" +%Y-%m-%d 2>/dev/null || date -v1d +%Y-%m-%d)
   END_DATE=$(date +%Y-%m-%d)

   if [ "$START_DATE" != "$END_DATE" ]; then
     aws ce get-cost-and-usage \
       --time-period Start=${START_DATE},End=${END_DATE} \
       --granularity MONTHLY \
       --metrics "UnblendedCost" \
       --group-by Type=DIMENSION,Key=SERVICE \
       --query "ResultsByTime[*].Groups[*].{Service:Keys[0],Cost:Metrics.UnblendedCost.Amount}" \
       --output table || echo "Note: Cost Explorer API may take 24 hours to populate on fresh accounts."
   fi
   ```

## Done When
- [ ] AWS Budget `Monthly-Account-Guardrail-Budget` is configured and visible via `aws budgets describe-budgets`.
- [ ] Email notification threshold is set.
- [ ] Unattached EBS volume discovery command is executed and understood.
- [ ] Idle Elastic IP search command is executed and understood.

## Cost and Cleanup
Expected Cost: **$0.00** — The first two action budgets created in AWS Budgets are completely free of charge. Queries against describe commands are free.

Clean up the budget if you do not want to keep it:
```bash
aws budgets delete-budget \
  --account-id "$ACCOUNT_ID" \
  --budget-name "Monthly-Account-Guardrail-Budget"

rm -f budget.json notifications-with-subscribers.json
```
*(Tip: Keeping a $5 or $10 monthly budget active on your personal AWS account is an industry best practice to prevent unexpected bills).*

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| AWS Budgets | Azure Cost Management Budgets | Google Cloud Billing Budgets |
| AWS Cost Explorer | Azure Cost Analysis | Google Cloud Cost Table Reports |
| AWS Cost Anomaly Detection | Azure Cost Anomaly Alerts | GCP Cloud Billing Anomaly Detection |
| Unattached EBS / EIP cleanup | Unattached Managed Disk / Public IP audit | Idle Persistent Disk / Static External IP cleanup |

- 📖 [Azure Cost Management and Billing Documentation](https://learn.microsoft.com/en-us/azure/cost-management-billing/)
- 📖 [Google Cloud Cost Management Documentation](https://cloud.google.com/cost-management/docs)

## Stretch Goal
Enable AWS Cost Anomaly Detection using `aws ce create-anomaly-monitor` and `aws ce create-anomaly-subscription` to receive automatic ML-driven notifications whenever a service spikes unexpectedly outside of baseline behavior.

## Common Mistakes
- **Forgetting that terminating an EC2 instance does not automatically delete separate EBS volumes**: Ensure `DeleteOnTermination` is set to `true` on non-root volumes, or regularly audit available volumes.
- **Holding unused Elastic IP addresses**: Cloud providers charge an hourly fee for allocated IP addresses that are not attached to running instances.
- **Ignoring NAT Gateway charges**: In high-throughput architectures, data processed through NAT Gateways ($0.045/GB + $0.045/hr) can exceed the cost of the application instances themselves. Use VPC Endpoints where appropriate.
