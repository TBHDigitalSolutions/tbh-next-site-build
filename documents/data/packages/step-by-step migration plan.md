Awesome — let’s turn your current `src/data/packages` into a rock-solid, author-friendly, and runtime-fast data layer. Below is a **step-by-step migration plan**, an **explicit file-by-file conversion map**, the **final directory tree (data + content + build scripts)**, and a **short list of component changes** so everything renders correctly.

---

# Goals (what we’re optimizing for)

1. **SSOT for machine-critical data** (IDs, slugs, price, tiers, relations) stays in **typed TS/JSON**.
2. **Human narrative** (long copy, rationale, FAQs) moves to **MDX** that’s **compiled at build time** and **attached to the SSOT by slug**.
3. **No runtime parsing** of markdown; fast pages + SSR friendly.
4. **Searchable** across structured fields + narrative via a **prebuilt minisearch index**.
5. **Strict validation** (Zod + cross-refs) runs in CI and as a local script.

---

# What to convert (exact mapping)

> Keep **all existing TS/JSON** that describe *real data objects*.
> Convert **all .md** (and any long text inside .ts you want editors to own) to **.mdx** under a dedicated **content tree**.

### A) Bundles (long copy per bundle)

Current

```
src/data/packages/bundles/
  digital-transformation-starter.md
  digital-transformation-starter.ts
  ecommerce-accelerator.md
  ecommerce-accelerator.ts
  event-launch-domination.md
  event-launch-domination.ts
  local-business-growth.md
  local-business-growth.ts
  thought-leadership-authority.md
  thought-leadership-authority.ts
```

Convert

```
Move *.md → src/content/packages/bundles/*.mdx
- digital-transformation-starter.md               → src/content/packages/bundles/digital-transformation-starter.mdx
- ecommerce-accelerator.md                        → src/content/packages/bundles/ecommerce-accelerator.mdx
- event-launch-domination.md                      → src/content/packages/bundles/event-launch-domination.mdx
- local-business-growth.md                        → src/content/packages/bundles/local-business-growth.mdx
- thought-leadership-authority.md                 → src/content/packages/bundles/thought-leadership-authority.mdx
```

Keep (and **trim** if you duplicated long copy inside):

```
src/data/packages/bundles/*.ts  // SSOT with id/slug/name/price/services/includes/highlights/pricing tiers/faq
```

### B) Integrated growth overview

Current

```
src/data/packages/integrated-growth-packages.md
src/data/packages/integrated-growth-packages.ts
```

Convert

```
integrated-growth-packages.md → src/content/packages/overviews/integrated-growth-packages.mdx
```

Keep

```
integrated-growth-packages.ts // keep any structured metadata if used (ids, slugs for hub ordering, etc.)
```

### C) Per-service “packages / featured / addons” author notes

Current (example: content-production; same pattern for every service)

```
src/data/packages/content-production/
  content-production-packages.md
  content-production-packages.ts
  content-production-featured.md
  content-production-featured.ts
  content-production-addons.md
  content-production-addons.ts
```

Convert

```
*.md → src/content/packages/services/<service>/*.mdx

src/content/packages/services/content-production/
  packages-overview.mdx        // from content-production-packages.md
  featured-notes.mdx           // from content-production-featured.md
  addons-overview.mdx          // from content-production-addons.md
```

Repeat the same for **lead-generation**, **marketing-services**, **seo-services**, **video-production**, **web-development**:

```
src/content/packages/services/seo/
  packages-overview.mdx
  featured-notes.mdx
  addons-overview.mdx

...and so on for each service folder
```

Keep

```
*-packages.ts   → structured packages (id, slug, tier, features, price)
*-featured.ts   → keep but **reduce to references** (array of package ids/slugs/badges) – no long copy
*-addons.ts     → structured add-on objects (ids, prices)
```

### D) Aggregated JSON

Keep these as SSOT (or generate them from TS at build, your choice; today you already commit them):

```
src/data/packages/addOns.json
src/data/packages/bundles.json
src/data/packages/featured.json
```

> If you prefer **generated** JSON instead of committed JSON, the build can emit them to `src/data/packages/__generated__/` from the TS sources. Either approach is fine—pick one and stick to it.

---

# MDX frontmatter contract

All MDX files **must** include a `slug` frontmatter that matches the SSOT object:

```mdx
---
slug: "digital-transformation-starter"
title: "Digital Transformation Starter"      # (optional) can override UI h1 if you want
summary: "Kickstart your modern stack…"      # (optional) shorter teaser
updatedAt: "2025-02-01"                      # (optional) for “last updated”
heroImage: "/images/packages/dts-hero.jpg"   # (optional)
---

Long-form copy here…

## What’s inside
- Bullet one
- Bullet two
```

