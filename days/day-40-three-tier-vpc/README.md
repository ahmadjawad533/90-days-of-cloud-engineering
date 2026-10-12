# Day 40: Build a Three-Tier VPC Architecture
[← Previous Day](../day-39-rds-databases/README.md) | [Next Day →](../day-41-what-are-containers/README.md)

## Goal
Design and construct an enterprise-grade, highly available Three-Tier VPC architecture with public web subnets, private application subnets, and isolated private database subnets across multiple Availability Zones using the AWS CLI.

## Time
⏱️ Approximately 120 minutes

## Learn
- 📖 [Amazon VPC Architecture: Scenario with Public and Private Subnets](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Scenario2.html) — Official AWS reference architecture for multi-tier network segmentation and NAT routing.
- 📖 [AWS Well-Architected Framework: Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html) — Architectural principles for multi-AZ fault tolerance and network boundary isolation.

## Do
In this milestone capstone lab for Module 5, you will construct a full Three-Tier VPC architecture across two Availability Zones (`us-east-1a` and `us-east-1b`):
- **Tier 1 (Public)**: 2 Public subnets with Internet Gateway for Load Balancers and NAT Gateways.
- **Tier 2 (Private App)**: 2 Private subnets routing egress traffic through a NAT Gateway for application servers.
- **Tier 3 (Private DB)**: 2 Isolated private subnets without internet access for backend databases.
- **Tiered Security Groups**: ALB SG -> App SG -> DB SG.

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

1. **Create the VPC and enable DNS hostnames**:
   ```bash
   REGION="us-east-1"
   VPC_ID=$(aws ec2 create-vpc \
     --region "${REGION}" \
     --cidr-block 10.0.0.0/16 \
     --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=three-tier-production-vpc}]' \
     --query "Vpc.VpcId" \
     --output text)

   aws ec2 modify-vpc-attribute --region "${REGION}" --vpc-id "${VPC_ID}" --enable-dns-hostnames '{"Value":true}'
   aws ec2 modify-vpc-attribute --region "${REGION}" --vpc-id "${VPC_ID}" --enable-dns-support '{"Value":true}'
   echo "VPC: ${VPC_ID}"
   ```

2. **Create subnets across 2 Availability Zones (6 subnets total)**:
   ```bash
   # Tier 1: Public Subnets
   PUB_SUB_A=$(aws ec2 create-subnet --region "${REGION}" --vpc-id "${VPC_ID}" --cidr-block 10.0.1.0/24 --availability-zone "${REGION}a" --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=pub-tier-1a}]' --query "Subnet.SubnetId" --output text)
   PUB_SUB_B=$(aws ec2 create-subnet --region "${REGION}" --vpc-id "${VPC_ID}" --cidr-block 10.0.2.0/24 --availability-zone "${REGION}b" --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=pub-tier-1b}]' --query "Subnet.SubnetId" --output text)
   aws ec2 modify-subnet-attribute --region "${REGION}" --subnet-id "${PUB_SUB_A}" --map-public-ip-on-launch
   aws ec2 modify-subnet-attribute --region "${REGION}" --subnet-id "${PUB_SUB_B}" --map-public-ip-on-launch

   # Tier 2: Private Application Subnets
   APP_SUB_A=$(aws ec2 create-subnet --region "${REGION}" --vpc-id "${VPC_ID}" --cidr-block 10.0.11.0/24 --availability-zone "${REGION}a" --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=app-tier-1a}]' --query "Subnet.SubnetId" --output text)
   APP_SUB_B=$(aws ec2 create-subnet --region "${REGION}" --vpc-id "${VPC_ID}" --cidr-block 10.0.12.0/24 --availability-zone "${REGION}b" --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=app-tier-1b}]' --query "Subnet.SubnetId" --output text)

   # Tier 3: Isolated Database Subnets
   DB_SUB_A=$(aws ec2 create-subnet --region "${REGION}" --vpc-id "${VPC_ID}" --cidr-block 10.0.21.0/24 --availability-zone "${REGION}a" --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=db-tier-1a}]' --query "Subnet.SubnetId" --output text)
   DB_SUB_B=$(aws ec2 create-subnet --region "${REGION}" --vpc-id "${VPC_ID}" --cidr-block 10.0.22.0/24 --availability-zone "${REGION}b" --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=db-tier-1b}]' --query "Subnet.SubnetId" --output text)

   echo "Subnets created: Public (${PUB_SUB_A}, ${PUB_SUB_B}), App (${APP_SUB_A}, ${APP_SUB_B}), DB (${DB_SUB_A}, ${DB_SUB_B})"
   ```

