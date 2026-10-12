# Day 79: IAM Least Privilege and Policies
[← Previous Day](../day-78-cloud-security-fundamentals/README.md) | [Next Day →](../day-80-secrets-management/README.md)

## Goal
Implement least-privilege IAM policies, permissions boundaries, and condition keys to enforce tight access controls across cloud identities and roles.

## Time
⏱️ Approximately 80 minutes

## Learn
- 📖 [IAM Security Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html) — AWS official documentation on applying least privilege, rotating access keys, and auditing roles.
- 📖 [IAM Permissions Boundaries](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_boundaries.html) — AWS guide on setting maximum permissions limits for users and service roles.

## Do
In this lab, you will write fine-grained IAM policies, test them against policy evaluation logic, implement an IAM permissions boundary, and attach it to a restricted developer role.

1. **Create a permission boundary policy file**:
   A permissions boundary sets the maximum possible permissions that an identity-based policy can grant:
   ```bash
   cat <<EOF > boundary-policy.json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowS3AndCloudWatchOnly",
         "Effect": "Allow",
         "Action": [
           "s3:*",
           "logs:*",
           "cloudwatch:*"
         ],
         "Resource": "*"
       },
       {
         "Sid": "DenyIAMChanges",
         "Effect": "Deny",
         "Action": [
           "iam:*"
         ],
         "Resource": "*"
       }
     ]
   }
   EOF
   ```

2. **Publish the boundary policy to AWS**:
   ```bash
   aws iam create-policy \
     --policy-name AppDevPermissionsBoundary \
     --policy-document file://boundary-policy.json
   ```

3. **Create a fine-grained least-privilege access policy**:
   This policy allows access only to a specific DynamoDB table and S3 bucket prefix under conditional circumstances:
   ```bash
   cat <<EOF > developer-least-privilege.json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "ReadOnlySpecificS3Bucket",
         "Effect": "Allow",
         "Action": [
           "s3:ListBucket",
           "s3:GetObject"
         ],
         "Resource": [
           "arn:aws:s3:::company-app-assets",
           "arn:aws:s3:::company-app-assets/*"
         ]
       },
       {
         "Sid": "RequireSecureTransport",
         "Effect": "Deny",
         "Action": "s3:*",
         "Resource": "*",
         "Condition": {
           "Bool": {
             "aws:SecureTransport": "false"
           }
         }
       }
     ]
   }
   EOF

   aws iam create-policy \
     --policy-name AppDevRestrictedPolicy \
     --policy-document file://developer-least-privilege.json
   ```

4. **Create a developer user with the permissions boundary attached**:
   ```bash
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   BOUNDARY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/AppDevPermissionsBoundary"
   POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/AppDevRestrictedPolicy"

   aws iam create-user \
     --user-name dev-security-tester \
     --permissions-boundary "$BOUNDARY_ARN"

   aws iam attach-user-policy \
     --user-name dev-security-tester \
     --policy-arn "$POLICY_ARN"
   ```

5. **Simulate policy evaluation with AWS Policy Simulator CLI**:
   Verify that unauthorized actions (such as `s3:DeleteBucket` or `ec2:RunInstances`) are denied:
   ```bash
   aws iam simulate-principal-policy \
     --policy-source-arn "arn:aws:iam::${ACCOUNT_ID}:user/dev-security-tester" \
     --action-names s3:GetObject ec2:RunInstances iam:CreateUser \
     --resource-arns "arn:aws:s3:::company-app-assets/index.html"
   ```
   Examine the evaluation result: `s3:GetObject` should evaluate to `allowed`, while `ec2:RunInstances` and `iam:CreateUser` evaluate to `implicitDeny` or `explicitDeny`.

6. **Audit IAM credentials report**:
   Generate and inspect an IAM credentials report to identify unused keys and missing MFA:
   ```bash
   aws iam generate-credential-report
   sleep 3
   aws iam get-credential-report --query Content --output text | base64 -d | head -n 5
   ```

## Done When
- [ ] Permissions boundary policy `AppDevPermissionsBoundary` is created.
- [ ] Least-privilege policy `AppDevRestrictedPolicy` is created.
- [ ] IAM user `dev-security-tester` exists with boundary and policy attached.
- [ ] Policy simulator tests confirm `s3:GetObject` is allowed while unauthorized actions are denied.
- [ ] IAM credential report is generated and inspected.

## Cost and Cleanup
Expected Cost: **$0.00** — IAM policies, users, boundaries, and simulator tools are completely free.

Tear down all created resources:
```bash
# Detach policy and remove user
aws iam detach-user-policy --user-name dev-security-tester --policy-arn "$POLICY_ARN"
aws iam delete-user-permissions-boundary --user-name dev-security-tester
aws iam delete-user --user-name dev-security-tester

# Delete policies
aws iam delete-policy --policy-arn "$POLICY_ARN"
aws iam delete-policy --policy-arn "$BOUNDARY_ARN"

# Clean up local JSON files
rm -f boundary-policy.json developer-least-privilege.json
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| IAM Least Privilege Policy | Azure Custom Role Definition (RBAC) | GCP Custom IAM Role |
| Permissions Boundary | Azure Policy with Deny action / Management Group boundary | GCP IAM Deny Policy / Organization Policy |
| IAM Policy Simulator | Azure `what-if` / Role assignment inspection | GCP Policy Simulator (`gcloud policy-intelligence`) |
| IAM Credential Report | Microsoft Entra ID Identity Protection / Credential Audit | GCP IAM Recommender & Audit Logs |

- 📖 [Azure Role-Based Access Control Overview](https://learn.microsoft.com/en-us/azure/role-based-access-control/overview)
- 📖 [Google Cloud IAM Documentation](https://cloud.google.com/iam/docs/overview)

## Stretch Goal
Add an IP restriction condition key (`aws:SourceIp`) or an MFA condition (`aws:MultiFactorAuthPresent`) to your policy statement, and re-run the `simulate-principal-policy` command providing context keys with `--context-entries` to test conditional authorization.

## Common Mistakes
- **Confusing Permissions Boundaries with Identity Policies**: A permissions boundary alone grants zero permissions; it only defines the *maximum* permissions that identity policies can grant.
- **Overusing wildcards (`*`) in actions and resources**: Writing `"Action": "*"` or `"Resource": "*"` violates least privilege and exposes infrastructure to accidental or malicious modification.
- **Leaving permanent access keys without rotation**: Production services should assume IAM roles via STS; human users should authenticate through SSO/identity providers.
