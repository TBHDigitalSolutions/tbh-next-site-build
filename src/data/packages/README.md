# TBH Digital Solutions — Package System

Complete, type-safe data layer for **service packages**, **add-ons**, **featured rails**, and **cross-service (Growth) bundles**. This folder is the **SSOT** (single source of truth) your pages, search, and CMS-like utilities import from.

---

## 📁 Directory Map (Production)

```
src/data/packages
├─ __generated__/                       # Build artifacts (optional; safe to git-commit)
│  ├─ bundles.enriched.json            # Bundles with attached compiled content (HTML)
│  ├─ content.map.json                 # Slug → compiled content metadata (if used)
│  └─ packages.search.json             # Search index (bundles + docs)
│
├─ _adapters/
│  └─ normalize.ts                     # Normalizers (raw JSON → canonical SSOT)
│
├─ _types/
│  ├─ currency.ts                      # UI currency helpers (toCombinedPrice, etc.)
│  ├─ domain.ts                        # Canonical domain entities (SSOT)
│  ├─ generated.ts                     # Types for build artifacts in __generated__
│  ├─ packages.types.ts                # Authoring + presentation types (facade)
│  └─ primitives.ts                    # Low-level primitives/shared types
│
├─ _utils/
│  ├─ ids.ts                           # ID helpers (kebab, makeAddOnId, validators)
│  ├─ index.ts                         # Barrel re-export (utils)
│  └─ slugs.ts                         # Canonical service slugs + name/description helpers
│
├─ _validators/
│  ├─ packages.validate.ts             # Cross-ref checks (IDs, pricing, featured, deps)
│  └─ schema.ts                        # Zod schemas for SSOT types
│
├─ Services/                           # Service packages (per service, many leaf packages)
│  ├─ content-production/              # e.g., copywriting-packages/content-copy-*
│  ├─ lead-generation/
│  ├─ marketing-services/
│  ├─ seo-services/
│  ├─ video-production/
│  └─ web-development/
│
├─ add-ons/                            # Add-on arrays per service
│  ├─ content-production-add-ons/
│  ├─ lead-generation-add-ons/
│  ├─ marketing-add-ons/
│  ├─ seo-add-ons/
│  ├─ video-production-add-ons/
│  └─ web-development-add-ons/
│
├─ bundles/                            # Optional: per-service “bundle kits” (not cross-service)
│  ├─ content-production-bundles/
│  ├─ lead-generation-bundles/
│  ├─ marketing-bundles/
│  ├─ seo-bundles/
│  ├─ video-production-bundles/
│  └─ web-development-bundles/
│
├─ CrossService/                       # ✅ Canonical Growth bundles (standalone files)
│  ├─ digital-transformation-starter.ts
│  ├─ ecommerce-accelerator.ts
│  ├─ event-launch-domination.ts
│  ├─ local-business-growth.ts
│  ├─ thought-leadership-authority.ts
│  └─ index.ts                         # Exports CROSS_SERVICE_BUNDLES (alias: CrossServicePackage[])
│
├─ Featured/                           # Featured bundle slugs per service
│  ├─ content-production-featured/
│  ├─ lead-generation-featured/
│  ├─ marketing-featured/
│  ├─ seo-featured/
│  ├─ video-production-featured/
│  └─ web-development-featured/
│
├─ Under1kSKUs/                        # Optional: under-$1K spotlight slices per service
│  ├─ content-production-under-1k/
│  ├─ lead-generation-under-1k/
│  ├─ marketing-under-1k/
│  ├─ seo-under-1k/
│  ├─ video-production-under-1k/
│  └─ web-development-under-1k/
│
├─ addOns.json                         # (Optional) authored JSON; normalized by _adapters
├─ bundles.json                        # (Optional) authored JSON; normalized by _adapters
├─ featured.json                       # (Optional) authored JSON; normalized by _adapters
├─ packages.json                       # (Optional) consolidated output (legacy/exports)
│
├─ index.ts                            # 🚪 Main facade (ALL_* arrays, maps, selectors)
├─ recommendations.ts                  # “Recommended” rails helpers (optional)
├─ integrated-growth-packages.ts       # Legacy bridge → CrossService (kept for back-compat)
└─ README.md                           # This file
```

> **Alias & directory decision**
>
> * Cross-service bundles live in `src/data/packages/CrossService/`.
> * Their presentation type alias is **`CrossServicePackage`** (internally the same as `PackageBundle`).

---

## 🎯 Core Concepts

