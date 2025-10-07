Here’s a **production-ready** README for your mappers folder. Drop it in as:

`src/packages/lib/mappers/readme.md`

---

# `@/packages/lib/mappers` — UI-agnostic prop builders

Tiny, pure functions that turn a validated **Package** record (your SSOT) into
props for specific UI surfaces:

* `to-card.ts` → package hub/grid cards
* `to-overview.ts` → detail page overview (left rail + header area)
* `to-extras.ts` → detail page extras (timeline, ethics, FAQs, etc.)

These mappers **do not** import React or UI components. They only reshape data.

---

## Inputs & contracts

* **Input type:** `Package` from `@/packages/lib/package-types`
  (validated by `PackageSchema.parse(...)` before it reaches a mapper).

* **Pricing SSOT:** `pkg.price` (`Money`) — the **only** source of visible price.
  Cards & details derive labels/bands **at render time** using helpers from
  `@/packages/lib/pricing` and policy from `@/packages/lib/band`.

* **Band copy (detail-only):** `pkg.priceBand` (tagline, baseNote, finePrint)
  Mappers pass it **only** to detail surfaces; **never** to cards.

---

## Invariants (anti-drift)

1. **No duplicate price strings in mappers.** Provide `price: Money` only.
   Renderers call `startingAtLabel(price)` or `bandPropsFor("detail", price, priceBand)`.

2. **Cards never receive `priceBand`.** Fine print/base note/tagline live on details.

3. **Features flattening (cards):** At most **5** strings, prioritizing `pkg.features`,
   then falling back to the first `includes` group. (See algorithm below.)

4. **Authoring guard:** `pkg.includes` **or** `pkg.includesTable` must exist
   (already enforced by `PackageSchema`; mapper does not re-validate).

5. **Pure functions.** No IO, no global state, safe for server/RSC/SSG.

---

## Files

### 1) `to-card.ts`

**Purpose:** Build a minimal card model for hub/rails.

**Output:** `CardModel` (UI-agnostic)

Fields:

* Identity/categorization: `slug`, `name`, `summary`, `description`, `service`, `tier`
* Meta: `tags`, `badges`, `image`
* **Pricing:** `price: Money` (SSOT)
* **Compact highlights:** `features: string[]` (max 5)

**Features flattening algorithm:**

1. Take up to `max` items from `pkg.features`, converting union types to strings.
2. If still under `max`, take items from the **first** `pkg.includes[0].items`.
3. Stop at `max` (default 5).

**Never** include `priceBand` on cards.

**Example (hub):**

```ts
import base from "@/packages/registry/seo/featured-snippet/base";
import { toCard } from "@/packages/lib/mappers/to-card";
import PackageCard from "@/packages/components/PackageCard";

const card = toCard(base);
// In your component:
<PackageCard
  variant="default"
  slug={card.slug}
  name={card.name}
  summary={card.summary}
  image={card.image}
  price={card.price}         // UI renders band/label from Money at runtime
  features={card.features}
/>
```

---

### 2) `to-overview.ts`

**Purpose:** Build props for the **detail overview** surface.

**Output:** `PackageDetailOverviewProps` (UI-agnostic)

Key fields:

* Identity & meta: `id`, `slug`, `title`, `service`, `tier`, `tags`, `badges`
* Hero: `summary`, `description`, `image`
* **Pricing:** `price: Money`
* **Detail-only band copy:** `priceBand` (passed through; UI resolves base note text)
* Narrative (compiled MDX): `purposeHtml`
* Why: `painPoints`, `icp`, `outcomes`
* What: `features`, `includes`, `includesTable`, `deliverables`

**Example (detail page, left column band):**

```tsx
import base from "@/packages/registry/seo/featured-snippet/base";
import { toOverview } from "@/packages/lib/mappers/to-overview";
import { bandPropsFor } from "@/packages/lib/band";
import PriceActionsBand from "@/packages/sections/PackageDetailOverview/parts/PriceActionsBand";

const o = toOverview(base);
const band = bandPropsFor("detail", o.price, o.priceBand);

<>
  {/* Headline + summary derived from `o` */}
  <PriceActionsBand
    {...band}
    // CTAs supplied by page policy or registry mappers:
    ctaPrimary={{ label: "Request proposal", href: "/contact" }}
    ctaSecondary={{ label: "Book a call", href: "/book" }}
  />
</>
```

