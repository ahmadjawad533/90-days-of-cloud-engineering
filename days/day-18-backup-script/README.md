# Day 18: Build a Backup Script

[← Previous Day](../day-17-functions-debugging/README.md) | [Next Day →](../day-19-intro-to-git/README.md)

## Goal
Build and test an automated, production-grade Linux backup script that takes source and destination directories as arguments, generates compressed timestamped archives, rotates older backups to keep the last 5 copies, logs all operations, and handles runtime errors safely.

## Time
⏱️ Approximately 120 minutes

## Learn
- 📖 [GNU Bash Reference Manual: Parameter Expansion](https://www.gnu.org/software/bash/manual/bash.html#Shell-Parameter-Expansion) — Safely parsing arguments and handling default values in scripts.
- 📖 [Advanced Bash-Scripting Guide (TLDP): Complex Commands - tar](https://tldp.org/LDP/abs/html/moreadv.html) — Creating and manipulating `.tar.gz` compressed archives.
- 📖 [Ubuntu Tutorials: How to automate backups](https://ubuntu.com/server/docs/backups) — Best practices for automated backups, logging, and retention policies in Linux.

## Do
In this milestone project, you will build and test a reusable backup tool:

1. **Review the Reference Implementation**:
   A reference script has been provided in the repository at [`labs/shell/backup.sh`](../../labs/shell/backup.sh).
   Review its architecture:
   - Argument validation: Requires `<source_dir>` and `<dest_dir>`
   - Strict mode: `set -euo pipefail`
   - Archive generation: `tar -czf backup_<TIMESTAMP>.tar.gz`
   - Rotation policy: Retains the latest 5 backups and prunes older archives
   - Structured logging: Appends operational logs to both console and a log file
   - Safe signal traps for cleanup

2. **Set Up a Local Test Environment**:
   Create mock source data and a destination backup folder:
   ```bash
   mkdir -p ~/cloud-lab/day18/data ~/cloud-lab/day18/backups
   cd ~/cloud-lab/day18

   # Populate source directory with mock application files
   echo "Database configuration" > data/db.conf
   echo "Application state 1.0" > data/app.json
   echo "User assets" > data/assets.txt
   ```

3. **Deploy and Make Executable the Backup Script**:
   Copy the reference backup script or write your own into the workspace:
   ```bash
   cp /home/jawad/90\ Days\ of\ Cloud\ Engineering/labs/shell/backup.sh ./backup.sh
   chmod +x ./backup.sh
   ```

4. **Execute Initial Backup Run**:
   Run the backup script specifying the source data directory and destination:
   ```bash
   ./backup.sh ~/cloud-lab/day18/data ~/cloud-lab/day18/backups
   ```
   Inspect the destination directory and the created log file:
   ```bash
   ls -lh ~/cloud-lab/day18/backups
   cat ~/cloud-lab/day18/backups/backup.log
   ```

5. **Test Rotation Logic**:
   Generate multiple backups with small delays to verify that older backups are pruned and only the last 5 remain:
   ```bash
   for i in {1..6}; do
       echo "Iteration $i payload" >> data/app.json
       ./backup.sh ~/cloud-lab/day18/data ~/cloud-lab/day18/backups
       sleep 1
   done
   ```
   Verify that exactly 5 archive files exist:
   ```bash
   echo "Total archives retained:"
   ls -1 ~/cloud-lab/day18/backups/*.tar.gz | wc -l
   ```

6. **Test Error Handling**:
   Verify that the script exits gracefully with informative error messages when given invalid paths:
   ```bash
   ./backup.sh /nonexistent/source ~/cloud-lab/day18/backups || echo "Caught expected error on missing source directory."
   ```

7. **Cleanup**:
   Remove the local test workspace:
   ```bash
   cd ~
   rm -rf ~/cloud-lab/day18
   ```

## Done When
- [ ] Created or inspected the completed `backup.sh` script
- [ ] Verified that archives are created with the format `backup_YYYYMMDD_HHMMSS.tar.gz`
- [ ] Confirmed that old backups are rotated and only the latest 5 backups are retained
- [ ] Checked that log entries record timestamps, file sizes, and operation outcomes in `backup.log`
- [ ] Verified non-zero exit and helpful usage output when missing or invalid arguments are passed

## Cost and Cleanup
$0 — no cloud resources used. Test files created in `~/cloud-lab/day18` were cleaned up in step 7.

## Stretch Goal
Schedule the backup script to run periodically using `cron`:
- View your crontab with `crontab -l`
- Configure a test entry (e.g., `crontab -e` to run daily at 02:00: `0 2 * * * /path/to/backup.sh /var/data /var/backups`)
- Research how enterprise cloud teams forward local backup archives to cloud object storage like AWS S3 using `aws s3 sync`.

## Common Mistakes
- **Hardcoding paths in the script**: Writing fixed paths like `/home/user/data` instead of using command-line arguments (`$1`, `$2`) makes the script rigid and un-reusable.
- **Accidental archiving of parent directory paths in `tar`**: If you run `tar -czf backup.tar.gz /home/user/data`, tar includes the full absolute path inside the archive. Changing directory into the source or using `-C` stores clean relative paths.
- **Flawed backup deletion logic**: Deleting old files using unquoted variables or flawed regex can accidentally delete all files in the backup directory. Always verify `find` or `ls` pipelines before passing them to `rm`.
