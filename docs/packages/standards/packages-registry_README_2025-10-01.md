---
title: "Registry Mappers: card.ts & details.ts"
domain: "packages"
file: "packages-registry_README_2025-10-01.md"
main: "packages-registry"
qualifier: "README"
date: "2025-10-01"
time: 12:00pm
status: "Approved"
owners: ["@yourname"]
tags: ["registry","mappers","packages","typescript","docs","templates"]
spotlight:
  - "Explains how card.ts and details.ts consume the typed base.ts data"
  - "Centralizes CTA, pricing band, and copy policy in shared mappers.ts"
  - "Keeps registry files ultra-thin (no JSX, no ad-hoc price prose)"
summary: "Clear README describing the registry layer: base.ts as the typed source of truth, ultra-thin card.ts and details.ts mappers that produce PackageCardProps and PackageDetailOverviewProps, and the centralized policy in shared helpers for CTAs, pricing bands, and copy—ensuring consistent, maintainable package pages."
links:
  related:
    - "./src/packages/lib/registry/mappers.ts"
    - "./src/packages/lib/band.ts"
    - "./src/packages/lib/pricing.ts"

---
Here’s a clear, complete **README.md** you can drop into
`src/packages/registry/README.md` (or alongside each registry family) to document how **`card.ts`** and **`details.ts`** work, how they depend on **`base.ts`**, and how to author new entries.

---

# Registry mappers: `card.ts` & `details.ts`

 *(and how they relate to* *`base.ts`* *)*

## What these files do

The registry layer provides **typed, UI-agnostic source data** for each package (via `base.ts`) and two ultra-thin mappers:

- **`card.ts`** → builds **`PackageCardProps`** for cards (default and rail variants).
- **`details.ts`** → builds **`PackageDetailOverviewProps`** for the “super card” detail page, including the **PriceActionsBand** and the pinned card in the right rail.

Both mappers delegate **all policy** (CTAs, price band variant, fine print placement, feature slicing, footnote safety, etc.) to centralized helpers in:

```
src/packages/lib/registry/mappers.ts
```

This keeps each package folder simple and consistent.

---

## Data flow (big picture)

```
registry/<family>/<slug>/base.ts (SSOT data)
          └── card.ts      → buildDefaultCard(base) / buildRailCard(base)
          └── details.ts   → buildPackageDetailOverviewProps(base)
                                    │
                                    ├── PackageDetailOverview (uses PriceActionsBand + StickyRail)
                                    └── Page templates import these props
```

- **No JSX in registry files.**
- **No “Starting at …” strings in authoring.**  All price UI is derived from the canonical `price` object in `base.ts`.

---

## `base.ts` (source of truth)

Each package folder **must include** a `base.ts` exporting a `base` object with the canonical authoring shape. The mappers read **only** from `base`.

Minimum fields that matter to `card.ts` & `details.ts`:

- `id`, `slug`, `service`, `name`
- `summary` (short value prop), optional `description` (longer paragraph)
- `price` (canonical `Money`: `{ monthly?: number; oneTime?: number; currency?: "USD" | string }`)
- `includes` (grouped bullets), `outcomes` (KPI bullets)
- Optional `priceBand` (detail-only copy): `{ tagline?, baseNote?, finePrint? }`
- Optional `tags`, `badges`, `tier`, `image`, `icp`, `notes`, `seo`, etc.

> See the `base.ts` README for full field docs.

---

## What `card.ts` does

- Produces **`PackageCardProps`** for:

  - **default** card (grid browsing)
  - **rail** card (thin variant used in rails)
- Applies CTA policy (**View details / Book a call**).
- Slices features to **top 5** (safe default).
- Normalizes footnote text to avoid `[object Object]`.

It **does not**:

- Render any JSX.
- Decide price band copy (cards never show baseNote/finePrint; that’s detail-only).
- Build CTA labels directly (that comes from mappers).

---

## What `details.ts` does

- Produces **`PackageDetailOverviewProps`** for the **Detail Overview** section, including:

  - **PriceActionsBand** inputs (variant, tagline, baseNote, finePrint).
  - **Pinned rail card** (uses card visuals but **detail CTA policy**: Request proposal / Book a call).
  - **Includes** (groups → grid, or a table fallback if provided).
- Does **not** synthesize a tagline from summary; `tagline` comes only from `base.priceBand.tagline`.

---

## Dependencies

Both registry mappers depend on:

- `src/packages/lib/registry/mappers.ts`

  - `buildDefaultCard`, `buildRailCard`, `buildPinnedCompactCard` (optional)
  - `buildPackageDetailOverviewProps`
  - Utilities like `normalizeFootnote`, `buildIncludesTable`
- `src/packages/lib/band.ts` (called inside mappers to resolve band variants)
- `src/packages/lib/pricing.ts` (central `Money` type and helpers; used by components down the chain)

> **Important:**  `@/packages/lib/cta` was deleted.
> Do **not** import from it. CTA policy now lives in `mappers.ts` (and labels in `copy.ts`).

---

## Authoring conventions

