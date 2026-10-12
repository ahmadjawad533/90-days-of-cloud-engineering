# Day 28: Python Modules and Virtual Environments

[← Previous Day](../day-27-file-io-error-handling/README.md) | [Next Day →](../day-29-intro-to-boto3/README.md)

## Goal
Structure Python code into reusable modules and manage isolated development environments using Python virtual environments (`venv`) and `pip`.

## Time
⏱️ Approximately 70 minutes

## Learn
- 📖 [The Python Tutorial — Modules](https://docs.python.org/3/tutorial/modules.html) — Official documentation explaining scripts, modules, packages, and `__name__ == "__main__"`.
- 📖 [Python standard library — venv: Creation of virtual environments](https://docs.python.org/3/library/venv.html) — Official documentation on managing isolated Python environments.

## Do
In production cloud engineering, you will work across multiple tools, automation frameworks, and SDKs. Installing packages globally into the system Python leads to dependency conflicts (e.g. package version mismatches) and can break operating system utilities. Virtual environments isolate project dependencies cleanly.

1. **Create project directory**
   ```bash
   mkdir -p ~/cloud-python/day-28
   cd ~/cloud-python/day-28
   ```

2. **Create and activate a virtual environment**
   Create a virtual environment named `.venv`:
   ```bash
   python3 -m venv .venv
   ```
   Activate the virtual environment:
   ```bash
   source .venv/bin/activate
   ```
   Notice that your shell prompt now begins with `(.venv)`.
   Check that `which python` points to your virtual environment:
   ```bash
   which python
   which pip
   ```

3. **Install and freeze packages**
   Upgrade pip and install utility libraries commonly used in cloud scripting (`requests` and `pyyaml`):
   ```bash
   pip install --upgrade pip
   pip install requests pyyaml
   ```
   Inspect installed packages:
   ```bash
   pip list
   ```
   Freeze your dependencies to a `requirements.txt` file:
   ```bash
   pip freeze > requirements.txt
   cat requirements.txt
   ```

4. **Create a multi-file modular cloud utility**
   Organize your code into a helper module and an execution script.

   First, create `cloud_utils.py` containing reusable functions:
   ```bash
   cat << 'EOF' > cloud_utils.py
   """Cloud utility helper module."""

   def normalize_tag_key(key: str) -> str:
       """Convert tag keys to PascalCase format (e.g., 'environment' -> 'Environment')."""
       return key.strip().capitalize()

   def is_valid_ipv4(ip: str) -> bool:
       """Check if an IP string is a valid IPv4 address."""
       octets = ip.split(".")
       if len(octets) != 4:
           return False
       for octet in octets:
           if not octet.isdigit():
               return False
           val = int(octet)
           if val < 0 or val > 255:
               return False
       return True

   def format_bytes(bytes_count: int) -> str:
       """Format byte values into human-readable strings (KB, MB, GB)."""
       for unit in ["B", "KB", "MB", "GB", "TB"]:
           if bytes_count < 1024.0:
               return f"{bytes_count:.2f} {unit}"
           bytes_count /= 1024.0
       return f"{bytes_count:.2f} PB"

   if __name__ == "__main__":
       # Self-test block: executed only when run directly
       print("Running cloud_utils self-test...")
       assert normalize_tag_key("environment") == "Environment"
       assert is_valid_ipv4("192.168.1.1") is True
       assert is_valid_ipv4("999.1.1.1") is False
       assert format_bytes(1073741824) == "1.00 GB"
       print("All self-tests passed!")
   EOF
   ```

   Run the self-test block:
   ```bash
   python cloud_utils.py
   ```

5. **Build the main application consuming your module**
   Create `main.py` which imports `cloud_utils`:
   ```bash
   cat << 'EOF' > main.py
   """Main script importing and utilizing cloud_utils module."""
   import sys
   import cloud_utils

   def inspect_servers():
       servers = [
           {"name": "bastion", "ip": "10.0.0.15", "disk_bytes": 21474836480},
           {"name": "bad-node", "ip": "300.0.0.1", "disk_bytes": 107374182400},
           {"name": "web-01", "ip": "172.16.1.50", "disk_bytes": 53687091200},
       ]

       print("=== Server Configuration Verification ===")
       for s in servers:
           valid_ip = cloud_utils.is_valid_ipv4(s["ip"])
           size = cloud_utils.format_bytes(s["disk_bytes"])
           status = "VALID" if valid_ip else "INVALID IP"
           print(f"Server: {s['name']:<10} | IP: {s['ip']:<12} | Disk: {size:<10} | Status: {status}")

   if __name__ == "__main__":
       inspect_servers()
   EOF
   ```

6. **Execute `main.py`**
   ```bash
   python main.py
   ```

7. **Practice deactivating and reactivating the virtual environment**
   To leave the virtual environment:
   ```bash
   deactivate
   ```
   Confirm you have exited:
   ```bash
   which python3
   ```
   Re-activate whenever you resume work:
   ```bash
   source .venv/bin/activate
   ```

## Done When
- [ ] You created a `.venv` virtual environment and activated it using `source .venv/bin/activate`.
- [ ] You installed packages using `pip` and exported dependencies using `pip freeze > requirements.txt`.
- [ ] You wrote a helper module (`cloud_utils.py`) with a self-test block guarded by `if __name__ == "__main__":`.
- [ ] `main.py` successfully imported functions from `cloud_utils.py` and executed without errors.

## Cost and Cleanup
$0 — no cloud resources used. Everything runs locally on your machine.
To clean up:
```bash
deactivate 2>/dev/null || true
rm -rf ~/cloud-python/day-28
```

## Stretch Goal
Add a `.gitignore` file to your project directory that ignores `.venv/`, `__pycache__/`, and `*.pyc` files so that generated environment artifacts are never committed to Git repositories.

## Common Mistakes
- **Committing the `.venv` directory to Git**: Virtual environments can be hundreds of megabytes and contain OS-specific binaries. Never commit `.venv` to Git. Commit `requirements.txt` instead, and recreate the environment with `pip install -r requirements.txt`.
- **Forgetting to activate the virtual environment**: Running `pip install` without activation will either fail with permission errors or accidentally install packages into your system Python. Always look for the `(.venv)` prompt prefix.
- **Missing `if __name__ == "__main__":`**: Code placed at the top level of a module executes immediately when another script imports it. Always place runnable CLI or test code under `if __name__ == "__main__":`.
