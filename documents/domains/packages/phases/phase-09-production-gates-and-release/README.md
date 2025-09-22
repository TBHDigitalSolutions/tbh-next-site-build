Perfect—here are the **production-ready docs** for **Phase 09 — Production Gates & Release**.
Copy these straight into:

```
documents/domains/packages/phases/phase-09-production-gates-and-release/
├─ _generated/index.json
├─ README.md
├─ phase-09-production-gates-and-release_Checklist_2025-09-22.md
└─ phase-09-production-gates-and-release_Playbook_2025-09-22.md
```

---

## 1) `README.md`

```md
**Official Title:** Phase 09 — Production Gates & Release  
**Domain:** packages  
**File Name:** phase-09-production-gates-and-release_Readme_2025-09-22.md  
**Main Part:** phase-09-production-gates-and-release  
**Qualifier:** Guide  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Lock quality with CI gates: `data:ci`, `lint`, `typecheck`, `build`.  
- Ship from `feat/packages-refactor` via a single integration PR → `main`.  
- Verify performance & SEO quickly; tag and publish release notes.

**Summary:**  
This phase adds production gates and a clean release procedure for the Packages domain. CI must enforce schema validation and generated-artifact freshness (`data:ci`), coding standards (`lint`), type safety (`typecheck`), and a clean Next build (`build`). The playbook below walks through the integration PR, preview verification, performance sanity checks, semantic version tagging, and rollback.
```

---

## 2) `phase-09-production-gates-and-release_Checklist_2025-09-22.md`

````md
**Official Title:** Phase 09 — Production Gates & Release (Checklist)  
**Domain:** packages  
**File Name:** phase-09-production-gates-and-release_Checklist_2025-09-22.md  
**Main Part:** phase-09-production-gates-and-release  
**Qualifier:** Checklist  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Work only on `feat/packages-refactor` (never `main`).  
- Use **npm** only. Do not commit `src/data/packages/__generated__/` or `.env.local`.

**Summary:**  
A tight, verifiable set of steps to enforce quality gates in CI and ship safely to `main` with a tag and release notes.

---

## Working rules
- Pages are thin controllers; templates have **no IO**; components are presentational.  
- **No runtime MD/MDX parsing**.  
- All app reads via `@/data/packages` façade only.  
- Generated artifacts live under `src/data/packages/__generated__/` and are **gitignored**.

## Preconditions
- [ ] Phases **00 → 08** merged into `feat/packages-refactor`.  
- [ ] Local passes: `npm ci && npm run data:ci && npm run build`.  
- [ ] Docs index updated (Phase 07) if you’re using the docs scripts.

## CI gates (add/confirm)
- [ ] Workflow exists: `.github/workflows/packages-pr.yml` with jobs for `data:ci`, `lint`, `typecheck`, `build`.  
- [ ] Required checks configured in repo settings (if available) to block merges when red.  
- [ ] Soft guard present: pre-push hook blocks direct pushes to `main`.

## Preview verification (integration PR)
- [ ] Open PR: **base `main` ← compare `feat/packages-refactor`**.  
- [ ] CI green: `data:ci`, `lint`, `typecheck`, `build`.  
- [ ] Preview deploy opens and passes manual smoke:  
  - [ ] `/packages` loads, search/filter OK, JSON-LD `ItemList` present.  
  - [ ] `/packages/<a-known-bundle>` loads, compiled MDX renders, JSON-LD `Service` shown only when price exists.  
- [ ] Performance sanity (local or preview): no >10% regression in **Lighthouse Performance** vs last main.  
- [ ] SEO sanity: canonical/OG present, no duplicate titles.

## Release
- [ ] **Squash-merge** the integration PR into `main`.  
- [ ] Tag: `vX.Y.Z` (semver); push tag.  
- [ ] Create GitHub Release with the **Release Notes** (template below).  
- [ ] Post-release smoke test in production (same checks as preview).  
- [ ] If any blocker surfaces → rollback to previous tag (see Playbook).

