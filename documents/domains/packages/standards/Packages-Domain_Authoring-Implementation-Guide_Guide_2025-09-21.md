````markdown
# Packages Domain — Authoring & Implementation Guide
**Domain:** Packages  
**File Name:** Packages-Domain_Authoring-Implementation-Guide_Guide_2025-09-21.md  
**Main Part:** Packages-Domain_Authoring-Implementation-Guide  
**Qualifier:** Guide  
**Date:** 2025-09-21  
**Spotlight Comments:** Canonical data model, authoring rules, rendering contracts, build/validation, and migration notes for B2B packages (one-time, setup+monthly, monthly).  
**Summary:** Defines a single pricing model, TS/JSON/MDX authoring patterns, UI rendering rules (cards, price block, JSON-LD), search/indexing, and build-time validation so hub and bundle pages stay consistent and resilient.

---

> B2B services have different billing shapes. This guide defines **one canonical price model**, how to **author** data/MDX, how the **UI renders** it, and how we **validate/build** so the hub and bundle pages are always correct.

## 1) Canonical price model (single source of truth)

We support three real-world shapes with one type:

```ts
export type Money = {
  /** One-time charge (AKA “setup”/“project”) */
  oneTime?: number;
  /** Recurring charge per month */
  monthly?: number;
  /** Currency code; default "USD" */
  currency?: "USD";
};

export type PriceMeta = {
  /** Short note near price (“+ ad spend”, “starting at…”) */
  note?: string;
  /** Minimum term in months (e.g., 3, 6, 12) */
  minTermMonths?: number;
  /** Setup waived after N months */
  setupWaivedAfterMonths?: number;
  /** Internal calculators only (not auto-rendered) */
  discountPercent?: number;
};
````

**Authoring shapes**

* One-time project → `{ price: { oneTime: 8500 } }`
* Monthly retainer → `{ price: { monthly: 3500 } }`
* Setup + monthly → `{ price: { oneTime: 5000, monthly: 2500 } }`
* Project + maintenance → `{ price: { oneTime: 18000, monthly: 1200 } }`

> ⚠️ Don’t author `price.setup`. Legacy `setup` is mapped to `oneTime` at build.

---

## 2) Data authoring rules (TS/JSON) — SSOT in `/src/data/packages/**`

### A. Service Packages (per service)

```ts
export type Service = "content" | "leadgen" | "marketing" | "seo" | "webdev" | "video";

export type ServicePackage = {
  id: string;                         // "leadgen-professional"
  service: Service;
  tier?: "Essential" | "Professional" | "Enterprise";
  name: string;
  summary?: string;                   // 1–2 sentences
  features: Array<{ label: string; detail?: string }>;
  price?: Money;
  priceMeta?: PriceMeta;
  badges?: string[];                  // "Most Popular", "Best Value"
  popular?: boolean;
};
```

### B. Add-ons (per service)

```ts
export type AddOn = {
  id: string;                         // "seo-migration-support"
  service: Service;
  name: string;
  description?: string;
  deliverables?: Array<{ label: string; detail?: string }>;
  price?: Money;
  category?: string;                  // "Reputation", "Analytics"
  dependencies?: string[];            // free text
  popular?: boolean;
};
```

### C. Integrated Bundles (multi-service “solutions”)

```ts
export type CTA = { label: string; href?: string };

export type Bundle = {
  slug: string;                       // "local-business-growth"
  title: string;
  subtitle?: string;
  summary?: string;
  category?: "startup" | "local" | "ecommerce" | "b2b" | "custom";
  tags?: string[];

  price?: Money;                      // optional bundle-level price
  priceMeta?: PriceMeta;

  /** References to real package IDs (resolved at build) */
  components?: string[];              // ["seo-foundation", "content-essential"]
  addOnRecommendations?: string[];    // ["review-generation-system"]

  /** Optional quick “includes” for table rendering */
  includes?: Array<{ title?: string; items: string[] }>;

  /** Marketing hooks */
  hero?: {
    content?: { title?: string; subtitle?: string; primaryCta?: CTA; secondaryCta?: CTA };
    background?: { type: "image" | "video"; src: string; alt?: string };
  };
  cardImage?: { src: string; alt?: string };

  /** Optional: outcomes, faq, cta blocks preserved as-is */
};
```

> **Bundles should reference real package IDs** in `components[]`; build resolves them to full objects for the detail page.

---

## 3) Rendering rules (cards, price blocks, JSON-LD)

### A. Card (Hub/List)

* If `price.monthly` → show chip `$X/mo`.
* If `price.oneTime` only → show `Setup $Y`.
* If both → show both chips.
* If neither → show **Custom pricing**.
* Show badges (e.g., tier or “Most Popular”).
* ✅ Implemented in `PackageCard` (now **null-safe**).

### B. Detail (PriceBlock)

* Show existing lines only (setup/monthly).
* Render `priceMeta.note` (e.g., “+ ad spend”).
* Render `minTermMonths` (e.g., `3-month minimum`).
* Optional helper text for `setupWaivedAfterMonths`.

### C. JSON-LD (`Service`)

* Emit `Offer` for each present price (monthly and/or oneTime).
* Omit `offers` entirely when no price.
* Always set `priceCurrency` (default “USD”).
* ✅ Patched in adapters (null-safe).

---

## 4) UX content standards

* **Price note** ≤ 40 chars.
* **Card bullets**: 5–7 max; full list lives on detail page.
* **Tier names**: “Essential / Professional / Enterprise” across services.

---

## 5) Hub search & filters (unified index)

```ts
type SearchRecord =
 | { type: "bundle";  slug: string; title: string; summary?: string; price?: Money; tags?: string[]; category?: string }
 | { type: "package"; id: string;  service: Service; name: string; summary?: string; price?: Money; tier?: string; tags?: string[]; category?: string }
 | { type: "addon";   id: string;  service: Service; name: string; summary?: string; price?: Money; category?: string; tags?: string[] };
