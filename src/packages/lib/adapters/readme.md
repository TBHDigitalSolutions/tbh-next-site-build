Here’s a drop-in README you can place at:

`src/packages/lib/adapters/readme.md`

---

# Adapters: SSOT → UI View-Models

> **Files**
>
> * `src/packages/lib/adapters/index.ts` — general adapters (cards, grids, price blocks, includes, add-ons, JSON-LD, hub/detail composites).
> * `src/packages/lib/adapters/growth.ts` — Growth-section specific mapping & selection utilities.

These adapters convert your **Single Source of Truth (SSOT)** domain objects into **small, framework-agnostic view-models** that UI components can consume without importing app code or React.

They are **pure, deterministic, and typed**:

* No I/O, no React, no global state
* Inputs: your domain types (e.g., `PackageBundle`, `Price`)
* Outputs: small POJOs that mirror component prop shapes (kept locally to avoid runtime coupling)

---

## Why this layer exists

* **Separation of concerns.** Domain validation & persistence happen in schemas and loaders. Adapters do **shape conversion only**.
* **Component de-coupling.** We define local prop **types** so this library never imports component modules at runtime.
* **Predictable UI.** Pure, stable functions make server/SSG usage trivial and testable.

```
Registry (content.generated.json)
        │
        ▼
validate with parsePackage (package-schema.ts)     <-- SSOT contracts
        │
        ▼
   Domain types (PackageBundle, Price, …)
        │
        ▼
   adapters/index.ts, adapters/growth.ts           <-- you are here
        │
        ├─► list/grid cards, price blocks, includes
        ├─► growth section view-models
        └─► JSON-LD helpers
```

---

## When to use which file?

| File                     | Use it for                                                                                                      | Typical consumers                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **`adapters/index.ts`**  | Cards/grids, price blocks, includes tables, add-on cards, item/service JSON-LD, and hub/detail composite models | Catalog pages, package detail pages, add-on galleries, marketing pages, scripts that need lightweight view-models |
| **`adapters/growth.ts`** | “Growth Packages” surface: concise bullets, simple pricing, featured/top-N selection per service                | Home/landing “Growth” sections, email fragments, simple carousel selections                                       |

---

## Inputs & minimal types

Adapters expect **domain** types from `../types/types`. Most codebases already export these:

```ts
type Price = { monthly?: number | null; oneTime?: number | null; currency?: string };
type PackageInclude = { section: string; items: string[] };
type PackageBundle = {
  slug: string;
  name: string;
  description?: string;
  price: Price;
  services?: string[];
  includes?: PackageInclude[];
  isMostPopular?: boolean;
  // optionally: timeline?: string
};
```

> Don’t pass raw MDX/frontmatter to adapters. Build/validate first (e.g., with `parsePackage` / loaders), or map to `PackageBundle` using your content pipeline.

---

## API Overview

### General adapters (`adapters/index.ts`)

| Function                                      | Input                            | Output                                | Notes                                                                                       |
| --------------------------------------------- | -------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `toPackageCard(bundle, opts?)`                | `PackageBundle`                  | `PackageCardAdapter`                  | Flattens includes → features (limit), chooses default CTAs, optional footnote from timeline |
| `toPackageGridItems(bundles, opts?)`          | `PackageBundle[]`                | `PackageGridItemAdapter[]`            | Adds `weight`/`highlight` for featured slugs                                                |
| `toPriceBlock(bundle, opts?)`                 | `PackageBundle`                  | `PriceBlockAdapter`                   | Leaves most formatting to UI; minimal Intl fallback used only by add-ons                    |
| `toIncludesTable(bundle, opts?)`              | `PackageBundle`                  | `{ sections: PackageInclude[], ... }` | For accordion/table components (title/search/collapsible toggles)                           |
| `toAddOnCardProps(addOn, locale?)`            | `AddOnDomain`                    | `AddOnCardProps`                      | Creates a concise add-on card model with tolerant price label                               |
| `toAddOnCardList(addOns, locale?)`            | `AddOnDomain[]`                  | `AddOnCardProps[]`                    | Bulk map                                                                                    |
| `toAddOnsGrid(addOns, {categories?, query?})` | `AddOnAdapter[]`                 | `AddOnAdapter[]`                      | Simple filter/search utility                                                                |
| `toItemListJsonLd(items)`                     | `{ slug, name, detailsHref? }[]` | JSON-LD object                        | List schema for SEO                                                                         |
| `toServiceOfferJsonLd(bundle)`                | `PackageBundle`                  | JSON-LD object                        | Service + Offer schema if price exists                                                      |
| `toHubModel(bundles, opts?)`                  | `PackageBundle[]`                | `{ grid, jsonLd? }`                   | Quick model for hub/cat pages                                                               |
| `toDetailModel(bundle, opts?)`                | `PackageBundle`                  | `{ card, price, includes, jsonLd? }`  | Detail page composite model                                                                 |

