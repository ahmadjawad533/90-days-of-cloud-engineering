# Terraform Cheatsheet

A concise, structured reference for HashiCorp Terraform / OpenTofu infrastructure-as-code workflows, HCL syntax, state management, and configuration patterns.

---

## Table of Contents
- [Core CLI Workflow](#core-cli-workflow)
- [Formatting, Linting & Validation](#formatting-linting--validation)
- [State Management Commands](#state-management-commands)
- [Workspaces](#workspaces)
- [Resource Import](#resource-import)
- [Outputs & Inspection](#outputs--inspection)
- [HCL Syntax & Core Blocks](#hcl-syntax--core-blocks)
- [Variable Types & Values](#variable-types--values)
- [Meta-Arguments & Common Patterns](#meta-arguments--common-patterns)
- [Backend Configurations](#backend-configurations)
- [Provider Configurations](#provider-configurations)

---

## Core CLI Workflow

The fundamental execution pipeline:

```bash
# 1. Initialization
terraform init                               # Download providers and configure backend
terraform init -upgrade                      # Upgrade provider plugins to latest allowed version
terraform init -reconfigure                  # Reconfigure backend ignoring cached settings
terraform init -migrate-state                # Migrate state when changing backend configuration

# 2. Execution Plan
terraform plan                               # Generate and print execution plan
terraform plan -out=tfplan                   # Save binary plan file to disk
terraform plan -var="environment=production" # Pass variable via command line
terraform plan -var-file="prod.tfvars"       # Load variables from specific file
terraform plan -target="aws_s3_bucket.main"  # Target a specific resource only (use sparingly)

# 3. Apply Infrastructure Changes
terraform apply                              # Plan and interactively prompt to apply
terraform apply -auto-approve                # Apply without interactive confirmation prompt
terraform apply tfplan                       # Apply exact pre-generated plan file

# 4. Teardown / Destroy
terraform destroy                            # Destroy all managed infrastructure
terraform destroy -auto-approve              # Destroy without interactive confirmation
terraform destroy -target="aws_instance.web" # Destroy only the targeted resource
```

---

## Formatting, Linting & Validation

Ensure syntactic correctness and consistent style:

```bash
terraform fmt                                # Canonical format all .tf files in current dir
terraform fmt -recursive                    # Format all .tf files across subdirectories
terraform fmt -check                         # Check formatting; exit non-zero if changes needed
terraform validate                           # Verify syntax and internal consistency of configuration
terraform validate -json                     # Output validation errors in structured JSON
```

---

## State Management Commands

Directly inspect and modify the Terraform state file (`terraform.tfstate`):

```bash
terraform state list                         # List all resources tracked in the state
terraform state show <address>               # Inspect full attributes of a specific resource
                                             # Example: terraform state show aws_s3_bucket.main

terraform state rm <address>                 # Stop tracking resource without destroying cloud asset
                                             # Example: terraform state rm aws_vpc.legacy

terraform state mv <source> <destination>    # Rename resource or move into a module without recreation
                                             # Example: terraform state mv aws_instance.web module.compute.aws_instance.web

terraform state pull                         # Print current remote state to stdout
terraform state push <file>                  # Overwrite remote state with local state file (DANGER)
terraform force-unlock <lock-id>             # Release stuck lock (e.g., in DynamoDB)
```

---

## Workspaces

Manage multiple state files within the same configuration directory (e.g. dev, staging, prod):

```bash
terraform workspace list                     # List all workspaces (* indicates active)
terraform workspace new staging              # Create and automatically switch to new workspace
terraform workspace select staging           # Switch active workspace
terraform workspace show                     # Display current active workspace name
terraform workspace delete staging           # Delete empty workspace
```

In HCL, reference the active workspace using the interpolation variable:
```hcl
locals {
  environment = terraform.workspace
}
```

---

## Resource Import

Bring existing cloud infrastructure under Terraform management:

### CLI Import (Classic)
```bash
# terraform import <resource_type>.<resource_name> <cloud_identifier>
terraform import aws_s3_bucket.backup my-existing-backup-bucket
terraform import aws_instance.server i-0123456789abcdef0
```

### Declarative Import Block (Terraform 1.5+)
```hcl
import {
  to = aws_s3_bucket.backup
  id = "my-existing-backup-bucket"
}

# Generate configuration automatically:
# terraform plan -generate-config-out=generated_bucket.tf
```

---

## Outputs & Inspection

Extract and view defined output variables:

```bash
terraform output                             # Print all outputs
terraform output vpc_id                      # Print specific output value
terraform output -raw private_key            # Output raw string without quotes or linebreaks
terraform output -json                       # Output all values formatted as JSON
terraform console                            # Launch interactive REPL for evaluating HCL expressions
terraform graph | dot -Tpng > graph.png      # Generate visual dependency graph (requires Graphviz)
```

---

## HCL Syntax & Core Blocks

### 1. Variables
```hcl
variable "instance_count" {
  description = "Number of EC2 instances to launch"
  type        = number
  default     = 2

  validation {
    condition     = var.instance_count > 0 && var.instance_count <= 10
    error_message = "instance_count must be between 1 and 10."
  }
}
```

### 2. Local Values
```hcl
locals {
  service_name = "billing-api"
  common_tags = {
    Project     = local.service_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
```

### 3. Data Sources (Read-Only queries)
```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}
```

### 4. Resources
```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  tags          = local.common_tags
}
```

### 5. Outputs
```hcl
output "instance_ip" {
  description = "Public IP address of web instance"
  value       = aws_instance.web.public_ip
  sensitive   = false
}
```

### 6. Modules
```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "prod-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  tags = local.common_tags
}
```

---

## Variable Types & Values

HCL supports primitive and complex structural types:

```hcl
# Primitives
variable "project"   { type = string }      # "my-project"
variable "retention" { type = number }      # 30
variable "enabled"   { type = bool }        # true / false

# Collections
variable "subnets"   { type = list(string) }       # ["subnet-1", "subnet-2"]
variable "az_set"    { type = set(string) }        # ["us-east-1a", "us-east-1b"]
variable "tags"      { type = map(string) }        # { env = "prod", owner = "infra" }

# Structural
variable "server_config" {
  type = object({
    name      = string
    port      = number
    is_public = bool
    ips       = list(string)
  })
}

variable "database_options" {
  type = tuple([string, number, bool]) # Exact order: ["postgres", 5432, true]
}
```

---

## Meta-Arguments & Common Patterns

### `count`
```hcl
resource "aws_instance" "server" {
  count         = 3
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  tags = {
    Name = "server-${count.index}"
  }
}
```

### `for_each`
```hcl
resource "aws_s3_bucket" "buckets" {
  for_each = toset(["assets", "logs", "backups"])
  bucket   = "mycompany-${each.key}-${var.environment}"
}
```

### `depends_on`
```hcl
resource "aws_s3_bucket_policy" "policy" {
  bucket     = aws_s3_bucket.buckets["logs"].id
  policy     = data.aws_iam_policy_document.bucket_policy.json
  depends_on = [aws_s3_bucket_public_access_block.logs_pab]
}
```

### `lifecycle`
```hcl
resource "aws_instance" "app" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  lifecycle {
    create_before_destroy = true
    prevent_destroy       = false
    ignore_changes = [
      tags["LastUpdated"],
    ]
  }
}
```

### `dynamic` Blocks
```hcl
resource "aws_security_group" "web" {
  name   = "allow-web"
  vpc_id = module.vpc.vpc_id

  dynamic "ingress" {
    for_each = [80, 443, 8080]
    content {
      description = "Allow inbound port ${ingress.value}"
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
}
```

---

## Backend Configurations

Store Terraform state remotely for team collaboration and state locking:

### AWS S3 with DynamoDB Locking
```hcl
terraform {
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket         = "mycompany-terraform-state-prod"
    key            = "vpc/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locks"
    encrypt        = true
  }
}
```

### Local Backend (Default)
```hcl
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
```

---

## Provider Configurations

Declare provider requirements and credentials:

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}

# Default provider
provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = "Production"
      ManagedBy   = "Terraform"
    }
  }
}

# Alternate provider alias (multi-region / multi-account)
provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

# Referencing provider alias in resource:
# resource "aws_s3_bucket" "dr" {
#   provider = aws.west
#   bucket   = "dr-replication-bucket"
# }
```
