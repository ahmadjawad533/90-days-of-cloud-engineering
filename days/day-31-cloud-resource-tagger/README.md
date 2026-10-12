# Day 31: Build a Cloud Resource Tagger

[← Previous Day](../day-30-boto3-ec2-s3/README.md) | [Next Day →](../day-32-aws-iam/README.md)

## Goal
Build an automated Python utility using Boto3 to discover untagged AWS EC2 instances and S3 buckets, enforce mandatory governance tags, and generate an audit report.

## Time
⏱️ Approximately 110 minutes

## Learn
- 📖 [Boto3 Documentation — EC2 Service Reference](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/ec2.html) — Reference guide for `describe_instances` and `create_tags`.
- 📖 [Boto3 Documentation — S3 Service Reference](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html) — Reference guide for `list_buckets`, `get_bucket_tagging`, and `put_bucket_tagging`.
- 📖 [AWS Tagging Best Practices](https://docs.aws.amazon.com/whitepapers/latest/tagging-best-practices/tagging-best-practices.html) — Architectural whitepaper on tag governance, cost allocation tags, and automation.

## Do
In production environments, untagged cloud resources lead to "cloud sprawl," untracked expenses, and failed compliance audits. Enterprise cloud engineers build automated compliance scripts that enforce organizational standards (e.g. `Environment`, `Owner`, `Project`, `CostCenter`).

Today, you will build and test a production-ready `resource_tagger.py` utility.

1. **Set up project directory and virtual environment**
   ```bash
   mkdir -p ~/cloud-python/day-31
   cd ~/cloud-python/day-31
   python3 -m venv .venv
   source .venv/bin/activate
   pip install boto3
   ```

2. **Inspect the reference script**
   A complete reference implementation is available in this repository at [`labs/python/resource_tagger.py`](../../labs/python/resource_tagger.py).
   Copy the script into your workspace or open it for reference:
   ```bash
   cp "/home/jawad/90 Days of Cloud Engineering/labs/python/resource_tagger.py" ./resource_tagger.py
   ```

3. **Examine key design features of the tagger script**
   - **Pagination**: Uses `get_paginator("describe_instances")` so it never truncates large fleets of EC2 instances.
   - **Non-destructive S3 tagging**: `put_bucket_tagging` overwrites all existing tags on an S3 bucket by default. The script reads existing tags first with `get_bucket_tagging`, merges mandatory tags into the existing dictionary, and then writes back the merged set.
   - **Dry Run Support**: Accepts a `--dry-run` flag to preview proposed modifications safely before changing production infrastructure.
   - **Error Handling**: Gracefully handles `NoSuchTagSet` (which AWS raises when an S3 bucket has zero tags) without crashing.
   - **Structured Reporting**: Outputs a formatted table showing every resource and its compliance status.

4. **Run the script in Dry-Run mode**
   Execute with `--dry-run` to discover resources and preview tag changes:
   ```bash
   python resource_tagger.py --dry-run
   ```
   You will see an output table showing each active instance or bucket and whether tags would be applied.

5. **Create a temporary test S3 bucket to verify live tagging**
   ```bash
   TEST_BUCKET="tagger-lab-$(date +%s)"
   aws s3 mb "s3://${TEST_BUCKET}"
   ```

6. **Run live tagging against your AWS account**
   Run without `--dry-run`:
   ```bash
   python resource_tagger.py
   ```

7. **Verify tags using the AWS CLI**
   Check that the mandatory tags were applied to the test bucket:
   ```bash
   aws s3api get-bucket-tagging --bucket "${TEST_BUCKET}"
   ```
   You should see:
   ```json
   {
       "TagSet": [
           {"Key": "Environment", "Value": "Development"},
           {"Key": "ManagedBy", "Value": "Python-Boto3"},
           {"Key": "Project", "Value": "90-Days-Cloud-Engineering"},
           {"Key": "CostCenter", "Value": "CC-1042"}
       ]
   }
   ```

8. **Rerun the tagger to test idempotency**
   A well-written automation script is idempotent (running it again changes nothing if resources are already compliant):
   ```bash
   python resource_tagger.py
   ```
   The report will display `ALREADY_COMPLIANT` for the tagged bucket.

9. **Delete the test bucket**
   ```bash
   aws s3 rb "s3://${TEST_BUCKET}"
   ```

## Done When
- [ ] You reviewed the [`labs/python/resource_tagger.py`](../../labs/python/resource_tagger.py) source code and understood how both EC2 and S3 APIs handle tagging.
- [ ] You ran the script with `--dry-run` and verified the preview table without modifying tags.
- [ ] You created a test bucket, ran live tagging, and confirmed tags via `aws s3api get-bucket-tagging`.
- [ ] You verified idempotency: rerunning the script reported `ALREADY_COMPLIANT`.
- [ ] You deleted the test S3 bucket so no orphaned resources remain.

## Cost and Cleanup
Expected Cost: **$0.00**
- API calls (`describe_instances`, `create_tags`, `list_buckets`, `get_bucket_tagging`, `put_bucket_tagging`) are free or within free-tier API quotas.
- Remember to remove the temporary test bucket:
  ```bash
  aws s3 rb "s3://${TEST_BUCKET}" 2>/dev/null || true
  ```
- Local cleanup:
  ```bash
  deactivate 2>/dev/null || true
  rm -rf ~/cloud-python/day-31
  ```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Resource Tags (`create_tags`, `put_bucket_tagging`) | Azure Resource Tags (`ResourceManagementClient.tags`) | GCP Resource Labels (`google-cloud-resourcemanager`) |
| AWS Boto3 SDK | Azure SDK for Python (`azure-mgmt-resource`) | Google Cloud Python Client (`google.cloud`) |
- 📘 Azure Resource Tagging: [Azure Resources and Resource Groups Python SDK](https://learn.microsoft.com/en-us/python/api/azure-mgmt-resource/azure.mgmt.resource.resources?view=azure-python)
- 📗 GCP Resource Labels: [Creating and Managing Labels in Google Cloud](https://cloud.google.com/resource-manager/docs/creating-managing-labels)

## Stretch Goal
Extend `resource_tagger.py` to support multi-region EC2 tagging by iterating through all regions returned by `ec2.describe_regions()` and tagging instances in every active region.

## Common Mistakes
- **Overwriting existing S3 bucket tags**: Unlike `ec2.create_tags()` which appends or updates specific keys, `s3.put_bucket_tagging()` replaces the *entire* tag set. If you don't retrieve existing tags first and merge them, you will accidentally wipe out all prior tags on the bucket!
- **Not handling `NoSuchTagSet`**: When an S3 bucket has never had tags attached, calling `get_bucket_tagging` raises a `ClientError` with code `NoSuchTagSet` instead of returning an empty list. Always check `e.response['Error']['Code'] == 'NoSuchTagSet'`.
- **Failing to make scripts idempotent**: Automation scripts should be safe to run on a recurring schedule (e.g. daily cron job). Always compare current tags against expected values before issuing API write requests.
