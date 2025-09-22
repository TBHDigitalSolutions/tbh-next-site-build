# Packages (Domain)\n
`documents/domains/packages/README.md`

---

# Packages Domain — Documentation Contract & Directory Usage (Control Tower)

```md
---
doc: overview
domain: packages
version: 1.0.0
lastUpdated: 2025-09-22
owners: [@conorhovis1]
links:
  ssot: ./packages-phase-driven_Plan_2025-09-22.md
  standards: ./standards/README.md
  indexScript: ./scripts/build-doc-index.ts
---
```

## What this folder is

This is the **source of truth for documentation** of the Packages domain. It hosts:

* The **Master Plan (SSOT)** — goals, phases, acceptance criteria.
* Per-phase **Checklists** (short) and **Playbooks** (long).
* **Standards** — stable reference rules (schemas, naming, routing/layout, pricing/content rules).
* **Templates** for new phase docs.
* **Scripts** to auto-index and lint docs.

### Directory map (canonical)

```text
documents/
└─ domains/
   └─ packages/
      ├─ README.md                                  # ← you are here (control tower)
      ├─ packages-phase-driven_Plan_2025-09-22.md   # ← Master SSOT plan (unified)
      ├─ _generated/
      │  └─ index.json                              # auto-built directory index
      ├─ standards/
      │  ├─ README.md
      │  ├─ authoring-and-data-standards_Standard_2025-09-22.md
      │  ├─ routing-and-page-layouts_Spec_2025-09-22.md
      │  ├─ data-content-rules_Spec_2025-09-22.md
      │  └─ _generated/index.json
      ├─ phases/
      │  ├─ phase-00-baseline-guardrails/
      │  │  ├─ README.md
      │  │  ├─ phase-00-baseline-guardrails_Checklist_2025-09-22.md  # short
      │  │  ├─ phase-00-baseline-guardrails_Playbook_2025-09-22.md   # long
      │  │  └─ _generated/index.json
      │  ├─ phase-01-ssot-and-facade/
      │  │  ├─ README.md
      │  │  ├─ phase-01-ssot-and-facade_Checklist_2025-09-22.md
      │  │  ├─ phase-01-ssot-and-facade_Playbook_2025-09-22.md
      │  │  └─ _generated/index.json
      │  └─ … (through phase-09)
      ├─ templates/
      │  ├─ phase-short_Checklist_Template.md
      │  └─ phase-long_Playbook_Template.md
      ├─ changelog.md
      └─ scripts/
         ├─ build-doc-index.ts
         └─ check-docs.ts            # optional lint (names/headers/links)
```

---

## Roles & ownership of docs

### Master Plan (SSOT)

**File:** `packages-phase-driven_Plan_2025-09-22.md`
**Purpose:** The **contract** for *what we’re doing and in what order*. It owns:

* Phase list (IDs, slugs, titles)
* Goals/objectives (verbatim)
* **Acceptance criteria** (normative)

> Any change to goals/acceptance must be made here first, then mirrored into phase docs.

### Phase docs (per phase)

Each phase has its own folder with:

* **Checklist** (short, “Working Rules”): operational brief you pin in VS Code/Codex.
* **Playbook** (long, “Execution Brief”): deep implementation detail.

**Files (example):**

* `phases/phase-04-app-router-hub-and-detail/phase-04-app-router-hub-and-detail_Checklist_2025-09-22.md`
* `phases/phase-04-app-router-hub-and-detail/phase-04-app-router-hub-and-detail_Playbook_2025-09-22.md`

**Rule:** Checklists/Playbooks must **link back** to the SSOT phase anchor and **must not contradict** it.

### Standards (stable reference)

**Folder:** `standards/`
**Purpose:** Canonical rules (schemas, naming, routing/page layouts, data & pricing rules). These are **references**, not task lists, and are linked from phases.

---

## Naming & metadata conventions

* **Phase folder:** `phase-0X-slug/` (two-digit number keeps natural sort).
* **Docs inside a phase:**

  * `…_Checklist_YYYY-MM-DD.md` (short)
  * `…_Playbook_YYYY-MM-DD.md` (long)