**Options (selected):**

* Card/Grid: `{ featureLimit?, detailsHref?, footnoteFromTimeline?, highlightMostPopular?, badgeFromMostPopular?, withBookCall?, primaryLabel?, secondaryLabel?, featuredSlugs?, weightFeatured? }`
* Price: `{ title?, enableBillingToggle?, annualDiscountPercent?, showSetup?, unitLabel?, caption?, note?, jsonLd?, primary?, secondary? }`
* Includes: `{ title?, enableSearch?, collapsible?, initiallyOpenCount?, dense?, printExpandAll? }`

### Growth adapters (`adapters/growth.ts`)

| Function                                                          | Input                         | Output            | Notes                                           |
| ----------------------------------------------------------------- | ----------------------------- | ----------------- | ----------------------------------------------- |
| `bundleToGrowthPackage(bundle, opts?)`                            | `PackageBundle`               | `GrowthPackage`   | Sanitizes bullets, clamps price, optional badge |
| `mapBundlesToGrowthPackages(bundles, opts?)`                      | `PackageBundle[]`             | `GrowthPackage[]` | Sorting: name/price/featuredThenName/none       |
| `selectBySlugs(bundles, slugs, opts?)`                            | `PackageBundle[]`, `string[]` | `GrowthPackage[]` | Keeps requested order                           |
| `topNForService(bundles, serviceSlug, n?, opts?)`                 | `PackageBundle[]`             | `GrowthPackage[]` | Simple service matching: any/all + normalize fn |
| `featuredOrTopN(bundles, featuredSlugs?, serviceSlug, n?, opts?)` | …                             | `GrowthPackage[]` | Prefer featured; fallback to top-N              |
| `sortGrowthPackages(items, mode?, featuredSlugs?)`                | `GrowthPackage[]`             | `GrowthPackage[]` | Reusable sorter for already-mapped items        |

**Growth options:**
`{ featuresLimit?, dedupeFeatures?, featuredSlugs?, badgeFromMostPopular?, normalizeServiceSlug?, serviceMatch?, sort? }`

---

## Quick starts

### 1) Catalog grid page (cards, optional weighted featured)

```ts
import { toPackageGridItems } from "@/packages/lib/adapters";
import { loadAllPackages } from "@/packages/lib/registry/loader";

export default async function Catalog() {
  const { items } = await loadAllPackages();
  const bundles = items.map(({ data }) => ({
    slug: data.slug,
    name: data.name,
    description: data.summary,
    price: data.price,
    services: [data.service],
    includes: (data.includes ?? []).map(g => ({ section: g.title, items: g.items.map(it => typeof it === "string" ? it : it.label) })),
    isMostPopular: data.badges?.includes("Most Popular"),
  }));

  const grid = toPackageGridItems(bundles, { featuredSlugs: ["pro-seo", "growth-bundle"] });
  // render <PackageGrid items={grid} />
}
```

### 2) Package detail page (composite)

```ts
import { toDetailModel } from "@/packages/lib/adapters";
import { loadBySlugAcrossServices } from "@/packages/lib/registry/loader";

export default async function PackageDetail({ params: { slug } }) {
  const rec = await loadBySlugAcrossServices(slug);
  if (!rec) return notFound();

  const bundle = {
    slug: rec.data.slug,
    name: rec.data.name,
    description: rec.data.summary,
    price: rec.data.price,
    services: [rec.data.service],
    includes: (rec.data.includes ?? []).map(g => ({ section: g.title, items: g.items.map(it => typeof it === "string" ? it : it.label) })),
    isMostPopular: rec.data.badges?.includes("Most Popular"),
  };

  const model = toDetailModel(bundle, {
    card: { footnoteFromTimeline: true },
    price: { annualDiscountPercent: 10, showSetup: true },
    includes: { initiallyOpenCount: 2 },
    jsonLd: true,
  });

  // render:
  // <PinnedCard {...model.card} />
  // <PriceBlock {...model.price} />
  // <IncludesTable {...model.includes} />
  // <JsonLd data={model.jsonLd} />
}
```

### 3) Growth section (top-N with featured fallback)

