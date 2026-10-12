# Day 27: Python File I/O and Error Handling

[← Previous Day](../day-26-python-data-structures/README.md) | [Next Day →](../day-28-modules-virtualenvs/README.md)

## Goal
Read and write configuration and audit log files (JSON, CSV, plaintext) and write resilient scripts using `try`/`except`/`finally` blocks.

## Time
⏱️ Approximately 80 minutes

## Learn
- 📖 [The Python Tutorial — Reading and Writing Files](https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files) — Official documentation on opening files, context managers (`with`), and file objects.
- 📖 [The Python Tutorial — Errors and Exceptions](https://docs.python.org/3/tutorial/errors.html) — Official guide on syntax errors, exception handling (`try`/`except`/`else`/`finally`), and raising exceptions.

## Do
Cloud automation scripts fail all the time in real-world environments: networks timeout, configuration files have syntax errors, credentials expire, or resources are missing. Robust scripts catch known errors, log informative warnings, and recover gracefully.

1. **Set up Day 27 directory**
   ```bash
   mkdir -p ~/cloud-python/day-27
   cd ~/cloud-python/day-27
   ```

2. **Learn Context Managers (`with open(...)`)**
   Always use `with open(...)` so files are automatically closed even if an unexpected exception occurs during processing.

3. **Build a cloud audit log parser and reporter**
   Create a sample log file `deployments.log`:
   ```bash
   cat << 'EOF' > deployments.log
   2026-10-10 08:30:15 INFO Deploying web-app-v1.2 to us-east-1
   2026-10-10 08:31:40 ERROR Failed to attach volume vol-08a9f: VolumeInUse
   2026-10-10 08:35:12 INFO Retrying volume attachment vol-08a9f
   2026-10-10 08:35:50 INFO Volume attached successfully
   2026-10-10 09:12:04 WARNING High latency detected on ALB alb-prod-ingress
   2026-10-10 09:15:30 ERROR TargetGroup healthy host count dropped below threshold: 1/3
   2026-10-10 09:20:00 INFO Auto-scaling triggered: launched instance i-0bc314a
   EOF
   ```

4. **Write a script to parse log files and export a JSON audit summary**
   Create `audit_log_parser.py`:
   ```bash
   cat << 'EOF' > audit_log_parser.py
   """Cloud Log Parser and JSON Audit Generator."""
   import json
   from datetime import datetime

   def parse_log(file_path: str) -> dict:
       summary = {
           "generated_at": datetime.utcnow().isoformat() + "Z",
           "total_lines": 0,
           "counts": {"INFO": 0, "WARNING": 0, "ERROR": 0},
           "errors": [],
       }

       try:
           with open(file_path, "r", encoding="utf-8") as f:
               for line_number, raw_line in enumerate(f, start=1):
                   line = raw_line.strip()
                   if not line:
                       continue
                   summary["total_lines"] += 1

                   parts = line.split(" ", 3)
                   if len(parts) < 4:
                       continue

                   date_str, time_str, level, message = parts
                   if level in summary["counts"]:
                       summary["counts"][level] += 1

                   if level == "ERROR":
                       summary["errors"].append({
                           "line": line_number,
                           "timestamp": f"{date_str} {time_str}",
                           "message": message,
                       })

       except FileNotFoundError:
           print(f"❌ Error: File '{file_path}' does not exist.")
           raise
       except PermissionError:
           print(f"❌ Error: Permission denied reading '{file_path}'.")
           raise
       except Exception as err:
           print(f"❌ Unexpected error while processing '{file_path}': {err}")
           raise

       return summary

   def export_report(data: dict, output_file: str) -> None:
       try:
           with open(output_file, "w", encoding="utf-8") as f:
               json.dump(data, f, indent=2)
           print(f"✅ Audit report saved to {output_file}")
       except IOError as err:
           print(f"❌ Failed to write report to {output_file}: {err}")

   if __name__ == "__main__":
       log_input = "deployments.log"
       json_output = "audit_report.json"

       try:
           report_data = parse_log(log_input)
           print(f"Processed {report_data['total_lines']} log lines.")
           print(f"Counts: {report_data['counts']}")
           export_report(report_data, json_output)
       except Exception as e:
           print(f"Script aborted due to error: {e}")
   EOF
   ```

5. **Run the parser and check generated JSON output**
   ```bash
   python3 audit_log_parser.py
   cat audit_report.json
   ```

6. **Simulate error handling edge cases**
   Test what happens when the target file does not exist:
   ```bash
   python3 -c "
   import audit_log_parser
   try:
       audit_log_parser.parse_log('non_existent.log')
   except FileNotFoundError:
       print('Cleanly caught missing file exception without crashing the entire pipeline!')
   "
   ```

7. **Parse and write CSV reports**
   Create `csv_reporter.py` to practice generating CSV audit files for operations teams:
   ```bash
   cat << 'EOF' > csv_reporter.py
   """Export Cloud Resource Audit to CSV."""
   import csv

   resources = [
       {"id": "i-0123456789abcdef0", "type": "EC2", "region": "us-east-1", "compliance": "PASS"},
       {"id": "vol-0987654321fedcba0", "type": "EBS", "region": "us-east-1", "compliance": "FAIL"},
       {"id": "bucket-prod-backups", "type": "S3", "region": "us-west-2", "compliance": "PASS"},
       {"id": "sg-044123561726a", "type": "SecurityGroup", "region": "us-east-1", "compliance": "FAIL"},
   ]

   output_csv = "compliance_audit.csv"

   try:
       with open(output_csv, "w", newline="", encoding="utf-8") as csvfile:
           fieldnames = ["id", "type", "region", "compliance"]
           writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

           writer.writeheader()
           for item in resources:
               writer.writerow(item)

       print(f"✅ Successfully wrote compliance audit to {output_csv}")
   except Exception as err:
       print(f"❌ Error writing CSV: {err}")
   EOF
   ```

8. **Run the CSV generator**
   ```bash
   python3 csv_reporter.py
   cat compliance_audit.csv
   ```

## Done When
- [ ] You ran `audit_log_parser.py` and generated a formatted `audit_report.json`.
- [ ] You verified that invalid file paths raise `FileNotFoundError` and are caught with informative error output.
- [ ] You ran `csv_reporter.py` and verified the generated CSV header and rows.
- [ ] All file operations use `with open(...)` context managers without dangling unclosed file handles.

## Cost and Cleanup
$0 — no cloud resources used. Everything runs locally on your machine.
To clean up:
```bash
rm -rf ~/cloud-python/day-27
```

## Stretch Goal
Enhance `audit_log_parser.py` with custom exception classes: define a custom `LogFormatError(Exception)` and raise it if a log line does not contain at least 4 fields or contains an unknown log level.

## Common Mistakes
- **Forgetting `newline=""` in CSV writing**: On Windows or certain Python environments, omitting `newline=""` in `open(filename, "w", newline="")` can result in extra blank lines between rows.
- **Bare `except:` blocks**: Using `except:` without specifying an exception class catches `KeyboardInterrupt` and `SystemExit`, making scripts impossible to cancel with Ctrl+C. Always catch specific exceptions (`except (IOError, ValueError):`) or at least `except Exception:`.
- **Not encoding UTF-8**: Always explicitly specify `encoding="utf-8"` when reading and writing text files to avoid cross-platform encoding errors between Linux, macOS, and Windows.
