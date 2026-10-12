# Day 22: Pull Requests and Code Review

[← Previous Day](../day-21-remote-repos-github/README.md) | [Next Day →](../day-23-git-workflows/README.md)

## Goal
Fork or branch a repository, submit a well-documented Pull Request (PR) on GitHub, conduct a code review inspection, and merge the changes.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [GitHub Pull Requests Documentation](https://docs.github.com/en/pull-requests) — Official guide on opening, proposing changes, commenting on diffs, and merging Pull Requests.
- 📖 [GitHub Get Started: Contributing to Projects](https://docs.github.com/en/get-started) — How fork workflows and branch-based collaboration work in open source and teams.
- 📖 [Pro Git Book: Contributing to a Project](https://git-scm.com/book/en/v2) — Best practices for branch conventions, commit quality, and clean PR diffs.

## Do
In this exercise, you will practice the industry-standard Pull Request workflow on your GitHub repository: creating an isolated branch, authoring a meaningful change, opening a PR, reviewing diffs, and merging.

1. Navigate to your local portfolio repository created in Day 21 (or initialize one linked to GitHub):
   ```bash
   cd ~/cloud-repo-remote
   git checkout main
   git pull origin main
   ```

2. Create a feature branch for an automated backup script:
   ```bash
   git switch -c feature/backup-script
   ```

3. Add a sample bash backup script and commit the change:
   ```bash
   mkdir -p scripts
   cat << 'EOF' > scripts/backup.sh
   #!/usr/bin/env bash
   set -euo pipefail

   BACKUP_DIR="/tmp/backups"
   mkdir -p "${BACKUP_DIR}"
   echo "Running backup at $(date -u)..."
   tar -czf "${BACKUP_DIR}/cloud-config-$(date +%Y%m%d%H%M%S).tar.gz" .gitignore README.md
   echo "Backup completed successfully."
   EOF

   chmod +x scripts/backup.sh
   git add scripts/backup.sh
   git commit -m "feat(scripts): add automated local backup script"
   ```

4. Push the feature branch to GitHub:
   ```bash
   git push -u origin feature/backup-script
   ```

5. Open a Pull Request on GitHub:
   - Go to your repository on [GitHub](https://github.com/).
   - You should see a yellow banner: **feature/backup-script had recent pushes**. Click **Compare & pull request**.
   - Set the base branch to `main` and compare branch to `feature/backup-script`.
   - Title: `feat: add automated local backup utility`
   - Description: Include a summary of what changed, why it was added, and how to test it:
     ```markdown
     ## Description
     Adds a production-safe bash script to backup configuration files to `/tmp/backups`.

     ## Changes
     - Created `scripts/backup.sh` with strict error handling (`set -euo pipefail`).
     - Added archive generation with timestamps.

     ## Verification
     - Ran script locally on Linux shell.
     - Confirmed tar.gz archive generation.
     ```
   - Click **Create pull request**.

6. Perform a self-review on GitHub:
   - Click the **Files changed** tab in your PR.
   - Inspect the green additions (diff view).
   - Click on a line number and leave a simulated review comment (e.g., *"Make sure `/tmp/backups` directory exists before running tar"*).
   - Practice viewing both **Unified** and **Split** diff views.

7. Merge the Pull Request and clean up:
   - Click the **Conversation** tab.
   - Click the green **Merge pull request** button, then **Confirm merge**.
   - Click **Delete branch** on GitHub to remove the remote feature branch.

8. Update your local environment:
   ```bash
   git switch main
   git pull origin main
   git branch -d feature/backup-script
   git fetch --prune
   git branch -a
   ```

## Done When
- [ ] Your feature branch was pushed to GitHub and a Pull Request was opened against `main`.
- [ ] You reviewed the changes using the GitHub **Files changed** diff interface.
- [ ] The Pull Request was successfully merged on GitHub.
- [ ] Your local `main` branch was updated with `git pull origin main` and contains `scripts/backup.sh`.
- [ ] The feature branch was deleted both on GitHub and locally.

## Cost and Cleanup
$0 — no cloud resources used.

To clean up local script test output:
```bash
rm -rf /tmp/backups
```

## Stretch Goal
Explore GitHub PR review features:
1. Practice creating a branch from a public repository via **Fork**: Fork a public repo, clone your fork, create a branch, and open a PR back to upstream.
2. In your repo's PR settings, inspect the merge strategies: **Create a merge commit**, **Squash and merge**, and **Rebase and merge**.

## Common Mistakes
- **Opening a PR against the wrong branch:** Always confirm that the "base" branch is `main` (or the intended target environment) and the "compare" branch is your feature branch.
- **Vague PR titles and empty descriptions:** A PR is communication. Omitting what was changed and why makes code review difficult and slows down team velocity.
- **Forgetting to sync local `main` after merging:** Merging on GitHub changes the remote `main` branch, but your local `main` branch does not update automatically until you run `git pull origin main`.
