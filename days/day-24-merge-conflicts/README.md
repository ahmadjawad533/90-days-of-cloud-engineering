# Day 24: Resolve Merge Conflicts

[← Previous Day](../day-23-git-workflows/README.md) | [Next Day →](../day-25-python-basics/README.md)

## Goal
Deliberately reproduce a Git merge conflict, understand conflict markers, resolve differences manually, and complete the merge cleanly.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [Pro Git Book: Basic Merge Conflicts](https://git-scm.com/book/en/v2) — Learn why Git triggers conflict resolution, how Git marks contested lines, and how to conclude the merge.
- 📖 [GitHub Docs: Addressing Merge Conflicts](https://docs.github.com/en/pull-requests) — Resolving merge conflicts on GitHub via command line or the web editor.
- 📖 [Official Git Documentation: git-merge](https://git-scm.com/doc) — Technical options for conflict resolution, aborting merges, and reviewing conflict status.

## Do
In this exercise, you will create a dedicated repository, intentionally create two branches with conflicting modifications on the exact same line of a file, attempt a merge to trigger a conflict, dissect the conflict markers, resolve it, and finalize the commit.

1. Create a dedicated sandbox repository for conflict practice:
   ```bash
   mkdir -p ~/conflict-lab
   cd ~/conflict-lab
   git init -b main

   cat << 'EOF' > server-config.yaml
   environment: staging
   database_host: db-staging.internal
   max_connections: 50
   EOF

   git add server-config.yaml
   git commit -m "feat: initial server configuration manifest"
   ```

2. Create and switch to a branch that changes the database host:
   ```bash
   git switch -c feature-upgrade-db
   sed -i 's/database_host: db-staging.internal/database_host: aurora-cluster-v2.internal/' server-config.yaml
   git commit -am "chore: upgrade database endpoint to aurora cluster"
   ```

3. Switch back to `main` and introduce a conflicting change on the same line:
   ```bash
   git switch main
   sed -i 's/database_host: db-staging.internal/database_host: postgres-cluster-v1.internal/' server-config.yaml
   git commit -am "chore: update database endpoint to postgres v1"
   ```

4. Attempt to merge `feature-upgrade-db` into `main` to trigger the conflict:
   ```bash
   git merge feature-upgrade-db
   ```
   Notice the output:
   ```text
   Auto-merging server-config.yaml
   CONFLICT (content): Merge conflict in server-config.yaml
   Automatic merge failed; fix conflicts and then commit the result.
   ```

5. Inspect the conflict state:
   ```bash
   git status
   cat server-config.yaml
   ```
   Notice the Git conflict markers:
   ```yaml
   environment: staging
<<<<<<< HEAD
   database_host: postgres-cluster-v1.internal
=======
   database_host: aurora-cluster-v2.internal
>>>>>>> feature-upgrade-db
   max_connections: 50
   ```
   - `<<<<<<< HEAD`: Points to the change on your current branch (`main`).
   - `=======`: The separator between conflicting versions.
   - `>>>>>>> feature-upgrade-db`: The change coming from the incoming branch.

6. Resolve the conflict manually by editing the file:
   Assume the team agreed that `aurora-cluster-v2.internal` is the correct production configuration. Edit `server-config.yaml` to remove all conflict markers and keep the agreed configuration:
   ```bash
   cat << 'EOF' > server-config.yaml
   environment: staging
   database_host: aurora-cluster-v2.internal
   max_connections: 50
   EOF
   ```

7. Stage the resolved file and finalize the merge:
   ```bash
   git add server-config.yaml
   git status
   git commit -m "merge: resolve database host conflict in server-config"
   ```

8. Verify the commit graph:
   ```bash
   git log --oneline --graph --decorate
   git branch -d feature-upgrade-db
   ```

## Done When
- [ ] You produced an intentional merge conflict between two branches.
- [ ] You inspected the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) in `server-config.yaml`.
- [ ] You removed all conflict markers and retained the agreed-upon configuration.
- [ ] `git status` shows a clean working tree after completing the merge commit.
- [ ] `git log --graph --oneline` confirms both parent branches merged successfully.

## Cost and Cleanup
$0 — no cloud resources used.

To clean up your conflict lab workspace:
```bash
rm -rf ~/conflict-lab
```

## Stretch Goal
Learn how to back out of a broken merge:
1. Re-create a conflict using the steps above.
2. Instead of resolving the conflict, run `git merge --abort`.
3. Check `git status` and verify that Git restored your repository exactly to the state before the merge attempt was made.

## Common Mistakes
- **Leaving conflict markers in the file:** If you forget to remove `<<<<<<<`, `=======`, or `>>>>>>>`, the file will fail syntax validation or break applications when deployed. Always search for `<<<<<<<` before staging.
- **Panicking when a conflict occurs:** Merge conflicts are completely normal in collaborative engineering. Git will never delete your code without warning. If you need time to consult a colleague, use `git merge --abort` to return to safety.
- **Blindly accepting one side without checking context:** Always inspect both sides of the conflict. Often, the ideal resolution combines ideas from both changes rather than simply discarding one.
