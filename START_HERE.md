# 🚀 Welcome to 90 Days of Cloud Engineering!

Welcome! Whether you are completely new to tech, transitioning from another IT domain, or looking to solidify your cloud foundation, you are in the right place. 

This is a **100% free, self-paced learning path** designed to take you from core fundamentals all the way to deploying enterprise-grade cloud infrastructure and modern containerized applications. 

> **Important Note:** Day numbers are purely a guide, **not a deadline**. Life happens, concepts take time to sink in, and troubleshooting is part of being an engineer. Take your time, experiment, and learn at your own pace!

---

## 🗺️ What You Will Learn

Over the course of 90 days (plus 5 bonus career & certification days), you will build hands-on skills across the entire modern cloud engineering stack:

- **Computer Networking & Web Fundamentals:** DNS, HTTP/HTTPS, TCP/IP, OSI model, IP addressing, subnets, CIDR, load balancers, and CDNs.
- **Linux & Shell Scripting:** File system architecture, permissions, package management, process monitoring, stream manipulation (`grep`, `sed`, `awk`), and production bash scripts.
- **Version Control & Git:** Branching strategies, pull requests, code reviews, collaborative workflows, and resolving merge conflicts.
- **Python for Cloud Automation:** Core data structures, scripting, file I/O, error handling, and cloud SDK automation using `boto3`.
- **Core Cloud Services (AWS with Azure & GCP equivalents):** IAM identities & policies, VPC networking, security groups, EC2 compute, EBS/S3 storage, and RDS relational databases.
- **Containers & Docker:** Containerization concepts, Dockerfiles, multi-stage builds, networking, storage volumes, Docker Compose, and registries.
- **Kubernetes (K8s):** Architecture, Pods, Deployments, Services, ConfigMaps, Secrets, Helm package management, and managed clusters (AWS EKS).
- **Infrastructure as Code (IaC):** Declarative infrastructure using Terraform (providers, resources, state, modularization) and configuration management with Ansible.
- **CI/CD Automation:** Automated workflows, GitHub Actions, continuous testing, secret management, and automated release pipelines.
- **Monitoring & Observability:** Metrics, logging, Prometheus, Grafana dashboards, AWS CloudWatch, log aggregation, and alerting strategies.
- **Cloud Security & Cost Optimization:** Principle of least privilege, container scanning, secret rotation, FinOps best practices, and resource tagging.
- **Capstone Project:** Architecting, deploying, securing, and monitoring a production-ready three-tier application end-to-end.
- **Certifications & Career Readiness:** Industry certification roadmaps, resume crafting, cloud portfolio development, and technical interview preparation.

---

## 🎒 What You Will Need

Before you dive into Day 1, make sure you have the following prerequisites ready:

- **A laptop or desktop:** Any modern operating system will work (Linux, macOS, or Windows).  
  *Windows users:* Install and configure **WSL2** (Windows Subsystem for Linux with Ubuntu) so you have a native Linux environment.
