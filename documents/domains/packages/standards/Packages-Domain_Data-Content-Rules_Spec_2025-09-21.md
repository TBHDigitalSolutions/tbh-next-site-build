````markdown
# Packages Domain — Data & Content Rules
**File Name:** Packages-Domain_Data-Content-Rules_Spec_2025-09-21.md  
**Main Part:** Packages-Domain_Data-Content-Rules  
**Qualifier:** Spec  
**Date:** 2025-09-21  
**Spotlight Comments:** Canonical data shapes, authoring standards, file locations, build outputs, and validation for bundles, service packages, and add-ons.  
**Summary:** This document defines the single source of truth (SSOT) model and writing rules so all Packages pages render correctly across one-time, setup+monthly, and monthly-only billing, with MDX used for story and TS/JSON for product facts.

---

## 0) Scope & Principles
- **SSOT:** Typed TS files under `src/data/packages/**` are authoritative for product facts (IDs, names, features, pricing).
- **MDX is narrative:** Long-form copy, FAQs, and visuals live in `src/content/packages/**` and never override facts.
- **Null-safe by design:** All consumers (adapters/components) must tolerate missing optional fields (e.g., price).
- **Composable:** Bundles reference real service packages/add-ons by **ID**; build resolves to concrete objects.
- **Searchable & linkable:** Stable IDs/slugs; generated search index; consistent analytics and JSON-LD.

---

## 1) Canonical Data Model

