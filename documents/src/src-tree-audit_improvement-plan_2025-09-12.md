Official Title: Source Tree Audit and Improvement Plan
Domain: Web Development, Project Architecture
File Name: src-tree-audit_improvement-plan_2025-09-12.md
Main Part: src-tree-audit
Qualifier: ImprovementPlan
Date: 2025-09-12
Spotlight Comments:

Identifies and resolves duplicate components and import cycles in /src tree.
Enforces clear dependency boundaries and search indexing via selectors.
Cross-references marketing-services-data-integration.md and canonical-hub-slugs.md.

Summary: The Source Tree Audit and Improvement Plan provides a comprehensive assessment of the /src directory structure for TBH Digital Solutions, focusing on eliminating duplicate components (e.g., FAQAccordion, Testimonials), enforcing a strict dependency graph, and centralizing adapters and types for consistency. It includes actionable steps to consolidate components, align search indexing with selectors, migrate mock data, and ensure canonical hub slugs are used across the project, with a detailed checklist for validating the Marketing Services hub.

---

awesome—here’s a crisp, no-nonsense audit + improvement plan for your entire `/src` tree. i’m calling out collisions, proposing a clean boundary map, and giving you a repeatable checklist you can run for each area so everything feels cohesive with your data-first architecture.

---

# executive summary (what to fix first)

1. **kill duplicate components**

   * You have two copies of **FAQAccordion** and **Testimonials**:

     * `src/components/sections/section-layouts/FAQAccordion/*` **and** `src/components/ui/organisms/FAQAccordion/*`
     * `src/components/sections/section-layouts/Testimonials/*` **and** `src/components/ui/organisms/Testimonials/*`
   * Pick **one canonical home** (recommend: `src/components/ui/organisms/*`) and:

     * move code there, delete duplicates
     * update all imports via a **barrel** `src/components/ui/organisms/index.ts`
     * add an ESLint rule to block imports from deprecated paths

2. **lock import directions to prevent cycles**

   * Enforce this dependency graph (down only):

     ```
     app pages → templates → sections/organisms → molecules/atoms → ui utils
                               ↑
                             adapters (within component folder or in /lib)

     pages → lib/services (taxonomy, urls, loaders) → src/data (selectors, catalogs)
     ```
   * Never import **components** or **templates** from `src/data` or `src/lib`.

3. **centralize adapters + types**

   * Each “section/organism” should expose:

     * `Component.tsx`
     * `adapters.ts` (maps page data → props)
     * `Component.types.ts`
   * You already do this in several places (e.g., `PricingSection`, `ProcessTimeline`). Apply uniformly.

4. **search needs to index via selectors**

   * `src/search/core/sources.*.ts` should read from **`src/data/selectors.ts`** and **`taxonomy/servicesTree.ts`**, not raw files. That prevents drift.

5. **mock → data migration plan** (keep it short & safe)

   * Move `src/mock/*` into the closest equivalent under `src/data/page/*` or `src/data/<domain>/*`.
   * Gate old mocks behind a `// @deprecated` barrel and add ESLint ban on new imports.

---

# global rules (project-wide)

* **Canonical L0 hub slugs (everywhere):**
  `/web-development-services`, `/video-production-services`, `/seo-services`, `/marketing-services`, `/lead-generation-services`, `/content-production-services`.

* **Single source of truth** for catalogs: `/src/data/{portfolio|packages|testimonials|caseStudies|modules}` with tag-based selectors in `src/data/selectors.ts`.

* **Page-level data owns the final output:**
  `src/data/page/services-pages/<hub>/<service>/index.ts` composes selectors + `_shared` JSON overrides and feeds templates.

* **No circular deps:** data ⟶ lib OK; lib ⟶ data **not OK**; components never import from data.

---

# directory-by-directory assessment & actions

## 1) `/src/templates`

**Purpose:** page shells that wire blocks together.
**Status:** Good foundation. `ServicePage/ServiceTemplate.tsx` is present (and aligned with your adapter pattern).

**Actions**

* Keep templates **pure** (no direct data reads). Props only.
* Co-locate `README.md` (you already do).
* Add minimal **prop zod** in `src/lib/schemas/servicesPage.zod.ts` (exists) and validate in pages.

**Checklist**

