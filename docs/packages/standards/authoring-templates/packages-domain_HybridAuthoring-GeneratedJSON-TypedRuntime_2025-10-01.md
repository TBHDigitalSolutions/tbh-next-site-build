title: "Packages Domain — Hybrid Authoring → Generated JSON → Typed Runtime"
domain: "packages"
file: "packages-domain_HybridAuthoring-GeneratedJSON-TypedRuntime_2025-10-01.md"
main: "packages-domain"
qualifier: "Hybrid Model Guide"
date: "2025-10-01"
time: 12:26pm
status: "Approved"
owners: ["@yourname"]
tags: ["packages","hybrid","mdx","external-json","internal-json","generated-json","typed-runtime","pdo","nextjs","ci"]
spotlight:
  - "Authoring SSOT per package: public.mdx (narrative) + external.json (public structured) + internal.json (tiers/ops)"
  - "Build outputs one per-slug <slug>.external.json plus a tiny index.json for hubs/search"
  - "Runtime stays typed: base.ts imports the generated JSON; existing mappers/PDO unchanged"
  - "Default pricing policy: copy canonical price from internal.json (Mode A); Mode B optional via strict price"
  - "MDX contains no pricing prose; CI lints & Zod validates authored and generated JSON"
  - "Eliminates the 'one big JSON' anti-pattern by enforcing per-slug generation"
summary: "Production-ready, single-source guide to the hybrid packages model: author narrative in MDX and structured fields in JSON, generate one external JSON per slug plus a small index for hubs, and keep the runtime typed and unchanged. Sets pricing policy (Mode A by default), disallows pricing prose in MDX, details build/validation/CI gates, and documents adapters and routing so this scales cleanly from a few to 100+ packages."
links:
  related:
    - "./packages-externaljson_TemplateAndReference_2025-10-01.md"
    - "./packages-domain_GoldenSample-And-CanonicalSchema_2025-10-01.md"
    - "./packages-mdx_PublicTemplate_2025-10-01.md"
    - "./packages-seed-frontmatter_Guide_2025-10-01.md"

---
10-01-2025 | 12:026pm
---
Awesome — I reviewed your plan end-to-end and tightened it into a **production-ready, single document** that makes the **hybrid** model crystal clear and permanently fixes the “one big JSON” problem. This is copy-pasteable into your repo (e.g., `documents/domains/packages/README.md`) and is aligned with your current codebase (typed `base.ts`, PDO, mappers, Next.js).

---

# Packages Domain — Hybrid Authoring → Generated JSON → Typed Runtime

## Executive decisions

* **Authoring SSOT (per package):**
  `public.mdx` (narrative only) **+** `external.json` (structured public fields) **+** `internal.json` (tiers/ops/pricing; never shipped).
* **Build outputs:**
  **One** `packages/<slug>.external.json` per package **+** a tiny `index.json` (for hubs/search).
* **Runtime SSOT (unchanged):**
  Each detail route still imports a **typed `base` object** from `base.ts`. That `base` **is generated** from MDX + JSON.
* **Pricing policy (default):**
  Keep price out of MDX; source canonical `price` from `internal.json` (Mode A).
  Optional, per-package **Mode B**: allow strict `price` in frontmatter (guarded by config).

---

## 1) Authoring layout (scale from 2 → 100)

```
docs/
  packages/
    catalog/
      <service>/<subservice?>/<slug>/
        public.mdx        # narrative only; no pricing prose
        external.json     # structured public fields (the contract)
        internal.json     # tiers/ops/pricing; never shipped
        assets/           # images, diagrams (optional)
```

**Rules**

* Folder name **is the slug** (kebab-case). CI enforces uniqueness.
* `<subservice>` is **optional**. Use it when meaningful. Multi-classify via frontmatter arrays, not multiple folder copies.
* **No price prose in MDX**. All customer-facing price text is derived from structured data via `band.ts`.

---

## 2) Authoring contracts (what writers/editors touch)

### 2.1 `public.mdx` (narrative only)

**Body headings → narrative HTML on build**

* `## Overview` → `narrative.overviewHtml`
* `## Purpose`  → `narrative.purposeHtml`
* `## FAQ`      → `narrative.faqHtml`
* `## Notes`    → `narrative.notesHtml`

> Keep **all** pricing out of MDX. CI will lint for currency patterns.

### 2.2 `external.json` (structured public fields)

Minimal, stable schema (authored by you):

