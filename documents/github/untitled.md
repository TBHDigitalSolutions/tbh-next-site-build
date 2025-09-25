You’ve got duplicate upstream config for `main`. Fix it by clearing the duplicates and setting a single upstream, then push.

### 1) Inspect what’s duplicated (optional but helpful)

```bash
git remote -v
git config --show-origin --get-all branch.main.remote
git config --show-origin --get-all branch.main.merge
```

### 2) Remove the duplicates

```bash
# in this repo (not --global)
git config --unset-all branch.main.remote
git config --unset-all branch.main.merge
```

### 3) Reattach `main` to a single upstream

```bash
# clear any lingering upstream setting (safe even if none)
git branch --unset-upstream 2>/dev/null || true

# set the one true upstream
git branch --set-upstream-to=origin/main main
# or equivalently on next push:
# git push --set-upstream origin main
```

### 4) Push your pending commit

```bash
git push
# (or if you used the second option above)
# git push --set-upstream origin main
```

### If it ever happens again

It usually comes from multiple `branch.main.*` entries in `.git/config` (e.g., after renames or running `git push -u` to different remotes). You can also edit `.git/config` directly—remove extra `branch "main"` blocks or duplicate `remote`/`merge` lines—then set the upstream as in step 3.