3. **Deploy Internet Gateway and Public Route Table**:
   ```bash
   IGW_ID=$(aws ec2 create-internet-gateway --region "${REGION}" --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=three-tier-igw}]' --query "InternetGateway.InternetGatewayId" --output text)
   aws ec2 attach-internet-gateway --region "${REGION}" --vpc-id "${VPC_ID}" --internet-gateway-id "${IGW_ID}"

   PUB_RT=$(aws ec2 create-route-table --region "${REGION}" --vpc-id "${VPC_ID}" --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=public-rt}]' --query "RouteTable.RouteTableId" --output text)
   aws ec2 create-route --region "${REGION}" --route-table-id "${PUB_RT}" --destination-cidr-block 0.0.0.0/0 --gateway-id "${IGW_ID}"

   aws ec2 associate-route-table --region "${REGION}" --subnet-id "${PUB_SUB_A}" --route-table-id "${PUB_RT}"
   aws ec2 associate-route-table --region "${REGION}" --subnet-id "${PUB_SUB_B}" --route-table-id "${PUB_RT}"
   ```

4. **Deploy NAT Gateway for Private App Tier Outbound Egress**:
   Allocate an Elastic IP and create the NAT Gateway in the public subnet `PUB_SUB_A`:
   ```bash
   EIP_ALLOC_ID=$(aws ec2 allocate-address --region "${REGION}" --domain vpc --tag-specifications 'ResourceType=elastic-ip,Tags=[{Key=Name,Value=nat-gw-eip}]' --query "AllocationId" --output text)

   NAT_GW_ID=$(aws ec2 create-nat-gateway --region "${REGION}" --subnet-id "${PUB_SUB_A}" --allocation-id "${EIP_ALLOC_ID}" --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=three-tier-nat-gw}]' --query "NatGateway.NatGatewayId" --output text)

   echo "Waiting for NAT Gateway ${NAT_GW_ID} to become available (takes ~2 minutes)..."
   aws ec2 wait nat-gateway-available --region "${REGION}" --nat-gateway-ids "${NAT_GW_ID}"
   ```

5. **Configure Route Tables for App Tier and DB Tier**:
   ```bash
   # App Route Table (points 0.0.0.0/0 to NAT Gateway)
   APP_RT=$(aws ec2 create-route-table --region "${REGION}" --vpc-id "${VPC_ID}" --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=app-tier-rt}]' --query "RouteTable.RouteTableId" --output text)
   aws ec2 create-route --region "${REGION}" --route-table-id "${APP_RT}" --destination-cidr-block 0.0.0.0/0 --nat-gateway-id "${NAT_GW_ID}"
   aws ec2 associate-route-table --region "${REGION}" --subnet-id "${APP_SUB_A}" --route-table-id "${APP_RT}"
   aws ec2 associate-route-table --region "${REGION}" --subnet-id "${APP_SUB_B}" --route-table-id "${APP_RT}"

   # DB Route Table (isolated, local routing only - no 0.0.0.0/0 route)
   DB_RT=$(aws ec2 create-route-table --region "${REGION}" --vpc-id "${VPC_ID}" --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=db-tier-isolated-rt}]' --query "RouteTable.RouteTableId" --output text)
   aws ec2 associate-route-table --region "${REGION}" --subnet-id "${DB_SUB_A}" --route-table-id "${DB_RT}"
   aws ec2 associate-route-table --region "${REGION}" --subnet-id "${DB_SUB_B}" --route-table-id "${DB_RT}"
   ```