## Commands (local)
```bash
npm ci
npm run data:ci
npm run lint
npm run typecheck
npm run build

# Tag & push after merge to main (replace X.Y.Z)
git switch main && git pull --ff-only
git tag vX.Y.Z -m "Packages domain GA vX.Y.Z"
git push origin vX.Y.Z
````

## Acceptance

* [ ] CI gates present and green on integration PR.
* [ ] Preview and production pass smoke + schema checks.
* [ ] Tag and release notes published.
* [ ] Rollback procedure documented and tested (dry run).

````

---

## 3) `phase-09-production-gates-and-release_Playbook_2025-09-22.md`

```md
**Official Title:** Phase 09 — Production Gates & Release (Playbook)  
**Domain:** packages  
**File Name:** phase-09-production-gates-and-release_Playbook_2025-09-22.md  
**Main Part:** phase-09-production-gates-and-release  
**Qualifier:** Playbook  
**Date:** 2025-09-22

**Spotlight Comments:**  
- CI is the gate: `data:ci`, `lint`, `typecheck`, `build`.  
- Release through a single integration PR; tag `vX.Y.Z`; publish notes and verify.

**Summary:**  
A step-by-step release playbook: set up CI gates, open the integration PR, verify previews, merge to `main`, tag & release, then perform post-release checks and (if needed) rollback.

---

## 0) Branch & scope
```bash
git switch feat/packages-refactor
git pull --ff-only
git switch -c chore/phase-09-prod-gates
````

Scope: infrastructure for **gates and release** only. App code changes should already be merged by Phases 00–08.

---

## 1) CI workflow (required checks)

Create (or update) `.github/workflows/packages-pr.yml`:

```yaml
name: Packages Domain — PR Gates

on:
  pull_request:
    branches: [ "main", "feat/packages-refactor" ]
    paths:
      - "app/**"
      - "src/**"
      - "scripts/**"
      - "documents/domains/packages/**"
      - "package.json"
      - "tsconfig.json"
      - ".github/workflows/packages-pr.yml"

jobs:
  quality:
    name: Quality Gates
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

      - name: Data CI
        run: npm run data:ci

      - name: Lint
        run: npm run lint

      - name: Typecheck
        run: npm run typecheck

      - name: Build
        run: npm run build
```

> If repository settings support it, add these as **required checks** for merging PRs into `main` and `feat/packages-refactor`. If not available, rely on this workflow’s status + the local pre-push hook you already installed to discourage direct pushes to `main`.

Commit:

```bash
git add .github/workflows/packages-pr.yml
git commit -m "ci(packages): add PR quality gates (data:ci, lint, typecheck, build)"
```

---

## 2) Integration PR (staging the release)

Open a PR from the integration branch to `main`:

```bash
git push -u origin chore/phase-09-prod-gates
# then open a PR:
# base: main  ←  compare: feat/packages-refactor
```

**PR body (minimum):**

* Scope summary; link to **SSOT** and relevant **Phase docs**.
* Checkboxes:

  * [ ] `data:ci` green
  * [ ] `lint` green
  * [ ] `typecheck` green
  * [ ] `build` green
  * [ ] Preview smoke passed (hub, detail)
  * [ ] Performance sanity OK (no >10% regression)

---

## 3) Preview verification (manual)

In the PR’s preview deployment:

**Hub (`/packages`)**

* Instant search responsiveness (typing feels immediate).
* Filters: Type/Service/Sort toggle without reload.
* JSON-LD `ItemList` present (view-source or devtools).

**Detail (`/packages/[bundles]`)**

* If `price` exists → `Service` JSON-LD shows `offers`.
* If `price` missing → no `offers` in schema.
* Compiled MDX (from Phase 03) renders via `dangerouslySetInnerHTML`.
* CTAs send analytics events.

**SEO sanity**

* Canonical & OG/Twitter tags set; no duplicate titles.

**Performance sanity**

* Quick Lighthouse run (local or preview). Capture scores and compare with last main.
  Target: **no more than 10%** drop in Performance. If you use LHCI, add a budget threshold (optional).

---

## 4) Merge strategy

* **Squash-merge** the integration PR into `main` once **all gates are green** and preview passed.
* Keep the squash commit message clear (scope + phase).

After merge:

```bash
git switch main && git pull --ff-only
```

---

## 5) Tagging and Release Notes

**Tag a version** (semantic versioning; example `v1.3.0`):

```bash
git tag vX.Y.Z -m "Packages domain GA vX.Y.Z"
git push origin vX.Y.Z
```

**Create a GitHub Release** from the tag using this template:

```md
## Packages Domain — Release vX.Y.Z

