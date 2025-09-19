Official Title: Marketing Services Hub Production QA Guide

Domain: Services, Web Development, Quality Assurance

File Name: marketing-services-qa_guide_2025-09-12.md

Main Part: marketing-services-qa

Qualifier: Guide

Date: 2025-09-12

Spotlight Comments:
- Step-by-step QA process for validating Marketing Services hub and L2 pages.
- Covers taxonomy, middleware, data, templates, and component rendering.
- Cross-references services-taxonomy-simplification.md and services-page-blueprint.md.

Summary: The Marketing Services Hub Production QA Guide provides a detailed, step-by-step process for validating the Marketing Services hub (`/services/marketing-services`) and its L2 service pages, ensuring correct taxonomy, routing, data loading, template rendering, and component functionality. It includes checks for middleware redirects, data file integrity, type alignment, accessibility, and rendering of key components like `ServicesAndCapabilitiesExpandable` and `ModuleCarousel`, with specific guidance to avoid common pitfalls like redirect loops or missing case studies.

---

Awesome—here’s a **step-by-step, production QA guide** to validate that the Marketing Services hub and all service pages render cleanly, import the right data, and pass the correct types through your components and templates.

I’ve organized this into **what to check**, **where to check it**, and **how to verify it**—from `data/` → loaders/selectors (`lib/`) → templates → organisms → page routes → middleware. The focus hub for testing is **`marketing-services`** and its L2 pages.

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
---

# 2) Taxonomy & routing integrity

These guarantee your `app/services/[hub]/[service]` routes exist and match the data.

### Files to check

* `src/data/taxonomy/servicesTree.ts`  ← authoritative services tree

  * Hub: `marketing-services`
  * L2 Services (slugs must be **exact**):

    * `digital-advertising`
    * `content-creative`
    * `martech-automation`
    * `analytics-optimization`
    * `pr-communications`
    * `strategy-consulting`
* `src/lib/services/taxonomy.ts`
* `src/lib/services/taxonomyHelpers.ts`
* `src/lib/services/serviceUrls.ts`
* `src/lib/services/dataLoaders.ts`

### What to validate

* Each node has:

  * `kind` (`hub` | `service` | `subservice`)
  * `id`, `slug`, `path`, `title`, and **minimal** `hero`
  * Correct **parentId** on services
* `path` must match page folder convention:

  * `/services/marketing-services/<service-slug>`
* `dataLoaders.ts` exposes:

  * `getNodeByParams({ hub, service })`
  * `loadServicePageData(node)` that imports the correct `index.ts` (see §4)
* `serviceUrls.ts` helpers produce the same URLs you stored in `path`.

### How to verify

* Run a quick unit/smoke in dev console:

  ```ts
  // pseudo: run from a scratch TS/JS script or console
  import { findServiceByPath } from "@/lib/services/taxonomy";
  console.log(findServiceByPath("/services/marketing-services/content-creative"));
  // Expect a ServiceNode with slug "content-creative"
  ```
* Hit routes in the browser:

  * `/services/marketing-services`
  * `/services/marketing-services/content-creative`
  * etc.

---

# 3) Middleware (redirects & aliases)

Ensures a user landing on `/marketing-services/*` or legacy `/services/marketing/*` ends up at the correct canonical **`/services/marketing-services/*`** (or vice-versa, depending on your latest canonical policy).

### Files to check

* `middleware.ts` (you already updated it to **stop** rewriting `/services/marketing-services` → `/services/marketing`)

### What to validate

* `CANONICAL_HUBS` contains **exactly** the six canonical hub slugs you intend to serve under `/services/{hub}` (and that they match the **tree**):

  * `web-development`
  * `video-production`
  * `seo-services`
  * `marketing-services` ← **ensure this is not “marketing”**
  * `lead-generation`
  * `content-production`
* `HUB_ALIAS_TO_CANONICAL` maps common aliases to the above.
* `matcher` array includes the six `/*-services` entry points for root-level redirects.

### How to verify

* Manually hit:

  * `/marketing-services` → expect `301` to `/services/marketing-services`
  * `/services/marketing` → expect `301` to `/services/marketing-services` (if you pinned it this way)
  * Confirm **no** redirect loop for `/services/marketing-services`.

---