**Do not** repeat price/tier/service in MDX — those live in TS/JSON only.

---

# Final production directory tree

Below is the **complete** layout (data, content, scripts, generated, and key components that will consume it).

```
src/
  data/
    packages/
      _types/
        currency.ts
        packages.types.ts                   # + add `PackageContent` & any new fields
      _utils/
        ids.ts
        index.ts
        slugs.ts
      _validators/
        schema.ts
        packages.validate.ts
      # SSOT data (commit or generate)
      addOns.json
      bundles.json
      featured.json
      # Per-service SSOT (keep)
      content-production/
        content-production-packages.ts      # SSOT structured packages
        content-production-featured.ts      # keep as list of IDs/slugs/badges (no long copy)
        content-production-addons.ts        # SSOT structured add-ons
      lead-generation/
        lead-generation-packages.ts
        lead-generation-featured.ts
        lead-generation-addons.ts
      marketing-services/
        marketing-packages.ts
        marketing-featured.ts
        marketing-addons.ts
      seo-services/
        seo-services-packages.ts
        seo-services-featured.ts
        seo-services-addons.ts
      video-production/
        video-production-packages.ts
        video-production-featured.ts
        video-production-addons.ts
      web-development/
        web-development-packages.ts
        web-development-featured.ts
        web-development-addons.ts
      bundles/
        digital-transformation-starter.ts   # SSOT bundle
        ecommerce-accelerator.ts
        event-launch-domination.ts
        local-business-growth.ts
        thought-leadership-authority.ts
      # Data facade (exports helpers + enriched accessors)
      index.ts                               # expose getters that return ENRICHED data (with content attached)
      recommendations.ts
      integrated-growth-packages.ts          # structured meta for hub if you keep it
      __generated__/                         # (build output; gitignored)
        bundles.enriched.json                # bundles + attached content (html/excerpt/updatedAt)
        packages.search.json                 # minisearch index for client
        content.map.json                     # { slug: { wordCount, updatedAt, … } } useful for admin UI

  content/
    packages/
      overviews/
        integrated-growth-packages.mdx
      bundles/
        digital-transformation-starter.mdx
        ecommerce-accelerator.mdx
        event-launch-domination.mdx
        local-business-growth.mdx
        thought-leadership-authority.mdx
      services/
        content-production/
          packages-overview.mdx
          featured-notes.mdx
          addons-overview.mdx
        lead-generation/
          packages-overview.mdx
          featured-notes.mdx
          addons-overview.mdx
        marketing-services/
          packages-overview.mdx
          featured-notes.mdx
          addons-overview.mdx
        seo-services/
          packages-overview.mdx
          featured-notes.mdx
          addons-overview.mdx
        video-production/
          packages-overview.mdx
          featured-notes.mdx
          addons-overview.mdx
        web-development/
          packages-overview.mdx
          featured-notes.mdx
          addons-overview.mdx

scripts/
  packages/
    build.ts                         # orchestrates full build (validate → compile mdx → enrich → index)
    validate-packages.ts             # zod/schema + cross-refs (already done)
    check-featured-refs.ts           # feature slugs exist (already done)
    check-growth-embeds.ts           # 3-card sanity (already done)
    packages-stats.ts                # stats/coverage (already done)
    doctor.ts                        # pretty orchestrator (already done)
    lib/
      compile-mdx.ts                 # read MDX, parse frontmatter, compile → html (or mdx source)
      attach-content.ts              # merge compiled content into bundles by slug
      build-search-index.ts          # minisearch index builder
      fs-helpers.ts                  # tiny helpers (readJSON, writeJSON, ensureDir)

app/
  packages/
    page.tsx                         # hub page; unchanged except may consume enriched data
    [bundle]/page.tsx                # render bundle.content.html (if present) inside a <prose> block

src/
  packages/
    lib/
      bridge-growth.ts               # (you already added) maps bundles → GrowthPackage cards
    templates/
      PackagesHubTemplate.tsx        # consume enriched data (no runtime md parse)
      PackagesDetailTemplate.tsx     # render `bundle.content.html` when present
```

---

# What each new/changed piece does

### `src/data/packages/_types/packages.types.ts`

* **Add**:

  ```ts
  export type PackageContent = {
    html: string;
    excerpt?: string;
    updatedAt?: string;
    wordCount?: number;
  };
  export type BundleWithContent = PackageBundle & { content?: PackageContent };
  ```
* This makes “enriched” bundles fully typed.

### `scripts/packages/lib/compile-mdx.ts`

* Reads `src/content/packages/**/{*.md,*.mdx}`
* Validates frontmatter (must have `slug`)
* Compiles to **HTML** (or MDX source if you need components) at build time
* Returns `{ [slug]: { html, excerpt, updatedAt, wordCount, meta } }`

