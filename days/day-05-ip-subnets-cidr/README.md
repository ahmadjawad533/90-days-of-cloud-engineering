# Day 05: IP Addresses, Subnets, and CIDR

[← Previous Day](../day-04-tcp-ip-and-osi-model/README.md) | [Next Day →](../day-06-load-balancing-and-cdns/README.md)

## Goal
Master IPv4 structure, Classless Inter-Domain Routing (CIDR) notation, subnet masks, and RFC 1918 private networking to confidently design cloud Virtual Private Cloud (VPC) network architectures.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [What is a Subnet? - Cloudflare](https://www.cloudflare.com/learning/network-layer/what-is-a-subnet/) — Introduction to IP addressing, network vs. host bits, subnet masks, and network segmentation.
- 📖 [VPC CIDR Blocks - AWS Documentation](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-cidr-blocks.html) — Practical guide to IPv4 and IPv6 CIDR block allocation and sizing in cloud virtual private clouds.

## Do
1. Create a workspace directory for today's exercises:
   ```bash
   mkdir -p ~/cloud-engineering-journey/day-05
   cd ~/cloud-engineering-journey/day-05
   ```

2. Document IPv4 fundamentals and RFC 1918 private ranges in `networking_cheatsheet.md`:
   ```bash
   cat << 'EOF' > networking_cheatsheet.md
   # IPv4 Addressing & CIDR Fundamentals

   ## IPv4 Structure
   - 32 bits total, grouped into 4 octets of 8 bits each (e.g., `192.168.1.1`).
   - Each octet represents numbers from `0` (`00000000`) to `255` (`11111111`).

   ## RFC 1918 Private IP Address Ranges (Non-routable over the public internet)
   - **Class A:** `10.0.0.0/8` (`10.0.0.0` to `10.255.255.255`) — 16,777,216 IPs. Typical for enterprise VPCs.
   - **Class B:** `172.16.0.0/12` (`172.16.0.0` to `172.31.255.255`) — 1,048,576 IPs. Standard AWS default VPC range (`172.31.0.0/16`).
   - **Class C:** `192.168.0.0/16` (`192.168.0.0` to `192.168.255.255`) — 65,536 IPs. Standard home router networks.

   ## CIDR Prefix Quick Reference
   | CIDR Prefix | Subnet Mask | Total IP Addresses | Usable IPs in standard on-prem | Usable IPs in AWS Subnet (minus 5) |
   |:---|:---|:---|:---|:---|
   | `/16` | 255.255.0.0 | 65,536 (2^16) | 65,534 | 65,531 |
   | `/20` | 255.255.240.0 | 4,096 (2^12) | 4,094 | 4,091 |
   | `/24` | 255.255.255.0 | 256 (2^8) | 254 | 251 |
   | `/26` | 255.255.255.192 | 64 (2^6) | 62 | 59 |
   | `/28` | 255.255.255.240 | 16 (2^4) | 14 | 11 |
   | `/32` | 255.255.255.255 | 1 (Single Host) | 1 | N/A (Cannot be a subnet) |

   ## The 5 Reserved IPs in AWS VPC Subnets
   In every subnet created inside an AWS VPC, AWS automatically reserves 5 IP addresses:
   1. `.0`: Network address.
   2. `.1`: Reserved by AWS for the VPC router.
   3. `.2`: Reserved by AWS for DNS (AmazonProvidedDNS).
   4. `.3`: Reserved by AWS for future use.
   5. `.255`: Network broadcast address (AWS does not support broadcast, but reserves it).
   EOF
   ```

3. Build a Python CIDR calculator using Python's built-in `ipaddress` standard library:
   ```bash
   cat << 'EOF' > cidr_calculator.py
   import ipaddress
   import sys

   def analyze_cidr(cidr_str):
       try:
           net = ipaddress.ip_network(cidr_str, strict=False)
       except ValueError as e:
           print(f"Error: {e}")
           return

       total_ips = net.num_addresses
       aws_usable = max(0, total_ips - 5) if net.prefixlen <= 28 else 0

       print("=" * 50)
       print(f"CIDR Block:              {net}")
       print(f"Netmask:                 {net.netmask}")
       print(f"Network Address:         {net.network_address}")
       print(f"Broadcast Address:       {net.broadcast_address}")
       print(f"Total IP Addresses:      {total_ips}")
       print(f"Standard Usable Hosts:   {max(0, total_ips - 2)}")
       print(f"AWS VPC Usable IPs:      {aws_usable}")
       print(f"Is Private Network:      {net.is_private}")
       print("=" * 50)

   if __name__ == "__main__":
       target = sys.argv[1] if len(sys.argv) > 1 else "10.0.0.0/24"
       analyze_cidr(target)
   EOF
   ```

4. Test your calculator with different CIDR notations:
   ```bash
   python3 cidr_calculator.py 10.0.0.0/16
   python3 cidr_calculator.py 172.16.1.0/24
   python3 cidr_calculator.py 192.168.50.0/28
   ```

5. Practice subnet splitting. Use Python to carve a `/24` network into smaller `/26` subnets:
   ```bash
   python3 -c "import ipaddress; net = ipaddress.ip_network('10.0.1.0/24'); print('\n'.join(str(sub) for sub in net.subnets(new_prefix=26)))"
   ```
   Notice that one `/24` (256 IPs) cleanly splits into four `/26` subnets (64 IPs each: `10.0.1.0/26`, `10.0.1.64/26`, `10.0.1.128/26`, `10.0.1.192/26`).

## Done When
- [ ] You can calculate the formula for total IPs: `2^(32 - prefix_length)`.
- [ ] You can list the 3 private RFC 1918 address spaces (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- [ ] You know why an AWS `/24` subnet has 251 usable IPs instead of 254.
- [ ] You ran `cidr_calculator.py` and inspected subnet metrics.

## Cost and Cleanup
$0 — no cloud resources used.

## Stretch Goal
Design a full production VPC layout for a 2-tier application in `vpc_plan.md`:
- Main VPC: `10.0.0.0/16` (65,536 IPs)
- Availability Zone A:
  - Public Subnet (Web / ALB): `10.0.1.0/24`
  - Private Subnet (Backend Apps & DB): `10.0.10.0/24`
- Availability Zone B:
  - Public Subnet (Web / ALB): `10.0.2.0/24`
  - Private Subnet (Backend Apps & DB): `10.0.20.0/24`
Verify that none of the subnet IP ranges overlap using your Python script.

## Common Mistakes
- **Forgetting AWS's 5 reserved IP addresses**: Sizing a subnet as `/29` only yields 8 - 5 = 3 usable IP addresses, which can cause resource provisioning failures during autoscaling.
- **Overlapping CIDRs across connected VPCs or on-premises networks**: If you peer two VPCs that both use `10.0.0.0/16`, traffic cannot route between them due to IP address conflict. Always plan non-overlapping CIDR blocks.
- **Making subnets too large or too small**: Allocating a `/16` to a single microservice wastefully limits the rest of your organization's IP budget, while allocating `/28` to an Elastic Kubernetes Service (EKS) cluster will quickly exhaust Pod IPs.
