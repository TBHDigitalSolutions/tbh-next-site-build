Official Title: Services Taxonomy and Middleware Owner’s Manual

Domain: Services, Web Development

File Name: services-taxonomy-middleware_manual_2025-09-12.md

Main Part: services-taxonomy-middleware

Qualifier: Manual

Date: 2025-09-12

Spotlight Comments:
- Defines ownership, imports, exports, and dependencies for taxonomy and middleware scripts.
- Ensures single-source-of-truth taxonomy and lean middleware with clear guardrails.
- Cross-references services-taxonomy-simplification.md for implementation context.

Summary: The Services Taxonomy and Middleware Owner’s Manual provides a clear, concise guide for managing the service taxonomy and middleware scripts at TBH Digital Solutions. It details the purpose, imports, exports, dependencies, and guardrails for key files like `servicesTree.ts` (single-source-of-truth taxonomy), `taxonomy.ts` (helpers), `taxonomyHelpers.ts` (validation), `serviceUrls.ts` (URL composers), `pricingAdapters.ts`, `dataLoaders.ts`, and `middleware.ts`, ensuring no overlap, minimal dependencies, and alignment with the service page architecture.

---
you got it — here’s a tight, no-ambiguity “owner’s manual” for each script. for every file I list: what it owns, what it imports, what it exports, what depends on it, and guardrails so things don’t overlap.

---

# src/data/taxonomy/servicesTree.ts **(SSOT)**

**Purpose (owns):**
Single Source of Truth for the services information architecture (hubs → services → subservices). Pure data (no React, no Next).

**Imports:**

* `src/types/servicesTaxonomy.types.ts` for node shapes.

**Exports:**

* `servicesTree` (the entire tree object).

**Depends on:**

* Only the shared types.

**Used by:**

* `src/lib/services/taxonomy.ts` (flatten/lookup helpers)
* `src/lib/services/taxonomyHelpers.ts` (validators)
* Search indexers, selectors, static params builders, etc.

**Guardrails:**

* This file must never import from `lib/` or components.
* Hub slugs here are canonical (`*-services`) and must match middleware expectations.
* All other files read from this — none write back or clone a competing tree.

---

# src/lib/services/taxonomy.ts **(helpers over the SSOT)**

**Purpose (owns):**
Read-only helper functions that *use* the SSOT to provide lookups and flatteners for routing, static params, search, etc.

**Imports:**

* `servicesTree` from `src/data/taxonomy/servicesTree.ts`
* Types from `src/types/servicesTaxonomy.types.ts`

**Exports (example shape):**

* `getHubs()`, `getServices(hub)`, `getSubservices(hub, service)`
* `findNodeByPath(path)`, `findHub(slug)`, `findService(hub, slug)`
* `flattenForStaticParams()` → `{ hubs, services, subs }`

**Depends on:**

* SSOT + types only.

**Used by:**

* App Router pages’ `generateStaticParams()`
* Selectors/loaders that need validated paths
* Search/source builders

**Guardrails:**

* **Must not** declare its own tree. Always import the SSOT.
* Stay framework-agnostic (no `next/*`, no React).
* Keep output strictly typed.

---

# src/lib/services/taxonomyHelpers.ts **(validation & invariants)**

**Purpose (owns):**
Quality gates around the taxonomy (dev/build-time assertions), plus tiny utilities that check invariants.

**Imports:**

* `servicesTree` (SSOT)
* Types from `src/types/servicesTaxonomy.types.ts`

**Exports (example):**

* `assertTaxonomyInvariants(tree)` (checks “hubs end with -services”, “no reserved slugs like ‘packages’”, duplicates, etc.)
* Optional `isCanonicalHubSlug(slug)`

**Depends on:**

* SSOT + types only.

**Used by:**

* Invoked on module load in dev/build to fail fast.
* Unit tests.

**Guardrails:**

* **No** route logic here, just assertions/utilities.
* Never export data; only functions.

---

# src/lib/services/serviceUrls.ts **(URL composers)**

**Purpose (owns):**
Central place to construct canonical service URLs. Prevents scattered string templates.

**Imports:**

* None (keep it zero-dep).

**Exports:**

* `serviceUrls.hub(hub)` → `/services/${hub}`
* `serviceUrls.service(hub, service)`
* `serviceUrls.sub(hub, service, sub)`

**Depends on:**

* Nothing.

**Used by:**

* Components, templates, link builders, sitemap, search cards.

**Guardrails:**

* Only pure string builders; no reading taxonomy or filesystem.
* If you ever need validation, do it one layer up (taxonomy helpers), not here.

---

# src/lib/services/pricingAdapters.ts **(view adapters over pricing data)**

**Purpose (owns):**
Transforms raw package/pricing data into UI-friendly shapes for components (e.g., `PricingSection`, `PackageCarousel`).

**Imports:**

* Types from packages domain (`src/data/packages/_types/*`)
* Currency/format helpers from `src/lib/pricing/*` (if needed)

**Exports (examples):**

* `toPricingTiers(packages)`, `toFeaturedPackages(featured, addons)`
* `normalizeCurrency(amount, currency)`

**Depends on:**

