# Day 23: Git Workflows and Best Practices

[← Previous Day](../day-22-pull-requests/README.md) | [Next Day →](../day-24-merge-conflicts/README.md)

## Goal
Implement professional Git development workflows, apply Conventional Commits, utilize `git stash` to manage interrupted work, and clean up commit history.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Pro Git Book: Branching Workflows](https://git-scm.com/book/en/v2) — Learn about GitHub Flow, Git Flow, topic branches, and progressive stability.
- 📖 [Official Git Documentation: Stashing and Cleaning](https://git-scm.com/doc) — Reference guide for `git stash`, saving progress, and switching tasks safely.
- 📖 [GitHub Get Started: Understanding GitHub Flow](https://docs.github.com/en/get-started) — GitHub's lightweight, branch-based workflow used widely across cloud engineering and DevOps teams.

## Do
In this exercise, you will practice GitHub Flow, apply the Conventional Commits specification, temporarily shelter uncommitted work using `git stash`, and practice amending commits to maintain a pristine history.

1. Review the Conventional Commits structure used in production engineering:
   - `feat:` A new feature or capability
   - `fix:` A bug fix
   - `docs:` Documentation changes only
   - `refactor:` Code refactoring that neither fixes a bug nor adds a feature
   - `ci:` Changes to CI/CD configuration files and scripts
   - `chore:` Routine tasks, dependency updates, tooling configuration

2. Navigate to your workspace and check working state:
   ```bash
   cd ~/cloud-repo-remote
   git checkout main
   git pull origin main
   ```

3. Create a branch following branch naming conventions (`feature/`, `bugfix/`, `hotfix/`, `chore/`):
   ```bash
   git switch -c feature/health-check-monitor
   ```

4. Simulate an urgent interruption using `git stash`:
   Suppose you are halfway through writing an unfinished script when an urgent fix is requested on `main`.
   ```bash
   echo "# Work in progress: health monitor logic" > monitor.sh
   git status

   # Stash your unfinished changes away safely:
   git stash save "WIP: initial monitor script"
   git status
   # The working directory is now clean!
   ```

5. Switch to `main` and execute the hotfix:
   ```bash
   git switch main
   git switch -c hotfix/fix-typo
   echo "# Verified Cloud Engineering Workspace" > WORKSPACE.md
   git add WORKSPACE.md
   git commit -m "fix(docs): fix workspace naming typo in manifest"
   git switch main
   git merge hotfix/fix-typo
   git branch -d hotfix/fix-typo
   ```

6. Return to your feature branch and restore stashed work:
   ```bash
   git switch feature/health-check-monitor
   git stash list
   git stash pop
   git status
   ```

7. Complete the feature and practice amending the commit message:
   ```bash
   cat << 'EOF' >> monitor.sh
   #!/usr/bin/env bash
   echo "Checking cluster endpoint health..."
   curl -s -o /dev/null -w "%{http_code}\n" https://aws.amazon.com
   EOF

   git add monitor.sh
   git commit -m "feat(monitor): draft health check curl test"

   # Suppose you want to amend the last commit message or include an omitted file:
   chmod +x monitor.sh
   git add monitor.sh
   git commit --amend -m "feat(monitor): add executable curl health check probe"
   git log -n 1 --stat
   ```

8. Clean up experimental branch:
   ```bash
   git switch main
   git branch -D feature/health-check-monitor
   ```

## Done When
- [ ] You have created branches following descriptive prefix standards (e.g., `feature/`, `hotfix/`).
- [ ] You used `git stash save`, verified a clean working directory, and retrieved work with `git stash pop`.
- [ ] You practiced writing commit messages adhering to the Conventional Commits format (`type(scope): description`).
- [ ] You amended the most recent commit using `git commit --amend`.

## Cost and Cleanup
$0 — no cloud resources used.

No external resources to clean up.

## Stretch Goal
Explore interactive rebasing to squash commits:
1. Make 3 small, messy commits on a test branch (e.g., `wip 1`, `wip 2`, `fix typo`).
2. Run `git rebase -i HEAD~3`.
3. In the interactive editor, leave the first commit as `pick` and change the subsequent commits to `squash` (or `s`).
4. Save and write a clean, single Conventional Commit message summarizing the three commits.
5. Verify with `git log --oneline` that the history now contains a single clean commit.

## Common Mistakes
- **Never rewrite shared public history:** Never run `git commit --amend` or `git rebase` on commits that have already been pushed to a shared remote branch that teammates are working on. This changes commit hashes and desynchronizes their local trees.
- **Losing track of stashes:** Running `git stash` repeatedly without descriptive messages can lead to confusion. Always supply a message using `git stash save "description"` and verify with `git stash list`.
- **Huge monolithic commits:** Avoid bundling multiple unrelated changes into one commit with a vague message like "updates". Split work into small, focused, logically atomic commits.