```ts
import { featuredOrTopN } from "@/packages/lib/adapters/growth";
import { loadAllPackages } from "@/packages/lib/registry/loader";

export async function GrowthSection() {
  const { items } = await loadAllPackages();
  const bundles = items.map(({ data }) => ({
    slug: data.slug,
    name: data.name,
    description: data.summary,
    price: data.price,
    services: [data.service],
    includes: (data.includes ?? []).map(g => ({ section: g.title, items: g.items.map(it => typeof it === "string" ? it : it.label) })),
    isMostPopular: data.badges?.includes("Most Popular"),
  }));

  const featured = ["lead-routing-distribution", "crm-automation-starter"];
  const picks = featuredOrTopN(bundles, featured, "lead-generation", 3);
  // render GrowthPackagesSection with `picks`
}
```

### 4) Add-on gallery

```ts
import { toAddOnCardList, toAddOnsGrid } from "@/packages/lib/adapters";

const cards = toAddOnCardList(addOnDomainList, "en-US");
const visible = toAddOnsGrid(cards.map(c => ({
  slug: c.id,
  name: c.title,
  description: c.description ?? "",
})), { query: "analytics" });
```

---

## Implementation details & design decisions

* **No runtime coupling.** All component prop types are **redeclared locally** as minimal view-models. If your design system provides public types, you can swap to imports later.
* **Formatting policy.** Adapters avoid formatting beyond small, necessary cases:

  * Currency labels for add-ons use `Intl.NumberFormat` as a tolerance. Prefer a central pricing formatter for full control.
  * Price blocks expose raw numbers; format in the UI layer.
* **Features from includes.** `toPackageCard` flattens `includes` → `features` (optional limit). Keep bullets short in content for crisp cards.
* **CTAs are not hard-coded business logic.** By default cards use “View details / Book a call”. Override via options (`primaryLabel`, `secondaryLabel`, `detailsHref`).

---

## Anti-patterns (avoid these)

* ❌ Passing **raw MDX/frontmatter** into adapters.
  ✅ Validate and normalize content upstream (e.g., `parsePackage` then map to `PackageBundle` or use your build mapper).

* ❌ Doing price/CTA copy logic inside adapters.
  ✅ Keep copy decisions in your UX copy layer; adapters only expose view-models.

* ❌ Importing component files (React) from adapters.
  ✅ Keep adapters framework-agnostic; only export POJOs.

---

## Testing

Adapters are ideal for **unit tests** & **snapshot tests**:

```ts
import { toPackageCard } from "@/packages/lib/adapters";

test("toPackageCard flattens includes and sets CTAs", () => {
  const card = toPackageCard({
    slug: "seo-starter",
    name: "SEO Starter",
    description: "Get found fast",
    price: { monthly: 1500, currency: "USD" },
    includes: [{ section: "Delivery", items: ["Audit", "On-page fixes"] }],
  } as any);

  expect(card.slug).toBe("seo-starter");
  expect(card.features).toEqual(["Audit", "On-page fixes"]);
  expect(card.primaryCta?.label).toBe("View details");
});
```

* All functions are **pure** → no mocking of globals or I/O.
* Favor snapshot tests for composite `toDetailModel`/`toHubModel`.

---

## Migration guide

| Previous file                       | New file                              | Notes                                                                                      |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/packages/lib/adapters.ts`      | `src/packages/lib/adapters/index.ts`  | General adapters consolidated here (cards/grids/price/includes/add-ons/JSON-LD/composites) |
| `src/packages/lib/bridge-growth.ts` | `src/packages/lib/adapters/growth.ts` | Growth-specific mapping/selection kept isolated and pure                                   |

**Most common replacements:**

* `toPackageCard` → unchanged (now import from `adapters/index`)
* `toPackageGridItems` → unchanged
* `toPriceBlock`/`toIncludesTable` → unchanged
* Growth mapping functions → import from `adapters/growth`

---

## Performance

* All functions are **O(n)** over the array(s) they process; no hidden I/O.
* Sorting helpers copy arrays (`[...list].sort(...)`) to preserve immutability.

---

## Extending safely

* Add new adapter outputs by **extending local view-model types** (do not import component code).
* Add optional fields behind feature flags/options; keep defaults conservative.
* If you need custom CTA policies per surface, expose additional options rather than hard-coding.

---

## FAQ

**Q: Where do I get `PackageBundle` objects?**
A: From your registry loader + a small mapper. Example: map the validated SSOT (`PackageSchemaType`) to `PackageBundle` by copying `slug`, `name`, `summary → description`, `price`, `[service]`, and flattening `includes`.

**Q: Who formats currency labels for cards/price blocks?**
A: Your UI pricing utilities. Adapters expose raw numbers (and minimal labels for add-ons). Keep display rules centralized in your front-end.

**Q: Can I use these on the server during SSG?**
A: Yes. They are synchronous and pure—perfect for `generateStaticParams`, `generateMetadata`, or server components.

---

If you want, I can also add a tiny **`examples/`** folder with runnable snippets (grid, detail, growth) wired against your loader for local dev.
