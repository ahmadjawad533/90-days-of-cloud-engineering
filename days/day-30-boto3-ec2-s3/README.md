# Day 30: Boto3 EC2 and S3 Operations

[← Previous Day](../day-29-intro-to-boto3/README.md) | [Next Day →](../day-31-cloud-resource-tagger/README.md)

## Goal
Automate core AWS operations with Boto3: create an S3 bucket, upload and download objects, and query EC2 instance metadata and state.

## Time
⏱️ Approximately 95 minutes

## Learn
- 📖 [Boto3 S3 Client Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html) — Official documentation for S3 operations (`create_bucket`, `put_object`, `list_objects_v2`, `delete_bucket`).
- 📖 [Boto3 EC2 Client Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/ec2.html) — Official documentation for EC2 operations (`describe_instances`, `describe_security_groups`, `create_tags`).

## Do
Storage (S3) and Compute (EC2) are the two foundational pillars of AWS. Today, you will write a complete Python automation workflow that programmatically creates an S3 bucket, uploads a configuration artifact, inspects it, cleans it up, and audits EC2 instances in your region.

1. **Set up workspace**
   ```bash
   mkdir -p ~/cloud-python/day-30
   cd ~/cloud-python/day-30
   python3 -m venv .venv
   source .venv/bin/activate
   pip install boto3
   ```

2. **Automate S3 bucket operations**
   S3 bucket names must be globally unique across all AWS accounts worldwide. We will use Python's `uuid` module to generate a unique bucket suffix.

   Create `s3_manager.py`:
   ```bash
   cat << 'EOF' > s3_manager.py
   """Automate S3 bucket creation, upload, download, and deletion."""
   import uuid
   import boto3
   from botocore.exceptions import ClientError

   REGION = "us-east-1"
   s3 = boto3.client("s3", region_name=REGION)

   # Generate unique bucket name
   bucket_name = f"cloud-lab-{uuid.uuid4().hex[:8]}"

   def create_my_bucket(name: str):
       print(f"Creating bucket: {name} in {REGION}...")
       try:
           if REGION == "us-east-1":
               # us-east-1 does not accept LocationConstraint
               s3.create_bucket(Bucket=name)
           else:
               s3.create_bucket(
                   Bucket=name,
                   CreateBucketConfiguration={"LocationConstraint": REGION}
               )
           print(f"✅ Bucket '{name}' created successfully.")
       except ClientError as e:
           print(f"❌ Failed to create bucket: {e}")
           raise

   def upload_and_verify(name: str):
       test_file = "sample_config.json"
       with open(test_file, "w") as f:
           f.write('{"environment": "lab", "managed_by": "boto3", "version": 1}')

       object_key = "configs/sample_config.json"
       print(f"Uploading {test_file} to s3://{name}/{object_key}...")
       s3.upload_file(test_file, name, object_key)
       print("✅ Upload complete.")

       # List objects in bucket
       print("Listing objects in bucket:")
       response = s3.list_objects_v2(Bucket=name)
       for obj in response.get("Contents", []):
           print(f" - Key: {obj['Key']} | Size: {obj['Size']} bytes | Modified: {obj['LastModified']}")

   def download_object(name: str):
       downloaded_path = "downloaded_config.json"
       object_key = "configs/sample_config.json"
       print(f"Downloading s3://{name}/{object_key} to {downloaded_path}...")
       s3.download_file(name, object_key, downloaded_path)
       with open(downloaded_path, "r") as f:
           print(f"Downloaded content: {f.read()}")

   def cleanup_s3(name: str):
       print(f"\nCleaning up S3 bucket '{name}'...")
       try:
           # First delete all objects inside bucket (bucket must be empty before deletion)
           objects = s3.list_objects_v2(Bucket=name)
           if "Contents" in objects:
               delete_payload = {"Objects": [{"Key": obj["Key"]} for obj in objects["Contents"]]}
               s3.delete_objects(Bucket=name, Delete=delete_payload)
               print("Deleted all objects in bucket.")

           # Delete bucket itself
           s3.delete_bucket(Bucket=name)
           print(f"✅ Bucket '{name}' successfully deleted.")
       except ClientError as e:
           print(f"❌ Cleanup failed: {e}")

   if __name__ == "__main__":
       try:
           create_my_bucket(bucket_name)
           upload_and_verify(bucket_name)
           download_object(bucket_name)
       finally:
           # Always clean up bucket to maintain $0 spend
           cleanup_s3(bucket_name)
   EOF
   ```

3. **Run the S3 workflow**
   ```bash
   python s3_manager.py
   ```