# 4) Page data files (Marketing hub)

These power the `ServiceTemplate`.

### Files to check

```
src/data/page/services-pages/marketing-services/
├── _shared/
│   ├── faqs.json
│   ├── portfolio.json
│   └── testimonials.json
├── analytics-optimization/index.ts
├── content-creative/index.ts
├── digital-advertising/index.ts
├── martech-automation/index.ts
├── pr-communications/index.ts
├── strategy-consulting/index.ts
└── index.ts               // (optional: hub-level page data)
```

### What to validate

Each L2 `index.ts` must export **`ServiceTemplateData`** with:

* `kind: "service"`
* `slug` equals folder name (e.g. `"content-creative"`)
* `path`: `/services/marketing-services/<slug>`
* `title`: human readable name
* **Sections** used by `ServiceTemplate`:

  * `hero` (simplified `ServiceHeroData`)
  * *Optionally* `twoColVideo`
  * `servicesAndCapabilitiesExpandable` **(new combined component)**
  * `portfolio` **(visual examples)**
  * `modules` **(Resources & Case Studies)**
  * `pricing` / `comparison` (if used)
  * `packages` (if present)
  * `testimonials`
  * `faq`
  * `cta`
  * `seo` (page title/desc/canonical)

If you’re using **selectors**: make sure your calls pass the correct **tags** (see §6).

### How to verify

* Open each `index.ts` and confirm prop names match `ServiceTemplateData` (see §7 types).
* In the browser, visit every L2 page and confirm:

  * Hero renders, no console prop/type warnings.
  * Services & Capabilities + Expandable Bullets show.
  * Portfolio grid renders (or video portfolio, if configured).
  * Module Carousel shows and clearly says **“Resources & Case Studies”**.
  * Pricing/Packages compare (if configured).
  * Testimonials & FAQ render when data present.

---

# 5) The dynamic route & template

The dynamic route uses your loaders & templates to render.

### Files to check

* `app/services/[hub]/[service]/page.tsx`
  Must:

  * Use `generateStaticParams` from taxonomy for **all** (hub, service) pairs
  * Pull the node via your loader
  * Import `ServiceTemplateData` for that node (dynamic import or direct)
  * Render `<ServiceTemplate node={node} data={data} />`
* `src/templates/ServicePage/ServiceTemplate.tsx`  ← **your refactored version**

### What to validate in `ServiceTemplate.tsx`

* It renders sections in this order:

  1. Breadcrumbs
  2. **ServiceHero**
  3. Two-column intro / video (optional)
  4. **ServicesAndCapabilitiesExpandable**
  5. Portfolio (StandardPortfolioGallery / VideoPortfolioClient / PortfolioDemoClient)
  6. **Module Carousel** (contains case studies)
  7. Pricing / ComparisonTable
  8. Packages & Add-Ons
  9. Testimonials
  10. FAQAccordion
  11. Final CTA

* It uses your **adapters** only where needed and **matches prop names** exposed by your organisms.

* It **does NOT** use the old `CaseStudyCarousel` for services—case studies live in **Module Carousel** now.

* Pricing disclaimer: ensure the copy **“Final pricing is set after a scope consultation.”** is present (PricingCallout or PricingSection props).

### How to verify

* Search for any import of `CaseStudyCarousel` inside `ServiceTemplate.tsx` and remove it if still present.
* Confirm you’re importing **`ServicesAndCapabilitiesExpandable`** and passing your `servicesAndCapabilitiesExpandable` data.

---

# 6) Selectors and canonical tag usage (feeds from central data)

Selectors are how each page pulls items from `src/data/*`.

### Files to check

* `src/data/selectors.ts`
* `src/data/portfolio/marketing-services/marketing-services-items.ts`
* `src/data/portfolio/marketing-services/marketing-services-featured.ts`
* `src/data/packages/marketing-services/marketing-packages.ts`
* `src/data/packages/marketing-services/marketing-featured.ts`
* `src/data/packages/marketing-services/marketing-addons.ts`
* `src/data/testimonials/marketing-services/marketing-services-testimonials.ts`
* (If case studies are stored centrally:) `src/data/caseStudies/marketing-services/marketing-services-cases.ts`

### What to validate

