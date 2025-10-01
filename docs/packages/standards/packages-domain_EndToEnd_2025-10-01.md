title: "Packages Domain — End-to-End Documentation"
domain: "packages"
file: "packages-domain_EndToEnd_2025-10-01.md"
main: "packages-domain"
qualifier: "End-to-End Documentation"
date: "2025-10-01"
time: 11:42am
status: "Draft"
owners: ["@yourname"]
tags: ["packages","mdx","pricing","schemas","ci","adapters","pdo","nextjs","build","validation"]
spotlight:
  - "MDX is the public narrative SSOT; pricing/tiers/ops live in internal JSON"
  - "Build compiles MDX and merges pricing to emit one canonical external JSON per package"
  - "Pure adapters map canonical JSON to typed UI props (PDO, cards)"
  - "Strong contracts: schemas, validations, CI smoke tests, and a golden sample"
  - "Hubs use a tiny index.json; detail pages read per-slug generated JSON"
summary: "This document defines the Packages domain end-to-end: purpose, authoring model (MDX + internal JSON), canonical runtime JSON, build pipeline, adapters to PackageDetailOverview (PDO), UI composition, pricing policy, validation/CI, and a golden sample—so you can author a package, generate artifacts, and render cards/detail/hubs without guesswork."
links:
  related: []
---

10-01-2025 | 11:42am

---
# Packages Domain — End-to-End Documentation

This document explains the **purpose, authoring model, data contracts, build pipeline, runtime mapping, components, pricing policy, validation/CI, and examples** for the Packages domain. By the end, you should be able to author a new package, generate the runtime artifacts, and see it render in the app (card, detail page, hubs) with no guesswork.

---

## 1) What the Packages domain is

**Goal:** publish productized services (“packages”) as consistent, typed, SEO-friendly pages and cards—scalable to dozens or hundreds—while keeping **content authoring** simple and **pricing** controlled and auditable.

**Principles**

* **Single source of truth (SSOT)** for public narrative: **MDX**.
* **Single SSOT for pricing/tiers/ops**: **internal JSON** (never shipped).
* **One canonical external JSON** per package: the only thing the app reads.
* **Pure adapters**: map canonical JSON → typed UI props (PDO, cards).
* **Strong contracts**: schemas, validations, CI tests, and a golden sample.

---

## 2) High-level flow

```
Authoring (humans)
 ├─ public.mdx  (narrative: Overview, Notes, FAQ; NO pricing)
 └─ internal.json (tiers, prices, ops notes; never shipped)

Build (scripts)
 ├─ compile MDX → narrativeHtml
 ├─ merge + normalize → <slug>.external.json  (canonical)
 └─ write index.json for hubs/search

Runtime (Next.js app)
 ├─ import <slug>.external.json (or via data facade)
 ├─ adapt → PackageDetailOverviewProps (PDO)
 └─ render Templates (cards, detail, hubs, JSON-LD)
```

---

## 3) Folder & file layout

```
docs/packages/catalog/{service}/{subservice}/{slug}/
  public.mdx          # narrative content; no price; frontmatter for meta
  internal.json       # tiers/pricing/ops; not shipped
  assets/

src/data/packages/__generated__/
  index.json          # hub/search metadata
  packages/<slug>.external.json
```

(You may also keep a **golden** pair under `documents/domains/packages/golden/` for contract tests and examples.)

---

## 4) Canonical types (concise, stable)

### Money/Price

```ts
type Currency = 'USD'|'EUR'|'GBP';
type Money = { amount: number; currency: Currency };
type Price = { monthly?: Money; oneTime?: Money }; // either or both; or omit entirely
```

### External package (runtime JSON)

```ts
type CTA = {
  kind: 'primary'|'secondary';
  label: string;
  href?: string; onClickId?: string; ariaLabel?: string;
};

type ExternalPackage = {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  category?: string;
  tags?: string[];
  seo?: { title?: string; description?: string };

  narrative?: {
    overviewHtml?: string;  // compiled from MDX
    notesHtml?: string;
    faqHtml?: string;
  };

  outcomes?: string[];
  includesGroups?: Array<{ title: string; items: string[] }>;
  includesTable?: { title?: string; caption?: string; rows: string[] };

  priceBand?: {
    price?: Price;          // omit → custom quote
    label?: string;         // e.g., "Starting at" (may also be derived by band)
    note?: string;
    finePrint?: string;
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
```

### Internal pricing (never shipped)

```ts
type InternalPricing = {
  sku: string;
  owner: string; // e.g., "@conorhovis1"
  tiers: Array<{
    name: string; bestFor?: string[];
    includes: string[];
    price: Price;           // authoritative
    grossMarginTarget?: number; // 0..1
    deliveryNotes?: string;
  }>;
  ops?: {
    leadTimeDays?: number;
    staffing?: Array<{ role: string; allocationPct: number }>;
    constraints?: string[];
  };
};
```

---

## 5) Authoring rules (Public vs Internal)

**Public MDX (`public.mdx`)**