- **A GitHub account (Free):** Required for version control, portfolio building, and running CI/CD workflows. [Sign up here](https://github.com/).
- **An AWS Free Tier Account:** A free account is required for the cloud labs.  
  *Note:* AWS requires a valid credit or debit card during sign-up for identity verification.  
  - The vast majority of labs are intentionally designed to remain completely within the Free Tier limits.  
  - **Always tear down and terminate all cloud resources immediately after completing each lab.**
- **A modern code editor:** [VS Code](https://code.visualstudio.com/) is recommended (free and cross-platform).
- **Terminal access:** Bash, Zsh, or WSL terminal.
- **Time commitment:** Approximately **1–2 hours per day**.
- **Mindset:** Curiosity, patience, and persistence when troubleshooting.

---

## ☁️ Cloud Cost Safety Guide (CRITICAL - READ BEFORE DAY 1)

> ### ⚠️ WARNING: READ THIS BEFORE CREATING ANY CLOUD RESOURCES!
> Cloud providers charge for running services. Forgetting to delete a resource or creating an oversized instance can lead to unexpected charges. Follow these rules religiously.

### 1. Set a Billing Alarm on Day 1 (AWS Step-by-Step)
Do not launch a single EC2 instance or RDS database until you have configured these alarms:

1. **Log in to the AWS Management Console** as the root user or administrative IAM user.
2. Search for and navigate to **AWS Billing and Cost Management**.
3. In the left navigation pane, select **Budgets** (or **AWS Budgets**), then click **Create budget**.
4. **Create a Zero Spend Budget:**
   - Choose **Cost budget (recommended)**.
   - Select the **Zero spend budget** template.
   - Provide your email address to receive an alert the moment your account exceeds **$0.01**.
5. **Create a $5 Safety Budget:**
   - Click **Create budget** again and choose **Customize (advanced)** > **Cost budget**.
   - Set Budget amount to **Fixed**, monthly, and enter **$5.00**.
   - Configure alert thresholds:
     - Alert 1: **50%** of budgeted amount ($2.50)
     - Alert 2: **80%** of budgeted amount ($4.00)
     - Alert 3: **100%** of budgeted amount ($5.00)
   - Add your email notification recipient for each threshold.
6. **Enable AWS Cost Explorer:**
   - Navigate to **Cost Explorer** in the Billing console and click **Enable Cost Explorer** (it takes up to 24 hours to generate the first dataset).

### 2. Never Leave Resources Running
- Cloud billing is utility-based (per-second or per-hour).
- **Rule of thumb:** If you walk away from your desk, make sure your lab resources are stopped or deleted.
- Every lab guide includes explicit **Teardown / Cleanup** instructions. Treat teardown as a mandatory step of finishing any lab.

### 3. Use the Free Tier Wisely
Understand how the [AWS Free Tier](https://aws.amazon.com/free/) works. Free Tier offerings fall into three categories:
- **Always Free:** Services that are free indefinitely up to specific limits (e.g., AWS Lambda 1M free requests/month, CloudWatch 10 custom metrics/alarms).
- **12 Months Free:** Services free for 12 months following your initial sign-up date (e.g., 750 hours/month of `t2.micro` or `t3.micro` EC2 instances, 5 GB of standard S3 storage, 750 hours of `db.t2.micro` / `db.t3.micro` RDS).
- **Short-Term Trials:** Short trial periods starting from service activation (e.g., Amazon GuardDuty 30-day trial).

### 4. Check Your Bill Daily During Cloud Labs
- Make it a morning or end-of-day ritual: log in to the **AWS Console > Billing Dashboard**.
- Review **Top cost trends** and verify that month-to-date spend matches your expectations.

### 5. If Something Costs Money Unexpectedly
If you receive a budget alert or spot unexpected charges:
1. **Don't panic.** Small mistakes happen to every engineer.
2. **Identify and terminate resources:**
   - Navigate to **Cost Explorer > Cost and usage reports** to see which specific service is generating charges.
   - Go to that service console (e.g., EC2, RDS, NAT Gateways, Elastic IPs) and terminate, delete, or release the resources immediately.
3. **Check ALL regions:**
   - A common beginner mistake is accidentally launching an instance in `us-east-1` while inspecting `us-west-2`.
   - Check the region selector in the top-right corner or use AWS Cost Explorer / Resource Groups Tag Editor to find resources across all AWS regions.
4. **Contact AWS Support:**
   - If you accidentally incur a bill due to an honest learning mistake, open a support ticket under **Account and Billing Support**. Explain politely that you are a student learning cloud engineering and inadvertently left a resource running. AWS Support is well known for waiving small accidental educational charges once as a courtesy.

### 6. Azure Cost Safety
If you are practicing with Microsoft Azure:
- Review the official [Azure Cost Management + Billing Documentation](https://learn.microsoft.com/en-us/azure/cost-management-billing/).
- Set up a spending limit and configure Azure Budget alerts at 50%, 75%, and 100% of your threshold.

### 7. GCP Cost Safety
If you are practicing with Google Cloud Platform:
- Review the official [Google Cloud Billing Documentation](https://cloud.google.com/billing/docs/).
- Create a Cloud Billing budget and set up automated budget alert thresholds and email alerts.

---

## 🛠️ How to Use This Repository

1. **Fork the repository:** Click the **Fork** button in the top-right corner of GitHub to copy this repository to your personal GitHub account.
2. **Clone it locally:** Clone your forked repo to your computer using your terminal:
   ```bash
   git clone https://github.com/<your-username>/90-days-of-cloud-engineering.git
   cd 90-days-of-cloud-engineering
   ```
3. **Set up your tracker:** Copy or open [PROGRESS_TRACKER.md](PROGRESS_TRACKER.md) in your fork to record your journey.
4. **Start Day 1:** Navigate to [days/day-01-what-is-cloud/README.md](days/day-01-what-is-cloud/README.md) and dive into the material.
5. **Mark your progress:** After completing a day's exercises and cleanup, check off the corresponding box in your tracker and commit your changes to GitHub.
6. **Get help when stuck:** Open a discussion or issue in the repository, or consult the recommended documentation links.

---

## 📊 How to Track Your Progress

In the root of this repository, you will find [PROGRESS_TRACKER.md](PROGRESS_TRACKER.md). 

- It includes a complete matrix of all 90 core days and 5 bonus days with checkboxes, completion dates, and space for your personal notes.
- Checking off items keeps you accountable and creates a tangible record of your effort.
- **Share your progress:** Share your daily insights, lab screenshots, and milestones on LinkedIn, X (Twitter), or your personal blog using the hashtag **`#90DaysOfCloudEngineering`**. Building in public expands your professional network and reinforces your knowledge!

---

## 💡 Tips for Success

- **Consistency beats intensity:** 1 hour every single day is far more effective than an 8-hour marathon once every two weeks.
- **Type every command yourself:** Avoid copying and pasting code and shell commands. Typing develops muscle memory and helps you spot syntax nuances and errors.
- **Take notes:** Keep a digital notebook or write markdown notes for concepts you found challenging.
- **Build in public:** Document your journey. Write short posts explaining how you solved a problem or what you deployed.
- **It is okay to repeat a day:** If a concept (like subnets, Kubernetes services, or Terraform state) does not click immediately, spend an extra day on it. Engineering is about depth of understanding, not speed.
- **Ask for help early:** If you are stuck on a bug for more than an hour, step back, read error logs carefully, search official docs, and ask for guidance.

---

## 🧭 Navigation

- 🏠 **Repository Overview:** [README.md](README.md)
- 📝 **Progress Tracker:** [PROGRESS_TRACKER.md](PROGRESS_TRACKER.md)
- 🏁 **Get Started:** [Day 1: What Is Cloud Computing](days/day-01-what-is-cloud/README.md)
