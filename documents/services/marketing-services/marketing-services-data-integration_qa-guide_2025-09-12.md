Official Title: Marketing Services Hub Data Integration and QA Guide

Domain: Services, Web Development, Quality Assurance

File Name: marketing-services-data-integration_qa-guide_2025-09-12.md

Main Part: marketing-services-data-integration

Qualifier: QAGuide

Date: 2025-09-12

Spotlight Comments:
- Guides data integration from taxonomy to service pages for Marketing Services hub.
- Includes npm pre-flight, data validation, and manual QA for L2 pages.
- Cross-references canonical-hub-slugs.md and marketing-services-qa.md.

Summary: The Marketing Services Hub Data Integration and QA Guide provides a focused process for ensuring the Marketing Services hub (`/services/marketing-services`) and its L2 pages correctly integrate data from taxonomy, case studies, modules, packages, portfolio, and testimonials into the `ServiceTemplate`. It outlines npm pre-flight steps, verifies data directory structures, selector usage, and app router setup, and includes a manual QA matrix to confirm rendering and functionality, ensuring alignment with canonical hub slugs and preventing issues like redirect loops.

---

Awesome—here’s the tightened, **npm-only** pre-flight plus a focused **data directory → service pages → app router** integration guide. I’ll use **Marketing Services** as the proving ground and call out what to mirror for other hubs.

---

# 1) Pre-flight (npm only)

Run these in order from your project root:

```bash
# 1) Clean caches (optional but helpful)
npm run clean --silent || true

# 2) TypeScript: catches shape/prop mismatches early
npm run typecheck

# 3) ESLint: consistent imports, dead files, etc.
npm run lint

# 4) Build: validates dynamic imports, route params, and bundling
npm run build

# 5) Dev: manual QA run
npm run dev
```

**If anything fails**, fix **type errors first** (they surface almost all data/prop shape issues before runtime). Then fix lint, then build.

---

# 2) Data directory → service pages → app router (how it all connects)

Below is what to verify and how each file set participates in rendering a page like
`/services/marketing-services/content-creative`.

## 2.1 Data domains & what they provide

These are your **central sources of truth**, queried by page-level `index.ts` via selectors.

### Case studies (used inside Module Carousel)

```
src/data/caseStudies/
├─ marketing-services/
├─ seo-services/
├─ web-development/
├─ video-production/
├─ lead-generation/
├─ content-production/
├─ _types/ _utils/ _validators/
└─ index.ts                      // exports caseStudySelectors
```

* **Tags** rule everything: items should include at least `["marketing-services"]` and optionally a service tag like `["content-creative"]`.
* Page files consume them **indirectly** via `selectModules` (since case studies live in the Module Carousel).

### Modules (resources rail: “Resources & Case Studies”)

```
src/data/modules/
├─ hub-specific/
├─ common.ts
├─ types.ts
└─ index.ts                      // exports moduleSelectors.getForContext(hub, service?, sub?, limit?)
```

* **Where case studies appear now.**
* Select in page data with `selectModules({ hub: "marketing-services", service: "content-creative", limit: 6 })`.

### Packages & pricing

```
src/data/packages/
├─ marketing-services/
│  ├─ marketing-packages.ts
│  ├─ marketing-featured.ts
│  └─ marketing-addons.ts
├─ web-development/ ... etc
├─ _types/ _utils/ _validators/
├─ integrated-growth-packages.ts
├─ recommendations.ts
└─ index.ts                      // exports packageSelectors
```

* Expose **featured** and **all** via `selectPackages`.
* Pricing rendering is orchestrated by `src/lib/services/pricingAdapters.ts` (maps your raw pricing to `PricingSection` props).

### Portfolio (visual examples)

```
src/data/portfolio/
├─ marketing-services/
│  ├─ marketing-services-items.ts
│  └─ marketing-services-featured.ts
├─ items/ (shared pool if you have one)
├─ *_services ... (other hubs)
└─ index.ts                      // exports portfolioSelectors
```

* Use `selectPortfolio({ hub, service, featured: true, limit: 9 })` for the “Selected Work” grid.
* Items should be tagged: `["marketing-services", "<service-slug>"]`.

