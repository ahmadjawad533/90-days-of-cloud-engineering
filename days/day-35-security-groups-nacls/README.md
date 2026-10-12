# Day 35: Security Groups and NACLs
[← Previous Day](../day-34-subnets-routes-gateways/README.md) | [Next Day →](../day-36-launch-ec2/README.md)

## Goal
Master cloud network defense-in-depth by designing, deploying, and comparing stateful Security Groups and stateless Network Access Control Lists (NACLs).

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [AWS Security Groups User Guide](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_SecurityGroups.html) — Comprehensive guide on stateful filtering, instance network interface association, and security group chaining.
- 📖 [AWS Network ACLs User Guide](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html) — Detailed breakdown of stateless subnet boundaries, numbered rule processing, and ephemeral port requirements.

## Do
In this lab, you will configure a two-tier Security Group structure (Web and Database) demonstrating security group chaining, and build a custom subnet Network ACL with both inbound and outbound stateless rules.

1. **Create an isolated lab VPC and public subnet**:
   ```bash
   REGION="us-east-1"
   VPC_ID=$(aws ec2 create-vpc \
     --region "${REGION}" \
     --cidr-block 10.0.0.0/16 \
     --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=day35-security-vpc}]' \
     --query "Vpc.VpcId" \
     --output text)

   SUBNET_ID=$(aws ec2 create-subnet \
     --region "${REGION}" \
     --vpc-id "${VPC_ID}" \
     --cidr-block 10.0.1.0/24 \
     --availability-zone "${REGION}a" \
     --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=day35-web-subnet}]' \
     --query "Subnet.SubnetId" \
     --output text)

   echo "VPC: ${VPC_ID} | Subnet: ${SUBNET_ID}"
   ```

2. **Create Web Tier and Database Tier Security Groups**:
   ```bash
   # Create Web Tier Security Group
   WEB_SG_ID=$(aws ec2 create-security-group \
     --region "${REGION}" \
     --group-name "web-tier-sg" \
     --description "Security group for web instances" \
     --vpc-id "${VPC_ID}" \
     --query "GroupId" \
     --output text)

   # Create Database Tier Security Group
   DB_SG_ID=$(aws ec2 create-security-group \
     --region "${REGION}" \
     --group-name "db-tier-sg" \
     --description "Security group for database instances" \
     --vpc-id "${VPC_ID}" \
     --query "GroupId" \
     --output text)

   echo "Web SG: ${WEB_SG_ID} | DB SG: ${DB_SG_ID}"
   ```

3. **Configure Security Group Rules (Stateful Chaining)**:
   Authorize HTTP/HTTPS traffic to the Web SG, and authorize database traffic (e.g., PostgreSQL port 5432) to the DB SG *only* from instances belonging to `web-tier-sg`:
   ```bash
   # Allow HTTP (port 80) from anywhere to Web SG
   aws ec2 authorize-security-group-ingress \
     --region "${REGION}" \
     --group-id "${WEB_SG_ID}" \
     --protocol tcp \
     --port 80 \
     --cidr 0.0.0.0/0

   # Allow HTTPS (port 443) from anywhere to Web SG
   aws ec2 authorize-security-group-ingress \
     --region "${REGION}" \
     --group-id "${WEB_SG_ID}" \
     --protocol tcp \
     --port 443 \
     --cidr 0.0.0.0/0

   # Allow PostgreSQL (port 5432) from WEB_SG_ID to DB_SG_ID (Security Group Reference)
   aws ec2 authorize-security-group-ingress \
     --region "${REGION}" \
     --group-id "${DB_SG_ID}" \
     --protocol tcp \
     --port 5432 \
     --source-group "${WEB_SG_ID}"
   ```

4. **Create a custom Network ACL (NACL) for the subnet**:
   Network ACLs operate at the subnet boundary and are **stateless** — you must explicitly permit both the incoming request and the outbound return response.
   ```bash
   NACL_ID=$(aws ec2 create-network-acl \
     --region "${REGION}" \
     --vpc-id "${VPC_ID}" \
     --tag-specifications 'ResourceType=network-acl,Tags=[{Key=Name,Value=day35-custom-nacl}]' \
     --query "NetworkAcl.NetworkAclId" \
     --output text)

   echo "Custom NACL: ${NACL_ID}"
   ```

5. **Add numbered rules to the custom NACL**:
   ```bash
   # Inbound Rule 100: Allow HTTP (port 80) from anywhere
   aws ec2 create-network-acl-entry \
     --region "${REGION}" \
     --network-acl-id "${NACL_ID}" \
     --ingress \
     --rule-number 100 \
     --protocol tcp \
     --port-range From=80,To=80 \
     --cidr-block 0.0.0.0/0 \
     --rule-action allow

   # Inbound Rule 110: Allow ephemeral ports (1024-65535) for outbound connections initiated by hosts inside the subnet
   aws ec2 create-network-acl-entry \
     --region "${REGION}" \
     --network-acl-id "${NACL_ID}" \
     --ingress \
     --rule-number 110 \
     --protocol tcp \
     --port-range From=1024,To=65535 \
     --cidr-block 0.0.0.0/0 \
     --rule-action allow

   # Outbound Rule 100: Allow ephemeral ports (1024-65535) for return web traffic back to clients
   aws ec2 create-network-acl-entry \
     --region "${REGION}" \
     --network-acl-id "${NACL_ID}" \
     --egress \
     --rule-number 100 \
     --protocol tcp \
     --port-range From=1024,To=65535 \
     --cidr-block 0.0.0.0/0 \
     --rule-action allow
   ```

