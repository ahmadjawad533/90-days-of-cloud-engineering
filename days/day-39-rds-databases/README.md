# Day 39: RDS and Managed Databases
[← Previous Day](../day-38-s3-buckets/README.md) | [Next Day →](../day-40-three-tier-vpc/README.md)

## Goal
Provision, secure, and inspect a managed relational database using Amazon Relational Database Service (RDS), DB Subnet Groups, and least-privilege security groups in an isolated private tier.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Amazon RDS User Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/) — Official documentation covering supported engines (PostgreSQL, MySQL), DB instance classes (`db.t3.micro`), DB Subnet Groups, and Multi-AZ replication.
- 📖 [Amazon RDS Security Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.Security.html) — AWS guide on VPC isolation, disabling public accessibility, encryption at rest, and credential management.

## Do
In this lab, you will create a multi-AZ private network foundation, create an RDS DB Subnet Group, launch a free-tier eligible PostgreSQL instance without public accessibility, and retrieve connection details via the AWS CLI.

1. **Create a VPC and two private subnets across two distinct Availability Zones**:
   AWS RDS requires a DB Subnet Group containing subnets in at least two different Availability Zones for high availability failover readiness.
   ```bash
   REGION="us-east-1"
   VPC_ID=$(aws ec2 create-vpc \
     --region "${REGION}" \
     --cidr-block 10.0.0.0/16 \
     --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=day39-db-vpc}]' \
     --query "Vpc.VpcId" \
     --output text)

   SUBNET_1=$(aws ec2 create-subnet \
     --region "${REGION}" \
     --vpc-id "${VPC_ID}" \
     --cidr-block 10.0.10.0/24 \
     --availability-zone "${REGION}a" \
     --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=day39-priv-subnet-1a}]' \
     --query "Subnet.SubnetId" \
     --output text)

   SUBNET_2=$(aws ec2 create-subnet \
     --region "${REGION}" \
     --vpc-id "${VPC_ID}" \
     --cidr-block 10.0.20.0/24 \
     --availability-zone "${REGION}b" \
     --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=day39-priv-subnet-1b}]' \
     --query "Subnet.SubnetId" \
     --output text)

   echo "VPC: ${VPC_ID} | Subnets: ${SUBNET_1}, ${SUBNET_2}"
   ```

2. **Create an RDS DB Subnet Group**:
   ```bash
   aws rds create-db-subnet-group \
     --region "${REGION}" \
     --db-subnet-group-name "day39-db-subnet-group" \
     --db-subnet-group-description "Private subnet group for day 39 RDS lab" \
     --subnet-ids "${SUBNET_1}" "${SUBNET_2}"
   ```

3. **Create Security Groups for Application and Database**:
   ```bash
   # Application SG
   APP_SG=$(aws ec2 create-security-group \
     --region "${REGION}" \
     --group-name "day39-app-sg" \
     --description "App server security group" \
     --vpc-id "${VPC_ID}" \
     --query "GroupId" \
     --output text)

   # Database SG
   DB_SG=$(aws ec2 create-security-group \
     --region "${REGION}" \
     --group-name "day39-rds-sg" \
     --description "RDS PostgreSQL security group" \
     --vpc-id "${VPC_ID}" \
     --query "GroupId" \
     --output text)

   # Allow PostgreSQL port 5432 exclusively from the APP_SG
   aws ec2 authorize-security-group-ingress \
     --region "${REGION}" \
     --group-id "${DB_SG}" \
     --protocol tcp \
     --port 5432 \
     --source-group "${APP_SG}"

   echo "App SG: ${APP_SG} | DB SG: ${DB_SG}"
   ```

4. **Launch a Free-Tier Eligible RDS PostgreSQL Instance**:
   We will deploy a Single-AZ `db.t3.micro` instance with 20 GiB storage, auto-minor-version-upgrade enabled, and public access disabled.
   ```bash
   DB_IDENTIFIER="day39-postgres-db"
   DB_PASSWORD="CloudEngLab2026Password!"

   aws rds create-db-instance \
     --region "${REGION}" \
     --db-instance-identifier "${DB_IDENTIFIER}" \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --allocated-storage 20 \
     --master-username "cloudadmin" \
     --master-user-password "${DB_PASSWORD}" \
     --db-subnet-group-name "day39-db-subnet-group" \
     --vpc-security-group-ids "${DB_SG}" \
     --no-publicly-accessible \
     --backup-retention-period 0 \
     --tags Key=Name,Value=day39-postgres-db
   ```

