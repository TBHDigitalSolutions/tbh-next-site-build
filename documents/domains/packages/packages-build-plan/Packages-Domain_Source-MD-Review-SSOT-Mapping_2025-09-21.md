Here’s the updated, plan-aligned version of that document. It keeps your plain-English tone but snaps to our current SSOT, pricing model, and hub/detail flow. You can drop this in as:

**documents/domains/packages/packages-build-plan/Packages-Domain\_Source-MD-Review-SSOT-Mapping\_2025-09-21.md**

---

# Packages Domain — Source MD Review & SSOT Mapping

*What each MD file contains, how it maps to the new single source of truth (SSOT), and what we’ll render where.*

**Status:** Approved
**Owners:** @conor
**Related:**

* `Packages-Domain_Authoring-Implementation-Guide_Guide_2025-09-21.md`
* `Packages-Domain_App-Routing-Page-Layouts_Spec_2025-09-21.md`
* `Packages-Domain_Data-Content-Rules_Spec_2025-09-21.md`
* `packages-app-pages-layouts_Plan_2025-09-21.md`

---

## 1) Scope & today’s goal

We reviewed all package-related Markdown you attached (service menus, add-ons, cross-service bundles). This doc:

* inventories what each MD file is,
* states exactly how it feeds the **SSOT data**,
* and shows how the hub (`/packages`) and bundle pages (`/packages/[bundle]`) will render it.

We align everything to the canonical **Money** model (`{ oneTime?, monthly?, currency }`) and the **thin page → adapters → templates** contract.

---

## 2) What you actually have (by content layer)

### A) Cross-service “Solutions” (Integrated Growth Bundles)

**Files covered:** *Client-facing sales sheet for the 5 bundles* + per-bundle MDX under `/src/content/packages/bundles/*.mdx`.

**What’s inside:** Names, problem/solution copy, what’s included, and **setup + monthly** pricing for the five flagships:

* Local Business Growth
* E-Commerce Accelerator
* Thought Leadership & Brand Authority
* Event & Launch Domination
* Digital Transformation Starter

**How we’ll use it (now):**

* These 5 map **1:1** to SSOT `Bundle` objects (`slug`, `title`, `subtitle/summary`, `price?`, `includes?`, `tags/category`).
* MDX front-matter can override **hero lede/image/SEO**, while **product facts** (price, components, features) live in data.

---

### B) Per-service Menus (Packages, Specialized Packs, Add-Ons)

**Files covered:**

* Content Production packages/add-ons
* Lead Generation packages/add-ons
* Marketing Services packages/add-ons
* SEO Services packages/add-ons
* Video Production packages/add-ons
* Web Development packages/add-ons
* Roll-ups like **Complete Service Packages & Add-Ons**

**What’s inside:** Clear **tiers** (Essential/Professional/Enterprise), specialized packs, and add-ons, each with deliverables and **explicit prices** (one-time, monthly, or hybrid). Many include **integration strategy**, **upsell paths**, and **success metrics**.

**How we’ll use it (now):**

* These become SSOT `ServicePackage` and `AddOn` entries (typed TS authoring).
* Bundles will **reference** these via `components[]` (IDs) and `addOnRecommendations[]` (IDs) so bundle detail pages can render “What’s included” and “Recommended add-ons” from real objects.

---

## 3) Alignment with the current plan (SSOT + pages)

### Canonical Money (pricing) — single truth

We normalize all prices to:

```ts
type Money = { oneTime?: number; monthly?: number; currency?: "USD" };
```

* **One-time projects:** `{ oneTime: 8500 }`
* **Monthly retainers:** `{ monthly: 3500 }`
* **Setup + monthly:** `{ oneTime: 5000, monthly: 2500 }`

> Legacy `price.setup` is mapped to `oneTime` during build. UI already handles missing price (shows “Custom pricing”).

### Data objects we emit

* `Bundle` (5 flagship solutions) — own the `/packages` hub items and each bundle detail page.
* `ServicePackage` (per-service tiers/specialized packs).
* `AddOn` (per-service enhancements).

### Pages & rendering

* **Hub `/packages`**: hero + search/filters + **grid of everything** (Bundles + Service Packages + Add-ons) using `PackageCard`. Optional featured rails. CTA band.
* **Detail `/packages/[bundle]`**: hero + `PriceBlock` + “What’s included” (from `components[]` and/or bullets) + `AddOnsGrid` + “Popular” rail + FAQ + CTA. JSON-LD `Service` with `offers` only when price exists.

(See routing/layouts spec & authoring guide for precise props and adapters.)

---

## 4) SSOT types (the minimum that covers all MD)

