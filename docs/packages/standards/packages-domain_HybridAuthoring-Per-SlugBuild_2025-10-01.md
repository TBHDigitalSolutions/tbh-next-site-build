title: "Packages Domain — Hybrid Authoring & Per-Slug Build"
domain: "packages"
file: "packages-domain_HybridAuthoring-Per-SlugBuild_2025-10-01.md"
main: "packages-domain"
qualifier: "Hybrid Authoring & Per-Slug Build"
date: "2025-10-01"
time: 12:02pm
status: "Approved"
owners: ["@yourname"]
tags: ["packages","authoring","mdx","external-json","internal-json","build","index","normalization","pricing","ci"]
spotlight:
  - "Per-package authoring with MDX + small JSONs; build emits one generated JSON per slug"
  - "Tiny index.json powers hubs/search; eliminates the 'one big JSON' anti-pattern"
  - "Runtime stays typed and unchanged: base.ts imports generated JSON → mappers → UI"
  - "Pricing policy supports internal.json as SSOT or strict frontmatter; no price prose in MDX"
  - "Narrative compiled to sanitized HTML (overview/purpose/faq/notes) and normalized includes/extras"
  - "CI gates enforce schemas, slug uniqueness, includes requirement, and adapter smoke tests"
summary: "Official, copy-ready guidance for a hybrid Packages domain that scales to 100+ packages: author per package (MDX + small JSONs), generate one normalized external JSON per slug plus a tiny index.json, keep typed runtime ergonomics unchanged, and enforce pricing and content safety via schemas, sanitization, and CI."
links:
  related: []

-----
10-01-2025 | 12:02pm
---
Got it — here’s the **official, copy-ready documentation** for the **hybrid** packages domain. It makes the model crystal clear and permanently fixes the “one big JSON” problem.

---

# Packages Domain — Hybrid Authoring & Per-Slug Build

**Goal:** let content teams author **per-package** (MDX + small JSONs) while the build writes **one generated JSON per package** *plus* a tiny **index.json** for hubs/search. The app keeps importing a **typed `base`** object exactly like today — the only change is that `base` is **generated** from MDX + JSON.

---

## 0) Glossary (use these names consistently)

* **Authored MDX** (`public.mdx`) — narrative only (Overview, Purpose, FAQ, Notes). No pricing prose.
* **Authored External JSON** (`external.json`) — structured, public fields (outcomes, includes, price band copy, extras, cross-sell, etc.). May include price if policy allows.
* **Authored Internal JSON** (`internal.json`) — tiers/ops/pricing notes; never shipped.
* **Generated External JSON** (`<slug>.external.json`) — normalized, per-slug artifact the app consumes.
* **Index JSON** (`index.json`) — tiny catalog (id, slug, summary, tags, service, hasPrice) for hub routes.
* **Typed Base** (`base.ts`) — exports the generated object with the existing app types.

---

## 1) Authoring layout (one folder per package)

```
documents/
  domains/
    packages/
      catalog/
        smartdaw-strategic-flow/           # ← slug (must be unique)
          public.mdx                       # narrative (no pricing prose)
          external.json                    # public, structured fields
          internal.json                    # internal tiers/ops (never shipped)
          assets/                          # images, diagrams (optional)

        lead-routing-distribution/
          public.mdx
          external.json
          internal.json
          assets/

        ... (repeat up to 100+)
```

**Naming rules**

* Folder name **is the slug** (CI enforces uniqueness).
* Keep **pricing prose out of MDX**. Pricing is structured (`price`) or pulled from `internal.json`.
* Prefer short lists (3–7 bullets) in authored JSON; long prose goes in MDX.

---

## 2) Build outputs (per-slug + tiny index)

```
src/data/packages/__generated__/
  packages/
    smartdaw-strategic-flow.external.json
    lead-routing-distribution.external.json
    … (one file per package)

  index.json      # array of { id, slug, service, tags, summary, hasPrice }
  search.json     # (optional) minisearch index for hubs
```

