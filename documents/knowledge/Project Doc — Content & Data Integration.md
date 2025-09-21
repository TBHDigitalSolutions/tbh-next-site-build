# Project Doc — Content & Data Integration (Option A)

**Decision:** We will use **Option A: build-time MDX → HTML pipeline** as the single source of truth for long-form package content.
**Why:** It’s fast, simple, SEO-friendly, and keeps all runtime pages/components clean—no MDX loader or dynamic component hydration at runtime.

This document explains the install + setup, directory structure, authoring rules, build outputs, and how components/pages consume the enriched data.

---

## 1) What goes where?

### `src/data/**` → **Structured, machine-critical data (SSOT)**

* Typed, queryable data that drives UI logic and routing: **IDs, slugs, tiers, prices, services, relationships**, featured lists, add-ons, recommendations.
* Validation (`zod`), utils, and **generated JSON** used at runtime.
* Examples:
  `src/data/packages/*-packages.ts`, `*-addons.ts`, `bundles.json`, `featured.json`, `recommendations.ts`, `_validators/…`.

### `src/content/**` → **Editorial content (human-authored)**

* Long-form copy (narratives/overviews) written as **MDX** with **frontmatter** (e.g., `slug`).
* **Never** contains prices, numeric SKUs, or other machine-critical fields—those live in `src/data/**`.
* Example:
  `src/content/packages/bundles/digital-transformation-starter.mdx`

> Build step compiles MDX → HTML and **attaches** it to the corresponding `bundle`/`package` by `slug`. Pages render the **enriched** data with a `<prose>` block.

---

## 2) Directory layout (final)

```
src/
  data/
    packages/
      _types/
        currency.ts
        packages.types.ts              # includes `PackageContent` & any new fields
      _utils/
        ids.ts
        index.ts
        slugs.ts
      _validators/
        schema.ts
        packages.validate.ts
      addOns.json
      bundles.json
      featured.json
      # Per-service structured SSOT (keep)
      content-production/
        content-production-packages.ts
        content-production-featured.ts
        content-production-addons.ts
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
        digital-transformation-starter.ts
        ecommerce-accelerator.ts
        event-launch-domination.ts
        local-business-growth.ts
        thought-leadership-authority.ts
      # Data facade exposing getters (enriched results)
      index.ts
      recommendations.ts
      integrated-growth-packages.ts
      __generated__/                   # build outputs (gitignored)
        bundles.enriched.json          # bundles + { content: { html, excerpt, wordCount, updatedAt } }
        packages.search.json           # minisearch index (client/search)
        content.map.json               # content metadata (admin/debug)

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
    build.ts                           # orchestrates: validate → compile mdx → attach → search index → stats/checks
    validate-packages.ts
    check-featured-refs.ts
    check-growth-embeds.ts
    packages-stats.ts
    doctor.ts
    lib/
      compile-mdx.ts                   # unified/remark/rehype pipeline (mdx → html, excerpt, meta)
      attach-content.ts                # merge compiled content (by slug) into bundles
      build-search-index.ts            # minisearch index creation
      fs-helpers.ts                    # readJSON, writeJSON, ensureDir
```

---

## 3) Install (Option A – build-time MDX → HTML)

Add dev dependencies (build toolchain only; nothing runs at request time):

```bash
npm i -D @mdx-js/mdx unified gray-matter \
       remark-parse remark-frontmatter remark-gfm remark-rehype \
       rehype-slug rehype-autolink-headings rehype-raw rehype-stringify
```

> Optional security hardening (recommended if content is authored externally):
>
> ```bash
> npm i -D rehype-sanitize
> ```
>
> Configure with an allowlist if you don’t want to allow arbitrary raw HTML in MDX.

---

## 4) Authoring rules (MDX)

Each content file must include **frontmatter** with a valid `slug` that matches a bundle or package in `src/data/**`.

**Example** `src/content/packages/bundles/digital-transformation-starter.mdx`

```mdx
---
slug: digital-transformation-starter
title: Digital Transformation Starter
summary: A pragmatic 90-day playbook to modernize your stack.
lastUpdated: 2025-01-15
---

# Digital Transformation Starter

We focus on compounding impact:
- Technical foundation
- Enablement & handoff
- Clear KPIs
```

**Do**

* Keep narrative copy here: overview, what’s included descriptions, rationale, outcomes described in words.
* Use headings (`#`, `##`), lists, links, images stored in `public/images/**` (e.g., `/images/packages/...`).
* Keep **prices, IDs, slugs, service relationships** in `src/data/**`.

**Don’t**

* Put prices or machine-critical logic in MDX.
* Duplicate data that already exists in TS/JSON.

---

## 5) Build pipeline (what happens)

**Script:** `scripts/packages/build.ts` runs the full workflow:

1. **Validate** SSOT (`validate-packages.ts`) and cross-refs.
2. **Compile MDX → HTML** (`lib/compile-mdx.ts`) and extract metadata:

   * `html` (safe to inject into a `<prose>` container)
   * `excerpt` (first paragraph or \~160 chars)
   * `wordCount`, `headings`, `updatedAt`
