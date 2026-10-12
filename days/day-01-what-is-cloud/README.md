# Day 01: What Is Cloud Computing

[← Previous Day](../../START_HERE.md) | [Next Day →](../day-02-cloud-service-models/README.md)

## Goal
Understand what cloud computing is, the transition from on-premises data centers to on-demand resources, and how global cloud infrastructure delivers scalable computing power.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [What Is Cloud Computing? - AWS](https://aws.amazon.com/what-is-cloud-computing/) — An overview of cloud computing fundamentals, advantages, and key deployment concepts.
- 📖 [What Is Cloud Computing? - Microsoft Azure](https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-are-private-public-hybrid-clouds) — A clear introduction to cloud service definitions, public vs. private infrastructure, and scalability models.

## Do
Even before creating a cloud provider account, you can interact with public cloud edge locations and infrastructure directly from your command line.

1. Create a dedicated workspace directory for your 90-day learning journey and navigate into it:
   ```bash
   mkdir -p ~/cloud-engineering-journey/day-01
   cd ~/cloud-engineering-journey/day-01
   ```

2. Test network latency to major public cloud provider global endpoints using `ping`:
   ```bash
   # AWS global portal
   ping -c 4 aws.amazon.com

   # Azure global portal
   ping -c 4 azure.microsoft.com

   # Google Cloud global portal
   ping -c 4 cloud.google.com
   ```
   Note the round-trip time (`rtt` or `avg` in ms). Cloud providers use global Content Delivery Networks (CDNs) and edge locations to ensure requests resolve to servers physically close to you.

3. Inspect the DNS records and Anycast IP addresses behind cloud provider domains using `host` or `dig`:
   ```bash
   host aws.amazon.com
   host azure.microsoft.com
   host cloud.google.com
   ```

4. Use `curl` to fetch HTTP headers from a public cloud endpoint and examine response headers such as `server`, `date`, and caching indicators:
   ```bash
   curl -I -s https://aws.amazon.com | grep -E "HTTP|Server|x-amz|date"
   ```

5. Create a personal study note `cloud_notes.md` summarizing the six key advantages of cloud computing (trade capital expense for variable expense, benefit from massive economies of scale, stop guessing capacity, increase speed and agility, stop spending money running data centers, and go global in minutes):
   ```bash
   cat << 'EOF' > cloud_notes.md
   # Cloud Computing Fundamentals

   ## Definition
   On-demand delivery of IT resources over the internet with pay-as-you-go pricing.

   ## Key Advantages
   1. Trade capital expense (CapEx) for variable expense (OpEx).
   2. Massive economies of scale.
   3. Stop guessing infrastructure capacity.
   4. High velocity, agility, and faster deployment cycles.
   5. Elimination of physical data center maintenance costs.
   6. Global reach in minutes via provider backbone networks.
   EOF
   ```

## Done When
- [ ] You can explain what cloud computing is in plain English to a non-technical person.
- [ ] You have run connectivity tests to AWS, Azure, and GCP public endpoints from your terminal.
- [ ] You created your study workspace directory and saved your `cloud_notes.md` file.

## Cost and Cleanup
$0 — no cloud resources used. Everything runs on your local machine.

## Azure / GCP Equivalents
| Cloud Concept | AWS | Azure | GCP |
|---|---|---|---|
| Web Management Console | [AWS Management Console](https://aws.amazon.com/console/) | [Azure Portal](https://portal.azure.com/) | [Google Cloud Console](https://console.cloud.google.com/) |
| Global Regions & Zones | AWS Regions & Availability Zones | Azure Regions & Availability Zones | GCP Regions & Zones |
| Service Status Dashboard | AWS Health Dashboard | Azure Status | Google Cloud Status |

- [Azure Architecture & Regions Documentation](https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview)
- [Google Cloud Regions and Zones Documentation](https://cloud.google.com/about/locations)

## Stretch Goal
Read the official AWS Cloud Economics whitepaper or documentation to analyze the financial difference between **CapEx** (Capital Expenditure: upfront hardware purchases, real estate, server cooling) and **OpEx** (Operational Expenditure: paying per second/hour for compute consumed). Write a short paragraph in `cloud_notes.md` explaining why a startup might prefer OpEx over CapEx.

## Common Mistakes
- **Confusing "the cloud" with simple internet storage**: The cloud is not just Google Drive or Dropbox; it provides complete virtualized infrastructure, including networking, programmable compute, database engines, and automated scaling.
- **Assuming cloud is always cheaper by default**: Without proper architecture, resource sizing, and cost monitoring, unmanaged cloud resources can become more expensive than on-premises hardware.
- **Thinking everything belongs in the public cloud**: Regulatory compliance, data residency laws, and legacy systems often necessitate hybrid cloud or private cloud solutions.
