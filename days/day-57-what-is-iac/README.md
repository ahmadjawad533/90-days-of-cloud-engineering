# Day 57: What Is Infrastructure as Code?
[← Previous Day](../day-56-kubernetes-troubleshooting/README.md) | [Next Day →](../day-58-terraform-basics/README.md)

## Goal
Understand the core principles, benefits, and operational paradigms of Infrastructure as Code (IaC) by comparing declarative and imperative approaches.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [What is Infrastructure as Code? (HashiCorp Learn)](https://developer.hashicorp.com/terraform/tutorials) — Comprehensive primer on the foundational concepts and workflow of Infrastructure as Code.
- 📖 [Terraform Introduction & Core Concepts](https://developer.hashicorp.com/terraform/language) — Official documentation covering declarative syntax, desired state, and cloud automation.

## Do
1. **Analyze ClickOps vs. Scripting vs. Declarative IaC**:
   Review the progression of infrastructure management:
   - **Manual (ClickOps)**: Clicking in web consoles (prone to human error, slow, no audit trail).
   - **Imperative Scripts (Bash/AWS CLI/Python)**: Commands specify *how* to build step-by-step (`create-vpc`, then `create-subnet`). If rerun, scripts often fail unless complex idempotency checks are coded.
   - **Declarative IaC (Terraform/OpenTofu)**: Code specifies *what* the target state should look like. The engine calculates the diff and applies necessary mutations.

2. **Understand Idempotency and Desired State**:
   Observe how declarative tools achieve idempotency:
   - Target State: "I need 1 VPC with CIDR `10.0.0.0/16` and 2 subnets."
   - Run 1: 0 exist -> creates 1 VPC and 2 subnets.
   - Run 2: 1 VPC and 2 subnets exist -> 0 changes made.
   - Drift: 1 subnet manually deleted -> Run 3 recreates only the missing subnet.

3. **Explore the IaC Tool Ecosystem**:
   Map modern tools to their primary domain:
   - **Provisioning (Infrastructure Lifecycle)**: Terraform, OpenTofu, AWS CloudFormation, Pulumi.
   - **Configuration Management**: Ansible, Puppet, Chef, SaltStack.
   - **Container Orchestration**: Kubernetes manifests, Helm, Kustomize.

4. **Hands-On: Test Imperative vs. Declarative Mindset with Local State**:
   Create a directory and run a simple simulation script to observe how declarative state reconciliation differs from imperative scripting:
   ```bash
   mkdir -p ~/iac-demo && cd ~/iac-demo

   # Imperative script attempt: creates a file if missing, fails if unhandled
   cat << 'EOF' > imperative.sh
   #!/usr/bin/env bash
   TARGET_FILE="server_config.conf"
   echo "Setting port to 8080..."
   echo "PORT=8080" >> "$TARGET_FILE"
   EOF
   chmod +x imperative.sh

   # Run twice to see non-idempotent duplication:
   ./imperative.sh
   ./imperative.sh
   cat server_config.conf
   ```
   Notice that `PORT=8080` was appended twice because the script lacked state-checking logic.

5. **Simulate Declarative Reconciliation**:
   ```bash
   cat << 'EOF' > declarative.sh
   #!/usr/bin/env bash
   DESIRED="PORT=8080"
   FILE="server_config.conf"

   # Reconcile target file to exact desired state
   if [ ! -f "$FILE" ] || [ "$(cat "$FILE")" != "$DESIRED" ]; then
     echo "Drift detected. Reconciling state..."
     echo "$DESIRED" > "$FILE"
   else
     echo "Infrastructure in desired state. No changes needed."
   fi
   EOF
   chmod +x declarative.sh

   ./declarative.sh
   ./declarative.sh
   cat server_config.conf
   ```
   Notice how the second run outputs `No changes needed`. This idempotent reconciliation is the core promise of IaC tools.

## Done When
- [ ] You can explain the key differences between imperative scripts and declarative IaC.
- [ ] You understand why idempotency and state tracking are essential for scalable cloud platforms.
- [ ] You tested the local simulation and observed idempotency in action.

## Cost and Cleanup
$0 — no cloud resources used.

Clean up the local demonstration folder:
```bash
rm -rf ~/iac-demo
```

## Stretch Goal
Write down a comparison matrix contrasting **Terraform** vs. **Ansible**: identifying which is primarily used for infrastructure provisioning versus server configuration management, and how they complement each other in a DevOps pipeline.

## Common Mistakes
- **Treating IaC like standard shell scripts**: Trying to write conditional procedural loops for every single resource instead of declaring desired states and letting the engine determine the execution graph.
- **Ignoring configuration drift**: Modifying cloud resources manually in the web console after provisioning them with IaC, which causes state divergence on the next IaC run.
- **Skipping version control for IaC templates**: Treating infrastructure code as disposable one-off templates rather than committing them to Git with peer reviews and automated CI/CD checks.