6. **Create Three-Tier Chained Security Groups**:
   ```bash
   # 1. Public Load Balancer Security Group
   ALB_SG=$(aws ec2 create-security-group --region "${REGION}" --group-name "public-alb-sg" --description "Public internet facing ALB" --vpc-id "${VPC_ID}" --query "GroupId" --output text)
   aws ec2 authorize-security-group-ingress --region "${REGION}" --group-id "${ALB_SG}" --protocol tcp --port 80 --cidr 0.0.0.0/0
   aws ec2 authorize-security-group-ingress --region "${REGION}" --group-id "${ALB_SG}" --protocol tcp --port 443 --cidr 0.0.0.0/0

   # 2. App Tier Security Group (only accepts traffic from ALB SG)
   APP_SG=$(aws ec2 create-security-group --region "${REGION}" --group-name "app-tier-sg" --description "Private app servers" --vpc-id "${VPC_ID}" --query "GroupId" --output text)
   aws ec2 authorize-security-group-ingress --region "${REGION}" --group-id "${APP_SG}" --protocol tcp --port 8080 --source-group "${ALB_SG}"

   # 3. Database Tier Security Group (only accepts traffic from App SG)
   DB_SG=$(aws ec2 create-security-group --region "${REGION}" --group-name "db-tier-sg" --description "Private database instances" --vpc-id "${VPC_ID}" --query "GroupId" --output text)
   aws ec2 authorize-security-group-ingress --region "${REGION}" --group-id "${DB_SG}" --protocol tcp --port 5432 --source-group "${APP_SG}"

   echo "ALB SG: ${ALB_SG} -> App SG: ${APP_SG} -> DB SG: ${DB_SG}"
   ```

7. **Verify Architecture Configuration**:
   ```bash
   aws ec2 describe-subnets --region "${REGION}" --filters "Name=vpc-id,Values=${VPC_ID}" --query "Subnets[*].[Tags[?Key=='Name'].Value|[0],CidrBlock,AvailabilityZone]" --output table
   aws ec2 describe-route-tables --region "${REGION}" --filters "Name=vpc-id,Values=${VPC_ID}" --query "RouteTables[*].[Tags[?Key=='Name'].Value|[0],Routes[*].GatewayId]" --output json
   ```

## Done When
- [ ] 6 subnets created across two Availability Zones (`us-east-1a` and `us-east-1b`).
- [ ] Internet Gateway attached to VPC and linked to public subnets via `public-rt`.
- [ ] NAT Gateway provisioned in a public subnet with an allocated Elastic IP.
- [ ] App subnets associated with `app-tier-rt` pointing `0.0.0.0/0` to the NAT Gateway.
- [ ] DB subnets associated with `db-tier-isolated-rt` containing only local VPC routing.
- [ ] Security group chaining verified: Internet -> `ALB_SG` -> `APP_SG` -> `DB_SG`.

## Cost and Cleanup
> [!IMPORTANT]
> **NAT Gateways incur an hourly charge** (~$0.045 per hour + data processing). Unattached Elastic IPs also incur ~$0.005/hour. To maintain a **$0.00 to <$0.02** lab cost, execute the teardown commands below immediately upon completing your verification.

