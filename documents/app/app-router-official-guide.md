got it—here’s the **official app router guide** for your project. it documents what belongs in `/app`, how routes are organized, how pages obtain data, and how to keep everything aligned with your data-first architecture.

---

# app router: purpose & boundaries

**goal:** `/app` declares URL structure and renders server components that receive **already-composed page data**.
**do not** put domain logic, raw catalogs, or composition code here.

**/app may contain**

* route segments (`page.tsx`, `layout.tsx`, optional `loading.tsx`, `error.tsx`)
* thin page controllers that:

  * read route params
  * request **page-level data** from `src/data/page/**` (or from `src/data/selectors.ts` if a page has no authored page-data yet)
  * pass typed props into **templates** (from `src/templates/**`) and **presentational components**
* segment config (`generateStaticParams`, `generateMetadata`, `revalidate`, `dynamic`, `runtime`)

**/app must not contain**

* raw domain catalogs (portfolio, packages, testimonials, etc.)
* composition logic (that belongs to `src/data/page/**` or `src/data/composers/**`)
* taxonomy/URL helpers (live in `src/lib/services/**`)
* mock data (will be migrated to `src/data/page/**`)

---

# routing conventions

## canonical top-level hubs (L0)

Use these **everywhere** (paths, imports, data tags, selectors, taxonomy, middleware):

```
/web-development-services
/video-production-services
/seo-services
/marketing-services
/lead-generation-services
/content-production-services
```

> Your middleware already aliases legacy forms (e.g. `/marketing-services` → canonical). Keep it that way.

## route map (current)

```
/app
  /page.tsx                         → homepage
  /layout.tsx                       → global layout/providers

  /book/page.tsx                    → booking page

  /legal/*                          → legal routes (privacy, terms, etc.)
    /privacy-policy/page.tsx        → uses page.data.json (local)
    /terms-conditions/page.tsx
    /terms-services/page.tsx

  /main/*                           → marketing site main pages
    /about/page.tsx
    /contact/page.tsx
    /products-services/page.tsx

  /packages
    /page.tsx                       → packages hub
    /[bundles]/page.tsx             → bundle detail pages

  /portfolio
    /page.tsx                       → portfolio hub
    /[category]/page.tsx            → category listing

  /services
    /page.tsx                       → services directory (uses /app/services/page.data.json)
    /[hub]
      /page.tsx                     → hub landing (e.g., /services/marketing-services)
      /[service]
        /page.tsx                   → service landing (e.g., /services/marketing-services/content-creative)
        /packages/page.tsx          → service-specific packages view
        /[sub]/page.tsx             → optional sub-service
```

---

# page responsibilities (thin controllers)

Every `page.tsx` should:

1. **Read params** from the segment.
2. **Resolve taxonomy** (via `src/lib/services/taxonomy.ts`) to validate the hub/service/sub.
3. **Load page data** from `src/data/page/**` (preferred) or the `selectors` fallback if page-data is not authored yet.
4. **Render the right template** with **typed props**.

**Do not**:

* call components that fetch their own data (no hidden data access).
* import raw catalogs directly (e.g., `src/data/portfolio/...`). Always go through page-data or `selectors`.

---

# data flow (authoritative model)

```
URL params
   ↓
/app/*/page.tsx  (controller)
   ↓                                      (strict boundary)
src/lib/services/{taxonomy,serviceUrls}   → slugs & URLs
   ↓
src/data/page/services-pages/<hub>/<service>/index.ts
   ├─ imports shared JSON overrides from _shared/
   ├─ calls selectors.ts for portfolio/packages/testimonials/modules
   └─ returns typed ServiceTemplateData
   ↓
src/templates/ServicePage/ServiceTemplate.tsx
   ↓
presentational components (+ their adapters & types)
```

* **page-data files** are the single place where composition happens (merging shared JSON, selectors, and literals).
* **templates** are dumb renderers. No IO.

---

# how to implement each route type

## 1) services directory `/services`

