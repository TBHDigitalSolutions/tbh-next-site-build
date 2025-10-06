# Utils README

> Location: `src/packages/lib/types/readme.md`
> Focus of this doc: **how to use the utility modules** in `src/packages/lib/utils/*` from components, pages, and build scripts. These helpers are **framework-agnostic**, typed, and safe for SSG/RSC.

---

## Why these utils exist

Your app has a single source of truth (SSOT) for package content (the runtime schema in `package-schema.ts`). UIs and build tasks repeatedly need the same, small behaviors:

* consistent **copy/labels** (`copy.ts`)
* a single place for **CTA policy & routes** (`cta.ts`)
* **pricing** normalization/formatting without UI imports (`pricing.ts`)
* SEO-friendly **JSON-LD** builders that return plain objects (`jsonld.ts`)

These live under `src/packages/lib/utils` to keep logic **pure**, **portable**, and **easy to test**.

```
components / pages / scripts
          ↓ (import)
     src/packages/lib/utils/*
          ↑ (types only, no React)
     src/packages/lib/types (UI-only type barrel)
          ↑ (runtime types)
     package-schema.ts (SSOT)
```

---

## What goes where (quick map)

* `utils/copy.ts`
  **Values** and tiny helpers for shared copy strings (CTA labels, price base-note) and accessible aria labels.

* `utils/cta.ts`
  **CTA builders** for cards and detail sections, and canonical **routes**. Keeps the “which CTA where?” policy in one place.

* `utils/pricing.ts`
  **Pure pricing helpers**: normalize to a single `Money` shape, test price variants (hybrid / monthly-only / one-time-only), and format for humans & screen readers.

* `utils/jsonld.ts`
  **Plain object** builders for Schema.org **ItemList** (hubs) and **Service** (package detail, with Offers when priced). Caller decides how/where to inject.

> Tip: All of these import **types only** (from `@/packages/lib/types` and the runtime schema) and export **no React** code.

---

## How to consume (by surface)

### Cards & grids

* Use `cta.cardCtas(slug)` for primary/secondary CTAs.
* Use `pricing.normalizeMoney(pkg.price)` before formatting.
* Use `pricing.startingAtLabel(...)` or craft your own with `formatMoney(...)`.
* For aria labels, pass `copy.ariaViewDetailsFor(pkg.name)`.

```ts
import { cardCtas } from "@/packages/lib/utils/cta";
import { normalizeMoney, startingAtLabel } from "@/packages/lib/utils/pricing";
import { ariaViewDetailsFor } from "@/packages/lib/utils/copy";

const { primary, secondary } = cardCtas({ slug: pkg.slug, title: pkg.name });
const money = normalizeMoney(pkg.price);
const teaser = startingAtLabel(money); // "Starting at $X/mo …"
const aria = ariaViewDetailsFor(pkg.name);
```

### Detail pages (Price band, CTA section)

* Use `cta.sectionCtas(pkg.name)` for Request Proposal + Book a call.
* Use `pricing` predicates to choose layout if your component needs it.

```ts
import { sectionCtas } from "@/packages/lib/utils/cta";
import { isHybrid, isOneTimeOnly, formatMoney } from "@/packages/lib/utils/pricing";

const { primary, secondary } = sectionCtas(pkg.name);
const variant = isHybrid(pkg.price) ? "detail-hybrid" : "detail-oneTime";
const priceLabel = isOneTimeOnly(pkg.price)
  ? formatMoney(pkg.price!.oneTime!, pkg.price!.currency)
  : formatMoney(pkg.price!.monthly!, pkg.price!.currency);
```

### SEO / JSON-LD (hubs & details)

```ts
import { buildItemListJsonLd, buildServiceJsonLd, safeStringify } from "@/packages/lib/utils/jsonld";

// Hub
const listJson = buildItemListJsonLd(
  items.map(i => ({ name: i.name, url: `/packages/${i.slug}` }))
);

// Detail
const serviceJson = buildServiceJsonLd(pkg);

// Inject (Next.js example - App Router head.tsx)
export default function Head() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeStringify(listJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeStringify(serviceJson) }} />
    </>
  );
}
```

---

## API reference (concise)

### `utils/copy.ts`

* `CTA` / `CTA_LABEL`
  String tokens: `VIEW_DETAILS`, `BOOK_A_CALL`, `REQUEST_PROPOSAL`.

* `BASE_NOTE`
  `{ proposal: "Base price — request proposal", final: "Base price — final after scope" }`.

* `BADGE`
  `"STARTING AT"` — style casing in CSS if desired.

* A11y helpers

  * `ariaViewDetailsFor(title?)`
  * `ariaBookCallAbout(title?)`
  * `ariaRequestProposalFor(title?)`

> Use these in components when you’re not supplying custom `aria-label`s.

---

### `utils/cta.ts`

* `ROUTES`

  * `package(slug)` → `/packages/[slug]`
  * `book` → `/book`
  * `contact` → `/contact`

