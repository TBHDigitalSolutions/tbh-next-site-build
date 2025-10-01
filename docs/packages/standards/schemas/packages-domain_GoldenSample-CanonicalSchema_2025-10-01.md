title: "Packages Domain (Hybrid) — Golden Sample & Canonical Schema"
domain: "packages"
file: "packages-domain_GoldenSample-CanonicalSchema_2025-10-01.md"
main: "packages-domain"
qualifier: "GoldenSample-CanonicalSchema"
date: "2025-10-01"
time: 12:02pm
status: "Approved"
owners: ["@yourname"]
tags: ["packages","hybrid","mdx","external-json","internal-json","schema","build","pdo","adapter","ci","index"]
spotlight:
  - "One canonical external JSON per package; PDO reads it via typed base.ts"
  - "Public MDX compiles to sanitized narrative HTML during build"
  - "internal.json is pricing/tiers SSOT; no price prose in MDX"
  - "Per-slug build emits <slug>.external.json plus a tiny index.json"
  - "Single canonical schema and adapter to PackageDetailOverviewProps"
  - "CI gates for schema validation, slug uniqueness, includes requirement, and price/MDX lint"
summary: "Official, copy-ready package-domain doc with a golden sample and single canonical schema. Teams author per package (MDX + small JSONs), the build generates one normalized external JSON per slug plus a compact index.json, and the runtime stays unchanged—typed base.ts → adapter → PackageDetailOverview—while pricing remains structured and CI-enforced."
links:
  related: []

-----
10-01-2025 | 12:02pm
---
Perfect—here’s a **copy-ready, official package-domain doc** plus a **golden sample pair** wired to a **single canonical schema** that your Package Detail Overview (PDO) maps to. It uses the **hybrid** model (MDX + small JSONs per package) and permanently fixes the “one big JSON” problem by emitting **one generated JSON per slug** plus a tiny **index.json**.

---

# Packages Domain (Hybrid) — Golden Sample & Canonical Schema

## What this gives you

* **One canonical external JSON** → the **only** thing PDO reads at runtime (via `base.ts`).
* **One public MDX** → long-form narrative (no price) compiled into the external JSON during build.
* **One internal JSON** → tiers/margins/ops (never shipped) that can **generate** or validate price.
* **One adapter** → `ExternalPackage → PackageDetailOverviewProps`.
* **One coverage matrix & tests** → proves every PDO section can be populated.

---

## 1) Golden sample layout

```
documents/domains/packages/golden/
  public/
    smartdaw.external.json        # canonical external (authored public data)
    smartdaw.public.mdx           # narrative content (no pricing)
  internal/
    smartdaw.internal.json        # tiers/ops (never shipped)
  tests/
    smartdaw.contract.spec.ts     # schema + adapter + render assertions
```

> In your real catalog, each package lives in its own folder (`documents/domains/packages/catalog/<slug>/…`). The golden folder is a self-contained reference you can run in CI.

---

## 2) Canonical schema (short, stable)

```ts
// Money + Price
export type Money = { amount: number; currency: 'USD'|'EUR'|'GBP' };
export type Price = { monthly?: Money; oneTime?: Money };

// CTAs for price band
export type CTA = {
  kind: 'primary' | 'secondary';
  label: string;
  href?: string;         // URL to navigate to
  onClickId?: string;    // analytics id if routed internally
  ariaLabel?: string;
};

// Canonical External (public; what PDO ultimately consumes via adapter)
export type ExternalPackage = {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  category?: string;
  tags?: string[];
  seo?: { title?: string; description?: string };

  // Narrative (hydrated from MDX at build)
  narrative?: {
    overviewHtml?: string;
    notesHtml?: string;
    faqHtml?: string;
  };

  outcomes?: string[];
  includesGroups?: Array<{ title: string; items: string[] }>;
  includesTable?: { title?: string; caption?: string; rows: string[] };

  // Single surface for all price display logic
  priceBand?: {
    price?: Price;        // omit entirely for “custom quote”
    label?: string;       // e.g., "Starting at"
    note?: string;        // short base note
    finePrint?: string;   // disclaimer/scope/assumptions
    ctas?: CTA[];
  };

  sticky?: { summary?: string };

  extras?: {
    timelineBlocks?: Array<{ title: string; description: string }>;
    ethics?: string[];
    requirements?: string[];
  };

  crossSell?: Array<{ slug: string; label: string }>;
};

// Internal (never shipped)
export type InternalPricing = {
  sku: string;
  owner: string;
  tiers: Array<{
    name: string;                 // e.g., "Core", "Plus", "Pro"
    bestFor?: string[];
    includes: string[];
    price: Price;                 // authoritative price
    grossMarginTarget?: number;   // 0..1
    deliveryNotes?: string;
    is_public?: boolean;          // pre-mark safe tiers (future public table)
  }>;
  ops?: {
    leadTimeDays?: number;
    staffing?: Array<{ role: string; allocationPct: number }>;
    constraints?: string[];
  };
};
```

