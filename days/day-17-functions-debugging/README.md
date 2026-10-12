# Day 17: Shell Scripting Functions and Debugging

[← Previous Day](../day-16-variables-control-flow/README.md) | [Next Day →](../day-18-backup-script/README.md)

## Goal
Structure modular Bash code using reusable functions, implement standardized logging, and debug failing scripts using execution tracing (`bash -x`), syntax checking (`bash -n`), and signal traps (`trap`).

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [GNU Bash Reference Manual: Shell Functions](https://www.gnu.org/software/bash/manual/bash.html#Shell-Functions) — Defining functions, local variable scoping, and function return values.
- 📖 [Advanced Bash-Scripting Guide (TLDP): Debugging](https://tldp.org/LDP/abs/html/debugging.html) — Comprehensive debugging strategies, traps, and tracing options.
- 📖 [GNU Bash Reference Manual: Signals & Traps](https://www.gnu.org/software/bash/manual/bash.html#Signals) — Handling cleanup operations upon script exit or interruption.

## Do
Execute the following steps to build robust functions and debug scripts:

1. **Set Up the Day 17 Workspace**:
   ```bash
   mkdir -p ~/cloud-lab/day17 && cd ~/cloud-lab/day17
   ```

2. **Define Functions with `local` Variable Scope**:
   Create a modular logging and calculation script `functions_demo.sh`:
   ```bash
   cat << 'EOF' > functions_demo.sh
   #!/usr/bin/env bash
   set -euo pipefail

   # Formatted logger function
   log_info() {
       local message="$1"
       echo "[$(date +'%Y-%m-%d %H:%M:%S')] [INFO] ${message}"
   }

   log_error() {
       local message="$1"
       echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] ${message}" >&2
   }

   # Arithmetic function returning status
   compute_disk_ratio() {
       local used="$1"
       local total="$2"
       if [[ "$total" -le 0 ]]; then
           log_error "Total disk space must be greater than zero."
           return 1
       fi
       local percent=$(( (used * 100) / total ))
       echo "${percent}%"
       return 0
   }

   log_info "Script starting..."
   usage_result=$(compute_disk_ratio 45 100)
   log_info "Calculated disk usage: ${usage_result}"
   log_info "Execution completed successfully."
   EOF
   chmod +x functions_demo.sh
   ./functions_demo.sh
   ```

3. **Handle Traps for Guaranteed Cleanup (`trap`)**:
   In cloud automation, temporary files must be cleaned up even if the script fails or receives `Ctrl+C`:
   ```bash
   cat << 'EOF' > trap_demo.sh
   #!/usr/bin/env bash
   set -euo pipefail

   TMP_DIR=$(mktemp -d /tmp/cloud-job-XXXXXX)

   cleanup() {
       echo "Executing cleanup handler: Removing ${TMP_DIR}..."
       rm -rf "${TMP_DIR}"
   }

   # Register trap on script EXIT (runs on success, error, or kill signal)
   trap cleanup EXIT

   echo "Working in temporary directory: ${TMP_DIR}"
   touch "${TMP_DIR}/workfile.dat"
   echo "Payload processed."
   # When script exits here, cleanup runs automatically
   EOF
   chmod +x trap_demo.sh
   ./trap_demo.sh
   ```

4. **Master Script Debugging Tools**:
   - Check syntax without executing (`-n`):
     ```bash
     bash -n functions_demo.sh
     ```
   - Run with execution trace printing each command before execution (`-x`):
     ```bash
     bash -x functions_demo.sh
     ```
   - You can also enable/disable tracing selectively inside a script using `set -x` and `set +x`.

5. **Cleanup**:
   ```bash
   cd ~
   rm -rf ~/cloud-lab/day17
   ```

## Done When
- [ ] Created reusable functions and enforced local variable scoping with `local`
- [ ] Emitted error logs to standard error (`>&2`)
- [ ] Used `trap ... EXIT` to guarantee temporary directory teardown
- [ ] Validated script syntax with `bash -n` and traced execution with `bash -x`

## Cost and Cleanup
$0 — no cloud resources used. Practice scripts cleaned up in step 5.

## Stretch Goal
Install and run `shellcheck` (the industry-standard static analysis linter for shell scripts):
```bash
sudo apt install -y shellcheck
shellcheck functions_demo.sh
```
Incorporate `shellcheck` into your future daily scripting habit or CI/CD pipelines.

## Common Mistakes
- **Leaking global variables inside functions**: Omitting the `local` keyword makes variables globally accessible across the entire script, creating subtle bugs when different functions reuse variable names like `result` or `i`.
- **Confusing `return` with `exit`**: Inside a function, `return` exits the function with an exit code, returning control to the caller. Calling `exit` terminates the entire script process immediately.
- **Forgetting that `echo` inside a function writes to standard output**: If you capture a function's output with `result=$(my_func)`, any `echo` statement inside `my_func` becomes part of the assigned variable. Direct status messages and logs to `stderr` (`>&2`) to avoid corrupting function return values.
