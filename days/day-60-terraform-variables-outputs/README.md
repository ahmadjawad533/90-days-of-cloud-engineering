# Day 60: Terraform Variables and Outputs
[← Previous Day](../day-59-terraform-providers-resources/README.md) | [Next Day →](../day-61-terraform-state/README.md)

## Goal
Parameterize your Terraform infrastructure configurations using input variables, local values, variable validation, and expose infrastructure data using outputs.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Terraform Input Variables](https://developer.hashicorp.com/terraform/language/values/variables) — Type constraints, default values, descriptions, and variable definition files (`terraform.tfvars`).
- 📖 [Terraform Output Values](https://developer.hashicorp.com/terraform/language/values/outputs) — Exposing resource attributes, sensitive outputs, and querying outputs via the CLI.

## Do
1. **Understand Variable Types and Precedence**:
   Terraform supports standard types:
   - Primitive types: `string`, `number`, `bool`.
   - Complex collection types: `list(string)`, `map(string)`, `set(string)`, `object({...})`.

   Variable precedence order (from lowest to highest):
   1. Default value in `variables.tf`.
   2. Environment variables (`TF_VAR_<variable_name>`).
   3. `terraform.tfvars` file.
   4. `*.auto.tfvars` files.
   5. Command-line flags (`-var "name=value"` or `-var-file="custom.tfvars"`).

2. **Inspect Existing Variable and Output Declarations**:
   Examine the files in `labs/terraform/`:
   ```bash
   cd "/home/jawad/90 Days of Cloud Engineering/labs/terraform"
   cat variables.tf
   cat outputs.tf
   ```

3. **Create a `terraform.tfvars` File**:
   Create a local variable values file to customize the VPC configuration without altering the underlying code:
   ```bash
   cat << 'EOF' > terraform.tfvars
   aws_region  = "us-east-1"
   vpc_name    = "dev-custom-vpc"
   vpc_cidr    = "10.50.0.0/16"
   environment = "development"
   EOF
   ```

4. **Add Variable Validation**:
   Open `variables.tf` or observe how variable validation blocks enforce CIDR rules before executing API calls:
   ```hcl
   variable "vpc_cidr" {
     description = "CIDR block for the VPC"
     type        = string
     default     = "10.0.0.0/16"

     validation {
       condition     = can(cidrnetmask(var.vpc_cidr))
       error_message = "The vpc_cidr variable must be a valid CIDR notation string."
     }
   }
   ```

5. **Test Variable Overrides with `plan`**:
   Execute `terraform plan` using your `.tfvars` file:
   ```bash
   terraform plan
   ```
   Notice that the planned VPC CIDR is `10.50.0.0/16` and the Name tag is `dev-custom-vpc`.

6. **Test CLI Variable Overrides**:
   Override a variable dynamically at runtime:
   ```bash
   terraform plan -var="environment=staging" -var="vpc_name=staging-vpc"
   ```

7. **Apply and Query Terraform Outputs**:
   Apply the configuration to provision the VPC:
   ```bash
   terraform apply -auto-approve
   ```
   Query the generated outputs:
   ```bash
   terraform output
   terraform output vpc_id
   terraform output -raw vpc_id
   terraform output -json
   ```

8. **Clean Up**:
   ```bash
   terraform destroy -auto-approve
   rm -f terraform.tfvars
   ```

## Done When
- [ ] Created and configured a `terraform.tfvars` file.
- [ ] Successfully applied configurations using variable parameterization.
- [ ] Queried outputs using `terraform output` in plain, raw, and JSON formats.
- [ ] Successfully destroyed provisioned test resources.

## Cost and Cleanup
AWS VPCs are free of charge. Expected cost: **$0.00**.

Ensure teardown has completed:
```bash
terraform destroy -auto-approve
```

## Stretch Goal
Explore Terraform **Local Values** (`locals { ... }`).
Define a local map of standard tags that combines the `environment` variable, cost center, and project name:
```hcl
locals {
  common_tags = {
    Environment = var.environment
    ManagedBy   = "Terraform"
    Project     = "90DaysOfCloud"
  }
}
```
Update `main.tf` to use `tags = local.common_tags`.

## Common Mistakes
- **Committing secret variables to Git**: Never commit `.tfvars` files containing passwords, API tokens, or private keys to version control. Always include `*.tfvars` in your `.gitignore` and use environment variables or secret managers instead.
- **Confusion between `variables.tf` and `terraform.tfvars`**: `variables.tf` declares the schema and types (like a variable declaration), while `terraform.tfvars` supplies the actual runtime values.
- **Missing type constraints on variables**: Omitting `type = string` or `type = list(string)` leads to subtle type coercion bugs that are harder to debug.
