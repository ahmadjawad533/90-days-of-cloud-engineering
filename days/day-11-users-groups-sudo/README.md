# Day 11: Users, Groups, and sudo

[← Previous Day](../day-10-file-permissions/README.md) | [Next Day →](../day-12-package-management/README.md)

## Goal
Understand Linux user identity, primary and secondary groups, elevated privileges with `sudo`, and administrative account management on Linux servers.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Linux Journey: Users and Groups](https://linuxjourney.com/lesson/users-and-groups) — How Linux identifies users by UID, groups by GID, and where account data is stored.
- 📖 [Linux Journey: Sudo Privileges](https://linuxjourney.com/lesson/sudo) — Understanding root privilege delegation without sharing root account passwords.
- 📖 [Ubuntu Tutorials: Managing Users](https://ubuntu.com/tutorials/command-line-for-beginners#4-file-permissions) — Basic user management commands in Ubuntu and Debian-based systems.

## Do
Execute the following steps in your terminal to practice user and group administration:

1. **Inspect User and Group Configuration Files**:
   View your current UID, GID, and supplemental groups:
   ```bash
   id
   id -u
   id -gn
   groups
   ```
   Inspect the system databases `/etc/passwd` and `/etc/group` (safe to read):
   ```bash
   grep "^$USER:" /etc/passwd
   head -n 5 /etc/passwd
   head -n 5 /etc/group
   ```
   Notice the fields: `username:password_placeholder:UID:GID:gecos:home_directory:default_shell`.

2. **Create a Test User and Group**:
   Create a dedicated system group and a non-login deploy user for demonstration:
   ```bash
   sudo groupadd cloudteam
   sudo useradd -m -s /bin/bash -g cloudteam deployer
   id deployer
   ```

3. **Practice File Ownership Delegation**:
   Create a shared directory and grant group ownership to `cloudteam`:
   ```bash
   sudo mkdir -p /opt/cloud-deploy
   sudo chown -R deployer:cloudteam /opt/cloud-deploy
   ls -ld /opt/cloud-deploy
   ```

4. **Understand `sudo` Privileges**:
   Verify your own sudo rights:
   ```bash
   sudo -l
   ```
   Inspect `/etc/sudoers.d/` (always edited safely with `visudo`):
   ```bash
   sudo ls -l /etc/sudoers.d/
   ```

5. **Clean Up Test Accounts and Folders**:
   Remove the test user, group, and mock deployment directory:
   ```bash
   sudo userdel -r deployer
   sudo groupdel cloudteam
   sudo rm -rf /opt/cloud-deploy
   ```

## Done When
- [ ] Inspected current identity using `id` and `groups`
- [ ] Explained the structure and fields in `/etc/passwd` and `/etc/group`
- [ ] Created a new user and group, assigned group membership, and safely removed them
- [ ] Checked sudo execution permissions using `sudo -l`

## Cost and Cleanup
$0 — no cloud resources used. Test user `deployer`, group `cloudteam`, and `/opt/cloud-deploy` were deleted in step 5.

## Stretch Goal
Explore the sudoers file syntax without editing the primary file directly. Read how dropped-in configurations work inside `/etc/sudoers.d/`:
```bash
sudo man sudoers
```
Find out how cloud images (like AWS AMI Ubuntu or Amazon Linux) configure passwordless sudo for default users like `ubuntu` or `ec2-user`.

## Common Mistakes
- **Directly editing `/etc/sudoers` with a normal text editor**: If you introduce a syntax error in `/etc/sudoers`, you can lock yourself out of administrative privileges. Always use `sudo visudo`, which validates syntax before saving.
- **Using `userdel` without `-r`**: Leaving orphaned home directories (`/home/<username>`) creates clutter and potential permission confusion. Use `userdel -r` when cleaning up temporary users.
- **Confusing primary group vs supplementary groups**: A user only has one primary group defined in `/etc/passwd`, but can belong to many supplementary groups (e.g., `sudo`, `docker`).
