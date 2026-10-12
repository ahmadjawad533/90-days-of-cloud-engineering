# Day 38: S3 Buckets and Objects
[← Previous Day](../day-37-ec2-storage/README.md) | [Next Day →](../day-39-rds-databases/README.md)

## Goal
Master Amazon Simple Storage Service (S3) by creating secure buckets, managing object lifecycles, enabling versioning and default encryption, and generating pre-signed URLs using the AWS CLI.

## Time
⏱️ Approximately 70 minutes

## Learn
- 📖 [Amazon S3 User Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/) — Official documentation detailing object storage fundamentals, storage tiers, consistency models, and bucket naming rules.
- 📖 [Amazon S3 Security Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html) — AWS guide on Block Public Access, bucket policies, and default server-side encryption (SSE-S3 vs. SSE-KMS).

## Do
In this lab, you will generate a globally unique bucket, enforce security controls (Block Public Access and SSE-S3), test object versioning, and generate temporary pre-signed URLs.

1. **Generate a globally unique bucket name and create the bucket**:
   S3 bucket names must be globally unique across all AWS accounts in the world, contain only lowercase letters, numbers, and hyphens, and be between 3 and 63 characters.
   ```bash
   REGION="us-east-1"
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   BUCKET_NAME="cloud-eng-lab-${ACCOUNT_ID}-${RANDOM}"

   echo "Creating S3 bucket: ${BUCKET_NAME}"
   # In us-east-1, LocationConstraint is omitted; for other regions, pass --create-bucket-configuration LocationConstraint=${REGION}
   aws s3api create-bucket \
     --region "${REGION}" \
     --bucket "${BUCKET_NAME}"
   ```

2. **Enforce S3 Block Public Access**:
   Ensure all four Block Public Access flags are turned on:
   ```bash
   aws s3api put-public-access-block \
     --region "${REGION}" \
     --bucket "${BUCKET_NAME}" \
     --public-access-block-configuration \
       "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
   ```

3. **Enable Server-Side Encryption by default (SSE-S3)**:
   ```bash
   aws s3api put-bucket-encryption \
     --region "${REGION}" \
     --bucket "${BUCKET_NAME}" \
     --server-side-encryption-configuration '{
       "Rules": [
         {
           "ApplyServerSideEncryptionByDefault": {
             "SSEAlgorithm": "AES256"
           }
         }
       ]
     }'
   ```

4. **Enable Bucket Versioning**:
   Versioning protects against accidental overwrites and deletions by keeping every revision of an object.
   ```bash
   aws s3api put-bucket-versioning \
     --region "${REGION}" \
     --bucket "${BUCKET_NAME}" \
     --versioning-configuration Status=Enabled
   ```

5. **Upload and update objects to test versioning**:
   ```bash
   # Create a local file and upload Version 1
   echo "Version 1.0 of application configuration" > config.json
   aws s3 cp config.json "s3://${BUCKET_NAME}/config.json"

   # Modify the file and upload Version 2
   echo "Version 2.0 of application configuration" > config.json
   aws s3 cp config.json "s3://${BUCKET_NAME}/config.json"

   # List all versions of the object
   aws s3api list-object-versions \
     --region "${REGION}" \
     --bucket "${BUCKET_NAME}" \
     --prefix "config.json" \
     --query "Versions[*].[VersionId,IsLatest,LastModified,Size]" \
     --output table
   ```

6. **Generate a Pre-signed URL for secure temporary access**:
   Instead of opening your bucket to the public internet, generate a secure time-limited link (valid for 10 minutes) allowing anyone with the URL to download the file directly:
   ```bash
   PRESIGNED_URL=$(aws s3 presign "s3://${BUCKET_NAME}/config.json" --expires-in 600)
   echo "Pre-signed URL: ${PRESIGNED_URL}"

   # Test accessing the private object with curl using the pre-signed URL
   curl -s "${PRESIGNED_URL}"
   ```

