```markdown
# Packages Domain — App Routing & Page Layouts
**Domain:** Packages  
**File Name:** Packages-Domain_App-Routing-Page-Layouts_Spec_2025-09-21.md  
**Main Part:** Packages-Domain_App-Routing-Page-Layouts  
**Qualifier:** Spec  
**Date:** 2025-09-21  
**Spotlight Comments:** Defines routes, page responsibilities, section order, concrete components, data sources, adapters, and SEO/analytics for the Packages hub and bundle detail.  
**Summary:** A wiring manual so engineers and content authors can implement `/packages` and `/packages/[bundles]` using existing templates/components, with a thin-page → adapters → templates contract and a single data façade.

---

## 0) Goals (TL;DR)
- **`/packages` hub**: discover **everything** (bundles + service packages + add-ons) with search/filter/sort and clear CTAs.
- **`/packages/[bundle]` detail**: deep-dive for a single **integrated bundle** (hero, price, includes, outcomes, add-ons, FAQ, CTA).
- **SSOT**: pages read `src/data/packages/index.ts`; adapters are null-safe; content MDX augments narrative (not facts).

---

## 1) App Router (Next.js /app)

```

/app
└── packages
├── page.tsx                 # Hub — all offerings
├── packages.module.css
└── \[bundles]
└── page.tsx             # Detail — one integrated bundle

````

**Build/SSG**
- `generateStaticParams()` in `[bundles]/page.tsx` → `BUNDLES.map(b => ({ bundles: b.slug }))`.

---

## 2) Data Sources (Façade)
Read only from **`src/data/packages/index.ts`**:

```ts
export const BUNDLES: Bundle[];
export const SERVICE_PACKAGES: ServicePackage[];
export const ADDONS: AddOn[];
export const FEATURED_BUNDLE_SLUGS: string[];
export function getBundleBySlug(slug: string): Bundle | undefined;
````

Generated artifacts (build step):

* `src/data/packages/__generated__/bundles.enriched.json`
* `src/data/packages/__generated__/packages.search.json`
* `src/data/packages/__generated__/content.map.json`

---

## 3) Adapters & Templates (contracts)

Use **patched** null-safe adapters in `src/packages/lib/adapters.ts`:

* `toHubModel(bundles, opts?)` → ItemList JSON-LD for hub (optional).
* `toDetailModel(bundle, opts?)` → `{ card, price, includes, jsonLd }` for detail.
* `toServiceOfferJsonLd(bundle)` → omits `offers` when price absent.

Templates:

* `src/packages/templates/PackagesHubTemplate/PackagesHubTemplate.tsx`
* `src/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate.tsx`

---

## 4) Hub Page (`/packages`) — Responsibilities & Layout

### 4.1 Responsibilities

* Render a hero, global search/filters, and a unified grid of **bundles + packages + add-ons**.
* Optionally show **featured rails** per service.
* End with a strong **CTA**.
* (Optional) emit **ItemList JSON-LD**.

### 4.2 Section Order (top → bottom)

1. **Hero** — `ServiceHero`
   Path: `src/components/sections/section-layouts/ServiceHero/ServiceHero.tsx`
   Props (suggested):

   ```ts
   { title: string; subtitle?: string; primaryCta?: {label:string; href:string}; secondaryCta?: {label:string; href?:string}; background?: {type:"image"|"video"; src:string; alt?:string} }
   ```

2. **Search & Filters** — inside `PackagesSection`
   Path: `src/packages/sections/PackagesSection/PackagesSection.tsx`
   Controls: type (All/Bundles/Packages/Add-ons), service, search, sort (Recommended/A-Z).

3. **Unified Grid** — `PackageGrid` → `PackageCard`
   Paths:

   * `src/packages/components/PackageGrid/PackageGrid.tsx`
   * `src/packages/components/PackageCard/PackageCard.tsx` (price **optional** + null-safe)
     Items: bundles, service packages, add-ons (normalized by section/adapter).

4. **(Optional) Featured Rails** — `PackageCarousel`
   Paths:

   * `src/components/sections/section-layouts/PackageCarousel/PackageCarousel.tsx`
   * `.../adapters/featuredDataAdapter.ts`
     Use per-service featured sets (3–4 each).

5. **CTA Band** — `GrowthPackagesCTA` (or `CTASection`)
   Paths:

   * `src/packages/components/GrowthPackagesCTA/GrowthPackagesCTA.tsx`
   * `src/components/sections/section-layouts/CTASection/CTASection.tsx`

**Wrappers**

* `Container` → `src/components/sections/container/Container/Container.tsx`
* `FullWidthSection` → `src/components/sections/section-layouts/FullWidthSection/FullWidthSection.tsx` (for full-bleed rails/bands)

### 4.3 Hub Template Props (recommended)

```ts
type PackagesHubTemplateProps = {
  bundles: Bundle[];
  packages?: ServicePackage[];
  addOns?: AddOn[];
  featuredSlugs?: string[];
  showServiceFilter?: boolean;
  showSearch?: boolean;
  showSort?: boolean;
  defaultSort?: "recommended" | "alpha";
  minCardWidthPx?: number;
  jsonLd?: boolean;
  title?: string;
  subtitle?: string;
  heroCta?: { label: string; href: string };
};
```

### 4.4 Hub Page Implementation Sketch

```tsx
// app/packages/page.tsx
import { BUNDLES, FEATURED_BUNDLE_SLUGS } from "@/data/packages";
import { PackagesHubTemplate } from "@/packages/templates";