* **File:** `/app/services/page.tsx`
* **Data:** `/app/services/page.data.json` (local, simple listing) or move into `src/data/page/main-pages/services/index.ts` when you’re ready.
* **Render:** a directory/overview component (no selectors here unless you need featured pulls).

## 2) hub landing `/services/[hub]`

* **File:** `/app/services/[hub]/page.tsx`
* **Data:** `src/data/page/services-pages/<hub>/index.ts`
* **Steps:**

  * validate `hub` via taxonomy
  * import `<hub>/index.ts` exported data (`HubTemplateData` or a ServiceTemplate-compatible superset)
  * render `src/templates/HubPage/HubTemplate.tsx`

**Static params**

```ts
export async function generateStaticParams() {
  return getAllHubs().map(hub => ({ hub })); // from lib/services/taxonomyHelpers
}
```

## 3) service landing `/services/[hub]/[service]`

* **File:** `/app/services/[hub]/[service]/page.tsx`
* **Data:** `src/data/page/services-pages/<hub>/<service>/index.ts`
* **Steps:**

  * validate `hub` + `service`
  * `const data = await import("@/data/page/services-pages/marketing-services/content-creative").then(m => m.default)`
  * render `src/templates/ServicePage/ServiceTemplate.tsx` with typed `ServiceTemplateData`

**Static params**

```ts
export async function generateStaticParams() {
  return getAllServices().map(({ hub, service }) => ({ hub, service }));
}
```

## 4) sub-service `/services/[hub]/[service]/[sub]`

* **Only create** if you truly have a third level.
* **Data:** either:

  * a `sub` page-data file alongside the service folder, or
  * a variant from the service `index.ts` keyed by `sub`.

---

# metadata & SEO

* Use the page-data file to declare **title/description/canonical** (or derive via `serviceUrls.ts`).
* Implement `generateMetadata` in the page controller so it stays **co-located with the route** but still **reads from page-data**.

```ts
export async function generateMetadata({ params }) {
  const data = await loadServicePageData(params); // from page-data
  return {
    title: data.seo?.title ?? `${data.hero.title} | TBH Digital`,
    description: data.seo?.description,
    alternates: { canonical: data.seo?.canonical ?? serviceToCanonicalUrl(params) },
    openGraph: data.seo?.og,
  };
}
```

---

# caching, ISR, and runtime

* All page-data and catalogs are local TS/JSON → **use static generation**.
* Prefer:

  ```ts
  export const dynamic = "error";      // forbid runtime dynamic
  export const revalidate = false;     // or a number if you later fetch remote content
  ```
* If you add remote fetches, use `revalidate` per route.

---

# error, loading, and 404

* Each segment can declare:

  * `loading.tsx` for skeletons (only if you fetch remotely—otherwise skip)
  * `error.tsx` for recoverable rendering issues
  * `not-found.tsx` to customize 404 for unknown hub/service (also throw `notFound()` when taxonomy fails)

---

# file placement rules

**page controllers (`page.tsx`)**

* import **only**:

  * `src/templates/**`
  * `src/lib/services/**` (taxonomy, URLs)
  * `src/data/page/**` (composed page data)
* avoid importing individual components; let the **template** decide composition.

**layouts (`layout.tsx`)**

* global shells, providers from `/src/providers/**`
* no domain data reads

**css**

* route-specific styles → `*.module.css` co-located with the route only if it’s purely layout chrome.
* prefer component-scoped CSS in their own folders.

**json in `/app`**

* allowed for **simple** per-route metadata (e.g., legal pages).
* long-term, migrate these into `src/data/page/legal-pages/**` for parity.

---

# taxonomy & static params: single source of truth

* `src/data/taxonomy/servicesTree.ts` drives:

  * `generateStaticParams` for hubs/services/subs
  * the middleware canonicalization (kept in sync)
  * selectors scoping (e.g., filtering portfolio by `{ hub, service }`)

**do not** hardcode lists of hubs/services inside `/app` pages.

---

# services: happy path examples

### `/app/services/[hub]/[service]/page.tsx`

