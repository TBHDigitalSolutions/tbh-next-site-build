---
title: "git-health Script & Usage Guide"
domain: "docs"
file: "git-health_Tool_2025-10-01.md"
main: "git-health"
qualifier: "Tool"
date: "2025-10-01"
time: "4:10"
status: "Draft"
owners: ["@conorhovis1"]
tags: ["git", "github", "devtools", "script", "workflow", "cli"]
spotlight:
  - "One-command snapshot of repo, branch, upstream, and remote sync"
  - "Shows ahead/behind counts and clean vs dirty working state"
  - "Verifies remote connectivity and prints last-commit metadata"
  - "Provides npm alias and step-by-step run instructions"
  - "Recommended before pushes, after rebases/merges, and when switching projects"
summary: "A ready-to-use Bash script and companion guide that report your current Git state—repo path, branch, upstream, remote URL, ahead/behind counts, working tree cleanliness, last commit info, and remote connectivity—so you can push with confidence. Includes setup, npm script alias, usage examples, output interpretation, and troubleshooting tips."
links:
  related:
    - "[Git Docs Index](./git-docs_Index_2025-10-01.md)"
    - "[Git Daily Workflow Guide](./git-workflow_Guide_2025-10-01.md)"
    - "[Git Workflow Cheat Sheet](./git-workflow_CheatSheet_2025-10-01.md)"
    - "[Git Glossary](./git-glossary_Reference_2025-10-01.md)"

---

# `scripts/git-health.sh` and usage guide

Below are (1) a ready-to-drop-in shell script and (2) a short doc you can commit to your repo.

---

## 1) File: `scripts/git-health.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# git-health.sh — quick snapshot of repo/branch/upstream/remote sync
# Usage: ./scripts/git-health.sh

# 0) Ensure git is available
if ! command -v git >/dev/null 2>&1; then
  echo "Error: git not found in PATH" >&2
  exit 1
fi

# 1) Ensure we are inside a git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: not inside a Git repository" >&2
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
branch="$(git branch --show-current 2>/dev/null || echo '(detached)')"

# Upstream info (remote + merge ref)
remote_default="$(git config --get "branch.${branch}.remote" 2>/dev/null || echo '(none)')"
merge_ref="$(git config --get "branch.${branch}.merge" 2>/dev/null || echo '(none)')"
if [[ "$remote_default" != "(none)" && "$merge_ref" != "(none)" ]]; then
  upstream="${remote_default}/$(basename "$merge_ref")"
else
  upstream="(not set)"
fi

remote_url="$(git config --get "remote.${remote_default}.url" 2>/dev/null || echo '(no remote url)')"

# Sync ahead/behind counts (fetch quietly first if upstream exists)
ahead=0; behind=0
if [[ "$upstream" != "(not set)" ]]; then
  git fetch -q "$remote_default" >/dev/null 2>&1 || true
  # left=behind, right=ahead relative to upstream...HEAD
  counts="$(git rev-list --left-right --count "${upstream}...HEAD" 2>/dev/null || echo '0 0')"
  behind="$(awk '{print $1}' <<<"$counts")"
  ahead="$(awk '{print $2}' <<<"$counts")"
fi

# Dirty state (working tree or index)
state="clean"
if ! git diff --quiet || ! git diff --cached --quiet; then
  state="dirty"
fi

current_commit="$(git rev-parse --short HEAD 2>/dev/null || echo '-')"
last_commit_meta="$(git show -s --format="%h %ad %an: %s" --date=short HEAD 2>/dev/null || echo '-')"

# Connectivity test to remote
if [[ "$remote_default" != "(none)" ]]; then
  if git ls-remote -h "$remote_default" >/dev/null 2>&1; then
    connect_msg="OK"
  else
    connect_msg="FAILED"
  fi
else
  connect_msg="(no remote)"
fi

# Compact status line
status_short="$(git status -sb 2>/dev/null || echo '')"