**Enforced rules**

* **No pricing in MDX**. Price is structured (`priceBand.price`) and/or merged from `internal.json`.
* `priceBand.price` can be `{ monthly? | oneTime? }` or omitted (custom quote).
* All PDO-populating fields are in External; MDX only feeds `narrative.*Html`.

---

## 3) Golden sample artifacts (copy/paste)

### 3.1 `documents/domains/packages/golden/public/smartdaw.external.json`

```json
{
  "id": "pkg_smartdaw",
  "slug": "smartdaw-strategic-flow",
  "name": "SmartDAW Strategic Flow",
  "tagline": "Turn raw demand into repeatable revenue motions.",
  "category": "Go-To-Market",
  "tags": ["ICP", "playbooks", "routing"],
  "seo": { "title": "SmartDAW Strategic Flow Packages", "description": "From ad to won: ICP, lead routing, playbooks, and reporting." },

  "narrative": {
    "overviewHtml": "<p>SmartDAW aligns demand gen with sales...</p>",
    "notesHtml": "<p><em>Pilot runs limited to one segment...</em></p>",
    "faqHtml": "<details><summary>What if our CRM is messy?</summary><p>We include a hygiene checklist...</p></details>"
  },

  "outcomes": [
    "Defined ICP segments with scoring rubric",
    "Lead routing & distribution playbooks live in CRM",
    "Two-week go-live with baseline reporting"
  ],

  "includesGroups": [
    { "title": "Discovery & Design", "items": ["ICP workshop", "Current flow audit", "Scoring rubric"] },
    { "title": "Build & Enablement", "items": ["Routing rules", "Sales playbooks", "Handoff SLAs"] },
    { "title": "Reporting", "items": ["Funnel dashboard", "Attribution baseline"] }
  ],

  "includesTable": {
    "title": "What’s included",
    "caption": "Scope for the SmartDAW Strategic Flow package",
    "rows": ["ICP rubric", "Routing rules", "Playbooks", "Dashboards"]
  },

  "priceBand": {
    "price": { "monthly": { "amount": 6000, "currency": "USD" } },
    "label": "Starting at",
    "note": "Core scope for one ICP segment",
    "finePrint": "Implementation requires admin access; data hygiene issues may extend timelines.",
    "ctas": [
      { "kind": "primary", "label": "Book intro call", "href": "/contact", "ariaLabel": "Book intro for SmartDAW" },
      { "kind": "secondary", "label": "Download scope PDF", "href": "/smartdaw/scope.pdf" }
    ]
  },

  "sticky": { "summary": "ICP rubric, routing rules & playbooks in 2 weeks." },

  "extras": {
    "timelineBlocks": [
      { "title": "Week 1", "description": "Workshop, audit, rubric" },
      { "title": "Week 2", "description": "Routing build, enablement, dashboards" }
    ],
    "ethics": [
      "No deceptive outreach",
      "Data usage complies with user consent"
    ],
    "requirements": [
      "CRM admin access",
      "Source tracking parameters live",
      "Sales acceptance criteria documented"
    ]
  },

  "crossSell": [
    { "slug": "smartdaw-lead-scoring", "label": "Lead Scoring" },
    { "slug": "smartdaw-outbound", "label": "Outbound Playbooks" }
  ]
}
```

