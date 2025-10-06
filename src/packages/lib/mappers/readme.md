`src/packages/lib/mappers/readme.md`

---

# Package Mappers

**normalizers + transforms + registry/mappers ⇒ `mappers/package-mappers.ts`**
One place to convert a **validated runtime package** → **component props** (cards, detail page, phases), plus collection utilities (search/filter/sort/paginate/stats).

This directory provides:

* A single, production-ready module: `package-mappers.ts`
* Pure, framework-agnostic functions
* Zero duplication of schemas or UI code
* Thorough in-code docs (see the file header)

---

## Why this exists

Historically, we had a mix of “normalizers”, “registry mappers”, and “transforms” scattered across `lib/`. That made it hard to tell:

* which shape was author-facing (MDX),
* which shape was the canonical runtime (what components actually use),
* and which functions should be called by which component.

`package-mappers.ts` consolidates the **runtime → UI** mapping in one file and adds small, portable **collection utilities** for the catalog/grid. It **does not** duplicate validation or formatting logic:

* **Validation** stays in the SSOT schemas:

  * Authoring: `src/packages/lib/mdx-frontmatter-schema.ts`
  * Runtime: `src/packages/lib/package-schema.ts`
* **Price formatting / band selection** stays in your pricing utilities (outside mappers).

---

## When to use which layer

* **Authoring (MDX):**
  Parse + transform with:

  * `PackageMarkdownSchema` and `frontmatterToPackage(...)` from `mdx-frontmatter-schema.ts`.
  * This produces a strict **runtime package** that matches `PackageSchema`.

* **Runtime (app / SSG / loaders):**
  Use the mappers in **this** module to turn the runtime package into:

  * Card props for grids/lists
  * Detail page super-card (feeds phases 1–5)
  * Includes table fallbacks
  * CTA policy for card vs. detail surfaces
  * Collection utilities for search/filter/sort/paginate/metrics

---

## Types at a glance

* `PackageMetadata` — the validated, canonical **runtime** object from `package-schema.ts`.
* `PackageMarkdown` — the author-facing **MDX** frontmatter type from `mdx-frontmatter-schema.ts`.
* Local UI prop models:

  * `PackageCardProps`
  * `PackageDetailOverviewProps`
  * `PackageIncludesTableProps`

These small prop types keep the mappers **decoupled** from your React components. Your UI can import these types or map further if needed.

---

## Quick start (runtime → UI)

```ts
import { parsePackage } from "@/packages/lib/package-schema";
import {
  buildPackageCardProps,
  buildPackageDetailOverviewProps,
} from "@/packages/lib/mappers/package-mappers";

// 1) You already have validated runtime JSON
const pkg = parsePackage(runtimeJson);

// 2) Card UI
const cardProps = buildPackageCardProps(pkg);

// 3) Detail page super-card (feeds phases 1–5 sections)
const detailProps = buildPackageDetailOverviewProps(pkg);
```

---

## Components that should use it

* **Catalog/Grid/List**

  * `<PackageCard />` → `buildPackageCardProps(pkg)`
  * “Pinned”/rail cards on detail pages → `buildPinnedCardForDetail(pkg)`
* **Package Detail Page**

  * Super-card / Overview (phases 1–5 inputs) → `buildPackageDetailOverviewProps(pkg)`
  * “What’s included” (fallback table) → prefer groups; if absent the mapper adapts `includesTable` or synthesizes one column from groups
* **Analytics / Scripting**

  * Use the collection utilities to search/filter/sort/paginate and compute stats over a list of bundles

---

## API reference (grouped)

### A) Authoring compatibility

> Prefer `frontmatterToPackage(...)` from `mdx-frontmatter-schema.ts`.
> Use `normalizePackage(...)` only for legacy sites that passed frontmatter around.

* `normalizePackage(input: PackageMarkdown): Partial<PackageMetadata>`
  Light alias fixer (`includesGroups` → `includes`, unify FAQ `q/a` vs `question/answer`, normalize cross-sell/add-on field names). **Not a validator**.

### B) CTA policy (pure functions)

* `buildCardCtas(nameOrSlug, slug)` → `{ primaryCta, secondaryCta }`
  Cards: **View details** (→ `/packages/[slug]`) + **Book a call** (→ `/book`).

