# Day 15: Shell Scripting Basics

[← Previous Day](../day-14-text-processing/README.md) | [Next Day →](../day-16-variables-control-flow/README.md)

## Goal
Write, grant execution permissions to, and run production-grade Bash scripts featuring proper shebang lines (`#!/usr/bin/env bash`), strict error handling flags (`set -euo pipefail`), and exit codes.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [GNU Bash Reference Manual: Shell Scripts](https://www.gnu.org/software/bash/manual/bash.html#Shell-Scripts) — The definitive reference for executing Bash script files and subshell environments.
- 📖 [Advanced Bash-Scripting Guide (TLDP)](https://tldp.org/LDP/abs/html/sha-bang.html) — Explanation of the Sha-Bang (`#!`), invoking interpreters, and script startup semantics.
- 📖 [Ubuntu Tutorials: Writing Shell Scripts](https://ubuntu.com/tutorials/command-line-for-beginners) — Basic script structure and execution workflows.

## Do
Build and run your first production-ready shell script:

1. **Create the Script Workspace**:
   ```bash
   mkdir -p ~/cloud-lab/day15 && cd ~/cloud-lab/day15
   ```

2. **Understand the "Unofficial Bash Strict Mode"**:
   In enterprise environments and CI/CD pipelines, robust shell scripts begin with:
   ```bash
   set -euo pipefail
   ```
   - `-e`: Exit immediately if any command returns a non-zero exit code.
   - `-u`: Treat unset variables as an error and exit immediately.
   - `-o pipefail`: Return the exit status of the last command in the pipe that failed, rather than always returning the status of the final command.

3. **Write a System Health Check Script**:
   Create a script named `sysinfo.sh`:
   ```bash
   cat << 'EOF' > sysinfo.sh
   #!/usr/bin/env bash
   set -euo pipefail

   echo "=== System Information Report ==="
   echo "Generated on : $(date)"
   echo "Hostname     : $(hostname)"
   echo "Current User : $(whoami)"
   echo "Kernel       : $(uname -r)"
   echo "Uptime       : $(uptime -p)"
   echo "Disk Free /  : $(df -h / | awk 'NR==2 {print $4}')"
   echo "Memory Free  : $(free -h | awk '/Mem:/ {print $4}')"
   echo "================================="
   EOF
   ```

4. **Make Executable and Run**:
   ```bash
   chmod +x sysinfo.sh
   ./sysinfo.sh
   ```

5. **Test Exit Codes and Failure Handling**:
   Every command returns an exit status from `0` (success) to `255` (failure). View exit codes with `$?`:
   ```bash
   ls sysinfo.sh
   echo "Exit status: $?"    # Outputs 0

   ls non_existent_file.txt || true
   echo "Exit status: $?"    # Outputs non-zero if checked directly
   ```

6. **Cleanup**:
   ```bash
   cd ~
   rm -rf ~/cloud-lab/day15
   ```

## Done When
- [ ] Explained what the shebang line `#!/usr/bin/env bash` does and why `env` provides better portability than hardcoding `/bin/bash`
- [ ] Articulated each flag in `set -euo pipefail`
- [ ] Created, made executable, and executed `sysinfo.sh`
- [ ] Inspected exit statuses using `$?`

## Cost and Cleanup
$0 — no cloud resources used. Local files removed at step 6.

## Stretch Goal
Observe what happens when `set -e` or `set -u` catches an issue. Write a small test script that accesses an undefined variable `$UNDEFINED_VAR` with and without `set -u` to see how the strict mode prevents subtle automation bugs.

## Common Mistakes
- **Omitting the executable bit**: Trying to execute `./script.sh` without first running `chmod +x script.sh` produces `Permission denied`.
- **Using Windows CRLF line endings in Linux scripts**: If a script is edited in a Windows text editor without LF line endings configured, running it in Linux produces errors like `/usr/bin/env: 'bash\r': no such file or directory`. Fix this using `dos2unix script.sh` or configuring your editor for LF line endings.
- **Relying on interactive shell features**: Assuming shell aliases (`ll` or `la`) exist inside shell scripts. Shell scripts run in non-interactive subshells where user shell aliases are not loaded by default.