- **Naming:**  Use **camelCase** based on the slug for all exports.

  - `lead-routing-distribution` → `leadRoutingDistributionCard`, `leadRoutingDistributionDetail`, etc.
- **Thin files:**  Keep `card.ts` and `details.ts` to a couple of lines; **never** re-implement policy locally.
- **Band copy:**  Only supply `tagline`, `baseNote`, `finePrint` via `base.priceBand`.
  Do not fallback to `summary`.

---

## Templates (copy/paste and fill)

### Generic `card.ts` Template

```ts
// registry/<family>/<slug>/card.ts
import { buildDefaultCard, buildRailCard } from "@/packages/lib/registry/mappers";
import { base } from "./base";

/**
 * Card mappers for: <slug>
 * - Keep these ultra-thin; all policy lives in mappers.ts
 * - Named exports follow the slug in camelCase for consistency.
 */
export const <slugCamel>Card = buildDefaultCard(base);
export const <slugCamel>CardRail = buildRailCard(base);

// Optional default for simpler imports
export default <slugCamel>Card;
```

### Generic `details.ts` Template

```ts
// registry/<family>/<slug>/details.ts
import { buildPackageDetailOverviewProps } from "@/packages/lib/registry/mappers";
import { base } from "./base";

/**
 * Detail overview mapper for: <slug>
 * - Produces PackageDetailOverviewProps consumed by the section component.
 * - PriceActionsBand copy (tagline/base note/fine print) is handled via mappers.ts.
 */
export const <slugCamel>Detail = buildPackageDetailOverviewProps(base);

// Optional default for simpler imports
export default <slugCamel>Detail;
```

---

## Real examples

### 1) Lead Gen → **lead-routing-distribution**

**`src/packages/registry/lead-generation-packages/lead-routing-distribution/card.ts`**

```ts
// registry/lead-generation-packages/lead-routing-distribution/card.ts
import { buildDefaultCard, buildRailCard } from "@/packages/lib/registry/mappers";
import { base } from "./base";

/**
 * Card mappers for: lead-routing-distribution
 */
export const leadRoutingDistributionCard = buildDefaultCard(base);
export const leadRoutingDistributionCardRail = buildRailCard(base);

export default leadRoutingDistributionCard;
```

**`src/packages/registry/lead-generation-packages/lead-routing-distribution/details.ts`**

```ts
// registry/lead-generation-packages/lead-routing-distribution/details.ts
import { buildPackageDetailOverviewProps } from "@/packages/lib/registry/mappers";
import { base } from "./base";

/**
 * Detail overview mapper for: lead-routing-distribution
 */
export const leadRoutingDistributionDetail = buildPackageDetailOverviewProps(base);

export default leadRoutingDistributionDetail;
```

---

### 2) Marketing → **reputation-management**

Assumes you have `marketing-packages/reputation-management/base.ts` authored with the canonical shape (including `price`, optional `priceBand`, etc.).

**`src/packages/registry/marketing-packages/reputation-management/card.ts`**

```ts
// registry/marketing-packages/reputation-management/card.ts
import { buildDefaultCard, buildRailCard } from "@/packages/lib/registry/mappers";
import { base } from "./base";

/**
 * Card mappers for: reputation-management
 */
export const reputationManagementCard = buildDefaultCard(base);
export const reputationManagementCardRail = buildRailCard(base);

export default reputationManagementCard;
```

**`src/packages/registry/marketing-packages/reputation-management/details.ts`**

```ts
// registry/marketing-packages/reputation-management/details.ts
import { buildPackageDetailOverviewProps } from "@/packages/lib/registry/mappers";
import { base } from "./base";

/**
 * Detail overview mapper for: reputation-management
 */
export const reputationManagementDetail = buildPackageDetailOverviewProps(base);

export default reputationManagementDetail;
```

---

## Gotchas & lint hints

- **Do not leave placeholders** like `<sku>` in TypeScript files — this causes the
  `Unexpected token '<'` build error. Replace them with camelCase exports derived from your slug.
- **Do not import** from `@/packages/lib/cta` (deleted).
  Use the centralized builders in `@/packages/lib/registry/mappers`.
- **Cards don’t show fine print** or base notes. Only the detail page band does.
- **Tagline never falls back** to `summary`. If not authored in `base.priceBand`, it simply doesn’t appear.
- **Prefer default + named exports** in mappers if your importers vary.

---

## Quick checklist (acceptance)

- `base.ts` contains canonical `price` and (optional) `priceBand`.
- `card.ts` exports `<slugCamel>Card` and `<slugCamel>CardRail` by calling the centralized builders.
- `details.ts` exports `<slugCamel>Detail` by calling the centralized builder.
- No references to `cta.ts`.
- Detail page renders **PriceActionsBand** once with the correct variant and copy (from `base.priceBand`).
- Pinned rail card CTA switches to **Request proposal** as per policy.

---

With these patterns, adding a new package is \~5 minutes: write `base.ts`, copy the templates above into `card.ts` and `details.ts`, rename the exports to camelCase, and you’re done.