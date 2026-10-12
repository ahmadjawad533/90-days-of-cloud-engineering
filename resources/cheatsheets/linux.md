# Linux Command Line Cheatsheet

A comprehensive quick-reference guide covering essential Linux commands for cloud engineers, systems administrators, and DevOps practitioners.

---

## Table of Contents
- [Navigation & Directory Inspection](#navigation--directory-inspection)
- [File Operations](#file-operations)
- [Permissions & Ownership](#permissions--ownership)
- [User & Group Management](#user--group-management)
- [Process Management & Services](#process-management--services)
- [Text Processing & Filtering](#text-processing--filtering)
- [Networking & Diagnostics](#networking--diagnostics)
- [Package Management (apt / dnf / yum)](#package-management-apt--dnf--yum)
- [Disk & Filesystem Administration](#disk--filesystem-administration)
- [Archiving & Compression](#archiving--compression)
- [System Information & Hardware](#system-information--hardware)

---

## Navigation & Directory Inspection

| Command | Description | Example / Syntax |
| :--- | :--- | :--- |
| `pwd` | Print current working directory | `pwd` |
| `cd <path>` | Change current directory | `cd /var/log` |
| `cd ~` or `cd` | Navigate to user home directory | `cd ~` |
| `cd ..` | Move up one directory level | `cd ..` |
| `cd -` | Switch back to the previous working directory | `cd -` |
| `ls` | List files and directories | `ls` |
| `ls -la` | List all files (including hidden) with detailed permissions and sizes | `ls -la` |
| `ls -lh` | List files in human-readable sizes (KB, MB, GB) | `ls -lh /var/log` |
| `ls -lt` | List files sorted by modification time (newest first) | `ls -lt` |
| `tree` | Display directory tree recursively | `tree -L 2` *(limit depth to 2)* |
| `find <dir> -name <pattern>` | Find files by filename pattern | `find /etc -name "*.conf"` |
| `find <dir> -type f -mtime -7` | Find regular files modified in the last 7 days | `find /var/log -type f -mtime -7` |
| `find <dir> -size +100M` | Find files larger than 100 Megabytes | `find / -type f -size +100M 2>/dev/null` |
| `find <dir> -exec ...` | Execute command on each matching file | `find . -name "*.tmp" -exec rm -f {} +` |

---

## File Operations

| Command | Description | Example / Syntax |
| :--- | :--- | :--- |
| `touch <file>` | Create empty file or update timestamp | `touch config.yaml` |
| `mkdir <dir>` | Create a directory | `mkdir -p /opt/app/releases` *(creates parent dirs)* |
| `cp <src> <dst>` | Copy file | `cp app.conf app.conf.bak` |
| `cp -r <src> <dst>` | Copy directory recursively | `cp -r /opt/app /opt/app_backup` |
| `mv <src> <dst>` | Move or rename file/directory | `mv old_name.txt new_name.txt` |
| `rm <file>` | Remove file | `rm app.log` |
| `rm -rf <path>` | Force remove directory recursively | `rm -rf /tmp/scratch` *(use with caution)* |
| `cat <file>` | Concatenate and display full file content | `cat /etc/os-release` |
| `less <file>` | Paginate view of file (`q` to quit, `/` to search) | `less /var/log/syslog` |
| `head -n <N> <file>` | View first N lines of file (default 10) | `head -n 25 /var/log/nginx/access.log` |
| `tail -n <N> <file>` | View last N lines of file (default 10) | `tail -n 50 /var/log/nginx/error.log` |
| `tail -f <file>` | Follow file updates in real time | `tail -f /var/log/syslog` |
| `stat <file>` | View detailed inode and metadata attributes | `stat /etc/passwd` |
| `ln -s <target> <link>` | Create symbolic link | `ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/` |

---

## Permissions & Ownership

### Permission Bit Reference
- `r` (read) = 4
- `w` (write) = 2
- `x` (execute) = 1
- `755` = User `rwx` (7), Group `r-x` (5), Others `r-x` (5)
- `644` = User `rw-` (6), Group `r--` (4), Others `r--` (4)
- `600` = User `rw-` (6), Group `---` (0), Others `---` (0) *(standard for SSH keys)*
- `700` = User `rwx` (7), Group `---` (0), Others `---` (0) *(standard for `.ssh` dir)*

| Command | Description | Example / Syntax |
| :--- | :--- | :--- |
| `chmod <mode> <file>` | Change file mode bits (octal) | `chmod 600 ~/.ssh/id_rsa` |
| `chmod +x <file>` | Make file executable | `chmod +x deploy.sh` |
| `chmod -R <mode> <dir>` | Recursively change directory permissions | `chmod -R 755 /var/www/html` |
| `chown <user>:<group> <file>` | Change user and group ownership | `chown www-data:www-data /var/www/html` |
| `chown -R <user>:<group> <dir>` | Recursively change ownership | `chown -R ubuntu:ubuntu /home/ubuntu/app` |
| `chgrp <group> <file>` | Change group ownership | `chgrp docker /var/run/docker.sock` |
| `umask` | View or set default file creation mask | `umask 022` |

---

## User & Group Management

| Command | Description | Example / Syntax |
| :--- | :--- | :--- |
| `whoami` | Display active user | `whoami` |
| `id` | Display user UID, GID, and supplemental groups | `id` or `id ubuntu` |
| `groups [user]` | Show groups for current or specified user | `groups ubuntu` |
| `useradd -m -s /bin/bash <user>` | Create new user with home directory and shell | `sudo useradd -m -s /bin/bash deployer` |
| `usermod -aG <group> <user>` | Append user to a secondary group | `sudo usermod -aG docker ubuntu` |
| `passwd <user>` | Update user password | `sudo passwd deployer` |
| `userdel -r <user>` | Delete user and their home directory | `sudo userdel -r deployer` |
| `groupadd <group>` | Create a new user group | `sudo groupadd devops` |
| `su - <user>` | Switch user environment | `su - deployer` |
| `sudo <command>` | Execute command with superuser privileges | `sudo systemctl restart nginx` |
| `visudo` | Safely edit `/etc/sudoers` file | `sudo visudo` |

---

## Process Management & Services

| Command | Description | Example / Syntax |
| :--- | :--- | :--- |
| `ps aux` | Snapshot of all running processes | `ps aux \| grep python` |
| `ps -ef` | Snapshot in standard format with PPID (parent PID) | `ps -ef` |
| `top` | Interactive real-time process monitor | `top` *(press `k` to kill, `q` to quit)* |
| `htop` | Enhanced interactive process viewer | `htop` |
| `pgrep <name>` | Find process ID by name | `pgrep -l nginx` |
| `pkill <name>` | Send termination signal by process name | `sudo pkill -f gunicorn` |
| `kill <pid>` | Gracefully terminate process (`SIGTERM` / 15) | `kill 1234` |
| `kill -9 <pid>` | Forcefully terminate process (`SIGKILL` / 9) | `kill -9 1234` |
| `systemctl start <svc>` | Start systemd service | `sudo systemctl start nginx` |
| `systemctl stop <svc>` | Stop systemd service | `sudo systemctl stop nginx` |
| `systemctl restart <svc>` | Restart systemd service | `sudo systemctl restart nginx` |
| `systemctl reload <svc>` | Reload configuration without downtime | `sudo systemctl reload nginx` |
| `systemctl status <svc>` | Inspect service state and recent logs | `systemctl status nginx` |
| `systemctl enable <svc>` | Configure service to start at boot | `sudo systemctl enable nginx` |
| `systemctl disable <svc>` | Disable service boot startup | `sudo systemctl disable nginx` |
| `journalctl -u <svc> -f` | Tail logs for a specific unit | `journalctl -u docker.service -f` |
| `journalctl -xe` | View journal errors and troubleshooting details | `journalctl -xe` |
| `journalctl --since "1 hour ago"` | View logs generated within the last hour | `journalctl --since "1 hour ago"` |

---

## Text Processing & Filtering

| Command | Description | Example / Syntax |
| :--- | :--- | :--- |
| `grep <pattern> <file>` | Match pattern in file | `grep "ERROR" /var/log/app.log` |
| `grep -r -i -n <pat> <dir>` | Recursive, case-insensitive match with line numbers | `grep -rin "database_url" /etc/` |
| `grep -v <pattern>` | Invert match (filter out lines) | `grep -v "^#" /etc/ssh/sshd_config` |
| `sed 's/<old>/<new>/g' <f>` | Stream editor: replace pattern occurrences | `sed -i 's/PORT=3000/PORT=8080/g' .env` |
| `awk '{print $1, $4}' <f>` | Extract whitespace-delimited columns | `awk '{print $1, $9}' access.log` |
| `awk -F: '{print $1}' <f>` | Extract column using custom delimiter (e.g. `:`) | `awk -F: '{print $1}' /etc/passwd` |
| `sort <file>` | Sort lines alphabetically or numerically (`-n`) | `sort -n -k2 file.txt` |
| `uniq -c` | Count unique consecutive lines (pair with `sort`) | `sort access.log \| uniq -c \| sort -nr` |
| `cut -d',' -f1,3 <file>` | Cut delimited fields | `cut -d',' -f1,3 users.csv` |
| `wc -l <file>` | Count lines, words (`-w`), or bytes (`-c`) | `wc -l /etc/passwd` |
| `tr 'a-z' 'A-Z'` | Translate characters (e.g., lower to upper) | `cat text.txt \| tr 'a-z' 'A-Z'` |

---

## Networking & Diagnostics

| Command | Description | Example / Syntax |
| :--- | :--- | :--- |
| `ip addr show` / `ip a` | Display network interfaces and IP addresses | `ip a` |
| `ip route show` / `ip r` | Inspect IP routing table and default gateway | `ip r` |
| `ss -tulnp` | Show TCP/UDP listening sockets with process info | `sudo ss -tulnp` |
| `netstat -tulnp` | Legacy socket inspection tool | `sudo netstat -tulnp` |
| `ping -c <count> <host>` | Test ICMP connectivity to host | `ping -c 4 8.8.8.8` |
| `curl -I <url>` | Fetch HTTP headers only | `curl -I https://example.com` |
| `curl -fsSL <url>` | Silent curl, follow redirects, fail on HTTP errors | `curl -fsSL https://get.docker.com` |
| `wget <url>` | Download file via HTTP/HTTPS/FTP | `wget https://example.com/archive.tar.gz` |
| `dig <domain> [type]` | DNS lookup using BIND resolver | `dig +short api.github.com A` |
| `nslookup <domain>` | Simple DNS lookup | `nslookup google.com` |
| `traceroute <host>` | Trace packet route across hops | `traceroute 1.1.1.1` |
| `nc -zv <host> <port>` | Check open TCP port connectivity with Netcat | `nc -zv 10.0.0.15 443` |

---

## Package Management (apt / dnf / yum)

### Debian / Ubuntu (`apt`)
```bash
sudo apt update                  # Refresh package repository index
sudo apt upgrade -y              # Upgrade installed packages
sudo apt install -y <package>    # Install package (e.g., nginx, jq)
sudo apt remove <package>        # Remove package (keeps config files)
sudo apt purge <package>         # Remove package and configuration files
sudo apt autoremove -y           # Clean up orphaned dependencies
apt search <keyword>             # Search repository for packages
apt show <package>               # Show package details and dependencies
```

### RHEL / CentOS / Rocky / Fedora (`dnf` / `yum`)
```bash
sudo dnf check-update            # Check available package updates
sudo dnf upgrade -y              # Upgrade installed packages
sudo dnf install -y <package>    # Install package
sudo dnf remove <package>        # Uninstall package
dnf search <keyword>             # Search package metadata
dnf info <package>               # Show package description
```

---

## Disk & Filesystem Administration

| Command | Description | Example / Syntax |
| :--- | :--- | :--- |
| `df -h` | Display filesystem disk space usage (human-readable) | `df -h` |
| `du -sh <dir>` | Summary of total disk space consumed by directory | `du -sh /var/log` |
| `du -ah --max-depth=1 <dir>` | List disk space of top-level child items | `du -h --max-depth=1 /var \| sort -hr` |
| `lsblk` | List block storage devices and mount partitions | `lsblk -f` *(includes filesystem types)* |
| `mount` | Mount filesystem | `sudo mount /dev/sdb1 /mnt/data` |
| `umount` | Unmount filesystem | `sudo umount /mnt/data` |
| `fdisk -l` | List partition tables of block devices | `sudo fdisk -l` |
| `mkfs.ext4 <device>` | Format partition with ext4 filesystem | `sudo mkfs.ext4 /dev/nvme1n1` |
| `free -h` | Display memory and swap consumption | `free -h` |

---

## Archiving & Compression

| Command | Description | Example / Syntax |
| :--- | :--- | :--- |
| `tar -czvf <arch.tar.gz> <dir>` | Create gzip-compressed tar archive | `tar -czvf backup.tar.gz /var/www` |
| `tar -xzvf <arch.tar.gz>` | Extract gzip-compressed tar archive | `tar -xzvf backup.tar.gz -C /opt` |
| `tar -cjvf <arch.tar.bz2> <dir>` | Create bzip2-compressed tar archive | `tar -cjvf backup.tar.bz2 ./data` |
| `tar -tf <arch.tar.gz>` | List contents of tar archive without extracting | `tar -tf backup.tar.gz` |
| `gzip <file>` | Compress file into `.gz` format (replaces file) | `gzip large_db.sql` |
| `gunzip <file.gz>` | Decompress `.gz` file | `gunzip large_db.sql.gz` |
| `zip -r <out.zip> <dir>` | Create zip archive recursively | `zip -r release.zip ./dist` |
| `unzip <file.zip>` | Extract zip archive | `unzip release.zip -d ./build` |

---

## System Information & Hardware

| Command | Description | Example / Syntax |
| :--- | :--- | :--- |
| `uname -a` | Print kernel release, OS name, and architecture | `uname -a` |
| `hostname` | Display current system hostname | `hostname` or `hostnamectl` |
| `uptime` | System uptime and load averages (1, 5, 15 min) | `uptime` |
| `lscpu` | Display CPU architecture, cores, and threads | `lscpu` |
| `lshw -short` | Short summary of hardware inventory | `sudo lshw -short` |
| `lspci` | List PCI devices (network adapters, GPUs) | `lspci` |
| `lsusb` | List connected USB devices | `lsusb` |
| `cat /etc/os-release` | Standard Linux distribution identity details | `cat /etc/os-release` |
| `dmesg -T` | Print kernel ring buffer messages with timestamps | `sudo dmesg -T \| grep -i oom` |
