Here’s a drop-in **README.md** you can place at:

```
src/packages/sections/PackageDetailOverview/parts/PriceActionsBand/README.md
```

---

# PriceActionsBand

A small **composition component** that standardizes how pricing and actions are presented. It wraps **PriceTeaser** (figures), **CTARow** (buttons), an optional **Divider**, and optional copy (tagline, base note, fine print). It supports **four visual variants** tuned for **detail pages** and **cards**.

* **Detail variants** show a **badge above** the figure, stacked monthly/setup, plus base/fine print.
* **Card variants** show a **badge to the left** of a **single-line figure**; hybrids auto-render as **chips** to avoid truncation.

No data model changes: it takes the same `price` object used everywhere.

---

## Files

```
PriceActionsBand.tsx
PriceActionsBand.module.css
index.ts
README.md  ← you are here
```

---

## Quick start

### Detail pages (swap your old PriceTeaser + CTARow stack)

```tsx
import PriceActionsBand from "./parts/PriceActionsBand";

<PriceActionsBand
  variant={price?.monthly && price?.oneTime ? "detail-hybrid" : "detail-oneTime"}
  price={price}
  tagline={pkg.priceBand?.tagline}              // optional and distinct from summary
  baseNote={price?.monthly && price?.oneTime ? "proposal" : "final"}
  finePrint={pkg.priceBand?.finePrint}          // e.g., "3-month minimum • + ad spend"
  ctaPrimary={{ label: "Request proposal", href: "/contact" }}
  ctaSecondary={{ label: "Book a call", href: "/book" }}
  showDivider                                   // puts Divider below the price block
  align="center"
/>
```

### Cards (default & pinned)

```tsx
<PriceActionsBand
  variant={price?.monthly && price?.oneTime ? "card-hybrid" : "card-oneTime"}
  price={price}
/* Cards typically omit tagline/baseNote/finePrint; card CTAs are handled by PackageCard */
  ctaPrimary={{ label: "View details", href: `/packages/${slug}` }}
  ctaSecondary={{ label: "Book a call", href: "/book" }}
  align="start"
/>
```

> **Important:** The component never “falls back” to the package **summary**. Tagline renders **only** if you pass `tagline`.

---

## Variants (what each one shows)

| Variant          | Badge pos. | Figure layout                | Base note | Fine print | Divider | Align  | Chips on hybrid |
| ---------------- | ---------- | ---------------------------- | --------- | ---------- | ------- | ------ | --------------- |
| `detail-hybrid`  | above      | **Stacked** `$X/mo` + `+$Y`  | ✓         | ✓          | ✓       | center | —               |
| `detail-oneTime` | above      | **Inline** `STARTING AT: $X` | ✓         | ✓          | ✓       | center | —               |
| `card-hybrid`    | left       | **Inline** single line       | —         | —          | —       | start  | **✓ (chips)**   |
| `card-oneTime`   | left       | **Inline** badge + price     | —         | —          | —       | start  | —               |

* **Base note** text is standardized:

  * `proposal` → `Base price — request proposal`
  * `final` → `Base price — final after scope`
* **Fine print** is any short microcopy (e.g., `3-month minimum • + ad spend`).

---

## Props

```ts
type Money = { monthly?: number; oneTime?: number; currency?: string };

type BandVariant =
  | "detail-hybrid"    // monthly + setup
  | "card-hybrid"
  | "detail-oneTime"   // one-time only
  | "card-oneTime";

type Align = "start" | "center";

type Cta = { label: string; href: string; onClick?: () => void };

type PriceActionsBandProps = {
  variant: BandVariant;
  price?: Money;

  // Detail-only marketing line (distinct from package summary)
  tagline?: string;

  // Microcopy selector next to price: "proposal" | "final"
  baseNote?: "proposal" | "final";

  // Short fine print, e.g., "3-month minimum • + ad spend"
  finePrint?: string;

  // Optional actions; omit to hide the action row
  ctaPrimary?: Cta;
  ctaSecondary?: Cta;

  // Optional overrides (defaults depend on variant)
  align?: Align;           // detail = center, card = start
  showDivider?: boolean;   // detail = true, card = false
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
};
```

**Defaults & behavior**

* `baseNote` defaults by **price shape**: hybrid → `"proposal"`, otherwise `"final"`.
* `align` / `showDivider` default per **variant preset**, but you can override.
* Card hybrids force **chip** appearance to prevent truncation (`[$X/mo] [Setup $Y]`).
* A screen-reader sentence is always emitted (e.g., “Starting at $1,000 per month plus $2,500 setup.”).

---

## Data fields to author (suggested)

Add a light wrapper in your registry types so content authors don’t reuse `summary`:

```ts
// in src/packages/types.ts (or your shared types)
export type PriceBandMeta = {
  tagline?: string;    // short marketing line shown above figure on detail pages
  finePrint?: string;  // "3-month minimum • + ad spend"
};

export type ServicePackage = {
  // ...
  price: Money;                // canonical (oneTime?, monthly?, currency)
  priceBand?: PriceBandMeta;   // optional author fields for the band
};
```

**SmartDAW template additions**

```md
**Price Band (optional):**
* **tagline:** {{ short marketing line for detail band }}
* **finePrint:** {{ microcopy like “3-month minimum • + ad spend” }}
```

---

## CSS and design tokens

Class hooks (in `PriceActionsBand.module.css`):

* `.band` – outer wrapper with padded surface
* `.alignStart` / `.alignCenter` – alignment helpers
* `.tagline` – italic marketing line (detail only)
* `.stack` / `.figureBand` – badge-above (detail)
* `.rowInline` / `.figureInline` – badge-left inline layout (cards)
* `.badge` – pill (`Starting at`)
* `.meta` – fine print / base note
* `.rule` – thin brand line inside the band (detail)
* `.divider` – external Divider spacing
* `.actions` – CTA row container
* `.srOnly` – accessibility sentence

