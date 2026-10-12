#!/usr/bin/env python3
"""
Cloud Resource Tagger
Automate governance and compliance tagging across AWS EC2 instances and S3 buckets using Boto3.

Features:
- Lists all EC2 instances and S3 buckets in target regions
- Compares existing tags against a mandatory tag specification
- Applies missing tags or updates existing tags based on configuration
- Generates a detailed audit and execution report
- Gracefully handles permission issues, missing regions, and AWS API exceptions
"""

import sys
from typing import Dict, List, Tuple
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# Default target tags to apply to all discovered resources
DEFAULT_TAGS = {
    "Environment": "Development",
    "ManagedBy": "Python-Boto3",
    "Project": "90-Days-Cloud-Engineering",
    "CostCenter": "CC-1042",
}

DEFAULT_REGION = "us-east-1"


def get_clients(region_name: str = DEFAULT_REGION):
    """Instantiate EC2 and S3 clients."""
    ec2 = boto3.client("ec2", region_name=region_name)
    s3 = boto3.client("s3", region_name=region_name)
    return ec2, s3


def list_ec2_instances(ec2_client) -> List[dict]:
    """Retrieve all EC2 instances across reservations."""
    instances = []
    try:
        paginator = ec2_client.get_paginator("describe_instances")
        for page in paginator.paginate():
            for res in page.get("Reservations", []):
                for inst in res.get("Instances", []):
                    # Filter out terminated instances
                    if inst.get("State", {}).get("Name") != "terminated":
                        instances.append(inst)
    except ClientError as e:
        print(f"⚠️  EC2 describe_instances error: {e.response['Error']['Message']}")
    return instances


def list_s3_buckets(s3_client) -> List[dict]:
    """Retrieve all S3 buckets in the AWS account."""
    buckets = []
    try:
        response = s3_client.list_buckets()
        buckets = response.get("Buckets", [])
    except ClientError as e:
        print(f"⚠️  S3 list_buckets error: {e.response['Error']['Message']}")
    return buckets


def get_s3_bucket_tags(s3_client, bucket_name: str) -> Dict[str, str]:
    """Fetch existing tags for an S3 bucket as a key-value dictionary."""
    existing_tags = {}
    try:
        response = s3_client.get_bucket_tagging(Bucket=bucket_name)
        for tag in response.get("TagSet", []):
            existing_tags[tag["Key"]] = tag["Value"]
    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        if error_code != "NoSuchTagSet":
            print(f"⚠️  Failed to fetch tags for bucket {bucket_name}: {e.response['Error']['Message']}")
    return existing_tags


def format_ec2_tags(tag_dict: Dict[str, str]) -> List[dict]:
    """Format dictionary into AWS EC2 Tag list [{'Key': k, 'Value': v}]."""
    return [{"Key": k, "Value": str(v)} for k, v in tag_dict.items()]


def format_s3_tags(tag_dict: Dict[str, str]) -> List[dict]:
    """Format dictionary into AWS S3 TagSet [{'Key': k, 'Value': v}]."""
    return [{"Key": k, "Value": str(v)} for k, v in tag_dict.items()]


def tag_ec2_instances(ec2_client, instances: List[dict], target_tags: Dict[str, str], dry_run: bool = False) -> List[Tuple[str, str, str]]:
    """
    Check and apply target tags to EC2 instances.
    Returns audit log entries: (ResourceID, Action, Status).
    """
    audit_log = []
    for inst in instances:
        inst_id = inst["InstanceId"]
        current_tags = {t["Key"]: t["Value"] for t in inst.get("Tags", [])}

        tags_to_apply = {}
        for key, value in target_tags.items():
            if current_tags.get(key) != value:
                tags_to_apply[key] = value

        if not tags_to_apply:
            audit_log.append((inst_id, "EC2", "ALREADY_COMPLIANT"))
            continue

        if dry_run:
            audit_log.append((inst_id, "EC2", f"DRY_RUN: Would apply {tags_to_apply}"))
            continue

        try:
            ec2_client.create_tags(
                Resources=[inst_id],
                Tags=format_ec2_tags(tags_to_apply),
            )
            audit_log.append((inst_id, "EC2", f"TAGGED ({len(tags_to_apply)} tags updated)"))
        except ClientError as e:
            audit_log.append((inst_id, "EC2", f"ERROR: {e.response['Error']['Message']}"))

    return audit_log


def tag_s3_buckets(s3_client, buckets: List[dict], target_tags: Dict[str, str], dry_run: bool = False) -> List[Tuple[str, str, str]]:
    """
    Check and apply target tags to S3 buckets.
    Returns audit log entries: (ResourceID, Action, Status).
    """
    audit_log = []
    for b in buckets:
        bucket_name = b["Name"]
        current_tags = get_s3_bucket_tags(s3_client, bucket_name)

        # Merge current tags with target tags to avoid erasing existing tags
        merged_tags = current_tags.copy()
        merged_tags.update(target_tags)

        # Check if an update is required
        needs_update = any(current_tags.get(k) != v for k, v in target_tags.items())

        if not needs_update:
            audit_log.append((bucket_name, "S3", "ALREADY_COMPLIANT"))
            continue

        if dry_run:
            audit_log.append((bucket_name, "S3", f"DRY_RUN: Would apply {target_tags}"))
            continue

        try:
            s3_client.put_bucket_tagging(
                Bucket=bucket_name,
                Tagging={"TagSet": format_s3_tags(merged_tags)},
            )
            audit_log.append((bucket_name, "S3", "TAGGED (Compliance tags merged)"))
        except ClientError as e:
            audit_log.append((bucket_name, "S3", f"ERROR: {e.response['Error']['Message']}"))

    return audit_log


def print_report(audit_log: List[Tuple[str, str, str]]):
    """Print a clean execution report to stdout."""
    print("\n" + "=" * 70)
    print("CLOUD RESOURCE TAGGER - EXECUTION REPORT")
    print("=" * 70)
    print(f"{'RESOURCE ID / NAME':<35} | {'TYPE':<6} | {'STATUS'}")
    print("-" * 70)

    if not audit_log:
        print("No active EC2 instances or S3 buckets discovered.")
    else:
        for resource_id, res_type, status in audit_log:
            print(f"{resource_id:<35} | {res_type:<6} | {status}")

    print("=" * 70)


def main():
    """Main execution function."""
    dry_run = "--dry-run" in sys.argv

    print("Initiating Cloud Resource Tagger...")
    if dry_run:
        print("🔍 Running in DRY-RUN mode. No tags will be modified.")

    try:
        ec2_client, s3_client = get_clients(DEFAULT_REGION)

        # Discover resources
        print(f"Discovering EC2 instances in {DEFAULT_REGION}...")
        ec2_instances = list_ec2_instances(ec2_client)
        print(f"Discovered {len(ec2_instances)} active EC2 instance(s).")

        print("Discovering S3 buckets in account...")
        s3_buckets = list_s3_buckets(s3_client)
        print(f"Discovered {len(s3_buckets)} S3 bucket(s).")

        # Apply tags
        audit_records = []
        audit_records.extend(tag_ec2_instances(ec2_client, ec2_instances, DEFAULT_TAGS, dry_run=dry_run))
        audit_records.extend(tag_s3_buckets(s3_client, s3_buckets, DEFAULT_TAGS, dry_run=dry_run))

        # Output results
        print_report(audit_records)

    except NoCredentialsError:
        print("\n❌ AWS credentials not found. Please run 'aws configure'.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected execution error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
EOF