export default function PackagesHubPage() {
  return (
    <div className="page">
      <PackagesHubTemplate
        bundles={BUNDLES}
        featuredSlugs={FEATURED_BUNDLE_SLUGS}
        showServiceFilter
        showSearch
        showSort
        defaultSort="recommended"
        minCardWidthPx={300}
        jsonLd
        title="Integrated Growth Packages"
        subtitle="Proven playbooks bundled into simple plans — faster time to value, repeatable results."
      />
    </div>
  );
}
```

---

## 5) Bundle Detail (`/packages/[bundles]`) — Responsibilities & Layout

### 5.1 Responsibilities

* Load a bundle by `slug` (via façade), adapt via `toDetailModel`, render with `PackagesDetailTemplate`.
* Provide metadata (title/description/OG), and valid `Service` JSON-LD with guarded offers.

### 5.2 Section Order (top → bottom)

1. **Hero + Price** — handled by `PackagesDetailTemplate`

   * Hero: title, subtitle, tags/chips, CTAs (Request proposal / Book a call)
   * Price: `PriceBlock` → `src/packages/components/PriceBlock/PriceBlock.tsx`
     Shows `oneTime`, `monthly`, and note (e.g., “+ ad spend”).

2. **What’s Included** — `PackageIncludesTable`
   Path: `src/packages/components/PackageIncludesTable/PackageIncludesTable.tsx`
   Data: from `bundle.includes` and/or resolved `components[]`.

3. **Outcomes / Value** — optional stats/bullets (from bundle).

4. **Recommended Add-Ons** — `AddOnsGrid`
   Path: `src/packages/components/AddOnsGrid/AddOnsGrid.tsx`
   Data: explicit `addOnRecommendations[]` or inferred by service/category.

5. **Popular in Category** — (optional) `PackageCarousel` rail.

6. **CTA Band** — `GrowthPackagesCTA` or `CTASection`.

7. **FAQ** — `FAQAccordion`
   Path: `src/components/ui/organisms/FAQAccordion/FAQAccordion.tsx`
   Data: bundle FAQ (data or MDX).

8. **JSON-LD** — `toServiceOfferJsonLd(bundle)` (omits `offers` if no price).

**Wrappers**: `Container` for content width, `FullWidthSection` for full-bleed bands.

### 5.3 Detail Page Implementation Sketch

```tsx
// app/packages/[bundles]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BUNDLES, getBundleBySlug } from "@/data/packages";
import { PackagesDetailTemplate } from "@/packages/templates";