### Highlights
- New hub & detail via templates (no IO; compiled MDX)
- Deterministic build pipeline (`data:ci` artifacts)
- Search index & featured rails with validation
- Analytics & SEO schema (hub ItemList; detail Service with offers when priced)

### Breaking / Behavior changes
- Direct runtime MD/MDX reads removed
- Components cannot import `@/data/**`; pages only

### Migration Notes
- Ensure `NEXT_PUBLIC_SITE_URL` set in production environment

### Verification
- Hub: search/filter OK; JSON-LD valid
- Detail: MDX renders; offers present only when priced

### Links
- PR: #<number>
- SSOT: documents/domains/packages/packages-phase-driven_Plan_2025-09-22.md
- Phase docs: phases/phase-04…, phase-05…, phase-06…
```

---

## 6) Post-release checks (production)

Immediately after deployment to production:

```bash
# quick sanity (local browser or curl)
# Visit /packages and a couple of /packages/<slug> pages
```

* **Smoke**: same checks as preview.
* **Logs/Monitoring** (if configured): scan for new errors.
* **Analytics**: confirm events are flowing for hub/detail CTAs.

---

## 7) Rollback (if needed)

If a blocker appears:

```bash
# Identify last known good tag, e.g. vX.Y.(Z-1)
git switch main
git pull --ff-only
git revert --no-edit <merge_commit_sha>  # or redeploy previous tag via your platform
git push origin main
```

If your platform supports it, redeploy the previous **tag** directly.

---

## 8) Gates overview (what must be green)

| Gate         | Tool/Command             | Pass Criteria                                               |
| ------------ | ------------------------ | ----------------------------------------------------------- |
| Schema/Build | `npm run data:ci`        | No schema/ref errors; artifacts generated deterministically |
| Lint         | `npm run lint`           | 0 errors; warnings acceptable only if policy allows         |
| Types        | `npm run typecheck`      | 0 errors                                                    |
| Next build   | `npm run build`          | No route collisions or webpack errors                       |
| SEO/Schema   | Manual + tools           | Hub `ItemList`; detail `Service` (only if priced)           |
| Perf sanity  | Lighthouse (manual/LHCI) | No >10% regression vs main for key routes                   |

---

## 9) Housekeeping

* Update `documents/domains/packages/changelog.md`.
* Announce the release internally (link the PR and Release).

````

---

## 4) `_generated/index.json`

```json
{
  "phase": "09",
  "title": "Production Gates & Release",
  "files": [
    "README.md",
    "phase-09-production-gates-and-release_Checklist_2025-09-22.md",
    "phase-09-production-gates-and-release_Playbook_2025-09-22.md"
  ],
  "lastUpdated": "2025-09-22"
}
````

---

### Notes

* The CI workflow uses **Node 20** and **npm** as requested.
* If your repo cannot enforce “Required status checks” (plans/permissions), you still get strong protection via the workflow + your existing **pre-push** hook that blocks direct pushes to `main`.
* Keep tagging and release notes consistent; they’re your audit trail for the Packages domain going GA.
