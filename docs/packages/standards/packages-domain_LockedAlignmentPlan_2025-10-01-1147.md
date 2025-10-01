title: "Packages Domain — Locked Alignment Plan"
domain: "packages"
file: "packages-domain_LockedAlignmentPlan_2025-10-01-1147.md"
main: "packages-domain"
qualifier: "LockedAlignmentPlan"
date: "2025-10-01"
time: 11:47am
status: "Approved"
owners: ["@yourname"]
tags: ["packages","pricing","tiers","canonical-json","normalizer","mdx","build","adapters","nextjs","ci"]
spotlight:
  - "Default pricing Mode A (from internal.json) with strict Mode B frontmatter override behind a flag"
  - "No runtime access to internal.json; optional public tiers via ui.showTieredPricing and is_public gating"
  - "Canonical external JSON keeps nested sections plus normalized top-level fields; normalizer keeps them in sync"
  - "MDX extraction standardized to: Overview, Purpose, Notes, FAQ → narrative.*Html"
  - "Price band phrasing derived inside PriceActionsBand (single source of truth)"
  - "Safety & CI: MDX price-prose lint, includesGroups/Table gate, JSON-LD guard, and golden-sample contract test"
summary: "An updated, locked implementation plan for the Packages domain that aligns pricing policy, tier toggle behavior, canonical external JSON shape, adapter/normalizer flow, and CI guards—so authors can produce MDX + internal pricing while the build generates per-slug external JSON and the runtime stays typed and unchanged."
links:
  related: []

-----
10-01-2025 | 11:47am
---
Got it—here’s an **updated, locked** version of your plan that folds in all the alignments we settled on (pricing policy, tier toggle behavior, canonical JSON shape, adapter/normalizer, CI guards). I’ve kept your original structure but call out what changed.

---

## What changed (at a glance)

1. **Pricing SSOT** → **Mode A by default** (price comes from `internal.json`), with strict **Mode B** frontmatter override behind a flag. (Your draft assumed public price in FM—now corrected.)

2. **Tier toggle** → No runtime fetching of `internal.json`.

   * Builder may copy **public-ready** tiers into `external.json` as `internal_tiers` **only** when the feature is enabled; sensitive fields are stripped.
   * UI renders a future `TieredPricingTable` *iff* `ui.showTieredPricing` is true **and** at least one `internal_tiers[*].is_public` is true.

3. **Canonical external JSON** → Keep the **nested sections** (`meta/hero/narrative/...`) **and** the **normalized top-level** fields the app already expects. A small **normalizer** ensures both are in sync.

4. **MDX body extraction** → Standardize on `## Overview`, `## Purpose`, `## Notes`, `## FAQ` → `narrative.*Html`. (Phase-slice by “Phase N” remains optional.)

5. **Price band copy** → The phrase like “Starting at” is derived **inside** `PriceActionsBand` (single source of truth), not sprinkled in adapters.

6. **Safety & CI** → MDX price-prose lints (Mode A), includes-gate (must have `includesGroups` OR `includesTable`), JSON-LD guard (omit `offers` if price absent), and a golden-sample contract test.

---

# 0) Ground truth (kept, with pricing note)

* **Taxonomy**: `docs/taxonomy/**/services.json` + `docs/taxonomy/index.json`

* **Authoring paths**:

  ```
  docs/packages/catalog/{service}/{subservice}/{slug}/
    public.mdx        # public SSOT for copy/structure (no price prose)
    internal.json     # pricing/tiers/ops SSOT (never shipped)
    assets/
  ```

* **Canonical detail route**: `/packages/{slug}` (301 from friendlies)

* **Pricing policy**

  * **Mode A (default)**: price comes from `internal.json`, merged at build.
  * **Mode B (opt-in)**: strict `price{ oneTime?, monthly?, currency }` in frontmatter (project flag or per-slug flag).
  * Band copy lives in `priceBand{ tagline?, baseNote?, finePrint? }` (no numbers).

---

# 1) Install build-time deps

```bash
npm i -D tsx fast-glob gray-matter zod
npm i -D unified remark-parse remark-gfm remark-rehype rehype-raw rehype-stringify rehype-sanitize
```

> Add **rehype-sanitize** to harden narrative HTML output.

---

# 2) Schemas (validation = no drift)

**Create** `src/packages/lib/registry/schemas.ts` (Zod).
Include:

* `Money`, `Price`
* **Internal**: `InternalPricingDoc` (`tiers[*].price`, ops notes)
* **External**: `ExternalDoc` with nested sections (`meta`, `hero`, `narrative`, `why_you_need_this`, `what_you_get`, `details_and_trust`, `next_step`) **plus** normalized top-level (`price`, `priceBand`, `includesGroups/Table`, `extras`, `outcomes`, etc.)
* Super-refine: require **either** `includesGroups` **or** `includesTable`.