* **Required front-matter (all phase docs):**

  ```md
  ---
  doc: phase-short | phase-long
  id: PKG-PH0X
  title: Phase 0X — <Title>
  owner: @conorhovis1
  status: Planned | In-Progress | Blocked | Done
  links:
    ssot: ../../packages-phase-driven_Plan_2025-09-22.md#phase-0x-...
    standards: ../../standards/authoring-and-data-standards_Standard_2025-09-22.md
  lastUpdated: YYYY-MM-DD
  ---
  ```

---

## Workflow (how to use this directory)

### 1) Update goals or acceptance

* Edit **SSOT**: `packages-phase-driven_Plan_2025-09-22.md`.
* Then update the corresponding **Checklist** and **Playbook** for that phase.

### 2) Start or advance a phase

* Open/edit the phase’s **Checklist** (short). Pin it in Codex/VS Code as the working rules.
* Codex should “open and follow” the **Playbook** (long) for step-by-step execution.
* All branches/PRs should reference the **Phase ID** (e.g., `PKG-PH04`) in title/body.

### 3) Keep the index fresh

* Run the index script to regenerate `_generated/index.json` and `index.md` tables if applicable:

  ```bash
  node documents/domains/packages/scripts/build-doc-index.ts
  ```

---

## What belongs where (quick decision chart)

