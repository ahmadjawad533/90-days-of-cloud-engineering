# Day 86: Capstone Infrastructure Code
[← Previous Day](../day-85-capstone-architecture/README.md) | [Next Day →](../day-87-capstone-app-deployment/README.md)

## Goal
Author modular, production-ready Terraform code to provision the VPC, subnets, security groups, RDS PostgreSQL, and ECS Fargate cluster for the capstone application.

## Time
⏱️ Approximately 100 minutes

## Learn
- 📖 [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) — Official provider reference for VPC, Subnet, RDS, and ECS resources.
- 📖 [AWS Reference Architecture: ECS Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html) — AWS developer guide on serverless container execution with Fargate.

## Do
In today's milestone, you will write the reusable Terraform modules and root configuration that provision all foundational AWS infrastructure for the Capstone Task Manager.

1. **Author the VPC & Networking Module**:
   Create `terraform/modules/vpc/main.tf` in your capstone repository:
   ```bash
   cd "$HOME/cloud-native-task-manager"
   cat <<'EOF' > terraform/modules/vpc/main.tf
   resource "aws_vpc" "main" {
     cidr_block           = var.vpc_cidr
     enable_dns_support   = true
     enable_dns_hostnames = true

     tags = {
       Name        = "${var.project_name}-vpc"
       Environment = var.environment
       ManagedBy   = "terraform"
     }
   }

   resource "aws_subnet" "public" {
     count                   = length(var.public_subnet_cidrs)
     vpc_id                  = aws_vpc.main.id
     cidr_block              = var.public_subnet_cidrs[count.index]
     availability_zone       = var.availability_zones[count.index]
     map_public_ip_on_launch = true

     tags = {
       Name        = "${var.project_name}-public-subnet-${count.index + 1}"
       Environment = var.environment
     }
   }

   resource "aws_subnet" "private_app" {
     count             = length(var.private_subnet_cidrs)
     vpc_id            = aws_vpc.main.id
     cidr_block        = var.private_subnet_cidrs[count.index]
     availability_zone = var.availability_zones[count.index]

     tags = {
       Name        = "${var.project_name}-private-app-subnet-${count.index + 1}"
       Environment = var.environment
     }
   }

   resource "aws_internet_gateway" "gw" {
     vpc_id = aws_vpc.main.id

     tags = {
       Name = "${var.project_name}-igw"
     }
   }

   resource "aws_route_table" "public" {
     vpc_id = aws_vpc.main.id

     route {
       cidr_block = "0.0.0.0/0"
       gateway_id = aws_internet_gateway.gw.id
     }

     tags = {
       Name = "${var.project_name}-public-rt"
     }
   }

   resource "aws_route_table_association" "public" {
     count          = length(aws_subnet.public)
     subnet_id      = aws_subnet.public[count.index].id
     route_table_id = aws_route_table.public.id
   }
   EOF

   cat <<'EOF' > terraform/modules/vpc/variables.tf
   variable "project_name" { type = string }
   variable "environment" { type = string }
   variable "vpc_cidr" { type = string }
   variable "public_subnet_cidrs" { type = list(string) }
   variable "private_subnet_cidrs" { type = list(string) }
   variable "availability_zones" { type = list(string) }
   EOF

   cat <<'EOF' > terraform/modules/vpc/outputs.tf
   output "vpc_id" { value = aws_vpc.main.id }
   output "public_subnet_ids" { value = aws_subnet.public[*].id }
   output "private_subnet_ids" { value = aws_subnet.private_app[*].id }
   EOF
   ```