Key tokens used:

* `--brand-blue` (fallback `--accent-500`) for badge border/fill and the rule line
* `--text-secondary` for tagline/meta
* `--radius-xl`, `--space-*` for rhythm

> The card layout uses a small **two-column grid** so the **badge** can sit **left** of the figure. Below ~340px container width it stacks automatically.

---

## CTA policy (recap)

* **Cards (grids/rails):** Primary **“View details”** → `/packages/[slug]`; Secondary **“Book a call”** → `/book`.
* **Detail pages (CTA section/band):** Primary **“Request proposal”** → `/contact`; Secondary **“Book a call”** → `/book`.

If you pass CTAs here, they render through **CTARow**, which adds `data-cta="primary|secondary"` and default `aria-label`s when not provided.

---

## Do / Don’t

**Do**

* Pass `tagline` only when you have a price-specific marketing line.
* Use `finePrint` for short constraints (min term, ad spend).
* Let the component pick chips for hybrids on cards.

**Don’t**

* Don’t pass the package **summary** as `tagline`.
* Don’t duplicate base/fine print elsewhere near the price.
* Don’t author duplicate price strings—always pass `price` and let **PriceTeaser** format.

---

## Migration notes

1. Replace the old `PriceTeaser + CTARow` stack with **PriceActionsBand** on detail pages.
2. In cards, either:

   * keep your existing `PriceLabel` (compact), or
   * render `PriceActionsBand` with `card-*` variants for parity.
3. Add optional `priceBand` fields to your registry (tagline/finePrint).
4. Remove any ad-hoc “Starting at …” strings from templates.

---

## Testing / QA checklist

* [ ] **Hybrid detail** shows badge **above**, stacked `$/mo` then `+ setup`, base note, fine print, rule + divider.
* [ ] **One-time detail** shows badge **above**, inline figure, base note “final after scope”.
* [ ] **Card hybrid** shows badge **left** + **chips**; no base/fine/divider; ellipsis never hides numbers.
* [ ] **Card one-time** shows badge **left** + inline price; no extra copy.
* [ ] **A11y**: SR readers announce “Starting at … plus … setup.”; buttons have `aria-label`s (via CTARow).
* [ ] **Responsive**: badge stacks above figure on very narrow cards (<340px).

---

## Extending

If you need another display (e.g., promo price), add a new `BandVariant` entry and a **preset** in the component. The rendering logic will pick up badge placement, teaser mode, and copy visibility automatically.

---

## Troubleshooting

* **Summary shows as tagline** → You’re passing `summary` instead of `priceBand.tagline`. Remove it or map correctly.
* **Ellipsis on card hybrid** → Ensure you’re using `card-hybrid` (chips are forced) or pass a wider container.
* **Unexpected divider on cards** → Don’t pass `showDivider` to card variants (defaults to `false`).

---

That’s it—copy this file in, and you’ve got a self-documenting component that matches the pricing/CTA policy and your brand tokens.

---
src/packages/sections/PackageDetailOverview/parts/PriceActionsBand
src/packages/sections/PackageDetailOverview/parts/PriceActionsBand/index.ts
src/packages/sections/PackageDetailOverview/parts/PriceActionsBand/PriceActionsBand.module.css
src/packages/sections/PackageDetailOverview/parts/PriceActionsBand/PriceActionsBand.tsx
src/packages/sections/PackageDetailOverview/parts/PriceActionsBand/README.md
---

* **Cards**: You can keep your current compact pipeline for now; `card-hybrid` / `card-oneTime` variants here are **API-ready** if you want to render the same band on cards later.

* **No breaking data**: It takes the same `price` object you already pass around.

* **Tokens only**: All colors/type/shape route through your CSS variables.

---

## What this fixes (and how to wire it)

* **No summary leakage**: `tagline` renders only if you pass `tagline` (not `summary`).
* **Card vs. Detail auto-layout** via `PRESET`:

  * `detail-*` → **badge above**, stacked price, base note + fine print + internal rule + Divider, centered.
  * `card-*`   → **badge left**, one-line figure (hybrids auto-chip), **no** base/fine/divider, start-aligned.
* **A11y**: Every variant emits an SR-only sentence (“Starting at … per month plus … setup.”).

**In `PackageDetailOverview`**
Pass a **price-specific tagline** and any fine print:

```tsx
<PriceActionsBand
  variant={isHybrid ? "detail-hybrid" : "detail-oneTime"}
  price={pkg.price}
  tagline={pkg.priceBand?.tagline}            // NEW field; do not pass summary
  baseNote={isHybrid ? "proposal" : "final"}
  finePrint={pkg.priceBand?.finePrint}        // e.g., "3-month minimum • + ad spend"
  ctaPrimary={{ label: "Request proposal", href: "/contact" }}
  ctaSecondary={{ label: "Book a call", href: "/book" }}
/>
```

**In `PackageCard` (default & pinned)**
Use the **card variants** and skip tagline/base/fine:

```tsx
<PriceActionsBand
  variant={hasMonthly && hasOneTime ? "card-hybrid" : "card-oneTime"}
  price={pkg.price}
  ctaPrimary={{ label: "View details", href: `/packages/${slug}` }}
  ctaSecondary={{ label: "Book a call", href: "/book" }}
/>
```

---

If anything doesn’t compile due to local path conventions, the only likely adjustments are the two imports for **PriceTeaser** and **CTARow**—swap to your local default/named export style. Everything else matches your repo’s patterns.