```

**Filters:** Type (All/Bundles/Packages/Add-ons), Service, Has monthly/Has one-time, Tags, Text search.
**Sort:** Default **Recommended** (featured first, then A–Z). When scoped to a service, prefer that service’s featured list.

---

## 6) Build & validation pipeline (`/scripts/packages/*`)

1. **Normalize prices**
   Map legacy `price.setup` → `price.oneTime`; set default currency.
2. **Resolve references**
   Expand `components[]` and `addOnRecommendations[]`; emit `__generated__/bundles.enriched.json`.
3. **Search index**
   Flatten Bundles + Packages + Add-ons → `__generated__/packages.search.json`.
4. **Content map**
   Scan `/src/content/packages/**` → `__generated__/content.map.json` (front-matter + paths).
5. **Validate**
   Unique IDs/slugs; all references resolve; canonical Money shape; warn when bundles lack hero or components.

> Run on `prebuild` to keep artifacts fresh.

---

## 7) MDX front-matter (content pairing)

**Bundle MDX** (`/src/content/packages/bundles/*.mdx`)

```md
---
slug: local-business-growth          # must match Bundle.slug
lede: "Be discovered locally and convert more nearby customers…"
image:
  src: "/packages/local-business-growth/hero.jpg"
  alt: "Local storefront"
seo:
  title: "Local Business Growth • Integrated Package"
  description: "Local SEO, content, reviews, and ads in a repeatable engine."
---
MDX body with FAQs, process, etc.
```

**Rule of precedence**: **Data files** own product facts (price, features). **MDX** owns story (hero copy, FAQ, process). MDX fields fill gaps; they don’t override valid product facts by default.

---

## 8) Featured & promotion

* Per-service featured in `*/[service]-featured.ts` (3–4 items).
* Global bundle order: `src/data/packages/featured.json` → `FEATURED_BUNDLE_SLUGS`.
* Build cross-validates featured IDs.

---

## 9) Edge cases & display

| Case                        | Data                                           | UI                                | JSON-LD                       |
| --------------------------- | ---------------------------------------------- | --------------------------------- | ----------------------------- |
| Pure custom                 | `price` missing                                | Chip “Custom pricing”             | Omit `offers`                 |
| + Ad spend                  | `price.monthly`, `priceMeta.note="+ ad spend"` | Show note inline                  | Leave offers unchanged        |
| Setup waived after N months | both prices + `setupWaivedAfterMonths`         | Tiny helper text                  | Two offers OK                 |
| Annual option               | keep monthly; UI can compute yearly            | Optional toggle `$X/mo` ↔ `$Y/yr` | Only add annual if truly sold |

---

## 10) Migration checklist

* [ ] Replace `price: { setup: N }` → `price: { oneTime: N }` in TS authoring (JSON tolerated; build maps it).
* [ ] Add real package IDs to each bundle’s `components[]` and `addOnRecommendations[]`.
* [ ] Ensure all `*-packages.ts` / `*-addons.ts` use canonical `Money`.
* [ ] Run `packages:build` to generate `__generated__` artifacts.
* [ ] Verify hub filters (All/Packages/Add-ons) and price chips render correctly.
* [ ] Verify bundle detail: hero → price block → includes (from `components`) → add-ons → FAQ → CTA.

---

## 11) Code contracts (already aligned)

* **Adapters** (`src/packages/lib/adapters.ts`) — null-safe prices; JSON-LD omits empty offers.
* **PackageCard** — `price?`; shows “Custom pricing” when absent.
* **Pages** (`/app/packages/*`) — thin: read from façade, pass to templates.

---

## 12) Why this fits B2B

* Covers **project**, **retainer**, and **hybrid** without branching types.
* **Typed authoring (TS)** + **fast runtime (generated JSON)**.
* Clear separation of **facts** (data) vs **story** (MDX).
* Defensive adapters → **no crashes** if a price is missing.

```
```
