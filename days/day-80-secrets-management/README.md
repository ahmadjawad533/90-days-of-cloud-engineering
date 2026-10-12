# Day 80: Secrets Management
[← Previous Day](../day-79-iam-least-privilege/README.md) | [Next Day →](../day-81-container-scanning/README.md)

## Goal
Securely store, retrieve, and automatically rotate sensitive credentials using AWS Secrets Manager and AWS Systems Manager Parameter Store.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [AWS Secrets Manager User Guide](https://docs.aws.amazon.com/secretsmanager/latest/userguide/) — Official guide for creating, retrieving, and automating secret lifecycle and rotation.
- 📖 [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) — Documentation on standard vs. secure string parameters for configuration management.

## Do
In this lab, you will store encrypted configuration parameters in SSM Parameter Store, create an encrypted JSON database credential secret in AWS Secrets Manager, and fetch secrets programmatically using the AWS CLI and Python.

1. **Store application configuration in SSM Parameter Store**:
   Save non-sensitive and encrypted sensitive application configuration values:
   ```bash
   # Store standard string parameter
   aws ssm put-parameter \
     --name "/app/production/database/host" \
     --value "postgres-db.internal.production" \
     --type "String" \
     --overwrite

   # Store encrypted SecureString parameter (encrypted with default KMS key)
   aws ssm put-parameter \
     --name "/app/production/database/api_key" \
     --value "sk-prod-9876543210abcdef" \
     --type "SecureString" \
     --overwrite
   ```

2. **Retrieve decrypted parameter using AWS CLI**:
   Verify you can read and decrypt the secure parameter:
   ```bash
   aws ssm get-parameter \
     --name "/app/production/database/api_key" \
     --with-decryption \
     --query "Parameter.Value" \
     --output text
   ```

3. **Store a multi-key credential in AWS Secrets Manager**:
   Create a secret representing production database credentials:
   ```bash
   aws secretsmanager create-secret \
     --name "prod/taskmanager/rds" \
     --description "Production database credentials for Task Manager backend" \
     --secret-string '{"username":"dbadmin","password":"SuperSecretP@ssw0rd!2026","engine":"postgres","port":5432}'
   ```

4. **Retrieve and parse the secret using AWS CLI**:
   ```bash
   aws secretsmanager get-secret-value \
     --secret-id "prod/taskmanager/rds" \
     --query "SecretString" \
     --output text | jq .
   ```

5. **Access the secret using Python and boto3**:
   Create a test script `retrieve_secret.py`:
   ```python
   import json
   import boto3
   from botocore.exceptions import ClientError

   def get_secret(secret_name, region_name="us-east-1"):
       session = boto3.session.Session()
       client = session.client(service_name="secretsmanager", region_name=region_name)
       try:
           response = client.get_secret_value(SecretId=secret_name)
           secret = json.loads(response["SecretString"])
           return secret
       except ClientError as e:
           print(f"Error retrieving secret: {e}")
           raise

   if __name__ == "__main__":
       secret_data = get_secret("prod/taskmanager/rds")
       print(f"Successfully retrieved credentials for user: {secret_data['username']}")
       print(f"Target DB Engine: {secret_data['engine']}")
   ```
   Run the Python script:
   ```bash
   python3 retrieve_secret.py
   ```

6. **Create an IAM policy granting least-privilege read access to the secret**:
   ```bash
   ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
   SECRET_ARN="arn:aws:secretsmanager:us-east-1:${ACCOUNT_ID}:secret:prod/taskmanager/rds-*"

   cat <<EOF > secret-read-policy.json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": "secretsmanager:GetSecretValue",
         "Resource": "${SECRET_ARN}"
       }
     ]
   }
   EOF

   aws iam create-policy \
     --policy-name TaskManagerSecretReadPolicy \
     --policy-document file://secret-read-policy.json
   ```

## Done When
- [ ] SSM parameters (Standard & SecureString) are stored and retrieved with `--with-decryption`.
- [ ] Multi-key secret `prod/taskmanager/rds` is stored in AWS Secrets Manager.
- [ ] Python script successfully queries and parses the secret via `boto3`.
- [ ] Least-privilege IAM policy `TaskManagerSecretReadPolicy` is created.

## Cost and Cleanup
Expected Cost: **~$0.01 or Free Tier** (AWS Secrets Manager offers a 30-day free trial for new secrets; otherwise $0.40/secret/month pro-rated to pennies for a few hours). SSM Parameter Store Standard parameters are free.

Clean up all parameters, secrets, and policies:
```bash
# Delete SSM parameters
aws ssm delete-parameter --name "/app/production/database/host"
aws ssm delete-parameter --name "/app/production/database/api_key"

# Delete Secrets Manager secret immediately without recovery window
aws secretsmanager delete-secret \
  --secret-id "prod/taskmanager/rds" \
  --force-delete-without-recovery

# Delete IAM policy
POLICY_ARN="arn:aws:iam::${ACCOUNT_ID}:policy/TaskManagerSecretReadPolicy"
aws iam delete-policy --policy-arn "$POLICY_ARN"

# Delete local files
rm -f retrieve_secret.py secret-read-policy.json
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| AWS Secrets Manager | Azure Key Vault Secrets | Google Cloud Secret Manager |
| SSM Parameter Store | Azure App Configuration | GCP Secret Manager / Runtime Config |
| AWS KMS Customer Managed Keys | Azure Key Vault Keys | Google Cloud KMS Keys |

- 📖 [Azure Key Vault Documentation](https://learn.microsoft.com/en-us/azure/key-vault/)
- 📖 [Google Cloud Secret Manager Overview](https://cloud.google.com/secret-manager/docs/overview)

## Stretch Goal
Configure automatic rotation using an AWS Lambda template for AWS Secrets Manager, or use Terraform to define the secret and inject its ARN into an Amazon ECS task execution environment variable.

## Common Mistakes
- **Hardcoding credentials in Git repos or Dockerfiles**: Never commit secrets to source control or bake them into image layers. Always fetch them at runtime from Secrets Manager or inject them via environment variables linked to secret stores.
- **Forgetting `--with-decryption` with SSM Parameter Store**: If you omit `--with-decryption`, AWS returns the encrypted ciphertext string instead of plaintext.
- **Using wide resource ARNs for Secrets**: Always scope IAM permissions to the exact secret ARN rather than `"Resource": "*"`.
