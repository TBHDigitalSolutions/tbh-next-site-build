Here’s the **official documentation** for your `/src/data` directory—how it’s organized, how to use it, and how it mirrors your App Router and `public/` assets. This is opinionated, production-ready, and matches everything we’ve built so far.

---

# `/src/data` — Official Guide

## Purpose

* Be the **single authoritative store** for content, catalog items, and page configs that drive the App Router (`/app`).
* Keep a clean separation between:

  * **Domain catalogs** (portfolio, packages, testimonials, case studies, modules/resources)
  * **Page data** (per hub/service page overrides)
  * **Functional helpers** (selectors, composers, taxonomy)
* **Mirror** the structure and slugs used by the App Router and `public/` to reduce mental overhead.

> Canonical Level-0 hub slugs used **everywhere** (URLs, tags, folders):
>
> `/web-development-services`
> `/video-production-services`
> `/seo-services`
> `/marketing-services`
> `/lead-generation-services`
> `/content-production-services`

---

## High-level layout

```
src/data/
  booking/                       # non-content config
  caseStudies/                   # long-form resources used in Module Carousel
  composers/                     # page prop builders (Hub/Service/SubService)
  modules/                       # Resources & Case Studies (card rail)
  packages/                      # pricing packages & add-ons catalogs
  page/                          # page-level overrides (per hub/service)
  portfolio/                     # visual work catalogs
  selectors.ts                   # central selectors over catalogs
  taxonomy/                      # servicesTree (hubs/services for routes)
  testimonials/                  # testimonial catalogs per hub
```

The **App Router** routes:

```
app/services/[hub]/page.tsx            # Hub landing
app/services/[hub]/[service]/page.tsx  # Service page
```

mirror **page data** in:

```
src/data/page/services-pages/<hub>/index.ts
src/data/page/services-pages/<hub>/<service>/index.ts
```

and pull **shared catalogs** via `src/data/selectors.ts`.

---

## Conventions & rules (must follow)

1. **Canonical hub slugs** only (folders, tags, URLs, taxonomy):

   * `web-development-services`, `video-production-services`, `seo-services`,
     `marketing-services`, `lead-generation-services`, `content-production-services`.

2. **Service slugs** must match `servicesTree.ts`. Examples:

   * Marketing services: `digital-advertising`, `content-creative`, `martech-automation`, `analytics-optimization`, `pr-communications`, `strategy-consulting`.

3. **Tagging** for selectors:

   * Every catalog item (portfolio/packages/testimonials/case studies/modules) must include tags:

     * `hub`: the canonical hub slug
     * `service` (optional): the service slug when applicable
     * `sub` (optional): sub-service slug when applicable

4. **Data precedence**:

   * **Page overrides** (highest) → **Hub shared** → **Global selectors/catalogs**.
   * Pages can fully replace or extend shared data.

5. **Types + tolerant adapters**:

   * Author in the flexible page shapes (e.g., `ServiceTemplateData`),
   * Use tolerant adapters in the template to map to component props safely.

---

## Domains (catalogs)

### 1) Portfolio — `/src/data/portfolio`

* **What**: visual examples (sites, videos, demos).

* **Use**: `StandardPortfolioGallery`, `VideoPortfolioClient`, `PortfolioDemoClient`.

* **Structure**:

  ```
  portfolio/
    <hub>/
      <hub>-services-items.ts      # all items tagged for hub
      <hub>-services-featured.ts   # curated subset
    items/                         # raw reusable items (optional)
    _types/_utils/_validators      # typing/validation helpers
    index.ts                       # named exports & registry
  ```

* **Tags**: each item MUST include `tags: ["marketing-services", "content-creative", ...]`.

* **Select in pages**:

  ```ts
  import { selectPortfolio } from "@/data/selectors";

  const items = selectPortfolio({
    hub: "marketing-services",
    service: "content-creative",
    featured: true,
    limit: 9,
  });
  ```

### 2) Packages — `/src/data/packages`

* **What**: pricing packages, add-ons, featured sets; plus cross-hub bundles.
* **Structure**:

  ```
  packages/
    <hub>/
      <hub>-packages.ts
      <hub>-addons.ts
      <hub>-featured.ts
    bundles/                       # cross-hub prebuilt bundles
    _types/_utils/_validators
    index.ts
  ```
