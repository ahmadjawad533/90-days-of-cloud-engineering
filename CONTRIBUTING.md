# Contributing to 90 Days of Cloud Engineering

Welcome! 🎉 Thank you for considering contributing to the **90 Days of Cloud Engineering** project! Whether you are a seasoned cloud architect or brand new to tech and open source, your help is warmly welcomed and deeply appreciated.

Open-source projects thrive because of community members like you. No contribution is too small—even fixing a single typo or updating an outdated link helps learners across the globe.

---

## 🚀 Quick Wins (Fix Something in 5 Minutes!)

Want to make your very first open source contribution without a heavy time commitment? Here are three fast ways to make an immediate impact:

### 1. Fix a Broken Link
Over time, external documentation, blog posts, or video links can move or break (resulting in 404 errors).
- **Find one:** As you read through any day's lesson, click on the resource links. If a page fails to load or gives a 404 error, you've found a fixable issue!
- **Locate the file:** Note the day and file path (for example, `days/day-05.md`).
- **Edit and fix:** Find the updated URL or an equivalent high-quality replacement resource.
- **Submit a PR:** Edit the file directly on GitHub or locally, and open a pull request titled `fix(links): update broken link in day-XX`.

### 2. Fix a Typo or Grammatical Issue
Clear communication makes learning easier for everyone.
- Spot an awkward sentence, spelling error, or formatting glitch in markdown?
- Click the pencil icon on GitHub or edit the file locally, correct the wording, and open a pull request with the title `fix(typo): correct spelling in day-XX`.

### 3. Add a Missing Resource
Did you discover an amazing beginner-friendly tutorial, diagram, documentation page, or cheat sheet that made a concept click for you?
- Open the relevant topic file.
- Add the resource under the **Resources** section following our style guide (mark paid resources with 💳).
- Submit a PR titled `docs(resources): add tutorial on [topic] to day-XX`.

---

## 🌟 Bigger Contributions

Ready to dive deeper and create more substantial improvements? Here are areas where you can make a major impact:

- **Add a New Day Topic:** Propose or expand on curriculum topics, such as deep dives into new cloud services, security best practices, or FinOps practices.
- **Translate Content:** Help translate lessons, guides, and labs into other languages (e.g., Spanish, Portuguese, Hindi, Arabic) to make cloud engineering accessible worldwide.
- **Improve a Lab:** Update step-by-step instructions, refresh outdated CLI commands or screenshots, or create an entirely new hands-on lab.
- **Add Interview Questions:** Contribute realistic real-world technical and behavioral interview questions and detailed answer explanations to our question bank.

> If you plan to make a large change or add brand new days, please [open an issue](https://github.com/ahmadjawad533/90-days-of-cloud-engineering/issues/new/choose) first so we can discuss the proposal together!

---

## 🛠️ How to Contribute (Step by Step)

Follow these steps to propose changes:

### Step 1: Fork the Repository
Click the **Fork** button at the top right of this repository page on GitHub to create your personal copy of the repository under your GitHub account.

### Step 2: Create a Branch
Clone your fork to your local machine and create a new feature branch. Please follow our branch naming conventions:
- Bug fixes / link fixes: `fix/topic` (e.g., `fix/day-12-links`)
- New features / content: `feat/topic` (e.g., `feat/terraform-lab`)
- Documentation / typography: `docs/topic` (e.g., `docs/k8s-interview-questions`)

```bash
git clone https://github.com/<your-username>/90-days-of-cloud-engineering.git
cd "90-days-of-cloud-engineering"
git checkout -b feat/my-new-feature
```

### Step 3: Make Changes
Edit the files using your favorite text editor. Make sure your changes are clear, focused, and well-organized.

### Step 4: Test Your Changes
Before pushing your commits, verify the following:
- **Links work:** Ensure all URLs resolve properly and are not broken.
- **Markdown renders:** Preview markdown in your editor to verify tables, code blocks, lists, and headings render cleanly.
- **Labs run:** If you modified code, scripts, or cloud CLI instructions, run them end-to-end to ensure they execute without errors.

### Step 5: Submit a Pull Request (PR)
Push your branch to your GitHub fork:
```bash
git add .
git commit -m "docs: add hands-on lab instructions for day 15"
git push origin feat/my-new-feature
```
Then navigate to the original repository on GitHub and click **Compare & pull request**.
- Fill out the PR template completely.
- Describe what changes you made and link any related issues (e.g., `Closes #42`).

### Step 6: Wait for Review
The maintainers will review your PR, provide constructive feedback, or suggest edits. Don't worry if changes are requested—code review is a normal, collaborative part of open source! Once approved, your PR will be merged into `main`.

---

## 🎨 Style Guide

To maintain a consistent, high-quality experience for all learners, please follow these style guidelines:

### Markdown Formatting Rules
- Use ATX-style headings (`#`, `##`, `###`). Avoid skipping heading levels (e.g., jumping from `##` to `####`).
- Use fenced code blocks with language identifiers (e.g., ````bash`, ````yaml`, ````python`).
- Use standard hyphenated bullet points (`-`) for unordered lists.
- Keep line lengths readable and format markdown tables with clean column alignment.

### Day File Template
Every daily guide must follow the standard day structure:
1. **Title & Day Number**
2. **Overview & Learning Objectives**
3. **Core Concepts (Theory explained simply)**
4. **Hands-on Lab / Walkthrough**
5. **Key Takeaways & Summary**
6. **Resources & Further Reading**
7. **Daily Challenge / Practice Questions**

### Beginner-Friendly Tone
- Use welcoming, encouraging, and accessible language.
- **No jargon without explanation:** Always define acronyms and technical terms on first mention (e.g., explain what IAM, VPC, or CIDR means before using it).
- Prefer step-by-step practical explanations over dense abstract theory.

### Resource Guidelines
- **Verify Every Link:** Check that all links are active, HTTPS-secured, and lead directly to the referenced content.
- **Mark Paid Resources with 💳:** If a book, course, or tool is not 100% free, clearly mark it with a credit card emoji: `💳 (Paid)`. Learners should always know ahead of time if a resource requires payment.

---

## 🤝 Code of Conduct Reference

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## 💻 Development Setup

Contributing to this documentation project requires very few tools:

### Tools Needed
- **Git:** For version control ([Download Git](https://git-scm.com/))
- **A Text Editor:** Visual Studio Code, Cursor, Neovim, or your preferred editor
- **Markdown Linter (Optional):** [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint) extension for VS Code or CLI tool

### Running the Link Checker Locally
To test markdown links locally before submitting your PR, you can use `markdown-link-check` or `lychee`:

```bash
# Using markdown-link-check via npx (requires Node.js)
npx markdown-link-check README.md
npx markdown-link-check path/to/day-file.md

# Or check all markdown files with a simple find command
find . -name "*.md" -not -path "*/node_modules/*" -exec npx markdown-link-check {} \;
```

Alternatively, if you use `lychee`:
```bash
lychee --format detailed "**/*.md"
```

---

Thank you again for helping make cloud engineering accessible to everyone! 🚀 Happy learning and contributing!
