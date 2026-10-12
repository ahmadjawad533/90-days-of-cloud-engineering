# Day 34: VPC Subnets, Route Tables, and Gateways
[← Previous Day](../day-33-vpc-fundamentals/README.md) | [Next Day →](../day-35-security-groups-nacls/README.md)

## Goal
Design and configure public and private subnets, an Internet Gateway (IGW), and custom route tables to manage inbound and outbound network routing.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [AWS VPC Subnets Documentation](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html) — Learn how subnets divide your VPC CIDR, why AWS reserves 5 IP addresses per subnet, and how public vs. private subnets function.
- 📖 [Internet Gateways & Route Tables](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html) — Official guide detailing how to attach an Internet Gateway, configure destination routes, and associate route tables.

## Do
In this lab, you will build a foundational networking topology with one public subnet (connected to the internet via an IGW) and one isolated private subnet.

1. **Create the VPC and capture its ID**:
   ```bash
   REGION="us-east-1"
   VPC_ID=$(aws ec2 create-vpc \
     --region "${REGION}" \
     --cidr-block 10.0.0.0/16 \
     --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=day34-networking-vpc}]' \
     --query "Vpc.VpcId" \
     --output text)

   aws ec2 modify-vpc-attribute --region "${REGION}" --vpc-id "${VPC_ID}" --enable-dns-hostnames '{"Value":true}'
   echo "VPC Created: ${VPC_ID}"
   ```

2. **Create a Public Subnet and Private Subnet in the same Availability Zone**:
   ```bash
   AZ="${REGION}a"

   # Create Public Subnet (10.0.1.0/24)
   PUB_SUBNET_ID=$(aws ec2 create-subnet \
     --region "${REGION}" \
     --vpc-id "${VPC_ID}" \
     --cidr-block 10.0.1.0/24 \
     --availability-zone "${AZ}" \
     --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=day34-public-subnet-1a}]' \
     --query "Subnet.SubnetId" \
     --output text)

   # Create Private Subnet (10.0.2.0/24)
   PRIV_SUBNET_ID=$(aws ec2 create-subnet \
     --region "${REGION}" \
     --vpc-id "${VPC_ID}" \
     --cidr-block 10.0.2.0/24 \
     --availability-zone "${AZ}" \
     --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=day34-private-subnet-1a}]' \
     --query "Subnet.SubnetId" \
     --output text)

   echo "Public Subnet: ${PUB_SUBNET_ID}"
   echo "Private Subnet: ${PRIV_SUBNET_ID}"
   ```

3. **Enable auto-assign public IPv4 on the public subnet**:
   ```bash
   aws ec2 modify-subnet-attribute \
     --region "${REGION}" \
     --subnet-id "${PUB_SUBNET_ID}" \
     --map-public-ip-on-launch
   ```

4. **Create an Internet Gateway and attach it to your VPC**:
   ```bash
   IGW_ID=$(aws ec2 create-internet-gateway \
     --region "${REGION}" \
     --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=day34-igw}]' \
     --query "InternetGateway.InternetGatewayId" \
     --output text)

   aws ec2 attach-internet-gateway \
     --region "${REGION}" \
     --vpc-id "${VPC_ID}" \
     --internet-gateway-id "${IGW_ID}"

   echo "IGW Attached: ${IGW_ID}"
   ```

5. **Create a custom route table for public traffic and add the default route**:
   ```bash
   PUB_RT_ID=$(aws ec2 create-route-table \
     --region "${REGION}" \
     --vpc-id "${VPC_ID}" \
     --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=day34-public-rt}]' \
     --query "RouteTable.RouteTableId" \
     --output text)

   # Add route: 0.0.0.0/0 -> Internet Gateway
   aws ec2 create-route \
     --region "${REGION}" \
     --route-table-id "${PUB_RT_ID}" \
     --destination-cidr-block 0.0.0.0/0 \
     --gateway-id "${IGW_ID}"

   # Explicitly associate the route table with the public subnet
   aws ec2 associate-route-table \
     --region "${REGION}" \
     --subnet-id "${PUB_SUBNET_ID}" \
     --route-table-id "${PUB_RT_ID}"
   ```

