# Day 08: Introduction to Linux

[← Previous Day](../day-07-networking-review-project/README.md) | [Next Day →](../day-09-linux-filesystem/README.md)

## Goal
Explore the Linux operating system, understand why Linux powers modern cloud infrastructure, and execute fundamental system identification commands in a terminal environment.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [Linux Journey: Getting Started](https://linuxjourney.com/lesson/what-is-linux) — A beginner-friendly introduction to what Linux is, distributions, and terminal fundamentals.
- 📖 [Ubuntu Tutorials: The Linux Command Line for Beginners](https://ubuntu.com/tutorials/command-line-for-beginners) — Step-by-step primer on opening and working with an interactive Linux terminal.
- 📖 [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html) — The official manual explaining shell architecture and command execution.

## Do
Work through the following hands-on exercises in your local terminal (WSL2 on Windows, macOS terminal, or native Linux):

1. **Verify Shell and Kernel Information**:
   Open your terminal and display your current user, shell, and kernel version:
   ```bash
   whoami
   echo "Current shell: $SHELL"
   uname -a
   ```

2. **Inspect Linux Distribution Details**:
   View release metadata from `/etc/os-release`:
   ```bash
   cat /etc/os-release
   ```

3. **Check System Architecture and Uptime**:
   Inspect hardware architecture, how long the machine has been running, and memory statistics:
   ```bash
   uname -m
   uptime
   free -h
   ```

4. **Explore Terminal Help and Manuals**:
   Use `man`, `--help`, and `whatis` to understand commands directly from documentation:
   ```bash
   man uname
   uname --help
   whatis whoami
   ```
   *(Press `q` to exit any `man` page pager.)*

5. **Examine Environment Variables**:
   Display key system environment variables:
   ```bash
   echo "Home Directory: $HOME"
   echo "System Path: $PATH"
   echo "Current User: $USER"
   ```

## Done When
- [ ] Confirmed current operating system release using `cat /etc/os-release`
- [ ] Successfully ran `uname -a` and identified the running Linux kernel version
- [ ] Read manual pages with `man` and exited cleanly using `q`
- [ ] Checked system memory and uptime using `free -h` and `uptime`

## Cost and Cleanup
$0 — no cloud resources used. All commands execute locally inside your WSL2, Linux, or macOS terminal.

## Stretch Goal
Write a one-line command that queries `/etc/os-release` and extracts only the pretty name of the operating system using `grep` and `cut`:
```bash
grep '^PRETTY_NAME=' /etc/os-release | cut -d= -f2 | tr -d '"'
```

## Common Mistakes
- **Running commands in Windows Command Prompt or PowerShell instead of WSL2**: Many POSIX utilities behave differently or do not exist natively in cmd.exe. Make sure your terminal prompt shows bash/zsh inside Ubuntu or your Linux distro.
- **Getting stuck in the `man` pager**: If `man` opens and takes over your terminal window, learners often press `Ctrl+C`. The standard key to quit the pager (`less`) is simply `q`.
- **Assuming all Linux distributions use the exact same directory layout**: While the Filesystem Hierarchy Standard (FHS) is widely respected, package formats and specific configuration paths differ across Debian/Ubuntu, RHEL/CentOS, and Alpine.