**Key guarantee:** every package produces **its own** `packages/<slug>.external.json`.
This permanently fixes the “one big JSON” problem.

---

## 3) Data flow (hybrid model at a glance)

**Authoring → Build → Runtime**

1. **Authoring (per slug)**

   * `public.mdx` → Overview/Purpose/FAQ/Notes
   * `external.json` → outcomes, includes, priceBand, extras, cross-sell, tags, seo…
   * `internal.json` → tiers, ops, canonical price (optional if you allow price in external)

2. **Build (per slug)**

   * Compile `public.mdx` → `narrative.{overviewHtml,purposeHtml,faqHtml,notesHtml}`
   * Load `external.json` (+ strict schema)
   * Optionally load `internal.json` and **copy canonical price** into the public shape
   * **Normalize** to the app’s structure
   * **Write** `packages/<slug>.external.json`
   * **Append** minimal metadata to `index.json`

3. **Runtime (unchanged developer ergonomics)**

   * `src/packages/registry/<slug>/base.ts` imports the generated JSON and exports it **typed**
   * `details.ts` & `card.ts` call existing mappers → PDO/Card props
   * `PackagesDetailTemplate` + `PackageDetailOverview` render as before

---

## 4) Authoring contracts (what authors put where)

### `public.mdx` (narrative only)

Headings map to narrative HTML:

* `## Overview` → `narrative.overviewHtml`
* `## Purpose` → `narrative.purposeHtml`
* `## FAQ` → `narrative.faqHtml` (supports accordions/`<details>`)
* `## Notes` → `narrative.notesHtml`

**Do not** include currency strings or “starting at …” prose here.

### `external.json` (public structured fields)

Minimal but powerful. Example:

```json
{
  "id": "pkg_smartdaw",
  "slug": "smartdaw-strategic-flow",
  "service": "lead-generation",
  "category": "Go-To-Market",
  "tags": ["ICP", "routing", "playbooks"],
  "name": "SmartDAW Strategic Flow",
  "summary": "Turn raw demand into repeatable revenue motions.",
  "tagline": "Two-week go-live.",
  "seo": { "title": "SmartDAW Strategic Flow", "description": "From ad to won…" },

  "outcomes": [
    "Defined ICP segments with scoring rubric",
    "Routing rules live in CRM",
    "Baseline funnel reporting"
  ],
  "features": ["Scoring rubric", "Routing rules", "Playbooks"],

  "includesGroups": [
    { "title": "Discovery & Design", "items": ["ICP workshop", "Current flow audit", "Scoring rubric"] },
    { "title": "Build & Enablement", "items": ["Routing rules", "Sales playbooks", "Handoff SLAs"] }
  ],
  "includesTable": {
    "title": "What’s included",
    "caption": "Scope",
    "rows": ["ICP rubric", "Routing rules", "Playbooks", "Dashboards"]
  },

  "price": { "monthly": { "amount": 6000, "currency": "USD" } },   // optional if policy allows
  "priceBand": {
    "label": "Starting at",
    "note": "Core scope for one ICP",
    "finePrint": "Admin access required",
    "ctas": [{ "kind": "primary", "label": "Book intro call", "href": "/contact" }]
  },

  "extras": {
    "timelineBlocks": [{ "title": "Week 1", "description": "Workshop, audit, rubric" },
                       { "title": "Week 2", "description": "Routing build, enablement, dashboards" }],
    "requirements": ["CRM admin access", "UTM tracking set up"],
    "ethics": ["Consent-based data use"]
  },

  "crossSell": [{ "slug": "lead-scoring", "label": "Lead Scoring" }],
  "addOns": [{ "slug": "data-cleanup", "label": "Data Cleanup" }]
}
```

> **Pricing policy:** either keep price here **or** omit it and let the build copy a canonical tier price from `internal.json`. Pick one policy org-wide.

### `internal.json` (never shipped)

Holds tiers/ops/canonical price, e.g.:

```json
{
  "sku": "PKG-SDAW-STRATFLOW",
  "tiers": [
    {
      "name": "Core",
      "bestFor": ["Single ICP"],
      "includes": ["ICP workshop", "Routing rules", "Playbooks", "Dashboard"],
      "price": { "monthly": { "amount": 6000, "currency": "USD" } },
      "is_public": true
    }
  ],
  "ops": {
    "leadTimeDays": 14,
    "staffing": [{ "role": "GTM Strategist", "allocationPct": 50 }, { "role": "CRM", "allocationPct": 50 }]
  }
}
```

---

## 5) Generated External JSON (runtime contract)

> Path: `src/data/packages/__generated__/packages/<slug>.external.json`
> This is what `base.ts` imports. It’s normalized and includes `narrative.*Html`.

Key shape (abridged):

```ts
type Money = { amount: number; currency: "USD" };
type Price = { monthly?: Money; oneTime?: Money };
type CTA = { kind: "primary"|"secondary"; label: string; href?: string; ariaLabel?: string };

type GeneratedExternal = {
  // mirrors for legacy base.ts imports
  id: string; slug: string; service: string;
  name?: string; summary: string; tagline?: string;

  // authored fields
  category?: string; tags?: string[]; seo?: { title?: string; description?: string };
  outcomes?: string[]; features?: string[];
  includesGroups?: Array<{ title: string; items: string[] }>;
  includesTable?: { title?: string; caption?: string; rows: string[] };

  // narrative from MDX
  narrative?: { overviewHtml?: string; purposeHtml?: string; faqHtml?: string; notesHtml?: string };

  // pricing
  price?: Price;
  priceBand?: { label?: string; note?: string; finePrint?: string; ctas?: CTA[] };

  // extras & rails
  extras?: { timelineBlocks?: Array<{ title: string; description: string }>; requirements?: string[]; ethics?: string[] };
  crossSell?: Array<{ slug: string; label: string }>;
  addOns?: Array<{ slug: string; label: string }>;

  // optional future tiers (public-safe copy)
  internal_tiers?: Array<{
    name: string; best_for?: string; problem_solved?: string;
    includes?: string[]; price: Price; is_public?: boolean;
  }>;
  ui?: { showTieredPricing?: boolean };
};
```

Normalization the build guarantees:

* `what_you_get.includes[].{group_name,bullets[]}` → `includesGroups[].{title,items[]}`
* `details.timeline.{setup,launch,ongoing}` → `extras.timelineBlocks[]`
* MDX → `narrative.*Html` (sanitized)

---

## 6) Next.js wiring (unchanged)

**Per-slug pages**

* `generateStaticParams()` reads `__generated__/index.json`
* Detail route `/packages/[slug]` loads the **per-slug** file or uses `details.ts` wrapper.

**Registry files (unchanged shape)**

```ts
// src/packages/registry/<slug>/base.ts
import generated from "@/data/packages/__generated__/packages/<slug>.external.json";
import type { PackageAuthoringBase } from "@/packages/lib/registry/types";
export const base: PackageAuthoringBase = generated;

// src/packages/registry/<slug>/details.ts
import { base } from "./base";
import { buildPackageDetailOverviewProps } from "@/packages/lib/registry/mappers";
export default buildPackageDetailOverviewProps(base);
```

---

## 7) Build script (per-slug, never aggregate detail pages)

High-level algorithm:

1. Discover slug folders under `documents/domains/packages/catal​og/*`.
2. Read `external.json` (validate), `public.mdx` (compile to narrative HTML), and optional `internal.json`.
3. Resolve `price`:

   * **Policy A (recommended):** copy canonical tier price from internal.
   * **Policy B:** trust `external.json.price` (strict shape).
4. Normalize → **Generated External JSON**.
5. **Write** `src/data/packages/__generated__/packages/<slug>.external.json`.
6. Append `id, slug, service, tags, summary, hasPrice` to `__generated__/index.json`.

