**Official Title:** Packages Domain — Phase-Driven Implementation Plan (Unified)  
**Domain:** packages  
**File Name:** packages-phase-driven_Plan_2025-09-22.md  
**Main Part:** packages-phase-driven  
**Qualifier:** Plan  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Single source of truth (SSOT) for the Packages domain refactor and launch.  
- Phases are the contract (goals + acceptance); deep “how-to” lives in per-phase Playbooks/Checklists.  
- Standards (schemas, authoring rules) are separate and referenced here.

**Summary:**  
This document is the master plan (SSOT) for delivering a production-ready **Packages** domain. It merges task overlap from prior lists into a **phase-driven roadmap** with clear acceptance criteria, while delegating detailed execution to per-phase **Playbooks** (long) and **Checklists** (short). All schemas, naming, authoring and price normalization rules live in **standards** documents referenced from the relevant phases.

---

# File naming + required header (copy block)

**Use these names** (qualifier = **Plan / Playbook / Checklist / Standard / Spec** — no ad-hoc labels).

**Visible header to paste at the top of *every* doc:**

```md
**Official Title:** <Full Title>  
**Domain:** packages  
**File Name:** <kebab-main_Pascal-qualifier_YYYY-MM-DD.md>  
**Main Part:** <kebab-main>  
**Qualifier:** <Plan|Playbook|Checklist|Standard|Spec|Guide|…>  
**Date:** <YYYY-MM-DD or Evergreen>

**Spotlight Comments:**  
- <1–3 bullets of context>

**Summary:**  
<1–2 paragraphs explaining purpose & usage>
```

---

# What goes into each file type

