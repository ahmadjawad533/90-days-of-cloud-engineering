# Git Cheatsheet

A practical quick reference for version control workflows, branching strategies, troubleshooting, and collaboration standards.

---

## Table of Contents
- [Initial Setup & Configuration](#initial-setup--configuration)
- [Basic Workflow](#basic-workflow)
- [Branching & Merging](#branching--merging)
- [Remote Repositories](#remote-repositories)
- [Undoing Changes & Stashing](#undoing-changes--stashing)
- [Inspection & History](#inspection--history)
- [Advanced Git Commands](#advanced-git-commands)
- [.gitignore Patterns & Rules](#gitignore-patterns--rules)
- [Conventional Commits Standard](#conventional-commits-standard)

---

## Initial Setup & Configuration

Configure Git identity and environment-wide defaults:

```bash
# Configure global username and email (author identity)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Set default initial branch name to main
git config --global init.defaultBranch main

# Set default editor and line endings
git config --global core.editor "nano"
git config --global core.autocrlf input       # On macOS/Linux; use 'true' on Windows

# View configuration
git config --list --show-origin              # List all settings and their sources
git config user.name                         # View specific value

# Initialize and clone
git init                                     # Initialize a new Git repository in current dir
git init <project-name>                      # Initialize in a new folder
git clone <url>                              # Clone remote repo via HTTPS or SSH
git clone --depth 1 <url>                    # Shallow clone (latest commit only, fast download)
```

---

## Basic Workflow

The day-to-day lifecycle of working tree, staging area, and local history:

```bash
# Check status of modified, staged, and untracked files
git status
git status -sb                               # Short, concise status format

# Staging files
git add <file>                               # Stage specific file
git add .                                    # Stage all tracked and untracked changes
git add -p                                   # Stage file interactively chunk-by-chunk (patch mode)

# Reviewing unstaged vs staged changes
git diff                                     # Differences between working tree and staging area
git diff --staged                            # Differences between staging area and HEAD commit
git diff --stat                              # Summary of lines changed per file

# Committing changes
git commit -m "feat: add user authentication"
git commit -am "fix: typo in readme"         # Stage tracked files and commit in one step
git commit --amend -m "feat: updated message"# Modify the most recent commit message
git commit --amend --no-edit                 # Add newly staged changes to previous commit
```

---

## Branching & Merging

Manage parallel streams of development:

```bash
# Branch inspection
git branch                                   # List local branches (* indicates current)
git branch -a                                # List local and remote tracking branches
git branch -v                                # Show latest commit on each branch

# Creating and switching branches
git branch <branch-name>                     # Create branch from current commit
git switch <branch-name>                     # Modern command to switch branches
git switch -c <new-branch>                   # Create and switch to new branch
git checkout -b <new-branch>                 # Legacy equivalent of switch -c
git checkout <branch-name>                   # Legacy switch command

# Merging
git switch main
git merge <feature-branch>                   # Fast-forward or create merge commit
git merge --no-ff <feature-branch>           # Always generate a merge commit
git merge --abort                            # Abort in-progress merge during conflict

# Rebasing (replay commits on top of base branch)
git switch <feature-branch>
git rebase main                              # Rebase feature on top of main
git rebase -i HEAD~3                         # Interactive rebase of last 3 commits (squash/reword)
git rebase --continue                        # Continue rebase after resolving conflict
git rebase --abort                           # Abort rebase operation

# Deleting branches
git branch -d <branch-name>                  # Safe delete (only if already merged)
git branch -D <branch-name>                  # Force delete unmerged branch
git push origin --delete <branch-name>       # Delete branch on remote server
```

---

## Remote Repositories

Collaborate with remote platforms (GitHub, GitLab, AWS CodeCommit):

```bash
# Manage remotes
git remote -v                                # List configured remotes and URLs
git remote add origin <url>                  # Connect local repo to remote URL
git remote set-url origin <new-url>          # Update existing remote URL
git remote rename <old> <new>                # Rename remote

# Syncing changes
git fetch origin                             # Download remote objects without merging
git fetch --prune origin                     # Fetch and delete references deleted on remote
git pull origin <branch>                     # Fetch and merge remote branch into local
git pull --rebase origin <branch>            # Fetch and rebase local commits on top of remote
git push origin <branch>                     # Push commits to remote
git push -u origin <branch>                  # Push and set upstream tracking reference
git push --force-with-lease                  # Safe force push (rejects if remote updated)
```

---

## Undoing Changes & Stashing

Techniques to revert, reset, or temporarily shelve work in progress:

```bash
# Discarding local working tree changes
git restore <file>                           # Discard uncommitted changes in file
git restore --staged <file>                  # Unstage file (move back to modified)
git checkout -- <file>                       # Legacy equivalent to restore

# Temporary work shelving (Stash)
git stash                                    # Stash modified tracked changes
git stash -u                                 # Stash including untracked files
git stash list                               # List all stashed changes
git stash pop                                # Apply most recent stash and remove it from list
git stash apply stash@{1}                    # Apply specific stash without removing it
git stash drop stash@{0}                     # Delete a specific stash entry
git stash clear                              # Remove all stashes

# Undoing commits
git revert <commit-hash>                     # Create a new commit that inverts previous changes (safe)
git reset --soft HEAD~1                      # Undo commit; keep files staged
git reset HEAD~1                             # Undo commit; keep files modified but unstaged (mixed)
git reset --hard HEAD~1                      # DANGER: Discard commit and all local changes
git clean -fd                                # Remove untracked files (-f) and directories (-d)
```

---

## Inspection & History

Examine repository history and identify regressions:

```bash
# Commit logs
git log                                      # Full history log
git log --oneline --graph --decorate --all   # Compact visual ASCII commit tree
git log -n 5                                 # Show only the last 5 commits
git log --author="Jane"                      # Filter commits by author
git log --grep="CVE"                         # Filter commits by commit message pattern
git log -S "SECRET_KEY"                      # "Pickaxe" search: find commits introducing string

# Detailed inspection
git show <commit-hash>                       # View metadata and diff for a specific commit
git show <commit>:<file-path>                # View version of file as of a specific commit
git blame -L 10,35 <file>                    # Show author and commit for each line of code
git diff <branch-1>..<branch-2>              # Compare changes between two branches
```

---

## Advanced Git Commands

Power-user utilities for selective workflows and recovery:

```bash
# Cherry-picking
git cherry-pick <commit-hash>                # Apply a specific commit from another branch
git cherry-pick -n <commit-hash>             # Apply commit changes without creating a new commit

# Reflog (Safety net: records all reference updates)
git reflog                                   # Show history of HEAD movements
git reset --hard HEAD@{2}                    # Restore state before bad rebase or accidental delete

# Git Bisect (Binary search to locate regression commit)
git bisect start
git bisect bad                               # Current version has bug
git bisect good <known-working-commit>       # Older version that worked
# Test application at each checked-out commit, then run:
git bisect good   # or git bisect bad
git bisect reset                             # Exit bisect and return to original branch

# Tagging releases
git tag -a v1.0.0 -m "Release version 1.0.0" # Create annotated tag
git tag -l                                   # List tags
git push origin v1.0.0                       # Push specific tag to remote
git push origin --tags                       # Push all tags
```

---

## .gitignore Patterns & Rules

Place a `.gitignore` file at repository root to prevent accidental tracking of sensitive or generated files:

```gitignore
# Comments start with '#'
# Ignore specific file
.env
credentials.json

# Ignore all files ending in .log
*.log

# But do keep important.log even if all *.log are ignored
!important.log

# Ignore build output directories
dist/
build/
target/

# Ignore node_modules wherever they appear in the tree
node_modules/

# Ignore Python cache
__pycache__/
*.pyc

# Ignore OS-generated metadata
.DS_Store
Thumbs.db

# Ignore Terraform state and local directories
.terraform/
*.tfstate
*.tfstate.backup
*.tfvars
!terraform.tfvars.example
```

---

## Conventional Commits Standard

Structured commit messages enable automated changelogs and semantic versioning:

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Common Types
- `feat`: A new user-facing or infrastructure feature
- `fix`: A bug fix or patch
- `docs`: Documentation updates only
- `style`: Formatting, white-space, linting fixes (no code logic changes)
- `refactor`: Code refactoring that neither fixes a bug nor adds a feature
- `perf`: Code change that improves execution performance
- `test`: Adding or correcting tests
- `chore`: Maintenance tasks, dependency bumps, build tool configurations
- `ci`: Changes to CI/CD pipeline configuration (e.g. GitHub Actions)

### Examples
```
feat(auth): add OAuth2 token refresh endpoint
fix(api): handle null pointer when tenant id is missing
docs(readme): add local development prerequisites
chore(deps): update terraform aws provider to v5.0
feat(vpc)!: migrate subnet cidrs to 10.100.0.0/16

BREAKING CHANGE: Subnet CIDR block restructuring requires recreation of NAT gateways.
```
