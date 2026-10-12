# Day 02: Cloud Service Models (IaaS, PaaS, SaaS)

[← Previous Day](../day-01-what-is-cloud/README.md) | [Next Day →](../day-03-how-the-internet-works/README.md)

## Goal
Master the three primary cloud service models (IaaS, PaaS, SaaS) and deployment strategies (Public, Private, Hybrid) to understand where your engineering responsibilities begin and end.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [Types of Cloud Computing - AWS](https://aws.amazon.com/types-of-cloud-computing/) — Detailed explanation of cloud service models (IaaS, PaaS, SaaS) and deployment models.
- 📖 [What are Private, Public, and Hybrid Clouds? - Microsoft Azure](https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-are-private-public-hybrid-clouds) — Exploration of public, private, hybrid, and multi-cloud architectures.

## Do
1. Create a dedicated directory for today's exercises:
   ```bash
   mkdir -p ~/cloud-engineering-journey/day-02
   cd ~/cloud-engineering-journey/day-02
   ```

2. Create a reference file `service_models.md` documenting the Shared Responsibility Model across the three tiers:
   ```bash
   cat << 'EOF' > service_models.md
   # Cloud Service Models & The Shared Responsibility Model

   ## 1. Infrastructure as a Service (IaaS)
   - **What it provides:** Raw compute (virtual machines), networking (VPCs, subnets), and storage blocks.
   - **Provider manages:** Physical data centers, cooling, physical cabling, virtualization hypervisors.
   - **Customer manages:** Operating system patches, middleware, runtimes, firewall rules, application code, data backups.
   - **Examples:** AWS EC2, Azure Virtual Machines, Google Compute Engine.

   ## 2. Platform as a Service (PaaS)
   - **What it provides:** A managed execution environment to run code without provisioning underlying VMs or managing OS patching.
   - **Provider manages:** Physical hardware, virtualization, OS configuration, security patches, runtime engines.
   - **Customer manages:** Application source code, application configuration, data.
   - **Examples:** AWS Elastic Beanstalk, Azure App Service, Google App Engine, Heroku.

   ## 3. Software as a Service (SaaS)
   - **What it provides:** Complete end-user software applications accessed via web browsers or APIs.
   - **Provider manages:** Entire stack from physical infrastructure to software updates and uptime.
   - **Customer manages:** User access credentials, data input, user preferences.
   - **Examples:** Microsoft 365, Google Workspace, Salesforce, GitHub.
   EOF
   ```

3. Test how a PaaS developer experience abstracts infrastructure. In PaaS, you focus solely on application code. Create a sample micro-application in Python and run it locally:
   ```bash
   cat << 'EOF' > app.py
   from http.server import SimpleHTTPRequestHandler, HTTPServer
   import json

   class Handler(SimpleHTTPRequestHandler):
       def do_GET(self):
           self.send_response(200)
           self.send_header("Content-Type", "application/json")
           self.end_headers()
           response = {
               "message": "Hello from your application layer!",
               "service_model": "PaaS abstraction example"
           }
           self.wfile.write(json.dumps(response).encode("utf-8"))

   server = HTTPServer(("127.0.0.1", 8080), Handler)
   print("Server listening on http://127.0.0.1:8080 ... (Press Ctrl+C to stop)")
   server.serve_forever()
   EOF
   ```

4. In a second terminal window (or by running in the background), test your app endpoint:
   ```bash
   python3 app.py &
   APP_PID=$!
   sleep 1
   curl -s http://127.0.0.1:8080
   kill $APP_PID
   ```

5. Append deployment models (Public, Private, Hybrid, Multi-cloud) to your study notes:
   ```bash
   cat << 'EOF' >> service_models.md

   ## Cloud Deployment Models
   - **Public Cloud:** Resources owned by a third-party cloud provider (e.g., AWS, Azure) delivered over the internet to multiple tenants.
   - **Private Cloud:** Cloud infrastructure dedicated solely to a single organization, hosted on-premises or by a third party.
   - **Hybrid Cloud:** Connects an on-premises private environment with a public cloud, allowing data and apps to be shared between them.
   - **Multi-Cloud:** Using services from multiple distinct public cloud providers (e.g., AWS + GCP) to avoid vendor lock-in.
   EOF
   ```

## Done When
- [ ] You can explain the key differences between IaaS, PaaS, and SaaS with real-world examples.
- [ ] You can identify which layer of the stack the customer is responsible for securing in IaaS vs PaaS.
- [ ] You understand the difference between a Hybrid Cloud and a Multi-Cloud architecture.

## Cost and Cleanup
$0 — no cloud resources used.

## Azure / GCP Equivalents
| Service Category | AWS | Azure | GCP |
|---|---|---|---|
| Virtual Machines (IaaS) | [Amazon EC2](https://aws.amazon.com/ec2/) | [Azure Virtual Machines](https://azure.microsoft.com/en-us/products/virtual-machines/) | [Compute Engine](https://cloud.google.com/compute) |
| Managed Application Platform (PaaS) | [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/) | [Azure App Service](https://azure.microsoft.com/en-us/products/app-service/) | [App Engine](https://cloud.google.com/appengine) |
| Serverless Containers (PaaS) | [AWS App Runner](https://aws.amazon.com/apprunner/) | [Azure Container Apps](https://azure.microsoft.com/en-us/products/container-apps/) | [Cloud Run](https://cloud.google.com/run) |
| Managed Relational Database (PaaS) | [Amazon RDS](https://aws.amazon.com/rds/) | [Azure SQL Database](https://azure.microsoft.com/en-us/products/azure-sql/database/) | [Cloud SQL](https://cloud.google.com/sql) |

- [Azure Cloud Architecture Guide](https://learn.microsoft.com/en-us/azure/architecture/)
- [Google Cloud Architecture Framework](https://cloud.google.com/architecture/framework)

## Stretch Goal
Explore **Function as a Service (FaaS)**, also known as Serverless (e.g., AWS Lambda, Azure Functions, GCP Cloud Functions). Compare FaaS to traditional PaaS: how does per-millisecond execution billing change application architecture compared to 24/7 provisioned servers?

## Common Mistakes
- **Assuming cloud providers manage security inside your operating system on IaaS**: In IaaS, you must patch your own operating system, configure security groups, and manage SSH keys.
- **Confusing Hybrid Cloud with Multi-Cloud**: Hybrid cloud specifically bridges on-premises infrastructure with a public cloud. Using AWS and Azure together is multi-cloud.
- **Classifying managed databases like Amazon RDS strictly as IaaS**: Managed databases are PaaS solutions because the cloud provider handles the underlying operating system and database engine patching.
