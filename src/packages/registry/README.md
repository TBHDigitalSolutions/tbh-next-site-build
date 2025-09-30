Here’s a drop-in **README.md** for `src/packages/registry/` that explains the folder layout, roles of each file, how it ties into the shared mappers, and answers your “do we need an index?” question with practical options.

---

# Packages Registry

**Purpose:** This directory is the *authoring source of truth* for every package we sell.
Each package lives in its own subfolder and ships three tiny files:

* `base.ts` – canonical data (UI-agnostic, typed, no JSX)
* `card.ts` – builds **PackageCardProps** from `base`
* `details.ts` – builds **PackageDetailOverviewProps** (detail “super card”) from `base`
* `README.md` – (optional) per-package notes for authors

All policy (CTA text/targets, price band variant, “top 5” features, safe footnote handling, etc.) lives centrally in `src/packages/lib/registry/mappers.ts`. The registry files are intentionally *thin* so we don’t duplicate logic across packages.

---

## Directory layout

```
src/packages/registry/
├─ lead-generation-packages/
│  └─ lead-routing-distribution/
│     ├─ base.ts
│     ├─ card.ts
│     ├─ details.ts
│     └─ README.md
├─ marketing-packages/
│  └─ reputation-management/
│     ├─ base.ts
│     ├─ card.ts
│     └─ details.ts
├─ seo-packages/
├─ web-development-packages/
├─ video-production-packages/
└─ content-production-packages/
```

The top level folders correspond to our six services:

* **Lead Generation Packages**
* **Marketing Packages**
* **SEO Packages**
* **Web Development Packages**
* **Video Production Packages**
* **Content Production Packages**

Each package folder name is a *slug* (e.g., `lead-routing-distribution`).

---

## File roles

### 1) `base.ts` — canonical authoring data

* **Single Source of Truth** for the package.
* Contains identity, taxonomy, the canonical **price** object, highlights, includes, outcomes, optional **priceBand** copy, and other descriptive fields.
* No JSX. No “Starting at …” strings. Price UI is derived at render time.

> See the separate `base.ts` documentation for the full type and authoring guidance.

### 2) `card.ts` — map to PackageCard

A minimal wrapper that imports `base` and calls the centralized builder:

```ts
import { buildDefaultCard, buildRailCard } from "@/packages/lib/registry/mappers";
import { base } from "./base";

export const <slugCamel>Card = buildDefaultCard(base);
export const <slugCamel>CardRail = buildRailCard(base);

export default <slugCamel>Card; // optional
```

* **What it does:** Produces `PackageCardProps` for the default and rail variants.
* **Policy:** CTAs (“View details” / “Book a call”), top-5 features, footnote normalization—handled by the builders in `mappers.ts`.

### 3) `details.ts` — map to PackageDetailOverview

A minimal wrapper that imports `base` and calls the centralized builder:

```ts
import { buildPackageDetailOverviewProps } from "@/packages/lib/registry/mappers";
import { base } from "./base";

export const <slugCamel>Detail = buildPackageDetailOverviewProps(base);
export default <slugCamel>Detail; // optional
```

* **What it does:** Produces `PackageDetailOverviewProps` (the left column “super card”), including:

  * **PriceActionsBand** inputs (variant, tagline, base note, fine print)
  * **Pinned card** for the right rail (with detail CTA policy:
    “Request proposal” / “Book a call”)
* **Important rule:** `tagline` never falls back to `summary`. If `base.priceBand?.tagline` is not authored, the band simply omits it.

---

## Shared helpers you rely on

* `src/packages/lib/registry/mappers.ts`

  * `buildDefaultCard`, `buildRailCard`, `buildPackageDetailOverviewProps`
  * `normalizeFootnote`, `buildIncludesTable`
* `src/packages/lib/band.ts`

  * `resolveBandVariant("detail" | "card", price)`, `defaultBaseNote(price)`
* `src/packages/lib/pricing.ts`

  * Shared `Money` type, `formatMoney`, normalization & SR sentence
* `src/packages/lib/copy.ts`

  * Central labels/constants (`CTA`, `BASE_NOTE`, `BADGE`, ARIA helpers)

> Note: the old `@/packages/lib/cta` file was **deleted**. Don’t import it. CTA policy now lives in the registry `mappers.ts` (labels in `copy.ts`).

---

## Naming conventions

* Folder name = **slug** (kebab-case), e.g., `lead-routing-distribution`.
* Export names = **camelCase** based on the slug:

  * `leadRoutingDistributionCard`
  * `leadRoutingDistributionCardRail`
  * `leadRoutingDistributionDetail`