* [ ] `ServiceTemplate` imports only **presentational** components + their adapters.
* [ ] No imports from `src/data` or `src/search`.
* [ ] Types imported from `src/types/servicesTemplate.types.ts`.

---

## 2) `/src/components`

You’ve got three systems here: **ui (atoms/molecules/organisms)**, **sections**, and **main-pages**.

### collisions

* **FAQAccordion** (two locations)
* **Testimonials** (two locations)

**Decision:** Canonicalize all global reusable blocks under `src/components/ui/organisms/*`.
`sections/section-layouts/*` should become thin wrappers (layout only) that **import the organism** and arrange it.

**Actions**

* [ ] Move/merge `FAQAccordion` + `Testimonials` to `ui/organisms`.
* [ ] In `sections/section-layouts/*`, keep only grid/spacing wrappers (or delete if redundant).
* [ ] Every organism exposes:

  * `Component.tsx`
  * `Component.module.css`
  * `Component.types.ts`
  * `adapters.ts`
  * `index.ts` (barrel)
* [ ] Add `src/components/ui/organisms/index.ts` exporting everything.
* [ ] Update all import paths (search & replace).
* [ ] Add ESLint rule: `no-restricted-imports` to block old paths.

**Styling**

* You’re mixing `.css` and `.module.css`. Prefer **CSS Modules** for all component-scoped styles. Keep global tokens in `/src/styles`.

---

## 3) `/src/contexts` & `/src/providers`

**Purpose:** app-wide state & provider composition.
**Status:** Clean separation.

**Actions**

* [ ] Ensure **‘use client’** where contexts mount.
* [ ] Single export barrel (`/src/providers/index.ts`) already present—good.
* [ ] No provider should import from pages/templates/components. Keep leaf-only deps.

**Checklist**

* [ ] Context value types exported (no `any`).
* [ ] Providers wrap **app/layout.tsx** only.
* [ ] No business data (portfolio/testimonials) in context.

---

## 4) `/src/lib`

**Purpose:** pure utilities for services (taxonomy, URLs, pricing, loaders).
**Status:** Looks right, but watch overlap with `src/data/composers`.

**Boundary decision**

* **`lib/services/*`**: URL builders, taxonomy helpers, pricing adapters, low-level loaders.
* **`src/data/composers/*`**: compose page-level data shapes from selectors (domain knowledge).

**Actions**

* [ ] `lib/services/dataLoaders.ts` can read from `src/data/selectors.ts`, not raw files.
* [ ] `pricingAdapters.ts`: stay UI-agnostic; return normalized DTOs used by `PricingSection`.

**Checklist**

* [ ] No imports from **components** or **templates**.
* [ ] Allowed imports from `src/data/selectors.ts` + `src/data/taxonomy/servicesTree.ts`.
* [ ] Unit tests for URL and taxonomy helpers (edge slugs, aliasing).

---

## 5) `/src/data`

(You’ve got full documentation already—we’ll just connect it here.)

**Actions**

* [ ] Keep hub/service **tags** consistent across catalogs.
* [ ] Ensure each service page pulls from `selectors.ts`, then merges `_shared` JSON.
* [ ] `schema.ts` under `services-pages` validates authoring data.

**Checklist**

* [ ] All *marketing-services* service pages (digital-advertising, content-creative, martech-automation, analytics-optimization, pr-communications, strategy-consulting) export typed `ServiceTemplateData` and render.
* [ ] `selectors.ts` supports `{ hub, service, sub, featured, limit }` for portfolio/packages/testimonials/modules.
* [ ] `taxonomy/servicesTree.ts` includes **canonical L0** and all service slugs.

---

## 6) `/src/search`

**Purpose:** site-wide indexing/query UI.

**Critical alignment**

* `core/sources.services.ts`, `sources.packages.ts`, `sources.portfolio.ts` should pull from **`src/data/selectors.ts`** + `taxonomy`, not raw files or mocks.

**Actions**

* [ ] Replace direct imports with selector calls:

  ```ts
  import { selectPortfolio, selectPackages, selectTestimonials } from "@/data/selectors";
  import servicesTree from "@/data/taxonomy/servicesTree";
  ```
* [ ] Normalize documents (id, title, slug, excerpt, tags: \[hub, service]) before indexing.
* [ ] Add change detector for taxonomy: rebuild when `servicesTree.ts` changes.