* `buildDetailCtas(name?)` → `{ primary, secondary }`
  Detail: **Request proposal** (→ `/contact`) + **Book a call** (→ `/book`).

You can override labels downstream if you have a central copy system. Mappers expose stable defaults and ARIA labels.

### C) Includes adapters (groups ⇄ table)

* `buildIncludesTableFromGroups({ name, includes })` → one-column fallback
* `mapIncludesTable(pkg)` → returns authored table if present/valid

### D) Card mappers

* `buildPackageCardProps(pkg, { variant?, highlight? })` → `PackageCardProps`

  * Feature bullets: prefers `pkg.features`, falls back to first 5 include items
  * Price: passes canonical `pkg.price` (no formatting)
  * “Footnote”: normalized from `pkg.notes`
  * CTA policy: card (view details / book a call)

* `buildPinnedCardForDetail(pkg)` → card with **detail** CTAs (request proposal / book)

Convenience aliases:

* `buildDefaultCard(pkg)`, `buildRailCard(pkg)`, `buildPinnedCompactCard(pkg)`

### E) Detail mapper (super-card → phases)

* `buildPackageDetailOverviewProps(pkg)` → `PackageDetailOverviewProps`
  Provides the complete inputs your detail page needs:

  * **Phase 1**: `title`, `valueProp`, `description`, `icp`
  * **Price & band**: `packagePrice`, `priceBand` (formatting/variant downstream)
  * **CTAs**: detail policy (`ctaPrimary`, `ctaSecondary`)
  * **Phase 2–3**: `features`, `outcomes`, `includesGroups` **or** `includesTable`
  * **Pinned rail card**: `pinnedPackageCard`
  * **Phase 4 extras**: `extras.timeline`, `extras.ethics`, `extras.requirements`
  * **Notes**: normalized `notes`

> If your sections expect smaller prop subsets (e.g., `Phase2Props`), create **thin selectors** that pick from `PackageDetailOverviewProps` rather than re-mapping the runtime object. See “Phase selectors” below.

### F) Collection utilities (grids, scripts)

These are intentionally small and portable:

* Price helpers: `effectiveMonthly`, `effectiveSetup`, `computeYearly`
* Indices & uniqueness: `indexBySlug`, `mapBySlug`, `ensureUniqueBySlug`
* Features: `flattenIncludes`, `featureCount`, `dedupeFeatures`
* Transforms pipeline: `pipeBundles(...ops)`
* Filters: `searchBundles`, `filterByService`, `filterByMonthlyPrice`, `filterByFeatureCount`
* Sorters: `sortBundles(mode, featuredSlugs?)`
* Pagination: `limit(n)`, `paginate(page, pageSize)`
* Stats: `computeStats(bundles)`
* Selectors: `topNForService`, `pickBySlugs`
* Immutable updates: `withUpdatedPrice`, `withAddedFeatures`, `withoutAddOn`

These work on a light `PackageBundle` model (not the full runtime schema) to keep grids and scripts fast.

---

## Suggested section selectors (optional wrappers)

Some teams prefer **phase-specific** selectors to keep page components tiny. You can keep these in your app layer (or add to the mappers file if you like). They’re simple picks off the results of `buildPackageDetailOverviewProps(pkg)`:

```ts
// example selectors (app layer)
export const toHeroProps = (o: ReturnType<typeof buildPackageDetailOverviewProps>) => ({
  title: o.title,
  valueProp: o.valueProp,
  description: o.description,
  icp: o.icp,
  packagePrice: o.packagePrice,
  priceBand: o.priceBand,
  ctaPrimary: o.ctaPrimary,
  ctaSecondary: o.ctaSecondary,
});

export const toPhase1Props = toHeroProps;

export const toPhase2Props = (o: ReturnType<typeof buildPackageDetailOverviewProps>) => ({
  features: o.features,
  outcomes: o.outcomes,
});

export const toPhase3Props = (o: ReturnType<typeof buildPackageDetailOverviewProps>) => ({
  includesGroups: o.includesGroups,
  includesTable: o.includesTable,
});

export const toExtrasProps = (o: ReturnType<typeof buildPackageDetailOverviewProps>) =>
  ({ timeline: o.extras.timeline, ethics: o.extras.ethics, requirements: o.extras.requirements });

export const toPhase4Props = toExtrasProps;

export const toPhase5Props = (o: ReturnType<typeof buildPackageDetailOverviewProps>) => ({
  // extend as needed (FAQs, rails, related slugs, etc.)
  pinnedPackageCard: o.pinnedPackageCard,
});
```