### Testimonials

```
src/data/testimonials/
├─ marketing-services/
│  └─ marketing-services-testimonials.ts
├─ web-development-services/ ... etc
├─ types.ts
└─ index.ts                      // exports testimonialSelectors
```

* Query with `selectTestimonials({ hub, service, limit })`.
* Tagging same pattern as portfolio.

### Taxonomy (drives routing & static params)

```
src/data/taxonomy/servicesTree.ts      // authoritative tree
```

* Must contain the **hub** `marketing-services` and these L2 services:

  * `digital-advertising`, `content-creative`, `martech-automation`, `analytics-optimization`, `pr-communications`, `strategy-consulting`
* Each node requires: `kind`, `id`, `slug`, `path`, `title`, and a minimal `hero`.

---

## 2.2 Selectors façade (one place to fetch domain data)

```
src/data/selectors.ts
```

You already have:

```ts
import { selectPortfolio, selectTestimonials, selectPackages, selectCaseStudies, selectModules } from "@/data/selectors";
```

* **Make sure** `selectModules` signature is:

  ```ts
  selectModules({ hub, service, sub, limit })
  ```
* All selectors accept a `{ hub, service?, sub?, featured?, limit? }` and compute the **tags** behind the scenes.

---

## 2.3 Page data files for Marketing Services (L2 pages)

Each file exports **`ServiceTemplateData`** for a single service page.

```
src/data/page/services-pages/marketing-services/
├─ _shared/
│  ├─ faqs.json
│  ├─ portfolio.json
│  └─ testimonials.json
├─ content-creative/index.ts
├─ digital-advertising/index.ts
├─ martech-automation/index.ts
├─ analytics-optimization/index.ts
├─ pr-communications/index.ts
├─ strategy-consulting/index.ts
└─ index.ts   // (optional: hub-level landing data)
```

**What each `index.ts` should do (pattern):**

```ts
import type { ServiceTemplateData } from "@/types/servicesTemplate.types";
import { selectPortfolio, selectTestimonials, selectPackages, selectModules } from "@/data/selectors";

const hub = "marketing-services";
const service = "content-creative"; // folder slug

export const data: ServiceTemplateData = {
  kind: "service",
  slug: service,
  path: `/services/${hub}/${service}`,
  title: "Content & Creative",

  hero: {
    content: {
      title: "Content & Creative",
      subtitle: "Editorial, creative, and production that ships quality consistently.",
      primaryCta: { label: "Book a consult", href: "/contact" }
    }
  },

  // 2-column intro or video (optional)
  twoColVideo: {/* ...optional block... */},

  // NEW combined component input
  servicesAndCapabilitiesExpandable: {
    title: "Services & Capabilities",
    intro: "What’s included and how we deliver.",
    pillars: [/* cards */],
    bullets: [/* quick inline links */],
    expandable: [/* accordion items */],
    defaultOpen: 1,
    analyticsId: "sac-content-creative"
  },

  // Portfolio (visual examples)
  portfolio: {
    title: "Selected Work",
    items: selectPortfolio({ hub, service, featured: true, limit: 9 })
  },

  // Modules rail (includes case studies)
  modules: {
    title: "Resources & Case Studies",
    items: selectModules({ hub, service, limit: 6 })
  },

  // Pricing/Packages (optional)
  pricing: {/* raw pricing data for adapter */},
  packages: {
    title: "Packages & Add-Ons",
    items: selectPackages({ hub, service, featured: true, limit: 6 })
  },

  // Social proof
  testimonials: {
    title: "What clients say",
    data: selectTestimonials({ hub, service, limit: 3 })
  },

  // FAQ
  faq: {
    title: "FAQs",
    items: [/* or import from _shared/faqs.json */]
  },

  // Final CTA
  cta: {
    title: "Ready to get started?",
    primaryCta: { label: "Talk to us", href: "/contact" }
  },

  // SEO
  seo: {
    title: "Content & Creative Services | Marketing",
    description: "Editorial and creative services for growth teams.",
    canonical: `/services/${hub}/${service}`
  }
};

export default data;
```