**Checklist**

* [ ] No imports from **components**.
* [ ] Search UI (client) is entirely presentational and calls `searchService.ts`.

---

## 7) `/src/hooks`

**Status:** Good modularity, but there are `.js` barrels.

**Actions**

* [ ] Convert `index.js` → `index.ts` across hook groups.
* [ ] Ensure hooks never import from `src/data` (except analytics/reporting if needed).
* [ ] Co-locate simple helpers under components if they’re only used there.

---

## 8) `/src/styles`

**Status:** Global tokens + theme—good.

**Actions**

* [ ] Keep only design tokens, resets, layout primitives here.
* [ ] Everything else in CSS Modules beside components.

---

## 9) `/src/mock`

**Status:** Temporary source for main & legal pages.

**Migration plan (short, safe)**

1. Create `src/data/page/main-pages/*` and `src/data/page/legal-pages/*` (you already have).
2. Move each mock file into its closest page-data TS file and export typed data.
3. Mark `src/mock/*` as deprecated and ban new imports via ESLint.
4. Delete once routes resolve via new data.

---

# alignment with app router

**Pages**

* `app/services/[hub]/page.tsx`: loads hub node (taxonomy) + `src/data/page/services-pages/<hub>/index.ts` and renders **HubTemplate**.
* `app/services/[hub]/[service]/page.tsx`: loads service node + `.../<hub>/<service>/index.ts` and renders **ServiceTemplate**.

**Never** import catalogs directly in pages; always go through page-data (which itself uses selectors).

---

# quality gates (quick scripts)

* **Typecheck:** `npm run typecheck`
* **Lint:** `npm run lint`
* **Build:** `npm run build`
* **Dupes (unix):**

  ```bash
  rg --glob '!node_modules' 'FAQAccordion.tsx|Testimonials.tsx|ComparisonTable.tsx' -n
  ```
* **Cycle check:** add ESLint `import/no-cycle` and run `npm run lint`.
* **Forbidden imports:** ESLint `no-restricted-imports` to block:

  * `src/components/**` from importing `src/data/**`
  * `src/lib/**` from importing `src/components/**`

---

# concrete refactor PR (suggested diff)

1. **Consolidate FAQ & Testimonials**

   * Move `src/components/sections/section-layouts/FAQAccordion/*` → `src/components/ui/organisms/FAQAccordion/*` (merge adapters & validators)
   * Move `src/components/sections/section-layouts/Testimonials/*` → `src/components/ui/organisms/Testimonials/*`
   * Update all imports via `src/components/ui/organisms/index.ts`

2. **Sections become layout shells**

   * If `sections/section-layouts/*` only wraps with spacing, keep a tiny wrapper or remove in favor of direct organism usage inside templates.

3. **Search sources**

   * Update `src/search/core/sources.services.ts` to:

     ```ts
     const docs = selectServicesIndexables({ taxonomy: servicesTree }) // implement via selectors
     ```
   * Do the same for `packages` and `portfolio`.

4. **Adapters**

   * Ensure every organism has `adapters.ts` accepting `ServiceTemplateData` fragments:

     * Pricing, Modules, Portfolio, Testimonials, FAQ, Process, TechStack, etc.

5. **Lib/data boundary**

   * `lib/services/dataLoaders.ts` must call selectors; remove any direct file reads.

---

# final “green” checklist for marketing services (deep test)

* [ ] `/services/marketing-services` hub **renders** (HubTemplate) with testimonials from `selectors`.
* [ ] `/services/marketing-services/content-creative` **renders** (ServiceTemplate) pulling:

  * Portfolio (featured subset) via `selectPortfolio`
  * Packages (featured) via `selectPackages`
  * Testimonials (limit 3) via `selectTestimonials`
  * Modules via `selectModules`
  * Shared FAQs from `_shared/faqs.json` + page overrides
* [ ] No runtime console warnings for prop mismatches (adapters mapped).
* [ ] Search returns content-creative results (services + portfolio + packages).
* [ ] ESLint: no cycles, no restricted imports.
* [ ] Build passes with tree-shaken, duplicate-free components.

---

if you want, i can spit out the actual **ESLint config snippets** for the restricted imports & cycle rules, plus a small codemod to rewrite the duplicate component import paths.