* Frontmatter: `slug`, `title` (aka `name`), optional `summary` (tagline), `status`, etc.
* Body sections (recommended headings):

  * `## Overview` → compiled to `narrative.overviewHtml`
  * `## Notes` → compiled to `narrative.notesHtml`
  * `## FAQ` → compiled to `narrative.faqHtml`
* **Never include pricing** or tiers here.

**Internal JSON (`internal.json`)**

* Single source of truth for tiers/prices and operational constraints.
* At build time, the selected price (or default tier) is copied into the external JSON’s `priceBand.price`. (You can also allow “no price” for “custom quote”.)

---

## 6) Build pipeline

### Responsibilities

1. **Validate** `internal.json` (tiers/pricing) against its schema.
2. **Read & compile MDX** → produce `overviewHtml`, `notesHtml`, `faqHtml`.
3. **Merge**:

   * Author-provided public metadata (frontmatter) + narrative HTML
   * Chosen tier’s `price` (or none) from `internal.json`
   * Normalize `includes` (groups/table), `extras` (timeline/ethics/requirements)
4. **Validate** the resulting **ExternalPackage** shape.
5. **Write**: `src/data/packages/__generated__/packages/<slug>.external.json`
6. **Update**: `src/data/packages/__generated__/index.json` (for hubs/search)

> Sanitization: if you allow raw HTML, run an allowlist (headings/paragraphs/lists/links) with a sanitizer; never allow `<script>`.

### Required invariants

* External JSON must have **either** `includesGroups` **or** `includesTable`.
* If `priceBand.price` exists, it must be a valid `Price` (monthly and/or oneTime).
* The app **only** reads the External JSON at runtime.

---

## 7) Runtime wiring

### Next.js routes

* **Detail**: `/packages/[slug]`

  * Load `<slug>.external.json`
  * Adapt to **PackageDetailOverviewProps** (PDO)
  * Render **PackagesDetailTemplate** → **PackageDetailOverview** (PDO)

* **Hubs**: `/[service]-packages` (and optional subservice hubs)

  * Load `index.json`, filter by service/subservice, render list of **PackageCard**s.

### Adapter (external → PDO props)

Keep PDO dumb: the adapter outputs exactly what the components expect.

```ts
export type PackageDetailOverviewProps = {
  id: string;
  title: string;
  tagline?: string;
  meta?: { category?: string; tags: string[] };
  descriptionHtml?: string;
  outcomes?: string[];
  includes?: {
    groups?: Array<{ title: string; items: string[] }>;
    table?: { title?: string; caption?: string; rows: string[] };
  };
  notesHtml?: string;
  priceBand?: ExternalPackage['priceBand']; // pass-through; band derives labels
  sticky?: { summary?: string };
  extras?: ExternalPackage['extras'];
  faqHtml?: string;
  crossSell?: ExternalPackage['crossSell'];
};
```

```ts
export function toPackageDetailOverviewProps(pkg: ExternalPackage): PackageDetailOverviewProps {
  return {
    id: pkg.id,
    title: pkg.name,
    tagline: pkg.tagline,
    meta: { category: pkg.category, tags: pkg.tags ?? [] },
    descriptionHtml: pkg.narrative?.overviewHtml,
    outcomes: pkg.outcomes ?? [],
    includes: { groups: pkg.includesGroups, table: pkg.includesTable },
    notesHtml: pkg.narrative?.notesHtml,
    priceBand: pkg.priceBand, // band resolves copy
    sticky: pkg.sticky,
    extras: pkg.extras,
    faqHtml: pkg.narrative?.faqHtml,
    crossSell: pkg.crossSell,
  };
}
```

---

## 8) UI composition (Templates, Phases, Parts)

**PackagesDetailTemplate** (page shell) composes five phases inside `FullWidthSection` wrappers:

1. **Phase1HeroSection**

   * Uses ServiceHero or TitleBlock.
   * Shows title, tagline, optional image & CTAs.

2. **Phase2WhySection**

   * `TitleBlock` (+ optional ICP)
   * `HighlightsBlock` / `PainPointsBlock`
   * `PurposeBlock` (if you split narrative further)

3. **Phase3WhatSection**

   * `OutcomesBlock`
   * `IncludesFromGroups` **or** `PackageIncludesTable`
   * `NotesBlock`
   * `PriceActionsBand` (or `PriceTeaser` + `CTARow`)

4. **Phase4DetailsSection**

   * `PackageDetailExtras`: `TimelineBlock`, `RequirementsBlock`, `EthicsBlock`

5. **Phase5NextSection**

   * CTA band (if not shown earlier), `RelatedItemsRail`, `FAQSection`

**Right rail**: `StickyRail` with brief summary (from `sticky.summary`).

> Each block is **presentational** and receives typed props (no data fetching). The adapter/mappers assemble these props from the External JSON.

---

## 9) Pricing & band policy

* **Source of truth**: `internal.json` (tiers), merged into external as **a single `Price`** or omitted for “custom quote”.
* **Display**: handled by `PriceActionsBand` (or `PriceTeaser`); it:

  * Decides between monthly vs one-time (or shows a CTA without price).
  * Applies **policy** strings (e.g., “proposal” vs “final”) and **fine print**.
  * Uses shared formatting helpers.