5. **Wait for DB instance availability and inspect connection endpoint**:
   RDS provisioning typically takes 5 to 10 minutes while AWS configures underlying compute and storage volumes.
   ```bash
   echo "Waiting for RDS instance to become available (this takes a few minutes)..."
   aws rds wait db-instance-available \
     --region "${REGION}" \
     --db-instance-identifier "${DB_IDENTIFIER}"

   # Retrieve DB endpoint and status
   aws rds describe-db-instances \
     --region "${REGION}" \
     --db-instance-identifier "${DB_IDENTIFIER}" \
     --query "DBInstances[0].[DBInstanceIdentifier,DBInstanceStatus,Endpoint.Address,Endpoint.Port,PubliclyAccessible]" \
     --output table
   ```

## Done When
- [ ] DB Subnet Group `day39-db-subnet-group` references subnets in at least two Availability Zones.
- [ ] Database Security Group allows ingress port 5432 strictly from `day39-app-sg`.
- [ ] RDS instance reaches status `available`.
- [ ] `PubliclyAccessible` is verified as `false` in `describe-db-instances`.
- [ ] Private endpoint DNS address (e.g. `day39-postgres-db.c...rds.amazonaws.com`) is recorded.

## Cost and Cleanup
Expected Cost: **$0.00** — The AWS Free Tier provides 750 hours/month of Single-AZ `db.t3.micro` (or `db.t4g.micro`) and 20 GB of General Purpose SSD storage for the first 12 months.

RDS instances incur hourly charges if left running outside the Free Tier. Always delete testing databases immediately after verifying:
```bash
REGION="us-east-1"
DB_IDENTIFIER="day39-postgres-db"

# 1. Delete RDS instance without creating a final snapshot
echo "Deleting RDS instance ${DB_IDENTIFIER}..."
aws rds delete-db-instance \
  --region "${REGION}" \
  --db-instance-identifier "${DB_IDENTIFIER}" \
  --skip-final-snapshot \
  --delete-automated-backups

echo "Waiting for RDS instance deletion..."
aws rds wait db-instance-deleted \
  --region "${REGION}" \
  --db-instance-identifier "${DB_IDENTIFIER}"

# 2. Delete DB Subnet Group
aws rds delete-db-subnet-group \
  --region "${REGION}" \
  --db-subnet-group-name "day39-db-subnet-group"

# 3. Delete Security Groups
aws ec2 delete-security-group --region "${REGION}" --group-id "${DB_SG}"
aws ec2 delete-security-group --region "${REGION}" --group-id "${APP_SG}"

# 4. Delete Subnets and VPC
aws ec2 delete-subnet --region "${REGION}" --subnet-id "${SUBNET_1}"
aws ec2 delete-subnet --region "${REGION}" --subnet-id "${SUBNET_2}"
aws ec2 delete-vpc --region "${REGION}" --vpc-id "${VPC_ID}"

echo "All database and networking resources cleaned up successfully."
```

## Azure / GCP Equivalents
| AWS RDS Feature | Azure Equivalent | GCP Cloud SQL |
|-----------------|------------------|---------------|
| Amazon RDS (PostgreSQL/MySQL) | Azure Database for PostgreSQL / Azure SQL | Google Cloud SQL (PostgreSQL/MySQL) |
| DB Subnet Group | VNet Integration / Private Endpoint | Private Service Connect / VPC Peering |
| Multi-AZ (Standby Failover) | Zone-Redundant High Availability | High Availability (HA) Regional Configuration |
| Read Replica | Azure Read Replica | Cloud SQL Read Replica |
| Automated Snapshots | Automated Backups (LRS/GRS) | Cloud SQL Automated Backups |

- 📖 [Azure Database for PostgreSQL Documentation](https://learn.microsoft.com/en-us/azure/postgresql/)
- 📖 [Google Cloud SQL Documentation](https://cloud.google.com/sql/docs)

## Stretch Goal
Understand High Availability: Contrast Amazon RDS Multi-AZ deployments with Read Replicas. Multi-AZ provides synchronous replication to a standby instance in another AZ for automatic disaster failover (no read scaling), whereas Read Replicas use asynchronous replication for scaling read-heavy queries. Document the difference in recovery point objective (RPO) and recovery time objective (RTO).

## Common Mistakes
- **Failing to span at least two AZs in DB Subnet Group**: AWS requires at least two Availability Zones in a DB Subnet Group even for Single-AZ instances, ensuring the subnet group is ready if you decide to modify the instance to Multi-AZ later.
- **Enabling Public Accessibility**: Setting `--publicly-accessible` exposes your database port to the entire internet. Production databases should always reside in private subnets with private endpoints.
- **Forgetting `--skip-final-snapshot` during cleanup**: Forgetting `--skip-final-snapshot` triggers an unneeded snapshot creation before deletion, which delays teardown and incurs lingering snapshot storage costs.