```ts
import { notFound } from "next/navigation";
import { resolveServiceNode } from "@/lib/services/taxonomyHelpers";
import { serviceToCanonicalUrl } from "@/lib/services/serviceUrls";
import ServiceTemplate from "@/templates/ServicePage/ServiceTemplate";

export const dynamic = "error";
export const revalidate = false;

export default async function Page({ params }: { params: { hub: string; service: string } }) {
  const node = resolveServiceNode(params.hub, params.service);
  if (!node) return notFound();

  const data = (await import(`@/data/page/services-pages/${params.hub}/${params.service}`)).default;
  return <ServiceTemplate {...data} />;
}

export async function generateStaticParams() {
  const all = await import("@/lib/services/taxonomyHelpers").then(m => m.getAllServices());
  return all.map(({ hub, service }) => ({ hub, service }));
}

export async function generateMetadata({ params }) {
  const node = resolveServiceNode(params.hub, params.service);
  if (!node) return {};
  const data = (await import(`@/data/page/services-pages/${params.hub}/${params.service}`)).default;
  return {
    title: data.seo?.title ?? node.label,
    description: data.seo?.description,
    alternates: { canonical: serviceToCanonicalUrl(params) },
  };
}
```

### `/app/services/[hub]/page.tsx` (hub)

```ts
import HubTemplate from "@/templates/HubPage/HubTemplate";
import { resolveHubNode } from "@/lib/services/taxonomyHelpers";
import { notFound } from "next/navigation";

export const dynamic = "error";
export const revalidate = false;

export default async function Page({ params }: { params: { hub: string } }) {
  const hub = resolveHubNode(params.hub);
  if (!hub) return notFound();

  const data = (await import(`@/data/page/services-pages/${params.hub}`)).default;
  return <HubTemplate {...data} />;
}
```

---

# maintenance rules

* **Add a new service**

  1. Update `src/data/taxonomy/servicesTree.ts` with the service node.
  2. Create page-data file at `src/data/page/services-pages/<hub>/<service>/index.ts` that exports `ServiceTemplateData`.
  3. Ensure selectors return data for this `{ hub, service }` (portfolio/tasks/testimonials/packages).
  4. No changes required in `/app` besides the new page-data—the route builds statically from taxonomy.

* **Rename hubs/services**

  * Update taxonomy and middleware alias map.
  * Provide legacy redirects in `LEGACY_REDIRECTS`.
  * Rename `src/data/page/services-pages/<hub>/<service>` and update references inside.

* **Legal / main pages**

  * Keep simple `page.data.json` while migrating to `src/data/page/main-pages/**` for consistency.
  * Page controllers read from the corresponding data file and pass to a simple template.

---

# what to change (now)

1. **Move `/app/legal/*/page.data.json`** to `src/data/page/legal-pages/*/page-data.ts` (to mirror the rest).

   * Update `page.tsx` to import from the new location.
2. **Ensure all `/services` pages** import from `src/data/page/services-pages/**` (not from selectors directly, unless that page’s page-data doesn’t exist yet).
3. **Block accidental raw data imports** into `/app` by adding ESLint `no-restricted-imports` rules:

   * Forbid `/app/**` importing from `src/data/portfolio/**`, `src/data/packages/**`, `src/data/testimonials/**` (except `src/data/page/**`).
4. **Add `dynamic = "error"` + `revalidate = false`** to all `/services` routes to enforce static builds.

---

# review checklist (use per PR)

* [ ] Route path matches canonical L0 hubs and service slugs.
* [ ] `generateStaticParams` derives from taxonomy helpers only.
* [ ] Page imports **only**: templates, lib/services, page-data.
* [ ] No raw catalog imports; composition lives in page-data.
* [ ] Metadata generated from page-data (with canonical URL).
* [ ] Build is static (no dynamic fetch). `dynamic="error"`.
* [ ] Middleware redirects send legacy paths to canonical.
* [ ] No client components in `/app` unless absolutely necessary.

---

this keeps `/app` lean, declarative, and future-proof, while your **data** and **lib** layers do the heavy lifting—and it mirrors your `/public` and `/src/data` structures so it’s easy to navigate and maintain.
