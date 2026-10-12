# Day 21: Remote Repositories and GitHub

[← Previous Day](../day-20-branching-merging/README.md) | [Next Day →](../day-22-pull-requests/README.md)

## Goal
Connect a local Git repository to a remote GitHub repository, push commits, and understand how to fetch, pull, and clone code.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [GitHub Get Started Documentation](https://docs.github.com/en/get-started) — Official guide on account setup, authentication (SSH/Personal Access Tokens), and managing repositories.
- 📖 [Pro Git Book: Working with Remotes](https://git-scm.com/book/en/v2) — In-depth breakdown of `git remote`, `git push`, `git fetch`, and tracking branches.
- 📖 [Official Git Documentation: Remotes](https://git-scm.com/doc) — Official command reference for remote operations.

## Do
In this exercise, you will authenticate with GitHub, create a new remote repository on GitHub, link your local repository, push changes, and clone the repository to another local directory to practice remote synchronization.

1. Verify authentication with GitHub:
   Ensure you have either an SSH key configured or a Personal Access Token (PAT) for HTTPS authentication.
   ```bash
   # Test SSH connection if using SSH keys:
   ssh -T git@github.com
   # Output should confirm: Hi <username>! You've successfully authenticated...
   ```

2. Create a local project to push:
   ```bash
   mkdir -p ~/cloud-repo-remote
   cd ~/cloud-repo-remote
   git init -b main
   echo "# Cloud Engineering Portfolio" > README.md
   echo "Tracking cloud infrastructure code and automation scripts." >> README.md
   git add README.md
   git commit -m "feat: initial portfolio documentation"
   ```

3. Create an empty repository named `cloud-engineering-portfolio` on GitHub:
   - Navigate to [GitHub](https://github.com/) in your browser.
   - Click the **+** icon in the upper-right corner and select **New repository**.
   - Name it `cloud-engineering-portfolio`.
   - Leave it **Public** (or **Private**).
   - **Do not** initialize with a README, .gitignore, or license (we already have local files).
   - Click **Create repository**.

4. Link the remote origin and push the `main` branch:
   ```bash
   # Replace YOUR_GITHUB_USERNAME with your actual username:
   # If using SSH:
   git remote add origin git@github.com:YOUR_GITHUB_USERNAME/cloud-engineering-portfolio.git
   # If using HTTPS:
   # git remote add origin https://github.com/YOUR_GITHUB_USERNAME/cloud-engineering-portfolio.git

   git remote -v
   git push -u origin main
   ```

5. Simulate a multi-workstation setup by cloning to a second directory:
   ```bash
   mkdir -p ~/cloned-portfolio
   git clone git@github.com:YOUR_GITHUB_USERNAME/cloud-engineering-portfolio.git ~/cloned-portfolio
   # Or using HTTPS clone URL:
   # git clone https://github.com/YOUR_GITHUB_USERNAME/cloud-engineering-portfolio.git ~/cloned-portfolio
   cd ~/cloned-portfolio
   git log --oneline
   ```

6. Make a commit in the clone and push:
   ```bash
   echo "Adding automated health-check script roadmap." >> README.md
   git commit -am "docs: update roadmap in cloned repo"
   git push origin main
   ```

7. Return to the original local directory and synchronize with `fetch` and `pull`:
   ```bash
   cd ~/cloud-repo-remote
   # Fetch downloads updates without merging them into your working branch:
   git fetch origin
   git status
   # Pull downloads and integrates remote changes:
   git pull origin main
   git log --oneline
   ```

## Done When
- [ ] Your GitHub account displays the `cloud-engineering-portfolio` repository with your pushed commits.
- [ ] `git remote -v` in your local repository points to your remote GitHub URL.
- [ ] You have cloned your repository into a secondary location and verified commit history.
- [ ] Running `git pull origin main` in the original repository updates your local branch with changes pushed from the clone.

## Cost and Cleanup
$0 — no cloud resources used.

To clean up the local directories:
```bash
rm -rf ~/cloud-repo-remote ~/cloned-portfolio
```
*(Optional: You can keep or delete the repository on GitHub via Repository Settings > General > Danger Zone > Delete this repository).*

## Stretch Goal
Inspect tracking branches and upstream status:
1. Run `git branch -vv` to see how local `main` tracks `[origin/main]`.
2. Push a new branch to GitHub without `-u` first, and observe the error message when running `git push` or `git pull` later.
3. Configure the upstream branch manually using `git push --set-upstream origin <branch-name>`.

## Common Mistakes
- **Pushing before setting upstream (`-u`):** For the first push on a branch, always use `git push -u origin <branch>` so Git remembers where to push and pull in subsequent commands.
- **HTTPS password rejection:** GitHub discontinued account passwords for Git CLI operations in 2021. You must use SSH keys or a GitHub Personal Access Token (Classic or Fine-grained) as your password.
- **Initializing remote with README when local repo already has one:** If you create a README on GitHub and also have one locally, `git push` will fail because the commit histories diverge. Start with an empty repo on GitHub when pushing existing local code.
