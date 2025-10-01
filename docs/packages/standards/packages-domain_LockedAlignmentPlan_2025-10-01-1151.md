title: "Packages Domain — Locked Alignment Plan"
domain: "packages"
file: "packages-domain_LockedAlignmentPlan_2025-10-01.md"
main: "packages-domain"
qualifier: "LockedAlignmentPlan"
date: "2025-10-01"
time: 11:51am
status: "Approved"
owners: ["@yourname"]
tags: ["packages","pricing","tiers","canonical-json","normalizer","mdx","build","adapters","nextjs","ci","json-ld","sanitization"]
spotlight:
  - "Default pricing Mode A from internal.json, with strict Mode B frontmatter override behind a flag"
  - "Safe tier toggle: no runtime reads of internal.json; optional public tiers via ui.showTieredPricing and is_public"
  - "Canonical external JSON contains nested sections and normalized top-level fields kept in sync by a normalizer"
  - "MDX body extraction standardized to Overview, Purpose, Notes, FAQ → sanitized narrative.*Html"
  - "Price band phrasing derived inside PriceActionsBand; adapters avoid hardcoded price text"
  - "CI guards: schema validation, MDX price-prose lint, includesGroups/Table requirement, and JSON-LD offers omission when price is absent"
summary: "An updated, locked plan that aligns pricing policy (Mode A by default), a safe tier toggle, a canonical external JSON (nested + normalized), a thin PDO adapter, and stronger CI/sanitization rules—so MDX + internal pricing authoring reliably generates per-slug external JSON and the typed runtime remains unchanged."
links:
  related: []

-----
10-01-2025 | 11:51am
---
Perfect—here’s your **updated, locked** document. I’ve merged everything we aligned on: **Mode A pricing by default**, a **safe tier toggle**, a **canonical external JSON** that contains both nested sections *and* normalized fields, a **thin PDO adapter**, and **tighter CI guards** (incl. sanitized HTML and JSON-LD rules). I also fixed the few inconsistencies (e.g., **no `purposeHtml` in frontmatter**—it’s compiled from MDX).

---

# A) Canonical flow (authoring → build → runtime)

**Authoring (per package)**

* `public.mdx` (frontmatter + body sections) → **SSOT for public copy & structure**

  * Never include price **prose** in the body (see Pricing).
* `internal.json` (tiers/ops/pricing notes) → **SSOT for pricing & sales** (Mode A).

**Build (per package)**

* Parse frontmatter; compile MDX body → **`narrative.*Html`** (sanitized).
* Resolve price:

  * **Mode A (default)**: take canonical **Price** from `internal.json`.
  * **Mode B (opt-in)**: allow a **strict** `price` in frontmatter.
* Write **one per-slug** external JSON:
  `src/data/packages/__generated__/packages/<slug>.external.json`.
* Update catalog: `src/data/packages/__generated__/index.json`.

**Runtime (unchanged ergonomics)**

* `src/packages/registry/<service>/<slug>/base.ts` imports the generated JSON and exports it **typed**.
* `details.ts` & `card.ts` remain **thin** (mappers → PDO/Card props).

**Tiered pricing (later-phase UI, safe)**

* Builder may copy **public-safe** tier rows into `external.json.internal_tiers` **only** if explicitly enabled (see §D).
* UI renders the table strictly when the **UI flag** & **public rows** exist.

---

# B) Master data fields list (source → JSON → base.ts → UI)

Legend: **Authored** (where it’s written) • **JSON** (generated path) • **base.ts** (typed export reads JSON) • **UI** (component) • **Req** (mandatory).

## 1) Meta & taxonomy

| Field        | Authored | JSON            | base.ts    | UI               | Req |
| ------------ | -------- | --------------- | ---------- | ---------------- | --- |
| id           | FM       | `meta.id`       | `id`       | TitleBlock, SEO  | ✅   |
| slug         | FM       | `meta.slug`     | `slug`     | Routing, links   | ✅   |
| service      | FM       | `meta.service`  | `service`  | MetaRow, filters | ✅   |
| category     | FM       | `meta.category` | `category` | MetaRow, filters | ◻︎  |
| tier (label) | FM       | `meta.tier`     | `tier`     | (chip, optional) | ◻︎  |
| badges       | FM       | `meta.badges`   | `badges`   | Card/Hero chips  | ◻︎  |
| tags[]       | FM       | `meta.tags[]`   | `tags[]`   | MetaRow, filters | ◻︎  |

