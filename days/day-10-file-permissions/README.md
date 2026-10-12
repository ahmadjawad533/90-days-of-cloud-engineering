# Day 10: File Permissions and Ownership

[← Previous Day](../day-09-linux-filesystem/README.md) | [Next Day →](../day-11-users-groups-sudo/README.md)

## Goal
Understand Linux file mode bits (read, write, execute), decode numeric and symbolic permission notations, and manage file ownership and access control using `chmod` and `chown`.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Linux Journey: File Permissions](https://linuxjourney.com/lesson/file-permissions) — Detailed breakdown of owner, group, and other permission sets.
- 📖 [Linux Journey: Modifying Permissions](https://linuxjourney.com/lesson/chmod) — Hands-on explanation of symbolic (`u+x`, `g-w`) and octal (`755`, `644`, `600`) permission modes.
- 📖 [Ubuntu Tutorials: Users and Permissions](https://ubuntu.com/tutorials/command-line-for-beginners#4-file-permissions) — Practical examples managing permissions in modern Ubuntu environments.

## Do
Execute the following steps in your terminal to practice permission management:

1. **Understand Permission Representation**:
   Create a test script and view default permissions:
   ```bash
   mkdir -p ~/cloud-lab/day10 && cd ~/cloud-lab/day10
   echo 'echo "Hello from Day 10"' > test.sh
   ls -l test.sh
   ```
   The permission string looks like `-rw-r--r--`:
   - Position 1: file type (`-` regular file, `d` directory)
   - Positions 2-4: Owner permissions (`r=4`, `w=2`, `x=1` -> `6`)
   - Positions 5-7: Group permissions (`r=4`, `-=0`, `-=0` -> `4`)
   - Positions 8-10: Others permissions (`r=4`, `-=0`, `-=0` -> `4`)

2. **Add Execute Permissions Using Symbolic Notation**:
   Try running the script directly, observe failure, grant execution, and re-run:
   ```bash
   ./test.sh          # Will return "Permission denied"
   chmod u+x test.sh   # Add execute bit to owner (u)
   ls -l test.sh      # Now shows -rwxr--r--
   ./test.sh          # Executes cleanly
   ```

3. **Secure Sensitive Files with Octal (Numeric) Notation**:
   Cloud keys (like SSH private keys or API tokens) require strict permissions (`600` or `400`):
   ```bash
   touch secret_key.pem
   chmod 600 secret_key.pem
   ls -l secret_key.pem
   ```
   Notice that group and other have zero permissions (`-rw-------`).

4. **Directory Permissions vs File Permissions**:
   Understand why execute (`x`) on a directory means "traversal" permission:
   ```bash
   mkdir private_folder
   touch private_folder/secret.txt
   chmod 700 private_folder
   ls -ld private_folder
   ```

5. **Inspect Ownership with `chown`**:
   Check current user and group ownership:
   ```bash
   ls -l test.sh
   ```
   *(Note: Transferring ownership to another user requires elevated permissions via `sudo chown <user>:<group> <file>`, which we explore in Day 11).*

6. **Cleanup**:
   Remove the Day 10 practice directory:
   ```bash
   cd ~
   rm -rf ~/cloud-lab/day10
   ```

## Done When
- [ ] Explained the difference between octal values `755`, `644`, and `600`
- [ ] Converted an unexecutable file into an executable script using `chmod +x`
- [ ] Secured a mock private key file with `chmod 600`
- [ ] Verified directory access requirements for listing files vs traversing folders

## Cost and Cleanup
$0 — no cloud resources used. Test directories in your local environment were removed at step 6.

## Stretch Goal
Explore the special permission bits: **SetUID** (`4000`), **SetGID** (`2000`), and the **Sticky Bit** (`1000`).
Inspect `/tmp` to observe the sticky bit (`drwxrwxrwt`):
```bash
ls -ld /tmp
```
Why does `/tmp` have a sticky bit `t`? Research how it prevents regular users from deleting each other's temporary files.

## Common Mistakes
- **Applying `chmod 777` to fix errors**: Giving full read, write, and execute permissions to everyone is a severe security violation. In cloud infrastructure, SSH and cloud-init reject keys with permissions wider than `600` or `400`.
- **Forgetting directory execution bits**: Setting a directory to `644` removes the execute bit `x`. Without `x`, nobody can `cd` into that directory or access any files inside it, even if read bits are set.
- **Modifying system binary permissions**: Never run recursive `chmod` or `chown` on root system directories like `/usr`, `/bin`, or `/etc`. Always scope commands to your specific project directories.
