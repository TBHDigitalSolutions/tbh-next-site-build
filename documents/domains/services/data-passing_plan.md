Awesome—let’s lock down a clean, future-proof **data passing plan** that keeps pages in control, avoids prop/shape drift, and lets you reuse data across hubs without duplication.

---

# Services Data Passing — Official Plan

## Goals

* **Page-level control:** each route composes its own props and passes them down.
* **Single source of truth… with overrides:** central, reusable data (portfolio, packages, testimonials, modules) with **page overrides** where needed.
* **Stable types:** strict TypeScript types + tolerant adapters to map raw data → component props.
* **Zero route sprawl:** L3/L4 are **inline** (e.g., in `ServicesAndCapabilitiesExpandable`)—no extra routes.

---

## 1) Data model & ownership

### Source layers (priority order)

1. **Page overrides (highest)**

   * Path: `src/data/page/services-pages/<hub>/<service>/index.ts`
   * What: hero copy, intro, services & capabilities, expandable bullets, portfolio spotlight, pricing overrides, FAQs, CTA copy, etc.
   * Why: the page needs final say on what appears.

2. **Hub-shared (optional)**

   * Path: `src/data/page/services-pages/<hub>/_shared/*`
   * What: hub-level FAQs, testimonial pools, portfolio defaults, tone/voice fragments, common CTAs.
   * Why: don’t retype “About Marketing Services” 6 times.

3. **Cross-domain catalogs (central registries)**

   * Paths:

     * Portfolio: `src/data/portfolio/<hub>/*`
     * Packages: `src/data/packages/<hub>/*`
     * Testimonials: `src/data/testimonials/<hub>/*`
     * Case Studies: `src/data/caseStudies/<hub>/*`
     * Modules/Resources: `src/data/modules/*`
   * Access via **selectors** (tagged by hub/service/sub).
   * Why: single registry powering multiple pages.

> Rule: **page overrides > hub-shared > central selectors** (merge in that order).

---

## 2) How pages assemble data (pattern)

**At the page level** (e.g., `app/services/[hub]/[service]/page.tsx`):

* Use taxonomy to resolve the node.
* Import the service’s `index.ts` (page data).
* Optionally pull shared hub JSON (FAQs/testimonials/portfolio).
* Use **selectors** to fetch registry items by tags (hub/service/sub).
* Pass a single normalized object to `ServiceTemplate`.

**Suggested shape** (already supported by your template/adapters):

```ts
import type { ServiceTemplateData } from "@/types/servicesTemplate.types";
import { selectPortfolio, selectTestimonials, selectPackages, selectModules } from "@/data/selectors";
import sharedFaqs from "@/data/page/services-pages/marketing-services/_shared/faqs.json";

export const data: ServiceTemplateData = {
  hero: { /* page-specific */ },
  twoColVideo: { /* optional */ },
  capabilities: {
    title: "Services & Capabilities",
    description: "What's included",
    pillars: [ /* … */ ],
    bullets: [ /* optional quick links */ ],
    expandable: [ /* L3/L4 inline bullets */ ],
  },

  // Portfolio (page override OR selectors)
  portfolio: {
    title: "Selected Work",
    variant: "standard", // "video" | "demo"
    items: selectPortfolio({ hub: "marketing-services", service: "content-creative", featured: true, limit: 9 }),
  },

  // Resources rail (module carousel, includes Case Studies)
  modules: selectModules({ hub: "marketing-services", service: "content-creative", limit: 10 }),

  // Pricing (orchestrator picks the correct adapter)
  pricing: { /* page-defined or hub-defined; can be minimal */ },

  // Testimonials (mix shared + targeted)
  testimonials: {
    title: "What clients say",
    data: selectTestimonials({ hub: "marketing-services", service: "content-creative", limit: 3 }),
  },

  // FAQs (page overrides first; else hub-shared)
  faq: {
    title: sharedFaqs.title ?? "Frequently Asked Questions",
    faqs: [
      /* page overrides first… */,
      ...(sharedFaqs.faqs ?? []),
    ],
  },

  // CTA
  cta: { /* final call to action */ },
};
```

