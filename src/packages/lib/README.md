## `src/packages/lib/README.md`

# Packages Library

> A small, framework-agnostic toolbox for working with **product packages**:
> validation (SSOT schemas), registry loading, mapping runtime content to
> UI-friendly props, adapters, and utility helpers.

This folder is intentionally **modular** and **pure** (no React runtime). You can safely import it from:

- Next.js **RSC/SSR** and build scripts
- UI components (cards, bands, detail overviews)
- CLI utilities (catalog reports, static generation)

---

## Folder layout

```

src/packages/lib
├── adapters/                 # Component-agnostic view-model adapters
│   ├── index.ts              # General adapters (cards, price blocks, includes, add-ons, JSON-LD helpers)
│   ├── growth.ts             # Growth section–specific mappers & selection helpers
│   └── readme.md
├── mappers/
│   ├── package-mappers.ts    # Runtime Package → Detail/Card props (phases 1–5, CTAs, includes fallbacks)
│   └── readme.md
├── registry/
│   ├── loader.ts             # Minimal I/O loader for content.generated.json (+ Zod validation)
│   └── readme.md
├── types/                    # UI-only type aliases (thin, SSOT-aware)
│   ├── band.ts
│   ├── copy.ts
│   ├── index.ts
│   ├── pricing.ts
│   ├── readme.md
│   └── types.ts
├── utils/                    # Framework-agnostic helpers (copy, cta policy, pricing, jsonld)
│   ├── copy.ts
│   ├── cta.ts
│   ├── jsonld.ts
│   ├── pricing.ts
│   └── readme.md
├── mdx-frontmatter-schema.ts # Authoring-time MDX frontmatter → runtime transformer (Zod)
├── package-schema.ts         # **Single Source of Truth** runtime schema + parser
└── index.ts                  # Public barrel for the whole lib

````

---

## Design principles

- **SSOT-first.** The canonical runtime types & validators live in `package-schema.ts`.
- **Pure + deterministic.** No React, no global I/O in mappers/adapters/utilities.
- **Separation of concerns.**
  - **registry/loader.ts**: only discovery + JSON read + schema validation.
  - **mappers/**: only runtime → UI props (detail/card/rail).
  - **adapters/**: general view-model adapters (e.g., grid items, price blocks).
  - **utils/**: CTA policy, copy, pricing & JSON-LD builders.
  - **types/**: UI-only type aliases—thin and SSOT-aware.
- **Ergonomic imports.** Use `src/packages/lib/index.ts` as a single entrypoint.

---

## Quickstart

### 1) Load & validate packages (SSG / build)

```ts
import { loadAllPackages } from "@/packages/lib/registry/loader";

const { items, errors } = await loadAllPackages();
if (errors.length) {
  // fail CI or log nicely — errors include file paths and Zod issue paths
}
const packages = items.map((x) => x.data);
````

### 2) Build grid cards for a hub

```ts
import { buildPackageCardProps } from "@/packages/lib/mappers/package-mappers";

const cards = packages.map((p) => buildPackageCardProps(p, { variant: "default" }));
// Render <PackageCard {...cards[i]} />
```

### 3) Render a detail page overview (phases 1–5)

```ts
import { buildPackageDetailOverviewProps } from "@/packages/lib/mappers/package-mappers";

const pkg = packages.find((p) => p.slug === params.slug)!;
const overview = buildPackageDetailOverviewProps(pkg);
// Render your <PackageDetailOverview {...overview} />
```

### 4) JSON-LD for SEO

```ts
import { buildServiceJsonLd, safeStringify } from "@/packages/lib/utils/jsonld";

const json = buildServiceJsonLd(pkg);
// <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeStringify(json) }} />
```

### 5) CTA policy + pricing helpers in components

```ts
import { cardCtas, sectionCtas } from "@/packages/lib/utils/cta";
import { startingAtLabel, isHybrid } from "@/packages/lib/utils/pricing";

const { primary, secondary } = cardCtas({ slug: pkg.slug, title: pkg.name });
const teaser = startingAtLabel(pkg.price); // "Starting at $X/mo …"
const variant = isHybrid(pkg.price) ? "detail-hybrid" : "detail-oneTime";
```

---

## When to use each module

| Use case                                 | Import from                      | Why                                                              |
| ---------------------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| Discover/read/validate registry content  | `registry/loader.ts`             | Clean I/O + Zod validation with helpful errors                   |
| Map runtime package → detail/card props  | `mappers/package-mappers.ts`     | Enforces CTA policy, includes fallbacks, passes canonical price  |
| Build grid/price models and add-on cards | `adapters/index.ts`              | Component-agnostic view models for cards, price blocks, includes |
| Growth marketing section                 | `adapters/growth.ts`             | Concise bullets, simple price fields, featured/top-N helpers     |
| Price formatting, predicates             | `utils/pricing.ts`               | Pure helpers (`isHybrid`, `formatMoney`, `startingAtLabel`)      |
| CTA routes + labels                      | `utils/cta.ts` + `utils/copy.ts` | One place for “which CTA where” and accessible labels            |
| JSON-LD (POJO)                           | `utils/jsonld.ts`                | Build `ItemList`/`Service` schemas, caller injects as `<script>` |
| UI-only types                            | `types/index.ts`                 | Thin aliases that reference SSOT types (no duplication)          |

---

## Public API (cheat sheet)

* **Schemas**: `parsePackage`, `PackageSchema`, `PackageSchemaType` (from `package-schema.ts`)
* **Registry**: `discoverPackageEntries`, `loadAllPackages`, `loadPackageBySlug`, `collectPackageRoutes`, `indexBySlug`, `clearLoaderCache`
* **Mappers**: `buildPackageCardProps`, `buildPackageDetailOverviewProps`, `buildPinnedCardForDetail`, plus includes helpers
* **Adapters (general)**: `toPackageCard`, `toPackageGridItems`, `toPriceBlock`, `toIncludesTable`, `toAddOnCardProps`, `toHubModel`, `toDetailModel`
* **Adapters (growth)**: `bundleToGrowthPackage`, `mapBundlesToGrowthPackages`, `topNForService`, `featuredOrTopN`, `sortGrowthPackages`, `selectBySlugs`
* **Utils**:

  * `copy.ts`: `CTA`, `BASE_NOTE`, `BADGE`, `ariaViewDetailsFor`, `ariaBookCallAbout`, `ariaRequestProposalFor`
  * `cta.ts`: `ROUTES`, `cardCtas`, `sectionCtas`
  * `pricing.ts`: `formatMoney`, `normalizeMoney`, `startingAtLabel`, `srPriceSentence`, `isHybrid`, `isMonthlyOnly`, `isOneTimeOnly`, etc.
  * `jsonld.ts`: `buildItemListJsonLd`, `buildServiceJsonLd`, `safeStringify`
* **Types**: import from `@/packages/lib/types` (barrel)

---

## Testing guidance

* **registry/loader**: mock fs with fixtures; assert `items`/`errors` stability
* **mappers**: property tests for CTA policy, includes fallbacks, feature selection
* **pricing utils**: table tests for predicates & formatting with different locales
* **jsonld utils**: deep-equal snapshots; assert `offers` presence/absence
* **adapters**: check view-models are pure and stable across inputs

---

## Versioning & change control

* Treat `package-schema.ts` as **breaking** when fields change (bump, codemod).
* Exports in `index.ts` are the **public surface**; changing names/paths is breaking.
* Keep **React-free** code in this lib to avoid circular deps and runtime coupling.

---