| I need to document…                      | Put it here                                  |
| ---------------------------------------- | -------------------------------------------- |
| New or changed **goals/acceptance**      | **SSOT** (`packages-phase-driven_Plan_*.md`) |
| Exact **how-to** for a single phase      | **Playbook** (phase long doc)                |
| Daily **working rules** to pin for Codex | **Checklist** (phase short doc)              |
| Canonical schemas/naming/routing/pricing | **standards/** (reference only)              |
| A new phase doc skeleton                 | **templates/** (copy then fill in)           |
| Indexing/consistency automation          | **scripts/**                                 |

---

## Minimal templates (inline reference)

**Checklist (short) — copy from `templates/phase-short_Checklist_Template.md`**

````md
---
doc: phase-short
id: PKG-PHXX
title: Phase XX — <Title>
owner: @conorhovis1
status: Planned
links:
  ssot: ../../packages-phase-driven_Plan_2025-09-22.md#phase-xx
  standards: ../../standards/authoring-and-data-standards_Standard_2025-09-22.md
lastUpdated: YYYY-MM-DD
---

## Objective (from SSOT)
<1–2 sentences verbatim>

## Working rules
- Work only on `feat/packages-refactor` (never `main`).
- Use **npm** only; ask before running shell commands.
- No runtime MD/MDX; pages thin; templates no IO.
- All data via `@/data/packages` façade.

## Scope
- Touch: <files/dirs>
- Don’t touch: <files/dirs>

## Checklist
- [ ] Task A …
- [ ] Task B …

## Acceptance (from SSOT)
- [ ] <paste criteria verbatim>

## Commands
```bash
npm run data:ci && npm run build && npm run dev
````

## PR

* Base: `feat/packages-refactor` | Title: `feat(packages): <phase> (Checklist)`

````

**Playbook (long) — copy from `templates/phase-long_Playbook_Template.md`**
```md
---
doc: phase-long
id: PKG-PHXX
title: Phase XX — <Title>
owner: @conorhovis1
status: Planned
links:
  ssot: ../../packages-phase-driven_Plan_2025-09-22.md#phase-xx
  standards: ../../standards/authoring-and-data-standards_Standard_2025-09-22.md
lastUpdated: YYYY-MM-DD
---

## Objective (from SSOT)
<verbatim goal + acceptance link>

## Why this matters
<impact, KPIs, risks mitigated>

## Dependencies
- Blocks/blocked by: …

## Detailed Work Plan
1) …
2) …

## Code stubs
```ts
// realistic starter snippets
````

## Test & validation

* Unit/E2E, manual checks, CI gates

## Analytics / SEO / Schema

* Events, JSON-LD, canonical/OG, a11y

## Risks & rollback

* …

## Rollout

* Branching, PR targets, testing envs

## Changelog

* YYYY-MM-DD: …

```

---

## Using with Codex / VS Code (quick start)
1. **Pin the phase’s Checklist** in the Codex side panel (guardrails + acceptance).
2. **Tell Codex to open the phase’s Playbook** and follow it step-by-step.
3. Require PRs to reference the **Phase ID** and link the Checklist + Playbook.

---

## Definition of Done (docs)
- SSOT updated first for any scope/acceptance change.
- Each in-flight phase has:
  - Up-to-date **Checklist** (short) and **Playbook** (long).
  - Links to SSOT and Standards are valid.
- `scripts/build-doc-index.ts` run after changes; index files updated.
- `changelog.md` captures meaningful plan or standards changes.

---

**That’s it.** This document ties your **SSOT + Phases + Standards** together and uses your **updated directory** exactly as structured.
::contentReference[oaicite:0]{index=0}
```

---

Short answer: **yes, rename and relocate it**—but not to `catalog/catalog`.
Make it a single, clear home: **`documents/domains/packages/standards/catalog/`**.

Why? Those MD files are **reference catalogs** (copy, pricing notes, lists) that are important for humans but **not consumed by the build**. In our doc model, anything canonical-but-not-executable belongs under **`standards/`**. Putting them in `standards/catalog/`:

* signals “reference only; not used to populate components,”
* keeps them close to the other standards (routing/layout, authoring & data rules),
* avoids the confusing duplicate `packages-data-and-content/packages-data-and-content` nesting, and
* gives you a stable URL to cite in phase docs & PRs.

If you’d rather surface them at the top of the domain for visibility, an acceptable alternate is `documents/domains/packages/catalog/`. I still recommend `standards/catalog/` for consistency.

---

# 🧭 What each catalog file is for

* `packages.md` — narrative descriptions of package SKUs for that service: positioning, sample outcomes, non-binding price guidance.
* `add-ons.md` — narrative descriptions of add-on SKUs for that service.
* `bundles.md` — narrative descriptions of bundles (how packages combine; value props).
* `featured.md` — the “why” behind featured picks, with notes on seasonality or campaigns.

**Important:** These are **reference documents** for humans. The **SSOT for data** that the app uses stays in `src/data/packages/*.ts` (typed authoring) → compiled to `__generated__/…` by build scripts. No catalog markdown should be read at runtime.

---

# 🪪 Add a banner to each catalog file (front-matter + notice)

Put this at the top of **every** catalog markdown:

```md
---
doc: catalog
domain: packages
service: <content|lead-generation|marketing|seo|video|web|cross-service>
version: 1.0.0
lastUpdated: 2025-09-22
consumedByApp: false
---

> **Reference only.** This catalog is **not** used to populate component props or build artifacts.  
> Authoritative app data lives in **`src/data/packages/*.ts`** and compiled `__generated__/` JSONs.  
> Keep prices as *guidance*, not binding. Update the SSOT/TS sources for any production change.
```

---

# 🧰 Update links & guardrails

1. **Search & update** any internal links that referenced the old path:

```bash
# Inspect first
rg -n "packages-data-and-content" documents

# Replace (example using sd; use sed if preferred)
sd 'documents/domains/packages/packages-data-and-content' \
   'documents/domains/packages/standards/catalog' -s documents
```

2. **Add a one-liner to the Standards README** pointing readers to the catalog:

```md
- **Catalog (reference only):** `./catalog/` — narrative lists of services/packages/add-ons/bundles.
```

3. **Phase docs note:** In Phase 01/03 Playbooks, add a small warning box:

> ⚠️ **Catalog is reference-only.** Do not read from `standards/catalog/**` at runtime or in build scripts. The SSOT is `src/data/packages/*.ts`.

---

# 📝 Why this rename helps

* **Clarity for contributors:** “catalog” is the intuitive name for these curated lists; “standards” reminds everyone they’re **reference**, not executable.
* **Reduces drift:** By separating from phase docs and SSOT data files, it’s clearer which source is authoritative for the app.
* **Predictable links:** Phase Playbooks can link to canonical catalog paths per service.

---

Absolutely—here’s your **updated guidance rewritten to match the new directory and naming scheme** (master plan filename, per-phase subfolders, short=Checklist, long=Playbook, `_generated/index.json`, and `README.md` as the control tower).

---

# Why two versions?

* **Short (“Working Rules”) → *Checklist***
  A crisp, operational brief to pin in Codex/VS Code or paste into PRs: scope, guardrails, commands, and acceptance. Keeps everyone focused and avoids context bloat.

* **Long (“Execution Brief”) → *Playbook***
  The deep dive: background, risks, dependencies, step-by-step tasks, code stubs, tests, rollout/rollback. What a senior dev reads to fully implement the phase.

**Rule of thumb:** the **master SSOT plan** is the contract for goals/acceptance; each phase’s **Checklist & Playbook implement that contract**.

---

# Directory structure (updated)

```text
documents/
└─ domains/
   └─ packages/
      ├─ README.md                                  # Curated control tower (status & links)
      ├─ packages-phase-driven_Plan_2025-09-22.md   # Master SSOT plan (unified)
      ├─ _generated/
      │  └─ index.json                              # Auto-index for this folder
      ├─ standards/
      │  ├─ README.md
      │  ├─ authoring-and-data-standards_Standard_2025-09-22.md
      │  ├─ routing-and-page-layouts_Spec_2025-09-22.md
      │  ├─ data-content-rules_Spec_2025-09-22.md
      │  └─ _generated/index.json
      ├─ phases/
      │  ├─ phase-00-baseline-guardrails/
      │  │  ├─ README.md
      │  │  ├─ phase-00-baseline-guardrails_Checklist_2025-09-22.md
      │  │  ├─ phase-00-baseline-guardrails_Playbook_2025-09-22.md
      │  │  └─ _generated/index.json
      │  ├─ phase-01-ssot-and-facade/
      │  │  ├─ README.md
      │  │  ├─ phase-01-ssot-and-facade_Checklist_2025-09-22.md
      │  │  ├─ phase-01-ssot-and-facade_Playbook_2025-09-22.md
      │  │  └─ _generated/index.json
      │  ├─ phase-02-content-mdx-and-security/
      │  │  ├─ README.md
      │  │  ├─ phase-02-content-mdx-and-security_Checklist_2025-09-22.md
      │  │  ├─ phase-02-content-mdx-and-security_Playbook_2025-09-22.md
      │  │  └─ _generated/index.json
      │  └─ … (through phase-09)
      ├─ templates/
      │  ├─ phase-short_Checklist_Template.md
      │  └─ phase-long_Playbook_Template.md
      ├─ changelog.md
      └─ scripts/
         ├─ build-doc-index.ts                       # emits each folder’s _generated/index.json
         └─ check-docs.ts                            # (optional) lint names/headers/links
```

---

# What goes in each file?

## Short (“Working Rules”) — **Checklist**

Path: `documents/domains/packages/phases/phase-XX-…/phase-XX-…_Checklist_YYYY-MM-DD.md`
Use this in Codex/VS Code. Keep it \~1–2 pages.

* **Front-matter / header**: `id`, `title`, `owner`, `status`, `links` (back to master plan & standards)
* **Objective**: 1–2 sentences copied verbatim from the master plan
* **Working rules**: branch, package manager, no runtime MD/MDX, imports rules
* **Scope**: what to touch vs not touch
* **Checklist**: tight, checkable tasks
* **Acceptance**: copied from master plan
* **Commands**: `npm run data:ci`, `npm run build`, etc.
* **PR**: base/head, title, required checkboxes

**Template → `templates/phase-short_Checklist_Template.md`**

````md
---
doc: phase-short
id: PKG-PHXX
title: Phase XX — <Title>
owner: @conorhovis1
status: Planned
links:
  ssot: ../../packages-phase-driven_Plan_2025-09-22.md#phase-xx
  standards: ../../standards/authoring-and-data-standards_Standard_2025-09-22.md
lastUpdated: YYYY-MM-DD
---

## Objective (from SSOT)
<1–2 sentences verbatim>

## Working rules
- Work only on `feat/packages-refactor` (never `main`).
- Use **npm** only; ask before running shell commands.
- No runtime MD/MDX; pages thin; templates no IO.
- All data via `@/data/packages` façade.

## Scope
- Touch: <files/dirs>
- Don’t touch: <files/dirs>

## Checklist
- [ ] Task A …
- [ ] Task B …
- [ ] Task C …

## Acceptance (from SSOT)
- [ ] <paste criteria verbatim>

## Commands
```bash
npm run data:ci && npm run build && npm run dev
```

## PR
- Base: `feat/packages-refactor` | Title: `feat(packages): <phase> (Checklist)`
````

---

## Long (“Execution Brief”) — **Playbook**

Path: `documents/domains/packages/phases/phase-XX-…/phase-XX-…_Playbook_YYYY-MM-DD.md`
No page limit—this is the full implementation guide.

* **Front-matter / header**: same fields as Checklist
* **Why this matters**: context, impact, risks
* **Dependencies**
* **Detailed work plan**: step-by-step with file paths & code snippets
* **Data contracts**: schemas, types, examples (link standards for canonical defs)
* **Test & validation plan**: unit/E2E, manual checks, CI gates
* **Analytics/SEO schema** (if relevant)
* **Risks & rollback**
* **Rollout**
* **Changelog** for this phase

**Template → `templates/phase-long_Playbook_Template.md`**

````md
---
doc: phase-long
id: PKG-PHXX
title: Phase XX — <Title>
owner: @conorhovis1
status: Planned
links:
  ssot: ../../packages-phase-driven_Plan_2025-09-22.md#phase-xx
  standards: ../../standards/authoring-and-data-standards_Standard_2025-09-22.md
lastUpdated: YYYY-MM-DD
---

## Objective (from SSOT)
<verbatim objective + acceptance link>

## Why this matters
<impact, KPIs, risks mitigated>

## Dependencies
- Blocks/blocked by: …

## Detailed work plan
1) …
2) …

## Code scaffolds
```ts
// paste realistic starter stubs
````

## Test & validation plan

* Unit/E2E, manual checks, CI gates

## Analytics / SEO / Schema

* Events, JSON-LD, canonical/OG, a11y notes

## Risks & rollback

* …

## Rollout

* Branching, PR targets, testing environments

## Changelog

* YYYY-MM-DD: …

````

---

# Using them with Codex / VS Code

- **Pin the Checklist** as your first Codex message (or in “Working rules”).  
- Then **tell Codex to open the Playbook** for that phase to follow the deep details.

---

# Index table with both links (updated paths)

```md
| Phase | Title                            | Owner         | Status | Checklist                                                                                              | Playbook                                                                                             |
|-----: |----------------------------------|---------------|--------|---------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| 04    | App Router — Hub & Detail        | @conorhovis1  | Doing  | [Checklist](phases/phase-04-app-router-hub-and-detail/phase-04-app-router-hub-and-detail_Checklist_2025-09-22.md) | [Playbook](phases/phase-04-app-router-hub-and-detail/phase-04-app-router-hub-and-detail_Playbook_2025-09-22.md) |
````

---

# Quick setup (updated commands)

```bash
git switch -c chore/docs-phase-split

# create templates
mkdir -p documents/domains/packages/{phases,templates}
$EDITOR documents/domains/packages/templates/phase-short_Checklist_Template.md
$EDITOR documents/domains/packages/templates/phase-long_Playbook_Template.md

# seed phase folders with date-stamped files and local indexes
for n in 00 01 02 03 04 05 06 07 08 09; do
  dir="documents/domains/packages/phases/phase-$n-placeholder"
  mkdir -p "$dir/_generated" "$dir/assets"
  cp documents/domains/packages/templates/phase-short_Checklist_Template.md  "$dir/phase-$n-placeholder_Checklist_2025-09-22.md"
  cp documents/domains/packages/templates/phase-long_Playbook_Template.md   "$dir/phase-$n-placeholder_Playbook_2025-09-22.md"
done

# add root files if not present
mkdir -p documents/domains/packages/_generated standards/_generated
: > documents/domains/packages/README.md
: > documents/domains/packages/standards/README.md
: > documents/domains/packages/changelog.md

git add -A
git commit -m "docs(packages): per-phase subdirs with Checklist/Playbook, templates, and _generated indexes"
git push -u origin chore/docs-phase-split
```

---

## Bottom line

* **Yes: two versions per phase** (Checklist + Playbook) is the right pattern.
* **Yes: give each phase its own subdirectory** with a local `_generated/index.json`.
* All links and filenames above now **match your new directory scheme** (master plan name, standards filenames, date-stamped phase docs).