### `scripts/packages/lib/attach-content.ts`

* Loads `bundles.json` (or service TS if building from code)
* For each bundle, if `contentBySlug[bundle.slug]` exists, attach as `bundle.content`
* Writes `__generated__/bundles.enriched.json`

### `scripts/packages/lib/build-search-index.ts`

* Builds **minisearch** index with **both** structured fields and text:

  * `fields`: `name`, `summary`, `highlights`, `includesText`, `contentText`, `service`, `tier`
  * `storeFields`: `id`, `slug`, `service`, `tier`, `price`, `badge`, `excerpt`
* Writes `__generated__/packages.search.json`

### `scripts/packages/build.ts`

* Orchestrates:

  1. `validate-packages.ts`
  2. Compile MDX (`compile-mdx.ts`)
  3. Attach content (`attach-content.ts`)
  4. Build search index (`build-search-index.ts`)
  5. (Optional) sync generated files into `src/data/packages/__generated__`

> You already have most checks; this adds the content + index steps.

### `src/data/packages/index.ts` (facade)

Expose **helpers** that always return enriched data:

```ts
import enriched from "./__generated__/bundles.enriched.json";
import type { BundleWithContent } from "./_types/packages.types";

export const getBundles = (): BundleWithContent[] => enriched as BundleWithContent[];
export const getBundleBySlug = (slug: string) => getBundles().find(b => b.slug === slug);
export const getPackagesHub = () => getBundles().map(b => ({ slug: b.slug, title: b.title, /*…*/ }));

// Search index (for a hook or server action)
import searchIndex from "./__generated__/packages.search.json";
export const getPackagesSearchIndex = () => searchIndex;
```

This way, pages/components **never** touch MDX directly.

---

# Components that need small updates

1. **Bundle detail** (`app/packages/[bundle]/page.tsx` or `PackagesDetailTemplate.tsx`)

   * If `bundle.content?.html` exists, render it in a prose container:

     ```tsx
     {bundle.content?.html && (
       <section>
         <article className="prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: bundle.content.html }} />
       </section>
     )}
     ```
2. **Hub page cards** (no change required) — they use SSOT (name, price, highlights).
3. **Search UI** (wherever you show search)

   * Load `getPackagesSearchIndex()`, do client-side minisearch query (or server route).
4. **Any component importing MD directly** → **stop**; use `getBundleBySlug()` or `getBundles()` from the facade.

---

# CI / npm scripts

Add (or extend) your scripts:

```json
{
  "scripts": {
    "packages:build": "tsx scripts/packages/build.ts",
    "packages:validate": "tsx scripts/packages/validate-packages.ts",
    "packages:doctor": "tsx scripts/packages/doctor.ts",
    "data:ci": "npm-run-all -p packages:validate check:packages:featured validate:packages:growth packages:build"
  }
}
```

Ensure `src/data/packages/__generated__/` is **gitignored** (generated artifacts).

---

# Rollout checklist (ordered)

* [ ] Create `src/content/packages/**` and move all `.md` → `.mdx` as mapped above.
* [ ] Add `slug` frontmatter to every MDX and confirm it matches SSOT `slug`.
* [ ] Add `PackageContent` types; update consumer types as needed.
* [ ] Implement `compile-mdx.ts`, `attach-content.ts`, `build-search-index.ts`.
* [ ] Implement `scripts/packages/build.ts` orchestration.
* [ ] Update `src/data/packages/index.ts` to read from `__generated__`.
* [ ] Update **bundle detail** template to render `bundle.content.html`.
* [ ] Run `npm run packages:build` and fix any slugs mismatches or missing MDX.
* [ ] Add CI step (`data:ci`) to block merges on validation failures.

---

# FAQ

**Do we still need the service `*-featured.ts` files?**
Yes, but make them **minimal config (ids/slugs/badges/order)** — remove duplicated descriptions or pricing (those are SSOT elsewhere). The MDX “featured-notes.mdx” holds any editor prose.

**Can we generate `bundles.json` from the per-bundle `.ts`?**
Yes. If you prefer code-first, write a tiny build that imports `*.ts` and emits `bundles.json` to `__generated__`. Or keep your current committed JSON — just be consistent.

**Can we use MDX components inside content?**
Yes. If you need advanced MDX shortcodes, compile to an MDX source + runtime. The plan above demonstrates compiled HTML for simplicity/perf; it’s easy to upgrade.

---

If you’d like, I can follow up with **ready-to-drop code** for `compile-mdx.ts`, `attach-content.ts`, `build-search-index.ts`, and a typed update for `src/data/packages/index.ts`.
