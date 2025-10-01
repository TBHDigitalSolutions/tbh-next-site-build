---
title: "Git & GitHub Glossary"
domain: "docs"
file: "git-glossary_Reference_2025-10-01.md"
main: "git-glossary"
qualifier: "Reference"
date: "2025-10-01"
time: "4:22pm"
status: "Draft"
owners: ["@conorhovis1"]
tags: ["git", "github", "glossary", "beginners", "docs", "reference"]
spotlight:
  - "Plain-language Git & GitHub glossary for new developers"
  - "Defines key terms like repo, branch, commit, push, pull, and upstream"
  - "Explains origin vs remote and HTTPS vs SSH URLs"
  - "Includes examples of commands for staging, committing, and pushing"
  - "Useful as a quick-start or study reference for students"
summary: "A beginner-friendly Git & GitHub glossary written in plain language for new developers and students. Covers core concepts like local vs remote repos, branches, commits, staging, upstreams, tags, and remotes. Provides command examples for daily Git operations and explains common pitfalls like push variants."
links:
  related:
    - "[Git Docs Index](./git-docs_Index_2025-10-01.md)"
    - "[Git Daily Workflow Guide](./git-workflow_Guide_2025-10-01.md)"
    - "[Git Workflow Cheat Sheet](./git-workflow_CheatSheet_2025-10-01.md)"
    - "[Branch Workflow](./git-branch-workflow_Workflow_2025-10-01.md)"
    - "[Branch Best Practices](./git-branch-workflow_BestPractices_2025-10-01.md)"
    - "[Git Health Tool](./git-health_Tool_2025-10-01.md)"
---

Here’s a simple **Git & GitHub Glossary** you can keep as a reference or drop into your repo docs. I wrote it in plain language—something a 15-year-old new developer could read and immediately get the idea.

---

# Git & GitHub Glossary

**Local repo**: your personal copy of the project on your computer.
**Remote repo**: the shared copy of the project on GitHub. The default one is nicknamed `origin`.
**Clone**: when you copy a repo from GitHub down to your computer.
**Init**: when you create a brand-new repo on your computer.

**Branch**: a separate line of work in your project (like a different “timeline”). `main` is usually the main timeline.
**Checkout / Switch**: move to another branch.
**HEAD**: Git’s name for “where you are right now” (the commit your files are showing).

**Commit**: a snapshot of your changes with a message.
**Stage (git add)**: select which files/changes to include in your next commit.
**Stash**: temporarily save changes away without committing, so you can come back later.
**Restore**: throw away changes and reset files back to how they were at the last commit.

**Push**: upload your commits from your laptop to the GitHub remote.
**Pull**: bring commits from GitHub down to your local repo and combine them with your work.
**Fetch**: check if the remote has new commits without applying them yet.
**Merge**: combine changes from one branch into another.
**Rebase**: replay your commits on top of the latest version of another branch (makes history cleaner).

**Upstream**: the “remote branch” your local branch is linked to. For example, your `main` branch is usually tied to `origin/main`. That way, `git push` and `git pull` know where to go.

**Origin**: the default remote name that points to GitHub.

* It’s not your computer—it’s the GitHub repo you cloned from or connected to.
* Think of “origin” as “the project’s home on GitHub.”

**Remote**: any repo that lives somewhere else (usually GitHub). You can have more than one, but `origin` is the common default.

**URL formats** (how Git knows where the remote lives):

* **HTTPS**: `https://github.com/YourOrg/YourRepo.git` (you’ll log in with username + token).
* **SSH**: `git@github.com:YourOrg/YourRepo.git` (you’ll log in with SSH keys).

**Tags**: labels on specific commits (e.g., `v1.0`). Often used for releases.

* Push a tag: `git push origin v1.0`
* Push all tags: `git push --tags`

**Project root**: the top folder of your repo. From VS Code terminal, you can confirm:

```bash
git rev-parse --show-toplevel
```

**Status**: shows what’s changed, staged, or untracked.

```bash
git status -sb
```

**Add**: stage changes for a commit.

```bash
git add -A
```

**Commit**: take a snapshot of staged changes.

```bash
git commit -m "short message"
```

**Push to remote**:

* `git push` → push to your branch’s upstream (if set).
* `git push origin main` → push local `main` to GitHub’s `origin/main`.
* `git push main` → almost always wrong. Git thinks `main` is a remote name (not a branch), so it usually errors out.

**Undo changes**:

```bash
git restore .   # throws away local edits
```

**Stash changes**:

```bash
git stash push -m "wip: my changes"
git stash pop   # bring them back
```

---

✅ **Remember**:

* First push on a branch → `git push -u origin <branch>` (sets upstream).
* After that → just `git push`.
* `origin` = GitHub.
* Local repo = your laptop copy.
* Upstream = the link between your branch and its GitHub twin.

---

Do you want me to turn this into a **markdown file (`docs/git-glossary.md`)** so you can drop it straight into your repo alongside the workflow and health docs?