> If you prefer a display name separate from `slug`, you may add `meta.name`. (Adapters can fall back to slug→title-case.)

## 2) Phase 1 — Hero

| Field                 | Authored      | JSON                                       | base.ts                     | UI                    | Req |
| --------------------- | ------------- | ------------------------------------------ | --------------------------- | --------------------- | --- |
| SEO title/description | FM            | `hero.seo.{title,description}`             | `seo`                       | page metadata         | ◻︎  |
| summary (value prop)  | FM            | `hero.summary`                             | `summary`                   | TitleBlock            | ✅   |
| description (longer)  | **Body**      | `narrative.overviewHtml` (HTML, sanitized) | `descriptionHtml` (via map) | TitleBlock            | ◻︎  |
| image {src,alt}       | FM            | `hero.image`                               | `image`                     | Card/Hero slot        | ◻︎  |
| CTAs (links)          | FM (optional) | `hero.ctas` (not required by runtime)      | *(mappers supply policy)*   | CTASection/Price band | ◻︎  |

## 3) Phase 2 — Why You Need This

| Field         | Authored | JSON                              | base.ts        | UI                                 | Req |
| ------------- | -------- | --------------------------------- | -------------- | ---------------------------------- | --- |
| pain_points[] | FM       | `why_you_need_this.pain_points[]` | `painPoints[]` | PainPointsBlock (PDO) or narrative | ◻︎  |
| purpose       | **Body** | `narrative.purposeHtml`           | `purposeHtml`  | PurposeBlock (PDO) or narrative    | ◻︎  |
| icp           | FM       | `why_you_need_this.icp`           | `icp`          | TitleBlock meta                    | ◻︎  |
| outcomes[]    | FM       | `why_you_need_this.outcomes[]`    | `outcomes[]`   | OutcomesBlock                      | ✅   |

## 4) Phase 3 — What You Get

| Field                 | Authored | JSON                                                                                         | base.ts            | UI                                          | Req            |
| --------------------- | -------- | -------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------- | -------------- |
| highlights/features[] | FM       | `what_you_get.highlights[]`                                                                  | `features[]`       | FeatureList (PDO)                           | ◻︎             |
| includes (groups)     | FM       | `what_you_get.includes[].{group_name,bullets[]}` → **normalize** to `includesGroups[].{...}` | `includesGroups[]` | IncludesFromGroups                          | ✅ *(or table)* |
| includes table        | FM       | `what_you_get.includes` → also produce `includesTable` (1-col)                               | `includesTable`    | PackageIncludesTable                        | ◻︎             |
| deliverables[]        | FM       | `what_you_get.deliverables[]`                                                                | `deliverables[]`   | DeliverablesBlock **or** fold into includes | ◻︎             |

## 5) Phase 4 — Details & Trust

| Field            | Authored                                  | JSON                                                                                                     | base.ts                 | UI                        | Req |
| ---------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------- | --- |
| price (Money)    | **Mode A:** internal.json; **Mode B:** FM | `details_and_trust.pricing` → **normalize** to top-level `price`                                         | `price`                 | PriceActionsBand, JSON-LD | ◻︎* |
| price band copy  | FM                                        | `details_and_trust.price_band.{tagline,base_note,fine_print}` → `priceBand.{tagline,baseNote,finePrint}` | `priceBand`             | PriceActionsBand          | ◻︎  |
| timeline         | FM                                        | `details_and_trust.timeline.{setup,launch,ongoing}` → `extras.timelineBlocks[]`/`timeline`               | `extras.timelineBlocks` | PackageDetailExtras       | ◻︎  |
| requirements[]   | FM                                        | `details_and_trust.requirements[]` → `extras.requirements[]`                                             | `extras.requirements[]` | PackageDetailExtras       | ◻︎  |
| caveats/ethics[] | FM                                        | `details_and_trust.caveats[]` → `extras.ethics[]`                                                        | `extras.ethics[]`       | PackageDetailExtras       | ◻︎  |