---

# 3) Build script: scan → parse → validate → compile → emit JSON

**Create** `scripts/build-packages.ts`:

* Scan `docs/packages/catalog/**/public.mdx`
* Parse frontmatter + compile `## Overview/Purpose/Notes/FAQ` → `narrative.*Html` (using remark/rehype + sanitize)
* Optionally load `internal.json` and select the canonical **Price** (Mode A)
* Synthesize a nested **ExternalDoc** object, then run a **normalizer** to fill top-level fields from nested sections
* Validate with Zod; write `src/data/packages/__generated__/packages/<slug>.external.json`
* Update `src/data/packages/__generated__/index.json` (id, slug, service, tags, summary, hasPrice)

**package.json**

```json
{
  "scripts": {
    "build:packages": "tsx scripts/build-packages.ts"
  }
}
```

---

# 4) (Optional) Section-aware extraction (phase slices)

If you want 1:1 **phase** HTML, add a tiny helper to slice the body by “### Phase N” headings and emit:

* `phase1HeroHtml`, `phase2WhyHtml`, `phase3WhatHtml`, `phase4DetailsHtml`, `phase5NextHtml`

**Recommendation:** keep the standard set (`overviewHtml`, `purposeHtml`, `notesHtml`, `faqHtml`) and only enable phase slices for A/B layout experiments.

---

# 5) Next.js wiring (App Router)

## Detail route `/app/packages/[slug]/page.tsx`

```tsx
import path from "node:path";
import { promises as fs } from "node:fs";
import { notFound } from "next/navigation";
import PackageDetailOverview from "@/packages/sections/PackageDetailOverview/PackageDetailOverview";
import { toPackageDetailOverviewProps } from "@/packages/lib/registry/adapter.pdo"; // thin adapter

const GEN_DIR = path.join(process.cwd(), "src/data/packages/__generated__");

export async function generateStaticParams() {
  const idxPath = path.join(GEN_DIR, "index.json");
  const raw = await fs.readFile(idxPath, "utf8").catch(() => "{}");
  const idx = JSON.parse(raw || "{}");
  return (idx.items ?? []).map((x: any) => ({ slug: x.slug }));
}

export default async function Page({ params }: { params: { slug: string }}) {
  const fp = path.join(GEN_DIR, "packages", `${params.slug}.external.json`);
  let external: any;
  try {
    external = JSON.parse(await fs.readFile(fp, "utf8"));
  } catch {
    notFound();
  }
  // If you want dev-time safety, parse against ExternalDoc schema here.
  const pdo = toPackageDetailOverviewProps(external);
  return <PackageDetailOverview {...pdo} />;
}
```

## Service hubs (`/app/(services)/marketing-packages/page.tsx`)

```tsx
import path from "node:path";
import { promises as fs } from "node:fs";
import PackagesHubTemplate from "@/packages/templates/PackagesHubTemplate";

export default async function Page() {
  const idx = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "src/data/packages/__generated__/index.json"), "utf8")
  );
  const items = (idx.items ?? []).filter((x: any) => x.service === "marketing-services");
  return <PackagesHubTemplate items={items} service="marketing-services" />;
}
```

(Optional L3 hubs: filter `index.json` by service + subservice.)

---

# 6) `base.ts` alignment (keep your ergonomics)

**Preferred:** keep `base.ts` per slug that **imports** the generated JSON and exports it **typed**.
(You can generate `base.ts` files, but importing JSON is simpler and avoids duplication.)

```ts
// src/packages/registry/<service>/<slug>/base.ts
import generated from "@/data/packages/__generated__/packages/<slug>.external.json";
import type { ExternalDocT } from "@/packages/lib/registry/schemas";
export const base: ExternalDocT = generated;
```

**Thin wrappers unchanged:**

```ts
// details.ts
import { base } from "./base";
import { toPackageDetailOverviewProps } from "@/packages/lib/registry/adapter.pdo";
export default toPackageDetailOverviewProps(base);

// card.ts
import { base } from "./base";
import { buildDefaultCard } from "@/packages/lib/registry/mappers";
export default buildDefaultCard(base);
```

---

# 7) Internal tiers toggle (planned now, ship later) — **updated**

* **Do not read `internal.json` at runtime.** No server or client access to internal docs.
* **Build-time behavior**:

  * If a feature flag (env or frontmatter) enables public tiers, copy **only public-safe fields** from `internal.json.tiers` into `external.json.internal_tiers`, **but only** those rows with `is_public: true`.
  * Also set `external.json.ui.showTieredPricing = true`.
* **Runtime display rule**:

  * If `ui.showTieredPricing === true` **and** any `internal_tiers[*].is_public === true`, render `TieredPricingTable` below the band. Else, show the current `PriceActionsBand` only.

> This keeps sensitive content out of the bundle while letting you turn on tiering without a schema change later.

---

