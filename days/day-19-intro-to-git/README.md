# Day 19: Introduction to Git

[← Previous Day](../day-18-backup-script/README.md) | [Next Day →](../day-20-branching-merging/README.md)

## Goal
Install and configure Git, initialize your first local repository, and track code changes using the staging area and commits.

## Time
⏱️ Approximately 60 minutes

## Learn
- 📖 [Pro Git Book: Getting Started](https://git-scm.com/book/en/v2) — Comprehensive free guide explaining what version control is and how Git works under the hood.
- 📖 [Official Git Documentation](https://git-scm.com/doc) — The official reference manual and introductory guides for core Git commands.

## Do
In this exercise, you will configure your global identity, initialize a repository, practice staging and committing files, inspect changes, and create a `.gitignore` file.

1. Verify or install Git on your system:
   ```bash
   git --version
   # If not installed on Ubuntu/Debian:
   # sudo apt update && sudo apt install -y git
   ```

2. Configure your identity and default branch name:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   git config --global init.defaultBranch main
   git config --list
   ```

3. Create a dedicated workspace and initialize a new Git repository:
   ```bash
   mkdir -p ~/cloud-git-practice
   cd ~/cloud-git-practice
   git init
   git status
   ```

4. Create your first project file and inspect status:
   ```bash
   echo "# Cloud Engineering Notes" > README.md
   git status
   ```

5. Stage the file and create your first commit:
   ```bash
   git add README.md
   git status
   git commit -m "feat: initial commit with project readme"
   ```

6. Inspect commit history and view file differences:
   ```bash
   echo "Day 19: Learned Git initialization and commits." >> README.md
   git diff
   git add README.md
   git commit -m "docs: add day 19 notes to readme"
   git log --oneline --graph --decorate
   ```

7. Configure a `.gitignore` file to ignore sensitive or temporary files:
   ```bash
   echo "*.log" > .gitignore
   echo ".env" >> .gitignore
   echo "app.log" > app.log
   echo "API_KEY=secret" > .env
   git status
   git add .gitignore
   git commit -m "chore: add gitignore for log files and environment secrets"
   ```

## Done When
- [ ] `git --version` confirms Git is installed.
- [ ] `git config --get user.name` and `git config --get user.email` show your configured details.
- [ ] `git log --oneline` displays at least three distinct commits.
- [ ] `git status` shows untracked ignored files (`app.log`, `.env`) are ignored by Git.

## Cost and Cleanup
$0 — no cloud resources used.

To clean up your local practice repository when finished:
```bash
rm -rf ~/cloud-git-practice
```

## Stretch Goal
Learn how to inspect changes staged for commit versus working directory changes:
1. Make changes to `README.md` and stage them using `git add README.md`.
2. Make another change to `README.md` without staging.
3. Run `git diff` (shows unstaged changes) and compare the output with `git diff --staged` (shows staged changes).

## Common Mistakes
- **Committing without setting user identity:** If you skip `git config --global user.name` and `user.email`, Git may warn you or attribute commits to generic system accounts.
- **Forgetting to stage files before committing:** Running `git commit` without `git add` does not save newly created or modified files. Always check `git status` first.
- **Committing sensitive secrets:** Never commit passwords, cloud access keys, or API tokens. Always configure `.gitignore` before creating sensitive local files.