6. **Verify routing tables and subnet associations**:
   ```bash
   # Check route tables in this VPC
   aws ec2 describe-route-tables \
     --region "${REGION}" \
     --filters "Name=vpc-id,Values=${VPC_ID}" \
     --query "RouteTables[*].[RouteTableId,Tags[?Key=='Name'].Value|[0],Routes[*].DestinationCidrBlock,Associations[*].SubnetId]" \
     --output json
   ```
   Notice that the private subnet is not explicitly associated with the custom route table; it remains implicitly associated with the VPC's main route table (which contains only local VPC routes, keeping it private).

## Done When
- [ ] Public subnet `10.0.1.0/24` has `MapPublicIpOnLaunch` set to `true`.
- [ ] Private subnet `10.0.2.0/24` has `MapPublicIpOnLaunch` set to `false`.
- [ ] Internet Gateway is provisioned and in the `available` state attached to the VPC.
- [ ] Route table `day34-public-rt` contains target `0.0.0.0/0` pointing to the IGW and is associated with `PUB_SUBNET_ID`.
- [ ] Private subnet remains routing traffic only within `10.0.0.0/16` (local route).

## Cost and Cleanup
Expected Cost: **$0.00** — VPCs, subnets, route tables, and Internet Gateways do not incur hourly charges in AWS.

To tear down all resources cleanly in reverse dependency order:
```bash
REGION="us-east-1"

# 1. Disassociate and delete custom route table
ASSOC_ID=$(aws ec2 describe-route-tables \
  --region "${REGION}" \
  --route-table-ids "${PUB_RT_ID}" \
  --query "RouteTables[0].Associations[?SubnetId=='${PUB_SUBNET_ID}'].RouteTableAssociationId" \
  --output text)
[ -n "${ASSOC_ID}" ] && aws ec2 disassociate-route-table --region "${REGION}" --association-id "${ASSOC_ID}"
aws ec2 delete-route-table --region "${REGION}" --route-table-id "${PUB_RT_ID}"

# 2. Detach and delete Internet Gateway
aws ec2 detach-internet-gateway --region "${REGION}" --vpc-id "${VPC_ID}" --internet-gateway-id "${IGW_ID}"
aws ec2 delete-internet-gateway --region "${REGION}" --internet-gateway-id "${IGW_ID}"

# 3. Delete subnets
aws ec2 delete-subnet --region "${REGION}" --subnet-id "${PUB_SUBNET_ID}"
aws ec2 delete-subnet --region "${REGION}" --subnet-id "${PRIV_SUBNET_ID}"

# 4. Delete VPC
aws ec2 delete-vpc --region "${REGION}" --vpc-id "${VPC_ID}"

echo "All networking resources deleted successfully."
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| VPC Subnet (AZ-specific) | Subnet (Regional, spans AZs) | Subnet (Regional, spans zones) |
| Internet Gateway (IGW) | Default Internet Route / Azure NAT Gateway | Default Internet Gateway Route |
| Custom Route Table | User-Defined Route Table (UDR) | Custom VPC Route |
| Public IP auto-assignment | Public IP allocation on NIC | Ephemeral External IP |

- 📖 [Azure User Defined Routes Documentation](https://learn.microsoft.com/en-us/azure/virtual-network/manage-route-table)
- 📖 [Google Cloud Routes Documentation](https://cloud.google.com/vpc/docs/routes)

## Stretch Goal
Calculate the number of available IP addresses for a `/24` subnet in AWS versus standard networking. In standard IPv4 networking, a `/24` has 256 total and 254 usable addresses (excluding `.0` network and `.255` broadcast). In AWS, verify via `aws ec2 describe-subnets --subnet-ids $PUB_SUBNET_ID --query "Subnets[0].AvailableIpAddressCount"` why AWS reports 251 available IP addresses (AWS reserves `.0` network, `.1` VPC router, `.2` Amazon DNS server, `.3` future use, and `.255` network broadcast).

## Common Mistakes
- **Modifying the Main Route Table directly**: Adding `0.0.0.0/0 -> igw` to the Main Route Table turns every new subnet into a public subnet by default, risking accidental database exposure. Always create a separate custom route table for public subnets.
- **Attempting to delete a VPC with attached IGW or active subnets**: AWS prevents VPC deletion while dependencies exist. You must delete subnets and detach the IGW first.
- **Assuming public subnets provide outbound internet access to private subnets**: An IGW only enables traffic for instances with public IPs located in subnets with a route to the IGW. Private subnets require a NAT Gateway (or NAT instance) to reach the internet.
