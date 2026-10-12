# Day 13: Processes and System Monitoring

[← Previous Day](../day-12-package-management/README.md) | [Next Day →](../day-14-text-processing/README.md)

## Goal
Inspect running system processes, analyze resource consumption (CPU, memory, disk I/O), manage foreground/background jobs, and send POSIX signals to manage process lifecycles.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Linux Journey: Processes](https://linuxjourney.com/lesson/process-basics) — Learn about Process IDs (PIDs), process trees, and parent-child process relationships.
- 📖 [Linux Journey: Managing Processes](https://linuxjourney.com/lesson/managing-processes) — Signals (`SIGTERM`, `SIGKILL`), `kill`, `pkill`, and background jobs (`&`, `bg`, `fg`).
- 📖 [Ubuntu Tutorials: Process Monitoring Basics](https://ubuntu.com/tutorials/command-line-for-beginners#5-processes-and-resource-usage) — Using `top`, `ps`, and system resource inspection commands.

## Do
Execute the following steps in your terminal to practice process management:

1. **Inspect Running Processes**:
   List active processes using standard BSD and POSIX syntax:
   ```bash
   ps aux | head -n 10
   ps -ef | head -n 10
   ```
   Identify column headers: `USER`, `PID`, `%CPU`, `%MEM`, `VSZ`, `RSS`, `STAT`, `COMMAND`.

2. **Real-time System Monitoring**:
   Launch an interactive monitor:
   ```bash
   top
   ```
   *(Inside `top`: Press `M` to sort by memory, `P` to sort by CPU, and `q` to quit).*
   Optional: Try `htop` if installed (`sudo apt install -y htop`).

3. **Inspect Disk and Memory Utilization**:
   Check filesystem disk space and memory availability:
   ```bash
   df -h
   free -h
   uptime
   ```
   Notice disk usage on the root partition (`/`) and available RAM vs buffer/cache.

4. **Run Background Jobs and Manage States**:
   Launch a long-running process in the background using `&`:
   ```bash
   sleep 300 &
   ```
   Notice the shell prints `[job_number] PID` (e.g. `[1] 12345`).
   Check job list:
   ```bash
   jobs
   ```

5. **Send Process Signals (`kill`, `pkill`)**:
   Terminate the background process gracefully using `SIGTERM` (15):
   ```bash
   kill %1
   jobs
   ```
   Start another test process and kill by name using `pkill`:
   ```bash
   sleep 200 &
   pkill -f "sleep 200"
   jobs
   ```

6. **Inspect Process Trees**:
   View how your current shell spawned commands:
   ```bash
   pstree -p $$
   ```
   *(If `pstree` is not present, install `psmisc`: `sudo apt install -y psmisc`).*

## Done When
- [ ] Listed and filtered processes using `ps aux` and `grep`
- [ ] Monitored real-time system metrics using `top` or `htop`
- [ ] Inspected free memory (`free -h`) and disk capacity (`df -h`)
- [ ] Ran a task in the background with `&`, viewed active jobs with `jobs`, and terminated it with `kill`

## Cost and Cleanup
$0 — no cloud resources used. All commands execute locally in your terminal. All test sleep processes were terminated in step 5.

## Stretch Goal
Explore `systemctl` (systemd service management) on systems running systemd:
```bash
systemctl status
systemctl list-units --type=service --state=running | head -n 15
```
Learn why systemd has become the standard service manager across enterprise Linux distributions.

## Common Mistakes
- **Defaulting immediately to `kill -9` (`SIGKILL`)**: `kill -9` forcefully aborts a process without giving it an opportunity to flush buffers, close open files, or clean up sockets. Always attempt default `SIGTERM` (`kill <PID>`) first.
- **Misinterpreting `free -h`**: Learners often think their system is out of memory because "free" is low, forgetting that Linux dynamically utilizes unused RAM for disk buffer and cache. Look at the `available` column instead.
- **Forgetting background jobs when closing the terminal**: Processes tied directly to a terminal session receive `SIGHUP` when the terminal closes. For persistent background jobs, look into `nohup` or `tmux`.
