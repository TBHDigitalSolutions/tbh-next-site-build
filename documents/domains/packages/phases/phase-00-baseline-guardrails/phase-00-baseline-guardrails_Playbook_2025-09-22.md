## 3) `phase-00-baseline-guardrails_Playbook_2025-09-22.md`

```md
**Official Title:** Phase 00 — Baseline Guardrails & Repo Hygiene (Playbook)  
**Domain:** packages  
**File Name:** phase-00-baseline-guardrails_Playbook_2025-09-22.md  
**Main Part:** phase-00-baseline-guardrails  
**Qualifier:** Playbook  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Exact edits to land repo guardrails (Node/npm, tsconfig, ESLint, Husky, CI, PR template, docs).  
- Merge with existing files where present; do not clobber custom settings.  
- This phase addresses earlier build issues (ESM/CJS, route collisions policy via docs, import boundaries).

**Summary:**  
Step-by-step instructions and ready-to-paste snippets to implement Phase 00. Follow in order; commit in small chunks.

---

## 0) Branch & baseline
```bash
git switch feat/packages-refactor
git pull --ff-only
git switch -c chore/phase-00-guardrails
Awesome—here are **production-ready docs** for **Phase 00 — Baseline Guardrails & Repo Hygiene**.
They’re drop-in files for:

```

documents/domains/packages/phases/phase-00-baseline-guardrails/
├─ _generated/index.json
├─ README.md
├─ phase-00-baseline-guardrails_Checklist_2025-09-22.md
└─ phase-00-baseline-guardrails_Playbook_2025-09-22.md

```

> Copy each file’s content exactly as shown. Where something already exists in your repo, **merge** rather than overwrite.

---

## 1) `README.md`

```md
**Official Title:** Phase 00 — Baseline Guardrails & Repo Hygiene  
**Domain:** packages  
**File Name:** phase-00-baseline-guardrails_Readme_2025-09-22.md  
**Main Part:** phase-00-baseline-guardrails  
**Qualifier:** Guide  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Foundation for safe iteration: routing clarity, lint rails, CI skeleton, PR hygiene.  
- Applies repo-wide; later phases assume these guardrails exist.  
- npm + Node 20 LTS; never commit directly to `main`.

**Summary:**  
This folder holds the **short checklist** (pinnable “working rules”) and the **long playbook** (deep, step-by-step) for Phase 00. Complete this phase before implementing any other Packages Domain work. The checklist is what Codex/VS Code agents should pin; the playbook is what senior devs follow for exact edits (ESLint rails, tsconfig, Husky, CI, PR template, docs).
```

---

## 2) `phase-00-baseline-guardrails_Checklist_2025-09-22.md`

````md
**Official Title:** Phase 00 — Baseline Guardrails & Repo Hygiene (Checklist)  
**Domain:** packages  
**File Name:** phase-00-baseline-guardrails_Checklist_2025-09-22.md  
**Main Part:** phase-00-baseline-guardrails  
**Qualifier:** Checklist  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Pin these rules for Codex/VS Code.  
- Keep the repo safe: **no runtime MD/MDX**, **no deep data imports in components**, CI green.

**Summary:**  
Operational, tight list to land Phase 00 safely. Use **npm** with Node 20 LTS. Work only on branches off `feat/packages-refactor`.

---

## Working rules (pin these)
- Work only on `feat/packages-refactor` (never `main`).
- Use **npm** only. Node **20 LTS** (`.nvmrc` = `20`).
- **No runtime MD/MDX**; compile at build.  
- Pages thin; templates present; components are presentational only (no IO).  
- Data goes through `@/data/packages` façade; no `@/data/**` inside `src/components/**`.  
- Don’t commit `src/data/packages/__generated__/` or `.env.local`.

## Do this (check each)
- [ ] Add `.nvmrc` = `20` and `engines.node` in `package.json`.
- [ ] Ensure `tsconfig.json`: `baseUrl: "src"` (with alias `@/*`) + ESM settings.
- [ ] ESLint rails: forbid `@/data/**` imports inside `src/components/**`; allow in `app/**`.
- [ ] Add/verify npm scripts: `lint`, `typecheck`, `build`, `data:ci`.
- [ ] Git ignore generated data: `src/data/packages/__generated__/`.
- [ ] Husky pre-push: **block pushes to `main`**; run `npm run lint && npm run typecheck`.
- [ ] PR template: checks for build, typecheck, data:ci, screenshots (where relevant).
- [ ] CI workflow: Node 20 + npm; run `data:ci`, `lint`, `typecheck`, `build` on PRs.