**Repeat the same pattern** for the other Marketing L2 pages, adjusting `service`, `title`, and content.

> If you prefer pure JSON for some sections, import JSON and **map** it into the expected shape inside the `index.ts`.

---

## 2.4 App Router: dynamic route uses loaders + template

```
app/services/[hub]/[service]/page.tsx
```

This page should:

1. Generate static params from taxonomy
2. Resolve the node with `getNodeByParams({ hub, service })`
3. Load the `ServiceTemplateData` for that node (via `loadServicePageData`)
4. Render your `ServiceTemplate`

**Example skeleton:**

```tsx
// app/services/[hub]/[service]/page.tsx
import { notFound } from "next/navigation";
import ServiceTemplate from "@/templates/ServicePage/ServiceTemplate";
import { getAllServiceParams, getNodeByParams, loadServicePageData } from "@/lib/services/dataLoaders";

export async function generateStaticParams() {
  return getAllServiceParams(); // [{ hub: 'marketing-services', service: 'content-creative' }, ...]
}

type Props = { params: { hub: string; service: string } };

export default async function ServicePage({ params }: Props) {
  const node = getNodeByParams(params); // finds Taxonomy node
  if (!node) return notFound();

  const data = await loadServicePageData(node); // imports the matching src/data/page/.../index.ts
  if (!data || data.kind !== "service") return notFound();

  return <ServiceTemplate node={node} data={data} />;
}
```

> Ensure `loadServicePageData` maps `(hub, service)` → `src/data/page/services-pages/${hub}/${service}/index.ts`.

---

## 2.5 Template consumes the data

```
src/templates/ServicePage/ServiceTemplate.tsx
```

* You already refactored this to:

  * Render **ServiceHero**
  * (Optional) **TwoColumnSection / TwoColVideoSection**
  * **ServicesAndCapabilitiesExpandable** (new)
  * Portfolio section (Standard or Video or Demo)
  * **Module Carousel** (contains Case Studies)
  * Pricing & Comparison
  * Packages & Add-Ons
  * Testimonials
  * FAQAccordion
  * Final CTA

**Critical checks**

* It imports and uses:

  * `ServicesAndCapabilitiesExpandable` (not the old split version)
  * Portfolio components
  * Module Carousel (for case studies)
* Adapters inside the template **do not rename** fields you’ve standardized in `ServiceTemplateData`.

---

## 2.6 Middleware: no surprising rewrites

```
middleware.ts
```

* `CANONICAL_HUBS` must include `"marketing-services"`.
* **Do not** alias `"marketing-services"` → `"marketing"`.
* Matchers include the six `/*-services` roots.

This prevents `/services/marketing-services` from being redirected to `/services/marketing`.

---

## 2.7 Types keep all this honest

* `src/types/servicesTemplate.types.ts`

  * Verify the fields used above exist (`servicesAndCapabilitiesExpandable`, `portfolio`, `modules`, etc.).
* `src/types/servicesTaxonomy.types.ts`

  * Verify top-level hubs include `"marketing-services"` and friends.
* `src/components/ui/organisms/ServicesAndCapabilitiesExpandable/types.ts`

  * Matches the props you pass from the page data.

Run:

```bash
npm run typecheck
npm run build
```

---

## 2.8 Quick manual QA matrix (Marketing hub)

Open these and skim console for prop warnings:

* `/services/marketing-services/digital-advertising`
* `/services/marketing-services/content-creative`
* `/services/marketing-services/martech-automation`
* `/services/marketing-services/analytics-optimization`
* `/services/marketing-services/pr-communications`
* `/services/marketing-services/strategy-consulting`

On each page verify:

* Hero & 2-col intro (if provided)
* **Services & Capabilities + Expandable Bullets** work with keyboard
* Portfolio shows 6–9 items
* **Module Carousel** shows resources & case studies
* Pricing disclaimer visible when pricing present
* Packages tiles render
* Testimonials & FAQ expand
* Final CTA links work

---

If you want, I can draft a tiny **dev checker** that iterates the taxonomy, loads each page’s `ServiceTemplateData`, runs a few invariants (slug/path alignment, selector lengths, etc.), and prints a pass/fail table.