2. **Author the Security Groups Module**:
   Create `terraform/modules/security_groups/main.tf`:
   ```bash
   cat <<'EOF' > terraform/modules/security_groups/main.tf
   resource "aws_security_group" "alb" {
     name        = "${var.project_name}-alb-sg"
     description = "Allow inbound HTTP to ALB"
     vpc_id      = var.vpc_id

     ingress {
       description = "HTTP from Internet"
       from_port   = 80
       to_port     = 80
       protocol    = "tcp"
       cidr_blocks = ["0.0.0.0/0"]
     }

     egress {
       from_port   = 0
       to_port     = 0
       protocol    = "-1"
       cidr_blocks = ["0.0.0.0/0"]
     }
   }

   resource "aws_security_group" "ecs" {
     name        = "${var.project_name}-ecs-tasks-sg"
     description = "Allow inbound traffic from ALB only"
     vpc_id      = var.vpc_id

     ingress {
       description     = "Traffic from ALB"
       from_port       = 5000
       to_port         = 5000
       protocol        = "tcp"
       security_groups = [aws_security_group.alb.id]
     }

     egress {
       from_port   = 0
       to_port     = 0
       protocol    = "-1"
       cidr_blocks = ["0.0.0.0/0"]
     }
   }
   EOF

   cat <<'EOF' > terraform/modules/security_groups/variables.tf
   variable "project_name" { type = string }
   variable "vpc_id" { type = string }
   EOF

   cat <<'EOF' > terraform/modules/security_groups/outputs.tf
   output "alb_sg_id" { value = aws_security_group.alb.id }
   output "ecs_sg_id" { value = aws_security_group.ecs.id }
   EOF
   ```

3. **Author the Root Terraform Configuration**:
   Create `terraform/main.tf`:
   ```bash
   cat <<'EOF' > terraform/main.tf
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
     region = var.aws_region
     default_tags {
       tags = {
         Project     = var.project_name
         Environment = var.environment
         ManagedBy   = "terraform"
       }
     }
   }

   module "vpc" {
     source               = "./modules/vpc"
     project_name         = var.project_name
     environment          = var.environment
     vpc_cidr             = "10.0.0.0/16"
     public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
     private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24"]
     availability_zones   = ["${var.aws_region}a", "${var.aws_region}b"]
   }

   module "security_groups" {
     source       = "./modules/security_groups"
     project_name = var.project_name
     vpc_id       = module.vpc.vpc_id
   }

   # ECS Cluster
   resource "aws_ecs_cluster" "main" {
     name = "${var.project_name}-cluster"
   }
   EOF

   cat <<'EOF' > terraform/variables.tf
   variable "aws_region" {
     type    = string
     default = "us-east-1"
   }

   variable "project_name" {
     type    = string
     default = "cloud-task-manager"
   }

   variable "environment" {
     type    = string
     default = "production"
   }
   EOF

   cat <<'EOF' > terraform/outputs.tf
   output "vpc_id" {
     value = module.vpc.vpc_id
   }

   output "ecs_cluster_name" {
     value = aws_ecs_cluster.main.name
   }
   EOF
   ```

4. **Validate and Format Terraform Configurations**:
   Run format and validation checks:
   ```bash
   cd "$HOME/cloud-native-task-manager/terraform"
   terraform fmt -recursive
   terraform init -backend=false
   terraform validate
   ```

5. **Commit the Infrastructure Code**:
   ```bash
   cd "$HOME/cloud-native-task-manager"
   git add terraform/
   git commit -m "feat: terraform modules for vpc, security groups, and ecs cluster"
   ```

## Done When
- [ ] VPC module is created with public and private subnets across multiple AZs.
- [ ] Security groups module restricts container ingress strictly to ALB traffic.
- [ ] Root configuration initializes and validates successfully with `terraform validate`.
- [ ] Code is formatted with `terraform fmt` and committed to git.

## Cost and Cleanup
Expected Cost: **$0.00** — Validating Terraform configuration offline (`-backend=false`) provisions no live resources.

No teardown required today. Keep Terraform files ready for deployment on Day 87.

## Stretch Goal
Add an Amazon S3 backend with DynamoDB state locking to `terraform/main.tf` and parameterize CIDR blocks and task CPU/Memory allocations via `terraform.tfvars.example`.

## Common Mistakes
- **Hardcoding AWS account IDs or regions**: Always use dynamic variables or data sources (`aws_caller_identity`, `aws_region`) so code runs across any AWS account.
- **Allowing unrestricted ingress to private containers**: Never expose port 5000 to `0.0.0.0/0`. Ingress must be restricted exclusively to the ALB's security group ID.
- **Forgetting `terraform fmt`**: Always run `terraform fmt -recursive` to maintain clean formatting and avoid CI linting failures.