## Acceptance (must all be true)
- [ ] `npm run lint` passes with guardrails enforced.  
- [ ] `npm run typecheck` passes.  
- [ ] `npm run build` (Next.js) completes with **no route collisions** or ESM/CJS errors.  
- [ ] CI green on PRs into `feat/packages-refactor`.  
- [ ] No `@/data/**` imports under `src/components/**` (lint rule catches it).  

## Commands (quick)
```bash
# baseline
node -v
npm -v

npm run lint
npm run typecheck
npm run data:ci
npm run build
````

````

---

## 3) `phase-00-baseline-guardrails_Playbook_2025-09-22.md`

```md
**Official Title:** Phase 00 — Baseline Guardrails & Repo Hygiene (Playbook)  
**Domain:** packages  
**File Name:** phase-00-baseline-guardrails_Playbook_2025-09-22.md  
**Main Part:** phase-00-baseline-guardrails  
**Qualifier:** Playbook  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Exact edits to land repo guardrails (Node/npm, tsconfig, ESLint, Husky, CI, PR template, docs).  
- Merge with existing files where present; do not clobber custom settings.  
- This phase addresses earlier build issues (ESM/CJS, route collisions policy via docs, import boundaries).

**Summary:**  
Step-by-step instructions and ready-to-paste snippets to implement Phase 00. Follow in order; commit in small chunks.

---

