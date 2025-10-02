# `src/packages/lib` — Schema-Driven Content Pipeline

This folder (and close siblings) contains the **author-independent core** that turns human-authored MDX into **validated, type-safe data** and then into **stable UI props** for your Package pages (cards, rails, phases 1–5, bands, etc.).

> TL;DR
> **Authors write MDX → build emits JSON → Zod validates → TypeScript types → mappers shape UI props → TSX renders.**
> This keeps content maintainable and runtime safe.

---

## Table of contents

* [High-level architecture](#high-level-architecture)
* [Data flow](#data-flow)
* [When to use which file](#when-to-use-which-file)
* [File-by-file reference](#file-by-file-reference)

  * [`src/types/package.ts`](#srctypespackagets)
  * [`src/packages/lib/types.ts`](#srcpackageslibtypests)
  * [`src/packages/lib/pricing.ts`](#srcpackageslibpricingts)
  * [`src/packages/lib/package-schema.ts`](#srcpackageslibpackage-schemats)
  * [`src/packages/lib/mdx-frontmatter-schema.ts`](#srcpackageslibmdx-frontmatter-schemats)
  * [`src/packages/lib/copy.ts`](#srcpackageslibcopyts)
  * [`src/packages/lib/band.ts`](#srcpackageslibbandts)
  * [`src/packages/lib/registry/types.ts`](#srcpackageslibregistrytypests)
  * [`src/packages/lib/registry/mappers.ts`](#srcpackageslibregistrymappersts)
  * [`scripts/packages/mdx-to-registry.ts`](#scriptspackagesmdx-to-registryts)
  * [`src/packages/registry/.../index.ts`](#srcpackagesregistrylead-generation-packageslead-routing-distributionindexts)
* [Add / edit a package (workflow)](#add--edit-a-package-workflow)
* [Migration note: `registry/schemas.ts` deleted](#migration-note-registryschemasts-deleted)
* [FAQ: Scale `index.ts` to 100 packages](#faq-scale-indexts-to-100-packages)
* [Troubleshooting](#troubleshooting)

---

## High-level architecture

```
docs/packages/.../public.mdx     (Authors)
            │  build (scripts)
            ▼
src/packages/registry/.../content.generated.json  (Raw JSON from MDX)
            │  validate (Zod)
            ▼
src/packages/registry/.../index.ts → `base` (Type-safe object)
            │  pure transforms (no JSX)
            ▼
src/packages/lib/registry/mappers.ts  (→ UI props)
            │
            ▼
TSX components (cards, bands, PDO phases) render safely
```

---

## Data flow

1. **Authors** write `public.mdx` with frontmatter + markdown.
2. **Build step** (`scripts/packages/mdx-to-registry.ts`) converts it to **JSON** and writes `content.generated.json`.
3. **Loader** (`.../index.ts`) runs **`PackageSchema.parse`** on that JSON and exports a fully **type-safe** `base`.
4. **Mappers** (`lib/registry/mappers.ts`) transform `base` → **component props** (cards, overview, rails, etc).
5. **Components** render; **pricing** & **copy** rules come from `pricing.ts` and `copy.ts` (not hard-coded in content).

---

## When to use which file

* **Define content structure** → `package-schema.ts` (Zod).
* **Author MDX** → `public.mdx` (outside this folder; docs catalog).
* **Convert MDX → JSON** → `scripts/packages/mdx-to-registry.ts`.
* **Validate & export the package** → registry `index.ts` (per package).
* **Map validated content to UI props** → `lib/registry/mappers.ts`.
* **Price math & formatting** → `lib/pricing.ts`.
* **CTA labels / ARIA phrases** → `lib/copy.ts`.
* **Price band variant selection** → `lib/band.ts`.
* **Import safe types anywhere** → `src/types/package.ts`.
* **Legacy/common domain types** → `lib/types.ts`, `lib/registry/types.ts`.
* **Frontmatter-only validation** (if you need to lint MDX before build) → `lib/mdx-frontmatter-schema.ts`.

---

## File-by-file reference

### `src/types/package.ts`

**What**: Global **TypeScript** types **derived from Zod** (`package-schema.ts`).
**Why**: Import these types across the app (e.g., pages, components, mappers) to stay in lockstep with runtime validation.

**Use when**: You need the canonical types (`PackageMetadata`, `Money`, `PriceBand`, `IncludeGroup`, `IncludesTable`) without importing Zod itself.

---

### `src/packages/lib/types.ts`

**What**: Framework-agnostic **domain types** (price, bundles, add-ons, queries).
**Why**: Shared, stable, and free of React/Next specifics. Helpful for utilities, searches, or cross-module contracts.

**Use when**: Declaring domain shapes (e.g., `Price`, `PackageBundle`) used by tools or ancillary UIs.

---

### `src/packages/lib/pricing.ts`

**What**: Canonical **pricing utilities**:

* `normalizeMoney` (accept legacy/new shapes),
* predicates (`hasPrice`, `isHybrid`, …),
* formatting (`formatMoney`),
* accessible sentences (`srPriceSentence`),
* and teaser labels (`startingAtLabel`).

**Use when**: You need **price logic** or formatting. Keep all price rules here (never in components).

---

### `src/packages/lib/package-schema.ts`

**What**: The **Zod schema** for **validated registry content** (the JSON emitted from MDX).
**Key guarantees**:

* `price` must have `oneTime` or `monthly`.
* At least one of `includes` (groups) or `includesTable` is present.
* Optional phase copy, SEO, ethics, requirements, etc.

**Use when**: Validating the **final object** that components will consume. This is the **source of truth** for UI population.

---

### `src/packages/lib/mdx-frontmatter-schema.ts`

**What**: Zod schema specifically for **MDX frontmatter** (documentation authoring), distinct from `PackageSchema`.
**Why**: Lets you lint/validate author input **before** converting to the registry shape.

**Use when**: Validating raw frontmatter in docs build pipelines or lint steps.

> Responsibility split:
>
> * **`mdx-frontmatter-schema.ts`** validates the **author surface** (frontmatter).
> * **`package-schema.ts`** validates the **runtime registry object** used by the app.

---

### `src/packages/lib/copy.ts`

**What**: Centralized **UI copy** & **ARIA helpers**:

* CTA labels (`VIEW_DETAILS`, `BOOK_A_CALL`, `REQUEST_PROPOSAL`)
* `BADGE` label for pricing chips
* ARIA helpers (`ariaViewDetailsFor`, etc.)

**Use when**: You need consistent labels or accessibility strings across surfaces.

---

### `src/packages/lib/band.ts`

**What**: Logic for **PriceActionsBand** variants & detail-band copy:

* `resolveBandVariant(ctx, price)` → `"detail-hybrid" | "detail-oneTime" | ...`
* `defaultBaseNote(price)` → `"proposal" | "final"`
* `resolveBaseNoteText(price, override)`
* `bandPropsFor(ctx, price, copy)` → ready-to-spread props for `<PriceActionsBand />`

**Use when**: Building props for the **price band** on cards or detail pages. Fixes the “invalid `variant`” crash by design.

---

### `src/packages/lib/registry/types.ts`

**What**: Authoring/registry **base types** used by mappers (e.g., `IncludesTableLike`, `Service`, `PackageAuthoringBase`).
**Why**: Separates **authoring shapes** from **UI shapes**, enabling mappers to adapt between them cleanly.

**Use when**: You’re writing mapping utilities or scripts that manipulate/inspect authoring content.

---

### `src/packages/lib/registry/mappers.ts`

**What**: **Pure functions** that adapt validated content (`PackageMetadata`) → **UI props**:

* CTA policy (`buildCardCtas`, `buildDetailCtas`)
* Card props (`buildPackageCardProps`, `buildPinnedCardForDetail`)
* Detail overview props (`buildPackageDetailOverviewProps`)
* Includes table derivation (`buildIncludesTableFromGroups`, `mapIncludesTable`)
* Footnote normalizer (`normalizeFootnote`)

**Use when**: Constructing props for **PackageCard**, **PackageDetailOverview**, or related UIs from the validated `base`.

> Important: **Do not** hardcode band variants here. Use `bandPropsFor` at the detail surface, or leave to the band component.

---

### `scripts/packages/mdx-to-registry.ts`

**What**: Build step that converts **`public.mdx` → `content.generated.json`** and validates it with `PackageSchema`.

**How it works**:

1. Reads MDX (frontmatter + markdown body).
2. Compiles markdown body to HTML (for `purposeHtml`).
3. Maps frontmatter to the registry object shape.
4. Validates via `PackageSchema.parse`.
5. Writes **`content.generated.json`** into the package registry folder.

**Use when**: Generating/updating registry JSON for each package. Run in CI or local build.

**CLI**:

```bash
pnpm tsx scripts/packages/mdx-to-registry.ts
# or
node --loader ts-node/esm scripts/packages/mdx-to-registry.ts
```

> The script is easy to generalize to glob many MDX files; see [FAQ](#faq-scale-indexts-to-100-packages).

---

### `src/packages/registry/lead-generation-packages/lead-routing-distribution/index.ts`

**What**: **Type-safe loader** for a **single** package.
It imports the emitted JSON and **parses** it with `PackageSchema`, exporting a validated `base` object:

```ts
import raw from "./content.generated.json";
import { PackageSchema } from "@/packages/lib/package-schema";

export const base = PackageSchema.parse(raw);
export default base;
```

**Use when**: A component/page needs the **concrete package data**.
For many packages, prefer an **aggregator/manifest** (see below).

---

## Add / edit a package (workflow)

1. **Create MDX**
   `docs/packages/catalog/<service>/<slug>/public.mdx`
   Fill in frontmatter (price, outcomes, includes, etc.) and markdown body.

2. **Build the registry JSON**
   Run:

   ```bash
   pnpm tsx scripts/packages/mdx-to-registry.ts
   ```

   This writes:

   ```
   src/packages/registry/<service>-packages/<slug>/content.generated.json
   ```

3. **Validate & export**
   Ensure there’s an `index.ts` next to the JSON (one-liner loader above).
   Consumers should import **from `index.ts`**, not from the JSON directly.

4. **Map to UI** (in a page or route loader)

   ```ts
   import base from "@/packages/registry/lead-generation-packages/lead-routing-distribution";
   import { buildPackageDetailOverviewProps } from "@/packages/lib/registry/mappers";

   const overviewProps = buildPackageDetailOverviewProps(base);
   // <PackageDetailOverview {...overviewProps} />
   ```

---

## Migration note: `registry/schemas.ts` deleted

* **Removed**: `src/packages/lib/registry/schemas.ts`
* **Do this**: Update all imports (including scripts) to use
  `src/packages/lib/package-schema.ts` **and/or**
  `src/packages/lib/mdx-frontmatter-schema.ts` (for docs/frontmatter validation).

> Don’t alias a different shape to `PackageSchema`. Keep **frontmatter** and **registry** shapes **separate** and explicit.

---

## FAQ: Scale `index.ts` to 100 packages

There are two scalable patterns. Pick one based on your bundler and routing.

### Option A — **Generated manifest** (recommended for Next.js)

Create a tiny **codegen** that globs all `content.generated.json`, validates each with `PackageSchema`, and emits a **type-safe manifest**:

**Script:** `scripts/packages/build-registry-manifest.ts`

```ts
import fs from "node:fs/promises";
import path from "node:path";
import glob from "fast-glob";
import { PackageSchema } from "@/packages/lib/package-schema";

const ROOT = "src/packages/registry";
const OUT = path.join(ROOT, "manifest.generated.ts");

async function main() {
  const jsonFiles = await glob(`${ROOT}/**/content.generated.json`);
  const entries: string[] = [];

  for (const file of jsonFiles) {
    const raw = JSON.parse(await fs.readFile(file, "utf8"));
    const data = PackageSchema.parse(raw); // validate here
    // Inline as JSON; or generate import lines (faster incremental builds)
    entries.push(
      `{ slug: "${data.slug}", id: "${data.id}", service: "${data.service}", data: ${JSON.stringify(data)} }`
    );
  }

  const source = `/* AUTO-GENERATED — DO NOT EDIT BY HAND */
export type RegistryItem = { slug: string; id: string; service: string; data: ${"ReturnType<typeof PackageSchema.parse>"} };
export const REGISTRY: RegistryItem[] = [
  ${entries.join(",\n  ")}
];

export const bySlug = Object.fromEntries(REGISTRY.map(i => [i.slug, i.data]));
export type RegistryBySlug = typeof bySlug;
`;

  await fs.writeFile(OUT, source, "utf8");
  console.log(`✔ wrote ${OUT} with ${entries.length} packages`);
}
main().catch((e) => { console.error(e); process.exit(1); });
```

**Use it:**

```ts
import { bySlug } from "@/packages/registry/manifest.generated";
// e.g., in a Next.js route
export async function generateStaticParams() {
  return Object.keys(bySlug).map((slug) => ({ slug }));
}
```

This gives you:

* **One import** for all packages
* **Type-safe lookup** by slug
* Validation **at build time**

> If you prefer per-package `index.ts` files, this script can also **emit** those one-liners automatically.

### Option B — **Runtime dynamic import / glob**

If your toolchain supports `import.meta.glob` (Vite) you can:

```ts
// vite-only example
const modules = import.meta.glob("/src/packages/registry/**/content.generated.json", { eager: true });
const bySlug: Record<string, any> = {};
for (const [_, mod] of Object.entries(modules)) {
  const data = (mod as any).default;
  bySlug[data.slug] = data;
}
```

In Next.js, prefer the **generated manifest** to avoid extra runtime I/O and to keep type safety.

---

## Troubleshooting

* **Band variant crash**
  Always build band props with `bandPropsFor("detail", price, priceBand)` instead of hardcoding `"detail"`; valid variants are `"detail-hybrid"` or `"detail-oneTime"`.

* **Highlights missing**
  If the package author omits `features`, mappers derive highlights from the first few **includes**. Ensure `includes` (groups) exist or provide `includesTable`.

* **Notes rendering as `[object Object]`**
  Use mapper’s `normalizeFootnote`—it joins arrays with bullets and handles unknown shapes.

* **Frontmatter passes but runtime fails**
  Remember: `mdx-frontmatter-schema.ts` checks frontmatter; `package-schema.ts` validates the **final** registry object. Both must pass.

* **Deleted `registry/schemas.ts` imports**
  Replace any imports of `src/packages/lib/registry/schemas.ts` with:

  * `src/packages/lib/package-schema.ts` for the runtime registry object, and/or
  * `src/packages/lib/mdx-frontmatter-schema.ts` for docs frontmatter.

---

### Import cheat sheet

```ts
// Types (no Zod in consumer code)
import type { PackageMetadata } from "@/types/package";

// Validate registry JSON
import { PackageSchema } from "@/packages/lib/package-schema";

// Validate docs frontmatter
import { PackageMarkdownSchema } from "@/packages/lib/mdx-frontmatter-schema";

// Build UI props
import { buildPackageDetailOverviewProps } from "@/packages/lib/registry/mappers";

// Price logic
import { formatMoney, startingAtLabel } from "@/packages/lib/pricing";

// Band props
import { bandPropsFor } from "@/packages/lib/band";

// CTA copy
import { CTA, ariaRequestProposalFor } from "@/packages/lib/copy";
```

---

**That’s it.** This README covers every script/module in `src/packages/lib` and close neighbors, explains when to use each piece, and provides a scalable pattern for **hundreds of packages** while preserving **type safety** and **runtime correctness**.