* **Tags**: Every item has tags like:

  * `["marketing-services"]` for hub.
  * `["marketing-services", "content-creative"]` for service-specific items.
* `selectPortfolio({ hub, service })`, `selectPackages`, `selectTestimonials`, `selectCaseStudies` return **expected sets** (featured vs all, limit working).
* `selectModules` pulls **resources rail** cards for a hub/service where applicable.

### How to verify

* Console test:

  ```ts
  import { selectPortfolio } from "@/data/selectors";
  console.log(selectPortfolio({ hub: "marketing-services", service: "content-creative", featured: true, limit: 9 }));
  ```
* Confirm the list length and IDs match your expectations on the page.

---

# 7) Types: everything must align

Types catch shape drift between data files, loaders, and components.

### Files to check

* `src/types/servicesTemplate.types.ts`

  * Contains **`ServiceTemplateData`** used by L2 pages.
  * Field names: `hero`, `twoColVideo`, `servicesAndCapabilitiesExpandable`, `portfolio`, `modules`, `pricing`, `packages`, `testimonials`, `faq`, `cta`, `seo`.
* `src/types/servicesTaxonomy.types.ts`

  * Updated union of **top-level** hubs.
  * `TaxonomyNode` shapes with `hero: ServiceHeroData`.
* `src/components/ui/organisms/ServicesAndCapabilitiesExpandable/types.ts`

  * `ServicesAndCapabilitiesExpandableProps`
  * `ExpandableItem`

### What to validate

* All **page data** files conform to **`ServiceTemplateData`** (TS will flag if not).
* The **template** consumes **exactly** those shapes.
* The **organisms/components** props match the pipelines in the template (e.g., `ServicesAndCapabilitiesExpandable` gets the combined props, not old `ServicesAndCapabilities` props).

---

# 8) Organisms & parts (props & a11y)

Focus on the new combined module and portfolio variations.

### Files to check (new combined module)

* `src/components/ui/organisms/ServicesAndCapabilitiesExpandable/`

  * `ServicesAndCapabilitiesExpandable.tsx`
  * `parts/PillarsGrid.tsx`
  * `parts/InlineBullets.tsx`
  * `parts/ExpandableBullets.tsx`
  * `parts/ExpandableBulletItem.tsx`
  * `hooks/useAccordionState.ts`
  * `hooks/useAnalytics.ts`
  * `utils/keyboard.ts`
  * `utils/a11y.ts`
  * `types.ts`, `adapters.ts`, CSS modules

**Validate**:

* Expand/collapse works with **keyboard** (Space/Enter), proper `aria-controls`, `aria-expanded`, `id` linkage.
* `defaultOpen` opens N rows initially and state is controllable/uncontrolled.
* Analytics hook is **no-op safe** in environments without analytics.

### Files to check (portfolio variants)

* `src/components/portfolio/StandardPortfolioGallery.tsx`
* `src/components/ui/organisms/VideoPortfolioGallery/*`
* `src/components/ui/organisms/PortfolioDemo/*` (if used)

**Validate**:

* Items passed match the component’s expected shape (title, media URL, tags, etc.).
* Modal opens, keyboard traps (if present) work.

---

# 9) Pricing & Packages integration

If you use pricing, confirm the routing adapter and disclaimer.

### Files to check

* `src/lib/services/pricingAdapters.ts`
* `src/lib/pricing/*`
* `src/components/ui/organisms/PricingSection/*`
* `src/components/ui/organisms/ComparisonTable/*`
* `src/lib/packages/mapFeaturedPackages.ts`
* `src/data/packages/marketing-services/*`

**Validate**:

* Adapter function for **Level 2** maps your `ServiceTemplateData.pricing` to `PricingSection` props.
* **Disclaimer** text present:
  “*Final pricing is set after a scope consultation.*”
* Packages render with correct grouping (featured vs add-ons) and correct **currency**.

---

# 10) Hub directory (services landing) data and page

You updated the directory page JSON to use `*-services` paths.

### Files to check

* `app/services/page.data.json` (or `app/services/page.tsx` consumer)
* Ensure each tile `href` points to:

  * `/services/web-development-services`
  * `/services/video-production-services`
  * `/services/seo-services`
  * `/services/marketing-services`
  * `/services/lead-generation-services`
  * `/services/content-production-services`

