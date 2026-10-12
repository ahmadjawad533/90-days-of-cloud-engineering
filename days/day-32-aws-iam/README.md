# Day 32: AWS IAM Deep Dive
[← Previous Day](../day-31-cloud-resource-tagger/README.md) | [Next Day →](../day-33-vpc-fundamentals/README.md)

## Goal
Master AWS Identity and Access Management (IAM) by creating least-privilege users, groups, roles, and custom JSON policies using the AWS CLI.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [AWS IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/) — Official AWS documentation covering users, groups, roles, permissions boundaries, and policy evaluation.
- 📖 [IAM Security Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) — Official AWS recommendations on MFA, root account locking, credential rotation, and least privilege.

## Do
In this lab, you will configure IAM resources using the AWS CLI: create an administrative group, a read-only developer user, a custom policy document, and an EC2 service role.

1. **Verify AWS CLI authentication and check current caller identity**:
   ```bash
   aws sts get-caller-identity
   ```
   Ensure you are using an administrative user or temporary credentials, not the AWS root user.

2. **Create a developer IAM group**:
   ```bash
   aws iam create-group --group-name CloudDevelopersGroup
   ```

3. **Attach an AWS-managed read-only policy to the group**:
   ```bash
   aws iam attach-group-policy \
     --group-name CloudDevelopersGroup \
     --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
   ```

4. **Create a test IAM user and add the user to the group**:
   ```bash
   aws iam create-user --user-name dev-user-alice
   aws iam add-user-to-group \
     --group-name CloudDevelopersGroup \
     --user-name dev-user-alice
   ```

5. **Author and apply a custom least-privilege policy**:
   Create a local file named `s3-read-logs-policy.json`:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowReadBucketLogs",
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::cloud-app-logs-*",
           "arn:aws:s3:::cloud-app-logs-*/*"
         ]
       }
     ]
   }
   ```
   Create the custom managed policy in AWS:
   ```bash
   aws iam create-policy \
     --policy-name ReadProjectLogsPolicy \
     --policy-document file://s3-read-logs-policy.json
   ```

6. **Create an IAM Role with an EC2 Trust Policy**:
   Create a trust relationship document named `ec2-trust-policy.json`:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Service": "ec2.amazonaws.com"
         },
         "Action": "sts:AssumeRole"
       }
     ]
   }
   ```
   Create the role and create an instance profile for EC2:
   ```bash
   aws iam create-role \
     --role-name EC2S3ReadOnlyRole \
     --assume-role-policy-document file://ec2-trust-policy.json

   aws iam attach-role-policy \
     --role-name EC2S3ReadOnlyRole \
     --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

   aws iam create-instance-profile \
     --instance-profile-name EC2S3ReadOnlyProfile

   aws iam add-role-to-instance-profile \
     --instance-profile-name EC2S3ReadOnlyProfile \
     --role-name EC2S3ReadOnlyRole
   ```

7. **Verify permissions and role configuration**:
   ```bash
   aws iam get-user --user-name dev-user-alice
   aws iam get-role --role-name EC2S3ReadOnlyRole
   aws iam get-instance-profile --instance-profile-name EC2S3ReadOnlyProfile
   ```

## Done When
- [ ] IAM group `CloudDevelopersGroup` is created with `ReadOnlyAccess` policy attached.
- [ ] IAM user `dev-user-alice` exists and is assigned to `CloudDevelopersGroup`.
- [ ] Custom policy `ReadProjectLogsPolicy` is created and visible via `aws iam list-policies --scope Local`.
- [ ] IAM role `EC2S3ReadOnlyRole` is created with trust policy allowing `ec2.amazonaws.com` and associated with an instance profile.

## Cost and Cleanup
Expected Cost: **$0.00** — IAM is a complimentary foundational service in AWS and incurs no charges.

Run the following cleanup commands to tear down the test IAM resources:
```bash
# 1. Remove role from instance profile and delete instance profile
aws iam remove-role-from-instance-profile \
  --instance-profile-name EC2S3ReadOnlyProfile \
  --role-name EC2S3ReadOnlyRole
aws iam delete-instance-profile \
  --instance-profile-name EC2S3ReadOnlyProfile

# 2. Detach managed policy from role and delete role
aws iam detach-role-policy \
  --role-name EC2S3ReadOnlyRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
aws iam delete-role --role-name EC2S3ReadOnlyRole

# 3. Remove user from group and delete user
aws iam remove-user-from-group \
  --group-name CloudDevelopersGroup \
  --user-name dev-user-alice
aws iam delete-user --user-name dev-user-alice

# 4. Detach policy from group and delete group
aws iam detach-group-policy \
  --group-name CloudDevelopersGroup \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
aws iam delete-group --group-name CloudDevelopersGroup

# 5. Delete custom managed policy
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws iam delete-policy \
  --policy-arn "arn:aws:iam::${ACCOUNT_ID}:policy/ReadProjectLogsPolicy"

# 6. Delete local json policy files
rm -f s3-read-logs-policy.json ec2-trust-policy.json
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| IAM User | Microsoft Entra ID User | Cloud Identity / Google Account |
| IAM Group | Microsoft Entra ID Group | Google Cloud IAM Group |
| IAM Role (AssumeRole) | Azure Managed Identity / App Registration | Service Account |
| IAM Policy (JSON) | Azure RBAC Role Definition | GCP IAM Role / IAM Policy Binding |
| Instance Profile | Managed Identity assigned to VM | VM Attached Service Account |

- 📖 [Azure Role-Based Access Control (RBAC) Documentation](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview)
- 📖 [Google Cloud IAM Overview](https://cloud.google.com/iam/docs/overview)

## Stretch Goal
Write a least-privilege IAM policy that restricts access using `Condition` blocks. For example, require MFA (`aws:MultiFactorAuthPresent: "true"`) or restrict operations to requests originating from your public IP address using `aws:SourceIp`. Test evaluating the policy using the AWS CLI `aws iam simulate-custom-policy`.

## Common Mistakes
- **Using root credentials for daily operations**: Never generate root access keys. Always use an IAM user or federated role with targeted permissions.
- **Granting wildcard (`"Action": "*"`) permissions**: Always apply least privilege. Give only the exact actions and resource ARNs required.
- **Forgetting that explicit Deny overrides any Allow**: If any attached policy has a `Deny` matching an action/resource, it permanently overrides all `Allow` statements.