```ts
type Money = { oneTime?: number; monthly?: number; currency?: "USD" };
type Deliverable = { label: string; detail?: string };

type Service = "content" | "leadgen" | "marketing" | "seo" | "webdev" | "video";
type Tier = "Essential" | "Professional" | "Enterprise";

export type ServicePackage = {
  id: string;                // stable ID used by bundles/components
  service: Service;
  name: string;
  tier?: Tier;
  summary?: string;
  features?: Deliverable[];  // bullets in cards; full table on detail
  price?: Money;             // one-time and/or monthly
  billingNote?: string;      // “+ ad spend”, “per product line”, etc.
  category?: string;         // for grouping & filters
  tags?: string[];
  popular?: boolean;
  badges?: string[];         // “Most Popular”, etc.
};

export type AddOn = ServicePackage & { kind: "addon" };

export type Bundle = {
  slug: string;              // “local-business-growth”
  title: string;
  subtitle?: string;
  summary?: string;
  category?: string;         // “local”, “ecommerce”, “b2b”, “startup”, “custom”
  tags?: string[];           // “seo”, “video”, …

  price?: Money;             // optional (custom pricing supported)
  includes?: Array<{ title?: string; items: string[] }>; // human bullets
  components?: string[];     // IDs of ServicePackage to show as included
  addOnRecommendations?: string[];   // IDs of AddOn to suggest

  outcomes?: Array<{ label: string; value: string }>;
  timeline?: string;
  faq?: { title?: string; faqs: Array<{ id: string; question: string; answer: string }> };

  hero?: {
    content?: { title?: string; subtitle?: string; primaryCta?: {label:string; href:string}; secondaryCta?: {label:string; href:string} };
    background?: { type: "image" | "video"; src: string; alt?: string };
  };
  cardImage?: { src: string; alt?: string };
  isMostPopular?: boolean;
};
```

---

## 5) Mapping: Markdown → SSOT data

| Content you authored in MD                          | Where it lands in SSOT                                              | How it renders                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Bundle names, ledes, what’s included, setup+monthly | `Bundle` (`slug`, `title`, `subtitle/summary`, `price`, `includes`) | **Hub** cards (title, summary, price chips) + **Detail** hero/PriceBlock |
| Service package tiers (features + prices)           | `ServicePackage` entries (by service)                               | Searchable on hub; used in bundle “What’s included” (when referenced)    |
| Specialized packs & add-ons                         | `AddOn` entries                                                     | Searchable; shown on bundle detail under “Recommended add-ons”           |
| Integration strategy, upsell, metrics, QA           | Keep in MDX body; optional excerpts in data `summary`               | “How it works” sections / FAQ on detail or service hubs                  |
| Recommended bundles (service-level)                 | Used for “Popular in this category” rails                           | `PackageCarousel` rails on service pages or bundle detail                |

> Build step associates bundle MDX front-matter (lede/image/seo) to `Bundle.slug` so marketing can tune hero copy/imagery without touching data.

---

## 6) Gaps & fixes (from the review)

1. **Price key drift**
   Some JSON uses `price.setup`. We normalize to `price.oneTime` at build. **Action:** keep authoring in TS with canonical `Money` where feasible.

2. **No explicit relationships between bundles and service packages**
   Bundles list “components” in prose. **Action:** add `components: string[]` with real `ServicePackage.id` values; same for `addOnRecommendations`.

3. **Hub only shows bundles today**
   We want “All / Bundles / Packages / Add-ons” + global search. **Action:** expose `SERVICE_PACKAGES`, `ADDONS`, and `PACKAGES_SEARCH` from the façade; wire `PackagesSection` filters.

4. **Featured needs consistency**
   Per-service featured (3–4) and global `FEATURED_BUNDLE_SLUGS`. **Action:** validate featured IDs exist; use to weight hub and rails.

---

## 7) Build artifacts we rely on

* `__generated__/bundles.enriched.json` — bundles with `components[]` and `addOnRecommendations[]` **resolved** to objects and prices normalized.
* `__generated__/packages.search.json` — flattened index of **bundle | package | addon** used by hub search/filters.
* `__generated__/content.map.json` — MDX front-matter & paths keyed by `bundle.slug`.

*(See “Authoring & Implementation Guide” for build/validate scripts.)*

---

## 8) Where each thing shows up (final UI wiring)

### Hub `/packages`

* **Hero:** ServiceHero
* **Search/Filters:** PackagesSection (Type, Service, Sort, Search)
* **Grid:** PackageGrid (cards for Bundles + Packages + Add-ons)
* **Featured rails (optional):** PackageCarousel
* **CTA band:** GrowthPackagesCTA
* **SEO:** ItemList JSON-LD (bundles)

### Bundle `/packages/[bundle]`

* **Hero + PriceBlock** (uses guarded `price`)
* **What’s included:** from `includes` + expanded `components[]`
* **Recommended add-ons:** AddOnsGrid from `addOnRecommendations[]` (fallback: featured by dominant service)
* **Popular rail:** PackageCarousel
* **FAQ:** FAQAccordion
* **CTA band:** GrowthPackagesCTA
* **SEO:** Service JSON-LD with `offers` only if price exists

---

## 9) Action items (from MD → live pages)

* [ ] Normalize any `setup` → `oneTime` in TS authoring (build also maps).
* [ ] For each bundle, add `components[]` and `addOnRecommendations[]` using **real IDs** from service packages/add-ons.
* [ ] Ensure each service package/add-on has: `id`, `service`, `name`, `features[]`, `price?` (Money), `category/tags?`.
* [ ] Run `packages:build` to emit `__generated__` artifacts.
* [ ] Wire hub to pass **all three lists** + **search index** to `PackagesHubTemplate`.
* [ ] Verify bundle detail shows: hero + price, includes, resolved components, recommended add-ons, popular rail, FAQ.
* [ ] Confirm JSON-LD emits `offers` only when price exists (adapters already patched).

---

## 10) Why this fits B2B pricing realities

* Supports **project**, **retainer**, and **hybrid** without branching types.
* Keeps **marketing copy** in MDX; keeps **product facts** in typed data.
* Build emits normalized, fast JSON the app consumes; adapters are **null-safe** so pages don’t crash when pricing is omitted or custom.

---

*End of document.*