Execute full teardown in strict dependency order:
```bash
REGION="us-east-1"

echo "Beginning Three-Tier VPC Teardown..."

# 1. Delete NAT Gateway and release Elastic IP
aws ec2 delete-nat-gateway --region "${REGION}" --nat-gateway-id "${NAT_GW_ID}"
echo "Waiting for NAT Gateway to delete (takes ~2 minutes)..."
aws ec2 wait nat-gateway-deleted --region "${REGION}" --nat-gateway-ids "${NAT_GW_ID}"

aws ec2 release-address --region "${REGION}" --allocation-id "${EIP_ALLOC_ID}"
echo "Released Elastic IP: ${EIP_ALLOC_ID}"

# 2. Delete Security Groups (DB SG -> App SG -> ALB SG)
aws ec2 delete-security-group --region "${REGION}" --group-id "${DB_SG}"
aws ec2 delete-security-group --region "${REGION}" --group-id "${APP_SG}"
aws ec2 delete-security-group --region "${REGION}" --group-id "${ALB_SG}"

# 3. Disassociate and delete custom route tables
for RT in "${PUB_RT}" "${APP_RT}" "${DB_RT}"; do
  for ASSOC in $(aws ec2 describe-route-tables --region "${REGION}" --route-table-ids "${RT}" --query "RouteTables[0].Associations[*].RouteTableAssociationId" --output text); do
    [ "${ASSOC}" != "None" ] && aws ec2 disassociate-route-table --region "${REGION}" --association-id "${ASSOC}"
  done
  aws ec2 delete-route-table --region "${REGION}" --route-table-id "${RT}"
done

# 4. Detach and delete Internet Gateway
aws ec2 detach-internet-gateway --region "${REGION}" --vpc-id "${VPC_ID}" --internet-gateway-id "${IGW_ID}"
aws ec2 delete-internet-gateway --region "${REGION}" --internet-gateway-id "${IGW_ID}"

# 5. Delete all 6 subnets
for SUB in "${PUB_SUB_A}" "${PUB_SUB_B}" "${APP_SUB_A}" "${APP_SUB_B}" "${DB_SUB_A}" "${DB_SUB_B}"; do
  aws ec2 delete-subnet --region "${REGION}" --subnet-id "${SUB}"
done

# 6. Delete VPC
aws ec2 delete-vpc --region "${REGION}" --vpc-id "${VPC_ID}"

echo "Three-tier VPC architecture destroyed successfully."
```

## Azure / GCP Equivalents
| Architecture Layer | AWS | Azure Equivalent | GCP Equivalent |
|--------------------|-----|------------------|----------------|
| Ingress / Public Tier | Public Subnet + Internet Gateway + ALB | Frontend Subnet + Public IP + Azure Application Gateway | Public Subnet + Cloud Load Balancing |
| Egress Gateway | NAT Gateway + Elastic IP | Azure NAT Gateway | Cloud NAT Gateway |
| Application Tier | Private Subnet + EC2 App Instances | App Subnet + Virtual Machine Scale Set (VMSS) | Private Subnet + Managed Instance Group (MIG) |
| Database Tier | Isolated Private Subnet + RDS Multi-AZ | Database Subnet + Azure Database with VNet Injection | Private Service Connect / Private DB Subnet + Cloud SQL |
| Tier Firewall Isolation | Chained Security Groups | Network Security Groups (NSGs) with ASGs | VPC Firewall Rules with Service Account tags |

- 📖 [Azure Three-Tier Architecture Guide](https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/n-tier/n-tier-iaas)
- 📖 [Google Cloud Three-Tier Architecture](https://cloud.google.com/architecture/three-tier-web-app)

## Stretch Goal
Automate the entire three-tier architecture deployment: Convert this AWS CLI script into an infrastructure-as-code template using AWS CloudFormation or HashiCorp Terraform. Parameterize the VPC CIDR block and Availability Zones so the entire topology can be launched and destroyed with a single command.

## Common Mistakes
- **Placing the NAT Gateway in a private subnet**: A NAT Gateway must be placed in a **public subnet** with an attached Elastic IP and a route to the Internet Gateway; otherwise, it cannot route outbound traffic to the internet.
- **Forgetting to release the Elastic IP after deleting the NAT Gateway**: An unassociated Elastic IP sitting idle in your AWS account incurs continuous hourly billing ($0.005/hr). Always run `aws ec2 release-address`.
- **Accidentally attaching the default route to the database route table**: The database tier must be strictly isolated. Giving database subnets a route to an IGW or NAT Gateway violates defense-in-depth principles.
