Gotcha—your errors make sense. You hit three separate issues:

1. **Clone failed** because the repo is private and you weren’t authenticated.
2. **Branch protection API** returned 403 because your account/plan doesn’t allow protection on this private repo.
3. **`zsh: bad pattern: #`** because zsh doesn’t treat `#` as a comment by default (so inline comments break).

Below is a **copy-paste, terminal-only** flow that fixes all three and gets you onto a safe workflow right now.

---

# A) Authenticate and clone the repo

### Option 1 (easiest): GitHub CLI (HTTPS with auth)

```bash
# from any folder you want the repo in
gh auth login
# choose: GitHub.com → HTTPS → "Y" to use your browser → authorize

gh repo clone TBHDigitalSolutions/tbh-next-site-build
cd tbh-next-site-build
git remote -v
```

### Option 2 (SSH): if you prefer SSH keys

```bash
# generate key (press Enter at prompts)
ssh-keygen -t ed25519 -C "conorhovis1@gmail.com"

# show the public key, copy it
cat ~/.ssh/id_ed25519.pub

# add the key at https://github.com/settings/keys (New SSH key), then test:
ssh -T git@github.com

# clone via SSH
git clone git@github.com:TBHDigitalSolutions/tbh-next-site-build.git
cd tbh-next-site-build
git remote -v
```

> If you previously ran `cd tbh-next-site-build` after a failed clone, you were still in some other repo (hence “Already on 'main'”). Make sure you **`cd` into the freshly cloned folder**.

---

# B) Make `main` “soft-protected” today (no paid features)

Since the API rejected real branch protection (403), use **local + workflow guardrails** now, and upgrade later if you want hard enforcement.

## B1) Create a **pre-push** hook that blocks pushes to `main`

```bash
cat > .git/hooks/pre-push <<'SH'
#!/usr/bin/env bash
# Block direct pushes to main (soft protection)
while read local_ref local_sha remote_ref remote_sha
do
  if [[ "$remote_ref" == "refs/heads/main" ]]; then
    echo "❌ Direct pushes to main are blocked. Push a branch and open a PR."
    exit 1
  fi
done
SH
chmod +x .git/hooks/pre-push
```

## B2) Make git refuse accidental pushes to the upstream default

```bash
git config --global push.default simple
```

(With the pre-push hook, accidental pushes to `main` will fail locally.)

---

# C) Create the long-lived integration branch

```bash
git checkout main
git pull --ff-only
git checkout -b feat/packages-refactor
git push -u origin feat/packages-refactor
```

---

# D) Day-to-day: work on sub-branches → PR into integration → PR into main

```bash
# start a feature slice
git checkout feat/packages-refactor
git pull --ff-only
git checkout -b feat/packages-build-pipeline

# work, then commit
git add -A
git commit -m "feat(packages): add build pipeline scripts and façade"
git push -u origin feat/packages-build-pipeline

# open PR into the integration branch
gh pr create --base feat/packages-refactor --head feat/packages-build-pipeline \
  --title "feat(packages): build pipeline" \
  --body "Implements scripts/packages/*, façade, and generated artifacts."
```

Merge that PR when green. Periodically raise an **integration → main** PR:

```bash
git checkout feat/packages-refactor
git pull --ff-only
gh pr create --base main --head feat/packages-refactor \
  --title "feat(packages): integration" \
  --body "Merge accumulated packages domain work into main."
```

---

# E) Fix your zsh “bad pattern: #” error

zsh doesn’t treat `#` as a comment in interactive shells unless you enable it. Either:

### Option 1: enable interactive comments (one-time)

```bash
setopt interactivecomments
```

(Optionally add that line to `~/.zshrc`.)

### Option 2: don’t put comments after commands

Instead of:

```bash
REQUIRED_CHECK="data:ci"   # change this to your actual check name
```

Do:

```bash
REQUIRED_CHECK="data:ci"
# change this to your actual check name
```

---

# F) (Later) Turn on **real** branch protection when available

If you upgrade or make the repo public, re-run these (no inline `#`):

```bash
OWNER=TBHDigitalSolutions
REPO=tbh-next-site-build
BRANCH=main

gh api -X PUT -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO/branches/$BRANCH/protection \
  --input - <<'JSON'
{
  "required_status_checks": null,
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": true,
  "required_conversation_resolution": true
}
JSON
```

Then (after you know the CI check name, e.g., `data:ci` or `build`):

```bash
REQUIRED_CHECK="data:ci"
gh api -X PUT -H "Accept: application/vnd.github+json" \
  /repos/$OWNER/$REPO/branches/$BRANCH/protection \
  --input - <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["$REQUIRED_CHECK"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_linear_history": true,
  "required_conversation_resolution": true
}
JSON
```

---

# G) Sanity checks

```bash
# verify you’re in the right repo/folder
pwd
git remote -v

# verify branches exist remotely
git fetch --all --prune
git branch -a

# push test commit to a feature branch (pre-push hook should NOT block)
echo "# scratch" > SCTRATCH.md
git add SCTRATCH.md
git commit -m "chore: scratch test"
git push

# try to push direct to main (should be blocked by the hook)
git checkout main
git pull --ff-only
git push  # should fail with our ❌ message
```

That’s it—you’re set up with a safe workflow today (soft protection) and a path to hard protection later.

---

nice — you’re all set. SSH auth works, repo is cloned, pre-push hook is installed, and the integration branch is live on origin. here are the **next terminal steps** to lock in the workflow and run it day-to-day.

---

## 1) sanity checks (optional but recommended)

```bash
# verify the pre-push hook blocks direct pushes to main
git checkout main
git pull --ff-only
git push   # ← should FAIL with the ❌ message from your hook

# go back to your integration branch
git checkout feat/packages-refactor
git pull --ff-only
```

---

## 2) create a feature slice branch → push → open PR into the integration branch

```bash
# branch off the integration branch for a focused slice of work
git checkout feat/packages-refactor
git pull --ff-only
git checkout -b feat/packages-build-pipeline
```

> make your changes (or let your assistant do them), then:

```bash
git add -A
git commit -m "feat(packages): add build pipeline scripts and façade"
git push -u origin feat/packages-build-pipeline

# open a PR targeting the integration branch
gh pr create \
  --base feat/packages-refactor \
  --head feat/packages-build-pipeline \
  --title "feat(packages): build pipeline" \
  --body "Implements scripts/packages/*, façade, and generated artifacts."
```

---

## 3) review & merge the feature PR

```bash
# see current PR status
gh pr status

# open the PR in your browser to review
gh pr view --web

# when green, merge (choose one style); this also deletes the remote branch
gh pr merge --squash --delete-branch
# or: gh pr merge --merge --delete-branch
```

---

## 4) periodically merge the integration branch into main (via PR)

```bash
# ensure you’re on the integration branch and up to date
git checkout feat/packages-refactor
git pull --ff-only

# open PR from integration → main
gh pr create \
  --base main \
  --head feat/packages-refactor \
  --title "feat(packages): integration" \
  --body "Merge accumulated packages domain work into main."

# merge when CI/review is green
gh pr merge --squash
```

---

## 5) handy commands you’ll use often

```bash
# list local & remote branches
git fetch --all --prune
git branch -a

# update your current branch safely
git pull --ff-only

# check remotes
git remote -v

# see PRs for this repo
gh pr status
```

that’s the whole flow:

* work happens on short-lived feature branches,
* PRs target **feat/packages-refactor**,
* then you PR **feat/packages-refactor → main** when ready,
* and your pre-push hook keeps main safe from accidental pushes.