```ts
// Shared
export type Money = {
  oneTime?: number;   // formerly "setup"
  monthly?: number;
  currency?: "USD";
};

export type Deliverable = { label: string; detail?: string };

// Service packages (per service)
export type Service =
  | "content" | "leadgen" | "marketing" | "seo" | "video" | "webdev";

export type ServicePackage = {
  id: string;                   // e.g., "leadgen-professional"
  service: Service;
  name: string;
  tier?: "Essential" | "Professional" | "Enterprise";
  summary?: string;             // 1–2 sentences
  features?: Deliverable[];     // bullets; detail optional
  price?: Money;                // optional; null-safe
  notes?: string;               // short tag like "+ ad spend"
  badges?: string[];            // "Most Popular", etc.
  tags?: string[];
  category?: string;            // optional grouping
};

// Add-ons (same shape, different intent)
export type AddOn = ServicePackage & { kind?: "addon" };

// Integrated bundles (cross-service)
export type Bundle = {
  slug: string;                 // page slug (e.g., "local-business-growth")
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  price?: Money;                // optional
  includes?: Array<{ title?: string; items: string[] }>;
  components?: string[];        // IDs of ServicePackage
  addOnRecommendations?: string[]; // IDs of AddOn
  outcomes?: Array<{ label: string; value: string }>;
  timeline?: string;            // e.g., "60–90 days"
  faq?: { title?: string; faqs: Array<{ id: string; question: string; answer: string }> };
  category?: "startup" | "ecommerce" | "local" | "b2b" | "custom";
  tags?: string[];
  hero?: {
    content?: {
      title?: string; subtitle?: string;
      primaryCta?: { label: string; href: string };
      secondaryCta?: { label: string; href: string };
    };
    background?: { type: "image" | "video"; src: string; alt?: string };
  };
  cardImage?: { src: string; alt?: string };
  isMostPopular?: boolean;
};
````

> **Price normalization:** Any legacy `price.setup` must be mapped to `price.oneTime` by the build step.

---

## 2) Authoring Rules (TS/JSON)

1. **Where to write**

   * Service packages: `src/data/packages/<service>/<service>-packages.ts`
   * Add-ons: `src/data/packages/<service>/<service>-addons.ts`
   * Per-service featured: `src/data/packages/<service>/<service>-featured.ts` (array of IDs)
   * Bundles (solutions): `src/data/packages/bundles/*.ts` **or** `src/data/packages/bundles.json`
   * Global ordering/featured: `src/data/packages/featured.json` (optional)
2. **Keep it typed:** Prefer TS exports. JSON catalogs are allowed but will be normalized at build.
3. **IDs & slugs**

   * `ServicePackage.id` and `AddOn.id` are **stable** and globally unique.
   * `Bundle.slug` is the **URL**; keep lowercase/kebab-case.
4. **Features vs. includes**

   * **Service packages/add-ons:** author features/deliverables in `features`.
   * **Bundles:** `includes` is a quick human-readable summary; detailed composition is resolved via `components[]`.
5. **Notes & disclaimers**

   * Short price notes go in `notes` (e.g., “+ ad spend”, “starting at…”). Keep to ≤ 40 chars.
6. **Badges**

   * Use `badges` on packages or `isMostPopular` on bundles to surface labels in cards/rails.

---

## 3) Content (MDX) Rules

* Location: `src/content/packages/**`

  * Bundle MDX: `src/content/packages/bundles/[slug].mdx`
  * Service MDX (optional editorial companions): `src/content/packages/services/<service>/*.mdx`
* Bundle MDX front-matter:

  ```md
  ---
  slug: local-business-growth
  lede: "Be discovered locally and convert nearby customers…"
  image: { src: "/packages/local-business-growth/hero.jpg", alt: "Local storefront" }
  seo: { title: "...", description: "..." }
  ---
  ```
* **MDX does not set price or features.** It provides narrative (FAQ, process, case snippets).

---

## 4) File Layout (SSOT & Artifacts)

```
/src/data/packages
  __generated__/
    bundles.enriched.json        # bundles with components resolved to full objects
    packages.search.json         # unified search index (bundle | package | addon)
    content.map.json             # MDX associations (slug/id → content)
  <service>/
    <service>-packages.ts
    <service>-addons.ts
    <service>-featured.ts
  bundles/                       # *.ts per bundle (preferred)
  bundles.json                   # optional alternative source
  featured.json                  # optional global featured mapping
  index.ts                       # façade exports (see §5)
```

---

## 5) Data Façade (read-only API)

```ts
// src/data/packages/index.ts
export const BUNDLES: Bundle[];
export const SERVICE_PACKAGES: ServicePackage[];
export const ADDONS: AddOn[];
export const FEATURED_BUNDLE_SLUGS: string[];
export const FEATURED_BY_SERVICE: Record<Service, string[]>;
export function getBundleBySlug(slug: string): Bundle | undefined;
```

Backed by `__generated__` artifacts whenever possible for performance and consistency.

---

## 6) Build Outputs & Validation

**Build script responsibilities** (e.g., `/scripts/packages/build.ts`):

1. **Normalize prices:** map `setup → oneTime`; ensure `currency` defaults to `"USD"`.
2. **Resolve references:** expand `Bundle.components[]` and `addOnRecommendations[]` into objects; write `bundles.enriched.json`.
3. **Search index:** flatten into `packages.search.json`:

   ```ts
   type SearchRecord =
     | { type: "bundle";  slug: string; title: string; summary?: string; price?: Money; tags?: string[]; category?: string }
     | { type: "package"; id: string;  service: Service; name: string; summary?: string; price?: Money; tier?: string; tags?: string[] }
     | { type: "addon";   id: string;  service: Service; name: string; summary?: string; price?: Money; category?: string; tags?: string[] };
   ```
4. **Content map:** collect front-matter for bundles/services → `content.map.json`.

**Validation** (e.g., `/scripts/packages/validate.ts`):

* Unique IDs and slugs.
* All bundle references resolve.
* `Money` only contains `{ oneTime?, monthly?, currency? }`.
* Warnings for: bundles missing `components`, missing hero/card images, or empty features.

---

## 7) Rendering Rules (Adapters & Components)

* **Cards (`PackageCard`)**

  * Accepts `price?: Money` (optional, null-safe).
  * Chips:

    * `oneTime` → “Setup \$X,XXX”
    * `monthly` → “\$X,XXX/mo”
    * Both → show both chips
    * None → “Custom pricing”
  * Badges: show when present.

* **Price block (`PriceBlock`)**

  * Show existing lines only; include `notes` when provided.

* **JSON-LD**

  * Detail page uses `toServiceOfferJsonLd(bundle)`:

    * If `price.monthly` → emit an `Offer` with that price.
    * If `price.oneTime` → emit a second `Offer`.
    * If neither → omit `offers` entirely.
  * Hub page may emit `ItemList` via `toItemListJsonLd`.

* **Adapters**

  * `toHubModel(bundles, opts?)` → list model + optional ItemList JSON-LD.
  * `toDetailModel(bundle, opts?)` → `{ card, price, includes, jsonLd }`.
  * All **null-safe**; never throw on missing price.

---

## 8) Search, Filters, Featured

* **Filters** (client UI): by type (All/Bundles/Packages/Add-ons), service, tier, tags, and price presence (has monthly/oneTime).
* **Sort**: Recommended (featured weighting), A–Z; optional price sort when present.
* **Featured**

  * Per-service: IDs in `<service>-featured.ts` (3–4).
  * Global: `FEATURED_BUNDLE_SLUGS` for hub weighting and badges.

---

## 9) Analytics & SEO

* **Analytics**

  * Keep `category: "packages"`.
  * Events: card primary/secondary CTA clicks, filter changes, search submissions.

* **SEO**

  * Hub: optional `ItemList` with canonical URLs.
  * Detail: `Service` JSON-LD with guarded offers; metadata from bundle (+ MDX overrides for title/description if provided).

---

## 10) Migration Checklist

* [ ] Replace any `price.setup` with `price.oneTime` in TS; leave JSON—build will map.
* [ ] Ensure all service packages/add-ons use **canonical Money**.
* [ ] Add `components[]` and `addOnRecommendations[]` IDs to each bundle.
* [ ] Create/confirm per-service `*-featured.ts`.
* [ ] Run build to emit `__generated__` artifacts; fix validation errors/warnings.
* [ ] Verify hub shows all items; chips render across price shapes; search/filter works.
* [ ] Verify detail pages include includes, outcomes, add-ons, FAQ, and valid JSON-LD.

---

## 11) Glossary

* **Bundle:** Cross-service, outcome-oriented solution (has `/packages/[slug]` page).
* **Service Package:** Tiered offering within a single service (Essential/Professional/Enterprise).
* **Add-on:** A la carte enhancement; often one-time or hybrid.
* **SSOT:** Single Source of Truth (TS data files + generated artifacts).
* **MDX:** Marketing narrative paired to products; never sets prices or IDs.

---

```
```
