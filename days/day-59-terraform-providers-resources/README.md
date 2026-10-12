# Day 59: Terraform Providers and Resources
[← Previous Day](../day-58-terraform-basics/README.md) | [Next Day →](../day-60-terraform-variables-outputs/README.md)

## Goal
Configure the official AWS provider and declare core cloud networking resources including an Amazon Virtual Private Cloud (VPC) using HashiCorp Configuration Language (HCL).

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) — Official provider reference for authentication, configuration, and supported AWS resources.
- 📖 [Terraform Language: Resources & Providers](https://developer.hashicorp.com/terraform/language) — Syntax and concepts for provider blocks, resource declarations, and meta-arguments.

## Do
1. **Understand Providers and Resource Blocks**:
   - **Provider**: A plugin that Terraform uses to translate HCL resource declarations into target cloud API calls (e.g., `hashicorp/aws`, `hashicorp/azurerm`, `hashicorp/google`).
   - **Resource Block**: The core declarative building block with the syntax `resource "<TYPE>" "<LOCAL_NAME>" { ... }`.
     - `<TYPE>`: The resource type defined by the provider (e.g., `aws_vpc`, `aws_subnet`).
     - `<LOCAL_NAME>`: A local label used inside Terraform to reference this specific resource (e.g., `main`).

2. **Inspect the Lab Architecture in `labs/terraform/`**:
   View the pre-configured Terraform configuration in `labs/terraform/main.tf`:
   ```bash
   cd "/home/jawad/90 Days of Cloud Engineering/labs/terraform"
   cat main.tf
   ```

3. **Verify AWS Credentials**:
   Ensure your local terminal has active AWS credentials configured from Day 32:
   ```bash
   aws sts get-caller-identity
   ```

4. **Initialize the AWS Provider**:
   Run initialization to download the AWS provider plugin into `.terraform`:
   ```bash
   terraform init
   ```

5. **Format and Validate Code**:
   Check formatting and validate syntax against the AWS provider schema:
   ```bash
   terraform fmt -check
   terraform validate
   ```

6. **Generate Execution Plan**:
   ```bash
   terraform plan
   ```
   Examine the plan output: notice how Terraform details the default VPC attributes (DNS support, DNS hostnames, CIDR block) that will be configured.

7. **Apply Configuration to AWS**:
   ```bash
   terraform apply
   ```
   Type `yes` when prompted (or pass `-auto-approve` in automated pipelines).

8. **Verify VPC in AWS Using CLI**:
   ```bash
   aws ec2 describe-vpcs --filters "Name=tag:ManagedBy,Values=Terraform" \
     --query "Vpcs[*].[VpcId,CidrBlock,Tags[?Key=='Name'].Value|[0]]" --output table
   ```

9. **Tear Down AWS Resources**:
   Destroy the created VPC to avoid leaving running test resources:
   ```bash
   terraform destroy -auto-approve
   ```

## Done When
- [ ] AWS provider initialized properly with `terraform init`.
- [ ] Code passed syntax validation using `terraform validate`.
- [ ] VPC created in AWS account via `terraform apply`.
- [ ] VPC verified using AWS CLI `aws ec2 describe-vpcs`.
- [ ] VPC cleanly destroyed with `terraform destroy`.

## Cost and Cleanup
AWS VPCs are free of charge. No compute or gateways were provisioned in this lab.
Expected cost: **$0.00**.

Always verify that `terraform destroy` has been executed:
```bash
terraform destroy -auto-approve
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Provider: `hashicorp/aws` | Provider: `hashicorp/azurerm` | Provider: `hashicorp/google` |
| Resource: `aws_vpc` | Resource: `azurerm_virtual_network` | Resource: `google_compute_network` |
| Resource: `aws_subnet` | Resource: `azurerm_subnet` | Resource: `google_compute_subnetwork` |
| Resource: `aws_security_group` | Resource: `azurerm_network_security_group` | Resource: `google_compute_firewall` |

- 📖 [Terraform on Azure Documentation](https://learn.microsoft.com/en-us/azure/developer/terraform/)
- 📖 [Terraform on Google Cloud Documentation](https://cloud.google.com/docs/terraform)

## Stretch Goal
Add an `aws_internet_gateway` resource to your `main.tf` and reference the VPC using Terraform's internal dependency syntax:
```hcl
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "terraform-lab-igw"
  }
}
```
Run `terraform plan` to see how Terraform automatically resolves the resource dependency graph.

## Common Mistakes
- **Hardcoding credentials in provider blocks**: Never place `access_key` or `secret_key` inside `.tf` files. Always let the AWS provider infer credentials from standard environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) or the AWS credentials file (`~/.aws/credentials`).
- **Missing provider version pinning**: Failing to constrain the provider version with `~>` in `required_providers` can allow breaking provider updates to alter your infrastructure during future `init` runs.
- **Forgetting that resource names must be unique within a type**: You cannot have two `resource "aws_vpc" "main"` blocks in the same directory. Local identifiers must be distinct.