> ✅ Pages **compose** from shared sources, but can override any block.
> ✅ Selectors keep your registries centralized and re-taggable.

---

## 3) Directory conventions (authoring)

```
src/data/
  page/services-pages/<hub>/
    _shared/
      faqs.json
      portfolio.json      (optional; curated picks for hub)
      testimonials.json   (optional; curated picks for hub)
    <service>/
      index.ts            (author page overrides here)
    index.ts              (hub landing page data)

  portfolio/<hub>/
    <hub>-services-items.ts
    <hub>-services-featured.ts

  packages/<hub>/
    <hub>-packages.ts
    <hub>-addons.ts
    <hub>-featured.ts

  testimonials/<hub>/
    <hub>-testimonials.ts

  modules/
    common.ts
    hub-specific/<hub>.ts

  selectors.ts           (selectors for portfolio/packages/caseStudies/testimonials/modules)

  taxonomy/servicesTree.ts (must list all hubs/services)
```

> Keep **hub slugs canonical**:
> `/web-development-services`, `/video-production-services`, `/seo-services`, `/marketing-services`, `/lead-generation-services`, `/content-production-services`.

---

## 4) Selectors (single source of truth registries)

Use `src/data/selectors.ts` to avoid re-implementing “get N featured items tagged X/Y” logic.

**Examples:**

```ts
selectPortfolio({ hub: "marketing-services", service: "content-creative", featured: true, limit: 9 });
selectPackages({ hub: "web-development-services", service: "ecommerce", featured: true });
selectTestimonials({ hub: "seo-services", service: "technical", limit: 3 });
selectModules({ hub: "marketing-services", service: "content-creative", limit: 8 });
```

**Tags**: hub/service/sub are used to match items. Ensure new items are tagged with the **canonical hub** and the right service slug.

---

## 5) Types & adapters (safety + flexibility)

* **Types:**

  * `ServiceTemplateData` → master shape for pages
  * `servicesTaxonomy.types.ts` → nodes, slugs, guards
  * Component prop types inside each component directory

* **Adapters:**

  * In the page file (or a colocated `adapters.ts`), map your raw data → component props.
  * Keep adapters **tolerant** (optional fields, defaults) but **typed**.

**Example (Services & Capabilities Expandable):**

```ts
function toSACProps(data: ServiceTemplateData) {
  const cap = data.capabilities ?? {};
  return {
    title: cap.title ?? "Services & Capabilities",
    intro: cap.description,
    pillars: cap.pillars ?? [],
    bullets: cap.bullets ?? [],
    expandable: cap.expandable ?? [],
    defaultOpen: 1,
    analyticsId: "svc-capabilities",
  };
}
```

---

## 6) Page render flow (App Router)

* `app/services/[hub]/[service]/page.tsx`

  1. Resolve taxonomy node by params (`getNodeByParams`).
  2. Import **page data** file from `src/data/page/services-pages/<hub>/<service>/index.ts`.
  3. Optionally pull hub shared JSON and central selectors.
  4. **Assemble** `ServiceTemplateData` (page overrides > hub-shared > selectors).
  5. Render `ServiceTemplate` with `{ node, data }`.

* `ServiceTemplate` then:

  * Adapts data for each section (`Hero`, `TwoCol`, `ServicesAndCapabilitiesExpandable`, `Portfolio`, `Module Carousel`, `Pricing`, `Testimonials`, `FAQ`, `CTA`).
  * Handles **pricing orchestrator** (via `resolvePricingAdapter`) per hub/service.

---

## 7) Portfolio vs Case Studies vs Module Carousel

* **Portfolio**: visual examples (websites, videos, UI, demos). Render with:

  * `StandardPortfolioGallery` (default) or
  * `VideoPortfolioClient` (video-heavy) and
  * optional `PortfolioDemoClient`.

