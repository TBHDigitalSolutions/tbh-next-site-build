title: "Packages Domain — Official Documentation"
domain: "packages"
file: "packages-domain_OfficialDocumentation_2025-10-01.md"
main: "packages-domain"
qualifier: "Official Documentation"
date: "2025-10-01"
time: 11:43am
status: "Approved"
owners: ["@yourname"]
tags: ["packages","mdx","pricing","internal-json","external-json","schemas","ci","adapters","pdo","nextjs","json-ld","seo","build-pipeline","validation"]
spotlight:
  - "MDX is the public narrative SSOT; pricing/tiers/ops live in internal JSON"
  - "Build generates one canonical <slug>.external.json per package plus a tiny index.json for hubs"
  - "Runtime stays typed: base.ts imports generated JSON; adapters map to PDO and cards"
  - "Strong contracts via Zod schemas, CI validation, and a golden sample to prevent drift"
  - "Clear separation of authoring, build, and runtime responsibilities for scale (100+ packages)"
summary: "Official end-to-end guide for the Packages domain covering purpose, authoring (MDX + internal JSON), build outputs (per-slug external JSON and index.json), typed runtime mapping to PackageDetailOverview (PDO), UI composition, pricing policy, and validation/CI so teams can add, validate, and ship new packages confidently."
links:
  related: []

-----
10-01-2025 | 11:43am
---
# Packages Domain — Official Documentation

This is the **single guide** to how the Packages domain works—**what it’s for, how content is authored, how data flows, how pricing is handled, how pages render, and how we keep everything typed and safe**. If you follow this doc, you can add, validate, and ship a new package from scratch.

---

## 1) Purpose & Principles

**Goal:** publish repeatable, productized services (“packages”) as SEO-friendly pages and cards, at scale (100+), with **clear ownership**:

* **Marketing/Sales** own *public narrative* (MDX).
* **Ops/Pricing** own *prices/tiers/constraints* (internal JSON).
* **App** reads a **single, canonical external JSON** per package.
* **UI** gets **typed props** via small adapters/mappers—no guesswork.

**Guiding principles**

* **One Authoring SSOT:** `public.mdx` (public copy) + optional `internal.json` (pricing, ops).
* **One Runtime SSOT:** `base.ts` per package, which **imports generated external JSON** and exports it as a typed object.
* **One Bridge:** a build step that **generates one `<slug>.external.json` per package** from MDX (+ merges pricing by policy).
* **Strong Contracts:** Zod schemas, CI gates, and a golden sample.

---

## 2) End-to-End Flow

```
Authoring
 ├─ public.mdx            (frontmatter + body sections; no price prose)
 └─ internal.json (opt.)  (tiers/pricing/ops; never shipped)

Build
 ├─ compile MDX → narrative.*Html
 ├─ merge + normalize → src/data/packages/__generated__/packages/<slug>.external.json
 └─ write src/data/packages/__generated__/index.json (for hubs/search)

Runtime (Next.js)
 ├─ base.ts imports the generated external JSON (typed)
 ├─ mappers/adapters → PackageDetailOverview props (PDO)
 └─ Templates/sections render the phases, card, rails, JSON-LD
```

---

## 3) Repository Layout

```
docs/packages/catalog/<service>/<subservice>/<slug>/
  public.mdx         # SSOT for public content (frontmatter + body)
  internal.json      # (optional) pricing/tiers/ops; NOT shipped
  assets/            # images, diagrams

src/data/packages/__generated__/
  index.json                          # hub/search metadata
  packages/<slug>.external.json       # canonical runtime JSON (per slug)

src/packages/registry/<service>/<slug>/
  base.ts         # imports <slug>.external.json and exports typed base
  card.ts         # thin mapper for PackageCard props
  details.ts      # thin mapper for PackageDetailOverview props (PDO)
```

> We also keep a **golden sample** (public + internal + MDX + tests) under `documents/domains/packages/golden/` for contract testing.

---

## 4) Authoring

### 4.1 Frontmatter (public.mdx)

Use frontmatter for **structured public fields**:

* Identity/taxonomy: `id`, `slug`, `service`, `category?`, `tags?`, `badges?`
* Copy: `title` (→ `name`), `summary` (→ tagline), `seo?`
* Structured content:

  * `outcomes[]` (short bullets)
  * **Includes**: `includesGroups[]` *or* `includesTable`
  * `features[]` (optional; can be derived from includes)
* Extras: `extras.{timelineBlocks[], requirements[], ethics[]}`
* Price band copy (no numbers): `priceBand.{tagline?, baseNote?, finePrint?, ctas[]}`
* Rails: `crossSell[]`, `addOns[]`
* **Optional (Mode B only):** strictly-typed `price` object (see §6)

**Never put price prose in MDX body.** Prices are structured data only.

### 4.2 Body Sections (public.mdx)

Write narrative in Markdown; the builder compiles to HTML:

* `## Overview` → `narrative.overviewHtml`
* `## Purpose`  → `narrative.purposeHtml` (optional)
* `## Notes`    → `narrative.notesHtml`   (optional)
* `## FAQ`      → `narrative.faqHtml`     (optional)

### 4.3 Internal Pricing (internal.json) — optional but recommended

* Single source of truth for **tiers/prices/ops constraints**.
* Builder selects/merges a canonical **Price** into the external JSON (Mode A).

---

## 5) Canonical Runtime Shape (External JSON)

This is the **only** shape the app reads at runtime.

```ts
type Currency = 'USD'|'EUR'|'GBP';
type Money    = { amount: number; currency: Currency };
type Price    = { monthly?: Money; oneTime?: Money }; // either or both; or omit entirely

type CTA = { kind:'primary'|'secondary'; label:string; href?:string; onClickId?:string; ariaLabel?:string };

type ExternalPackage = {
  id: string; slug: string; name: string;
  tagline?: string; category?: string; tags?: string[];
  seo?: { title?: string; description?: string };

  narrative?: { overviewHtml?: string; purposeHtml?: string; notesHtml?: string; faqHtml?: string };

  outcomes?: string[];
  includesGroups?: Array<{ title:string; items:string[] }>;
  includesTable?:  { title?:string; caption?:string; rows:string[] };

  priceBand?: {
    price?: Price;          // omit → custom quote
    label?: string;         // e.g., "Starting at" (band can default it)
    note?: string;
    finePrint?: string;
    ctas?: CTA[];
  };

  sticky?: { summary?: string };

  extras?: {
    timelineBlocks?: Array<{ title:string; description:string }>;
    ethics?: string[];
    requirements?: string[];
  };

  crossSell?: Array<{ slug:string; label:string }>;
  addOns?:    Array<{ slug:string; label:string }>;
};
```

**Invariants**

* External JSON must have **either** `includesGroups` **or** `includesTable`.
* If `priceBand.price` exists, it must contain **`monthly` or `oneTime`** (valid currency).
* If price is **omitted**, UI shows a CTA state (no numbers), and JSON-LD **omits** `offers`.

---

## 6) Pricing Policy (two modes)

### Mode A — **Recommended default**

* **Price lives in `internal.json`.**
* Build copies a canonical `Price` into the external JSON’s `priceBand.price`.
* Safer (compliance), supports tiering/ops, avoids copy drift.

### Mode B — Opt-in per package

* Allow **strictly-shaped** `price` in frontmatter:

  ```yaml
  price:
    monthly: { amount: 6000, currency: USD }
  ```
* Enforced by schema; **no prose** prices in MDX body.

**Conflict:** If both exist, project setting decides:

* `pricingSource = "internal" | "frontmatter" | "prefer-internal"` (recommended)

**Display:** `PriceActionsBand` owns labels (“Starting at”), formatting, and notes based on `priceBand + price`.

---

## 7) Build Pipeline (what the script does)

For each package directory:

1. **Parse MDX** → frontmatter + body; compile sections to safe HTML:

   * `overviewHtml`, `purposeHtml`, `notesHtml`, `faqHtml`.
2. **Read internal.json** (if present) and select the canonical **Price** (Mode A).
3. **Synthesize External JSON**:

   * Copy structured fields from frontmatter.
   * Attach `narrative.*Html`.
   * Set `priceBand.price` per pricing mode.
   * Normalize **includes** and **extras** (consistent shapes).
