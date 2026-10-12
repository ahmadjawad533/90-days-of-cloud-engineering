# Day 94: Interview Preparation
[← Previous Day](../day-93-cloud-resume/README.md) | [Next Day →](../day-95-whats-next/README.md)

## Goal
Prepare for cloud engineering technical interviews by mastering common architectural questions, behavioral scenarios using the STAR method, and live troubleshooting frameworks.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [AWS Interview Questions & Architecture Patterns](https://aws.amazon.com/architecture/) — Official architecture whitepapers and patterns commonly evaluated in technical interviews.
- 📖 [The STAR Method for Behavioral Interviews](https://en.wikipedia.org/wiki/Situation,_task,_action_and_result) — Structured behavioral interviewing technique (Situation, Task, Action, Result).

## Do
In today's career prep milestone, you will practice answering the 10 most common junior cloud engineering technical questions, prepare your behavioral STAR stories, and practice a systematic 5-step troubleshooting methodology.

1. **Master the Top 10 Technical Cloud Interview Questions**:
   Review and write concise verbal answers for each of these foundational questions:
   1. *What happens under the hood from the moment you type a URL into your browser until the page renders?* (DNS resolution, TCP 3-way handshake, TLS negotiation, HTTP request routing through CDN/ALB, web server response).
   2. *What is the difference between a Security Group and a Network ACL (NACL)?* (Security Groups are stateful and operate at the ENI instance level; NACLs are stateless and operate at the subnet boundary).
   3. *Why do we use private subnets for application servers and databases?* (Isolation from direct internet routing; ingress is only allowed through load balancers or bastion hosts, egress via NAT).
   4. *What problem does Terraform remote state locking solve?* (Prevents concurrent executions from corrupting the `.tfstate` file when multiple engineers or CI/CD pipelines run `apply`).
   5. *What is the difference between an ECS Task Execution Role and an ECS Task Role?* (Execution role is for the ECS agent to fetch ECR images and post CloudWatch logs; Task role is for the application container itself to access AWS services).
   6. *How does Docker container networking work when exposed on a host?* (Port mapping via iptables rules routes traffic from the host network namespace to the container's virtual bridge interface).
   7. *What is a multi-stage Docker build and why is it critical?* (Separates build dependencies/compilers from runtime environments, resulting in smaller, more secure production images).
   8. *How do you prevent hardcoding secrets into Git or container images?* (Use AWS Secrets Manager or SSM Parameter Store; inject at runtime via environment variables or secret volumes; run pre-commit secret scanners like Trivy).
   9. *What is the difference between horizontal and vertical scaling?* (Vertical is resizing CPU/RAM of an existing instance; horizontal is adding more instances behind a load balancer).
   10. *If your application container crashes on launch in ECS or Kubernetes, how do you troubleshoot?* (Inspect container exit code, check orchestrator event logs, review stdout/stderr in CloudWatch or `kubectl logs`, verify health check endpoint, confirm database connectivity and environment variables).

2. **Structure 3 Core Behavioral Stories Using STAR**:
   Every interview asks behavioral questions ("Tell me about a time when..."). Format your experiences using **Situation, Task, Action, Result**:
   - **Story 1: Overcoming a Technical Roadblock (Debugging/Troubleshooting)**
     - *Situation*: While setting up private subnets, my ECS containers failed to pull Docker images from ECR.
     - *Task*: Identify why the tasks were failing to initialize in private subnets.
     - *Action*: Inspected CloudWatch logs and VPC route tables. Realized private subnets lacked either a NAT Gateway or VPC Endpoints for ECR. Added VPC endpoints for ECR and S3 using Terraform.
     - *Result*: Tasks pulled images successfully with zero exposure to public internet, improving security posture and saving NAT bandwidth costs.
   - **Story 2: Managing Trade-offs (Security vs. Delivery Speed)**
   - **Story 3: Learning a Complex Tool from Scratch (Terraform / Docker)**

3. **Practice the 5-Step System Troubleshooting Framework**:
   When given an open-ended troubleshooting scenario during an interview ("A customer reports the site is throwing 500 errors. What do you do?"), follow this structured approach:
   1. **Scope the Problem**: Who is affected? All users or a subset? When did it start? Was there a recent deployment?
   2. **Inspect the Edge / Entry Point**: Check DNS resolution, CDN status, and ALB metric graphs (HTTP 502 vs 504 vs 500).
   3. **Check Application Compute & Logs**: Look at container health checks, CPU/memory usage, and CloudWatch application logs for unhandled exceptions or stack traces.
   4. **Inspect Downstream Dependencies**: Is the database reachable? Are connection pools exhausted? Are third-party APIs failing or throttling?
   5. **Remediate and Post-Mortem**: Roll back the latest release if necessary, apply hotfix, confirm metrics normalize, and document root cause analysis (RCA).

4. **Prepare Questions to Ask the Interviewer**:
   Always have 3 thoughtful questions ready:
   - "How does your engineering team manage infrastructure changes across environments—are all changes strictly gated through CI/CD pipelines?"
   - "What observability and alerting tools does your team rely on most during active incident response?"
   - "What does success look like in the first 90 days for a junior cloud engineer on this team?"

## Done When
- [ ] Prepared verbal explanations for all 10 technical questions.
- [ ] Drafted 3 STAR behavioral stories based on your curriculum labs and capstone project.
- [ ] Rehearsed the 5-step troubleshooting framework out loud.
- [ ] Prepared 3 insightful questions for hiring managers.

## Cost and Cleanup
Expected Cost: **$0.00 — no cloud resources used.**

Interview preparation is completely free.

## Stretch Goal
Conduct a 30-minute mock technical interview with a peer, mentor, or study partner from a cloud community, asking each other the technical questions and giving constructive feedback.

## Common Mistakes
- **Guessing or making up answers when you don't know**: If you don't know a specific AWS service parameter or edge case, say: *"I haven't worked directly with that specific feature yet, but based on how service X works, I would approach it by doing Y and checking the official docs."* Interviewers value honest problem-solving over fabricated answers.
- **Diving into troubleshooting without asking clarifying questions**: Jumping straight into answers without clarifying scope shows a lack of systematic thinking. Always ask clarifying questions first.
- **Focusing on the team rather than "I" in STAR stories**: Interviewers want to know what *you* did. Say "I investigated the route table and implemented the fix" rather than "We fixed it."