* **Case Studies**: **not** a dedicated carousel anymore.

  * Put case studies (PDFs/long-form) into the **Module Carousel** with other resources/tools.
  * Use `selectModules` and tag items as `case-study`.

---

## 8) Pricing

* Page provides minimal `pricing` block or full configuration.
* **Orchestrator** (in `ServiceTemplate`) calls `resolvePricingAdapter` with `{ level: 2, hub, service }`.
* The adapter maps raw pricing into `PricingSection` / `ComparisonTable` props.

> If no adapter exists, pricing quietly skips (ok in dev, warn in console).

---

## 9) Middleware & URLs

* Ensure `middleware.ts` does **not** rewrite canonical hubs to short forms.
* Matchers include all six Level-0 hubs.
* `servicesTree.ts` must list every hub/service so `generateStaticParams()` can prebuild routes.

---

## 10) Example: Marketing → Content & Creative

**Data file**
`src/data/page/services-pages/marketing-services/content-creative/index.ts`

```ts
import { selectPortfolio, selectTestimonials, selectModules } from "@/data/selectors";
import type { ServiceTemplateData } from "@/types/servicesTemplate.types";

const HUB = "marketing-services";
const SERVICE = "content-creative";

const data: ServiceTemplateData = {
  hero: { /* … */ },

  twoColVideo: { /* … */ },

  capabilities: {
    title: "Creative that performs",
    description: "Messaging, visuals, and formats aligned to goals.",
    pillars: [ /* … */ ],
    expandable: [
      { id: "story-dev", title: "Message & Story", summary: "Positioning, brand voice", details: ["Value props", "Narratives", "Hooks"] },
      // …
    ],
  },

  portfolio: {
    title: "Selected Work",
    variant: "standard",
    items: selectPortfolio({ hub: HUB, service: SERVICE, featured: true, limit: 9 }),
  },

  modules: selectModules({ hub: HUB, service: SERVICE, limit: 10 }),

  pricing: { /* minimal is okay */ },

  testimonials: {
    title: "What clients say",
    data: selectTestimonials({ hub: HUB, service: SERVICE, limit: 3 }),
  },

  faq: { title: "FAQs", faqs: [ /* page overrides or merged hub-shared */ ] },

  cta: { title: "Let’s plan your next launch", primaryCta: { label: "Book a consult", href: "/contact" } },
};

export default data;
```

**Page**
`app/services/[hub]/[service]/page.tsx` (already set up per your last drop—just ensure it imports this `data` and passes to `ServiceTemplate`).

---

## 11) Validation & QA checklist

* **Types**

  * `npm run typecheck` (no TS errors)
* **Build**

  * `npm run build` (tree compiles, routes generated)
* **Lint**

  * `npm run lint` (clean)
* **Manual**

  * Visit `/services/<hub>/<service>` for all six hubs.
  * Check:

    * Hero renders
    * Two-col intro optional
    * Services & Capabilities + Expandable bullets render and toggle
    * Portfolio shows correct variant/items (6–9)
    * Module carousel shows **resources & case studies**
    * Pricing section present (or intentionally omitted)
    * Testimonials & FAQs show
    * Final CTA shows
  * Breadcrumbs & canonical URLs correct
* **Tags**

  * All selector-fetched items tagged with **canonical hub/service**.
* **Middleware**

  * `/web-development-services/*` → `/services/web-development-services/*`
  * No unintended rewrites (e.g., marketing-services → marketing ❌)

---

## 12) Why this works

* **Page-first composition** keeps UX/storytelling flexible.
* **Selectors + tags** give you a single registry and prevent duplication.
* **Adapters** de-risk prop shape drift.
* **Canonical slugs** guarantee consistent URLs, data lookups, and caching.
* **Incremental migration friendly**: any page can inline data now, then switch to selectors later.

If you want, I can generate a **starter boilerplate** for a new service page (data file + test) so you can copy/paste when adding the next one.
