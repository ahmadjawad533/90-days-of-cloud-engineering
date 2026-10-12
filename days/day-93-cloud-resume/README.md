# Day 93: Building Your Cloud Resume
[← Previous Day](../day-92-study-strategies/README.md) | [Next Day →](../day-94-interview-prep/README.md)

## Goal
Transform your 90 days of practical hands-on labs and capstone project into a compelling, ATS-friendly cloud engineer resume and LinkedIn profile.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [The Cloud Resume Challenge](https://cloudresumechallenge.dev/docs/the-challenge/aws/) — Industry-recognized open-source project framework for showcasing real-world cloud engineering skills.
- 📖 [Google's "XYZ" Resume Bullet Formula](https://www.inc.com/bill-murphy-jr/google-recruiters-say-these-5-resume-tips-including-x-y-z-formula-will-improve-your-odds-of-getting-hired-at-google-or-anywhere-else.html) — Guide on phrasing accomplishments: *Accomplished [X] as measured by [Y], by doing [Z]*.

## Do
In today's career milestone, you will rewrite your technical resume to showcase practical infrastructure engineering skills, format your capstone project with measurable metrics, optimize your GitHub profile, and structure your skills matrix.

1. **Adopt the Google "XYZ" Formula for Infrastructure**:
   Replace passive job descriptions with impact-driven engineering accomplishments:
   - ❌ *Weak*: "Configured AWS VPC and deployed Docker containers on ECS."
   - ✅ *Strong (XYZ)*: "Architected a multi-tier AWS VPC spanning 2 AZs and deployed containerized REST APIs onto ECS Fargate, reducing deployment time by 60% through automated GitHub Actions CI/CD pipelines."
   - ❌ *Weak*: "Used Terraform to manage cloud infrastructure."
   - ✅ *Strong (XYZ)*: "Automated provisioning of 15+ AWS resources using modular Terraform with remote S3 state locking and DynamoDB, eliminating manual configuration drift."

2. **Structure the Technical Skills Matrix**:
   Group your technical skills into clean, industry-standard categories:
   ```markdown
   ### Technical Skills
   - **Cloud Platforms**: Amazon Web Services (VPC, EC2, ECS Fargate, RDS PostgreSQL, S3, Secrets Manager, CloudWatch, IAM)
   - **Infrastructure as Code & Config**: Terraform, CloudFormation, Ansible basics
   - **Containers & Orchestration**: Docker, Docker Compose, Kubernetes, Helm, Amazon ECR
   - **CI/CD & Automation**: GitHub Actions, Bash Shell Scripting, Git, Trivy Security Scanner
   - **Languages & Databases**: Python (boto3, Flask, pytest), SQL, PostgreSQL
   - **Networking & Security**: TCP/IP, DNS, CIDR, Load Balancing (ALB), TLS/SSL, IAM Least Privilege
   ```

3. **Frame Your Capstone Project as Production Work**:
   Create a dedicated section on your resume for your capstone project:
   ```markdown
   ### Projects
   **Cloud-Native Task Manager (Production Multi-Tier Web Application)**
   *GitHub: github.com/your-username/cloud-native-task-manager | AWS | Terraform | Docker | CI/CD*
   - Engineered a 3-tier REST API backend using Python Flask and PostgreSQL with automated CRUD and health check endpoints.
   - Provisioned 100% of AWS infrastructure (custom VPC, public/private subnets across 2 AZs, security groups, ECS Fargate, RDS) using modular Terraform code.
   - Built a multi-stage Docker container image running as a non-root user, decreasing image size by 55% and passing zero-vulnerability Trivy container scans.
   - Automated testing, linting, security scans, and container pushes to Amazon ECR via GitHub Actions on every pull request.
   - Established end-to-end observability using structured JSON application logging, CloudWatch CPU/Memory alarms, and Amazon SNS alerts.
   ```

4. **Audit Your GitHub Profile**:
   Ensure your public GitHub account presents an engineer's portfolio:
   - **Profile README**: Add a brief introduction detailing your cloud focus, tech stack icons, and links to your capstone repository.
   - **Pinned Repositories**: Pin your `cloud-native-task-manager` repository and your `90-days-of-cloud-engineering` fork.
   - **Repository Hygiene**: Check that each repository has a clean description, descriptive topics/tags (`aws`, `terraform`, `docker`, `python`), a clear README with architecture diagrams, and a permissive open-source license (MIT).

5. **Update LinkedIn Headline and Summary**:
   - **Headline**: `Junior Cloud Engineer | AWS, Terraform, Docker, Python, CI/CD`
   - **About Section**: Summarize your journey, passion for automation, hands-on experience building multi-tier AWS architectures with Terraform, and link to your GitHub.

## Done When
- [ ] Technical skills matrix organized into cloud, IaC, containers, CI/CD, and networking.
- [ ] Capstone project written out using the XYZ formula with metrics and tool mentions.
- [ ] Resume formatted cleanly as a 1-page PDF (single column, ATS-friendly text).
- [ ] GitHub profile updated with pinned repositories and README.

## Cost and Cleanup
Expected Cost: **$0.00 — no cloud resources used.**

Resume drafting and GitHub profile updates are completely free.

## Stretch Goal
Deploy your resume as a static HTML/CSS single-page application hosted on Amazon S3 with HTTPS enabled via Amazon CloudFront and a custom domain via Route 53 (the core of the Cloud Resume Challenge).

## Common Mistakes
- **Listing technologies you cannot talk about**: If you list Kubernetes or Terraform on your resume, you must be prepared to answer interview questions about pod networking or state locks. Only list what you have built with.
- **Using complex multi-column graphic templates**: Graphic-heavy resumes with skill bars (e.g. "Python: 80%") fail Applicant Tracking System (ATS) parsers. Use clean, single-column, plain text or simple markdown-to-PDF formatting.
- **Omitting GitHub links or having empty repositories**: Employers want proof of code. A link to an active GitHub repository with clear commit messages and READMEs sets you apart from 90% of applicants.