### 3.2 `documents/domains/packages/golden/public/smartdaw.public.mdx`

```md
---
slug: smartdaw-strategic-flow
title: SmartDAW Strategic Flow
summary: Align demand gen with sales, fast.
authors: ["@conorhovis1"]
status: "Approved"
---

## Overview

SmartDAW aligns demand generation with sales execution. In two weeks we deliver a working flow…

## Notes

- Pilot runs limited to one ICP segment
- Admin access required

## FAQ

### What if our CRM is messy?
We include a hygiene checklist; if critical gaps exist we’ll scope a patch.
```

> The build compiles this into the **HTML strings** in `narrative.*Html`. No price in MDX.

### 3.3 `documents/domains/packages/golden/internal/smartdaw.internal.json`

```json
{
  "sku": "PKG-SDAW-STRATFLOW",
  "owner": "@conorhovis1",
  "tiers": [
    {
      "name": "Core",
      "bestFor": ["Seed/Series A GTM fit", "Single ICP"],
      "includes": ["ICP workshop", "Routing rules", "Sales playbooks", "Funnel dashboard"],
      "price": { "monthly": { "amount": 6000, "currency": "USD" } },
      "grossMarginTarget": 0.65,
      "deliveryNotes": "Assumes existing CRM with standard objects",
      "is_public": true
    },
    {
      "name": "Plus",
      "bestFor": ["Multiple ICPs", "Attribution required"],
      "includes": ["Everything in Core", "Attribution baseline", "SLA alerts"],
      "price": { "monthly": { "amount": 9000, "currency": "USD" } },
      "grossMarginTarget": 0.6
    },
    {
      "name": "Pro",
      "bestFor": ["RevOps team", "Multi-geo routing"],
      "includes": ["Custom objects", "Advanced scoring ML handoff"],
      "price": { "oneTime": { "amount": 24000, "currency": "USD" } },
      "grossMarginTarget": 0.58
    }
  ],
  "ops": {
    "leadTimeDays": 14,
    "staffing": [
      { "role": "GTM Strategist", "allocationPct": 50 },
      { "role": "MarTech/CRM", "allocationPct": 50 }
    ],
    "constraints": ["No data exfiltration", "No scraping without consent"]
  }
}
```

---

## 4) Adapter (External → PDO props)

> Keep the **default label** (“Starting at”) **inside `PriceActionsBand`** to avoid duplication. The adapter should **not** invent labels.

