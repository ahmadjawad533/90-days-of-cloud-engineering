# Day 63: Rebuild Your VPC with Terraform
[← Previous Day](../day-62-terraform-modules/README.md) | [Next Day →](../day-64-intro-to-ansible/README.md)

## Goal
Rebuild the complete production-grade Three-Tier VPC architecture from Day 40 entirely as declarative Terraform Infrastructure as Code.

## Time
⏱️ Approximately 120 minutes

## Learn
- 📖 [AWS Provider: VPC Resources](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) — Official provider reference for subnets, route tables, Internet Gateways, NAT Gateways, and security groups.
- 📖 [Amazon VPC Architecture: Three-Tier Scenario](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Scenario2.html) — Multi-tier network architecture with public, application, and database subnet isolation.

## Do
In Day 40, you created a three-tier VPC using manual imperative AWS CLI commands. Today, you will codify that entire topology into clean, declarative HCL code.

```
                    Internet
                       │
               [Internet Gateway]
                       │
  ┌────────────────────┴────────────────────────────────┐
  │ Tier 1: Public Subnets (AZ-a & AZ-b)                │
  │   - Public Route Table (0.0.0.0/0 -> IGW)           │
  │   - [Application Load Balancer]  [NAT Gateway]      │
  └──────────────────────────────────────┬──────────────┘
                                         │
  ┌──────────────────────────────────────┴──────────────┐
  │ Tier 2: Private Application Subnets (AZ-a & AZ-b)   │
  │   - App Route Table (0.0.0.0/0 -> NAT Gateway)      │
  │   - [EC2 App Instances] (App SG)                    │
  └──────────────────────────────────────┬──────────────┘
                                         │ (Local only)
  ┌──────────────────────────────────────┴──────────────┐
  │ Tier 3: Isolated Database Subnets (AZ-a & AZ-b)     │
  │   - DB Route Table (Local VPC routing only)         │
  │   - [Amazon RDS Database] (DB SG)                   │
  └─────────────────────────────────────────────────────┘
```

1. **Set Up the Project Directory**:
   Create a dedicated workspace for the three-tier VPC rebuild:
   ```bash
   mkdir -p ~/three-tier-terraform && cd ~/three-tier-terraform
   ```

2. **Define Variables (`variables.tf`)**:
   ```bash
   cat << 'EOF' > variables.tf
   variable "aws_region" {
     type        = string
     default     = "us-east-1"
     description = "AWS region"
   }

   variable "vpc_cidr" {
     type        = string
     default     = "10.0.0.0/16"
     description = "VPC CIDR block"
   }

   variable "availability_zones" {
     type        = list(string)
     default     = ["us-east-1a", "us-east-1b"]
     description = "Target Availability Zones"
   }
   EOF
   ```

