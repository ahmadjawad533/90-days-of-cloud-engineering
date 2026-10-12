# Day 78: Cloud Security Fundamentals
[← Previous Day](../day-77-alerts-incident-response/README.md) | [Next Day →](../day-79-iam-least-privilege/README.md)

## Goal
Master the foundational tenets of cloud security including the Shared Responsibility Model, defense in depth, encryption at rest and in transit, and security baselining.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/) — Official guide detailing security "of" the cloud vs. security "in" the cloud.
- 📖 [AWS Security Best Practices](https://docs.aws.amazon.com/whitepapers/latest/aws-security-best-practices/welcome.html) — AWS Well-Architected Security Pillar guidance on data protection and threat prevention.

## Do
In this lab, you will audit your cloud security posture, configure S3 default encryption using AWS KMS, enforce secure transport (HTTPS-only) via bucket policies, and enable basic account-level security controls using the AWS CLI.

1. **Verify your caller identity and security boundary**:
   ```bash
   aws sts get-caller-identity
   ```

2. **Inspect S3 account-level Public Access Block**:
   Check if global public access block is currently enforced on your AWS account:
   ```bash
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   aws s3control get-public-access-block --account-id "$ACCOUNT_ID" || echo "Account-level public access block is not configured."
   ```

3. **Enable account-level S3 Public Access Block**:
   Enforce all four public access blocks across your entire AWS account to prevent accidental public data leaks:
   ```bash
   aws s3control put-public-access-block \
     --account-id "$ACCOUNT_ID" \
     --public-access-block-configuration \
     "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
   ```

4. **Create a secure test S3 bucket**:
   Create a dedicated bucket for security testing (replace `UNIQUE_SUFFIX` with your initials or random numbers):
   ```bash
   BUCKET_NAME="cloud-security-baseline-${ACCOUNT_ID}"
   aws s3api create-bucket \
     --bucket "$BUCKET_NAME" \
     --region us-east-1
   ```

5. **Enforce server-side encryption at rest (SSE-S3 / AES256)**:
   Configure default encryption so every object uploaded without explicit encryption parameters is automatically encrypted:
   ```bash
   aws s3api put-bucket-encryption \
     --bucket "$BUCKET_NAME" \
     --server-side-encryption-configuration '{
       "Rules": [
         {
           "ApplyServerSideEncryptionByDefault": {
             "SSEAlgorithm": "AES256"
           },
           "BucketKeyEnabled": true
         }
       ]
     }'
   ```

6. **Enforce encryption in transit (HTTPS / TLS only)**:
   Create a bucket policy that denies any non-encrypted HTTP requests (`aws:SecureTransport: false`):
   ```bash
   cat <<EOF > enforce-tls-policy.json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "DenyNonTLSRequests",
         "Effect": "Deny",
         "Principal": "*",
         "Action": "s3:*",
         "Resource": [
           "arn:aws:s3:::$BUCKET_NAME",
           "arn:aws:s3:::$BUCKET_NAME/*"
         ],
         "Condition": {
           "Bool": {
             "aws:SecureTransport": "false"
           }
         }
       }
     ]
   }
   EOF

   aws s3api put-bucket-policy \
     --bucket "$BUCKET_NAME" \
     --policy file://enforce-tls-policy.json
   ```

7. **Verify encryption settings**:
   ```bash
   aws s3api get-bucket-encryption --bucket "$BUCKET_NAME"
   aws s3api get-bucket-policy --bucket "$BUCKET_NAME"
   ```

## Done When
- [ ] Account-level S3 Public Access Block is enabled and verified.
- [ ] A dedicated test S3 bucket is created with default server-side encryption configured.
- [ ] A bucket policy denying non-TLS requests (`aws:SecureTransport: false`) is attached.
- [ ] Verification commands confirm encryption and policy status.

## Cost and Cleanup
Expected Cost: **$0.00** — S3 bucket configuration and account security policy settings are completely free.

Clean up the test resources created today:
```bash
# Remove bucket policy and empty/delete test bucket
aws s3api delete-bucket-policy --bucket "$BUCKET_NAME"
aws s3 rb "s3://$BUCKET_NAME" --force

# Remove local policy file
rm -f enforce-tls-policy.json
```
*(Note: You can leave Account-Level S3 Public Access Block enabled as a security best practice, or remove it with `aws s3control delete-public-access-block --account-id $ACCOUNT_ID` if desired).*

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Shared Responsibility Model | Azure Shared Responsibility | GCP Shared Responsibility |
| S3 Account Public Access Block | Azure Storage Account Public Access Denial | GCP Storage Public Access Prevention |
| S3 Server-Side Encryption (SSE) | Azure Storage Service Encryption (SSE) | Cloud Storage Default Encryption |
| S3 TLS Enforcement Policy | Azure `supportsHttpsTrafficOnly` Setting | GCP Enforce Uniform Bucket-Level Access / HTTPS |

- 📖 [Azure Security Documentation](https://learn.microsoft.com/en-us/azure/security/)
- 📖 [Google Cloud Security Overview](https://cloud.google.com/security/overview)

## Stretch Goal
Enable AWS Security Hub or AWS GuardDuty in a single region using the AWS CLI (`aws guardduty create-detector`), inspect the detector status, and review the initial threat detection findings generated. Be sure to delete the detector during cleanup.

## Common Mistakes
- **Assuming the cloud provider handles all security**: The provider is only responsible for the security *of* the cloud (physical data centers, hypervisors, hardware). You are responsible for security *in* the cloud (IAM, data encryption, firewall rules, OS patches).
- **Neglecting encryption in transit**: Default encryption only protects data at rest. You must explicitly require TLS/HTTPS via policies or load balancers to prevent traffic sniffing.
- **Accidentally exposing public storage buckets**: Relying on individual object ACLs is prone to error. Enforce account-level and bucket-level public access blocks.
