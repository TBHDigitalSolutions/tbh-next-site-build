# UI Types (readme)

> Location: `src/packages/lib/types/*`
> Import surface (barrel): `@/packages/lib/types`

This folder contains **UI-only type aliases** that reference your runtime package SSOT (`package-schema.ts`) without duplicating it. Use these types in **components**, **adapters**, and **pages** to keep compile-time safety while staying independent from I/O, registry, or React runtime details.

---

## Why this exists

* **No duplication:** We alias types from the SSOT (`package-schema.ts`) instead of re-declaring them. When the schema changes, your UI types automatically reflect it.
* **UI-only:** These files export **types only** (no functions, constants, or side effects) so you can safely import them anywhere.
* **Stable imports:** Everything is re-exported via `src/packages/lib/types/index.ts` so call-sites don’t need to know the internal file layout.

---

## What should use these types?

* **Components** (e.g., `PriceActionsBand`, `PackageCard`, `IncludesTable`) → Props use `Money`, `PriceBandCopy`, `BandVariant`, `Cta`, etc.
* **Adapters/Mappers** (e.g., `adapters/index.ts`, `adapters/growth.ts`, `mappers/package-mappers.ts`) → Return UI view-models that reference `Money`, `PackageRuntime`, `PackageBundle`.
* **Pages/sections** (Next.js server & client) → Compose prop objects and JSON-LD with strong typing.
* **Build/SSG scripts** that *shape* data for UI (but **do not** read the filesystem here; use `registry/loader.ts` for that).

**Do not** import these files from code that defines the SSOT itself or performs registry I/O—keep layering clean.

---

## File-by-file tour

### 1) `types.ts` — Core UI aliases (SSOT-aware)

* **What it exports**

  * `PackageRuntime`: alias of the full validated runtime package from `package-schema.ts`.
  * `Slug`, `Href`: branded string aliases (editor hints).
  * `CurrencyCode`, `ServiceSlug`: derived from SSOT types.
  * `PackageIdentity`: common header/metadata fields picked from the runtime schema.
  * `IncludeGroup`, `IncludeGroups`: “What’s included” authoring types (picked from SSOT).
  * `Money`: alias of the canonical pricing payload (SSOT).
  * `PriceBand`: alias of runtime package’s `priceBand` (author microcopy).
  * `PackageBundle`: **UI-local lightweight view-model** for grids/lists when you don’t want to pass the full runtime package around.

* **Use in**

  * Adapters and mappers that transform runtime packages into smaller view-models.
  * Components that only need a subset of the runtime package (e.g., identity + price).

* **Avoid**

  * Re-declaring SSOT fields (pick from `PackageRuntime` instead).
  * Putting runtime logic here (keep this file **types-only**).

---

### 2) `pricing.ts` — Pricing type helpers (types only)

* **What it exports**

  * `Money`: alias of the SSOT money schema type.
  * `CurrencyCode`: ISO code union derived from `Money`.
  * `PriceNote`: optional author note (string).
  * `PriceRange`: minimal UI filter structure for monthly price sliders, etc.

* **Use in**

  * `PriceActionsBand` props.
  * Filters and sorting in UI lists/grids.

* **Avoid**

  * Formatting or business logic here—put that in `utils/pricing` or your band/adapters.

---

### 3) `copy.ts` — CTA & copy shapes (types only)

* **What it exports**

  * `Cta`, `CtaPair`, `CtaLabel`: structural shapes for buttons/links.
  * `BadgeLabel`: string token for labels like “STARTING AT”.

* **Use in**

  * Components and adapters that pass CTAs around.
  * Copy systems or translation layers that return typed CTA objects.

* **Avoid**

  * Hardcoding English labels here—use `utils/cta.ts` (values) and keep this file to **types only**.

---

### 4) `band.ts` — Price band presentation types (types only)

* **What it exports**

  * `BandContext`: `"detail" | "card"`.
  * `BandVariant`: `"detail-hybrid" | "detail-oneTime" | "card-hybrid" | "card-oneTime"`.
  * `PriceBandCopy`: microcopy fields shown near the price (tagline, baseNote, finePrint).
  * `PriceBandProps`: minimal, framework-agnostic band prop shape.