* `cardCtas(slug | { slug, title? }, overrides?)` → `{ primary, secondary }`
  Primary = View details → `/packages/[slug]`
  Secondary = Book a call → `/book`

* `sectionCtas(title?, overrides?)` → `{ primary, secondary }`
  Primary = Request proposal → `/contact`
  Secondary = Book a call → `/book`

* `ctasForPackage(pkg, { surface: "card" | "detail", overrides? })`
  Convenience to pick the policy based on surface.

> **Override support:** pass `{ primary: { href, label }, secondary: … }` to tweak instance-specific CTAs without changing policy.

---

### `utils/pricing.ts`

* **Normalization:**
  `normalizeMoney(price | legacy)` → `Money | undefined`
  Accepts `{ oneTime?, monthly?, currency? }` or legacy `{ setup, monthly }`.

* **Predicates:**
  `hasPrice`, `hasMonthly`, `hasOneTime`, `isHybrid`, `isOneTimeOnly`, `isMonthlyOnly`.

* **Formatting:**
  `formatMoney(amount, currency?, locale?, options?)`
  `srPriceSentence(price, { prefix?, locale? })` → screen-reader text
  `startingAtLabel(price, locale?)` → short teaser string

> **i18n:** pass a `locale` (e.g., `"en-GB"`). Unknown currency codes fall back to a safe string.

---

### `utils/jsonld.ts`

* `buildItemListJsonLd([{ name, url }, …])` → POJO ItemList
* `buildServiceJsonLd(pkg)` → POJO Service (+ `offers` if `pkg.price` present)
* `safeStringify(obj)` → JSON string safe for `<script>` injection (escapes `<`)

> **No JSX** is emitted; you decide how to include the JSON-LD.

---

## Components & scripts that should use these

* **Cards / Grids**

  * Components: `PackageCard`, `PackageGrid`, “Rail” cards
  * Use: `cta.cardCtas`, `pricing.startingAtLabel`, `copy.ariaViewDetailsFor`

* **Price band / CTA band**

  * Component: `PriceActionsBand` (or equivalent)
  * Use: `cta.sectionCtas`, `pricing.formatMoney` + predicates

* **Detail pages**

  * Section: Overview / Hero / Right rail
  * Use: `pricing` for display & a11y, `cta.sectionCtas` for actions

* **SEO & Build/SSG**

  * Next.js `head.tsx`/`Head` or route handlers
  * Use: `jsonld.buildItemListJsonLd`, `jsonld.buildServiceJsonLd`, `jsonld.safeStringify`

* **Scripts / CLI**

  * Reporting or static page generation
  * Use: `pricing.normalizeMoney` and predicates to summarize catalogs

---

## Do’s & Don’ts

**Do**

* Keep UI copy in `utils/copy.ts`; pull labels from there.
* Use `cta.ts` to centralize CTA routing/policy.
* Normalize prices with `pricing.normalizeMoney` before formatting.
* Return JSON-LD **objects** and inject them where appropriate.

**Don’t**

* Hardcode CTA labels/routes in components.
* Perform price math/logic in JSX.
* Emit JSX from JSON-LD builders.
* Import React or component modules into these utils.

---

## Migration guide

Replace legacy imports with the new paths:

| Old import                              | New import                     |
| --------------------------------------- | ------------------------------ |
| `@/packages/lib/cta`                    | `@/packages/lib/utils/cta`     |
| `@/packages/lib/jsonld` or `jsonld.tsx` | `@/packages/lib/utils/jsonld`  |
| `@/packages/lib/pricing`                | `@/packages/lib/utils/pricing` |
| Hardcoded copy strings                  | `@/packages/lib/utils/copy`    |

---

## Testing tips

* **Unit tests**: treat each util as a pure function module.

  * `pricing`: predicate tables and locale snapshots.
  * `cta`: ensure aria labels include title and routes are correct.
  * `jsonld`: deep-equal against schema fragments; assert `offers` presence/absence.
  * `copy`: a11y helpers trim/compose properly.

* **No mocking** needed; everything is deterministic and side-effect free.

---

## FAQ

**Q: Where do I change CTA wording?**
A: In `utils/copy.ts` (`CTA` object). Builders in `cta.ts` pick from there.

**Q: Can I add analytics attributes to CTAs?**
A: Builders expose `dataCta: "primary" | "secondary"`. Extend in your button/link component.

**Q: How do I localize pricing strings?**
A: Pass a `locale` to `formatMoney`, `srPriceSentence`, or `startingAtLabel`. Swap copy values in `utils/copy.ts` per locale.

**Q: Why JSON-LD returns POJOs instead of JSX?**
A: To keep the module usable in any environment (RSC/SSR/CLI). You control injection. Use `safeStringify` when embedding in `<script>`.

---

**Owner:** Frontend Platform / Design Systems
**Change surface:** Low (pure helpers). Breaking changes require a minor version bump and PR to update component imports.