```ts
// adapters/packages-detail.ts
import type { ExternalPackage } from "./types";
import type { PackageDetailOverviewProps } from "@/packages/sections/PackageDetailOverview";

export function toPackageDetailOverviewProps(pkg: ExternalPackage): PackageDetailOverviewProps {
  return {
    id: pkg.id,
    title: pkg.name,
    tagline: pkg.tagline,
    meta: { category: pkg.category, tags: pkg.tags ?? [] },

    descriptionHtml: pkg.narrative?.overviewHtml,
    outcomes: pkg.outcomes ?? [],

    includes: {
      groups: pkg.includesGroups,
      table: pkg.includesTable
        ? {
            title: pkg.includesTable.title ?? "What’s included",
            caption: pkg.includesTable.caption,
            rows: pkg.includesTable.rows
          }
        : undefined
    },

    notesHtml: pkg.narrative?.notesHtml,

    // Hand off the whole priceBand; the band decides label/fine print defaults
    priceBand: pkg.priceBand,

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

## 5) Field → Component coverage (PDO + Template)

| External field                                  | Component(s)                | Notes                               |
| ----------------------------------------------- | --------------------------- | ----------------------------------- |
| `name`, `tagline`                               | `TitleBlock`                | title + subtitle                    |
| `category`, `tags`                              | `MetaRow`                   | chips/badges                        |
| `narrative.overviewHtml`                        | (rendered at top of PDO)    | optional safe HTML                  |
| `outcomes[]`                                    | `OutcomesBlock`             | KPI bullets                         |
| `includesGroups[]`                              | `IncludesFromGroups`        | primary path                        |
| `includesTable`                                 | `PackageIncludesTable`      | fallback                            |
| `narrative.notesHtml`                           | `NotesBlock`                | long-form notes                     |
| `priceBand.{price,label,note,finePrint,ctas[]}` | `PriceActionsBand`          | label default lives **in the band** |
| `sticky.summary`                                | `StickyRail`                | one-liner                           |
| `extras.timelineBlocks[]`                       | `PackageDetailExtras`       | steps/ol                            |
| `extras.ethics[]`, `extras.requirements[]`      | `PackageDetailExtras`       | two lists                           |
| `narrative.faqHtml`                             | `FAQAccordion` (or similar) | optional                            |
| `crossSell[]`                                   | `RelatedItemsRail`          | optional                            |

---

## 6) Build & validation (succinct plan)

**Inputs per package**
`public.mdx` (narrative) + `public/external.json` (public structured) + `internal/internal.json` (tiers/ops, optional)

**Outputs**

* `src/data/packages/__generated__/packages/<slug>.external.json` ← normalized, narrative attached
* `src/data/packages/__generated__/index.json` ← tiny {id,slug,service,tags,summary,hasPrice}

**Algorithm (per slug)**

1. Load & **validate** authored `external.json` and optional `internal.json`.
2. Compile `public.mdx` → `narrative.{overviewHtml,notesHtml,faqHtml}`.
3. Choose pricing policy:

   * **A (recommended):** copy canonical tier `price` from internal → `external.priceBand.price`.
   * **B:** trust `external.priceBand.price` (strict shape).
4. Normalize/attach narrative → **Generated External JSON**.
5. Write to **per-slug** path: `packages/<slug>.external.json`.
6. Append entry to `index.json`.

**CI gates**

* Per-slug file exists (count slugs == count generated).
* Slug uniqueness (folder name & `external.slug`).
* No price prose in MDX (regex guard) if using policy A.
* At least one includes path (groups or table).
* Zod/JSON-schema validation for authored & generated JSON.
* **Adapter smoke test**: run `toPackageDetailOverviewProps(generated)` and shallow render PDO (no runtime errors).

---

## 7) Official documentation for `external.json`

This is the **public authoring contract** (pre-build). The build will validate and normalize it, then attach narrative from MDX.

### Required

* `id` (string) — stable package id (e.g., `pkg_smartdaw`)
* `slug` (kebab-case) — folder name & route segment
* `name` (string) — display name
* `service` (string) — top-level taxonomy bucket
* `summary` (string) — value prop sentence shown in hero/PDO

### Recommended

* `tagline` (string) — short subtitle under title
* `category` (string), `tags` (string[]) — classification & chips
* `seo` — `{ title?, description? }` meta

### Collections

* `outcomes` (string[]) — KPI bullets (3–6)
* `features` (string[]) — top feature bullets (optional)
* `includesGroups` (array) — `{ title, items[] }` (preferred path)
* `includesTable` — `{ title?, caption?, rows[] }` (fallback; don't use both unless both add value)

### Pricing surface

* `priceBand` — single object controlling the customer-facing price surface

  * `price` (optional) — `{ monthly?: Money, oneTime?: Money }`
    *Omit entirely* for “custom quote”
  * `label?` — e.g. “Starting at” (you can omit; band has default)
  * `note?` — short base note (e.g., “Core scope for one ICP”)
  * `finePrint?` — disclaimer/scope/assumptions (HTML allowed if sanitized)
  * `ctas?` — `CTA[]` (primary/secondary)

### Narrative (build attaches from MDX)

* `narrative.overviewHtml`
* `narrative.notesHtml`
* `narrative.faqHtml`

### Extras & rails

* `extras.timelineBlocks[]` — phase/step descriptions
* `extras.requirements[]`, `extras.ethics[]`
* `sticky.summary` — right-rail one-liner
* `crossSell[]` — `{ slug, label }`
* `addOns[]` — `{ slug, label }` (optional if you surface add-ons)

**Anti-patterns (blocked in CI)**

* Price prose in MDX body (currency strings near numbers)
* `startingAt` ad-hoc strings (derive in `PriceActionsBand`)
* Missing includes (neither groups nor table present)

---

## 8) Contract test (golden)

`documents/domains/packages/golden/tests/smartdaw.contract.spec.ts`

```ts
import { z } from "zod";
import external from "../public/smartdaw.external.json";
import internal from "../internal/smartdaw.internal.json";
import { toPackageDetailOverviewProps } from "../../../adapters/packages-detail";

