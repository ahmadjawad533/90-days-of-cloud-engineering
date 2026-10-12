# Day 20: Git Branching and Merging

[← Previous Day](../day-19-intro-to-git/README.md) | [Next Day →](../day-21-remote-repos-github/README.md)

## Goal
Create isolated feature branches, navigate between branches, and integrate changes back into the main branch using fast-forward and three-way merges.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Learn Git Branching Interactive Tutorial](https://learngitbranching.js.org/) — A visual, interactive playground to master Git branches, commits, and tree manipulation.
- 📖 [Pro Git Book: Git Branching](https://git-scm.com/book/en/v2) — Comprehensive guide on branches, lightweight pointers, and merge fundamentals.
- 📖 [Official Git Documentation](https://git-scm.com/doc) — Command documentation for `git branch`, `git switch`, `git checkout`, and `git merge`.

## Do
In this exercise, you will create a repository, branch out to build two independent features, merge them using different strategies, and clean up stale branches.

1. Create a fresh repository for branching experiments:
   ```bash
   mkdir -p ~/branching-lab
   cd ~/branching-lab
   git init -b main
   echo "# Web Infrastructure" > index.html
   git add index.html
   git commit -m "feat: initial home page"
   ```

2. Create and switch to a new feature branch:
   ```bash
   git switch -c feature-header
   # Older syntax alternative: git checkout -b feature-header
   git branch
   ```

3. Develop changes on the feature branch and commit:
   ```bash
   echo "<header>Cloud Operations Portal</header>" >> index.html
   git commit -am "feat: add top navigation header"
   ```

4. Switch back to `main` and execute a fast-forward merge:
   ```bash
   git switch main
   git merge feature-header
   git log --oneline --graph
   ```

5. Create a second feature branch while simultaneously introducing a commit on `main`:
   ```bash
   git switch -c feature-footer
   echo "<footer>Contact: cloud-team@example.com</footer>" >> index.html
   git commit -am "feat: add page footer"

   git switch main
   echo "<!-- Deployment Target: Production -->" >> deploy.txt
   git add deploy.txt
   git commit -m "chore: add deploy target manifest"
   ```

6. Perform a three-way merge (non-conflicting independent files/sections):
   ```bash
   git merge feature-footer -m "merge: integrate feature-footer into main"
   git log --oneline --graph --decorate
   ```

7. Safely delete merged feature branches:
   ```bash
   git branch -d feature-header
   git branch -d feature-footer
   git branch
   ```

## Done When
- [ ] You have successfully used `git switch -c` to create branches and `git switch` to swap branches.
- [ ] You have performed at least one fast-forward merge and one three-way merge.
- [ ] `git log --oneline --graph` shows branch divergence and the resulting merge commit.
- [ ] Stale feature branches are deleted, leaving only `main` when executing `git branch`.

## Cost and Cleanup
$0 — no cloud resources used.

To clean up your practice directory:
```bash
rm -rf ~/branching-lab
```

## Stretch Goal
Explore `git branch --merged` and `git branch --no-merged` to inspect branch lifecycle states before deleting. Try deleting an unmerged branch with `git branch -d` to observe Git's safety warning, then understand when force-deletion (`git branch -D`) is used.

## Common Mistakes
- **Committing to `main` by accident:** Always verify your active branch with `git branch` or `git status` before editing files and committing code.
- **Modifying uncommitted files across branch switches:** If you modify files without committing or stashing, switching branches might carry dirty working tree changes or fail if files conflict.
- **Force-deleting unmerged work (`-D` vs `-d`):** Use lowercase `-d` for safe branch deletion. Git prevents deleting branches that contain unmerged work unless you explicitly intend to discard them with uppercase `-D`.
