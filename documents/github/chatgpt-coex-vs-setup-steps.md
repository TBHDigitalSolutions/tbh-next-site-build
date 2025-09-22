Awesome — here’s a clean, step-by-step setup that matches **your npm workflow** and gets ChatGPT/Codex/VS Code working together on your repo **without touching `main`**.

---

# 1) Prereqs (local)

```bash
# Node + npm (pick one LTS and stick to it)
# If you use nvm:
nvm install 20
nvm use 20
node -v
npm -v

# In your repo
cd tbh-next-site-build
git checkout feat/packages-refactor   # your long-lived integration branch
```

> Tip: keep `.env.local` (not committed) and ensure `/src/data/packages/__generated__/` stays in `.gitignore`.

---

# 2) Connect **ChatGPT (web)** to your GitHub repo (for code-aware chats)

1. Open ChatGPT → **Settings → Connected apps → Connectors → GitHub → Connect**.
2. Approve the GitHub install (GitHub App) and **select only this repo** (`TBHDigitalSolutions/tbh-next-site-build`).
3. Back in ChatGPT, confirm GitHub shows as connected.
4. In a chat, mention the repo by name (or pick it from the source selector) when you paste your “Codex Execution Brief” so it can read files as context. ([OpenAI Help Center][1])

**Notes**

* New/private repos can take a few minutes to appear; the Help Center explains why and how to reconfigure access or reindex. ([OpenAI Help Center][1])
* If you prefer not to use the GitHub App, you can instead work via the **VS Code extension** below and let it push PRs.

---

# 3) Set up **Codex in VS Code** (recommended for big refactors)

## 3.1 Install the extension

* In VS Code → **Extensions** → search **“OpenAI Codex”** (official) → Install.
* Sign in with your ChatGPT account when prompted (Plus/Pro/Team/Enterprise all work). You can also use an API key, but account sign-in is simpler. ([OpenAI Developers][2])

## 3.2 Pick a safe approval mode

* Start in **Agent (approval)** *or* **Chat** mode so Codex **asks before editing or running commands**.
* Avoid “Full Access” until you’re comfortable. You can toggle modes in the extension UI. ([OpenAI Developers][2])

## 3.3 Open your workspace and set the working branch

```bash
# make sure you're on the integration branch locally
git checkout feat/packages-refactor
git pull --ff-only
code .
```

In the Codex side panel, tell it explicitly:

> *“Work only on branch `feat/packages-refactor`. Never commit to `main`. Ask before running shell commands.”*

## 3.4 Let Codex run tasks locally (with approval)

* When Codex proposes edits/commands, **approve** the ones you want.
* Keep VS Code’s terminal open to run/check scripts yourself with **npm** (see §5).

> You can also delegate long jobs to **Codex Cloud** from the extension and review diffs before applying them locally. ([OpenAI Developers][2])

---

# 4) (Alternative) Use a **fine-grained GitHub PAT** instead of the App

Only if you *don’t* want to install the GitHub App:

1. GitHub → **Settings → Developer settings → Fine-grained personal access tokens** → **Generate**.
2. **Repository access**: Only `TBHDigitalSolutions/tbh-next-site-build`.
3. **Permissions** (minimum):

   * *Contents*: **Read/Write**
   * *Pull requests*: **Read/Write**
   * *Workflows*: **Read/Write** (only if the assistant will edit CI)
4. In the **Codex VS Code extension settings**, paste the token where it asks for the **OpenAI/API key or Git credentials** (the extension guides you; never commit the token). ([OpenAI Developers][2])

> If you’re using **ChatGPT (web) connectors**, prefer the **GitHub App** method from §2. ([OpenAI Help Center][1])

---

# 5) Use **npm** (not pnpm) for all commands

Create/confirm scripts in `package.json` (names from our plan; adjust if needed):

```json
{
  "scripts": {
    "packages:validate": "tsx scripts/packages/validate-packages.ts",
    "packages:build": "tsx scripts/packages/build.ts",
    "packages:doctor": "tsx scripts/packages/doctor.ts",
    "data:ci": "npm run packages:validate && npm run packages:build && npm run packages:doctor",
    "lint": "eslint .",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "build": "next build",
    "dev": "next dev"
  }
}
```

Run locally:

```bash
npm ci           # or: npm install
npm run data:ci  # validates + builds generated artifacts
npm run build
npm run dev
```

When Codex proposes commands, prefer **npm run …** versions so it stays consistent with your setup.

---

# 6) Tell Codex exactly how to work (first prompt inside VS Code)

Paste this as your first message in the Codex panel (edit paths if needed):

