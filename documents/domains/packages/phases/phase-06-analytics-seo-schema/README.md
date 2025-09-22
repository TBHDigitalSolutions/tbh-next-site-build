Awesome—here are the **production-ready docs** for **Phase 06 — Analytics, SEO, Schema**.
Drop these four files into:

```
documents/domains/packages/phases/phase-06-analytics-seo-schema/
├─ _generated/index.json
├─ README.md
├─ phase-06-analytics-seo-schema_Checklist_2025-09-22.md
└─ phase-06-analytics-seo-schema_Playbook_2025-09-22.md
```

They’re tailored to `TBHDigitalSolutions/tbh-next-site-build`, **Next.js App Router**, **Node 20 + npm**, and your guardrails (pages thin, templates no IO, data via façade).

---

## 1) `README.md`

```md
**Official Title:** Phase 06 — Analytics, SEO, Schema  
**Domain:** packages  
**File Name:** phase-06-analytics-seo-schema_Readme_2025-09-22.md  
**Main Part:** phase-06-analytics-seo-schema  
**Qualifier:** Guide  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Namespaced analytics events for **hub cards/CTAs** and **detail CTAs/add-ons**.  
- Canonical & OG/Twitter metadata built from **NEXT_PUBLIC_SITE_URL**.  
- **JSON-LD**: Hub = `ItemList` of visible items; Detail = `Service` **only if priced**.

**Summary:**  
This phase wires analytics + SEO + structured-data schema for the **Packages** domain. We add a tiny, dependency-free analytics adapter (GTM-friendly), unify metadata builders for hub & detail pages, and emit sanitized JSON-LD via the templates (no runtime fetching). Outputs are deterministic and respect our rule: **pages thin, templates no IO, all data via façade**.
```

---

## 2) `phase-06-analytics-seo-schema_Checklist_2025-09-22.md`

```md
**Official Title:** Phase 06 — Analytics, SEO, Schema (Checklist)  
**Domain:** packages  
**File Name:** phase-06-analytics-seo-schema_Checklist_2025-09-22.md  
**Main Part:** phase-06-analytics-seo-schema  
**Qualifier:** Checklist  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Use **npm** only; branch `feat/packages-refactor`.  
- Pages thin; **templates emit JSON-LD**; all reads via façade.

**Summary:**  
Tight, verifiable steps to land namespaced analytics, canonical/OG, and JSON-LD (`ItemList` hub, `Service` detail).

---

## Working rules
- Work only on `feat/packages-refactor` (never `main`).
- No runtime MD/MDX; templates do **presentation only**.
- All data via `@/data/packages` façade.

## Preconditions
- [ ] Phase 04 hub/detail pages already use `PackagesHubTemplate` / `PackagesDetailTemplate`.
- [ ] Phase 05 search & featured are in place (hub renders items & featured rails).

## Do this (check each)
- [ ] Add analytics adapter: `src/lib/analytics.ts` (namespaced `track()` with GTM `dataLayer` fallback).  
- [ ] Add SEO helpers: `src/lib/seo.ts` (`canonicalUrl(path)`, `toMetadata()` helpers).  
- [ ] Hub page metadata: canonical `/packages`, OG/Twitter from `NEXT_PUBLIC_SITE_URL`.  
- [ ] Detail page metadata: derive from bundle; `robots: { index:false }` when unresolved.  
- [ ] Templates: emit JSON-LD  
  - [ ] Hub: `ItemList` of rendered cards (bundles first).  
  - [ ] Detail: `Service` **only when price exists** (skip otherwise).  
- [ ] Analytics hooks  
  - [ ] Hub: `packages_hub:card_click`, `packages_hub:cta_click`, `packages_hub:rail_interact`.  
  - [ ] Detail: `bundle_detail:cta_click`, `bundle_detail:addon_click`.  
- [ ] Manual QA: verify events in console / `window.dataLayer`.  
- [ ] Run: `npm run build` (no duplicate title/canonical warnings) + structured-data check.

## Acceptance
- [ ] Namespaced events fire with **bundle/package IDs/slugs**.  
- [ ] Canonical & OG correct for hub & detail.  
- [ ] Hub `ItemList` and priced detail `Service` validate (no Rich Results errors).
```

---

## 3) `phase-06-analytics-seo-schema_Playbook_2025-09-22.md`

````md
**Official Title:** Phase 06 — Analytics, SEO, Schema (Playbook)  
**Domain:** packages  
**File Name:** phase-06-analytics-seo-schema_Playbook_2025-09-22.md  
**Main Part:** phase-06-analytics-seo-schema  
**Qualifier:** Playbook  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Zero external deps; safe to run with or without GTM.  
- JSON-LD is generated in **templates** (no IO); pages stay thin.

**Summary:**  
Implement a tiny analytics adapter, unified SEO helpers, and JSON-LD emitters for hub & detail. Keep everything deterministic and SSR-safe.

---

## 0) Branch