# 8) Price band policy (single source of truth)

* `PriceActionsBand` owns:

  * Label derivation (e.g., “Starting at”)
  * Base note behavior (default: **one-time-only → final**, else **proposal**)
  * Fine print rendering & CTA layout
* Adapters should **not** hardcode price phrases. Pass `{ price, priceBand }` and let the band decide.

---

# 9) CI + scripts (with stronger guards)

**package.json**

```json
{
  "scripts": {
    "seed:leadgen": "tsx scripts/seed-frontmatter.ts docs/packages/catalog/lead-generation",
    "seed:content": "tsx scripts/seed-frontmatter.ts docs/packages/catalog/content-production",
    "build:packages": "tsx scripts/build-packages.ts",
    "validate:registry": "tsx scripts/validate-packages.ts",
    "prebuild": "npm run build:packages && npm run validate:registry"
  }
}
```

**.github/workflows/packages.yml**

```yml
name: Build Packages
on:
  push:
    paths:
      - "docs/packages/**"
      - "docs/taxonomy/**"
      - "scripts/**"
      - "src/packages/lib/registry/**"
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build:packages
      - run: npm run validate:registry
      - name: Upload generated
        uses: actions/upload-artifact@v4
        with:
          name: generated-packages
          path: src/data/packages/__generated__/**
```

**Add in `validate-packages.ts`:**

* Parse each generated `external.json` with `ExternalDoc`
* Gate: must have `includesGroups || includesTable`
* If `price` present: ensure `monthly || oneTime`
* If **Mode A**: lint MDX body for price prose (`/\$\s*\d/`) and fail on match
* JSON-LD guard: if `price` absent, ensure `offers` won’t be emitted

---

# 10) Author workflow (repeatable, at scale)

1. **Scaffold**

   ```
   docs/packages/catalog/lead-generation/conversion-optimization/ab-test-starter/
     public.mdx
     internal.json
     assets/
   ```

2. **Edit** `public.mdx`

   * Frontmatter: id, slug, service, summary, includes*, extras*, rails, priceBand copy
   * Body: `## Overview`, `## Purpose` (opt), `## Notes` (opt), `## FAQ` (opt)
   * **No price prose**

3. **(Optional)** Edit `internal.json` with tiers/ops (Mode A). Mark public rows `is_public: true` if you plan to expose tiers later.

4. **Build**

   ```bash
   npm run build:packages
   ```

   → writes `src/data/packages/__generated__/packages/ab-test-starter.external.json`
   → updates `src/data/packages/__generated__/index.json`

5. **Visit**

   * `/packages/ab-test-starter`
   * `/lead-generation-packages`, `/packages/lead-generation/conversion-optimization`

6. **Ship**. CI enforces schemas and drift guards.

---

## Notes & options

* **Phase splitter** helper is optional; prefer the standard narrative fields first.
* **By-service indexes** for faster SSR: emit `src/data/packages/__generated__/by-service/{service}.json` from the same builder if hubs become heavy.
* **Golden sample**: keep one public MDX + internal.json + external.json + contract test to lock the contract.

---

## Mini adapter (PDO) — reference

```ts
// src/packages/lib/registry/adapter.pdo.ts
import type { ExternalDocT } from "./schemas";
export function toPackageDetailOverviewProps(pkg: ExternalDocT) {
  return {
    id: pkg.meta.id,
    title: pkg.meta.slug.replace(/-/g, " "), // or a dedicated `name` if you add it
    tagline: pkg.hero.summary,
    meta: { category: pkg.meta.category, tags: pkg.meta.tags ?? [] },
    descriptionHtml: pkg.narrative?.overviewHtml,
    outcomes: pkg.outcomes ?? pkg.why_you_need_this?.outcomes ?? [],
    includes: { groups: pkg.includesGroups, table: pkg.includesTable },
    notesHtml: pkg.narrative?.notesHtml,
    priceBand: { ...(pkg.priceBand ?? {}), price: pkg.price ?? pkg.priceBand?.price },
    sticky: { summary: pkg.hero.summary },
    extras: pkg.extras,
    faqHtml: pkg.narrative?.faqHtml,
    crossSell: pkg.crossSell,
    addOns: pkg.addOns,
  };
}
```

---

## Acceptance criteria (definition of done)

* [ ] Per-slug `external.json` validates and contains **includes** data.
* [ ] Detail page renders even when `price` is absent (CTA-only band).
* [ ] When `ui.showTieredPricing` is true **and** some tier is `is_public:true`, `TieredPricingTable` renders; otherwise only `PriceActionsBand`.
* [ ] MDX in Mode A contains **no** price prose (CI lints it).
* [ ] JSON-LD omits `offers` when `price` is absent.

---

If you want, I can hand you the tiny **normalizer** file and a **golden sample** spec to drop in alongside this plan so the gates are executable immediately.