6. **Associate the custom NACL with the subnet**:
   ```bash
   # Find existing association ID for the subnet
   CURRENT_ASSOC_ID=$(aws ec2 describe-network-acls \
     --region "${REGION}" \
     --filters "Name=association.subnet-id,Values=${SUBNET_ID}" \
     --query "NetworkAcls[0].Associations[?SubnetId=='${SUBNET_ID}'].NetworkAclAssociationId" \
     --output text)

   # Replace default NACL association with the custom NACL
   aws ec2 replace-network-acl-association \
     --region "${REGION}" \
     --association-id "${CURRENT_ASSOC_ID}" \
     --network-acl-id "${NACL_ID}"
   ```

7. **Verify security configurations**:
   ```bash
   # Inspect Security Groups
   aws ec2 describe-security-groups \
     --region "${REGION}" \
     --group-ids "${WEB_SG_ID}" "${DB_SG_ID}" \
     --query "SecurityGroups[*].[GroupName,IpPermissions]" \
     --output json

   # Inspect NACL Entries
   aws ec2 describe-network-acls \
     --region "${REGION}" \
     --network-acl-ids "${NACL_ID}" \
     --query "NetworkAcls[0].Entries" \
     --output table
   ```

## Done When
- [ ] `web-tier-sg` has ingress rules for ports 80 and 443 from `0.0.0.0/0`.
- [ ] `db-tier-sg` restricts port 5432 ingress solely to source security group `web-tier-sg` (no IP CIDRs).
- [ ] Custom NACL `day35-custom-nacl` is associated with `day35-web-subnet`.
- [ ] Inbound and outbound NACL rules include ephemeral return ports (`1024-65535`).

## Cost and Cleanup
Expected Cost: **$0.00** — Security Groups and Network ACLs are free features of Amazon VPC.

Tear down all created resources:
```bash
REGION="us-east-1"

# 1. Get default NACL ID to re-associate before deleting custom NACL
DEFAULT_NACL_ID=$(aws ec2 describe-network-acls \
  --region "${REGION}" \
  --filters "Name=vpc-id,Values=${VPC_ID}" "Name=default,Values=true" \
  --query "NetworkAcls[0].NetworkAclId" \
  --output text)

NACL_ASSOC_ID=$(aws ec2 describe-network-acls \
  --region "${REGION}" \
  --filters "Name=association.subnet-id,Values=${SUBNET_ID}" \
  --query "NetworkAcls[0].Associations[?SubnetId=='${SUBNET_ID}'].NetworkAclAssociationId" \
  --output text)

# Revert subnet to default NACL and delete custom NACL
aws ec2 replace-network-acl-association --region "${REGION}" --association-id "${NACL_ASSOC_ID}" --network-acl-id "${DEFAULT_NACL_ID}"
aws ec2 delete-network-acl --region "${REGION}" --network-acl-id "${NACL_ID}"

# 2. Delete Security Groups (DB SG first, then Web SG because DB SG references Web SG)
aws ec2 delete-security-group --region "${REGION}" --group-id "${DB_SG_ID}"
aws ec2 delete-security-group --region "${REGION}" --group-id "${WEB_SG_ID}"

# 3. Delete Subnet and VPC
aws ec2 delete-subnet --region "${REGION}" --subnet-id "${SUBNET_ID}"
aws ec2 delete-vpc --region "${REGION}" --vpc-id "${VPC_ID}"

echo "Cleanup completed successfully."
```

## Azure / GCP Equivalents
| Feature | AWS Security Group / NACL | Azure Equivalent | GCP Equivalent |
|---------|---------------------------|------------------|----------------|
| Stateful Instance Firewall | Security Group (Attached to ENI) | Network Security Group (NSG) | VPC Firewall Rules / Tag-based rules |
| Stateless Subnet Firewall | Network ACL (Attached to Subnet) | Azure Firewall / Subnet-level NSG (Stateful) | Hierarchical Firewall Policies |
| Rule Priority | NACL: Numbered (1-32766) / SG: All evaluated | NSG: Priority (100-4096) | GCP Firewall: Priority (0-65535) |
| Action Types | SG: Allow only / NACL: Allow & Deny | NSG: Allow & Deny | GCP: Allow & Deny |

- 📖 [Azure Network Security Groups (NSGs)](https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview)
- 📖 [Google Cloud VPC Firewall Rules](https://cloud.google.com/firewall/docs/firewalls-overview)

## Stretch Goal
Simulate a specific IP address block (blacklist). Because Security Groups only support `ALLOW` rules, configure a specific `DENY` rule in your Network ACL at Rule 50 (e.g., deny IP `203.0.113.4/32` on port 80) while Rule 100 allows all other IPs. Observe why NACLs are the correct tool for blacklisting malicious IP ranges before traffic ever reaches an EC2 instance.

## Common Mistakes
- **Forgetting outbound ephemeral ports in NACLs**: Because NACLs are stateless, allowing inbound traffic on port 80 is not enough. If you do not allow outbound traffic on ephemeral ports (typically `1024-65535`), the server cannot send HTTP responses back to the client.
- **Hardcoding internal IP addresses in Security Groups**: Instead of allowing `10.0.1.50/32` into your DB, allow the Security Group ID of the web tier (`--source-group sg-xxxx`). This dynamically accommodates auto-scaling instances without updating IP lists.
- **Deleting referenced Security Groups out of order**: If SG-B references SG-A, attempting to delete SG-A first will result in a `DependencyViolation` error. Remove the rule reference or delete SG-B first.
