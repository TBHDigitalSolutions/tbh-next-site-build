Official Title: Portfolio Domain Implementation Guide
Domain: Portfolio, Web Development
File Name: portfolio-domain_implementation-guide_2025-09-12.md
Main Part: portfolio-domain
Qualifier: ImplementationGuide
Date: 2025-09-12
Spotlight Comments:

Consolidates portfolio hub and category page implementation details.
Defines data contracts, validation scripts, and SEO/routing strategies.
Cross-references marketing-services-data-integration.md and canonical-hub-slugs.md.

Summary: The Portfolio Domain Implementation Guide provides a comprehensive specification for implementing the portfolio hub (/portfolio) and category pages (/portfolio/[category]) at TBH Digital Solutions. It details the file structure, data contracts, page behaviors, canonical category slugs, validation scripts, and SEO strategies, ensuring consistent rendering of visual examples, case studies, and package recommendations across service families, with a focus on performance, indexability, and developer experience.

---

Here’s a single, production-ready **Portfolio Domain Documentation** you can drop into `docs/portfolio/ It consolidates your 10 attached docs into one clear spec: what the portfolio is, how it’s wired into the app/router/components/data, which scripts keep it healthy, and how category→service alignment works.

---

# Portfolio Domain — Implementation Guide

## 1) What this domain is

The Portfolio domain powers:

* **Hub**: `/portfolio` — a directory of your work across all services, with search, per-service highlights, and conversion CTAs.&#x20;
* **Category pages**: `/portfolio/[category]` — deep dives per service (Video, Web, SEO, Content, Marketing, Lead Gen) with a full gallery, tools, case studies, and category-aware packages.&#x20;

**Goals**: prove capability; enable quick preview; drive action via relevant packages; keep layout/SEO consistent; remain indexable and fast.&#x20;

---

## 2) Files & directories

### App Router (server + client split)

```
/app/portfolio
├── [category]
│   ├── CategoryPageClient.module.css
│   ├── CategoryPageClient.tsx
│   └── page.tsx
├── HubSections.module.css
├── HubSectionsClient.tsx
├── page.tsx
└── portfolio.module.css
```

* **Hub server page** loads 3 featured items per service and renders hero, search, sections, package CTA, final CTA. **Client** renders correct gallery variant and analytics.&#x20;
* **Category server page** validates slug, sets SEO/JSON-LD, fetches portfolio items + tools + case studies + recommended packages; **client** renders interactive gallery, tools, packages, CTA tracking.&#x20;

### Data & APIs (SSOT, build-time)

* `/src/data/portfolio/index.ts` — items + simple types + API functions like `getAllPortfolioItems`, `getPortfolioItemsByCategory`, `getTopItemsByCategory`, `searchPortfolioItems`. Static, imported at build time. &#x20;
* `/src/data/packages/recommendations.ts` — returns exactly **3** packages mapped to category tags. &#x20;
* `/src/data/caseStudies/index.ts` — featured case studies with rich metadata and a small pull on category pages. &#x20;
* Category-specific gallery variants (interactive/video/image) are chosen in client components.&#x20;

---

## 3) Page behaviors (hub vs category)

### Hub `/portfolio`

Flow: **Hero → Global Search → Per-category highlights (top 3 + modal) → Narrow GrowthPackagesCTA → Final CTA**. Keep this server-first for SEO; client handles modals. &#x20;

### Category `/portfolio/[category]`

Flow: **Hero/Intro → CategoryPageClient (Gallery variant) → Tools → Case Studies (3) → GrowthPackagesSection (3 recs) → Final CTA**. Normalize any non-primitive metric values for safe React rendering. &#x20;

---

## 4) Data contracts (keep simple, type-safe)

**Project**

```ts
type Project = {
  id: string;
  title: string;
  description?: string;
  category: CategorySlug;   // use union, not arbitrary strings
  tags?: string[];
  client?: string;
  featured?: boolean;
  media: ProjectMedia;      // includes thumbnail; poster for video
  href?: string;
  metrics?: { label: string; value: string }[];
};
```

Move `category` from `string` to `CategorySlug` (six canonical values) and keep the simpler data-layer types as the SSOT. &#x20;

**Package (recommendations)**
3 recommended packages per category via `categoryTags`.&#x20;

**CaseStudy**
Small, consistent shape; used as a strip of three on category pages.&#x20;

---

## 5) Canonical categories & slugs

Use a **fixed union** for categories:
`web-development`, `video-production`, `seo-services`, `marketing-automation`, `content-production`, `lead-generation`. Validate `category` against this list at build time.&#x20;

---

## 6) Validation, health & DX

### What to keep (and not change)

* Keep the simple data structure and working hub/category pages; don’t re-locate packages; avoid over-engineering validation.&#x20;

### Build-time checks to add (or keep)

* **Category validation** (union type + quick runtime guard).
* **Asset verification**: thumbnails always; poster for video; demo `src` accessible.
* **Metrics normalization**: values are primitives.  &#x20;

### Helpful developer utilities

* `getPortfolioStats()` summary (counts, featured, missing assets) for quick sanity checks.&#x20;

---

## 7) Scripts (what to run, when)

**Core validators & health checks**

* `npm run validate:portfolio` — strict schema validation.
* `npm run health:portfolio` — orphans, missing media, inconsistent tags, cross-links.
* `npm run stats:portfolio` — counts & coverage for planning.
* `npm run portfolio:deep-analysis` — verbose + stats; weekly.
  *(Your script set is already wired for quick/verbose/json/dry-run flavors.)*&#x20;

**CI gate (recommended)**

```
npm run verify:public
npm run validate:packages && npm run check:packages:featured
npm run validate:portfolio:quick && npm run health:portfolio:ping
npm run validate:taxonomy && npm run validate:services-pages
```

This preserves the working architecture and blocks merges on drift or missing assets/categories.&#x20;

---

## 8) SEO & routing

* **Server files** own metadata + JSON-LD; **client files** own interactivity. Keep the split for indexability and performance.&#x20;
* Hub uses narrow **GrowthPackagesCTA**; category uses the **three-card GrowthPackagesSection** (not the banner).&#x20;
* Portfolio routes are flat and stable; categories map 1:1 to service families (same canonical slugs as services).&#x20;

---

## 9) UX details & consistency

* Choose gallery **variant** by category (interactive for Web, video grid for Video, standard for others). Use the same rhythm and shared CSS modules for consistency. &#x20;
* Track modal opens, item clicks, package clicks, etc., for insights.&#x20;

---

## 10) “Done” checklist

**Data quality**

* [ ] Every item uses a canonical `CategorySlug`
* [ ] No missing `media.thumbnail`; video has `media.poster`
* [ ] Metrics values are primitives (string/number)
* [ ] `getPortfolioStats()` reports clean status&#x20;

**Pages**

* [ ] Hub shows 3 featured per category and loads package CTA + final CTA
* [ ] Category shows full gallery + tools + 3 case studies + 3 packages + final CTA&#x20;

**DX**

* [ ] Single source of truth for types in data layer
* [ ] Helpful warnings in dev for asset issues
* [ ] Validators wired into CI (non-zero exit on fail)&#x20;

---

## 11) Authoring notes (quick)

* Add/modify items only in **`/src/data/portfolio/index.ts`** (SSOT).
* Keep categories within the canonical set; tags are free-form but keep a short controlled list for filters.
* Provide a thumbnail for every item; videos need a poster; interactive demos need a working URL.

---

## 12) Future-proofing (optional)

* If portfolio grows large, consider a small index for client search; otherwise current client-side filtering is fine.&#x20;
* Keep package data where it is (don’t move into the portfolio tree).&#x20;

---

### TL;DR

* **Keep the simple SSOT in `/src/data/portfolio`**, with a union category type and light runtime checks.
* **Hub** = orient + search + 3 featured per service; **Category** = deep gallery + tools + 3 case studies + 3 packages + CTA.
* **Scripts** validate categories/assets/links and protect you in CI.
* The current architecture is **production-ready**; polish comes from standardizing categories, asset checks, and consistent SEO/server ownership.&#x20;

---

If you want, I can output this directly as `docs/portfolio/README.md` and add a tiny `npm run validate:portfolio:rules` that asserts category slugs + thumbnails/posters at build time.