* **Master plan** (`packages-phase-driven_Plan_YYYY-MM-DD.md`) — *this file*.
  The single **SSOT** with phase goals and acceptance criteria. Links to each phase’s **Playbook**/**Checklist**. A curated `README.md` sits beside it; folder indexes live in `_generated/index.json`.

* **Playbook (long)** — per phase (deep dive “how to” with steps, code stubs, tests, rollout).

* **Checklist (short)** — per phase (tight, pinned “working rules” + acceptance + commands).

* **Standards** — evergreen rules (schemas, file shapes, naming, pricing dialect, authoring).

* **Spec** — normative behavior/UX/SEO/routing specs referenced by phases (no tasks).

---

# OFFICIAL DIRECTORY TREE (authoritative)

```text
/tbh-next-site-build/documents/domains/packages
├── _generated
│   └── index.json
├── changelog.md
├── packages-phase-driven_Plan_2025-09-22.md
├── phases
│   ├── phase-00-baseline-guardrails
│   │   ├── _generated
│   │   │   └── index.json
│   │   ├── phase-00-baseline-guardrails_Checklist_2025-09-22.md
│   │   ├── phase-00-baseline-guardrails_Playbook_2025-09-22.md
│   │   └── README.md
│   ├── phase-01-ssot-and-facade
│   │   ├── _generated
│   │   │   └── index.json
│   │   ├── phase-01-ssot-and-facade_Checklist_2025-09-22.md
│   │   ├── phase-01-ssot-and-facade_Playbook_2025-09-22.md
│   │   └── README.md
│   ├── phase-02-content-mdx-and-security
│   │   ├── _generated
│   │   │   └── index.json
│   │   ├── phase-02-content-mdx-and-security_Checklist_2025-09-22.md
│   │   ├── phase-02-content-mdx-and-security_Playbook_2025-09-22.md
│   │   └── README.md
│   ├── phase-03-build-pipeline-and-artifacts
│   │   ├── _generated
│   │   │   └── index.json
│   │   ├── phase-03-build-pipeline-and-artifacts_Checklist_2025-09-22.md
│   │   ├── phase-03-build-pipeline-and-artifacts_Playbook_2025-09-22.md
│   │   └── README.md
│   ├── phase-04-app-router-hub-and-detail
│   │   ├── _generated
│   │   │   └── index.json
│   │   ├── phase-04-app-router-hub-and-detail_Checklist_2025-09-22.md
│   │   ├── phase-04-app-router-hub-and-detail_Playbook_2025-09-22.md
│   │   └── README.md
│   ├── phase-05-search-and-featured
│   │   ├── _generated
│   │   │   └── index.json
│   │   ├── phase-05-search-and-featured_Checklist_2025-09-22.md
│   │   ├── phase-05-search-and-featured_Playbook_2025-09-22.md
│   │   └── README.md
│   ├── phase-06-analytics-seo-schema
│   │   ├── _generated
│   │   │   └── index.json
│   │   ├── phase-06-analytics-seo-schema_Checklist_2025-09-22.md
│   │   ├── phase-06-analytics-seo-schema_Playbook_2025-09-22.md
│   │   └── README.md
│   ├── phase-07-docs-and-dx
│   │   ├── _generated
│   │   │   └── index.json
│   │   ├── phase-07-docs-and-dx_Checklist_2025-09-22.md
│   │   ├── phase-07-docs-and-dx_Playbook_2025-09-22.md
│   │   └── README.md
│   ├── phase-08-migration-and-cleanup
│   │   ├── _generated
│   │   │   └── index.json
│   │   ├── phase-08-migration-and-cleanup_Checklist_2025-09-22.md
│   │   ├── phase-08-migration-and-cleanup_Playbook_2025-09-22.md
│   │   └── README.md
│   └── phase-09-production-gates-and-release
│       ├── _generated
│       │   └── index.json
│       ├── phase-09-production-gates-and-release_Checklist_2025-09-22.md
│       ├── phase-09-production-gates-and-release_Playbook_2025-09-22.md
│       └── README.md
├── README.md
├── scripts
│   ├── _generated
│   │   └── index.json
│   ├── build-doc-index.ts
│   └── check-docs.ts
├── standards
│   ├── _generated
│   │   └── index.json
│   ├── catalog
│   │   ├── core-services-packages
│   │   │   ├── _generated
│   │   │   │   └── index.json
│   │   │   ├── content-production-services
│   │   │   │   ├── _generated
│   │   │   │   │   └── index.json
│   │   │   │   ├── content-production-services-add-ons.md
│   │   │   │   ├── content-production-services-bundles.md
│   │   │   │   ├── content-production-services-featured-packages.md
│   │   │   │   └── content-production-services-packages.md
│   │   │   ├── lead-generation-services
│   │   │   │   ├── _generated
│   │   │   │   │   └── index.json
│   │   │   │   ├── lead-generation-services-add-ons.md
│   │   │   │   ├── lead-generation-services-bundles.md
│   │   │   │   ├── lead-generation-services-featured-packages.md
│   │   │   │   └── lead-generation-services-packages.md
│   │   │   ├── marketing-services
│   │   │   │   ├── _generated
│   │   │   │   │   └── index.json
│   │   │   │   ├── marketing-services-add-ons.md
│   │   │   │   ├── marketing-services-bundles.md
│   │   │   │   ├── marketing-services-featured-packages.md
│   │   │   │   └── marketing-services-packages.md
│   │   │   ├── seo-services
│   │   │   │   ├── _generated
│   │   │   │   │   └── index.json
│   │   │   │   ├── seo-services-add-ons.md
│   │   │   │   ├── seo-services-bundles.md
│   │   │   │   ├── seo-services-featured-packages.md
│   │   │   │   └── seo-services-packages.md
│   │   │   ├── video-production-services
│   │   │   │   ├── _generated
│   │   │   │   │   └── index.json
│   │   │   │   ├── video-production-services-add-ons.md
│   │   │   │   ├── video-production-services-bundles.md
│   │   │   │   ├── video-production-services-featured-packages.md
│   │   │   │   └── video-production-services-packages.md
│   │   │   └── web-development-services
│   │   │       ├── _generated
│   │   │       │   └── index.json
│   │   │       ├── web-development-services-add-ons.md
│   │   │       ├── web-development-services-bundles.md
│   │   │       ├── web-development-services-featured-packages.md
│   │   │       └── web-development-services-packages.md
│   │   └── cross-service
│   │       ├── _generated
│   │       │   └── index.json
│   │       ├── cross-service-add-ons.md
│   │       ├── cross-service-bundles.md
│   │       └── cross-service-featured-packages.md
│   ├── data-conotent-pricing-rules.md
│   ├── packages-app-pages-layouts_Plan_2025-09-21.md
│   ├── Packages-Domain_App-Routing-Page-Layouts_Spec_2025-09-21.md
│   ├── Packages-Domain_Authoring-Implementation-Guide_Guide_2025-09-21.md
│   ├── Packages-Domain_Data-Content-Rules_Spec_2025-09-21.md
│   ├── Packages-Domain_Source-MD-Review-SSOT-Mapping_2025-09-21.md
│   └── README.md
└── templates
    ├── _generated
    │   └── index.json
    ├── phase-long_Playbook_Template.md
    └── phase-short_Checklist_Template.md
```

---

# Operating rules (apply to all phases)

* Pages are **thin controllers**; templates do presentation; components are presentational only (no IO/data reads).
* **No runtime MD/MDX parsing** (compile at build).
* All data flows through the façade `@/data/packages` (no deep imports).
* Generated artifacts under `src/data/packages/__generated__/` are **gitignored**.
* **npm** only; Node 20 LTS.
* Branching: feature slices off `feat/packages-refactor` → PRs into that branch → integration PR → `main`.

---

# Phases (contract: goals & acceptance)

> ⚠️ The detailed “how-to” for each lives in the matching **Playbook**/**Checklist** files under `phases/…`.