* **Use in**

  * `PriceActionsBand` component props and any band decision utility (e.g., `utils/band.ts`).
  * Detail page overview mappers that pass `price` and `priceBand` to the band.

* **Avoid**

  * Implementing the variant selection or notes policy here—keep decisions in `utils/band.ts` (or your mapper), not in types.

---

### 5) `index.ts` — Barrel export

* **What it exports**

  * Re-exports everything from `types.ts`, `pricing.ts`, `copy.ts`, `band.ts`.

* **Use in**

  * All import sites:

    ```ts
    import type { Money, CtaPair, BandVariant, PackageRuntime } from "@/packages/lib/types";
    ```

* **Avoid**

  * Importing deep paths in UI code. Stick to the barrel unless you’re refactoring types.

---

## Typical usage patterns

### Components

```ts
// PriceActionsBand.tsx
import type { Money } from "@/packages/lib/types";
import type { PriceBandCopy, BandVariant } from "@/packages/lib/types";

export type PriceActionsBandProps = {
  variant: BandVariant;
  price: Money;
  copy?: PriceBandCopy;   // tagline, baseNote, finePrint
  ctaPrimary: { label: string; href: string };
  ctaSecondary?: { label: string; href: string };
};
```

```ts
// PackageCard.tsx
import type { Money, CtaPair } from "@/packages/lib/types";

export type PackageCardProps = {
  slug: string;
  name: string;
  summary?: string;
  price?: Money;
  ctas: CtaPair;
  badge?: string;
};
```

### Adapters / Mappers

```ts
// adapters/index.ts
import type { PackageBundle, Money, CtaPair } from "@/packages/lib/types";

export function toCardModel(b: PackageBundle): {
  name: string;
  slug: string;
  price?: Money;
  ctas: CtaPair;
} {
  // …map and return
}
```

```ts
// mappers/package-mappers.ts
import type { PackageRuntime, Money, PriceBand } from "@/packages/lib/types";
// Build detail overview props using runtime package + band types
```

### Scripts (build/SSG)

* **Load** runtime packages with `registry/loader.ts`.
* **Type** loaded values as `PackageRuntime`.
* **Shape** UI props using the types in this folder.

```ts
import { loadAllPackages } from "@/packages/lib/registry/loader";
import type { PackageRuntime } from "@/packages/lib/types";

const { items } = await loadAllPackages();
const pkg: PackageRuntime = items[0].data;
```

---

## Migration tips

* If a component currently imports domain types from random places, replace those with:

  ```ts
  import type { Money, Cta, CtaPair, PriceBandCopy, BandVariant } from "@/packages/lib/types";
  ```

* For **runtime** package content, use `PackageRuntime`. For **UI lists**, consider `PackageBundle` (or keep passing the full runtime type if convenient).
* **Remove duplicated interfaces** in UI code—prefer `Pick<PackageRuntime, "field" | "field">` when you only need a subset.

---

## Do’s & Don’ts

**Do**

* ✅ Import types from the barrel: `@/packages/lib/types`.
* ✅ Reference SSOT via aliases (e.g., `Money`, `PackageRuntime`).
* ✅ Keep these files **types only**.

**Don’t**

* ❌ Add functions, constants, or formatting rules here.
* ❌ Re-declare schema types that already exist in `package-schema.ts`.
* ❌ Import React or runtime modules from this folder.

---

## Quick reference

* **Runtime package** (validated): `PackageRuntime`
* **Lightweight UI bundle**: `PackageBundle`
* **Money** (SSOT): `Money`
* **Band**: `BandVariant`, `BandContext`, `PriceBandCopy`, `PriceBandProps`
* **CTA**: `Cta`, `CtaPair`, `CtaLabel`, `BadgeLabel`
* **Includes**: `IncludeGroup`, `IncludeGroups`
* **Identity**: `PackageIdentity`
* **Pricing filters**: `PriceRange`

---

## Dependency boundaries

* `types/*` ⟶ **import**: SSOT types from `package-schema.ts` (types only)
* `types/*` ⟶ **used by**: components, adapters, mappers, pages
* `types/*` ⟶ **does not import**: React, registry loader, pricing utils, copy values

---

If you ever extend the SSOT (e.g., new fields on `priceBand`), prefer updating `package-schema.ts` first, then **alias** here rather than duplicating. This keeps your UI types crisp, future-proof, and easy to reason about.
