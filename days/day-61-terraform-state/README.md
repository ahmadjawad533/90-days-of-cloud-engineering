# Day 61: Terraform State Management
[← Previous Day](../day-60-terraform-variables-outputs/README.md) | [Next Day →](../day-62-terraform-modules/README.md)

## Goal
Master the critical role of the `terraform.tfstate` file, inspect and manage state using CLI commands, and understand remote state backends with S3 and DynamoDB locking.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Terraform State Overview](https://developer.hashicorp.com/terraform/language/state) — Why Terraform requires state, how state maps code to real-world resources, and state locking mechanisms.
- 📖 [S3 Remote Backend Documentation](https://developer.hashicorp.com/terraform/language/settings/backends/s3) — Configuring Amazon S3 and DynamoDB for secure, collaborative, multi-engineer state storage.

## Do
1. **Understand What Terraform State Does**:
   - State acts as the **source of truth** mapping declarative code blocks (e.g. `aws_vpc.main`) to real cloud resource IDs (e.g. `vpc-0a1b2c3d4e5f67890`).
   - State tracks metadata and resource dependencies.
   - State improves performance by caching attributes so Terraform does not have to query all cloud APIs on every minor command.

2. **Inspect Local State Using the State CLI**:
   Navigate to a fresh sandbox directory to safely inspect state operations:
   ```bash
   mkdir -p ~/terraform-state-lab && cd ~/terraform-state-lab

   cat << 'EOF' > main.tf
   terraform {
     required_providers {
       local = {
         source  = "hashicorp/local"
         version = "~> 2.4"
       }
     }
   }

   resource "local_file" "sample1" {
     filename = "${path.module}/file1.txt"
     content  = "State management test file 1"
   }

   resource "local_file" "sample2" {
     filename = "${path.module}/file2.txt"
     content  = "State management test file 2"
   }
   EOF

   terraform init
   terraform apply -auto-approve
   ```

3. **Master State Inspection Commands**:
   Run the essential `terraform state` subcommands:
   ```bash
   # List all resources currently tracked in state
   terraform state list

   # Show detailed attributes of a specific tracked resource
   terraform state show local_file.sample1

   # View raw state JSON structure
   terraform show
   ```

4. **Practice Moving Resources in State (`state mv`)**:
   Rename a resource in code without destroying and recreating the underlying real-world object:
   ```bash
   # Rename sample2 to sample_renamed in state
   terraform state mv local_file.sample2 local_file.sample_renamed

   # Update main.tf to match the new resource name
   sed -i 's/"sample2"/"sample_renamed"/' main.tf

   # Run plan to verify zero changes are needed (no recreate!)
   terraform plan
   ```

5. **Understand Remote State Architecture (Team Collaboration)**:
   In production environments with multiple engineers:
   - Local state files (`terraform.tfstate`) must **NEVER** be committed to Git (they contain plain-text secrets and lead to merge conflicts).
   - Remote state stores state centrally in an Amazon S3 bucket with server-side encryption and versioning.
   - Amazon DynamoDB provides **distributed state locking** via a `LockID` primary key, preventing two engineers from applying changes simultaneously.

   Here is the standard remote backend architecture:
   ```hcl
   terraform {
     backend "s3" {
       bucket         = "my-company-terraform-state-bucket"
       key            = "networking/vpc/terraform.tfstate"
       region         = "us-east-1"
       dynamodb_table = "terraform-state-locks"
       encrypt        = true
     }
   }
   ```

6. **Demonstrate State Refresh and Drift Detection**:
   Manually modify the file outside of Terraform to simulate drift:
   ```bash
   echo "Manual out-of-band change" > file1.txt

   # Refresh state to reconcile drift
   terraform plan
   ```
   Notice that `terraform plan` detects the drift and proposes updating the file back to match the declared HCL configuration!

7. **Clean Up Sandbox**:
   ```bash
   terraform destroy -auto-approve
   cd ~ && rm -rf ~/terraform-state-lab
   ```

## Done When
- [ ] Listed tracked resources using `terraform state list`.
- [ ] Examined resource attributes with `terraform state show`.
- [ ] Practiced state refactoring using `terraform state mv` without triggering recreation.
- [ ] Simulated drift detection by modifying an external resource.
- [ ] Understood why remote backends (S3 + DynamoDB) are required for teams.

## Cost and Cleanup
$0 — no cloud resources used.

Ensure sandbox directory is removed:
```bash
rm -rf ~/terraform-state-lab
```

## Stretch Goal
Read the documentation for `terraform import` (and the `import { ... }` block introduced in Terraform 1.5).
Understand how pre-existing cloud resources created manually in the AWS Console can be brought under Terraform management without recreating them.

## Common Mistakes
- **Committing `terraform.tfstate` to Git**: State files often store unencrypted resource secrets, database passwords, and private keys. Always add `*.tfstate` and `*.tfstate.backup` to `.gitignore`.
- **Manually editing the `terraform.tfstate` JSON file**: Never open and edit `terraform.tfstate` with a text editor. A single corrupted byte or mismatched serial number can ruin your state file. Always use `terraform state` CLI commands.
- **Running concurrent applies without state locking**: When team members run `terraform apply` concurrently without DynamoDB state locking, state files get overwritten and corrupted.