7. **Configure an S3 Lifecycle Rule for version expiration**:
   Create a lifecycle rule to expire non-current versions after 30 days:
   ```bash
   cat << 'EOF' > lifecycle.json
   {
     "Rules": [
       {
         "ID": "ExpireOldVersions",
         "Status": "Enabled",
         "Filter": {"Prefix": ""},
         "NoncurrentVersionExpiration": {
           "NoncurrentDays": 30
         }
       }
     ]
   }
   EOF

   aws s3api put-bucket-lifecycle-configuration \
     --region "${REGION}" \
     --bucket "${BUCKET_NAME}" \
     --lifecycle-configuration file://lifecycle.json
   ```

## Done When
- [ ] S3 bucket is created with global uniqueness.
- [ ] Block Public Access configuration has all four settings set to `true`.
- [ ] Default encryption (`AES256`) and versioning are enabled.
- [ ] Multiple object versions appear in `list-object-versions`.
- [ ] Pre-signed URL successfully downloads the object contents via `curl`.

## Cost and Cleanup
Expected Cost: **$0.00** — The AWS Free Tier provides 5 GB of S3 standard storage, 20,000 GET requests, and 2,000 PUT requests per month for 12 months.

Because versioning was enabled, deleting a bucket requires deleting all object versions and delete markers first:
```bash
REGION="us-east-1"

# 1. Delete all versions and delete markers using the AWS CLI
echo "Deleting all object versions in bucket ${BUCKET_NAME}..."
aws s3api delete-objects \
  --region "${REGION}" \
  --bucket "${BUCKET_NAME}" \
  --delete "$(aws s3api list-object-versions \
    --region "${REGION}" \
    --bucket "${BUCKET_NAME}" \
    --query='{Objects: Versions[].{Key:Key,VersionId:VersionId}}' \
    --output json)" 2>/dev/null || true

aws s3api delete-objects \
  --region "${REGION}" \
  --bucket "${BUCKET_NAME}" \
  --delete "$(aws s3api list-object-versions \
    --region "${REGION}" \
    --bucket "${BUCKET_NAME}" \
    --query='{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' \
    --output json)" 2>/dev/null || true

# 2. Delete the bucket
aws s3api delete-bucket --region "${REGION}" --bucket "${BUCKET_NAME}"

# 3. Clean up local files
rm -f config.json lifecycle.json

echo "Bucket ${BUCKET_NAME} and local files removed successfully."
```

## Azure / GCP Equivalents
| Amazon S3 Feature | Azure Blob Storage | Google Cloud Storage (GCS) |
|-------------------|--------------------|----------------------------|
| S3 Bucket | Blob Container (in Storage Account) | GCS Bucket |
| S3 Object | Block Blob | GCS Object |
| Pre-signed URL | Shared Access Signature (SAS) URI | Signed URL |
| S3 Versioning | Blob Versioning | Object Versioning |
| Lifecycle Rules | Lifecycle Management Rules | Object Lifecycle Management |
| Storage Classes (Standard, Glacier) | Tiers (Hot, Cool, Cold, Archive) | Classes (Standard, Nearline, Coldline, Archive) |

- 📖 [Azure Blob Storage Documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-overview)
- 📖 [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs/introduction)

## Stretch Goal
Write and apply an S3 Bucket Policy enforcing HTTPS (TLS) connections only. The policy should contain a `Deny` statement for action `s3:*` where `aws:SecureTransport` is `"false"`. Test attempting an unencrypted HTTP request using `curl` against the S3 REST API endpoint and verify it returns HTTP `403 Forbidden`.

## Common Mistakes
- **Assuming bucket deletion automatically purges versioned objects**: Attempting `aws s3 rb s3://bucket-name --force` fails on versioned buckets because AWS prevents deletion while older versions or delete markers remain.
- **Making buckets public to share temporary files**: Never disable Block Public Access or make entire buckets public just to share a file. Use pre-signed URLs with short TTLs instead.
- **Bucket naming violations**: S3 bucket names cannot contain uppercase letters or underscores. They must be DNS-compliant lowercase strings.
