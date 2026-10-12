# Day 58: Terraform Installation and Basics
[← Previous Day](../day-57-what-is-iac/README.md) | [Next Day →](../day-59-terraform-providers-resources/README.md)

## Goal
Install the Terraform CLI, understand the core workflow lifecycle (`init`, `plan`, `apply`, `destroy`), and create your first local infrastructure resources.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [Install Terraform (Official Documentation)](https://developer.hashicorp.com/terraform/tutorials) — Step-by-step installation guides across Linux, macOS, and Windows.
- 📖 [Terraform CLI Command Reference](https://developer.hashicorp.com/terraform/cli) — Complete documentation for CLI subcommands, execution flags, and options.

## Do
1. **Verify or Install Terraform**:
   Check if Terraform is installed on your Linux system:
   ```bash
   terraform version
   ```
   If not installed, install it using the official HashiCorp Linux repository:
   ```bash
   sudo apt-get update && sudo apt-get install -y gnupg software-properties-common curl
   wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
   echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
   sudo apt-get update && sudo apt-get install -y terraform
   terraform -version
   ```

2. **Learn the Core Terraform Workflow**:
   The foundational Terraform lifecycle consists of 4 commands:
   - `terraform init`: Initializes the working directory, downloads required provider plugins, and sets up backend state.
   - `terraform plan`: Generates and displays an execution plan showing what changes will be made to reach desired state without actually making them.
   - `terraform apply`: Executes the changes specified in the plan against the provider API.
   - `terraform destroy`: Removes all managed resources declared in the configuration.

3. **Create a Local Provider Experiment**:
   Build a simple sandbox using the built-in `local` provider so you can practice the workflow without needing cloud credentials:
   ```bash
   mkdir -p ~/terraform-basics && cd ~/terraform-basics

   cat << 'EOF' > main.tf
   terraform {
     required_version = ">= 1.5.0"
     required_providers {
       local = {
         source  = "hashicorp/local"
         version = "~> 2.4"
       }
     }
   }

   resource "local_file" "welcome" {
     filename = "${path.module}/welcome.txt"
     content  = "Welcome to Infrastructure as Code with Terraform!\nCreated on Day 58.\n"
   }
   EOF
   ```

4. **Execute `terraform init`**:
   ```bash
   terraform init
   ```
   Observe how Terraform creates the hidden `.terraform` directory and generates `.terraform.lock.hcl`.

5. **Execute `terraform plan`**:
   ```bash
   terraform plan
   ```
   Review the execution plan output. Notice the `+ create` indicator and the plan summary `Plan: 1 to add, 0 to change, 0 to destroy`.

6. **Execute `terraform apply`**:
   ```bash
   terraform apply -auto-approve
   ```
   Verify the file was created:
   ```bash
   cat welcome.txt
   ls -la terraform.tfstate
   ```

7. **Clean Up with `terraform destroy`**:
   ```bash
   terraform destroy -auto-approve
   ls -la welcome.txt 2>/dev/null || echo "File successfully destroyed!"
   ```

## Done When
- [ ] `terraform version` runs cleanly and outputs version >= 1.5.0.
- [ ] You initialized a working directory using `terraform init` and observed provider downloads.
- [ ] You generated an execution plan using `terraform plan`.
- [ ] You applied the plan with `terraform apply` and verified resource creation.
- [ ] You destroyed the resource using `terraform destroy`.

## Cost and Cleanup
$0 — no cloud resources used.

Remove the sandbox folder:
```bash
rm -rf ~/terraform-basics
```

## Stretch Goal
Explore Terraform code formatting and validation commands:
Run `terraform fmt` to automatically format all `.tf` files according to canonical style conventions, and run `terraform validate` to check the syntax and internal consistency of your configuration files.

## Common Mistakes
- **Forgetting to run `terraform init`**: Running `plan` or `apply` in a freshly cloned repository before initializing throws an error because required providers have not yet been downloaded.
- **Skipping `terraform plan` before applying**: Blindly running `terraform apply` without reviewing the planned diff can cause accidental resource replacements or data deletion.
- **Manually modifying generated files inside `.terraform/`**: Files in `.terraform` are managed by Terraform CLI. Never edit provider binaries or lockfiles manually.
