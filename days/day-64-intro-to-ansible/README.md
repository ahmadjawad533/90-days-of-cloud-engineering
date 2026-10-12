# Day 64: Introduction to Ansible
[← Previous Day](../day-63-rebuild-vpc-terraform/README.md) | [Next Day →](../day-65-what-is-cicd/README.md)

## Goal
Understand agentless configuration management, install Ansible, configure an inventory file, and execute idempotent playbooks against target machines.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Ansible Getting Started Guide](https://docs.ansible.com/ansible/latest/getting_started/) — Core concepts: control nodes, managed nodes, inventory, tasks, modules, and playbooks.
- 📖 [Ansible Playbook Guide](https://docs.ansible.com/ansible/latest/playbook_guide/) — Writing declarative YAML playbooks, variable substitution, handlers, and execution flow.

## Do
1. **Understand Ansible Architecture**:
   - **Agentless**: Unlike older configuration managers (Puppet/Chef) that require software agents running on managed nodes, Ansible connects over standard SSH (Linux) or WinRM (Windows) using Python.
   - **Idempotent Modules**: Running a playbook 10 times results in changes only on the first run; subsequent runs report `ok` without modifying already compliant state.
   - **Key Components**:
     - **Control Node**: The machine where Ansible is installed and run.
     - **Inventory**: File defining managed hosts, groups, and connection variables.
     - **Playbook**: YAML file declaring desired configurations and task sequences.

2. **Verify or Install Ansible**:
   Check if Ansible is installed on your Linux control machine:
   ```bash
   ansible --version
   ```
   If not installed, install it using `pip` or the Ubuntu package manager:
   ```bash
   sudo apt-get update && sudo apt-get install -y ansible
   ansible --version
   ```

3. **Inspect the Ansible Lab Files**:
   Navigate to the repository lab folder:
   ```bash
   cd "/home/jawad/90 Days of Cloud Engineering/labs/ansible"
   cat inventory.ini
   cat playbook.yml
   ```
   Notice that `inventory.ini` defines a `[webservers]` group targeting `localhost` using `ansible_connection=local` so you can practice locally without spinning up remote VMs.

4. **Test Ad-Hoc Ansible Commands**:
   Ad-hoc commands let you perform quick, single-module operations across hosts:
   ```bash
   # Test connectivity using the ping module
   ansible webservers -i inventory.ini -m ping

   # Gather system facts (OS, memory, IP addresses, CPU architecture)
   ansible webservers -i inventory.ini -m setup -a "filter=ansible_distribution*"

   # Execute an ad-hoc command using the command module
   ansible webservers -i inventory.ini -m command -a "uptime"
   ```

5. **Run the Declarative Playbook**:
   Execute `playbook.yml` using `ansible-playbook`:
   ```bash
   ansible-playbook -i inventory.ini playbook.yml
   ```
   Observe the task progression in the output:
   - `GATHERING FACTS`: Ansible inspects system details.
   - `TASK [Ensure target application directory exists]`: Status `changed`.
   - `TASK [Deploy application index file]`: Status `changed`.
   - `PLAY RECAP`: Notice `changed=2`.

6. **Verify Playbook Idempotency**:
   Run the exact same command a second time:
   ```bash
   ansible-playbook -i inventory.ini playbook.yml
   ```
   Notice the output difference:
   - Tasks report `ok` instead of `changed`.
   - `PLAY RECAP`: Reports `changed=0`.
   This proves that Ansible verifies current state before making unnecessary file writes.

7. **Verify Configured Target Artifacts**:
   ```bash
   ls -la /tmp/ansible-lab-demo
   cat /tmp/ansible-lab-demo/index.html
   ```

8. **Clean Up**:
   Remove the lab demonstration directory created by the playbook:
   ```bash
   rm -rf /tmp/ansible-lab-demo
   ```

## Done When
- [ ] Ansible CLI is installed and running (`ansible --version`).
- [ ] Executed an ad-hoc Ansible ping command against an inventory host.
- [ ] Ran the playbook `playbook.yml` and inspected task status.
- [ ] Executed the playbook a second time to verify idempotent behavior (`changed=0`).
- [ ] Verified the deployed target file on the local machine.

## Cost and Cleanup
$0 — no cloud resources used.

Remove temporary test artifacts:
```bash
rm -rf /tmp/ansible-lab-demo
```

## Stretch Goal
Extend `playbook.yml` by adding an `ansible.builtin.apt` task (or `package` task) with `state: present` to install a package like `htop` or `curl`, and add an `ansible.builtin.service` task with `state: started` and `enabled: true`. Use `handlers` to trigger a service restart only when a configuration file changes.

## Common Mistakes
- **YAML indentation and syntax errors**: YAML is strictly whitespace-sensitive. Using tabs instead of spaces or misaligning lists causes syntax parsing errors. Use `ansible-playbook --syntax-check playbook.yml` to validate before running.
- **Using `command` or `shell` modules instead of built-in idempotent modules**: Running `ansible.builtin.command: echo "hello" >> file.txt` is not idempotent because it appends every time. Always prefer native modules like `ansible.builtin.copy`, `template`, or `lineinfile`.
- **Assuming Ansible requires remote agent software**: Unlike Kubernetes kubelets or Chef daemons, Ansible requires only SSH and Python on managed Linux machines.