> **Operating rules**
>
> * Work only on branch `feat/packages-refactor`.
> * Create sub-branches for focused slices (e.g., `feat/packages-build-scripts`).
> * Never commit to `main`.
> * Ask before running shell commands. Use **npm** only.
> * Do not commit `/src/data/packages/__generated__/` or `.env.local`.
> * Pages are thin controllers; templates render; no runtime MD/MDX parsing.
> * All data comes via `@/data/packages` façade.
>
> **Tasks**
>
> 1. Implement `scripts/packages/*` (normalize, collect, compile MDX, attach content, build search, validate, doctor, build orchestrator).
> 2. Create façade at `src/data/packages/index.ts` that reads `__generated__` artifacts.
> 3. Authoring: add `src/content/packages/**` MDX with `slug` frontmatter.
> 4. Hub: refactor `/app/packages/page.tsx` to use `PackagesHubTemplate` and `getPackagesSearchIndex()`.
> 5. Detail: implement `/app/packages/[bundles]/page.tsx` using `PackagesDetailTemplate` and compiled `bundle.content.html`.
> 6. Add npm scripts from §5; ensure `npm run data:ci` passes.
> 7. Open a PR into `feat/packages-refactor` with a clear description & checklist.

---

# 7) Open PRs from **sub-branches** (your day-to-day loop)

```bash
# start a slice
git checkout feat/packages-refactor
git pull --ff-only
git checkout -b feat/packages-build-scripts

# (let Codex do edits, or make your own)
npm run data:ci
npm run build

git add -A
git commit -m "feat(packages): add build pipeline scripts and façade"
git push -u origin feat/packages-build-scripts

# create PR → base is the integration branch
gh pr create --base feat/packages-refactor --head feat/packages-build-scripts \
  --title "feat(packages): build pipeline" \
  --body "Implements scripts/packages/*, façade, and generated artifacts."
```

Merge when green. Then periodically raise an **integration → main** PR from `feat/packages-refactor`.

---