## Phase 00 — Baseline Guardrails & Repo Hygiene

**Goal**
Make the project safe to iterate: routing clarity, lint rails, naming, PR hygiene, CI skeleton.

**Acceptance**

* `next build` clean; lint/typecheck pass.
* No `@/data/**` imports inside `src/components/**`.
* PR template and baseline CI present and green.

---

## Phase 01 — SSOT Hardening & Façade

**Goal**
Normalize typed authoring and expose a single, stable read API to the app.

**Acceptance**

* TS authoring consistent (`types.ts`; service packages/add-ons; bundles).
* `src/data/packages/index.ts` facade exports `BUNDLES`, `getBundleBySlug`, `FEATURED_BUNDLE_SLUGS`, `getPackagesSearchIndex`.
* Unique IDs/slugs; references resolve; price keys normalized.

---

## Phase 02 — Content Authoring (MDX) & Security

**Goal**
Author bundle narratives in MDX; compile to sanitized HTML at build; keep prices/IDs in TS.

**Acceptance**

* `/src/content/packages/bundles/<slug>.mdx` with `slug` frontmatter.
* MDX compiled to HTML at build (no runtime parsing).
* Sanitization allowlist enforced.

---

## Phase 03 — Build Pipeline & Generated Artifacts

**Goal**
One-click data build that compiles MDX, enriches bundles, and emits deterministic artifacts.

**Acceptance**

* Scripts in `scripts/packages/**` produce:

  * `__generated__/bundles.enriched.json`
  * `__generated__/packages.search.json`
* `npm run data:ci` green locally & CI; idempotent outputs.

---

## Phase 04 — App Router Integration (Hub & Detail) + Templates

**Goal**
Implement `/packages` (hub) and `/packages/[bundles]` (detail) via templates; pages stay thin.

**Acceptance**

* Hub: instant search, filters, featured rails, card analytics, hub `ItemList` JSON-LD.
* Detail: compiled MDX rendered safely; sticky CTAs; resilient pricing; `Service` JSON-LD only when price exists.
* Correct metadata (canonical, OG/Twitter); plural segment `[bundles]`.

---

## Phase 05 — Search & Featured Rails

**Goal**
Instant discovery plus curated featured rails validated against SSOT.

**Acceptance**

* Search index supports fields: type/service/name/summary/tags/tier/price presence.
* Client debounce + empty states + A–Z/Recommended sort.
* Featured config validated by build (bad refs fail).

---

## Phase 06 — Analytics, SEO, Schema

**Goal**
Track user intent and keep search engines happy.

**Acceptance**

* Events for hub cards/CTAs and detail CTAs/add-ons (namespaced).
* Canonical/OG consistent; no duplicate titles.
* Rich Results tests pass (hub `ItemList`, detail `Service` when priced).

---

## Phase 07 — Docs & Developer Experience

**Goal**
Everything documented; fast onboarding; easy to extend.

**Acceptance**

* Standards doc(s) linked and current.
* Quick Start enables adding a new SKU end-to-end using docs only.

---

## Phase 08 — Migration & Cleanup

**Goal**
Remove legacy code and finalize the new structure.

**Acceptance**

* No runtime MD/MDX reads; no deep data imports in templates/components.
* Route naming consistent; no duplicate routes.
* `next build` remains clean.

---

## Phase 09 — Production Gates & Release

**Goal**
Enforce quality and ship safely.

**Acceptance**

* CI requires `data:ci`, lint, typecheck, build; all green on integration PR.
* Performance sanity OK; release notes captured.

---

# Command palette (for any slice)

```bash
# ensure you’re on the integration branch
git switch feat/packages-refactor && git pull --ff-only

# create a focused slice
git switch -c feat/packages-hub-page   # e.g., feat/packages-build-pipeline

# build/validate locally
npm run data:ci
npm run build
npm run dev

# commit & PR into integration branch
git add -A
git commit -m "feat(packages): <concise slice summary>"
git push -u origin HEAD
gh pr create --base feat/packages-refactor --head HEAD \
  --title "feat(packages): <slice>" \
  --body "Implements Phase XX tasks; includes acceptance proof."
```

---

# References

* **Standards (canonical):** `documents/domains/packages/standards/*`
  Keep schemas, naming, authoring rules, price normalization, routing/page layout specs here. Phases must link here and must not re-define standards.

---

*This plan replaces earlier overlapping lists by unifying **what to do** (phases + acceptance) while delegating **how to do it** to per-phase Playbooks/Checklists stored under `phases/…`.*

---

**End of master plan (SSOT).**

---

Cite: this update supersedes the prior “unified plan” draft you shared.&#x20;