4. **Validate** with Zod:

   * Required: `id`, `slug`, `name`, and includes (groups or table).
   * If present, `price` must be valid (`monthly` or `oneTime`).
   * Ban legacy/banned fields (e.g., `startingAt`, `priceTeaser`).
5. **Write** `src/data/packages/__generated__/packages/<slug>.external.json`.
6. **Update** `src/data/packages/__generated__/index.json` with list/search metadata.

> **Security:** Use an allowlist sanitizer for compiled HTML (no script/style).

---

## 8) Runtime Wiring (Next.js + Mappers)

### Detail page `/packages/[slug]`

* Load `<slug>.external.json`.
* Adapt to **PDO props** (see below).
* Render **PackagesDetailTemplate** → **PackageDetailOverview**.

### Hub pages

* Load `index.json`, filter by service/subservice.
* Render **PackageCard** grid.

### Adapter → Package Detail Overview (PDO)

```ts
export type PackageDetailOverviewProps = {
  id: string;
  title: string;
  tagline?: string;
  meta?: { category?: string; tags: string[] };
  descriptionHtml?: string;
  outcomes?: string[];
  includes?: {
    groups?: Array<{ title:string; items:string[] }>;
    table?:  { title?:string; caption?:string; rows:string[] };
  };
  notesHtml?: string;
  priceBand?: ExternalPackage['priceBand']; // band derives labels & formatting
  sticky?: { summary?: string };
  extras?: ExternalPackage['extras'];
  faqHtml?: string;
  crossSell?: ExternalPackage['crossSell'];
  addOns?:    ExternalPackage['addOns'];
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
    priceBand: pkg.priceBand,
    sticky: pkg.sticky,
    extras: pkg.extras,
    faqHtml: pkg.narrative?.faqHtml,
    crossSell: pkg.crossSell,
    addOns: pkg.addOns,
  };
}
```

---

## 9) Template, Phases, and Parts (what renders where)

**PackagesDetailTemplate** orchestrates five phases:

1. **Phase 1 — Hero**

   * `TitleBlock`, optional media/CTAs.

2. **Phase 2 — Why**

   * `TitleBlock` (with ICP if used)
   * Optional: `HighlightsBlock`, `PainPointsBlock`, `PurposeBlock`.

3. **Phase 3 — What**

   * `OutcomesBlock`
   * `IncludesFromGroups` **or** `PackageIncludesTable`
   * `NotesBlock`
   * `PriceActionsBand` (or `PriceTeaser` + `CTARow`)

4. **Phase 4 — Details & Trust**

   * `PackageDetailExtras`:

     * `TimelineBlock` (from `extras.timelineBlocks`)
     * `RequirementsBlock` (from `extras.requirements`)
     * `EthicsBlock` (from `extras.ethics`)

5. **Phase 5 — Next**

   * `FAQSection` (from `narrative.faqHtml`)
   * `RelatedItemsRail` (from `crossSell`)
   * `CTASection` (optional add-ons, second CTA band)

**Right rail**: `StickyRail` with `sticky.summary`.
**A11y**: `h1` in hero, `h2` per phase; each `<section>` has `aria-label`.

---

## 10) Field → Component Matrix

| External JSON field                             | Component(s)                |
| ----------------------------------------------- | --------------------------- |
| `name`, `tagline`                               | `TitleBlock`                |
| `category`, `tags`                              | `MetaRow`                   |
| `narrative.overviewHtml`                        | Intro copy in PDO           |
| `outcomes[]`                                    | `OutcomesBlock`             |
| `includesGroups[]`                              | `IncludesFromGroups`        |
| `includesTable`                                 | `PackageIncludesTable`      |
| `narrative.notesHtml`                           | `NotesBlock`                |
| `priceBand.{price,label,note,finePrint,ctas[]}` | `PriceActionsBand`          |
| `sticky.summary`                                | `StickyRail`                |
| `extras.timelineBlocks[]`                       | `PackageDetailExtras`       |
| `extras.ethics[]`, `extras.requirements[]`      | `PackageDetailExtras`       |
| `narrative.faqHtml`                             | `FAQSection` (accordion)    |
| `crossSell[]`                                   | `RelatedItemsRail`          |
| `addOns[]`                                      | `AddOnSection` (if present) |