* Data types + pricing utils.

**Used by:**

* Pages/templates that show pricing, and by components’ adapters.

**Guardrails:**

* No fetching or filesystem reads; receives data, returns adapted data.
* Do not import `servicesTree` — keep pricing independent of taxonomy.

---

# src/lib/services/dataLoaders.ts **(page-level data assembly)**

**Purpose (owns):**
Composes all data a Service page needs **at the page level** (hero, modules, selectors: portfolio/testimonials/packages, etc.). Think of it as your “orchestrator”.

**Imports:**

* SSOT helpers (`src/lib/services/taxonomy.ts`) to validate `{ hub, service, sub }`.
* Domain selectors (`src/data/selectors.ts`) or direct data files (`src/data/page/services-pages/...`).
* Pricing adapters (`pricingAdapters.ts`) as needed.
* Types from `src/types/servicesTemplate.types.ts` for the return shape.

**Exports (examples):**

* `loadServicePageData({ hub, service, sub? }): Promise<ServiceTemplateData>`
* Smaller helpers like `loadSharedMarketingData(hub)`.

**Depends on:**

* Taxonomy helpers, selectors, adapters, types.

**Used by:**

* `app/services/[hub]/[service]/page.tsx` (and `[sub]`).

**Guardrails:**

* This is where cross-domain joins happen (but still pure — no React).
* Validate inputs against taxonomy before reading data.
* Return exactly the Template type expected by `ServiceTemplate.tsx`.

---

# src/types/servicesTaxonomy.types.ts **(taxonomy model types)**

**Purpose (owns):**
Type definitions for taxonomy nodes (HubNode, ServiceNode, SubServiceNode, etc.) and utility discriminated unions.

**Imports:**

* None (type-only).

**Exports:**

* `HubNode`, `ServiceNode`, `SubServiceNode`, `AnyServiceNode`

**Depends on:**

* Nothing.

**Used by:**

* SSOT + lib helpers + any code that manipulates the tree.

**Guardrails:**

* Keep it strictly about taxonomy shapes; no UI/template types here.

---

# src/types/servicesTemplate.types.ts **(page/template data contract)**

**Purpose (owns):**
Type contract for data consumed by `src/templates/ServicePage/ServiceTemplate.tsx`.

**Imports:**

* Potentially some shared primitive types (e.g., `CTA`, `FAQItem`) if you have them in a common types module.

**Exports:**

* `ServiceTemplateData` (hero, sections, packages, testimonials, portfolio, FAQs, two-col video, etc.)
* Any nested types used by Service Template.

**Depends on:**

* Nothing outside types.

**Used by:**

* `dataLoaders.ts` (to build the object)
* `ServiceTemplate.tsx` (to consume the object)

**Guardrails:**

* This is the canonical shape the page promises to pass to the template.
* Avoid leaking domain-specific raw shapes here — keep them adapted for the template.

---

# middleware.ts **(routing hygiene at the edge)**

**Purpose (owns):**
Edge redirects/rewrites and normalization for **services** URLs, enforcing canonical hubs and lifting `/{hub}-services` → `/services/{hub}-services`.

**Imports:**

* None (or a small generated `CANONICAL_HUBS` set). Avoid importing large modules or the SSOT.

**Exports:**

* Default edge middleware function; `config.matcher`.

**Depends on:**

* Only a small, static list of canonical hubs (hardcoded or generated).

**Used by:**

* Next runtime (edge).

**Guardrails:**

* Keep it tiny; never import `src/data/taxonomy/servicesTree.ts` directly (bundle size & coupling).
* **No** legacy redirects (fresh build). Avoid alias loops (no canonical ↔ alias round-trips).

---

## duplicates you listed

You repeated the `src/types/*` entries — there should be only one copy of each of:

* `src/types/servicesTaxonomy.types.ts`
* `src/types/servicesTemplate.types.ts`

If you see duplicates on disk, delete the extras to avoid import ambiguity.

---

## dependency boundaries (at a glance)

* **data (SSOT) → lib (helpers, loaders) → app (pages/templates/components)**

  * `servicesTree` (data) **does not** import from lib/app.
  * `taxonomy.ts`/`taxonomyHelpers.ts` (lib) **import** the SSOT and **export** pure functions.
  * `dataLoaders.ts` (lib) **imports** helpers + selectors and **returns** `ServiceTemplateData`.
  * **Templates/components** do not read files directly; they receive the typed object from the page.

---

## sanity checklist per page

1. In `app/services/.../page.tsx`:

   * Validate route params (implicitly via loaders).
   * `const data = await loadServicePageData({ hub, service, sub })`
   * `return <ServiceTemplate data={data} />`

2. In `dataLoaders.ts`:

   * Use `findService()` / `findSubservice()` before loading any data.
   * Pull domain data with selectors; adapt to `ServiceTemplateData`.
   * Keep all cross-domain joins here (not in the template).

3. In `ServiceTemplate.tsx`:

   * Consume `ServiceTemplateData` only (no file reads).
   * Props strictly typed.

4. In middleware:

   * Enforce hub canonicalization only (no business logic).

Follow this, and nothing will cross wires or surprise you later.