3. **Attach** compiled content **by slug** to bundles (`lib/attach-content.ts`), write:

   * `src/data/packages/__generated__/bundles.enriched.json`
4. **Build search index** (`lib/build-search-index.ts`) using titles/names, bullets, and `contentText` stripped from HTML:

   * `src/data/packages/__generated__/packages.search.json`
5. **Run checks/stats** (`check-featured-refs.ts`, `check-growth-embeds.ts`, `packages-stats.ts`, `doctor.ts`).

**Add to `package.json` scripts (example):**

```json
{
  "scripts": {
    "validate:packages": "tsx scripts/packages/validate-packages.ts",
    "check:packages:featured": "tsx scripts/packages/check-featured-refs.ts",
    "validate:packages:growth": "tsx scripts/packages/check-growth-embeds.ts",
    "stats:packages": "tsx scripts/packages/packages-stats.ts",
    "doctor:packages": "tsx scripts/packages/doctor.ts",

    "content:build": "tsx scripts/packages/build.ts",
    "data:ci": "npm-run-all -p validate:packages check:packages:featured validate:packages:growth content:build doctor:packages"
  }
}
```

**Git hygiene:**

* **Do not commit** build outputs:

  ```
  # .gitignore
  /src/data/packages/__generated__/
  ```
* Commit all MDX and data sources.

---

## 6) Types (what the app consumes)

Extend your canonical types (`src/data/packages/_types/packages.types.ts`) to include content:

```ts
export type PackageContent = {
  html: string;          // compiled HTML
  excerpt?: string;      // short summary for cards/meta
  wordCount?: number;
  updatedAt?: string;    // ISO
};

export type PackageBundle = {
  slug: string;
  name: string;
  description?: string;
  price?: { oneTime?: number; monthly?: number };
  services?: string[];
  includes?: { title: string; items: string[] }[];
  isMostPopular?: boolean;
  // …
  content?: PackageContent;  // ← attached during build
};
```

---

## 7) Rendering pages (how to use enriched data)

### Bundle detail page

```tsx
import { notFound } from "next/navigation";
import { getBundleBySlug } from "@/src/data/packages"; // returns enriched bundle
import styles from "./bundle.module.css";

export default function BundleDetailPage({ params }: { params: { bundle: string } }) {
  const bundle = getBundleBySlug(params.bundle);
  if (!bundle) return notFound();

  return (
    <main className={styles.page}>
      {/* existing hero/pricing/highlights… */}
      {bundle.content?.html && (
        <article
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: bundle.content.html }}
        />
      )}
    </main>
  );
}
```

### Hub page (cards / growth section)

Use your existing bridge mappers (e.g., `bridge-growth.ts`) and search index; nothing changes besides having `bundle.content?.excerpt` available for richer summaries.

---

## 8) Converting existing files

You currently have `.md` and `.ts` files for bundles/services.
**Keep the `.ts` SSOT files** (they are the truth for IDs/prices/tiers).
**Convert `.md` → `.mdx`** and move them under `src/content/**`:

**Before**

```
src/data/packages/bundles/digital-transformation-starter.md
src/data/packages/bundles/digital-transformation-starter.ts
```

**After**

```
src/content/packages/bundles/digital-transformation-starter.mdx
src/data/packages/bundles/digital-transformation-starter.ts
```

> The `.ts` remains the authoritative structured record. The `.mdx` provides the long-form narrative attached at build time.

---

## 9) Component expectations (no runtime MDX)

* **Components never import MDX.**
  They receive **data only** (strings/arrays/objects) from the page.
* For narrative sections, components receive **precompiled HTML** from `bundle.content.html` and render it inside a styled `<article className="prose">…`.
* Keep your existing CSS and class names; this plan doesn’t force changes to presentation.

---

## 10) CI / local workflows

### Local

```bash
# 1) Author/update MDX under src/content/**
# 2) Update SSOT data under src/data/** if needed (prices, slugs, etc.)
npm run content:build
npm run dev
```

### CI

```bash
npm ci
npm run data:ci
npm run build
```

---

## 11) Security & quality options

* Add `rehype-sanitize` to strip unsafe HTML from MDX during build.
* Lint MDX with Prettier (optional): `prettier-plugin-mdx`.
* Consider link checking in `scripts/packages/doctor.ts` (optional).

---

## 12) Troubleshooting

* **No content on page:** Ensure MDX frontmatter `slug` matches the bundle’s `slug`. Re-run `npm run content:build`.
* **404 bundle page:** Verify `generateStaticParams()` returns the slug and your **routes** align with data.
* **Search missing results:** Ensure `packages.search.json` is rebuilt; re-run `content:build`.

---

## 13) Summary (rules of the road)

* **SSOT:** All machine-critical fields (IDs, slugs, prices, tiering, relationships) live in `src/data/**`.
* **Content:** All long-form narrative lives in `src/content/**` as **MDX** with frontmatter `{ slug }`.
* **Build:** MDX is compiled to HTML at **build time** and attached to bundles/packages in `__generated__`.
* **Render:** Pages/components consume **enriched data**; no MDX loaders at runtime.
* **No duplication:** Prices & structured data never appear in MDX.

This is the single source of truth moving forward for this build.
