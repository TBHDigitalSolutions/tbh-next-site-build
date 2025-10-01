---
title: "Branching Workflow and Best Practices"
domain: "docs"
file: "git-branch-workflow_BestPractices_2025-10-01.md"
main: "git-branch-workflow"
qualifier: "BestPractices"
date: "2025-10-01"
time: "13:30"
status: "Draft"
owners: ["@conorhovis1"]
tags: ["git", "github", "workflow", "branches", "pull-requests", "ci", "best-practices"]
spotlight:
  - "Keep main branch release-ready and protected with branch protection rules"
  - "Perform all work on short-lived feature branches"
  - "Open Pull Requests (PRs) for merging into main, even for solo developers"
  - "Prefer squash merges for cleaner history and easier reverts"
  - "Use forks only when you lack write access to the main repository"
summary: "This document explains the recommended Git branching workflow and best practices. It emphasizes treating main as release-ready, creating short-lived feature branches, using PRs with CI checks, and merging changes via squash merge. It covers branch naming, commit hygiene, rebasing, when to use forks, solo developer practices, and common pitfalls with suggested fixes."
links:
  related:
    - "[Git Docs Index](./git-docs_Index_2025-10-01.md)"
    - "[Branch Workflow](./git-branch-workflow_Workflow_2025-10-01.md)"
    - "[Git Glossary](./git-glossary_Reference_2025-10-01.md)"
---

Great question. Here’s a clear, practical branching workflow that keeps **`main`** stable and gives you a safe place to build, test, and experiment.

# The short answer

* Treat **`main`** as **release-ready** (a “master file”). Protect it.
* Do all work on short-lived **feature branches** (a.k.a. topic branches).
* Open a **Pull Request (PR)** from your feature branch → **`main`**.
* Use CI checks + review (even if solo). **Squash-merge** to keep history clean.
* **Forks** are for external contributors or when you don’t have write access.

---

# Recommended workflow (for your repo)

## 0) One-time repo settings (GitHub)

* **Protect `main`**: Settings → Branches → Branch protection rules

  * Require PR before merge
  * Require status checks (build/tests/linters) to pass
  * Dismiss stale approvals on new commits
  * Disallow force pushes to `main`
* Add a **PR template** and enable **Actions/CI** (run `npm run typecheck`, `npm test`, `npm run build`).

## 1) Sync local and branch off

```bash
git checkout main
git fetch origin
git pull --rebase origin main

# create a feature branch
git switch -c feat/package-detail-overview-copy
```

## 2) Work, commit, push

```bash
# do work
git status -sb
git add -A
git commit -m "feat(packages): refine PackageDetailOverview copy and layout"

# publish the branch and set upstream
git push -u origin HEAD
```

## 3) Open a PR → main

* On GitHub, open PR from `feat/...` → `main`.
* Ensure CI is green; address review comments (or self-review if solo).
* Prefer **Squash merge** (one clean commit on `main` with your PR title/body).

## 4) Update your local main after merge

```bash
git checkout main
git fetch origin
git pull --rebase origin main
git branch -d feat/package-detail-overview-copy   # delete merged branch
```

---

# Branch naming & commit hygiene

* **Branch names**:
  `feat/…`, `fix/…`, `docs/…`, `refactor/…`, `chore/…`
  e.g. `feat/price-actions-band`, `fix/registry-footnotes`, `docs/git-workflow`
* **Commits**: small, purposeful messages; Conventional Commits are great.
* **Rebase** your feature branch on top of the latest `origin/main` instead of merging `main` into it repeatedly (keeps the PR linear and easy to review).

```bash
git fetch origin
git rebase origin/main
# resolve conflicts → git add -A → git rebase --continue
```

---

# When to use forks vs branches

**Use branches (preferred for you):**

* You have write access to the repo (your case).
* Team members collaborate within the same org/repo.
* Pros: simpler permissions, shared CI, easier PR flow.

**Use forks:**

* You don’t have write access (open-source contribution).
* You want strict separation of experiments or sensitive work.
* Pros: isolation; Con: setup overhead, cross-repo PRs, token/Secrets limits.

For your project, stick with **feature branches** in the same repo.

---

# Best-practice merge strategy

* **Squash & merge** PRs → a single, clean commit on `main`.
  Benefits: tidy history, 1-to-1 mapping between PR and `main` commit, easy reverts.
* **Merge commits** only if you truly want to preserve detailed branch history.
* **Rebase & merge** for a linear history without a merge commit (also clean, but less obvious which commit came from which PR).

**Tip:** If you need to revert a PR later, squash merges make that straightforward with a single revert.

---

# Solo developer variant (still worth it)

Even when you’re solo:

1. Work on a feature branch.
2. Push + open a PR (self-review).
3. Let CI run; use the PR description as release notes.
4. Squash-merge; delete branch.

This gives you guardrails and readable history.

---

# Handy commands (npm flavor)

**Start a feature branch**

```bash
git checkout main && git pull --rebase origin main
git switch -c feat/registry-mappers-docs
```

**Before pushing**

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

**Publish / PR**

```bash
git push -u origin HEAD
# open PR on GitHub
```

**After merge**

```bash
git checkout main
git pull --rebase origin main
git branch -d feat/registry-mappers-docs
```

**If your local branch diverges**

```bash
git fetch origin
git rebase origin/main
# fix conflicts → git add -A → git rebase --continue
```

---

# Common pitfalls (and fixes)

* **Pushing straight to `main`**: disable by branch protection; always use PRs.
* **Long-lived branches**: keep them short; rebase often to reduce conflicts.
* **“Non-fast-forward” push errors**: your branch is behind; run `git fetch` + `git rebase @{u}`.
* **Messy history**: use squash merges; avoid merging `main` into your branch repeatedly.

---

## TL;DR

* `main` is your **protected, release-ready source of truth**.
* Do all work on **feature branches**.
* Open **PRs** to merge; use **squash**; keep CI green.
* Prefer **branches** (not forks) for your repo; forks are for external contributors.