---

## 11) JSON-LD & SEO

* Emit Schema.org **Service/Product** JSON-LD on detail pages.
* **Rule:** If `priceBand.price` is **absent**, **omit `offers`** entirely.
* Always include `name`, `description` (from overview), canonical URL, and optional `brand`/`category`.

---

## 12) Validation, Lint, and CI

**Zod schemas** (or JSON Schema) enforce:

* External: required meta, includes present (groups or table), valid optional Price.
* Internal: each tier includes a valid Price; optional ops constraints.

**MDX lint**:

* For Mode A, fail on currency signs near digits in body (blocks price prose).
* Ensure `## Overview` exists (minimum viable content).

**CI stages**:

1. Install
2. `build:packages` (generate per-slug external JSON + index)
3. `validate:registry` (schema gates)
4. (Optional) Golden contract test:

   * Validate sample external
   * Adapter → PDO props
   * Smoke render (if you wire RTL/JSDOM)

**Artifacts**:

* Upload `src/data/packages/__generated__/**` for debugging.
* Ensure `__generated__/` is **.gitignored**.

---

## 13) Accessibility & UX Standards

* Semantic headings: single `h1`; `h2` per phase.
* Landmarks: each phase uses `<section aria-label="…">`.
* Links & buttons: descriptive `aria-label`s; keyboard focus rings visible.
* Cards: wrap as one interactive element with an accurate accessible name.

---

## 14) Adding a New Package (Step-by-Step)

1. **Scaffold**

   ```
   docs/packages/catalog/<service>/<subservice>/<slug>/
     public.mdx
     internal.json   # optional, recommended
     assets/
   ```
2. **Write `public.mdx`**

   * Fill frontmatter fields (id, slug, service, summary, includes…).
   * Write Overview/Notes/FAQ sections. **No price prose.**
3. **Fill `internal.json`** (tiers/pricing/ops) or opt into frontmatter price.
4. **Build & validate**

   ```bash
   npm run build:packages
   npm run validate:registry
   ```
5. **Run app** → visit `/packages/<slug>` and hub(s).

---

## 15) Troubleshooting

* **Build fails: “Provide includesGroups or includesTable”**
  Add one of them in frontmatter.

* **No price showing**
  Ensure either `internal.json` tier selected (Mode A) or strict `price` in frontmatter (Mode B). If price intentionally omitted, band shows CTA-only.

* **JSON-LD warnings**
  Confirm that `offers` is omitted when price missing and that `description` is not empty.

* **Broken HTML**
  Check MDX headings and sanitizer allowlist. Avoid raw `<script>`.

---

## 16) Migration Notes

* Keep existing `base.ts / card.ts / details.ts`; only change `base.ts` to import the generated external JSON and export it with the existing type.
* Centralize all price/band copy in `pricing.ts`/`band.ts`/`copy.ts`; do **not** hardcode price strings in components.
* Optional: add `PainPointsBlock` / `PurposeBlock` / `DeliverablesBlock` for stricter Phase parity.

---

## 17) Quick Reference

**Build outputs**

```
src/data/packages/__generated__/packages/<slug>.external.json
src/data/packages/__generated__/index.json
```

**Must-haves**

* `id`, `slug`, `name`
* includes (groups or table)
* price **optional** (monthly or one-time). No prose in MDX.

**Golden sample**
Keep a canonical pair (public + internal + mdx + tests) to prevent drift.

---

## 18) TL;DR

* Author in **MDX** (public narrative) + **internal.json** (price/ops).
* Build creates **per-slug external JSON** (the only runtime input).
* `base.ts` imports that JSON and keeps your runtime types unchanged.
* Mappers/adapters produce **typed props** for **PackageDetailOverview** and **PackageCard**.
* Pricing is **structured**, **policy-driven**, and **CI-validated**—ready to scale.
