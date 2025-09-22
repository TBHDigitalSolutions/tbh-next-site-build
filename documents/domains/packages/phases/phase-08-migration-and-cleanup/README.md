Awesome—here are the **production-ready docs** for **Phase 08 — Migration & Cleanup**.
Drop these files into:

```
documents/domains/packages/phases/phase-08-migration-and-cleanup/
├─ _generated/index.json
├─ README.md
├─ phase-08-migration-and-cleanup_Checklist_2025-09-22.md
└─ phase-08-migration-and-cleanup_Playbook_2025-09-22.md
```

They follow your header standard, target `TBHDigitalSolutions/tbh-next-site-build`, assume **Node 20 + npm**, and work exclusively on `feat/packages-refactor`.

---

## 1) `README.md`

```md
**Official Title:** Phase 08 — Migration & Cleanup  
**Domain:** packages  
**File Name:** phase-08-migration-and-cleanup_Readme_2025-09-22.md  
**Main Part:** phase-08-migration-and-cleanup  
**Qualifier:** Guide  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Remove legacy code paths and enforce the façade-only reads.  
- Eliminate runtime MD/MDX usage and deep `@/data/**` imports in components.  
- Resolve route duplication and align the `[bundles]` (plural) segment.

**Summary:**  
This phase finishes the move to the new Packages domain architecture by deleting legacy files, ripping out runtime MD/MDX reads, enforcing façade-only access, and scrubbing route inconsistencies. When done, `next build` remains clean, there are no duplicate routes, templates are IO-free, and pages are thin controllers.
```

---

## 2) `phase-08-migration-and-cleanup_Checklist_2025-09-22.md`

````md
**Official Title:** Phase 08 — Migration & Cleanup (Checklist)  
**Domain:** packages  
**File Name:** phase-08-migration-and-cleanup_Checklist_2025-09-22.md  
**Main Part:** phase-08-migration-and-cleanup  
**Qualifier:** Checklist  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Work only on `feat/packages-refactor` (never `main`).  
- Use **npm** only. Do not commit `src/data/packages/__generated__/` or `.env.local`.

**Summary:**  
Actionable, verifiable steps to remove legacy code, prevent deep imports, kill runtime MD/MDX reads, and ensure routes are consistent.

---

## Working rules
- Pages are thin controllers; **templates do presentation only** (no IO).  
- **All data via `@/data/packages` façade**.  
- **No runtime MD/MDX parsing** (compiled at build only).  

## Preconditions
- [ ] Phase 01–04 landed (types+façade, MDX authoring, build pipeline, hub/detail pages & templates).  
- [ ] `npm run data:ci` passes on current branch.

## Do this (check each)
- [ ] **Purge runtime MD/MDX**: no `*.md|*.mdx` imports in runtime code (Components/Pages/Templates).  
- [ ] **Façade-only access**: remove any imports from `src/data/packages/**` in `src/components/**` (allow in `app/**` only).  
- [ ] **No `__generated__` outside façade**: ensure only `@/data/packages/index.ts` reads generated files.  
- [ ] **Routes**: no duplicates; `[bundles]` (plural) used consistently; remove any legacy package routes.  
- [ ] **Dead code**: remove unused package/bundle components & data readers (verify with `ts-prune`).  
- [ ] **Assets**: update any moved asset paths to new canonical `ASSETS` constants (if present).  
- [ ] **Docs**: update `documents/domains/packages/changelog.md` with a short “what changed / why” entry.

## Commands (run locally)
```bash
# detect runtime MD/MDX imports
git grep -nE "from ['\"][^'\"]+\\.(md|mdx)['\"]|require\\([^)]*\\.(md|mdx)\\)" -- \
  'src/**/*.{ts,tsx,js,jsx}' 'app/**/*.{ts,tsx}'

# detect deep data imports in components (should be 0)
git grep -n "from ['\"][@]/data/" -- 'src/components/**/*.{ts,tsx}'

# detect any direct reads of __generated__ outside the façade
git grep -n "__generated__" -- 'src/**/*.{ts,tsx}' 'app/**/*.{ts,tsx}' \
  | grep -v "src/data/packages/index.ts" || true