printf "Repo:        %s\n" "$repo_root"
printf "Branch:      %s\n" "$branch"
printf "Upstream:    %s\n" "$upstream"
printf "Remote:      %s\n" "$remote_default"
printf "Remote URL:  %s\n" "$remote_url"
printf "Sync:        ahead %s / behind %s\n" "$ahead" "$behind"
printf "State:       %s\n" "$state"
printf "Last commit: %s\n" "$last_commit_meta"
printf "Connectivity to remote: %s\n" "$connect_msg"

echo
echo "$status_short"
```

**Make it executable:**

```bash
chmod +x scripts/git-health.sh
```

Optionally add an npm script alias (since you’re using **npm**):

```json
// package.json
{
  "scripts": {
    "git:health": "bash scripts/git-health.sh"
  }
}
```

Run it:

```bash
npm run git:health
# or
./scripts/git-health.sh
```

---

## 2) File: `docs/git-health.md`

```md
# git-health: purpose & how to use

**Purpose**: give you a fast, reliable snapshot of your current Git state so you can push with confidence.

It answers:
- Which repo directory am I in?
- Which branch am I on?
- Is my branch linked to a remote (upstream)? Which one?
- What’s the remote URL (GitHub repo) I’m pushing to?
- Am I **ahead/behind** the remote branch?
- Is my working tree **clean** or **dirty**?
- What was the **last commit** (hash/date/author/subject)?
- Can I **reach** the remote (auth/network) right now?

## When to use it
- Before any **push** (especially from `main`).
- After a **rebase** or **merge** to confirm you’re aligned.
- When Git says **non-fast-forward** or you suspect you’re behind.
- After switching projects in VS Code to confirm the remote URL and branch.

## How to run
```bash
npm run git:health
# or
./scripts/git-health.sh
```

## Interpreting output (example)
```
Repo:        /Users/you/dev/tbh-next-site-build
Branch:      main
Upstream:    origin/main
Remote:      origin
Remote URL:  git@github.com:TBHDigitalSolutions/tbh-next-site-build.git
Sync:        ahead 0 / behind 0
State:       clean
Last commit: e3ac8b3 2025-10-01 You Name: feat(packages): polish PackageDetailOverview + UI
Connectivity to remote: OK

## main...origin/main [up to date]
```

**Cheat sheet**
- `Upstream: (not set)` → First push: `git push -u origin $(git branch --show-current)`
- `behind > 0` → Update first: `git fetch origin && git rebase @{u}`
- `state: dirty` → Commit or stash before rebasing/pulling
- `Connectivity: FAILED` → Check Wi‑Fi/VPN/SSH key or use a PAT for HTTPS

## Troubleshooting
- **No upstream set**: Set it once (see above). Then `git push` is enough next time.
- **Non-fast-forward on push**: `git fetch origin && git rebase @{u}` → resolve → `git push`.
- **Wrong remote**: `git remote -v` then `git remote set-url origin <correct-url>`.
- **Detached HEAD**: create/checkout a branch: `git switch -c feature/my-branch`.
```

---

## Commit both files

```bash
git add scripts/git-health.sh docs/git-health.md
git commit -m "chore(devtools): add git-health script and usage doc"
git push
```

That’s it—now you have a one-command health check you can run anytime before pushing.

---

Dropped a complete **`scripts/git-health.sh`** plus a **`docs/git-health.md`** usage guide into the canvas.

To add them to your repo:

```bash
# create files as shown in the canvas, then:
chmod +x scripts/git-health.sh
git add scripts/git-health.sh docs/git-health.md
git commit -m "chore(devtools): add git-health script and usage doc"
git push
```

Optional npm alias (since you’re on npm):

```json
// package.json
{
  "scripts": {
    "git:health": "bash scripts/git-health.sh"
  }
}
```

Run it anytime before pushing:

```bash
npm run git:health
# or
./scripts/git-health.sh
```

Want me to wire a tiny pre-push hook that runs `git-health` and blocks pushes when you’re behind or dirty (with an override flag)?