3. **Define the Infrastructure (`main.tf`)**:
   Create the full configuration including VPC, 6 subnets, IGW, NAT Gateway, route tables, and chained security groups:
   ```bash
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
     region = var.aws_region
   }

   # 1. VPC
   resource "aws_vpc" "main" {
     cidr_block           = var.vpc_cidr
     enable_dns_support   = true
     enable_dns_hostnames = true

     tags = {
       Name        = "three-tier-tf-vpc"
       Environment = "production"
       ManagedBy   = "Terraform"
     }
   }

   # 2. Internet Gateway
   resource "aws_internet_gateway" "igw" {
     vpc_id = aws_vpc.main.id

     tags = {
       Name = "three-tier-tf-igw"
     }
   }

   # 3. Subnets (2 Public, 2 Private App, 2 Isolated DB)
   resource "aws_subnet" "public_a" {
     vpc_id                  = aws_vpc.main.id
     cidr_block              = "10.0.1.0/24"
     availability_zone       = var.availability_zones[0]
     map_public_ip_on_launch = true

     tags = { Name = "pub-tier-1a" }
   }

   resource "aws_subnet" "public_b" {
     vpc_id                  = aws_vpc.main.id
     cidr_block              = "10.0.2.0/24"
     availability_zone       = var.availability_zones[1]
     map_public_ip_on_launch = true

     tags = { Name = "pub-tier-1b" }
   }

   resource "aws_subnet" "app_a" {
     vpc_id            = aws_vpc.main.id
     cidr_block        = "10.0.11.0/24"
     availability_zone = var.availability_zones[0]

     tags = { Name = "app-tier-1a" }
   }

   resource "aws_subnet" "app_b" {
     vpc_id            = aws_vpc.main.id
     cidr_block        = "10.0.12.0/24"
     availability_zone = var.availability_zones[1]

     tags = { Name = "app-tier-1b" }
   }

   resource "aws_subnet" "db_a" {
     vpc_id            = aws_vpc.main.id
     cidr_block        = "10.0.21.0/24"
     availability_zone = var.availability_zones[0]

     tags = { Name = "db-tier-1a" }
   }

   resource "aws_subnet" "db_b" {
     vpc_id            = aws_vpc.main.id
     cidr_block        = "10.0.22.0/24"
     availability_zone = var.availability_zones[1]

     tags = { Name = "db-tier-1b" }
   }

   # 4. Elastic IP & NAT Gateway (in Public Subnet A)
   resource "aws_eip" "nat" {
     domain = "vpc"
     tags   = { Name = "three-tier-tf-nat-eip" }
   }

   resource "aws_nat_gateway" "nat" {
     allocation_id = aws_eip.nat.id
     subnet_id     = aws_subnet.public_a.id

     tags       = { Name = "three-tier-tf-nat-gw" }
     depends_on = [aws_internet_gateway.igw]
   }

   # 5. Route Tables and Associations
   # Public Route Table -> IGW
   resource "aws_route_table" "public" {
     vpc_id = aws_vpc.main.id

     route {
       cidr_block = "0.0.0.0/0"
       gateway_id = aws_internet_gateway.igw.id
     }

     tags = { Name = "public-tier-rt" }
   }

   resource "aws_route_table_association" "pub_a" {
     subnet_id      = aws_subnet.public_a.id
     route_table_id = aws_route_table.public.id
   }

   resource "aws_route_table_association" "pub_b" {
     subnet_id      = aws_subnet.public_b.id
     route_table_id = aws_route_table.public.id
   }

   # App Route Table -> NAT Gateway
   resource "aws_route_table" "app" {
     vpc_id = aws_vpc.main.id

     route {
       cidr_block     = "0.0.0.0/0"
       nat_gateway_id = aws_nat_gateway.nat.id
     }

     tags = { Name = "app-tier-rt" }
   }

   resource "aws_route_table_association" "app_a" {
     subnet_id      = aws_subnet.app_a.id
     route_table_id = aws_route_table.app.id
   }

   resource "aws_route_table_association" "app_b" {
     subnet_id      = aws_subnet.app_b.id
     route_table_id = aws_route_table.app.id
   }

   # Database Route Table (Isolated - Local routing only)
   resource "aws_route_table" "db" {
     vpc_id = aws_vpc.main.id
     tags   = { Name = "db-tier-isolated-rt" }
   }

   resource "aws_route_table_association" "db_a" {
     subnet_id      = aws_subnet.db_a.id
     route_table_id = aws_route_table.db.id
   }

   resource "aws_route_table_association" "db_b" {
     subnet_id      = aws_subnet.db_b.id
     route_table_id = aws_route_table.db.id
   }

   # 6. Chained Security Groups
   # ALB Security Group
   resource "aws_security_group" "alb" {
     name        = "tf-alb-sg"
     description = "Internet-facing load balancer security group"
     vpc_id      = aws_vpc.main.id

     ingress {
       description = "HTTP from Internet"
       from_port   = 80
       to_port     = 80
       protocol    = "tcp"
       cidr_blocks = ["0.0.0.0/0"]
     }

     ingress {
       description = "HTTPS from Internet"
       from_port   = 443
       to_port     = 443
       protocol    = "tcp"
       cidr_blocks = ["0.0.0.0/0"]
     }

     egress {
       from_port   = 0
       to_port     = 0
       protocol    = "-1"
       cidr_blocks = ["0.0.0.0/0"]
     }

     tags = { Name = "tf-alb-sg" }
   }

   # App Tier Security Group (Only allows traffic from ALB SG)
   resource "aws_security_group" "app" {
     name        = "tf-app-sg"
     description = "App server security group"
     vpc_id      = aws_vpc.main.id

     ingress {
       description     = "App port from ALB SG only"
       from_port       = 8080
       to_port         = 8080
       protocol        = "tcp"
       security_groups = [aws_security_group.alb.id]
     }

     egress {
       from_port   = 0
       to_port     = 0
       protocol    = "-1"
       cidr_blocks = ["0.0.0.0/0"]
     }

     tags = { Name = "tf-app-sg" }
   }

   # Database Tier Security Group (Only allows traffic from App SG)
   resource "aws_security_group" "db" {
     name        = "tf-db-sg"
     description = "Isolated database security group"
     vpc_id      = aws_vpc.main.id

     ingress {
       description     = "PostgreSQL from App SG only"
       from_port       = 5432
       to_port         = 5432
       protocol        = "tcp"
       security_groups = [aws_security_group.app.id]
     }

     tags = { Name = "tf-db-sg" }
   }
   EOF
   ```