```bash
git switch feat/packages-refactor
git pull --ff-only
git switch -c feat/phase-06-analytics-seo-schema
````

---

## 1) Analytics adapter (no dependencies)

**File:** `src/lib/analytics.ts`

```ts
// ESM, SSR-safe
type Payload = Record<string, unknown>;

const isBrowser = () => typeof window !== "undefined";

function pushToDataLayer(event: string, payload: Payload) {
  if (!isBrowser()) return;
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event, ...payload });
}

function logToConsole(event: string, payload: Payload) {
  if (!isBrowser()) return;
  // Keep logs easy to read in dev
  // eslint-disable-next-line no-console
  console.debug(`[analytics] ${event}`, payload);
}

/**
 * Track a namespaced event. Will push to GTM's dataLayer if present, and always console.debug in dev.
 *
 * @example
 * track("packages_hub:card_click", { type: "bundle", id: "seo-starter", position: 3 });
 */
export function track(event: string, payload: Payload = {}) {
  try {
    pushToDataLayer(event, payload);
    if (process.env.NODE_ENV !== "production") logToConsole(event, payload);
  } catch {
    // never throw
  }
}
```

> This gracefully no-ops on SSR and pushes into `window.dataLayer` when present.

---

## 2) SEO helpers

**File:** `src/lib/seo.ts`

```ts
import type { Metadata } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ?? "";

/** Build an absolute, normalized canonical URL from a path like "/packages". */
export function canonicalUrl(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE}${p}`;
}

/** Minimal OG/Twitter builder with sensible defaults. */
export function baseOgMeta(path: string, opts?: { title?: string; description?: string }) {
  const url = canonicalUrl(path);
  return {
    alternates: { canonical: path },
    openGraph: { url, title: opts?.title, description: opts?.description },
    twitter: { card: "summary_large_image", title: opts?.title, description: opts?.description }
  } satisfies Partial<Metadata>;
}

/** Merge a Metadata object with base OG/canonical for a given path. */
export function toMetadata(path: string, meta: Partial<Metadata> = {}): Metadata {
  const base = baseOgMeta(path, { title: (meta as any)?.title as string, description: (meta as any)?.description as string });
  return { ...base, ...meta } as Metadata;
}
```

---

## 3) Page metadata (hub & detail)

**Edit:** `app/packages/page.tsx`

```ts
import type { Metadata } from "next";
import { toMetadata } from "@/lib/seo";

export const metadata: Metadata = toMetadata("/packages", {
  title: "Integrated Growth Packages",
  description: "Explore bundles, packages, and add-ons across Content, SEO, Video, and more."
});
```

**Edit:** `app/packages/[bundles]/page.tsx`

```ts
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BUNDLES, getBundleBySlug } from "@/data/packages";
import { toMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return BUNDLES.map(b => ({ bundles: b.slug }));
}

export async function generateMetadata({ params }: { params: { bundles: string } }): Promise<Metadata> {
  const bundle = getBundleBySlug(params.bundles);
  if (!bundle) return { robots: { index: false, follow: false } };
  return toMetadata(`/packages/${bundle.slug}`, {
    title: bundle.title,
    description: bundle.summary
  });
}

export default function Page({ params }: { params: { bundles: string } }) {
  const bundle = getBundleBySlug(params.bundles);
  if (!bundle) return notFound();
  // render via template (see JSON-LD below)
  // ...
}
```

---

## 4) JSON-LD emitters (templates only)

### 4a) Hub: `ItemList`

**Edit:** `src/packages/templates/PackagesHubTemplate.tsx`

Add a small helper at the **bottom** of the server component render (after you have the **final list** the hub is showing):

```tsx
// server component context
function HubJsonLd({ items }: { items: Array<any> }) {
  const elements = items
    .map((x, i) => {
      const name = "name" in x ? x.name : x.title;
      const url  = x.type === "bundle" ? `/packages/${x.slug}` : "/packages";
      return {
        "@type": "ListItem",
        "position": i + 1,
        "url": url,
        "name": name
      };
    });
  const doc = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": elements
  };
  // eslint-disable-next-line @next/next/no-img-element
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(doc) }} />;
}
```

Render it where the template returns markup:

```tsx
export function PackagesHubTemplate(/* props */) {
  // ... existing server-side composition to compute `cards` (bundles first, etc.)
  return (
    <>
      {/* existing hero + controls + cards */}
      <HubJsonLd items={cards} />
    </>
  );
}
```

> We emit JSON-LD for the list the user actually sees. Keep it **server-side** (no client IO).

---

### 4b) Detail: `Service` (only when priced)

**Edit:** `src/packages/templates/PackagesDetailTemplate.tsx`

Add a helper:

```tsx
function BundleServiceJsonLd({ bundle }: { bundle: any }) {
  const hasPrice = !!(bundle?.price && (bundle.price.oneTime || bundle.price.monthly));
  if (!hasPrice) return null;

  const offers = [];
  if (bundle.price.oneTime) {
    offers.push({
      "@type": "Offer",
      "priceCurrency": bundle.price.currency ?? "USD",
      "price": bundle.price.oneTime,
      "category": "oneTime"
    });
  }
  if (bundle.price.monthly) {
    offers.push({
      "@type": "Offer",
      "priceCurrency": bundle.price.currency ?? "USD",
      "price": bundle.price.monthly,
      "priceSpecification": { "@type": "UnitPriceSpecification", "unitText": "per month" },
      "category": "recurring"
    });
  }

  const doc = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": bundle.title,
    "description": bundle.summary,
    "category": bundle.category ?? "BusinessService",
    "offers": offers
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(doc) }} />;
}
```

Render it once in the template (e.g., at the end):

```tsx
export function PackagesDetailTemplate({ bundle /* ... */ }) {
  // render hero, pricing, inclusions, compiled HTML, CTAs...
  return (
    <>
      {/* existing sections */}
      <BundleServiceJsonLd bundle={bundle} />
    </>
  );
}
```

> **No price?** We **omit** the `Service` schema entirely to avoid bad markup.

---

## 5) Analytics hooks (client-only sections)

### 5a) Hub — card & CTA

In the **client part** of `PackagesHubTemplate.tsx`, import `track` and fire events:

```tsx
"use client";
import { track } from "@/lib/analytics";

// when rendering each card:
<a
  // ...
  onClick={() => track("packages_hub:card_click", {
    type: x.type, id: "slug" in x ? x.slug : x.id
  })}
>
  {/* ... */}
</a>

// hero/button or bottom CTA:
<button
  onClick={() => track("packages_hub:cta_click", { location: "hero" })}
>
  Book a call
</button>

// featured rails (if you have arrow buttons etc.)
<button
  onClick={() => track("packages_hub:rail_interact", { rail: "featured", action: "next" })}
>
  Next
</button>
```

### 5b) Detail — CTAs & add-ons

In the **client parts** inside `PackagesDetailTemplate.tsx` (e.g., CTA buttons and add-on cards):

```tsx
"use client";
import { track } from "@/lib/analytics";

// primary CTA:
<button
  onClick={() => track("bundle_detail:cta_click", { slug: bundle.slug, variant: "primary" })}
>
  Start now
</button>

// add-on click:
<a
  href="/contact"
  onClick={() => track("bundle_detail:addon_click", { slug: bundle.slug, addonId: addon.id })}
>
  Add {addon.name}
</a>
```

> Namespacing (`packages_hub:*`, `bundle_detail:*`) keeps telemetry clean.

---

## 6) Build & manual QA

```bash
npm run build
npm run dev
```

* **Check events** in DevTools console; if GTM is present, inspect `window.dataLayer`.
* **View source** on hub/detail; confirm a single `<script type="application/ld+json">…</script>` block and no duplicates.
* **Structured data**: copy the JSON-LD blobs into Google’s Rich Results Test (manually) — ensure **no errors**.
* **SEO**: verify canonical `<link>` is `/packages` or `/packages/<slug>`; OG `url` is absolute via `NEXT_PUBLIC_SITE_URL`.

---

## 7) Commit & PR

```bash
git add src/lib/analytics.ts src/lib/seo.ts app/packages/page.tsx app/packages/[bundles]/page.tsx src/packages/templates/PackagesHubTemplate.tsx src/packages/templates/PackagesDetailTemplate.tsx
git commit -m "feat(packages): analytics hooks, canonical/OG helpers, and JSON-LD (ItemList/Service)"
git push -u origin feat/phase-06-analytics-seo-schema
```

Open a PR into `feat/packages-refactor` with screenshots of page source (canonical/OG) and a paste of JSON-LD validation results.

---

## Troubleshooting

* **Multiple canonical tags**: ensure only page-level metadata declares canonical (avoid layout-level canonical).
* **No events firing**: confirm code is in a **client** boundary (`"use client"`).
* **JSON-LD errors**: check that numbers (prices) are numbers (not strings) and only emit `Service` when price exists.
* **Missing absolute OG URL**: set `NEXT_PUBLIC_SITE_URL` in `.env.local` (e.g., `https://tbhdigitalsolutions.com`).

````

---

## 4) `_generated/index.json`

```json
{
  "phase": "06",
  "title": "Analytics, SEO, Schema",
  "files": [
    "README.md",
    "phase-06-analytics-seo-schema_Checklist_2025-09-22.md",
    "phase-06-analytics-seo-schema_Playbook_2025-09-22.md"
  ],
  "lastUpdated": "2025-09-22"
}
````

---

### Final acceptance (paste into PR)

* Events: `packages_hub:card_click`, `packages_hub:cta_click`, `packages_hub:rail_interact`, `bundle_detail:cta_click`, `bundle_detail:addon_click` fire with IDs/slugs.
* SEO: canonical + OG built from `NEXT_PUBLIC_SITE_URL`; no duplicates.
* Schema: hub `ItemList` and priced detail `Service` validate cleanly (no errors/warnings).
* `npm run build` green; no console errors in dev.
