Awesome — here’s your **official pricing-display spec** for the four variants, written so design, copy, and engineering can all follow the same playbook.

---

# 📘 Pricing Display Standards — “Starting At” System

*Last updated: 2025-09-29*

## Purpose

Make price **clear, compliant, and persuasive** while reinforcing that **final quotes depend on scope**.

## Single Source of Truth

All UI derives from one field:

```ts
price: { monthly?: number; oneTime?: number; currency: "USD" }
```

Never author `startingAt`, `priceTeaser`, or duplicates in props. The label “Starting at …” is **rendered**, not stored.

---

## Global Copy Rules

- **Compliance phrase:**  “**Starting at**” (exact casing unless used as a badge/label where SMALL CAPS are allowed).
- **Scope line (pick one):**

  - **Base price — request proposal** (hybrid monthly + setup)
  - **Base price — final after scope** (one-time projects)
- **Minimums &amp; extras:**  Append in the fine-print line, e.g. `3-month minimum • + ad spend`.
- **CTAs (standardized):**

  - **Detail pages:**  Primary “Request proposal” → `/contact`, Secondary “Book a call” → `/book`
  - **Cards:**  Primary “View details” → `/packages/[slug]`, Secondary “Book a call” → `/book`

---

# Variants

## 🔹 Variant 1 — PackageDetailOverview (Hybrid w/ tagline)

**Use when:**  The package has **monthly + setup**, and you want a headline/tagline above pricing.

```
Make your brand shine on film.
STARTING AT:
$1,200/mo
+ $18,000 setup
----------------------------
Base price — request proposal
3-month minimum • + ad spend

[ Request Proposal ] [ Book a Call ]
```

**Copy &amp; Design**

- Tagline: one short, benefit-forward line (≤ 9 words).
- “STARTING AT:” \= smallcaps or pill/label; price holds the visual weight.
- Separate **monthly** (large) and **setup** (smaller) onto their own lines.
- Fine-print: scope line + optional minimums/extras.

**Component target**

- `PackageDetailOverview → PriceTeaser` (band layout)
- Place **above** CTAs in the overview stack.

---

## 🔹 Variant 2 — PackageCard (Hybrid, compact)

**Use when:**  In grids/rails for **monthly + setup** packages. Space is tight; stay compact.

```
[ STARTING AT ]
$1,200/mo + $18,000 setup
----------------------------
Base price — request proposal
3-month minimum • + ad spend

[ View Details ] [ Book a Call ]
```

**Copy &amp; Design**

- “Starting at” as a **badge** (pill) above the figure.
- Keep monthly + setup on **one line** (chips are OK too: `[ $1,200/mo ] [ Setup $18,000 ]`).
- Add a **single** micro-line under price (scope + minimums).

**Component target**

- `PackageCard`
- Show **one** price area only (chips or sentence), not both.

---

## 🔹 Variant 3 — PackageDetailOverview (One-time service)

**Use when:**  One-time project (e.g., video shoot).

```
Capture your story in style.
STARTING AT: $5,000
----------------------------
Base price — final after scope

[ Request Proposal ] [ Book a Call ]
```

**Copy &amp; Design**

- Inline label + amount on **same line**.
- Optional clarifier beneath (e.g., “(one-time project fee)”) if needed.
- Fine-print uses **final after scope**.

**Component target**

- `PackageDetailOverview → PriceTeaser` (band layout supports inline label).

---

## 🔹 Variant 4 — PackageCard (One-time service)

**Use when:**  Card/grid for one-time projects.

```
[ STARTING AT ] $5,000
----------------------------
Base price — final after scope

[ View Details ] [ Book a Call ]
```

**Copy &amp; Design**

- Badge plus bold figure **inline**.
- One micro-line for scope note.

**Component target**

- `PackageCard`

---

## When to Choose Which Variant

| Scenario                            | Detail Page                                    | Card/Grid                       |
| ------------------------------------- | ------------------------------------------------ | --------------------------------- |
| Monthly + setup, marketing emphasis | **Variant 1**                                               | **Variant 2**                                |
| Monthly only (no setup)             | **Variant 1**(hide setup line)                              | **Variant 2**                                |
| One-time only                       | **Variant 3**                                               | **Variant 4**                                |
| Very tight layout / rail            | Keep price concise; prefer badge + single line | Prefer single line + micro-line |

---

## Visual & UX Notes

- **Hierarchy:**  Label (“Starting at”) is supportive; the **number** is the hero.
- **Spacing:**  Use a subtle divider between price and fine-print on detail pages; a thinner one or extra spacing on cards.
- **Badges:**  “Starting at” badge uses muted background, small caps, \~.75–.85rem.
- **Accessibility:**  Include a screen-reader sentence:

  - “Starting at \$1,200 per month plus \$18,000 setup. Base price; final after scope.”
- **Duplication guard:**  If the **PriceTeaser band** is shown, do **not** also render a “Starting at …” subtitle in any CTA section.

---

## Copy Library (plug-and-play)

**Taglines (pick one; keep short):**

- Make your brand shine on film.
- Launch faster, scale smarter.
- Capture demand, convert more.

**Scope line (pick one):**

- Base price — request proposal   *(hybrid)*
- Base price — final after scope   *(one-time)*

**Fine-print add-ons (append with bullets or middots):**

- 3-month minimum
- - ad spend
- Setup waived after 6 months

---

## Do / Don’t

**Do**

- Use a **badge** or **smallcaps label** for “Starting at”.
- Split hybrid pricing into **monthly** (big) and **setup** (smaller) on detail pages.
- Keep cards **compact**: one line price + one micro-line.

**Don’t**

- Don’t render multiple price sentences on a single surface.
- Don’t show a CTA-band subtitle “Starting at …” if the band already appears.
- Don’t author duplicate price fields in data.

---

## Engineering Hooks (for your repo)

- **Derive label once:**

  ```ts
  startingAtLabel(price) // -> "$X/mo + $Y setup" | "$X/mo" | "$Y one-time"
  ```

- **Detail band (Variants 1 &amp; 3):**
  `PriceTeaser` supports:

  - `mode="band"` (stacked) or `mode="inline"` (for Variant 3)
  - `badge`/`label="Starting at"` (optional)
  - `metaLine` (scope/minimums)
- **Cards (Variants 2 &amp; 4):**

  - Use badge + single line; chips permitted for hybrid.
  - Add `priceMetaLine` under price for scope/minimums.
- **Duplication guard (template):**

  ```ts
  const showBand = Boolean(price?.monthly || price?.oneTime);
  const ctaSubtitle = showBand ? undefined : startingAtLabel(price);
  ```

---

## QA Checklist

- [ ] Detail page shows **one** price band; CTAs directly below.
- [ ] Card shows **one** price area + micro-line; no second teaser elsewhere.
- [ ] Hybrid: monthly emphasized, setup secondary; minimums/ad-spend present when relevant.
- [ ] One-time: label and amount on the same line (Variant 3/4).
- [ ] Screen-reader sentence present; badge has accessible name.

---

If you want, I can drop this into a repo doc at
`/src/packages/components/docs/pricing-display-variants.md` and include example screenshots later.