4. **Define Outputs (`outputs.tf`)**:
   ```bash
   cat << 'EOF' > outputs.tf
   output "vpc_id" {
     value = aws_vpc.main.id
   }

   output "public_subnet_ids" {
     value = [aws_subnet.public_a.id, aws_subnet.public_b.id]
   }

   output "app_subnet_ids" {
     value = [aws_subnet.app_a.id, aws_subnet.app_b.id]
   }

   output "db_subnet_ids" {
     value = [aws_subnet.db_a.id, aws_subnet.db_b.id]
   }

   output "nat_gateway_ip" {
     value = aws_eip.nat.public_ip
   }
   EOF
   ```

5. **Initialize, Validate, and Plan**:
   ```bash
   terraform init
   terraform validate
   terraform plan
   ```
   Notice that Terraform calculates the entire dependency graph automatically (VPC first, subnets and IGW next, EIP and NAT Gateway next, route table associations and chained security groups in exact dependency order).

6. **Apply the Full Three-Tier VPC**:
   ```bash
   terraform apply
   ```
   Watch Terraform provision all 17+ resources cleanly in 2-3 minutes.

7. **Verify via AWS CLI**:
   ```bash
   aws ec2 describe-subnets --filters "Name=vpc-id,Values=$(terraform output -raw vpc_id)" \
     --query "Subnets[*].[Tags[?Key=='Name'].Value|[0],CidrBlock,AvailabilityZone]" --output table
   ```

## Done When
- [ ] Terraform configuration validated with `terraform validate`.
- [ ] 6 subnets across 2 AZs provisioned via `terraform apply`.
- [ ] Internet Gateway and NAT Gateway attached and routed correctly.
- [ ] Chained security groups created (ALB -> App -> DB).
- [ ] All resources torn down cleanly with a single command.

## Cost and Cleanup
> [!IMPORTANT]
> The AWS NAT Gateway incurs an hourly cost (~$0.045/hour) and the allocated Elastic IP incurs costs when idle. Teardown immediately after verification. Total lab cost will be under **$0.02**.

Unlike the complex multi-step AWS CLI teardown script from Day 40, Terraform destroys the entire topology in reverse dependency order with one command:
```bash
terraform destroy -auto-approve
cd ~ && rm -rf ~/three-tier-terraform
```

## Azure / GCP Equivalents
| Architecture Layer | AWS (Terraform) | Azure (Terraform) | GCP (Terraform) |
|--------------------|-----------------|-------------------|-----------------|
| Ingress / Public Tier | `aws_vpc` + `aws_subnet` + `aws_internet_gateway` | `azurerm_virtual_network` + `azurerm_subnet` + `azurerm_public_ip` | `google_compute_network` + `google_compute_subnetwork` |
| Egress NAT | `aws_nat_gateway` + `aws_eip` | `azurerm_nat_gateway` + `azurerm_nat_gateway_public_ip_association` | `google_compute_router_nat` |
| Route Management | `aws_route_table` + `aws_route` | `azurerm_route_table` + `azurerm_route` | `google_compute_route` |
| Chained Isolation | `aws_security_group` | `azurerm_network_security_group` + `azurerm_application_security_group` | `google_compute_firewall` |

- 📖 [Terraform Azure Network Reference](https://learn.microsoft.com/en-us/azure/developer/terraform/)
- 📖 [Terraform Google Cloud Network Reference](https://cloud.google.com/docs/terraform)

## Stretch Goal
Refactor the subnets in `main.tf` to use Terraform's `for_each` meta-argument with a map of subnet configurations instead of declaring individual `aws_subnet` resources. Use Terraform's `cidrsubnet()` function to automatically calculate subnet CIDR ranges from `var.vpc_cidr`.

## Common Mistakes
- **Forgetting `depends_on = [aws_internet_gateway.igw]` on NAT Gateway**: If Terraform tries to create the NAT Gateway before the IGW is attached, the cloud API may reject the Elastic IP attachment.
- **Leaving the NAT Gateway running**: A forgotten NAT Gateway costs ~$32/month. Always run `terraform destroy` when your lab exercise is complete.
- **Security group circular dependencies**: Defining bidirectional cross-referencing inline rules between security groups can cause cycle errors in Terraform's dependency graph. Use separate `aws_security_group_rule` resources if bidirectional communication is required.