Avoid placeholders like `<sku>` in TypeScript—this will break the build.

---

## Authoring workflow (add a new package)

1. Create `src/packages/registry/<service-folder>/<slug>/`.
2. Add `base.ts` with the canonical data. Include `price` and optional `priceBand`:

   ```ts
   price: { monthly?: number; oneTime?: number; currency?: "USD" }
   priceBand?: { tagline?: string; baseNote?: "proposal" | "final"; finePrint?: string }
   ```

3. Add **tiny** `card.ts` and `details.ts` using the templates above.
4. (Optional) Add a per-package `README.md` with authoring notes.

That’s it—the page templates and sections consume these props directly.

---

## Example imports (consumers)

From a **page** or **template**, you typically import the built props:

```ts
import { leadRoutingDistributionDetail } from "@/packages/registry/lead-generation-packages/lead-routing-distribution/details";
import { leadRoutingDistributionCard } from "@/packages/registry/lead-generation-packages/lead-routing-distribution/card";

// Use leadRoutingDistributionDetail with <PackageDetailOverview />
// Use leadRoutingDistributionCard inside rails or related sections
```

If you prefer indirection (e.g., dynamic routes), see the **index options** below.

---

## FAQ: Do we need an `index.ts` or `index.json` to map all packages?

**Short answer:** Not required, but **recommended** if you want to:

* Build **category pages** that list *all* packages in a service.
* Generate **sitemaps** and **search indexes**.
* Support **dynamic routing** like `/packages/[slug]` without hand-written imports.

You have three common options:

### Option A — Barrel `index.ts` (easiest to maintain, typed)

Create `src/packages/registry/index.ts` that exports a **typed record** of slugs → lazy loaders (or direct props):

```ts
// src/packages/registry/index.ts
export type Slug =
  | "lead-routing-distribution"
  | "reputation-management"
  // ...add more here (or generate)

export const packageIndex = {
  "lead-routing-distribution": () =>
    import("./lead-generation-packages/lead-routing-distribution/details").then(m => m.leadRoutingDistributionDetail),
  "reputation-management": () =>
    import("./marketing-packages/reputation-management/details").then(m => m.reputationManagementDetail),
  // ...
} satisfies Record<Slug, () => Promise<any>>;
```

**Pros:** Typed, tree-shakeable (with dynamic import), easy to use in getData() functions.
**Cons:** Manual bookkeeping unless you codegen.

### Option B — Data registry JSON (`index.json`)

Maintain a JSON with metadata only (id, slug, service, name, routes). Import it where you need listing, and still import each package’s `details.ts` on demand.

**Pros:** Can be consumed by any layer (Node/Edge), easy to search/filter.
**Cons:** Duplication risk unless you generate it from `base.ts` files.

### Option C — Codegen (best of both)

Add a small script that scans `src/packages/registry/**/base.ts` and **generates** a typed `index.ts` (and/or `index.json`) automatically. Run it in `postinstall` or as a build step.

**Pros:** Zero duplication, always in sync, strongly typed.
**Cons:** Requires a tiny build tool (ts-node/esbuild) but pays off quickly.

**Recommendation:** Start with **Option A** (manual barrel) until you have ~10+ packages; then switch to **codegen** for scale.

---

## Guardrails & acceptance

* **No JSX** in registry files (`base.ts`, `card.ts`, `details.ts`).
* **Do not author “Starting at …”** strings; the UI derives prices from `price`.
* **Cards do not show** band base notes or fine print—detail page only.
* **No tagline-from-summary fallback.** If `priceBand.tagline` is absent, omit it.
* **Import policy** from `mappers.ts`; do not re-implement per package.
* **ARIA labels** and CTA copy are standardized via `copy.ts` + `mappers.ts`.

---

## Troubleshooting

* **Unexpected token `<` in `card.ts`/`details.ts`:**
  You likely left placeholders like `<sku>` in code. Replace with camelCase names based on the slug.

* **Module not found: `@/packages/lib/cta`:**
  That file was deleted. Use the CTA policy in `@/packages/lib/registry/mappers` instead.

* **Price formatting inconsistencies:**
  Ensure all consumers import `Money` and `formatMoney` from `src/packages/lib/pricing.ts` (we export **both** named and default to avoid import drift).

---

With this structure, adding or updating packages is fast, consistent, and safe. The shared mappers keep visual/policy rules centralized, while each registry entry stays a tiny, readable veneer over your canonical `base.ts`.
