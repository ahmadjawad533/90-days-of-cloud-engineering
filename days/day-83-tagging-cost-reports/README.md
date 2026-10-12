# Day 83: Tagging Strategies and Cost Reports
[← Previous Day](../day-82-cost-optimization/README.md) | [Next Day →](../day-84-capstone-kickoff/README.md)

## Goal
Design and enforce an enterprise resource tagging standard across cloud infrastructure to attribute costs, manage lifecycles, and automate reporting.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [AWS Tagging Best Practices](https://docs.aws.amazon.com/whitepapers/latest/tagging-best-practices/welcome.html) — AWS whitepaper on governance, business architecture, automation, and cost allocation tags.
- 📖 [AWS Cost Allocation Tags Guide](https://docs.aws.amazon.com/cost-management/latest/userguide/cost-alloc-tags.html) — Guide on activating user-defined tags for granular billing breakdowns.

## Do
In this lab, you will define an enterprise tagging schema, write a Python script using `boto3` to audit untagged resources across your account, and apply standardized tags to infrastructure.

1. **Review the Standard Enterprise Tagging Schema**:
   Production environments require a minimal tag baseline on all resources:
   - `Environment`: `production` | `staging` | `development`
   - `Project`: `task-manager`
   - `Owner`: `devops-team@example.com`
   - `CostCenter`: `engineering-104`
   - `ManagedBy`: `terraform`

2. **Audit AWS resources using the Resource Groups Tagging API**:
   Query all resources in your region to inspect current tag adherence:
   ```bash
   aws resourcegroupstaggingapi get-resources \
     --resource-type-filters ec2:instance s3:bucket \
     --query "ResourceTagMappingList[*].{ARN:ResourceARN,Tags:Tags}" \
     --output json
   ```

3. **Build an automated Tagging Auditor script in Python**:
   Create a script `tag_auditor.py` to identify resources missing required tags:
   ```python
   import boto3

   REQUIRED_TAGS = {"Environment", "Project", "Owner", "ManagedBy"}

   def audit_resource_tags(region="us-east-1"):
       client = boto3.client("resourcegroupstaggingapi", region_name=region)
       paginator = client.get_paginator("get_resources")
       
       non_compliant = []
       print(f"[*] Auditing resources in {region} against required tags: {REQUIRED_TAGS}\n")

       for page in paginator.paginate():
           for item in page["ResourceTagMappingList"]:
               arn = item["ResourceARN"]
               existing_tags = {t["Key"] for t in item.get("Tags", [])}
               missing_tags = REQUIRED_TAGS - existing_tags

               if missing_tags:
                   non_compliant.append({
                       "arn": arn,
                       "missing": list(missing_tags),
                       "present": list(existing_tags)
                   })

       print(f"[!] Found {len(non_compliant)} non-compliant resource(s):")
       for item in non_compliant:
           print(f"  - Resource: {item['arn']}")
           print(f"    Missing Tags: {item['missing']}")

       return non_compliant

   if __name__ == "__main__":
       audit_resource_tags()
   ```

4. **Run the auditor script**:
   ```bash
   python3 tag_auditor.py
   ```

5. **Tag resources in bulk using the AWS CLI**:
   Create a sample S3 bucket or select an existing resource and apply the standardized tags:
   ```bash
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   TEST_BUCKET="audit-test-tagging-${ACCOUNT_ID}"
   aws s3api create-bucket --bucket "$TEST_BUCKET" --region us-east-1

   aws resourcegroupstaggingapi tag-resources \
     --resource-arn-list "arn:aws:s3:::${TEST_BUCKET}" \
     --tags Environment=development,Project=task-manager,Owner=platform-team,ManagedBy=terraform,CostCenter=eng-104
   ```

6. **Verify tags on the resource**:
   ```bash
   aws resourcegroupstaggingapi get-resources \
     --resource-arn-list "arn:aws:s3:::${TEST_BUCKET}" \
     --query "ResourceTagMappingList[0].Tags" \
     --output table
   ```

7. **Re-run the compliance audit**:
   ```bash
   python3 tag_auditor.py
   ```
   Notice that the newly tagged resource now satisfies compliance checks.

## Done When
- [ ] Enterprise tagging schema standard is reviewed and documented.
- [ ] Python script `tag_auditor.py` executes and scans account resources via `resourcegroupstaggingapi`.
- [ ] Test resource is created and tagged in bulk using `tag-resources`.
- [ ] Compliance verification confirms all required tags are present.

## Cost and Cleanup
Expected Cost: **$0.00** — AWS Resource Groups Tagging API calls and S3 tagging are free.

Clean up the test bucket and local script:
```bash
aws s3 rb "s3://$TEST_BUCKET" --force
rm -f tag_auditor.py
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Resource Tags (Key-Value) | Azure Resource Tags | Google Cloud Labels |
| AWS Cost Allocation Tags | Azure Cost Management Tag Filtering | Google Cloud Billing Labels |
| Resource Groups Tagging API | Azure Policy / Resource Graph Query | Google Cloud Asset Inventory / Resource Manager |
| AWS Service Catalog / SCP tag enforcement | Azure Policy `Require a tag on resources` | GCP Organization Policy Label Constraints |

- 📖 [Azure Tagging Documentation and Best Practices](https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/tag-resources)
- 📖 [Google Cloud Resource Labels Documentation](https://cloud.google.com/resource-manager/docs/creating-managing-labels)

## Stretch Goal
Write an IAM policy statement with a `Condition` key using `aws:RequestTag/Environment` that denies `ec2:RunInstances` or `s3:CreateBucket` unless the required `Environment` tag is explicitly provided in the creation request.

## Common Mistakes
- **Inconsistent casing in tag keys**: Tags are case-sensitive. `environment`, `Environment`, and `ENVIRONMENT` will appear as three separate categories in billing reports. Standardize on TitleCase or lowercase.
- **Forgetting to activate tags in AWS Cost Management**: Creating tags on AWS resources does *not* automatically generate billing reports by tag. You must explicitly activate user-defined tags as "Cost Allocation Tags" in the Billing console.
- **Putting sensitive information in tags**: Never store secrets, passwords, or personal user data (PII) in tag values because tags are visible in plain text across logs and billing exports.