> If you want a **band wrapper** as in *toBandProps*, that belongs in your pricing utilities (since formatting rules, currency, and variant decisions are product-specific). The mapper **intentionally** passes the canonical `price` and `priceBand` through unchanged.

---

## End-to-end: MDX → runtime → UI

```ts
import matter from "gray-matter";
import { PackageSchema, type PackageSchemaType } from "@/packages/lib/package-schema";
import {
  PackageMarkdownSchema,
  buildPackageFromMdx, // wraps parse + transform + runtime validate
} from "@/packages/lib/mdx-frontmatter-schema";
import { buildPackageCardProps, buildPackageDetailOverviewProps } from "@/packages/lib/mappers/package-mappers";

// 1) Load MDX content
const { data: fm, content: bodyMdx } = matter(mdxString);

// 2) Safe authoring parse
const mdxFrontmatter = PackageMarkdownSchema.parse(fm);

// 3) Transform to canonical runtime + validate
const pkg: PackageSchemaType = buildPackageFromMdx(mdxFrontmatter, { bodyHtml: renderMdxToHtml(bodyMdx) });

// 4) Map to UI props
const card = buildPackageCardProps(pkg);
const detail = buildPackageDetailOverviewProps(pkg);
```

---

## CTA policy (override notes)

Default labels:

* Cards: **View details** / **Book a call**
* Detail: **Request proposal** / **Book a call**

If you have a central copy system, you can:

* Keep policy here (which CTA appears where)
* Inject labels at the rendering layer
  *(e.g., change `label` strings or wrap CTAs in a copy function)*

---

## Includes handling (fallback order)

1. If authors provided **grouped inclusions** (`includes`), render those.
2. Otherwise, if they authored an **includesTable**, mappers will adapt it.
3. Otherwise, we can synthesize a **1-column table** from the groups if present (good for resilient UIs).

---

## Validation & safety

* Inputs to mappers are expected to be **validated** runtime objects (`PackageSchema.parse(...)`).
* `normalizePackage(...)` is **not** a validator. It’s a light alias fixer for legacy callers. Prefer `frontmatterToPackage(...)` + `PackageSchema.parse(...)`.

---

## Testing

* Treat all mappers as **pure functions**.
* Unit test using fixtures of `PackageSchemaType`.
* For collections, snapshot the output of pipelines:
  `pipeBundles(sortBundles("featuredThenName", featured), limit(6))(bundles)`

---

## Migration notes (old → new)

* Anything that manually shaped card/overview props should be replaced with:

  * `buildPackageCardProps(pkg)`
  * `buildPackageDetailOverviewProps(pkg)`
* Old “registry mappers” and “normalizers” are merged into this module.
* Keep **schemas** as your SSOT, not in the mappers.

---

## FAQ

**Q: Where’s `toBandProps`?**
A: Band decisions and formatting depend on product policy (currency symbols, “/mo”, “starting at”, annualized display). The mapper **passes through** `price` and `priceBand`. Implement `toBandProps` in your pricing util and consume `detail.packagePrice` & `detail.priceBand`.

**Q: Can I import component prop types directly from UI files?**
A: You can, but we keep **local prop types** here to avoid coupling. If your design system exposes stable public prop types, feel free to swap imports.

**Q: What if my detail page needs more fields (e.g., FAQs, related slugs)?**
A: Add them to the mapper result, or create small selectors that pull those fields from the validated runtime package alongside `buildPackageDetailOverviewProps(...)`.

---

## File layout

```
src/packages/lib/mappers/
├─ package-mappers.ts   # <— everything described above; fully documented
└─ readme.md            # <— this file
```

That’s it — your **runtime → UI** mapping has a single home now, with clear inputs/outputs and zero schema duplication.
