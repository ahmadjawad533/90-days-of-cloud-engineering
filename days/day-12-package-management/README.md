# Day 12: Package Management

[← Previous Day](../day-11-users-groups-sudo/README.md) | [Next Day →](../day-13-processes-monitoring/README.md)

## Goal
Master Linux package managers (`apt` on Debian/Ubuntu, `yum`/`dnf` on RHEL/Amazon Linux) to search, install, update, and remove software dependencies cleanly on cloud servers.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [Ubuntu Tutorials: Package Management with APT](https://ubuntu.com/server/docs/package-management) — Official guide on updating repository indices, upgrading security patches, and inspecting packages.
- 📖 [Linux Journey: Packages](https://linuxjourney.com/lesson/packages) — Overview of compiled software packaging, repositories, and dependency resolution.
- 📖 [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html) — Shell command execution and script automation basics.

## Do
Execute the following commands in your Linux environment (examples use `apt` for Ubuntu/WSL2):

1. **Update Repository Index**:
   Synchronize local package indexes with upstream repositories:
   ```bash
   sudo apt update
   ```
   *Note: `apt update` does not upgrade any software; it only fetches the latest version metadata from repository mirrors.*

2. **Search and Inspect a Package**:
   Search for a lightweight CLI utility such as `jq` (JSON processor) or `curl`:
   ```bash
   apt search jq
   apt show jq
   ```
   Inspect the package metadata: version, maintainer, description, and installed size.

3. **Install Software Packages**:
   Install `jq` and `curl` non-interactively (the standard approach in cloud automation scripts):
   ```bash
   sudo apt install -y jq curl
   which jq
   jq --version
   ```

4. **Verify Package Origin and Files Installed**:
   Find out which files were installed by the package using `dpkg`:
   ```bash
   dpkg -L jq
   ```

5. **Remove Packages and Clean Orphaned Dependencies**:
   Uninstall a test package and remove unused cached packages:
   ```bash
   sudo apt remove -y jq
   sudo apt autoremove -y
   sudo apt clean
   ```

6. **Reinstall `jq` for Future Days**:
   We will use `jq` frequently in later modules (AWS CLI, Docker, Kubernetes):
   ```bash
   sudo apt install -y jq
   ```

## Done When
- [ ] Articulated the difference between `apt update` (updating indexes) and `apt upgrade` (installing newer package versions)
- [ ] Searched for and inspected package metadata using `apt show`
- [ ] Installed packages using `apt install -y`
- [ ] Inspected installed files using `dpkg -L` and cleaned up orphaned dependencies with `apt autoremove`

## Cost and Cleanup
$0 — no cloud resources used. Packages are installed locally on your workstation/WSL2 system.

## Stretch Goal
Explore third-party software repository sources. View `/etc/apt/sources.list` and files inside `/etc/apt/sources.list.d/`:
```bash
ls -l /etc/apt/sources.list.d/
```
Understand how modern cloud tools like Docker, HashiCorp Terraform, and Kubernetes use GPG keys and custom `.list` or `.sources` files to distribute official releases.

## Common Mistakes
- **Confusing `apt update` with `apt upgrade`**: Running `apt install <tool>` immediately without running `apt update` first can cause `404 Not Found` errors when attempting to download outdated package versions.
- **Forgetting the `-y` flag in cloud automation scripts**: In non-interactive environments (CI/CD pipelines, user-data startup scripts), `apt install` will wait indefinitely for user confirmation `[Y/n]` and time out. Always include `-y` in automation scripts.
- **Interrupting package installations with Ctrl+C**: Abruptly terminating an ongoing package installation can leave the dpkg lock file stuck (`/var/lib/dpkg/lock-frontend`). If that occurs, run `sudo dpkg --configure -a` to recover.
