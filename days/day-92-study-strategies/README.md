# Day 92: Study Strategies and Practice Exams
[← Previous Day](../day-91-aws-certification-paths/README.md) | [Next Day →](../day-93-cloud-resume/README.md)

## Goal
Master active recall and spaced repetition study techniques, establish an effective practice exam review routine, and build a targeted revision plan for cloud exams.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [AWS Certification Official Practice Question Sets](https://aws.amazon.com/certification/certified-solutions-architect-associate/) — Official 20-question sample sets directly from AWS Skill Builder.
- 📖 [The Feynman Technique and Spaced Repetition](https://en.wikipedia.org/wiki/Spaced_repetition) — Proven cognitive study methodologies for retaining deep technical concepts.

## Do
In today's session, you will learn how to dissect scenario-based cloud exam questions, create a tracking system for incorrect practice exam answers, and build a spaced-repetition study schedule.

1. **Understand Scenario Question Anatomy**:
   AWS Associate exam questions test architectural decision-making, typically requiring the **most cost-effective**, **most secure**, or **most resilient** solution that involves the **least operational overhead**:
   ```
   [Context / Current Architecture]
   A company runs an application on EC2 instances behind an ALB with an RDS MySQL database.

   [Pain Point / Requirement]
   During peak sales events, database read latency causes application timeouts.
   Budget constraints require minimizing costs and minimizing administrative burden.

   [Constraint Keyphrase]
   "Which solution addresses the latency with the LEAST operational overhead and lowest cost?"
   ```
   **Strategy**:
   - Identify the constraint keywords (*cost-effective*, *least operational overhead*, *highly available*, *real-time*).
   - Eliminate answers that introduce unnecessary servers to manage (e.g., self-hosting Redis on EC2 when Amazon ElastiCache or Aurora Read Replicas are options).
   - Eliminate answers that technically work but violate the specific constraint (e.g., upgrading to an expensive multi-terabyte instance when caching solves the read load).

2. **Set Up an "Incorrect Answers" Error Log**:
   Create a study spreadsheet or markdown document `exam_error_log.md`:
   ```markdown
   # Practice Exam Error Log

   | Date | Question Topic | Why I Chose My Answer | Why The Correct Answer Is Right | Core Concept / Doc Link |
   |:---:|:---|:---|:---|:---|
   | 2026-10-15 | S3 Storage Classes | Chose Glacier Instant Retrieval | Glacier Flexible Retrieval was required because retrieval time was acceptable up to 5 hours and cost had to be minimized | S3 Lifecycle Tiers |
   | 2026-10-16 | RDS Read Replicas vs Multi-AZ | Confused Read Replicas with Multi-AZ failover | Read Replicas offload read traffic; Multi-AZ is strictly synchronous standby for disaster recovery | RDS High Availability |
   ```

3. **Establish a 3-Week Practice Exam Routine**:
   Follow this structured cadence:
   - **Week 1 (Diagnostic)**: Take 1 full-length timed practice exam (e.g., 65 questions). Review every question — both those you missed and those you guessed correctly. Record every mistake in your error log.
   - **Week 2 (Targeted Weakness Remediation)**: Dedicate 3 days strictly to your lowest-scoring domains (e.g. S3 policies, Aurora Global Databases, Direct Connect). Take a 2nd practice exam; target >75%.
   - **Week 3 (Simulation & Readiness)**: Take 2 full exams in exam-like conditions (timed 130 min, no phone, quiet room). When you consistently achieve 80-85%+ on fresh question sets, you are ready to book and pass the exam.

4. **Curate High-Quality Practice Resources**:
   - **Official AWS Skill Builder**: Official sample question set and free practice exam.
   - **Tutorials Dojo (Jon Bonso)** 💳: Widely considered the gold standard for high-fidelity AWS exam question simulations with in-depth architectural explanations.
   - **Stephane Maarek / Adrian Cantrill Practice Tests** 💳: Comprehensive scenario coverage matching current exam outlines.

5. **Practice Explaining Architectural Decisions (The Feynman Technique)**:
   Pick three core AWS concepts and write a 2-paragraph explanation in plain English as if explaining them to a junior colleague or non-technical manager:
   1. The difference between an Application Load Balancer and a Network Load Balancer.
   2. When to choose AWS Lambda vs. Amazon ECS Fargate.
   3. The difference between AWS KMS Customer Managed Keys and AWS Managed Keys.

## Done When
- [ ] Understand the 4-step framework for dissecting scenario exam questions.
- [ ] Create `exam_error_log.md` to track missed practice questions.
- [ ] Complete the 3 conceptual Feynman explanations in your notes.
- [ ] Establish a 3-week study calendar leading up to exam day.

## Cost and Cleanup
Expected Cost: **$0.00 — no cloud resources used.**

Study strategies and practice log documentation do not incur cloud costs.

## Stretch Goal
Take an official 20-question practice test on AWS Skill Builder or review AWS official whitepapers (such as *Overview of Amazon Web Services* and *AWS Well-Architected Framework*), noting down 5 questions or architectures that challenged you.

## Common Mistakes
- **Taking practice exams repeatedly until you memorize answers**: Taking the same test 4 times gives a false sense of security because you memorize the answers rather than understanding the underlying concepts. Focus on variety.
- **Reviewing only the questions you got wrong**: Review the questions you guessed correctly too; if you did not know *why* the answer was right, it was luck.
- **Studying passively**: Reading documentation passively retains ~20% of information. Doing active recall, writing summaries, and building small test architectures in Terraform retains >80%.
