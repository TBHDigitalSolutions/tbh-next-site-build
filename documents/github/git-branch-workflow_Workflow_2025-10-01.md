---
title: "Git Branch Workflow"
domain: "docs"
file: "git-branch-workflow_Workflow_2025-10-01.md"
main: "git-branch-workflow"
qualifier: "Workflow"
date: "2025-10-01"
time: "4:21pm"
status: "Draft"
owners: ["@conorhovis1"]
tags: ["git", "github", "workflow", "branches", "pr", "standards", "docs"]
spotlight:
  - "Keep main release-ready and protected with PRs and CI"
  - "Do all work on short-lived feature branches"
  - "Use Pull Requests to merge into main; prefer squash merges"
  - "Rebase feature branches on origin/main to reduce conflicts"
  - "Forks are for contributors without write access"
summary: "Defines best practices for working with branches in Git and GitHub so that main stays stable while new work happens safely on feature branches. Covers naming conventions, day-to-day steps (sync main, branch, commit, push, PR, squash-merge), diagrams for branch and local↔remote flows, and maintenance tips."
links:
  related:
    - "[Git Docs Index](./git-docs_Index_2025-10-01.md)"
    - "[Branch Best Practices](./git-branch-workflow_BestPractices_2025-10-01.md)"
    - "[Git Glossary](./git-glossary_Reference_2025-10-01.md)"

---

# Git Branch Workflow

This document defines the **best practices** for working with branches in Git and GitHub, so that `main` stays stable while you experiment and build features safely.

---

## Main Principles

- **`main` branch** is always release‑ready (stable, production‑ready).
- Do **all new work** on short‑lived **feature branches**.
- Use **Pull Requests (PRs)** to merge feature branches into `main`.
- Protect `main` in GitHub: require PRs, require CI checks, and prevent force pushes.
- Forks are only needed if you don’t have write access (e.g., contributing to open source).

---

## Branch Naming

- `feat/...` → new features
- `fix/...` → bug fixes
- `docs/...` → documentation updates
- `refactor/...` → code clean‑up or reorganization
- `chore/...` → tasks like build scripts, configs

Examples:
- `feat/package-detail-overview`
- `fix/registry-footnotes`
- `docs/git-glossary`

---

## Workflow Steps

### 1. Sync local main
```bash
git checkout main
git fetch origin
git pull --rebase origin main
```

### 2. Create a feature branch
```bash
git switch -c feat/your-feature-name
```

### 3. Do work and commit
```bash
# edit files
git status -sb
git add -A
git commit -m "feat: add pricing helpers and integrate band component"
```

### 4. Push branch to GitHub
```bash
git push -u origin HEAD
```

### 5. Open a Pull Request
- Compare `feat/...` → `main`.
- Wait for CI checks to pass.
- Review changes (self‑review if solo).

### 6. Merge into main
- **Squash and merge** is recommended: keeps history clean (1 commit per PR).
- Delete the feature branch after merge.

### 7. Update your local main
```bash
git checkout main
git fetch origin
git pull --rebase origin main
git branch -d feat/your-feature-name
```

---

## Diagram: Branch Workflow

```
                   ┌──────────────┐
                   │   main       │   ← stable branch
                   └──────┬───────┘
                          │
            create branch │
                          ▼
                  ┌───────────────┐
                  │ feat/login-ui │  ← feature branch
                  └──────┬────────┘
                         │
     work + commits      │
   (git add + commit)    │
                         ▼
                  ┌───────────────┐
                  │ git push      │ → GitHub
                  └───────────────┘
                         │
                         ▼
                ┌───────────────────┐
                │ Pull Request (PR) │ → review + CI
                └─────────┬─────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   main       │ ← merge back in
                   └──────────────┘
```

---

## Diagram: Local ↔ Remote Workflow

```
   [Local Machine]                     [GitHub Remote]
   ┌─────────────────┐                 ┌──────────────────────────┐
   │ Working Dir     │  ← edit files   │                          │
   │ (VS Code)       │---------------->│   origin (remote repo)   │
   └───────┬─────────┘                 │   (on GitHub)            │
           │                           └──────────────────────────┘
  git add  │
           ▼
   ┌─────────────────┐
   │ Staging Area    │
   └───────┬─────────┘
           │
  git commit │
           ▼
   ┌─────────────────┐
   │ Local Repo      │
   │ (commits/branch)│
   └───────┬─────────┘
           │
   git push│
           ▼
   ┌──────────────────────────┐
   │ Remote Repo (origin)     │
   │ Branch: origin/main      │
   └──────────────────────────┘
```

---

## Best Practices

- Keep feature branches **short‑lived** (days, not weeks).
- Rebase often on `origin/main` to reduce conflicts.
- Don’t commit directly to `main`.
- Use squash merges for clarity.
- Write meaningful commit messages.

---

## TL;DR
- Work on **feature branches**.
- Protect `main`.
- Open PRs and squash merge.
- Keep history clean and readable.

