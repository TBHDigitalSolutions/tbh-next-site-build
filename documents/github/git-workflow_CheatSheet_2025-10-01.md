---
title: "Git Workflow Cheat Sheet (VS Code + GitHub)"
domain: "docs"
file: "git-workflow_CheatSheet_2025-10-01.md"
main: "git-workflow"
qualifier: "CheatSheet"
date: "2025-10-01"
time: "4:20"
status: "Draft"
owners: ["@conorhovis1"]
tags: ["git", "github", "cheatsheet", "workflow", "vs-code", "npm", "beginners"]
spotlight:
  - "Daily single-commit workflow with clear, copy-pasteable commands"
  - "Explains origin vs upstream and correct push variants"
  - "First-time setup and verifying repo/remote/branch in VS Code"
  - "Keeping in sync with rebase and safe force-with-lease"
  - "Common fixes and a quick glossary for new developers"
summary: "A quick reference for day-to-day Git use in VS Code, covering status, staging, committing, pushing, first-time upstream setup, verifying repo/remote/branch, the difference between 'git push', 'git push origin main', and 'git push main', plus sync tips, common fixes, and a beginner-friendly glossary."
links:
  related:
    - "[Git Docs Index](./git-docs_Index_2025-10-01.md)"
    - "[Git Daily Workflow Guide](./git-workflow_Guide_2025-10-01.md)"
    - "[Git Health Tool](./git-health_Tool_2025-10-01.md)"
    - "[Git Glossary](./git-glossary_Reference_2025-10-01.md)"

---

# Git Workflow Cheat Sheet (VS Code + GitHub)

This quick reference explains daily single-commit workflow, what **origin** means, the difference between `git push`, `git push origin main`, and `git push main`, how to verify you’re connected to the right GitHub repo/branch, and first‑push setup. Commands assume **npm** (not pnpm) on macOS.

---

## Daily workflow (single commit)

```bash
# 0) confirm you’re inside the repo (optional)
git rev-parse --show-toplevel

# 1) see changes + branch
git status -sb

# 2) optional checks before committing
npm run typecheck && npm run lint && npm test && npm run build

# 3) stage + commit
git add -A
git commit -m "feat: short, clear message"

# 4) push to the configured upstream
git push
```

If this is the **first push** on this branch (no upstream yet):
```bash
git push -u origin $(git branch --show-current)
```

### Multi‑line commit message (copy‑paste safe)
```bash
git commit -F - <<'MSG'
feat: short subject line (≤ 72 chars)

- Bullet 1
- Bullet 2
MSG
```

---

## “origin”, “upstream”, and push commands — explained

### What is `origin`?
`origin` is just Git’s nickname for the **remote repo on GitHub**. Your laptop copy is *local*; GitHub is the *remote*.

### What is “upstream”?
The remembered link between your **local branch** and a specific **remote branch** (e.g., `main ↔ origin/main`). You set it once with `-u`, then plain `git push` and `git pull` know where to go.

```bash
# set upstream on first push
git push -u origin main
```

### Push variants
- `git push` → push current branch to its **configured upstream** (works after you set it once).
- `git push origin main` → explicitly push your local **main** to **origin/main** (remote name first!).
- `git push main` → **WRONG** in most cases. Git treats `main` here as a *remote name*, not a branch. Unless you actually created a remote called `main`, this fails.

> Mental model: `git push <remote> <branch>`

---

## Verify repo, remote, branch (from VS Code Terminal)

```bash
# which repository (absolute path)?
git rev-parse --show-toplevel

# which branch?
git branch --show-current

# what remotes are configured (and their URLs)?
git remote -v

# details for 'origin' (tracking, upstream info)
git remote show origin

# quick connectivity check to GitHub (lists refs without changing files)
git ls-remote --heads origin
```

You should see a GitHub URL like:
- HTTPS: `https://github.com/<org>/<repo>.git`
- SSH:   `git@github.com:<org>/<repo>.git`

---

## First‑time setup (if the folder isn’t a repo yet)

```bash
git init
# default branch (optional if your Git already defaults to main)
git branch -M main

git add -A
git commit -m "chore: initial commit"

# connect to GitHub
# HTTPS
git remote add origin https://github.com/<org>/<repo>.git
# or SSH
# git remote add origin git@github.com:<org>/<repo>.git

# first push (sets upstream)
git push -u origin main
```

---

## Keeping in sync

```bash
# update your local branch with the latest from the remote
# (rebase keeps history linear; you can use merge instead if you prefer)
git fetch origin
git rebase origin/main   # if you’re on main
# resolve conflicts → git add -A → git rebase --continue

# then push
git push
```

If you amended or rebased and already pushed, you may need:
```bash
git push --force-with-lease
```
*(Use with care; coordinate if others are pushing to the same branch.)*

---

## Common fixes & tips

- **Created nested folders but parents were missing** → use `mkdir -p path/to/nested/dirs`
- **Need empty directories in Git** → add a `.keep` file inside them
- **Non‑fast‑forward on push** → `git fetch origin && git rebase @{u}` then `git push`
- **Switch HTTPS ↔ SSH** → `git remote set-url origin <new-url>`
- **See who imports a file** → `git grep -n "from '.../file'"`

---

## Glossary
- **Local repo**: your copy on the laptop.
- **Remote repo**: a server copy (GitHub). Default remote is `origin`.
- **Branch**: a movable pointer to a line of commits (e.g., `main`).
- **Upstream**: the remote branch your local branch tracks (e.g., `origin/main`).
- **Push**: upload your new commits to the remote.
- **Pull**: bring remote commits down (fetch+merge or fetch+rebase).

---

### TL;DR
- First time: `git push -u origin main`
- Thereafter: `git push`
- `origin` = GitHub remote, **not** your computer
- `git push main` ≠ push the main branch (it tries to push to a remote named `main`)

---

All set—I added a ready-to-commit **`docs/git-workflow.md`** cheat sheet in the canvas.

To put it into your repo:

1. In VS Code, create the file and paste the canvas content:

```
docs/git-workflow.md
```

2. Commit it:

```bash
git add docs/git-workflow.md
git commit -m "docs: add Git workflow cheat sheet (origin vs push explained)"
git push
```

Want me to also add a tiny `scripts/git-health.sh` that prints repo, branch, upstream, and remote URL in one go?
