# Day 14: Text Processing (grep, sed, awk)

[← Previous Day](../day-13-processes-monitoring/README.md) | [Next Day →](../day-15-shell-scripting-basics/README.md)

## Goal
Master the foundational Linux text-processing trifecta (`grep`, `sed`, `awk`) along with streams and pipes (`|`, `>`, `>>`, `sort`, `uniq`) to filter, transform, and analyze server logs and configuration files.

## Time
⏱️ Approximately 90 minutes

## Learn
- 📖 [Linux Journey: Text Processing](https://linuxjourney.com/lesson/grep-searching-files) — Practical guide to `grep`, pattern matching, and file inspection.
- 📖 [Linux Journey: I/O Redirection & Pipes](https://linuxjourney.com/lesson/stdout-standard-out-redirect) — Explaining `stdin` (0), `stdout` (1), `stderr` (2), pipelines, and redirection.
- 📖 [GNU Bash Reference Manual: Redirections](https://www.gnu.org/software/bash/manual/bash.html#Redirections) — Deep dive into stream redirection mechanics.

## Do
Execute the following steps to practice processing logs and system data:

1. **Set Up Sample Web Server Access Logs**:
   Create a practice workspace and a sample web server log file:
   ```bash
   mkdir -p ~/cloud-lab/day14 && cd ~/cloud-lab/day14
   cat << 'EOF' > access.log
   192.168.1.10 - - [10/Oct/2026:13:55:36] "GET /index.html HTTP/1.1" 200 4523
   10.0.0.15 - - [10/Oct/2026:13:55:38] "POST /api/login HTTP/1.1" 401 234
   192.168.1.10 - - [10/Oct/2026:13:56:01] "GET /dashboard HTTP/1.1" 200 8920
   172.16.0.45 - - [10/Oct/2026:13:56:15] "GET /images/logo.png HTTP/1.1" 404 153
   10.0.0.15 - - [10/Oct/2026:13:56:22] "POST /api/login HTTP/1.1" 200 1024
   192.168.1.20 - - [10/Oct/2026:13:57:05] "GET /api/data HTTP/1.1" 500 512
   192.168.1.10 - - [10/Oct/2026:13:57:40] "GET /index.html HTTP/1.1" 200 4523
   EOF
   ```

2. **Filter Log Lines with `grep`**:
   Filter lines matching specific patterns and status codes:
   ```bash
   # Find all lines with 404 or 500 status codes
   grep -E ' (404|500) ' access.log

   # Count how many successful 200 requests occurred
   grep -c ' 200 ' access.log

   # Invert match: find all non-200 responses
   grep -v ' 200 ' access.log
   ```

3. **Stream Transformation with `sed` (Stream Editor)**:
   Substitute and transform text without opening an interactive editor:
   ```bash
   # Replace HTTP/1.1 with HTTP/2.0 in output stream
   sed 's/HTTP\/1.1/HTTP\/2.0/g' access.log

   # Print only lines containing /api/
   sed -n '/\/api\//p' access.log
   ```

4. **Extract and Aggregate Fields with `awk`**:
   `awk` treats lines as records and spaces as field separators (`$1`, `$2`, etc.):
   ```bash
   # Extract only the Client IP ($1) and HTTP Status Code ($9)
   awk '{print $1, $9}' access.log

   # Calculate total bytes served (Field $10)
   awk '{sum += $10} END {print "Total bytes transferred:", sum}' access.log
   ```

5. **Combine Utilities into a Powerful Analytics Pipeline**:
   Find the top requesting IP addresses sorted by frequency:
   ```bash
   awk '{print $1}' access.log | sort | uniq -c | sort -nr
   ```

6. **Cleanup**:
   Remove the practice workspace:
   ```bash
   cd ~
   rm -rf ~/cloud-lab/day14
   ```

## Done When
- [ ] Filtered text using `grep` with flags `-E`, `-c`, and `-v`
- [ ] Performed pattern replacements using `sed 's/old/new/g'`
- [ ] Extracted specific columns and calculated totals using `awk`
- [ ] Chained commands with pipes (`|`), `sort`, and `uniq -c` to extract top metrics from a log file

## Cost and Cleanup
$0 — no cloud resources used. The local `~/cloud-lab/day14` directory was removed in step 6.

## Stretch Goal
Parse `/etc/passwd` using `awk` with a colon delimiter (`-F:`):
```bash
awk -F: '$3 >= 1000 {print "Regular user:", $1, "with UID:", $3, "and shell:", $7}' /etc/passwd
```
Compare `awk` vs Python for rapid one-liner data processing in server triage scenarios.

## Common Mistakes
- **Forgetting that `uniq` requires sorted input**: `uniq` only merges adjacent duplicate lines. If identical lines are separated, `uniq` will not deduplicate them unless you run `sort` first (`sort | uniq -c`).
- **Overwriting input files with redirection**: Running `grep "foo" file.txt > file.txt` will truncate `file.txt` to 0 bytes before `grep` reads it because the shell opens the output file first. Always direct output to a temporary file or use tools that support in-place edits (e.g., `sed -i`).
- **Confusing single quotes with double quotes in `awk`**: In Bash, shell variables expand inside double quotes, but `awk` syntax uses `$1`, `$2` as internal field variables. Enclose `awk` scripts in single quotes `'...'` so Bash doesn't attempt to expand `$1` as a shell variable.