# scan routes for duplicates under app/packages
ls -1 app/packages || true
git grep -nE "export\\s+const\\s+dynamic|generateStaticParams|generateMetadata" -- 'app/packages/**/*.{ts,tsx}'

# optional: install & run ts-prune to find dead exports (TypeScript only)
npm i -D ts-prune
npx ts-prune | tee /tmp/ts-prune.txt
````

## Acceptance

* [ ] `git grep` shows **no** MD/MDX runtime imports in `app/**` or `src/components/**`.
* [ ] `git grep` shows **no** `@/data/**` imports in `src/components/**`.
* [ ] Only façade reads from `__generated__`.
* [ ] `/app/packages/[bundles]/` plural everywhere; no duplicate routes.
* [ ] `npm run data:ci && npm run build` both green.
* [ ] `ts-prune` report reviewed; unused code removed or justified.

````

---

## 3) `phase-08-migration-and-cleanup_Playbook_2025-09-22.md`

```md
**Official Title:** Phase 08 — Migration & Cleanup (Playbook)  
**Domain:** packages  
**File Name:** phase-08-migration-and-cleanup_Playbook_2025-09-22.md  
**Main Part:** phase-08-migration-and-cleanup  
**Qualifier:** Playbook  
**Date:** 2025-09-22

**Spotlight Comments:**  
- This is a code-debt burn-down: remove legacy paths, harden imports, align routes.  
- Keep commits small; open PRs into `feat/packages-refactor`.

**Summary:**  
A step-by-step execution guide to finish the migration to the façade + generated-artifact model and to remove legacy code paths, with commands and guard checks.

---

## 0) Branch & scope
```bash
git switch feat/packages-refactor
git pull --ff-only
git switch -c chore/phase-08-migration-and-cleanup
````

Scope: **packages domain only** (routes, templates, data access). Avoid unrelated refactors.

---

## 1) Eliminate runtime MD/MDX usage

**Why:** We compile MDX at build (Phase 03). No runtime parsing allowed.

**Find offenders**

```bash
git grep -nE "from ['\"][^'\"]+\\.(md|mdx)['\"]|require\\([^)]*\\.(md|mdx)\\)" -- \
  'src/**/*.{ts,tsx,js,jsx}' 'app/**/*.{ts,tsx}'
```

**Fix pattern**

* If a page/template is reading `.mdx`/`.md` directly → **delete that import**.
* Use `bundle.content?.html` produced by the build pipeline:

  ```tsx
  {bundle.content?.html && (
    <article className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: bundle.content.html }} />
  )}
  ```

* For any markdown-like text used in components, convert to plain strings or precompiled HTML.

Commit:

```bash
git add -A
git commit -m "refactor(packages): remove runtime MD/MDX imports; render compiled HTML only"
```

---

## 2) Enforce façade-only reads

**Why:** Single SSOT surface; templates/components must not deep-read data.

**Detect deep imports in components**

```bash
git grep -n "from ['\"][@]/data/" -- 'src/components/**/*.{ts,tsx}'
```

There should be **no matches**.

**Detect direct `__generated__` reads**

```bash
git grep -n "__generated__" -- 'src/**/*.{ts,tsx}' 'app/**/*.{ts,tsx}' \
  | grep -v "src/data/packages/index.ts" || true
```

**Fix pattern**

* Move any deep read into **page** (controller) or the **façade**.
* Templates only accept props; no IO.
* If you find helper code reading `__generated__`, centralize it in `src/data/packages/index.ts`.

Commit:

```bash
git add -A
git commit -m "refactor(packages): enforce façade-only reads; remove direct __generated__ access"
```

---

## 3) Align package routes & remove duplicates

**Why:** Next.js App Router resolves routes by folder path; duplicates cause build failures.

**Check structure**

```bash
tree -L 2 app/packages || ls -1 app/packages
```

**Required**

* Hub: `app/packages/page.tsx`
* Detail (plural): `app/packages/[bundles]/page.tsx`
* Remove any legacy `app/packages/[bundle]/page.tsx` (singular) or alternate duplicates.

**Collision sweep (generic)**

```bash
# pages that render to the same route twice (quick grep for telltales)
git grep -nE "export\\s+const\\s+dynamic|generateStaticParams|metadata|generateMetadata" -- \
  'app/packages/**/*.{ts,tsx}'

# whole-app duplicate page heads if needed
git grep -n "You cannot have two parallel pages that resolve to the same path" -- 'app/**/*' || true
```