**Common mistakes that cause “one big JSON”:**

* Writing all packages to the **same** file path.
* Rendering detail pages from a **single aggregated** catalog file.
* Not enforcing **unique slugs**.

**Fix:** always write to `packages/<slug>.external.json` and keep index.json tiny.

---

## 8) CI rules (safety at 100+ packages)

* **Per-slug presence:** each folder must produce `packages/<slug>.external.json`.
* **Slug uniqueness:** compare folder names and `external.slug`.
* **Schema validation:** authored `external.json`, optional `internal.json`, and final generated JSON.
* **Narrative guardrails:** block price prose in `public.mdx` if using Policy A.
* **Includes requirement:** at least one of `includesGroups` or `includesTable`.
* **Adapter smoke test:** pipe each generated JSON through existing mappers → render a PDO smoke component (no runtime errors).
* **Parity check (optional):** `count(slug folders) === count(generated files)`.

---

## 9) Pricing policies (pick one org-wide)

* **Policy A — prefer internal (recommended):**
  `internal.json` holds canonical price. Build copies one tier’s `price` into the generated JSON.
  Pros: safer, aligns with tiers/ops, avoids accidental price edits.

* **Policy B — allow price in external:**
  Authors may put `price` in `external.json` (strict `Price` shape). Build validates.
  Pros: simpler authoring for fixed-price packages.

> Regardless of policy, customer-facing phrasing (“Starting at…”) is derived in `PriceActionsBand` from structured `price` + `priceBand`. Authors should not write ad-hoc price prose.

---

## 10) Author & reviewer checklists

**Author (per slug)**

* Folder = slug ✔
* `public.mdx` has Overview/Purpose/FAQ/Notes ✔
* `external.json` includes outcomes + includes (groups or table) + priceBand copy ✔
* If Policy A: no price prose in MDX; keep price out of external ✔
* If Policy B: price is strict object (no strings) ✔

**Reviewer / CI**

* Generated: `packages/<slug>.external.json` exists ✔
* `index.json` updated ✔
* Schema validation passes ✔
* PDO smoke render passes ✔
* Slug uniqueness holds ✔

---

## 11) SmartDAW mini example (end-to-end)

**Authored**

* `documents/.../smartdaw-strategic-flow/public.mdx` → body prose
* `documents/.../smartdaw-strategic-flow/external.json` → structured fields (no price if Policy A)
* `documents/.../smartdaw-strategic-flow/internal.json` → tiers (Core monthly $6k)

**Generated**

* `src/data/packages/__generated__/packages/smartdaw-strategic-flow.external.json`
  → normalized; includes `narrative.*Html`; includes `price` (copied from internal or taken from external).

**Runtime**

* `src/packages/registry/smartdaw-strategic-flow/base.ts` imports the generated file and exports it typed.

---

## 12) FAQ

**Q: Why do we keep both an authored `external.json` and a generated `<slug>.external.json`?**
A: Authored external is the public **source** (human-friendly, close to content). The generated external is the **runtime contract** (normalized, narrative attached, safe to import, cacheable). It also preserves a snapshot of narrative HTML for build artifacts.

**Q: Can we skip authored `external.json` and put everything in MDX?**
A: You can, but we strongly prefer using `external.json` for structured lists (outcomes, includes, CTAs, extras). MDX remains best for prose.

**Q: How do we show tiered pricing?**
A: Keep tiers in `internal.json`. When `ui.showTieredPricing` is enabled and at least one tier has `is_public: true`, render your future `TieredPricingTable`. Until then, `PriceActionsBand` is the only public price surface.

---

### Bottom line

* **Author per package** (MDX + small JSONs).
* **Build per package** (write one `<slug>.external.json` + tiny `index.json`).
* **Runtime unchanged** (typed `base` per slug, existing mappers & templates).

This is the hybrid that scales from **2 → 100+ packages** with clean authorship, strict types, and zero risk of the “one big JSON” trap.
