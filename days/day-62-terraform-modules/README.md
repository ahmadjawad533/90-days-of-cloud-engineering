# Day 62: Terraform Modules
[← Previous Day](../day-61-terraform-state/README.md) | [Next Day →](../day-63-rebuild-vpc-terraform/README.md)

## Goal
Structure infrastructure code into reusable, modular building blocks by designing a custom VPC module and consuming it across environments.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Terraform Modules Documentation](https://developer.hashicorp.com/terraform/language/modules) — Standard module structure, input arguments, output values, and module calling conventions.
- 📖 [Terraform Registry Modules](https://registry.terraform.io/) — Exploring verified community and vendor modules for enterprise architecture.

## Do
1. **Understand Terraform Modules**:
   - A module is simply a container for multiple resources used together.
   - Every Terraform configuration has at least one module (the **root module**, consisting of the `.tf` files in your main directory).
   - A **child module** is called from another configuration using a `module` block:
     ```hcl
     module "my_vpc" {
       source = "./modules/vpc"
       # module inputs...
     }
     ```
   - Standard Module Structure:
     - `main.tf`: Core resource definitions.
     - `variables.tf`: Module inputs with descriptions and sensible defaults.
     - `outputs.tf`: Return values exposed to callers.
     - `README.md`: Documentation for module consumers.

2. **Inspect the Custom VPC Module in `labs/terraform/modules/vpc/`**:
   Examine the modular files prepared in the repository:
   ```bash
   cd "/home/jawad/90 Days of Cloud Engineering/labs/terraform/modules/vpc"
   cat main.tf
   cat variables.tf
   cat outputs.tf
   ```
   Notice how `main.tf` defines the `aws_vpc` and conditionally provisions an `aws_internet_gateway` based on `var.create_igw`.

3. **Create an Environment Calling the Child Module**:
   Navigate to a test environment directory and instantiate the module:
   ```bash
   mkdir -p ~/terraform-module-demo && cd ~/terraform-module-demo

   cat << 'EOF' > main.tf
   terraform {
     required_version = ">= 1.5.0"
     required_providers {
       aws = {
         source  = "hashicorp/aws"
         version = "~> 5.0"
       }
     }
   }

   provider "aws" {
     region = "us-east-1"
   }

   # Call module for Development environment
   module "dev_vpc" {
     source     = "/home/jawad/90 Days of Cloud Engineering/labs/terraform/modules/vpc"
     name       = "dev-modular-vpc"
     cidr_block = "10.100.0.0/16"
     create_igw = true

     tags = {
       Environment = "dev"
       Team        = "Platform"
     }
   }

   # Expose output from child module
   output "dev_vpc_id" {
     description = "ID of dev VPC from module"
     value       = module.dev_vpc.vpc_id
   }

   output "dev_igw_id" {
     description = "ID of dev Internet Gateway from module"
     value       = module.dev_vpc.internet_gateway_id
   }
   EOF
   ```

4. **Initialize with Modules**:
   Whenever you add or change child module sources, you must run `terraform init`:
   ```bash
   terraform init
   ```
   Notice Terraform's output: `Initializing modules: - dev_vpc in ...`.

5. **Plan and Validate**:
   ```bash
   terraform validate
   terraform plan
   ```
   Review the execution plan: Terraform prefixes resources from the module with `module.dev_vpc.aws_vpc.this`.

6. **Apply and Verify**:
   ```bash
   terraform apply -auto-approve
   terraform output
   ```

7. **Clean Up**:
   ```bash
   terraform destroy -auto-approve
   cd ~ && rm -rf ~/terraform-module-demo
   ```

## Done When
- [ ] Understand the role of root modules versus child modules.
- [ ] Inspected the standard three-file module structure (`main.tf`, `variables.tf`, `outputs.tf`).
- [ ] Called a child module passing required inputs and tags.
- [ ] Successfully queried outputs exposed from a child module.
- [ ] Teardown completed cleanly.

## Cost and Cleanup
AWS VPCs and Internet Gateways carry no hourly charges.
Expected cost: **$0.00**.

Always ensure resources are destroyed:
```bash
terraform destroy -auto-approve
```

## Stretch Goal
Extend the VPC module in `labs/terraform/modules/vpc/`:
Add an input variable `public_subnet_cidrs = list(string)` and use the `for_each` or `count` meta-argument to automatically create public subnets within the VPC module.

## Common Mistakes
- **Accessing module internal resources directly**: You cannot access `module.dev_vpc.aws_vpc.this.id` unless the module author explicitly exposes `vpc_id` in `modules/vpc/outputs.tf`. Always access module data through module outputs.
- **Forgetting to re-run `terraform init` after adding a module**: Terraform downloads and indexes child modules during initialization. If you add a new `module` block and run `terraform plan`, it will fail until you run `terraform init`.
- **Hardcoding values inside child modules**: Never hardcode region names, CIDR blocks, or environment tags inside reusable modules. Always parameterize them as input variables.