**Fix pattern**

* Keep only **one** page per route path.
* `[bundles]` must be plural across params and `generateStaticParams()`.

Commit:

```bash
git add -A
git commit -m "refactor(packages): align App Router structure; remove duplicate/legacy routes; keep [bundles] plural"
```

---

## 4) Purge legacy hub/detail sections

**Why:** We now use `PackagesHubTemplate` and `PackagesDetailTemplate`.

**Steps**

* Open `app/packages/page.tsx` and `app/packages/[bundles]/page.tsx`.
* Remove any leftover sections/components replaced by the templates.
* Ensure both pages import data **only** via the façade (`@/data/packages`).

Commit:

```bash
git add -A
git commit -m "refactor(packages): remove legacy hub/detail sections; rely on templates"
```

---

## 5) Dead-code cleanup

**Why:** Reduce maintenance surface; keep repo lean.

**Install & run**

```bash
npm i -D ts-prune
npx ts-prune | tee /tmp/ts-prune.txt
```

* Review the output; delete unused exports that are clearly dead.
* For false positives (dynamic/Next usage), **add inline comments** or a small allowlist.

Commit:

```bash
git add -A
git commit -m "chore(packages): remove unused exports based on ts-prune; document intentional keeps"
```

---

## 6) Asset path alignment (if applicable)

**Why:** Prevent 404s; ensure canonical paths via `ASSETS` constants.

**Steps**

* If you adopted `src/data/assets.ts` (or similar), replace any hardcoded paths inside packages pages/templates with `ASSETS.*`.
* Run app and watch 404s:

  ```bash
  npm run dev
  # Visit /packages and some detail pages; check network panel for 404s
  ```

Commit:

```bash
git add -A
git commit -m "chore(packages): align asset paths to ASSETS map; fix 404s"
```

---

## 7) Final validations

```bash
npm run data:ci
npm run build
npm run docs:check || true   # if you have the Phase 07 doc linter
```

**Expected**

* `data:ci` green (schema/refs/doctor pass).
* `next build` green (no duplicate route errors).
* (Optional) Docs linter OK.

Commit:

```bash
git add -A
git commit -m "chore(packages): Phase 08 validations green (data:ci, build)"
```

---

## 8) PR

Open a PR **into `feat/packages-refactor`**:

**Title**

```
refactor(packages): Phase 08 — migration & cleanup (façade-only, no runtime MD/MDX, route alignment)
```

**Body (include)**

* Summary of deletions/refactors.
* Notes on any intentional keeps from `ts-prune`.
* Checkboxes:

  * [ ] No runtime MD/MDX imports in runtime code
  * [ ] No `@/data/**` imports in `src/components/**`
  * [ ] Only façade reads `__generated__`
  * [ ] `[bundles]` plural and no duplicate routes
  * [ ] `npm run data:ci` & `npm run build` green
  * [ ] Docs changelog updated

---

## Troubleshooting

* **MD/MDX import keeps reappearing:** verify a transitive import in shared components; move narrative to MDX + build, not runtime imports.
* **A component still reads data directly:** move the read into the **page** and pass props; or expose a method via the façade.
* **Route collisions persist:** temporarily rename suspect folders and re-add one by one; check parallel/route groups aren’t mapping to the same path.

````

---

## 4) `_generated/index.json`

```json
{
  "phase": "08",
  "title": "Migration & Cleanup",
  "files": [
    "README.md",
    "phase-08-migration-and-cleanup_Checklist_2025-09-22.md",
    "phase-08-migration-and-cleanup_Playbook_2025-09-22.md"
  ],
  "lastUpdated": "2025-09-22"
}
````

---

### Final Acceptance (paste into the PR)

* **No runtime MD/MDX** imports remain.
* **Zero deep imports** from `@/data/**` in `src/components/**`; only pages (and the façade) touch data.
* Only the **façade** reads from `__generated__`.
* **Routes clean & plural** (`/packages/[bundles]`); no duplicates.
* `npm run data:ci` and `npm run build` both **green**.
* **Changelog** updated with a brief rationale and scope.