* Price is **optional** (supports “custom quote”). If absent, the band renders CTAs only and JSON-LD must **omit** `offers`.

## 6) Phase 5 — Next Step

| Field                | Authored | JSON                                                      | base.ts            | UI                    | Req |
| -------------------- | -------- | --------------------------------------------------------- | ------------------ | --------------------- | --- |
| FAQs                 | **Body** | `narrative.faqHtml` **or** `next_step.faqs[]` → normalize | `faqHtml`/`faqs[]` | FAQSection (Template) | ◻︎  |
| cross-sell related[] | FM       | `next_step.cross_sell.related[]` → `crossSell[]`          | `crossSell[]`      | RelatedItemsRail      | ◻︎  |
| add-ons[]            | FM       | `next_step.cross_sell.add_ons[]` → `addOns[]`             | `addOns[]`         | AddOnSection          | ◻︎  |
| notes (small print)  | **Body** | `narrative.notesHtml` **and/or** `next_step.notes`        | `notesHtml`        | NotesBlock            | ◻︎  |

## 7) Internal pricing & tiers (future table)

| Field       | Authored (internal.json)                                        | JSON (external)                            | base.ts           | UI (future)                  | Req |
| ----------- | --------------------------------------------------------------- | ------------------------------------------ | ----------------- | ---------------------------- | --- |
| tiers[]     | name, best_for, problem_solved, includes[], price, `is_public?` | `internal_tiers[]` (only public-safe rows) | `internalTiers[]` | TieredPricingTable (flagged) | ◻︎  |
| sales notes | upsell, discounts, effective/review                             | `sales_notes.*` (optional, not rendered)   | `salesNotes`      | n/a (internal only)          | ◻︎  |

---

# C) Official schemas (concise, stable)

```ts
// Money/Price
type Money = { amount: number; currency: "USD" };
type Price = { monthly?: Money | null; oneTime?: Money | null };

// External (generated) — what the app imports
type ExternalPackage = {
  meta: {
    id: string; slug: string; service: string;
    category?: string; tier?: string; badges?: string | string[]; tags?: string[];
  };
  hero: {
    seo?: { title?: string; description?: string };
    summary: string;
    description?: string;
    image?: { src: string; alt: string };
    ctas?: { details?: string; book_a_call?: string; request_proposal?: string };
  };
  narrative?: {
    overviewHtml?: string; purposeHtml?: string; faqHtml?: string; notesHtml?: string;
  };
  why_you_need_this?: {
    pain_points?: string[]; icp?: string; outcomes?: string[];
  };
  what_you_get?: {
    highlights?: string[];
    includes?: Array<{ group_name: string; bullets: string[] }>;
    deliverables?: string[];
  };
  details_and_trust?: {
    pricing?: Price;
    price_band?: { tagline?: string; base_note?: "proposal" | "final"; fine_print?: string };
    timeline?: { setup?: string; launch?: string; ongoing?: string };
    requirements?: string[];
    caveats?: string[];
  };
  next_step?: {
    faqs?: Array<{ q: string; a: string }>;
    cross_sell?: { related?: string[]; add_ons?: string[] };
    notes?: string | null;
  };

  // Normalized, top-level (for mappers/components)
  price?: Price;
  priceBand?: { tagline?: string; baseNote?: "proposal" | "final"; finePrint?: string; ctas?: any[] };
  includesGroups?: Array<{ title: string; items: string[] }>;
  includesTable?: { title?: string; caption?: string; rows: string[] };
  extras?: { timelineBlocks?: Array<{ title: string; description: string }>; requirements?: string[]; ethics?: string[] };
  features?: string[];
  outcomes?: string[];
  crossSell?: Array<{ slug: string; label: string }>;
  addOns?: Array<{ slug: string; label: string }>;

  // Future public tiers (safe subset only)
  internal_tiers?: Array<{
    name: string;
    best_for?: string;
    problem_solved?: string;
    includes?: string[];
    price: Price;
    is_public?: boolean;
  }>;

  // UI flags
  ui?: { showTieredPricing?: boolean };
};
```

