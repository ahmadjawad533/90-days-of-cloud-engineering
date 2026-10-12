# Day 33: AWS VPC Fundamentals
[← Previous Day](../day-32-aws-iam/README.md) | [Next Day →](../day-34-subnets-routes-gateways/README.md)

## Goal
Understand Amazon Virtual Private Cloud (VPC) architecture by designing an IP addressing plan and provisioning an isolated custom VPC with DNS features enabled using the AWS CLI.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [Amazon VPC User Guide](https://docs.aws.amazon.com/vpc/latest/userguide/) — Official AWS overview of VPC architecture, isolated virtual networks, components, and networking limits.
- 📖 [Work with VPCs](https://docs.aws.amazon.com/vpc/latest/userguide/configure-your-vpc.html) — AWS documentation on CIDR block sizing, DNS attributes, and VPC lifecycle management.

## Do
In this lab, you will explore AWS networking by inspecting your default VPC, provisioning a dedicated custom VPC with CIDR `10.0.0.0/16`, configuring DNS resolution parameters, and examining the default resources AWS automatically creates.

1. **Inspect your existing default VPC in your target region (e.g., us-east-1)**:
   ```bash
   aws ec2 describe-vpcs \
     --filters "Name=isDefault,Values=true" \
     --query "Vpcs[*].[VpcId,CidrBlock,IsDefault]" \
     --output table
   ```

2. **Create a custom VPC with a `/16` CIDR block**:
   ```bash
   VPC_ID=$(aws ec2 create-vpc \
     --cidr-block 10.0.0.0/16 \
     --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=lab-vpc-fundamentals},{Key=Environment,Value=Learning}]' \
     --query "Vpc.VpcId" \
     --output text)

   echo "Created VPC ID: ${VPC_ID}"
   ```

3. **Enable DNS hostnames and DNS resolution attributes**:
   By default, custom VPCs have DNS resolution enabled but DNS hostnames disabled. Enable both:
   ```bash
   aws ec2 modify-vpc-attribute \
     --vpc-id "${VPC_ID}" \
     --enable-dns-support '{"Value":true}'

   aws ec2 modify-vpc-attribute \
     --vpc-id "${VPC_ID}" \
     --enable-dns-hostnames '{"Value":true}'
   ```

4. **Verify VPC attributes**:
   ```bash
   aws ec2 describe-vpc-attribute \
     --vpc-id "${VPC_ID}" \
     --attribute enableDnsSupport

   aws ec2 describe-vpc-attribute \
     --vpc-id "${VPC_ID}" \
     --attribute enableDnsHostnames
   ```

5. **Examine the default components automatically created with the VPC**:
   When a VPC is created, AWS automatically generates a main Route Table, a default Network ACL (NACL), and a default Security Group. Inspect them:
   ```bash
   # Main Route Table
   aws ec2 describe-route-tables \
     --filters "Name=vpc-id,Values=${VPC_ID}" \
     --query "RouteTables[*].[RouteTableId,Routes]" \
     --output json

   # Default Security Group
   aws ec2 describe-security-groups \
     --filters "Name=vpc-id,Values=${VPC_ID}" "Name=group-name,Values=default" \
     --query "SecurityGroups[*].[GroupId,GroupName,Description]" \
     --output table

   # Default Network ACL
   aws ec2 describe-network-acls \
     --filters "Name=vpc-id,Values=${VPC_ID}" \
     --query "NetworkAcls[*].[NetworkAclId,IsDefault]" \
     --output table
   ```

## Done When
- [ ] Custom VPC is successfully created with CIDR `10.0.0.0/16` and tagged `Name=lab-vpc-fundamentals`.
- [ ] Both `enableDnsSupport` and `enableDnsHostnames` attributes evaluate to `true`.
- [ ] You have inspected and identified the automatically created main route table, default security group, and default NACL.

## Cost and Cleanup
Expected Cost: **$0.00** — Amazon VPCs and their basic routing components are completely free. You only pay for active resources deployed inside them (like NAT Gateways or VPNs).

To delete the custom VPC created today:
```bash
# If VPC_ID is not set in your shell session, find it:
VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=tag:Name,Values=lab-vpc-fundamentals" \
  --query "Vpcs[0].VpcId" \
  --output text)

# Delete the VPC (AWS automatically deletes its default route table, NACL, and default security group)
aws ec2 delete-vpc --vpc-id "${VPC_ID}"

echo "VPC ${VPC_ID} successfully deleted."
```

## Azure / GCP Equivalents
| AWS | Azure | GCP |
|-----|-------|-----|
| Amazon VPC (Regional) | Azure Virtual Network (VNet) (Regional) | Google Cloud VPC (Global by default) |
| VPC CIDR Block (e.g. 10.0.0.0/16) | VNet Address Space (Address prefixes) | Subnet IP Ranges (CIDRs defined per subnet) |
| Main Route Table | Azure System Default Route Table | Default routes (0.0.0.0/0 to internet gateway) |
| DNS Attributes (`enableDnsHostnames`) | Azure DNS Private Zones / Azure-provided DNS | Cloud DNS / Internal DNS |

- 📖 [Azure Virtual Network Documentation](https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview)
- 📖 [Google Cloud VPC Documentation](https://cloud.google.com/vpc/docs/overview)

## Stretch Goal
Explore secondary CIDR blocks: Add an additional non-overlapping CIDR block (e.g., `100.64.0.0/16` from the Carrier-Grade NAT space) to your VPC using `aws ec2 associate-vpc-cidr-block`, and observe how the VPC's main route table automatically updates its local routes.

## Common Mistakes
- **Overlapping CIDR blocks**: Choosing an IP range that overlaps with your home/corporate network or another peered VPC, which prevents future network peering and hybrid connections.
- **Forgetting to enable DNS hostnames**: Leaving `enableDnsHostnames` disabled prevents EC2 instances in public subnets from receiving public DNS names (`ec2-xx-xx-xx-xx.compute-1.amazonaws.com`).
- **Attempting to delete a default security group or main route table**: AWS manages the default security group and main route table; they cannot be manually deleted and are only cleaned up when the VPC itself is deleted.