# 8) (Optional) Minimal **GitHub Actions** CI (npm)

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
    branches: [ main, feat/packages-refactor ]
  push:
    branches: [ feat/packages-refactor ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run data:ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
```

Now your “Require passing CI” rule (when available) can point at this workflow’s check name.

---

## Quick FAQ

* **Do I need all three (ChatGPT web + Codex VS Code + terminal)?**
  No. You can do everything in **Codex VS Code**. I recommend keeping **ChatGPT web + GitHub connector** open for planning and repo-aware Q\&A (it can read your code without pulling locally). ([OpenAI Help Center][1])

* **What model/version should I pick?**
  In Codex/ChatGPT, choose the **newest “code” model** available to you (often the default inside Codex). If the UI lists numbered versions, use the highest. ([OpenAI Developers][2])

* **How do I keep changes safe?**
  Keep Codex in **Agent (approval)** or **Chat** mode, stay on **feature branches**, and require PR review/CI before merge. ([OpenAI Developers][2])

---

If you’d like, I can generate a tiny **checklist.md** you can paste into your repo and a prefilled **PR template** tailored to the packages refactor.

[1]: https://help.openai.com/en/articles/11145903-connecting-github-to-chatgpt-drease?utm_source=chatgpt.com "Connecting GitHub to ChatGPT | OpenAI Help Center"
[2]: https://developers.openai.com/codex/ide?utm_source=chatgpt.com "Codex IDE extension"

---
---

You’re super close. A few things went sideways:

* you cd’ed into a folder that didn’t exist (because you were already inside the repo),
* you tried to checkout the branch **from a different folder** (`packages/` wasn’t a git repo),
* you pasted your **prompt** text into the terminal (zsh tried to run it 😅),
* VS Code’s `code` CLI threw a macOS codesigning error.

Here’s a clear, copy-paste guide to get you set up in **VS Code + ChatGPT/Codex**, using **npm**, and on the correct branch.

---

# 0) Golden rules for your terminal

* Only paste the lines **inside code blocks** below.
* Don’t paste your shell prompt (`conorhovis@MacBookPro … %`)—that’s not a command.
* If a command fails, run `pwd` and `git rev-parse --show-toplevel` to confirm you’re in the repo root.

---

# 1) Jump to the repo root (sanity check)

```bash
# show current folder
pwd

# if you are NOT in .../tbh-next-site-build, cd there now:
cd ~/path/to/tbh-next-site-build

# verify this is the git repo root
git rev-parse --show-toplevel

# see remotes and branches
git remote -v
git fetch --all --prune
git branch -a
```

You should see `origin/feat/packages-refactor` in the branch list.

Create a **local** branch that tracks it (only if you don’t have it locally yet):

```bash
git switch -c feat/packages-refactor --track origin/feat/packages-refactor
# or if it already exists locally:
git switch feat/packages-refactor

git pull --ff-only
```

---

# 2) Fix VS Code launch (workaround for the `code` CLI error)

Your mac threw `SecCodeCheckValidity … -67062`. Use `open -a` (bypasses the CLI binary), then install the `code` command from inside VS Code.

```bash
# from the repo root
open -a "Visual Studio Code" .
```

Then in VS Code:

1. Command Palette (⇧⌘P) → **Shell Command: Install ‘code’ command in PATH** (so `code .` works later).
2. If `open -a` ever fails, fully quit VS Code, re-open it from Applications, then `File → Open…` the repo folder.

---

# 3) Install the ChatGPT/Codex VS Code extension & sign in

Inside VS Code:

1. Extensions (⇧⌘X) → search **OpenAI / ChatGPT / Codex** (official extension). Install.
2. Sign in (use your ChatGPT account).
3. In the extension settings, pick a **safe mode**: *Chat* or *Agent (approval)* (so it **asks before editing files or running commands**).

**Tell it this:**

> Work only on branch `feat/packages-refactor`. Never commit to `main`. Ask before running shell commands. Use **npm**.

---

# 4) Connect ChatGPT (web) to your GitHub repo (optional but nice)

In ChatGPT (browser) → Settings → **Connected apps / GitHub** → connect and grant access to **only** `TBHDigitalSolutions/tbh-next-site-build`.
This lets it read code context while you chat, but all edits will still happen in VS Code.

---

# 5) NPM environment (you’re on Node 20 already ✅)

From the repo root:

```bash
node -v
npm -v

# install deps
npm ci  # or: npm install

# run our data/build checks (npm-only)
npm run data:ci
npm run build
npm run dev
```

> If a script is missing, we’ll add it later—just continue.

---

# 6) Give Codex the “working rules” and task brief (inside VS Code)

Open the Codex/Chat panel and paste this:

> **Operating rules**
> • Work only on `feat/packages-refactor`.
> • Create sub-branches per slice (e.g., `feat/packages-build-scripts`).
> • Never commit to `main`.
> • Ask before running shell commands. Use **npm** only.
> • Don’t commit `/src/data/packages/__generated__/` or `.env.local`.
> • Pages are thin controllers; templates render; **no runtime MD/MDX parsing**.
> • All data via `@/data/packages` façade.
>
> **Tasks**
>
> 1. Implement `scripts/packages/*` (normalize, collect, compile MDX, attach content, build search, validate, doctor, orchestrate).
> 2. Create façade `src/data/packages/index.ts` that reads `__generated__`.
> 3. Authoring: add `src/content/packages/**` MDX with `slug` frontmatter.
> 4. Hub: refactor `/app/packages/page.tsx` to use `PackagesHubTemplate` + `getPackagesSearchIndex()`.
> 5. Detail: implement `/app/packages/[bundles]/page.tsx` using `PackagesDetailTemplate` and compiled `bundle.content.html`.
> 6. Add npm scripts; ensure `npm run data:ci` passes.
> 7. Open a PR into `feat/packages-refactor` with a clear description & checklist.

When it proposes edits/commands, **approve** them one-by-one so nothing hits `main`.

---

# 7) Day-to-day branch flow (command snippets)

```bash
# always start from the integration branch
git switch feat/packages-refactor
git pull --ff-only

# create a focused slice
git switch -c feat/packages-build-scripts

# (let Codex edit files)
npm run data:ci
npm run build

git add -A
git commit -m "feat(packages): add build pipeline scripts and façade"
git push -u origin feat/packages-build-scripts

# PR into integration branch
gh pr create --base feat/packages-refactor --head feat/packages-build-scripts \
  --title "feat(packages): build pipeline" \
  --body "Implements scripts/packages/*, façade, and generated artifacts."
```

Later, merge several slices into `feat/packages-refactor`, then raise **one** integration PR → `main`.

---

# 8) Quick fixes for the mistakes you saw

* **“cd: no such file or directory: tbh-next-site-build”**
  You were already inside the repo; don’t `cd` again. Use `pwd` first.

* **“error: pathspec 'feat/packages-refactor' did not match…”**
  You ran `git` in a different folder (`packages/`) that’s not a repo. `cd` back to the repo root, then `git switch feat/packages-refactor`.

* **“zsh: command not found: conorhovis\@MacBookPro”**
  You pasted your shell prompt as if it were a command. Only paste **inside** code blocks.

* **VS Code `SecCodeCheckValidity -67062`**
  Use `open -a "Visual Studio Code" .` from the repo. Then Command Palette → **Shell Command: Install ‘code’ command in PATH**.

---

# 9) Optional: keep `main` safe locally (soft protection)

You already added the pre-push hook earlier; here it is again in case you need to re-add:

```bash
cat > .git/hooks/pre-push <<'SH'
#!/usr/bin/env bash
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

---

If anything still feels off, paste the output of these two commands and I’ll pinpoint it:

```bash
pwd
git rev-parse --show-toplevel
```