```ts
// Internal (never shipped) — authoring SSOT for pricing/sales
type InternalPricing = {
  id: string; service: string; category?: string; tags?: string[];
  tiers: Array<{
    name: string;
    best_for?: string;
    problem_solved?: string;
    includes?: string[];
    price: Price;
    is_public?: boolean;
  }>;
  sales_notes?: {
    upsell?: { pro?: string; enterprise?: string };
    discounts?: string;
    effective?: string; review?: string;
  };
};
```

---

# D) Internal-tier toggle (safe exposure)

**At build time (not runtime):**

* If a project-level or per-slug flag enables public tiers, copy only **public-safe fields** from `internal.json.tiers` with `is_public: true` into `external.internal_tiers`.
* Set `external.ui.showTieredPricing = true`.

**At render time:**

* If `ui.showTieredPricing === true` **and** at least one `internal_tiers[*].is_public === true`, render **TieredPricingTable** under the band. Else, just show **PriceActionsBand**.

---

# E) Pricing modes (official stance)

* **Mode A (default, recommended):** price lives in **`internal.json`**; build copies one canonical **Price** to `external.price`.
* **Mode B (opt-in):** allow **strict** `price` in frontmatter.
* **Conflict policy:** `pricingSource: "internal" | "frontmatter" | "prefer-internal"` (default **prefer-internal**).
* **Band policy:** the band derives phrases (e.g., “Starting at”) from `{ price, priceBand }` centrally; no ad-hoc strings in adapters or MDX.

---

# F) Validation & CI (no drift, no leaks)

* **Zod schemas** for `ExternalPackage` and `InternalPricing`.
* **Sanitization:** compile MDX via `remark → rehype` with `rehype-raw` + `rehype-sanitize`.
* **Must have**: `meta.{id, slug, service}`, `hero.summary`, and at least one of `includesGroups` **or** `includesTable`.
* **Price rules:**

  * Price is **optional**; if present, must include `monthly` or `oneTime` with `currency: "USD"`.
  * If price **absent**, JSON-LD must **omit** `offers`.
* **Authoring lints (Mode A):** fail MDX when it contains price-like prose (`/\$\s*\d/`, `% off`, `per month`, etc.).
* **Monorepo gates:**

  * Each authoring folder produces one **per-slug external JSON**.
  * Slug uniqueness across taxonomy.
  * Adapter smoke test: generated JSON → PDO props → render **without runtime errors**.
  * Includes gate: reject packages with neither `includesGroups` nor `includesTable`.

---

# G) Where each field renders (UI map)

* **Template:** FAQSection, AddOnSection, RelatedItemsRail, CTASection, `PackageDetailExtras`.
* **PDO (left column):** TitleBlock, MetaRow, OutcomesBlock, FeatureList, IncludesFromGroups/PackageIncludesTable, NotesBlock, **PriceActionsBand**.
  *(Optional small blocks)*: PainPointsBlock, PurposeBlock, DeliverablesBlock.
* **PDO (right rail):** StickyRail/PackageCard compact summary.

---

# H) Phase organisms + typed blocks (composition)

Keep `PackagesDetailTemplate` as the page shell; render phase components inside `FullWidthSection`s.

**Add:**

```
src/packages/templates/PackagesDetailTemplate/parts/Phase1HeroSection/
src/packages/templates/PackagesDetailTemplate/parts/Phase2WhySection/
src/packages/templates/PackagesDetailTemplate/parts/Phase3WhatSection/
src/packages/templates/PackagesDetailTemplate/parts/Phase4DetailsSection/
src/packages/templates/PackagesDetailTemplate/parts/Phase5NextSection/
```

**Behavior highlights (updates):**