```jsonc
{
  "id": "pkg_smartdaw",
  "slug": "smartdaw-strategic-flow",
  "service": "lead-generation",
  "category": "Go-To-Market",
  "tags": ["ICP", "routing", "playbooks"],

  "summary": "Turn raw demand into repeatable revenue motions.",
  "tagline": "Two-week go-live.",
  "seo": { "title": "SmartDAW", "description": "From ad to won…" },

  "outcomes": ["Defined ICP", "Routing live", "Baseline reporting"],
  "features": ["Scoring rubric", "Routing rules", "Playbooks"],

  "includesGroups": [
    { "title": "Discovery & Design", "items": ["ICP workshop", "Audit"] },
    { "title": "Build & Enablement", "items": ["Routing rules", "Playbooks"] }
  ],
  "includesTable": { "title": "What’s included", "caption": "Scope", "rows": ["ICP rubric", "Playbooks"] },

  // price OPTIONAL here (hybrid). Build may copy canonical price from internal.json.
  // "price": { "monthly": { "amount": 6000, "currency": "USD" } },

  "priceBand": {
    "label": "Starting at",
    "note": "Core scope for one ICP",
    "finePrint": "Admin access required",
    "ctas": [{ "kind": "primary", "label": "Book intro call", "href": "/contact" }]
  },

  // narrative.*Html is attached by the build from public.mdx
  "narrative": {},

  "extras": {
    "timelineBlocks": [{ "title": "Week 1", "description": "Workshop" }],
    "requirements": ["CRM admin access"],
    "ethics": ["No deceptive outreach"]
  },

  "crossSell": [{ "slug": "lead-scoring", "label": "Lead Scoring" }],
  "addOns": [{ "slug": "data-cleanup", "label": "Data Cleanup" }]
}
```

### 2.3 `internal.json` (authoritative tiers/ops; never shipped)

```jsonc
{
  "sku": "PKG-SDAW-STRATFLOW",
  "owner": "@owner",
  "tiers": [
    {
      "name": "Core",
      "bestFor": ["Single ICP"],
      "includes": ["ICP workshop", "Routing rules", "Playbooks"],
      "price": { "monthly": { "amount": 6000, "currency": "USD" } },
      "grossMarginTarget": 0.65
    }
  ],
  "ops": {
    "leadTimeDays": 14,
    "staffing": [
      { "role": "Strategist", "allocationPct": 50 },
      { "role": "MarTech/CRM", "allocationPct": 50 }
    ],
    "constraints": ["No data exfiltration"]
  }
}
```

---

## 3) Build outputs (generated — do not edit)

```
src/data/packages/__generated__/
  packages/
    <slug>.external.json     # runtime JSON per package (MDX + external.json [+ internal price])
  index.json                 # tiny list for hubs/search (id, slug, service, tags, summary, hasPrice)
  search.json                # optional minisearch index
```

> **Fix for “one big JSON”:** detail pages **only** import their package’s JSON file. Hubs read `index.json` (and optionally `search.json`).

---

## 4) Runtime wiring (unchanged developer ergonomics)

```ts
// src/packages/registry/<service>/<slug>/base.ts
import generated from "@/data/packages/__generated__/packages/<slug>.external.json";
import type { PackageAuthoringBase } from "@/packages/lib/registry/types";
export const base: PackageAuthoringBase = generated;

// src/packages/registry/<service>/<slug>/details.ts
import { base } from "./base";
import { buildPackageDetailOverviewProps } from "@/packages/lib/registry/mappers";
export default buildPackageDetailOverviewProps(base);

// src/packages/registry/<service>/<slug>/card.ts
import { base } from "./base";
import { buildDefaultCard } from "@/packages/lib/registry/mappers";
export default buildDefaultCard(base);
```

Policy stays centralized in `pricing.ts`, `band.ts`, `copy.ts`, `registry/mappers.ts`.

---

## 5) Pricing modes (project-level)

* **Mode A (default, recommended):** copy canonical `price` from `internal.json` → generated external JSON.
* **Mode B (opt-in per package):** allow strict `price` in MDX frontmatter or `external.json`.
  Conflict resolution: `pricingSource: "internal" | "frontmatter" | "prefer-internal"` (recommend **prefer-internal**).

Band phrasing always derives from `price + priceBand` via `band.ts`. Writers never author currency prose.

---

## 6) Next.js pages & routing

* `/packages/[slug]` uses `index.json` for `generateStaticParams()` and imports **that slug’s** JSON.
* Hubs (`/marketing-packages`) filter `index.json` by `service`. Optional L3 hubs filter by `subservice`.

---

## 7) Validation & CI (no drift)

* **Zod schemas** validate authored `external.json` and `internal.json` on every PR.
  (Use the validator CLI you added: `npm run validate:authoring`.)
* **Generated JSON** can also be validated post-build (`npm run validate:generated`).
* **MDX lints**: fail if price-like patterns (`$`, `USD`, `€`, `£`) appear in body.
* **CI gates**: per-slug output exists, slug matches folder name, includes present (groups or table), price shape valid when present, `status: Approved` required for production.

---

## 8) Adapter: External JSON → PDO props

Your single adapter stays:

```ts
export function toPackageDetailOverviewProps(pkg: ExternalPackage): PackageDetailOverviewProps {
  return {
    id: pkg.id,
    title: pkg.name ?? pkg.slug, // allow fallback
    tagline: pkg.tagline,
    meta: { category: pkg.category, tags: pkg.tags ?? [] },
    descriptionHtml: pkg.narrative?.overviewHtml,
    outcomes: pkg.outcomes ?? [],
    includes: {
      groups: pkg.includesGroups,
      table: pkg.includesTable
        ? { ...pkg.includesTable, title: pkg.includesTable.title ?? "What’s included" }
        : undefined
    },
    notesHtml: pkg.narrative?.notesHtml,
    priceBand: pkg.priceBand && {
      price: pkg.priceBand.price,
      label: pkg.priceBand.label,
      note: pkg.priceBand.note,
      finePrint: pkg.priceBand.finePrint,
      ctas: pkg.priceBand.ctas ?? []
    },
    sticky: { summary: pkg.sticky?.summary },
    extras: pkg.extras && {
      timelineBlocks: pkg.extras.timelineBlocks,
      ethics: pkg.extras.ethics,
      requirements: pkg.extras.requirements
    },
    faqHtml: pkg.narrative?.faqHtml,
    crossSell: pkg.crossSell
  };
}
```

---

## 9) Golden sample pair (SmartDAW)

Use the **golden** examples you prepared:

* `documents/domains/packages/golden/public/smartdaw.external.json`
* `documents/domains/packages/golden/public/smartdaw.public.mdx`
* `documents/domains/packages/golden/internal/smartdaw.internal.json`

Contract test (`tests/smartdaw.contract.spec.ts`) asserts:

* schemas pass,
* adapter returns valid `PackageDetailOverviewProps`,
* PDO renders without error (smoke).

---

## 10) Build pipeline (concise spec)

For each `<slug>`:

1. Read `external.json` (validate) + `public.mdx` (compile sections to safe HTML).
2. (If Mode A) Read `internal.json` (validate) and copy canonical tier `price` → external.
3. Attach `narrative.*Html` from MDX, normalize includes, compute derived flags.
4. Write `src/data/packages/__generated__/packages/<slug>.external.json`.
5. Update `index.json` with `{ id, slug, service, category, tags, summary, hasPrice }`.
6. (Optional) update `search.json`.

Pitfalls avoided:

* Never aggregate detail data into one file. Each page always reads **its** `<slug>.external.json`.
* Ensure slugs are unique: folder name === `external.slug`.

---

## 11) Authoring workflow (repeatable)

1. `mkdir -p docs/packages/catalog/<service>/<subservice?>/<slug>/`
2. Add `public.mdx`, `external.json`, (optional) `internal.json`.
3. Run seed helper (optional): `npx -y tsx scripts/seed-frontmatter.ts <path to service>`
4. Validate: `npm run validate:authoring`
5. Build generated JSON: `npm run build:packages`
6. View: `/packages/<slug>` & `/[service]-packages` (hub)
7. Ship (CI gates pass)

---

## 12) Acceptance criteria (definition of done)

* Authoring: MDX has required headings; no price prose; JSON files pass Zod.
* Build: per-slug JSON emitted; `index.json` updated; optional search index built.
* Runtime: detail page renders with PDO; hubs list via `index.json`.
* CI: seed/validate steps pass; no slug mismatches; no missing includes; price policy enforced.

---

## 13) Quick FAQ

**Q. Why both `external.json` and `public.mdx`?**
A. Writers need narrative freedom (MDX) and structured fields (JSON). Build glues them: `narrative.*Html` + structured `external.json` (+ optional internal price).

**Q. Where do CTAs live?**
A. In `priceBand.ctas` (structured). The band/CTA copy policy lives in `band.ts`/`copy.ts`.

**Q. Can we expose tiers publicly later?**
A. Yes. Copy `internal.tiers` into generated JSON when `ui.showTieredPricing` is true. Render a TieredPricingTable under PriceActionsBand.

---

## 14) Commands & Scripts (recommended package.json)

```json
{
  "scripts": {
    "seed:leadgen": "tsx scripts/seed-frontmatter.ts docs/packages/catalog/lead-generation",
    "build:packages": "tsx scripts/build-packages.ts",
    "validate:authoring": "tsx scripts/validate-authoring.ts docs/packages/catalog",
    "validate:generated": "tsx scripts/validate-generated.ts",
    "prebuild": "npm run validate:authoring && npm run build:packages"
  }
}
```

GitHub Actions (`.github/workflows/packages.yml`) should run:

1. `validate:authoring` on PR,
2. `build:packages`,
3. `validate:generated`.

---

### Bottom line

* **Hybrid authoring** (MDX + small JSONs) keeps writers fast and data clean.
* The build writes **one JSON per package** (fixes “one big JSON”), plus a tiny **index.json**.
* **Runtime stays typed** (`base.ts` → mappers → PDO).
* CI & Zod validators keep everything aligned at 100+ packages.

If you want, I can also include a short **author handbook** page (tone/style rules, do’s/don’ts) to sit next to this doc so marketing can run with it independently.