---

### 3) `to-extras.ts`

**Purpose:** Build props for the **extras** section on detail pages.

**Output:** `PackageDetailExtrasProps`

Fields:

* `timeline` (setup/launch/ongoing)
* `requirements`, `ethics`, `limits`, `notes`
* `faqs`
* `relatedSlugs`, `addOnRecommendations`

**Example:**

```ts
import base from "@/packages/registry/seo/featured-snippet/base";
import { toExtras } from "@/packages/lib/mappers/to-extras";

const extras = toExtras(base);
// Pass to your Extras component
```

---

## Usage patterns

### Cards (with band on cards)

```tsx
import { toCard } from "@/packages/lib/mappers/to-card";
import { resolveBandVariant } from "@/packages/lib/band";
import PriceActionsBand from "@/packages/sections/PackageDetailOverview/parts/PriceActionsBand";

const c = toCard(pkg);
const variant = resolveBandVariant("card", c.price);

<PackageCard
  variant="default"
  slug={c.slug}
  name={c.name}
  summary={c.summary}
  price={c.price}
  // Card band (no copy on cards)
  priceFlavor="band"
  priceVariant={variant === "card-hybrid" ? "card-hybrid" : "card-oneTime"}
/>
```

### Cards (legacy one-line label)

```tsx
import { startingAtLabel } from "@/packages/lib/pricing";
const c = toCard(pkg);
<PackageCard priceFlavor="label" price={c.price} />
// Internally uses startingAtLabel(c.price)
```

---

## Error handling & edge cases

* **Missing price:** Mappers pass through `price` as given; UI should branch on
  absence of `price` and hide the band/label.
* **Features:** If both `features` and `includes` are empty, `features: []` is returned.
* **Images:** `image` is optional; UI should fall back to a service icon.
* **Outcomes:** `to-overview` returns `outcomes ?? []`; UI can hide the list.

---

## Testing tips

Create small unit tests per mapper:

* **to-card**

  * flattens feature unions to strings
  * caps at 5
  * falls back to first includes group
  * never includes `priceBand`

* **to-overview**

  * passes `price` and `priceBand`
  * maps hero + narrative correctly

* **to-extras**

  * passes arrays/optionals unchanged

Example (Vitest/Jest):

```ts
import { toCard } from "./to-card";

it("flattens features and caps at 5", () => {
  const card = toCard({
    // minimal Package stub...
    features: [{ label: "A" }, "B", { label: "C" }, "D", "E", "F"],
    includes: [],
    // ...other required fields
  } as any);
  expect(card.features).toEqual(["A","B","C","D","E"]);
});
```

---

## Performance

* All mappers are **pure** and **O(n)** over small arrays.
* Safe to run in RSC/SSG and re-run at interaction time (cheap).

---

## Evolution & versioning

* When adding fields to `PackageSchema`, prefer adding **optional** fields first.
* Extend mapper outputs conservatively; avoid breaking prop shapes.
* Keep band policy out of mappers—use `@/packages/lib/band` + `@/packages/lib/copy`.

---

## Do / Don’t

**Do**

* Pass only `price` to cards; derive labels/bands at render time.
* Pass `priceBand` to details only.
* Keep functions tiny, pure, and UI-agnostic.

**Don’t**

* Don’t assemble CTA objects here (that’s page/registry policy).
* Don’t format currency strings in mappers (use `@/packages/lib/pricing`).
* Don’t duplicate price copy or inject fine print into cards.

---

## Quick reference

* **Pricing helpers:** `@/packages/lib/pricing`

  * `startingAtLabel`, `formatMoney`, `isHybrid`, etc.
* **Band policy:** `@/packages/lib/band`

  * `resolveBandVariant("card" | "detail", price)`
  * `defaultBaseNote(price)`; `resolveBaseNoteText(price, override)`
  * `bandPropsFor(ctx, price, priceBand)`

That’s it — small, predictable mappers that keep your **SSOT** intact and your UI surfaces clean.
