---
title: "Git Daily Workflow"
domain: "docs"
file: "git-workflow_Guide_2025-10-01.md"
main: "git-workflow"
qualifier: "Guide"
date: "2025-10-01"
time: "4:20pm"
status: "Draft"
owners: ["@conorhovis1"]
tags: ["git", "github", "workflow", "daily", "commands", "vs-code", "npm"]
spotlight:
  - "Day-to-day Git commands from VS Code terminal"
  - "Covers status, staging, committing, and pushing"
  - "Explains upstream vs origin and push variants"
  - "Includes undo (restore) and stash usage"
  - "Provides TL;DR sequence and sanity checks"
summary: "A practical guide to the day-to-day Git commands you’ll use in the VS Code terminal—checking status, running optional checks, staging and committing changes, pushing to GitHub (including first-time upstream setup), keeping main up to date, undoing or stashing work, and understanding push variants like 'git push' vs 'git push origin main'."
links:
  related:
    - "[Git Docs Index](./git-docs_Index_2025-10-01.md)"
    - "[Git Workflow Cheat Sheet](./git-workflow_CheatSheet_2025-10-01.md)"
    - "[Git Health Tool](./git-health_Tool_2025-10-01.md)"
    - "[Git Glossary](./git-glossary_Reference_2025-10-01.md)"

---

# Git Daily Workflow

This guide describes the **day‑to‑day Git commands** you’ll use when working in VS Code terminal, committing code, and pushing to GitHub.

---

## Prerequisites

- **Git installed** → check with `git --version`
- **VS Code** → open terminal with **View → Terminal** (⌃`)
- **GitHub access** → via HTTPS (with Personal Access Token) or SSH keys

---

## 0. Confirm you’re in the repo root
```bash
git rev-parse --show-toplevel
```

---

## 1. See what changed
```bash
git status -sb
```

---

## 2. Optional sanity checks
```bash
npm run typecheck && npm run lint && npm test && npm run build
```

---

## 3. Stage changes
```bash
git add -A
```

---

## 4. Commit changes
Single line message:
```bash
git commit -m "feat: add pricing helpers and integrate band component"
```

Multi‑line message:
```bash
git commit -F - <<'MSG'
feat(pricing): unify Money helpers and integrate ActionsBand

- Add normalizeMoney/formatMoney predicates
- Refactor PriceLabel/PriceTeaser to shared helpers
- Tokenize CSS and update docs
MSG
```

---

## 5. Push changes

### If branch already has upstream
```bash
git push
```

### First time push (new branch)
```bash
git push -u origin $(git branch --show-current)
```

---

## 6. Update local main
Keep your local `main` up to date:
```bash
git checkout main
git fetch origin
git pull --rebase origin main
```

---

## 7. Undoing / Stashing

**Discard local edits:**
```bash
git restore .
```

**Stash changes to come back later:**
```bash
git stash push -m "wip: spike band variants"
# later
git stash pop
```

---

## Understanding push commands

- `git push` → pushes current branch to its upstream (if set)
- `git push origin main` → pushes your local `main` branch to the remote `origin/main`
- `git push main` → often an error (Git thinks `main` is a remote, not a branch)

**Key:**
- **origin** = the GitHub repo (remote)
- **upstream** = the link between your local branch and its remote twin
- **push** = upload commits from local repo to remote repo

---

## TL;DR Workflow

```bash
# 1. check status
git status -sb

# 2. run checks
npm run typecheck && npm run lint && npm test && npm run build

# 3. stage & commit
git add -A
git commit -m "feat: update docs"

# 4. push to GitHub
git push
```

---

✅ With this workflow, you’ll keep your commits tidy, your main branch clean, and your pushes consistent.