* **No prose prices in MDX**. Authors should never write “$X/mo” anywhere public.

---

## 10) Component coverage matrix

| External JSON field                             | Component(s)             |
| ----------------------------------------------- | ------------------------ |
| `name`, `tagline`                               | `TitleBlock`             |
| `category`, `tags`                              | `MetaRow`                |
| `narrative.overviewHtml`                        | (intro copy in PDO)      |
| `outcomes[]`                                    | `OutcomesBlock`          |
| `includesGroups[]`                              | `IncludesFromGroups`     |
| `includesTable`                                 | `PackageIncludesTable`   |
| `narrative.notesHtml`                           | `NotesBlock`             |
| `priceBand.{price,label,note,finePrint,ctas[]}` | `PriceActionsBand`       |
| `sticky.summary`                                | `StickyRail`             |
| `extras.timelineBlocks[]`                       | `PackageDetailExtras`    |
| `extras.ethics[]`, `extras.requirements[]`      | `PackageDetailExtras`    |
| `narrative.faqHtml`                             | `FAQSection` (accordion) |
| `crossSell[]`                                   | `RelatedItemsRail`       |

---

## 11) JSON-LD & SEO

* **Course/Product/Service** markup is emitted from detail pages via a helper.
* Rule: if **no `priceBand.price`**, omit `offers` entirely to avoid broken structured data.
* Always provide `name`, `description` (from overview), and canonical URL.

---

## 12) Validation & CI

**Schemas (Zod or JSON Schema)**

* **Internal**: tiers must include a valid `Price`.
* **External**: require `id`, `slug`, `name`, **at least one of** `includesGroups`/`includesTable`. If `priceBand.price` exists, it must pass `Price` rules.

**Contract tests**

* Validate External schema for every generated JSON.
* Adapt to PDO props, then render PDO in a “smoke test” (no runtime errors).
* Guards:

  * MDX contains **no price** tokens (lint for “$” next to digit patterns).
  * If `priceBand.price` is missing, the band still renders a valid CTA state.

**CI workflow**

* Install deps → `build:packages` → `validate:registry` → (optional) `golden:test`.
* Upload `__generated__` artifacts for debugging.
* Ensure `__generated__/` is **git-ignored**; it’s build output.

---

## 13) Golden sample (recommended)

Keep one **golden pair** (public external JSON + internal JSON + public MDX) in `documents/domains/packages/golden/` plus:

* a tiny builder to compile MDX and attach to external,
* a contract test that validates schema, runs the adapter, and can optionally render PDO.

This gives you a **living spec** that prevents drift as the app evolves.

---

## 14) Accessibility & UX standards

* **Headings**: one `h1` in hero; each phase starts with an `h2`.
* **Landmarks**: `<section aria-label="…">` per phase; band has accessible names for CTAs; related rail has an aria-label.
* **Keyboard**: visible focus rings; cards treat their outer shell as a single interactive element with an accurate `aria-label`.

---

## 15) Adding a new package (author workflow)

1. **Scaffold**

   ```
   docs/packages/catalog/<service>/<subservice>/<slug>/
     public.mdx
     internal.json
     assets/
   ```
2. **Edit** `public.mdx` (Overview, Notes, FAQ). Do **not** add pricing.
3. **Edit** `internal.json` (tiers/pricing/ops).
4. **Build**

   ```bash
   npm run build:packages
   npm run validate:registry
   ```
5. **Run app** and visit `/packages/<slug>` and the hub(s).

---

## 16) Common decisions & FAQs

* **Where does “Starting at” come from?**
  Prefer to derive it **inside `PriceActionsBand`** (single source of truth). The adapter can pass through whatever label exists, but avoid duplicating defaults.

* **What if we need tiered pricing publicly later?**
  Keep tiers in `internal.json`. Add a flag to the external JSON (or runtime env) to render a `TieredPricingTable`. Until then, the band shows a single canonical price or a contact CTA.

* **Can a package have no price?**
  Yes. Omit `priceBand.price`. The band shows CTAs (e.g., “Request proposal”). JSON-LD omits `offers`.

* **What’s required?**
  `id`, `slug`, `name`, and **includes** (groups or table). Everything else is optional but should be **intentional**.

---

## 17) Implementation checklist

* [ ] Zod/JSON schemas for Internal & External shipped and used in build.
* [ ] Builder compiling MDX and attaching HTML safely.
* [ ] External JSON written to `__generated__` and validated.
* [ ] Adapter implemented; PDO renders with nullable props.
* [ ] Price band policy centralized; JSON-LD omits `offers` when price missing.
* [ ] CI gates for schema, adapter, and smoke render (plus golden pair).
* [ ] Accessibility checks (headings, labels, focus).

---

## 18) TL;DR

* **Author** public narrative in **MDX** and private price/tiers in **internal.json**.
* **Build** generates a single canonical **External JSON** that the app reads.
* **Runtime** adapts that JSON into typed props for **PackageDetailOverview** and cards.
* **Validation/CI** keep the contract tight so packages scale safely.

That’s the **entire** Package domain—purpose, files, pipeline, contracts, components, and ops.