### Service Categories (6)

* **Content Production** (`content`) — Strategy, copy, design, and content ops
* **Lead Generation** (`leadgen`) — Funnels, magnets, attribution, conversion
* **Marketing Services** (`marketing`) — Paid, lifecycle, and growth ops
* **SEO Services** (`seo`) — Technical + content SEO for compounding organic reach
* **Video Production** (`video`) — Promo, social, training, and UGC kits
* **Web Development** (`webdev`) — Sites, apps, and conversion-first builds

### Package Tiers

Standard merchandising:

* **Essential** — fundamentals / starter
* **Professional** — expanded scope for growing teams
* **Enterprise** — premium/complex programs

> Some leaf packages are **specialized** (no strict tier). The types allow `tier` to be optional.

### Offering Types

* **Service Packages** — leaf offerings inside `Services/<service>/**`
* **Add-Ons** — attachable enhancements inside `add-ons/<service>-add-ons/**`
* **Featured** — curated bundle slugs per service (3 recommended)
* **Bundles (service)** — optional, per-service kits (not cross-service)
* **Cross-Service (Growth) Bundles** — 5 canonical multi-service accelerators in `CrossService/`

**Growth Bundles (canonical 5)**

* Local Business Growth — $12,500 setup + $2,500/mo
* Digital Transformation Starter — $30,000 setup + $7,500/mo
* E-Commerce Accelerator — $18,000 setup + $4,000/mo
* Thought Leadership & Brand Authority — $15,000 setup + $5,000/mo
* Event & Launch Domination — $25,000 setup + $6,000/mo

---

## 📊 Data Conventions

### Money

* Use **numbers only** at authoring time; no “$”, commas, or strings.
* Canonical shape is `{ oneTime?: number; monthly?: number; currency?: "USD" }`.
* UI formatting lives in `_types/currency.ts`:

  * `formatCurrency(…)`, `toMonthlyPrice(…)`, `toOneTimePrice(…)`, `toCombinedPrice(…)`, `toStartingPrice(…)`.

```ts
// ✅ Correct
price: { oneTime: 2500, monthly: 1200, currency: "USD" }

// ❌ Wrong
price: { setup: "$2,500", monthly: "$1,200" }
```

> If your source uses `setup`, the normalizer maps it to `oneTime`.

### IDs & Slugs

* **Kebab-case** only: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`
* Prefix IDs with service where appropriate: `seo-professional`, `content-copy-essential`.
* Helpers in `_utils/ids.ts`: `kebab`, `makeAddOnId`, service extraction & validators.
* Canonical service slugs:

  ```ts
  "content" | "leadgen" | "marketing" | "seo" | "webdev" | "video"
  ```

---

## 🧱 Authoring: Leaf Package Anatomy

A leaf package folder (example):

```
Services/content-production/copywriting-packages/content-copy-professional/
├─ index.ts        # default export ServicePackage
├─ includes.ts     # what’s included (structured bullets)
├─ outcomes.ts     # expected results / stats block
├─ faqs.ts         # Q&A block (optional)
├─ narrative.ts    # optional HTML/MDX compiled content (attached in build)
└─ bundle.ts       # (optional) prebuilt presentation bundle for older pages
```

> Each leaf exports a **`ServicePackage`**. The service index composes them into one array.

---

## 🧩 Cross-Service (Growth) Bundles

* Each bundle is a **standalone `.ts`** in `CrossService/` exporting a `PackageBundle`.
* `CrossService/index.ts` collects them into **`CROSS_SERVICE_BUNDLES`** and exports helpers:

  * `getCrossServiceBundleBySlug(slug)`
  * `searchCrossServiceBundles(query)`
  * `CROSS_SERVICE_FEATURED_SLUGS`

> The legacy file `integrated-growth-packages.ts` is kept as a **bridge** that re-exports from `CrossService/` for backward compatibility in older pages/components. New code should import from the **facade** (`src/data/packages/index.ts`) or `CrossService/index.ts`.

---

## 🗂 Facade: What `index.ts` Exposes

* **Bundles**

  * `SERVICE_BUNDLES` — per-service kits (if used)
  * `GROWTH_BUNDLES` — cross-service, from `CrossService/`
  * `ALL_BUNDLES`, `BUNDLES_BY_ID`, `BUNDLES_BY_SLUG`
  * `getBundleBySlug`, `getBundleById`
* **Packages**

  * `SERVICE_PACKAGES` — by service
  * `ALL_PACKAGES`, `PACKAGES_BY_ID`, `getPackageById`
* **Add-Ons**

  * `SERVICE_ADDONS` — by service
  * `ALL_ADDONS`, `ADDONS_BY_ID`, `getAddOnById`
* **Featured**

  * `FEATURED_BUNDLE_SLUGS` — combined curated slugs per service
* **Under-$1K**

  * `UNDER_1K_PACKAGE_IDS`, `UNDER_1K_PACKAGES`
* **Catalog**

  * `CATALOG_ITEMS` — union of bundles + packages (for one list route)

---

## 🔎 Search & Build Artifacts (`__generated__/`)

These files are optional but recommended for fast search and richer bundle pages:

* `__generated__/bundles.enriched.json` — bundles with attached compiled page content.
* `__generated__/content.map.json` — slug → compiled content metadata.
* `__generated__/packages.search.json` — unified search index (bundles + docs).

### Typical build (examples)

Depending on your script setup:

```bash
# If you’re using the JSON+enrichment pipeline:
npm run data:build
# or the split steps:
npm run data:catalog && npm run data:enrich && npm run data:search