## 0) Branch & baseline
```bash
git switch feat/packages-refactor
git pull --ff-only
git switch -c chore/phase-00-guardrails
````

---

## 1) Node & npm standard (LTS, consistent)

**Files:**

* `.nvmrc`
* `package.json` (`engines`)

**Actions:**

1. Add `.nvmrc`:

```bash
printf "20\n" > .nvmrc
```

2. Add/verify engines in `package.json` (merge):

```jsonc
{
  "engines": { "node": ">=20 <21" }
}
```

---

## 2) TypeScript & module resolution (ESM + aliases)

**Files:**

* `tsconfig.json`

**Goal:** ESM defaults; clean aliases for `@/* → src/*`.

**Action:** Merge these keys into `tsconfig.json` (keep existing strictness):

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "baseUrl": "src",
    "paths": { "@/*": ["*"] },
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

> If your root already uses `baseUrl: "."` with `@/*` mapping, keep it; just ensure the alias **exists** and matches your import style.

---

## 3) ESLint guardrails (forbid deep data imports in components)

**Files:**

* `.eslintrc.cjs` (or `.eslintrc.js`)

**Goal:** Disallow `@/data/**` imports under `src/components/**`, allow under `app/**` and scripts.

**Action:** Add/merge this rule set (adjust if your config is JSON):

```js
// .eslintrc.cjs
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "next",
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    // general project rules here…
  },
  overrides: [
    // Block data imports inside presentational components
    {
      files: ["src/components/**/*.{ts,tsx}"],
      rules: {
        "import/no-restricted-paths": ["error", {
          zones: [
            { target: "./src/components", from: "./src/data" },
            { target: "./src/components", from: "@/data" }
          ]
        }]
      }
    },
    // Pages/layouts can import data facade
    {
      files: ["app/**/*.{ts,tsx}", "src/pages/**/*.{ts,tsx}"],
      rules: {
        // (no special blocks here)
      }
    }
  ]
};
```

> If you don’t have `eslint-plugin-import`:
> `npm i -D eslint-plugin-import`

Run:

```bash
npm run lint
```

---

## 4) Git ignore generated data & env

**Files:**

* `.gitignore`

**Action:** Ensure these lines exist (append if missing):

```
# Generated packages artifacts
/src/data/packages/__generated__/
/src/data/packages/__generated__/*.json

# Local env
.env.local
```

---

## 5) Husky pre-push guard (block main, run checks)

**Goal:** Local safety net since branch protection is limited.

**Install Husky:**

```bash
npm i -D husky
npm pkg set scripts.prepare="husky"
npm run prepare
```

**Create pre-push hook:**

```bash
npx husky add .husky/pre-push "bash scripts/git/pre-push.sh"
chmod +x scripts/git/pre-push.sh
```

**Add the script: `scripts/git/pre-push.sh`**

```bash
mkdir -p scripts/git
cat > scripts/git/pre-push.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail

# Block direct pushes to main
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" = "main" ]; then
  echo "❌ Direct pushes to main are blocked. Push a feature branch and open a PR."
  exit 1
fi

echo "🔎 Running pre-push checks (lint, typecheck)…"
npm run -s lint
npm run -s typecheck
echo "✅ Pre-push checks passed"
SH
```

> If you already have a manual `.git/hooks/pre-push`, Husky makes it portable across the team—prefer Husky.

---

## 6) NPM scripts (baseline)

**Files:**

* `package.json`

**Action:** Ensure these exist (merge; don’t remove your existing scripts):

```jsonc
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "build": "next build",
    "dev": "next dev",
    "start": "next start",
    "data:ci": "npm-run-all -p validate:packages check:packages:featured validate:packages:growth content:build doctor:packages"
  }
}
```

> Your repo already has `data:ci` and `tsx`-based package scripts—keep them. This step is just to guarantee a consistent baseline.

---

## 7) PR template (review guardrails)

**Files:**

* `.github/pull_request_template.md`

**Action:** Create/replace with:

```md
# PR: <concise title>

## Summary
- What & why

## Scope
- [ ] Phase 00 guardrails respected
- [ ] No `@/data/**` imports in `src/components/**`
- [ ] No runtime MD/MDX parsing

## Checks
- [ ] `npm run lint` ✅
- [ ] `npm run typecheck` ✅
- [ ] `npm run data:ci` ✅
- [ ] `npm run build` ✅

## Screenshots / Notes
```

---

## 8) CI workflow (PRs must be green)

**Files:**

* `.github/workflows/packages-ci.yml`

**Action:** Add:

```yaml
name: Packages CI

on:
  pull_request:
    branches: [ "feat/packages-refactor" ]
  push:
    branches: [ "feat/packages-refactor" ]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Data CI
        run: npm run data:ci

      - name: Build
        run: npm run build
```

---

## 9) Page responsibilities note (routing clarity)

**Files:**

* `documents/domains/packages/standards/page-responsibilities_Spec_2025-09-22.md`

**Action:** Create with:

```md
**Official Title:** Page/Template/Component Responsibilities (Packages Domain)  
**Domain:** packages  
**File Name:** page-responsibilities_Spec_2025-09-22.md  
**Main Part:** page-responsibilities  
**Qualifier:** Spec  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Avoids the “fat page” & “data in components” anti-patterns.  
- Source of truth for review comments and lint guardrails.

**Summary:**  
- **Pages (app/**): thin controllers; orchestrate data via façade; set metadata and pass props to templates.  
- **Templates (src/packages/templates/**): presentational compositors; **no IO** or deep imports; accept props only.  
- **Components (src/components/**): leaf presentational; **no IO**; no `@/data/**` imports.  
- **Data (src/data/**): typed SSOT + façade; generated artifacts in `__generated__` (gitignored).  
- **Content (src/content/**): MDX narratives for bundles; compiled at build.
```

> Link to this from Phase 04 Playbook later.

---

## 10) Verify & commit

```bash
npm run lint
npm run typecheck
npm run data:ci
npm run build

git add -A
git commit -m "chore(phase-00): repo guardrails (Node 20, tsconfig, ESLint boundaries, Husky, CI, PR template, page responsibilities spec)"
git push -u origin chore/phase-00-guardrails
```

Open PR into `feat/packages-refactor` and ensure CI is green.

---

## Acceptance (copy back to Checklist)

* `npm run lint` ✅
* `npm run typecheck` ✅
* `npm run build` ✅ (no collisions/ESM errors)
* CI green on PRs into `feat/packages-refactor`
* Lint blocks `@/data/**` inside `src/components/**`

````

---

## 4) `_generated/index.json`

> Seed file—your doc index script can refresh it later.

```json
{
  "phase": "00",
  "title": "Baseline Guardrails & Repo Hygiene",
  "files": [
    "README.md",
    "phase-00-baseline-guardrails_Checklist_2025-09-22.md",
    "phase-00-baseline-guardrails_Playbook_2025-09-22.md"
  ],
  "lastUpdated": "2025-09-22"
}
````

---

### That’s it

These four files give you a **complete, production-ready Phase 00**: pinned rules, deep playbook, a short README, and an index stub. Once merged into `feat/packages-refactor`, you can run the checklist and land the guardrails confidently.
