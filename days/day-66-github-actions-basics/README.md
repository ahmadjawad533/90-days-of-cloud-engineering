# Day 66: GitHub Actions Basics
[← Previous Day](../day-65-what-is-cicd/README.md) | [Next Day →](../day-67-ci-pipeline/README.md)

## Goal
Master GitHub Actions fundamentals including workflows, triggers, runners, jobs, steps, actions, and YAML syntax by building your first automated workflow.

## Time
⏱️ Approximately 75 minutes

## Learn
- 📖 [GitHub Actions: Understanding GitHub Actions](https://docs.github.com/en/actions/about-features-and-models-to-build-with-github-actions/understanding-github-actions) — Official documentation explaining workflows, events, jobs, steps, and runners.
- 📖 [GitHub Actions Quickstart](https://docs.github.com/en/actions/quickstart) — Step-by-step official tutorial creating your first GitHub Actions workflow.

## Do
1. **Understand GitHub Actions workflow architecture**:
   - **Workflow**: Configured in `.github/workflows/*.ya?ml`.
   - **Events (`on:`)**: Triggers such as `push`, `pull_request`, `workflow_dispatch`, or scheduled crons.
   - **Jobs**: Sets of steps executed on a runner (`runs-on: ubuntu-latest`). Jobs run in parallel by default unless dependencies (`needs:`) are declared.
   - **Steps**: Individual tasks running shell commands (`run:`) or reusable actions (`uses:`).

2. **Create a local git repository to experiment with GitHub Actions workflows**:
   ```bash
   mkdir -p /tmp/actions-basics/.github/workflows
   cd /tmp/actions-basics
   git init
   ```

3. **Write your first workflow file**:
   ```bash
   cat << 'EOF' > .github/workflows/hello-actions.yml
   name: Hello GitHub Actions

   on:
     push:
       branches: [ "main" ]
     pull_request:
       branches: [ "main" ]
     workflow_dispatch:

   jobs:
     greet:
       name: Say Hello & Inspect Environment
       runs-on: ubuntu-latest

       steps:
         - name: Print welcome message
           run: |
             echo "Welcome to GitHub Actions!"
             echo "Triggered by event: ${{ github.event_name }}"
             echo "Commit SHA: ${{ github.sha }}"
             echo "Ref: ${{ github.ref }}"

         - name: Display runner system information
           run: |
             uname -a
             lsb_release -a || cat /etc/os-release
             free -h
             df -h
   EOF
   ```

4. **Add a multi-job workflow with dependencies (`needs`)**:
   Create a second workflow to see how jobs communicate and execute sequentially:
   ```bash
   cat << 'EOF' > .github/workflows/multi-job.yml
   name: Multi-Job Workflow

   on:
     workflow_dispatch:

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Build step
           run: echo "Compiling project assets..."

     test:
       needs: build
       runs-on: ubuntu-latest
       steps:
         - name: Test step
           run: echo "Running test suite after build passes..."

     notify:
       needs: [build, test]
       runs-on: ubuntu-latest
       steps:
         - name: Notification step
           run: echo "All jobs succeeded!"
   EOF
   ```

5. **Commit your workflows to git and inspect syntax**:
   ```bash
   git add .
   git commit -m "Add GitHub Actions starter workflows"
   ```

6. **Validate the workflow YAML syntax locally**:
   Ensure YAML parsing is valid with python:
   ```bash
   python3 -c "import yaml; yaml.safe_load(open('.github/workflows/hello-actions.yml')); yaml.safe_load(open('.github/workflows/multi-job.yml')); print('YAML syntax is valid!')"
   ```

## Done When
- [ ] You can identify and explain the purpose of `workflow`, `on`, `jobs`, `runs-on`, `steps`, `uses`, and `run`.
- [ ] You have written valid YAML files defining single-job and multi-job dependency chains.
- [ ] You know where GitHub Actions looks for workflow definitions (`.github/workflows/`).

## Cost and Cleanup
$0 — GitHub Actions offers generous free tier minutes (free unlimited public repository minutes, 2,000 monthly minutes for private repos).

Clean up local temporary files:
```bash
rm -rf /tmp/actions-basics
```

## Stretch Goal
Learn how to use matrix builds in GitHub Actions. Write a job definition with `strategy: matrix:` that runs your steps across multiple operating systems (`ubuntu-latest`, `macos-latest`, `windows-latest`) or multiple Python versions (`3.10`, `3.11`, `3.12`) simultaneously.

## Common Mistakes
- **Incorrect directory placement**: Placing workflow files in `.github/workflow/` instead of `.github/workflows/` (plural) prevents GitHub from detecting them.
- **YAML indentation errors**: Mixing tabs and spaces or using irregular 2-space vs 4-space indentation breaks YAML parsing.
- **Assuming jobs run sequentially by default**: Jobs in a workflow run in parallel unless you explicitly link them using `needs: <job_id>`.
