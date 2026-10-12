# Day 29: Introduction to Boto3

[← Previous Day](../day-28-modules-virtualenvs/README.md) | [Next Day →](../day-30-boto3-ec2-s3/README.md)

## Goal
Set up the AWS SDK for Python (`boto3`), authenticate using AWS IAM credentials, and programmatically query AWS caller identity and regions.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Boto3 Quickstart](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html) — Official getting started guide for installing and configuring Boto3.
- 📖 [AWS CLI Getting Started — Installation and Configuration](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) — Official documentation for setting up AWS credentials and default regions.
- 📖 [Boto3 Documentation — Credentials](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html) — How Boto3 locates and resolves AWS credentials.

## Do
Boto3 is the official AWS SDK for Python. It provides two main APIs:
1. **Client**: Low-level, 1:1 mapping to AWS service REST APIs. Returns raw dictionaries. (Recommended and most common in modern cloud engineering).
2. **Resource**: High-level, object-oriented interface with attributes and action methods.

Today, you will configure your AWS credentials, install Boto3, and write your first AWS automation script.

1. **Verify or install AWS CLI**
   Check if the AWS CLI is installed:
   ```bash
   aws --version
   ```
   If not installed, install it following official instructions or with your package manager:
   ```bash
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip -q awscliv2.zip
   sudo ./aws/install
   rm -rf aws awscliv2.zip
   ```

2. **Configure your AWS credentials**
   Run the interactive configuration command:
   ```bash
   aws configure
   ```
   Provide your IAM user credentials when prompted:
   - **AWS Access Key ID**: Your IAM access key ID (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - **AWS Secret Access Key**: Your secret key (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
   - **Default region name**: `us-east-1` (or your preferred region)
   - **Default output format**: `json`

   Verify credentials work using the AWS CLI:
   ```bash
   aws sts get-caller-identity
   ```

3. **Set up a dedicated project environment for Boto3**
   ```bash
   mkdir -p ~/cloud-python/day-29
   cd ~/cloud-python/day-29
   python3 -m venv .venv
   source .venv/bin/activate
   pip install boto3
   ```

4. **Verify authentication with Boto3 (`whoami` script)**
   Create a script `aws_whoami.py` to query your AWS identity using the STS (Security Token Service) client:
   ```bash
   cat << 'EOF' > aws_whoami.py
   """Verify AWS credentials using STS."""
   import sys
   import boto3
   from botocore.exceptions import NoCredentialsError, ClientError

   def check_aws_identity():
       try:
           sts_client = boto3.client("sts")
           identity = sts_client.get_caller_identity()

           print("✅ AWS Authentication Successful!")
           print(f"Account ID: {identity.get('Account')}")
           print(f"User / Role ARN: {identity.get('Arn')}")
           print(f"User ID: {identity.get('UserId')}")

       except NoCredentialsError:
           print("❌ Error: No AWS credentials found.")
           print("Run 'aws configure' or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.")
           sys.exit(1)
       except ClientError as e:
           print(f"❌ AWS Client Error: {e.response['Error']['Message']}")
           sys.exit(1)

   if __name__ == "__main__":
       check_aws_identity()
   EOF
   ```

   Run the script:
   ```bash
   python aws_whoami.py
   ```

5. **List enabled AWS regions**
   Create `list_regions.py` to query EC2 regions:
   ```bash
   cat << 'EOF' > list_regions.py
   """List all enabled AWS regions using Boto3 EC2 client."""
   import boto3
   from botocore.exceptions import ClientError

   def list_available_regions():
       ec2_client = boto3.client("ec2", region_name="us-east-1")
       try:
           response = ec2_client.describe_regions(
               AllRegions=False  # Only list regions enabled for this account
           )
           regions = sorted([r["RegionName"] for r in response.get("Regions", [])])

           print(f"Found {len(regions)} enabled AWS regions:")
           for region in regions:
               print(f"  - {region}")

       except ClientError as err:
           print(f"Failed to query regions: {err}")

   if __name__ == "__main__":
       list_available_regions()
   EOF
   ```

   Run the regions script:
   ```bash
   python list_regions.py
   ```

6. **Compare Client vs Resource APIs**
   Create `client_vs_resource.py` to understand both paradigms:
   ```bash
   cat << 'EOF' > client_vs_resource.py
   """Understand the difference between Boto3 Client and Resource."""
   import boto3

   print("=== 1. Low-level Client Approach ===")
   s3_client = boto3.client("s3")
   response = s3_client.list_buckets()
   print(f"Client response type: {type(response)} (Dict)")
   print(f"Bucket count: {len(response.get('Buckets', []))}")

   print("\n=== 2. High-level Resource Approach ===")
   s3_resource = boto3.resource("s3")
   bucket_collection = s3_resource.buckets.all()
   print(f"Resource collection type: {type(bucket_collection)}")
   names = [b.name for b in bucket_collection]
   print(f"Bucket names retrieved via Resource: {names}")
   EOF
   ```

   Run the comparison:
   ```bash
   python client_vs_resource.py
   ```

## Done When
- [ ] AWS CLI credentials are configured and `aws sts get-caller-identity` returns your Account ID.
- [ ] Boto3 is installed inside a virtual environment.
- [ ] `python aws_whoami.py` outputs your Account ID and ARN.
- [ ] `python list_regions.py` returns the list of active AWS regions.
- [ ] You understand the difference between `boto3.client` and `boto3.resource`.

## Cost and Cleanup
$0 — read-only API calls (`sts:GetCallerIdentity`, `ec2:DescribeRegions`, `s3:ListBuckets`) fall under the free tier and do not create billable cloud infrastructure.
To clean up your local virtual environment:
```bash
deactivate 2>/dev/null || true
rm -rf ~/cloud-python/day-29
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Boto3 (`boto3`) | Azure SDK for Python (`azure-identity`, `azure-mgmt-compute`) | Google Cloud Client Libraries (`google-cloud-*`) |
- 📘 Azure SDK: [Azure SDK for Python Documentation](https://learn.microsoft.com/en-us/azure/developer/python/)
- 📗 GCP SDK: [Google Cloud Python Client Libraries](https://cloud.google.com/python/docs)

## Stretch Goal
Modify `aws_whoami.py` to test whether credentials can be passed dynamically via environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`) instead of `~/.aws/credentials`.

## Common Mistakes
- **Hardcoding credentials in script code**: Never put `aws_access_key_id="AKIA..."` inside your Python scripts. If committed to GitHub, bots scan and compromise accounts within seconds. Always use `aws configure` or environment variables.
- **Ignoring AWS Region**: Many services (like EC2) require a specific region. If not configured, Boto3 will raise a `NoRegionError`. Always set `region_name="us-east-1"` or ensure a default region exists in `~/.aws/config`.
- **Misunderstanding Client vs Resource**: `boto3.client('ec2')` returns dicts. `boto3.resource('ec2')` returns Python objects with methods. AWS recommends the `client` interface for all modern features because new services may not receive `resource` implementations.