**Validate**:

* Clicking the **Marketing Services** card goes to `/services/marketing-services` and **stays** (no redirect to `/services/marketing`).

---

# 11) Data composers (if used)

If you’re composing page data at runtime/server from pieces:

### Files to check

* `src/data/composers/`

  * `hubComposer.ts`
  * `serviceComposer.ts`
  * `subServiceComposer.ts`
  * `index.ts`

**Validate**:

* Marketing hub + services resolve to composed `ServiceTemplateData` in the shape the template expects.
* Composers attach selectors output (portfolio, packages, testimonials) only when present.
* No circular imports (common cause of build borks).

---

# 12) Manual QA matrix (what to click)

For each Marketing service:

* `/services/marketing-services/digital-advertising`
* `/services/marketing-services/content-creative`
* `/services/marketing-services/martech-automation`
* `/services/marketing-services/analytics-optimization`
* `/services/marketing-services/pr-communications`
* `/services/marketing-services/strategy-consulting`

**On each page, verify:**

1. **Hero** renders eyebrow/title/subtitle + CTAs
2. **Search Banner** (if present globally) works (search from results)
3. **TwoColumn / Video** visible (if provided)
4. **Services & Capabilities + Expandable Bullets** expands, keyboard friendly
5. **Portfolio** shows 6–9 items (or video grid), modal works
6. **Module Carousel** shows resources; **case studies appear here**
7. **Pricing** disclaimer line is present if pricing is included
8. **Packages & Add-Ons** render expected tiles
9. **Testimonials** load (2–3 items ok)
10. **FAQ** questions expand; search & category filter (if enabled)
11. **Final CTA** renders with correct links

Open DevTools console—**no prop warnings** or 404 assets.

---

# 13) Common pitfalls & quick fixes

* **Redirect loop** at `/services/marketing-services`
  Fix: ensure `CANONICAL_HUBS` contains `"marketing-services"` and **no alias rule** maps it back to `"marketing"`.

* **Build error: duplicate `rootId`**
  You fixed this by **removing duplicate block** in `servicesTree.ts`. Keep only **one** definition.

* **Selectors return empty**
  Probably **tags mismatch**. Confirm items carry `["marketing-services","<service-slug>"]`.

* **Case studies not showing**
  They now belong to **Module Carousel**. Remove any `CaseStudyCarousel` import in the service template.

* **Type errors for `servicesAndCapabilitiesExpandable`**
  Ensure pages use the **new combined prop name** and shape. The old `ServicesAndCapabilities` props won’t match.

* **Comparison table blank**
  Confirm `data.pricing.comparison.rows` exists before rendering `ComparisonTable`.

---

# 14) Optional safety: add tiny runtime validators (dev-only)

Drop a lightweight assertion util (dev only) to catch missing fields early:

```ts
// src/lib/utils/invariant.ts
export function invariant(cond: any, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}
```

Use in loaders/templates (guarded by `process.env.NODE_ENV === "development"`):

```ts
import { invariant } from "@/lib/utils/invariant";

if (process.env.NODE_ENV === "development") {
  invariant(data.kind === "service", "Service page data must have kind='service'");
  invariant(data.slug && data.path, "Service page data requires slug and path");
}
```

---

## TL;DR checklist

* ✅ `servicesTree.ts` includes **marketing-services** hub and six L2 slugs
* ✅ `middleware.ts` **does not** rewrite `/services/marketing-services` to `/services/marketing`
* ✅ Each L2 `index.ts` exports **`ServiceTemplateData`** with correct slug/path
* ✅ `ServiceTemplate.tsx` uses **ServicesAndCapabilitiesExpandable** and not `CaseStudyCarousel`
* ✅ Portfolio/Packages/Testimonials selectors return items (check tags)
* ✅ Types line up across `servicesTemplate.types.ts`, `servicesTaxonomy.types.ts`, and organisms’ `types.ts`
* ✅ Keyboard/a11y for expandable bullets verified
* ✅ Pricing disclaimer present if pricing is shown
* ✅ All pages load with **no console warnings** and all links work

If you want, I can generate a tiny **dev script** that iterates the taxonomy, loads every service page data file, runs a few invariants, and prints a pass/fail matrix.