# Content production indexing (if you adopted the bash helpers):
npm run data:content:gen && npm run data:content:check
```

> The facade (`index.ts`) prefers enriched data when present; otherwise it falls back to authored headers/TS modules.

---

## 🧪 Validation

* **Schema** checks: `_validators/schema.ts` (Zod) for authoring shapes.
* **Cross-ref** checks: `_validators/packages.validate.ts`

  * Unique IDs
  * ID format & service prefix
  * Numeric pricing sanity
  * Featured references exist
  * Tier coverage warnings
  * Add-on dependency existence
  * Pairs-best-with validity

Example:

```ts
import { validatePackages, validateBundles } from "@/data/packages/_validators/packages.validate";
import { SERVICE_PACKAGES, GROWTH_BUNDLES } from "@/data/packages";

const all = Object.values(SERVICE_PACKAGES).flat();
validatePackages(all);

const byId = Object.fromEntries(all.map(p => [p.id, p]));
validateBundles(GROWTH_BUNDLES, byId);
```

Run your project’s validation scripts (see `package.json`) before committing.

---

## 🧭 Routing Recommendations

* `/packages` — **grid of all packages & bundles** (cards). Clicking a bundle card routes to details.
* `/details/[slug]` (recommended) or `/bundles/[slug]` — **bundle details** page (uses `getBundleBySlug`).
* `/packages/[service]` — per-service package listings (uses `SERVICE_PACKAGES[service]`).
* Use `FEATURED_BUNDLE_SLUGS` to drive homepage/service rails.

> The “packages page → bundle details page” pattern is supported out-of-the-box by the facade exports above.

---

## ✍️ Marketing Copy Guidelines

* **Lead with outcomes;** features support the outcome.
* Use specific metrics when available.
* Keep technical jargon minimal; prefer clarity over cleverness.
* Featured headlines: benefit-driven, 6–8 words, action-oriented.
* Add-ons: state **when/why**, any **dependencies**, **timeline**, and **ROI**.

---

## ✅ Readiness Checklists

### Data Quality

* [ ] Kebab-case IDs; correct service prefix
* [ ] Numeric pricing only; currency formatting in UI
* [ ] No duplicate IDs across packages/add-ons/bundles
* [ ] Featured slugs resolve to real bundles (3 per service recommended)
* [ ] Add-on dependencies resolve

### Content & Bundles

* [ ] Clear outcomes, deliverables, and SLAs where applicable
* [ ] Cross-service bundles list included services and CTAs
* [ ] Pricing labels use `_types/currency.ts` helpers

### Build & CI

* [ ] TypeScript compiles
* [ ] Validators pass
* [ ] (If used) `__generated__` artifacts up to date
* [ ] Search index built for production

---

## 📊 Stats (typical)

* **Services:** 6
* **Packages:** 3+ per service (plus specialized)
* **Add-Ons:** 3–6 per service
* **Featured per service:** 3 recommended
* **Cross-Service Bundles:** 5 canonical

---

## 🤝 Ownership

* **Tech/Data:** Development
* **Copy & Positioning:** Marketing
* **Pricing & Packaging:** Leadership/Sales (approval required)
* **Review cadence:** Monthly (pricing/copy badges), Quarterly (bundles/featured)

---

**Last updated:** January 2025
**Maintained by:** TBH Digital Solutions — Development
**Version:** 2.0 (Production-ready)
