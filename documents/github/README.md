---
title: "Git Docs README"
domain: "docs"
file: "README.md"
main: "git-docs"
qualifier: "Index"
date: "2025-10-01"
time: "14:30"
status: "Draft"
owners: ["@conorhovis1"]
tags: ["git","github","docs","index","workflow","reference","tools"]
spotlight:
  - "Landing page for all Git & GitHub documentation"
  - "Organized into Workflows, Tools, and Reference"
  - "Links to daily workflow guides, branching best practices, health scripts, and glossary"
  - "Provides descriptions for each document to guide new developers"
summary: "This index file serves as the entry point for all Git & GitHub documentation. It organizes the repo’s Git docs into Workflows, Tools, and Reference, and provides descriptions of each file so contributors can quickly find what they need."
links:
  related:
    - "./git-workflow_Guide_2025-10-01.md"
    - "./git-workflow_CheatSheet_2025-10-01.md"
    - "./git-branch-workflow_Workflow_2025-10-01.md"
    - "./git-branch-workflow_BestPractices_2025-10-01.md"
    - "./git-health_Tool_2025-10-01.md"
    - "./git-glossary_Reference_2025-10-01.md"

---

# Git Docs Index

## Workflows
- [Git Daily Workflow Guide](./git-workflow_Guide_2025-10-01.md)
- [Git Workflow Cheat Sheet](./git-workflow_CheatSheet_2025-10-01.md)
- [Branch Workflow](./git-branch-workflow_Workflow_2025-10-01.md)
- [Branch Best Practices](./git-branch-workflow_BestPractices_2025-10-01.md)

## Tools
- [Git Health Tool](./git-health_Tool_2025-10-01.md)

## Reference
- [Git Glossary](./git-glossary_Reference_2025-10-01.md)

---

# Git Docs Index

This index collects all Git & GitHub related documentation into one place. It is designed to help both new developers and experienced contributors navigate daily workflows, branching strategies, tools, and reference material.

---

## Workflows

* [**Git Daily Workflow Guide**](./git-workflow_Guide_2025-10-01.md)
  A full day-to-day reference for working with Git in VS Code. Covers checking repo status, running sanity checks, staging and committing, pushing, keeping `main` up to date, undoing changes, and stashing. Explains push variants (`git push` vs `git push origin main`), making it an essential how-to guide for new developers.

* [**Git Workflow Cheat Sheet**](./git-workflow_CheatSheet_2025-10-01.md)
  A compact quick-reference companion to the Guide. Provides copy-pasteable commands for the daily flow, explains origin vs upstream, and highlights common fixes. Ideal for quick lookups. Links back to the full Guide for deeper explanations.

* [**Branch Workflow**](./git-branch-workflow_Workflow_2025-10-01.md)
  A practical step-by-step branching workflow. Includes diagrams showing how local → remote and feature → main branches flow, and explains how to create, push, PR, and merge feature branches cleanly. Designed for developers who want a visual and structured process.

* [**Branch Best Practices**](./git-branch-workflow_BestPractices_2025-10-01.md)
  A conceptual companion to the Branch Workflow. Explains *why* `main` must stay stable, the role of PRs and squash merges, and when to use branches vs forks. Offers strategy and philosophy behind Git usage, not just commands.

---

## Tools

* [**Git Health Tool**](./git-health_Tool_2025-10-01.md)
  A ready-to-use shell script (`scripts/git-health.sh`) with a guide. Provides a fast snapshot of repo, branch, upstream, and sync state. Reports ahead/behind counts, cleanliness, remote connectivity, and last commit info. Recommended before pushing or after rebasing/merging to ensure your local branch is safe to push.

---

## Reference

* [**Git Glossary**](./git-glossary_Reference_2025-10-01.md)
  A plain-language glossary of Git & GitHub terms written for beginners. Explains repos, branches, commits, upstreams, remotes, push/pull, HTTPS vs SSH, tags, and more. Designed so a new developer (even age 15) can understand Git concepts clearly. Serves as a foundation for all the other docs.

---

## 🗂 Structure

```
documents/github/
├── git-branch-workflow_BestPractices_2025-10-01.md
├── git-branch-workflow_Workflow_2025-10-01.md
├── git-glossary_Reference_2025-10-01.md
├── git-health_Tool_2025-10-01.md
├── git-workflow_CheatSheet_2025-10-01.md
└── git-workflow_Guide_2025-10-01.md
```

### **Branch Workflow**

* **BestPractices** → conceptual strategy for branches, forks, PRs, squash merges.
* **Workflow** → practical branch flow with commands & diagrams.
  🔗 Both link to each other.

### **Daily Workflow**

* **Guide** → detailed daily Git usage.
* **CheatSheet** → condensed quick-reference.
  🔗 CheatSheet links back to Guide for detail.

### **Tools**

* **Git Health** → diagnostic tool for safe pushes.
  🔗 Should be referenced in daily workflows.

### **Reference**

* **Git Glossary** → beginner-friendly terms.
  🔗 Should be referenced everywhere.

---