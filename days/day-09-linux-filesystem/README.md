# Day 09: Linux File System and Navigation

[← Previous Day](../day-08-intro-to-linux/README.md) | [Next Day →](../day-10-file-permissions/README.md)

## Goal
Master the Linux Filesystem Hierarchy Standard (FHS), navigate directory trees efficiently, and manipulate files and folders using core command-line utilities.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Linux Journey: Command Line Basics & Navigation](https://linuxjourney.com/lesson/the-shell) — Practical overview of directories, paths, `pwd`, `cd`, and `ls`.
- 📖 [Linux Journey: Filesystem Hierarchy](https://linuxjourney.com/lesson/filesystem-hierarchy) — Clear explanations of `/etc`, `/var`, `/bin`, `/usr`, `/home`, and other core directories.
- 📖 [Ubuntu Tutorials: Navigating the File System](https://ubuntu.com/tutorials/command-line-for-beginners#3-navigating-the-file-system) — Official Ubuntu walkthrough of filesystem navigation and directory manipulation.

## Do
Execute the following commands in your Linux shell:

1. **Investigate the Filesystem Root**:
   Navigate to the root directory `/` and list top-level directories:
   ```bash
   cd /
   pwd
   ls -la
   ```
   Observe system directories:
   - `/bin` & `/usr/bin`: essential user binaries
   - `/etc`: host-specific configuration files
   - `/var/log`: variable runtime data and log files
   - `/home`: standard user home directories
   - `/tmp`: temporary files cleaned up on reboot

2. **Create a Dedicated Lab Workspace**:
   Return to your user home directory and build a nested directory hierarchy:
   ```bash
   cd ~
   mkdir -p ~/cloud-lab/day09/{configs,logs,backups}
   cd ~/cloud-lab/day09
   pwd
   ```

3. **Create and Inspect Sample Files**:
   Generate test files and verify their contents:
   ```bash
   touch configs/app.conf configs/db.conf
   echo "LogLevel=DEBUG" > configs/app.conf
   echo "Port=5432" > configs/db.conf
   echo "Application started successfully" > logs/app.log
   ls -R
   ```

4. **Copy, Move, and Rename Files**:
   Practice non-destructive operations:
   ```bash
   cp configs/app.conf configs/app.conf.bak
   mv configs/app.conf.bak backups/
   ls -l backups/
   ```

5. **Search Files with `find`**:
   Locate files matching specific extensions and modification times:
   ```bash
   find ~/cloud-lab/day09 -name "*.conf"
   find ~/cloud-lab/day09 -type f -name "*.log"
   ```

6. **Clean Up Test Files**:
   Remove the lab directory created today:
   ```bash
   cd ~
   rm -rf ~/cloud-lab/day09
   ```

## Done When
- [ ] Successfully navigated between absolute paths (`/`) and relative paths (`~`, `.`, `..`)
- [ ] Used `mkdir -p` to construct a multi-tiered directory hierarchy in one command
- [ ] Created, copied, moved, and removed files using `touch`, `cp`, `mv`, and `rm`
- [ ] Located specific files using `find` with path and name filters

## Cost and Cleanup
$0 — no cloud resources used. Test directories created in your home folder were removed during step 6.

## Stretch Goal
Use `tree` (install with `sudo apt install tree` if needed) to visualize the hierarchy, or simulate `tree` using `find`:
```bash
find ~/ -maxdepth 2 -not -path '*/.*'
```
Also explore hard links vs symbolic (soft) links using `ln -s`:
```bash
echo "Hello Link" > target.txt
ln -s target.txt soft_link.txt
ls -l target.txt soft_link.txt
rm target.txt soft_link.txt
```

## Common Mistakes
- **Confusing Absolute vs Relative Paths**: Forgetting that `/home/user` is an absolute path from the root `/`, while `cloud-lab` is relative to the current working directory.
- **Accidental recursive deletions with `rm -rf`**: Running `rm -rf /` or `rm -rf *` from the wrong working directory can destroy your system or workspace. Always verify current location with `pwd` before running `rm -rf`.
- **Forgetting hidden files**: The command `ls` skips hidden files (prefixed with `.`). Always include `-a` or `-la` when troubleshooting missing configuration files.