* **Select**:

  ```ts
  import { selectPackages } from "@/data/selectors";

  const pkgs = selectPackages({ hub: "marketing-services", service: "content-creative", featured: true });
  ```

### 3) Testimonials — `/src/data/testimonials`

* **What**: testimonial pools per hub; optionally service-tagged.
* **Structure**:

  ```
  testimonials/
    <hub>/
      index.ts
      <hub>-testimonials.ts
    types.ts
    index.ts
  ```
* **Select**:

  ```ts
  import { selectTestimonials } from "@/data/selectors";

  const quotes = selectTestimonials({ hub: "marketing-services", service: "content-creative", limit: 3 });
  ```

### 4) Case Studies — `/src/data/caseStudies`

* **What**: Long-form resources (PDFs/long reads). **Shown inside Module Carousel** (not a separate carousel).
* **Structure** mirrors hubs:

  ```
  caseStudies/<hub>/<hub>-cases.ts
  ```
* **Consume via Modules** (below) or export directly if needed.

### 5) Modules / Resources — `/src/data/modules`

* **What**: The “Resources & Case Studies” rail (guides, tools, calculators, **case studies**).
* **Structure**:

  ```
  modules/
    common.ts                # shared items available cross-hub
    hub-specific/<hub>.ts    # hub-only or curated lists
    types.ts
    index.ts                 # moduleSelectors.getForContext(...)
  ```
* **Select**:

  ```ts
  import { selectModules } from "@/data/selectors";
  const modules = selectModules({ hub: "marketing-services", service: "content-creative", limit: 8 });
  ```

---

## Page data (overrides)

### `/src/data/page/services-pages`

* **Goal**: Put the **final say** for a given page here.

* **Structure**:

  ```
  page/services-pages/<hub>/
    _shared/               # optional hub-wide FAQs/portfolio/testimonials JSON
      faqs.json
      portfolio.json
      testimonials.json
    index.ts               # hub landing page data
    <service>/index.ts     # service page data (exports ServiceTemplateData)
    schema.ts              # optional zod/yup schemas for authoring safety
  ```

* **Example service page data**:

  ```ts
  // src/data/page/services-pages/marketing-services/content-creative/index.ts
  import type { ServiceTemplateData } from "@/types/servicesTemplate.types";
  import { selectPortfolio, selectTestimonials, selectModules } from "@/data/selectors";
  import sharedFaqs from "../_shared/faqs.json";

  const HUB = "marketing-services";
  const SERVICE = "content-creative";

  const data: ServiceTemplateData = {
    hero: { /* ... */ },
    twoColVideo: { /* optional */ },
    capabilities: {
      title: "Services & Capabilities",
      description: "What's included",
      pillars: [ /* ... */ ],
      bullets: [ /* quick links */ ],
      expandable: [ /* L3/L4 */ ],
    },
    portfolio: {
      title: "Selected Work",
      variant: "standard",
      items: selectPortfolio({ hub: HUB, service: SERVICE, featured: true, limit: 9 }),
    },
    modules: selectModules({ hub: HUB, service: SERVICE, limit: 10 }),
    pricing: { /* minimal ok (adapter will map) */ },
    testimonials: {
      title: "What clients say",
      data: selectTestimonials({ hub: HUB, service: SERVICE, limit: 3 }),
    },
    faq: {
      title: sharedFaqs?.title ?? "Frequently Asked Questions",
      faqs: [
        // page overrides...
        ...(sharedFaqs?.faqs ?? []),
      ],
    },
    cta: { title: "Ready to get started?", primaryCta: { label: "Book a consult", href: "/contact" } },
  };

  export default data;
  ```

---

## Functional helpers

### `selectors.ts`

* Single interface to centralized catalogs (portfolio, packages, testimonials, case studies as modules).
* **APIs**:

  ```ts
  selectPortfolio({ hub, service?, sub?, featured?, limit? })
  selectPackages({ hub, service?, sub?, featured?, limit? })
  selectTestimonials({ hub, service?, sub?, limit? })
  selectModules({ hub, service?, sub?, limit? })
  ```
* **Tags** must align with canonical slugs.

### `composers/`

* Optional utilities for building Hub/Service/SubService page props from data sources.
* Keep **stateless** and **pure**; return typed `ServiceTemplateData`.

### `taxonomy/servicesTree.ts`

* The authoritative tree for **all hubs and services** used by routes and breadcrumbs.
* Must include:

  * Hub nodes with **canonical hub slugs** (Level-0).
  * Each service slug under the correct hub.