export function generateStaticParams() {
  return BUNDLES.map(b => ({ bundles: b.slug }));
}

type Params = { bundles: string };

export function generateMetadata({ params }: { params: Params }): Metadata {
  const b = getBundleBySlug(params.bundles);
  if (!b) return { title: "Package not found", description: "The requested package could not be found.", robots: { index: false } };

  const absolute = (src: string) =>
    src?.startsWith("http") ? src : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${src}`;

  return {
    title: `${b.title} • Integrated Growth Package`,
    description: b.subtitle || b.summary || `Complete ${b.title} solution with integrated services.`,
    alternates: { canonical: `/packages/${b.slug}` },
    openGraph: {
      title: b.title,
      description: b.subtitle || b.summary,
      type: "website",
      ...(b.cardImage?.src && { images: [{ url: absolute(b.cardImage.src), alt: b.cardImage.alt || b.title }] }),
    },
  };
}

export default function PackageDetailPage({ params }: { params: Params }) {
  const bundle = getBundleBySlug(params.bundles);
  if (!bundle) return notFound();
  return <PackagesDetailTemplate bundle={bundle} />;
}
```

---

## 6) Component Map (by path)

**Wrappers**

* `Container` — `src/components/sections/container/Container/Container.tsx`
* `FullWidthSection` — `src/components/sections/section-layouts/FullWidthSection/FullWidthSection.tsx`

**Hero / CTA**

* `ServiceHero` — hub hero
* `CTASection` — flexible CTA band
* `GrowthPackagesCTA` — focused packages CTA

**Discovery (Hub)**

* `PackagesSection` (filters/search) → `PackageGrid` → `PackageCard`

**Detail**

* `PriceBlock` — price chips/lines
* `PackageIncludesTable` — specs/inclusions
* `AddOnsGrid` — relevant add-ons
* `FAQAccordion` — Q\&A block

**Carousels (optional)**

* `PackageCarousel` (+ `adapters/featuredDataAdapter.ts`)

---

## 7) Pricing & JSON-LD Rules (brief)

* `PackageCard` & `PriceBlock` accept **optional** `price` (oneTime/monthly).
  If both → show both chips; if none → “Custom pricing”.
* JSON-LD (`Service`) emits `offers` only when a price exists (monthly and/or oneTime).

---

## 8) SEO & Analytics

* **Hub JSON-LD**: `toItemListJsonLd()` when `jsonLd` enabled.
* **Detail JSON-LD**: `toServiceOfferJsonLd(bundle)` (guarded).
* **Metadata**: per-page `generateMetadata` (title/desc/OG image).
* **Analytics**: `PackageCard` fires `gtag` events on primary/secondary CTA clicks; keep `category: "packages"`.

---

## 9) Error Handling & A11y

* Null-safe adapters/components prevent hub/detail from “rendering empty”.
* `PackageGrid` should render an **EmptyState** when filters return 0.
* A11y: maintain focus order for filters; `aria-live` on “+N more” features; alt text for images.

---

## 10) Implementation Checklist

* [ ] Ensure façade exports (`BUNDLES`, `SERVICE_PACKAGES`, `ADDONS`, `FEATURED_BUNDLE_SLUGS`, `getBundleBySlug`).
* [ ] Verify build artifacts in `__generated__` exist and are current.
* [ ] Wire `/packages` → `PackagesHubTemplate` (pass bundles; later add packages & add-ons to grid).
* [ ] Wire `/packages/[bundles]` → `PackagesDetailTemplate` + metadata + SSG params.
* [ ] Insert `PackageCarousel` rails (optional) using per-service featured.
* [ ] Confirm price chips render across shapes (one-time / monthly / both / none).
* [ ] Validate JSON-LD output (hub item list, detail service offers).

---

## 11) Success Criteria

* Hub lists all offerings with working search/filter/sort and correct price badges.
* Detail pages render complete narratives (hero, price, includes, outcomes, add-ons, FAQ, CTA).
* No crashes or blank shells when price is missing.
* Marketing can update MDX story safely; data remains authoritative for facts.

```
```