* **Phase 3** uses **PriceActionsBand** as the canonical band; only render `TieredPricingTable` when §D rules pass. No runtime reads of `internal.json`.
* DTOs are built in `src/packages/lib/registry/mappers.ts`:

  ```ts
  buildPhase1Hero(b) -> Phase1HeroDTO
  buildPhase2Why(b)  -> Phase2WhyDTO
  buildPhase3What(b) -> Phase3WhatDTO
  buildPhase4Details(b) -> Phase4DetailsDTO
  buildPhase5Next(b, ctx) -> Phase5NextDTO
  ```

**CSS/layout:** each phase has its own `*.module.css`. Container sizing stays in the template via `FullWidthSection` props.

**Backfill authoring keys (update):**

* Frontmatter: `highlights`, `painPoints`, `includes*`, `outcomes`, `extras`, `priceBand`, rails.
* **Do not** add `purposeHtml` to frontmatter—it's compiled from the body’s **`## Purpose`**.

---

# I) Build files to introduce

```
scripts/build-packages.ts
src/packages/lib/registry/schemas.ts
src/packages/lib/registry/adapter.pdo.ts        # external → PackageDetailOverviewProps
src/data/packages/__generated__/packages/*.external.json
src/data/packages/__generated__/index.json
```

*(Optional)*: `by-service/{service}.json` if hubs need faster SSR.

---

# J) Example adapter (PDO)

```ts
// src/packages/lib/registry/adapter.pdo.ts
import type { ExternalPackage } from "./schemas";

export function toPackageDetailOverviewProps(pkg: ExternalPackage) {
  return {
    id: pkg.meta.id,
    title: (pkg as any).meta.name ?? pkg.meta.slug.replace(/-/g, " "),
    tagline: pkg.hero.summary,
    meta: { category: pkg.meta.category, tags: pkg.meta.tags ?? [] },

    descriptionHtml: pkg.narrative?.overviewHtml,
    outcomes: pkg.outcomes ?? pkg.why_you_need_this?.outcomes ?? [],

    includes: { groups: pkg.includesGroups, table: pkg.includesTable },
    notesHtml: pkg.narrative?.notesHtml,

    priceBand: {
      ...(pkg.priceBand ?? {}),
      // The band owns label derivation; pass price as-is:
      price: pkg.price ?? pkg.priceBand?.price
    },

    sticky: { summary: pkg.hero.summary },
    extras: pkg.extras,
    faqHtml: pkg.narrative?.faqHtml,
    crossSell: pkg.crossSell,
    addOns: pkg.addOns
  };
}
```

---

# K) Testing & a11y

* **Unit:** RTL tests for each new Phase + Block; check empty states and ARIA.
* **Stories:** Storybook stories per Phase with sparse/dense knobs.
* **A11y:** one `h1` (hero), `h2` per phase, semantic lists, visible focus on CTAs.

---

# L) Migration steps

1. Add schemas + build script; wire `prebuild` to run build + validate.
2. Convert 1–2 pilot packages to `public.mdx` + `internal.json`.
3. Flip `base.ts` to import generated JSON (no change to your mappers/components).
4. Introduce Phases & small Blocks (Highlights/PainPoints/Purpose/Requirements).
5. Enable MDX price-prose lints (Mode A).
6. (Optional) Enable tier toggle on a sample package with at least one `is_public` tier.

---

# M) Acceptance criteria (DoD)

* [ ] Each authoring folder emits a validating **per-slug external JSON**.
* [ ] Detail page renders with or **without** a price (band handles both; JSON-LD respects absence).
* [ ] Includes gate passes: at least `includesGroups` **or** `includesTable`.
* [ ] MDX has **no** price prose in Mode A.
* [ ] Tier table renders **only** when `ui.showTieredPricing` is true and there’s ≥1 `is_public` tier; otherwise only the band shows.

---

This version is ready to drop into the repo as your canonical **package domain doc** and matches the code you’re building: **MDX → External JSON → typed base.ts → mappers → Phases/PDO**, with **safe pricing** and **scalable authoring** baked in.