* Used by:

  * `lib/services/taxonomy.ts` & helpers
  * `generateStaticParams` in App Router pages

---

## How data flows (end-to-end)

1. **Route params** → resolve node via taxonomy (`[hub]/[service]`).
2. **Load page data**
   `src/data/page/services-pages/<hub>/<service>/index.ts`.
3. **Merge & augment**

   * Pull hub `_shared` JSON (optional)
   * Pull catalogs via `selectors.ts` by tags
4. **Render** `ServiceTemplate` with `{ node, data }`.
5. **Template adapters** map to component props:

   * `ServiceHero`, `TwoColumnSection`
   * `ServicesAndCapabilitiesExpandable`
   * `StandardPortfolioGallery`/`VideoPortfolioClient`/`PortfolioDemoClient`
   * Module Carousel (resources & case studies)
   * `PricingSection` / `ComparisonTable` (via pricing adapters)
   * `Testimonials`, `FAQAccordion`, `CTASection`

---

## Mirroring App Router & public assets

* **App paths** – `/services/<hub>/<service>` must match:

  * Data paths: `src/data/page/services-pages/<hub>/<service>/index.ts`
  * Taxonomy node: hub + service slugs
  * Catalog tags: `["<hub>", "<service>", ...]`
* **Public assets** referenced in data (images, videos) live under `/public/...`, and URLs stored directly in page data/catalogs (e.g., `/pages-content/...`).

---

## Authoring checklist (adding a new service)

1. **Taxonomy**

   * Add service under the hub in `src/data/taxonomy/servicesTree.ts`.
2. **Page data**

   * Create `src/data/page/services-pages/<hub>/<service>/index.ts` and export `ServiceTemplateData`.
   * Optionally add `_shared/faqs.json`, `_shared/portfolio.json`, `_shared/testimonials.json` at hub level.
3. **Catalog tags**

   * Tag portfolio/packages/testimonials/modules items with the **canonical hub** and the **service** slug.
4. **Selectors**

   * If you need special filtering, extend underlying *category* registries, not page code.
5. **Build & QA**

   * `npm run typecheck`
   * `npm run build`
   * Visit `/services/<hub>/<service>`

---

## Do & Don’t

**Do**

* Use **canonical hub slugs** everywhere.
* Keep **selectors** the only way to fetch catalog items in page data.
* Use **page overrides** to control final content.
* Keep **composers/adapters** tolerant to missing fields.

**Don’t**

* Hardcode non-canonical hub slugs (e.g., `"marketing"` instead of `"marketing-services"`).
* Duplicate catalog entries per page—use tags + selectors.
* Bypass types—add a minimal type if you need a new block.

---

## Quick examples

**Portfolio item (catalog)**

```ts
export const marketingFeatured = [
  {
    id: "mk-campaign-01",
    title: "Launch Campaign",
    media: [{ kind: "image", src: "/pages-content/marketing/launch.jpg" }],
    tags: ["marketing-services", "digital-advertising"],
    metrics: { impressions: 1200000, cvr: 0.043 },
  },
];
```

**Service page using selectors**

```ts
import { selectPortfolio } from "@/data/selectors";

const items = selectPortfolio({
  hub: "marketing-services",
  service: "digital-advertising",
  featured: true,
  limit: 9,
});
```

**Hub landing page data**

```ts
// src/data/page/services-pages/marketing-services/index.ts
import type { HubPageData } from "@/types/servicesTemplate.types";
import { selectTestimonials } from "@/data/selectors";

const data: HubPageData = {
  hero: { /* ... */ },
  overview: { /* ... */ },
  testimonials: {
    title: "Loved by teams",
    data: selectTestimonials({ hub: "marketing-services", limit: 5 }),
  },
};
export default data;
```

---

## Maintenance tips

* When changing a hub/service slug:

  * Update `servicesTree.ts`, catalog **tags**, and any **page data** paths.
  * Verify `middleware.ts` aliases don’t rewrite canonical hubs incorrectly.
* Keep JSON in `_shared` for non-TS authors; use `schema.ts` to validate if needed.
* Keep catalog registries **small and composable**; prefer feature files per hub over giant files.

---

That’s it. With this structure, the **App Router**, **data directory**, and **public assets** all speak the same language—consistent slugs, predictable paths, typed data, and page-first composition powered by selectors.
