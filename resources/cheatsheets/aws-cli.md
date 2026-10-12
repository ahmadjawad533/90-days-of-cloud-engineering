# AWS CLI Cheatsheet

A comprehensive quick-reference guide for Amazon Web Services CLI v2, covering core services, query expressions, administration, and automation patterns.

---

## Table of Contents
- [CLI Configuration & Authentication](#cli-configuration--authentication)
- [Common Global Flags](#common-global-flags)
- [JMESPath Query Expressions](#jmespath-query-expressions)
- [Identity & Access Management (IAM)](#identity--access-management-iam)
- [Elastic Compute Cloud (EC2)](#elastic-compute-cloud-ec2)
- [Virtual Private Cloud (VPC) & Networking](#virtual-private-cloud-vpc--networking)
- [Simple Storage Service (S3) & S3API](#simple-storage-service-s3--s3api)
- [Relational Database Service (RDS)](#relational-database-service-rds)
- [Amazon CloudWatch](#amazon-cloudwatch)
- [Containers (ECS & EKS)](#containers-ecs--eks)
- [AWS Lambda](#aws-lambda)

---

## CLI Configuration & Authentication

Set up credentials, configuration profiles, and verify identity:

```bash
# Interactive setup
aws configure                                # Configure default profile (Access Key, Secret, Region, Output)
aws configure --profile production           # Configure specific named profile

# Inspection
aws configure list                           # List current credentials source and active profile
aws configure list-profiles                  # List all configured profiles
cat ~/.aws/credentials                       # View stored API access keys
cat ~/.aws/config                            # View stored regions and output formats

# Identity verification (STS)
aws sts get-caller-identity                  # Print current Account ID, User ARN, and User ID
aws sts get-caller-identity --profile prod   # Verify credentials for named profile

# Temporary credentials via AssumeRole
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/DeployRole \
  --role-session-name CLI-Session
```

---

## Common Global Flags

Control AWS CLI behavior across all service commands:

| Flag | Purpose | Example |
| :--- | :--- | :--- |
| `--region <region>` | Target specific AWS region | `aws ec2 describe-instances --region us-east-1` |
| `--profile <name>` | Use credentials from a specific profile | `aws s3 ls --profile production` |
| `--output <format>` | Output format (`json`, `text`, `table`, `yaml`) | `aws iam list-users --output table` |
| `--query <expression>` | Filter and format output client-side with JMESPath | `aws s3api list-buckets --query "Buckets[].Name"` |
| `--filters <Name=k,Values=v>` | Server-side resource filtering | `aws ec2 describe-instances --filters "Name=instance-state-name,Values=running"` |
| `--dry-run` | Checks whether you have permissions without executing | `aws ec2 run-instances --dry-run ...` |
| `--no-cli-pager` | Disable default terminal pager (`less`) | `aws ec2 describe-vpcs --no-cli-pager` |

---

## JMESPath Query Expressions

AWS CLI uses JMESPath syntax (`--query`) for client-side filtering and data extraction:

```bash
# 1. Extract array of specific scalar values
aws s3api list-buckets --query "Buckets[].Name" --output text

# 2. Extract specific fields from nested arrays as a structured table
aws ec2 describe-instances --query \
  "Reservations[].Instances[].[InstanceId, InstanceType, State.Name, PublicIpAddress]" \
  --output table

# 3. Filter list by condition (e.g. running instances only)
aws ec2 describe-instances --query \
  "Reservations[].Instances[?State.Name=='running'].[InstanceId, Tags[?Key=='Name'].Value | [0]]" \
  --output table

# 4. Extract first matching item
aws iam list-users --query "Users[0].UserName" --output text

# 5. Extract values as custom JSON object keys
aws ec2 describe-vpcs --query \
  "Vpcs[].{ID: VpcId, CIDR: CidrBlock, IsDefault: IsDefault}" \
  --output json
```

---

## Identity & Access Management (IAM)

Manage users, groups, roles, and security policies:

```bash
# Users
aws iam list-users                           # List all IAM users
aws iam create-user --user-name devops-user  # Create new IAM user
aws iam get-user --user-name devops-user     # View user details and ARN
aws iam delete-user --user-name devops-user  # Delete IAM user

# Groups & Memberships
aws iam create-group --group-name Admins     # Create user group
aws iam add-user-to-group --group-name Admins --user-name devops-user # Add user to group
aws iam list-groups-for-user --user-name devops-user                  # Check group memberships

# Policy Attachments
aws iam attach-user-policy \
  --user-name devops-user \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess # Attach managed policy to user

aws iam attach-group-policy \
  --group-name Admins \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess # Attach policy to group

# IAM Roles (for EC2 / Lambda services)
aws iam create-role \
  --role-name EC2S3ReadOnlyRole \
  --assume-role-policy-document file://trust-policy.json # Create role with trust relationship

aws iam attach-role-policy \
  --role-name EC2S3ReadOnlyRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess
```

---

## Elastic Compute Cloud (EC2)

Provision, inspect, and manage virtual servers and SSH keys:

```bash
# Key Pairs
aws ec2 create-key-pair \
  --key-name dev-key \
  --query 'KeyMaterial' \
  --output text > dev-key.pem                # Create key pair and save private key
chmod 400 dev-key.pem                        # Secure key permissions

# Launch Instances
aws ec2 run-instances \
  --image-id ami-0c7217cdde317cfec \
  --instance-type t3.micro \
  --key-name dev-key \
  --security-group-ids sg-0123456789abcdef0 \
  --subnet-id subnet-0123456789abcdef0 \
  --count 1 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web-server}]'

# Inspect Instances
aws ec2 describe-instances                   # List all EC2 instances across VPCs
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query "Reservations[].Instances[].[InstanceId, PublicIpAddress]" --output table

# Lifecycle control
aws ec2 stop-instances --instance-ids i-0123456789abcdef0      # Stop instance
aws ec2 start-instances --instance-ids i-0123456789abcdef0     # Start instance
aws ec2 terminate-instances --instance-ids i-0123456789abcdef0 # Terminate instance
```

---

## Virtual Private Cloud (VPC) & Networking

Construct software-defined cloud networking topologies:

```bash
# 1. Create VPC
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=prod-vpc}]'

# 2. Create Subnets
aws ec2 create-subnet \
  --vpc-id vpc-0123456789abcdef0 \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=public-1a}]'

# 3. Create & Attach Internet Gateway (IGW)
aws ec2 create-internet-gateway \
  --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=prod-igw}]'
aws ec2 attach-internet-gateway \
  --internet-gateway-id igw-0123456789abcdef0 \
  --vpc-id vpc-0123456789abcdef0

# 4. Create Security Group & Rules
aws ec2 create-security-group \
  --group-name web-sg \
  --description "Allow HTTP and SSH" \
  --vpc-id vpc-0123456789abcdef0

aws ec2 authorize-security-group-ingress \
  --group-id sg-0123456789abcdef0 \
  --protocol tcp --port 80 --cidr 0.0.0.0/0  # Allow public HTTP inbound

aws ec2 authorize-security-group-ingress \
  --group-id sg-0123456789abcdef0 \
  --protocol tcp --port 22 --cidr 203.0.113.50/32 # Allow admin SSH inbound
```

---

## Simple Storage Service (S3) & S3API

High-level `aws s3` file operations and low-level `aws s3api` bucket controls:

```bash
# High-level s3 commands
aws s3 mb s3://my-unique-bucket-name         # Make bucket
aws s3 ls                                    # List all buckets
aws s3 ls s3://my-unique-bucket-name/        # List objects inside bucket
aws s3 cp app.tar.gz s3://my-unique-bucket-name/releases/ # Upload file
aws s3 cp s3://my-unique-bucket-name/config.json ./local-config.json # Download file
aws s3 sync ./dist s3://my-unique-bucket-name/dist/ --delete # Sync folder (delete removed)
aws s3 rm s3://my-unique-bucket-name/old.zip # Delete object
aws s3 rb s3://my-unique-bucket-name --force # Empty and remove bucket

# Low-level s3api commands
aws s3api create-bucket \
  --bucket my-unique-bucket-name \
  --region us-east-1                         # Create bucket via API

aws s3api put-public-access-block \
  --bucket my-unique-bucket-name \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

---

## Relational Database Service (RDS)

Provision and operate managed relational database engines:

```bash
# Create RDS PostgreSQL DB instance
aws rds create-db-instance \
  --db-instance-identifier prod-postgres \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username dbadmin \
  --master-user-password 'SuperSecretP@ssword123' \
  --allocated-storage 20 \
  --no-publicly-accessible

# Inspect databases
aws rds describe-db-instances                # List all DB instances
aws rds describe-db-instances \
  --db-instance-identifier prod-postgres \
  --query "DBInstances[0].[DBInstanceStatus, Endpoint.Address, Endpoint.Port]" \
  --output table

# Teardown database
aws rds delete-db-instance \
  --db-instance-identifier prod-postgres \
  --skip-final-snapshot                      # Destroy without taking final snapshot
```

---

## Amazon CloudWatch

Monitor metrics and configure operational alert alarms:

```bash
# List and describe alarms
aws cloudwatch describe-alarms               # List all CloudWatch alarms
aws cloudwatch describe-alarms \
  --state-value ALARM \
  --query "MetricAlarms[].[AlarmName, MetricName, StateValue]" --output table

# Create CPU utilization threshold alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "High-CPU-Utilization-Web" \
  --alarm-description "Alarm when EC2 CPU exceeds 80% for 5 minutes" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80.0 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=InstanceId,Value=i-0123456789abcdef0 \
  --evaluation-periods 1

# Query metric data
aws cloudwatch get-metric-data \
  --metric-data-queries file://query.json \
  --start-time 2026-10-12T00:00:00Z \
  --end-time 2026-10-12T12:00:00Z
```

---

## Containers (ECS & EKS)

Manage Amazon ECS clusters and Amazon EKS Kubernetes clusters:

```bash
# Amazon Elastic Container Service (ECS)
aws ecs create-cluster --cluster-name prod-ecs-cluster # Create ECS cluster
aws ecs describe-clusters --clusters prod-ecs-cluster   # Describe cluster status
aws ecs list-tasks --cluster prod-ecs-cluster           # List running ECS tasks
aws ecs list-services --cluster prod-ecs-cluster        # List ECS services

# Amazon Elastic Kubernetes Service (EKS)
aws eks list-clusters                                   # List EKS clusters in region
aws eks describe-cluster --name prod-eks-cluster        # Describe EKS cluster status & endpoint

# Configure local kubectl context for EKS
aws eks update-kubeconfig \
  --name prod-eks-cluster \
  --region us-east-1                                    # Auto-update ~/.kube/config
```

---

## AWS Lambda

Serverless function management and testing:

```bash
# List functions
aws lambda list-functions \
  --query "Functions[].[FunctionName, Runtime, Handler, CodeSize]" --output table

# Create Lambda function
aws lambda create-function \
  --function-name hello-world-api \
  --runtime python3.11 \
  --role arn:aws:iam::123456789012:role/lambda-ex \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://function.zip

# Invoke function
aws lambda invoke \
  --function-name hello-world-api \
  --cli-binary-format raw-in-base64-out \
  --payload '{"key": "value"}' \
  response.json

cat response.json                            # Inspect function execution return payload

# Update function code
aws lambda update-function-code \
  --function-name hello-world-api \
  --zip-file fileb://function.zip
```
