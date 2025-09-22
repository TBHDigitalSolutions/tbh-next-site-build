Got you. Here are the exact commands you’ll use from Terminal on macOS.

# Quick: commit & push to existing remote

```bash
# See what changed
git status

# Stage everything (adds, edits, deletes)
git add -A

# Commit with a message
git commit -m "Your clear commit message"

# Push to the current branch’s upstream (or set it on first push)
git push
```

If your branch has no upstream yet:

```bash
git push -u origin $(git branch --show-current)
```

# First-time setup (if this folder isn’t a repo yet)

```bash
git init
git add -A
git commit -m "Initial commit"

# Replace with your repo URL
git remote add origin https://github.com/<you>/<repo>.git

# Make sure you’re on main (or keep whatever branch you use)
git branch -M main

# First push
git push -u origin main
```

# Create a new feature branch and push

```bash
git checkout -b feat/about-page-refactor
git add -A
git commit -m "Refactor About page to page-level data"
git push -u origin feat/about-page-refactor
```

# Keep secrets & junk out of Git

Make sure these are ignored (create/update `.gitignore` in your project root):

```bash
# Essentials
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore
echo "node_modules/" >> .gitignore
echo ".next/" >> .gitignore
echo "coverage/" >> .gitignore
echo "dist/" >> .gitignore
```

# Common fixes

* **Auth prompts / 2FA**: If using HTTPS and you have 2FA on GitHub, use a **Personal Access Token** as the password.
* **Branch has diverged**:

  ```bash
  git pull --rebase origin $(git branch --show-current)
  # resolve conflicts if any, then:
  git push
  ```
* **Change remote URL (SSH instead of HTTPS)**:

  ```bash
  git remote set-url origin git@github.com:<you>/<repo>.git
  ```

That’s it. Replace the repo URL/branch names as needed and you’re good to push.