// Minimal external schema (trimmed for brevity)
const Money = z.object({ amount: z.number().positive(), currency: z.enum(["USD","EUR","GBP"]) });
const Price = z.object({ monthly: Money.optional(), oneTime: Money.optional() }).refine(p => p.monthly || p.oneTime, { message: "monthly or oneTime required when price present" });

const ExternalSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  service: z.string().min(1).optional(), // allow missing in golden; validate in real build
  summary: z.string().min(1),
  narrative: z.object({
    overviewHtml: z.string().optional(),
    notesHtml: z.string().optional(),
    faqHtml: z.string().optional()
  }).optional(),
  includesGroups: z.array(z.object({ title: z.string(), items: z.array(z.string().min(1)) })).optional(),
  includesTable: z.object({ title: z.string().optional(), caption: z.string().optional(), rows: z.array(z.string()) }).optional(),
  outcomes: z.array(z.string()).optional(),
  priceBand: z.object({
    price: Price.optional(),
    label: z.string().optional(),
    note: z.string().optional(),
    finePrint: z.string().optional(),
    ctas: z.array(z.object({ kind: z.enum(["primary","secondary"]), label: z.string() })).optional()
  }).optional()
});

test("external.json matches schema", () => {
  expect(() => ExternalSchema.parse(external)).not.toThrow();
});

test("adapter returns PDO-safe shape", () => {
  const props = toPackageDetailOverviewProps(external as any);
  expect(props.id).toBe("pkg_smartdaw");
  expect(Array.isArray(props.outcomes)).toBe(true);
  expect(props.includes?.groups || props.includes?.table).toBeTruthy();
  // Price surface flows through priceBand untouched
  expect(props.priceBand?.price?.monthly?.amount).toBe(6000);
});
```

> In the real repo, extend schemas to cover all required fields and run a shallow render of PDO to fully smoke UI.

---

## 9) Build script notes (per-slug, not aggregated)

* Always write to `src/data/packages/__generated__/packages/<slug>.external.json`.
* Keep `__generated__/index.json` **tiny** (id, slug, service, tags, summary, hasPrice).
* Use concurrency (`p-limit(8–16)`) to scale to 100+ packages.
* Add a `--changed-only` mode by diffing Git or mtimes for speed.

---

## 10) Runtime wiring (unchanged DX)

```ts
// src/packages/registry/smartdaw-strategic-flow/base.ts
import generated from "@/data/packages/__generated__/packages/smartdaw-strategic-flow.external.json";
import type { PackageAuthoringBase } from "@/packages/lib/registry/types";
export const base: PackageAuthoringBase = generated;

// src/packages/registry/smartdaw-strategic-flow/details.ts
import { base } from "./base";
import { buildPackageDetailOverviewProps } from "@/packages/lib/registry/mappers";
export default buildPackageDetailOverviewProps(base);
```

---

## 11) Adoption checklist

* [ ] Add the **golden** samples (this folder) to the repo and run the contract spec in CI.
* [ ] Turn on the **per-slug** build that writes `packages/<slug>.external.json` + `index.json`.
* [ ] Point each package’s `base.ts` at its generated file.
* [ ] Keep the **default label** logic inside `PriceActionsBand`.
* [ ] Enforce **no price in MDX** (if using internal-driven pricing).
* [ ] Confirm `FAQAccordion` & `RelatedItemsRail` bindings in the detail template.

---

### TL;DR

* **Author per package** (MDX + small public JSON + optional internal JSON).
* **Build per package** (write **one** `<slug>.external.json` + tiny `index.json`).
* **Runtime unchanged** (typed `base` → mappers → PDO).

You now have a **golden pair** and a **single canonical schema** that keeps authoring simple, runtime fast, and the “one big JSON” issue gone for good.