4. **Audit EC2 instances and security groups**
   Write a discovery script `ec2_auditor.py` that queries EC2 resources across the region:
   ```bash
   cat << 'EOF' > ec2_auditor.py
   """Audit EC2 instances and Security Groups using Boto3."""
   import boto3
   from botocore.exceptions import ClientError

   REGION = "us-east-1"
   ec2 = boto3.client("ec2", region_name=REGION)

   def audit_instances():
       print(f"=== EC2 Instance Audit ({REGION}) ===")
       try:
           response = ec2.describe_instances()
           reservations = response.get("Reservations", [])
           instance_count = 0

           for res in reservations:
               for inst in res.get("Instances", []):
                   instance_count += 1
                   inst_id = inst.get("InstanceId")
                   inst_type = inst.get("InstanceType")
                   state = inst.get("State", {}).get("Name")
                   launch_time = inst.get("LaunchTime")

                   # Extract Name tag if present
                   name = next(
                       (t["Value"] for t in inst.get("Tags", []) if t["Key"] == "Name"),
                       "<unnamed>"
                   )

                   print(f"Instance: {inst_id} | Name: {name:<16} | Type: {inst_type} | State: {state} | Launched: {launch_time}")

           if instance_count == 0:
               print("ℹ️  No EC2 instances currently found in this region.")

       except ClientError as e:
           print(f"❌ Failed to describe instances: {e}")

   def audit_security_groups():
       print(f"\n=== Security Group Open Port Check ({REGION}) ===")
       try:
           response = ec2.describe_security_groups()
           groups = response.get("SecurityGroups", [])

           for sg in groups:
               sg_id = sg.get("GroupId")
               sg_name = sg.get("GroupName")
               for perm in sg.get("IpPermissions", []):
                   from_port = perm.get("FromPort", "ALL")
                   to_port = perm.get("ToPort", "ALL")
                   proto = perm.get("IpProtocol", "ALL")

                   for ip_range in perm.get("IpRanges", []):
                       cidr = ip_range.get("CidrIp")
                       if cidr == "0.0.0.0/0":
                           print(f"⚠️  WARNING: SG {sg_id} ({sg_name}) permits traffic from 0.0.0.0/0 on port {from_port}-{to_port} ({proto})")

       except ClientError as e:
           print(f"❌ Failed to describe security groups: {e}")

   if __name__ == "__main__":
       audit_instances()
       audit_security_groups()
   EOF
   ```

5. **Run the EC2 audit script**
   ```bash
   python ec2_auditor.py
   ```

## Done When
- [ ] `s3_manager.py` successfully created a bucket, uploaded an object, listed objects, verified contents, and deleted the bucket.
- [ ] S3 bucket cleanup executed in a `finally:` block to prevent accidental charges.
- [ ] `ec2_auditor.py` executed cleanly and scanned security groups for open `0.0.0.0/0` ingress rules.

## Cost and Cleanup
Expected Cost: **$0.00**
- S3 storage and requests for small lab files fall well within the AWS Free Tier (5 GB standard storage, 20,000 GET requests, 2,000 PUT requests).
- The script automatically deleted all created test S3 objects and buckets in the `finally:` block.
- To double check no test buckets remain:
  ```bash
  aws s3 ls
  ```
- Local cleanup:
  ```bash
  deactivate 2>/dev/null || true
  rm -rf ~/cloud-python/day-30
  ```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| S3 (`boto3.client('s3')`) | Azure Blob Storage (`BlobServiceClient`) | Google Cloud Storage (`storage.Client`) |
| EC2 (`boto3.client('ec2')`) | Azure Virtual Machines (`ComputeManagementClient`) | Google Compute Engine (`compute_v1.InstancesClient`) |
- 📘 Azure Blob Storage: [Azure Blob Storage Python Quickstart](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-quickstart-blobs-python)
- 📗 GCP Storage: [Google Cloud Storage Client Library for Python](https://cloud.google.com/storage/docs/reference/libraries#client-libraries-install-python)

## Stretch Goal
Use `boto3.client('s3')` pagination (`get_paginator('list_objects_v2')`) in a script to handle buckets that contain more than 1,000 items.

## Common Mistakes
- **Deleting non-empty S3 buckets**: Calling `delete_bucket()` on a bucket containing objects or versioned objects will throw a `BucketNotEmpty` ClientError. You must delete all object versions and markers before deleting the bucket.
- **The `us-east-1` S3 LocationConstraint quirk**: When calling `create_bucket` in `us-east-1`, omitting `CreateBucketConfiguration` is required. Supplying `LocationConstraint='us-east-1'` results in an `InvalidLocationConstraint` error. For all other regions (e.g. `us-west-2`, `eu-west-1`), `CreateBucketConfiguration={'LocationConstraint': region}` is mandatory.
- **Leaking resources on script failure**: If a script crashes before reaching the teardown commands, cloud resources stay active and may incur cost. Always wrap provisioning and teardown in `try ... finally:` blocks.
