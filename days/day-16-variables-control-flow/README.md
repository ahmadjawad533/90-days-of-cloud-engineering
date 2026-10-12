# Day 16: Shell Scripting Variables and Control Flow

[← Previous Day](../day-15-shell-scripting-basics/README.md) | [Next Day →](../day-17-functions-debugging/README.md)

## Goal
Implement variables, positional parameters, conditional statements (`if/elif/else`, `test`, `[[ ]]`), and iteration loops (`for`, `while`) in Bash automation scripts.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [GNU Bash Reference Manual: Conditional Constructs](https://www.gnu.org/software/bash/manual/bash.html#Conditional-Constructs) — Detailed rules for `if`, `case`, and compound tests with `[[ ... ]]`.
- 📖 [GNU Bash Reference Manual: Looping Constructs](https://www.gnu.org/software/bash/manual/bash.html#Looping-Constructs) — Syntax and behavior of `for`, `while`, and `until` loops.
- 📖 [Advanced Bash-Scripting Guide (TLDP): Tests](https://tldp.org/LDP/abs/html/tests.html) — File test operators (`-f`, `-d`, `-e`, `-s`) and string comparisons.

## Do
Execute the following steps to construct scripts with branching logic and loops:

1. **Set Up the Day 16 Workspace**:
   ```bash
   mkdir -p ~/cloud-lab/day16 && cd ~/cloud-lab/day16
   ```

2. **Work with Variables and Positional Parameters**:
   Create a script `params.sh` that inspects arguments passed from the command line:
   ```bash
   cat << 'EOF' > params.sh
   #!/usr/bin/env bash
   set -euo pipefail

   SCRIPT_NAME="$0"
   TOTAL_ARGS="$#"

   echo "Executing script: ${SCRIPT_NAME}"
   echo "Total arguments received: ${TOTAL_ARGS}"

   if [[ "$TOTAL_ARGS" -lt 2 ]]; then
       echo "Error: Please supply at least two arguments."
       echo "Usage: $0 <environment> <service>"
       exit 1
   fi

   ENV="$1"
   SERVICE="$2"

   echo "Target Environment: ${ENV}"
   echo "Target Service    : ${SERVICE}"
   EOF
   chmod +x params.sh
   ./params.sh staging web-api
   ```

3. **Master File and String Conditions**:
   Create a file validator script `check_file.sh`:
   ```bash
   cat << 'EOF' > check_file.sh
   #!/usr/bin/env bash
   set -euo pipefail

   TARGET="${1:-}"

   if [[ -z "$TARGET" ]]; then
       echo "Error: No target path provided."
       exit 1
   fi

   if [[ -d "$TARGET" ]]; then
       echo "Target '$TARGET' is a directory."
   elif [[ -f "$TARGET" ]]; then
       echo "Target '$TARGET' is a regular file."
   else
       echo "Target '$TARGET' does not exist."
   fi
   EOF
   chmod +x check_file.sh
   ./check_file.sh /etc
   ./check_file.sh /etc/passwd
   ./check_file.sh /nonexistent
   ```

4. **Iterate with `for` and `while` Loops**:
   Create an iteration script `process_services.sh`:
   ```bash
   cat << 'EOF' > process_services.sh
   #!/usr/bin/env bash
   set -euo pipefail

   SERVICES=("nginx" "postgresql" "redis" "prometheus")

   echo "--- Iterating array with for loop ---"
   for svc in "${SERVICES[@]}"; do
       echo "Checking status for service: ${svc}..."
   done

   echo "--- Countdown loop with while ---"
   COUNTER=3
   while [[ "$COUNTER" -gt 0 ]]; do
       echo "Retry attempt countdown: ${COUNTER}"
       COUNTER=$((COUNTER - 1))
   done
   echo "Countdown complete."
   EOF
   chmod +x process_services.sh
   ./process_services.sh
   ```

5. **Cleanup**:
   ```bash
   cd ~
   rm -rf ~/cloud-lab/day16
   ```

## Done When
- [ ] Handled command-line parameters using `$1`, `$2`, and counted arguments using `$#`
- [ ] Used `[[ -f ... ]]` and `[[ -d ... ]]` operators to test for file and directory existence
- [ ] Implemented a `for` loop to iterate over a list or Bash array
- [ ] Built an arithmetic decrement loop using `while [[ ... ]]` and `$(( ... ))`

## Cost and Cleanup
$0 — no cloud resources used. Local files cleaned up at step 5.

## Stretch Goal
Use `case` statements for command-line subcommands (similar to how `docker run` or `git commit` parse verbs):
```bash
case "$ACTION" in
    start)  echo "Starting service..." ;;
    stop)   echo "Stopping service..." ;;
    restart) echo "Restarting service..." ;;
    *)      echo "Unknown action: $ACTION"; exit 1 ;;
esac
```

## Common Mistakes
- **Unquoted variables (`$VAR` vs `"$VAR"`)**: If a variable contains spaces (e.g. `MY_DIR="My Documents"`), unquoted `$MY_DIR` expands into two separate arguments, causing command syntax errors. Always wrap variable references in double quotes: `"$VAR"`.
- **Spaces around `=` in variable assignments**: Writing `MY_VAR = "value"` causes Bash to look for a command named `MY_VAR`. In Bash, assignments must not have spaces around the equals sign: `MY_VAR="value"`.
- **Using single brackets `[` without proper spacing or escaping**: The old POSIX test `[` is prone to word-splitting bugs. Prefer Bash modern test brackets `[[ ... ]]` with spaces inside the brackets: `[[ "$a" == "$b" ]]`.
