# PackageDetailOverview — Rules Quicklook Overview Document

> Applies to:
> `src/packages/sections/PackageDetailOverview` and all parts under `parts/*`
> (`TitleBlock`, `MetaRow`, `IncludesFromGroups`, `OutcomesBlock`, `NotesBlock`, `PriceTeaser`, `CTARow`, `StickyRail`, `PackageDetailExtras`)

---

## 0) Purpose & Contract

The **PackageDetailOverview** is the “super card” for a single package page. It renders a **two-column** layout with all detail on the **left** and a **pinned, compact PackageCard** on the **right**.
All content is driven from **SSOT data**:

* **Price**: `price: Money` (single source of truth; no authored teasers)
* **Includes**: `includesGroups` (Array<{ title, items }>) from `base.ts`
* **Outcomes/Highlights**: explicit props or derived from includes
* **CTAs**: standardized copy & routes policy
* **Right rail**: same card as the grid, rendered **compact** (summary only)

No strings are duplicated in multiple places; renderers derive labels.

---

## 1) Column Composition & Order (Left vs Right)

### Left Column (information)

Order is **strict**:

1. **TitleBlock**
2. **MetaRow** (service chip + tags) – optional via `showMeta`
3. **Highlights** (FeatureList)
4. **Outcomes** (OutcomesBlock → OutcomeList grid)
5. **What’s included** (IncludesFromGroups; cards variant)
6. **Notes** (NotesBlock; readable emphasis)
7. **PriceTeaser** (derived from Money via `startingAtLabel`)
8. **CTARow** (primary + secondary, standardized copy)
9. **PackageDetailExtras** (timeline/ethics/requirements)

### Right Column (sticky rail)

* **Pinned PackageCard** with `variant="pinned-compact"` and flags:
  `hideTags`, `hideOutcomes`, `hideIncludes`, `descriptionMaxLines=3`
* Uses **summary** (never description) + **price punchline** + **1 CTA**.

---

## 2) Titles / Section Headers & Text Alignment (left column)

* Section blocks (`Highlights`, `Outcomes you can expect`, `What’s included`, `Ideal for`) must render **header + divider** as the section lead.
* Default alignment: **left**.
  Exception: **“What’s included”** header + divider **centered**.
* Text in paragraphs (summary lines, ICP, notes) is **left-aligned**.
* Lists (FeatureList/OutcomeList) use centered icons with **left-aligned** labels for readability.

---

## 3) Summary, Description & ICP

* **Summary** appears in **TitleBlock** area text stack; **Description** (longer) may appear as an additional paragraph under the value prop.
* **ICP** block renders right after TitleBlock when `icp` is present, with **header “Ideal for” + divider + body**.
* The **right rail card** must **only** show **summary** (never description).

---

## 4) Tags/Badges/Tiers (visibility rules)

* In **overview** left column, `MetaRow` (service/tag chips) is **optional**.
  If the page hero already shows chips, pass `showMeta={false}` here.
* **Right rail** card (pinned-compact) **never** shows tags/badges/tiers.
* If tags are shown anywhere, they render in a **single row** (no wraps); horizontal scroll allowed for overflow.

---

## 5) Pricing Rules (one source, one render)

* **Only source of truth**: `price: Money` (`{ oneTime?, monthly?, currency:"USD" }`).
* **Left** uses **`PriceTeaser`** which must call `startingAtLabel(price)` internally.
  **Do not** author a teaser label/string.
* **Right rail** card already uses `startingAtLabel(price)`.
* Never render pricing twice in the **left** column; PriceTeaser is the single location there.
* Pricing is always **one line** and appears **above CTARow** in the left stack.

---

## 6) CTAs (policy-standard)

* **Left column CTARow** shows **two buttons**:

  * Primary: **“Request proposal”** → `/contact`
  * Secondary: **“Book a call”** → `/book`
* Buttons **must be side-by-side** at all sizes (no vertical stacking).
  Use a grid with fixed 2 columns and gap; never allow `flex-wrap`.
* **Right rail** card shows **one** button (typically **“View details”**). Single button is **centered** within its card.
* All buttons use shared **`Button`** atom; **primary** variant is **accent-blue bg + off-white text**.

---

## 7) Highlights & Outcomes

### Highlights (FeatureList)

* Rendered **before** Outcomes.
* Data source: `features` prop; if missing, **derive** from the **first 4–6 most representative include bullets**.
* Render **header + divider** above the list.

### Outcomes

* Use **OutcomesBlock** (which wraps **OutcomeList**).
* Layout: **grid**; **2 columns** on md, **3 columns** at xl via CSS container queries.
* Header text: **“Outcomes you can expect”** + divider.

---

## 8) What’s Included (IncludesFromGroups)

* Must use **SSOT** `includesGroups` from `base.ts`.
  `PackageIncludesTable` only as a **fallback** if groups are truly unavailable.
* **Default** variant: `variant="cards"`, `maxCols={2}`, `showIcons={true}`.
  Optional: `dense` for very long lists; item notes (`{ label, note? }`) supported.
* **Center** a lone last card for **3 groups** (upside-down triangle look).
* Title + divider are **centered** for this section.

---

## 9) Notes (readability)

* Notes appear as a dedicated block under Includes.
* Use the readable emphasis style (larger font, higher contrast).
* Accepts `string | ReactNode`; ignore objects (do not render `[object Object]`).

---

## 10) Sticky Rail (visual & behavior)

* Sticky container respects `--sticky-top` token, header offsets, and safe-area insets.
* Card chrome: **charcoal** background, **accent-blue** 1px border, subtle shadow, rounded corners.
* Content: **title → summary (clamped) → price line → single CTA**.
  No tags/badges/outcomes/includes/footnotes in compact variant.

---

## 11) Containers, Spacing & Queries

* Use **grid containers** with explicit content sections; each block has its own wrapper.
* **Container queries** (`@container`) preferred over viewport media queries; provide graceful fallbacks.
* All containers use logical props (`inline-size`, `block-size`) and `min-inline-size: 0` to prevent overflow.
* Spacing via tokens (`--space-*`, `--radius-*`, `--shadow-*`) from unified theme.

**Overview container structure**

```
<Section class="wrap">
  <div class="grid">
    <div class="left">
      <TitleBlock />
      <MetaRow />
      <Highlights />
      <OutcomesBlock />
      <IncludesFromGroups />
      <NotesBlock />
      <PriceTeaser />
      <CTARow />
      <PackageDetailExtras />
    </div>
    <aside class="right">
      <StickyRail>
        <PackageCard variant="pinned-compact" ... />
      </StickyRail>
    </aside>
  </div>
</Section>
```

---

## 12) Accessibility & Semantics

* Each section gets a semantic heading (`h2`/`h3`) + **`aria-label`** where appropriate.
* Lists use proper `<ul><li>` semantics; icons are decorative where possible.
* Buttons/links include descriptive **`aria-label`**.
* Images use `alt` text; ServiceChip fallback is `aria-hidden` for decorative use.

---

## 13) Data Flow & Anti-Drift Rules

* **Never author** `priceTeaser`; always pass `price: Money`.
* Always pass `includesGroups` from `base.ts` (`includesGroups={base.includes}`).
* Derive **Highlights** from includes when not explicitly authored.
* Suppress footnotes on the **right rail** card; render in **Notes** (left) only.
* Avoid duplicating chips: if shown in hero, set `showMeta={false}` in Overview.

---

## 14) Variant Contracts

* **Pinned Compact (right rail)**: summary only; single CTA; hidden tags/outcomes/includes; clamped summary lines; compact paddings.
* **Left Column Blocks**: full details; two CTAs; readable notes; centered “What’s included” title.

---

## 15) QA Checklist (go/no-go)

* [ ] Right rail shows **title → summary → startingAt → 1 CTA**; **no** tags/outcomes/includes/footnotes.
* [ ] Left shows blocks in the defined **order** (Title → Meta → Highlights → Outcomes → Includes → Notes → PriceTeaser → CTARow → Extras).
* [ ] **Pricing text** matches on left and right; both computed from the **same Money** object via `startingAtLabel`.
* [ ] **Includes** uses **cards** (2-up) and centers a lone third card.
* [ ] All section headers use **header + divider**; “What’s included” is **centered**.
* [ ] **CTAs**: left = **two side-by-side**; right = **one centered**.
* [ ] No wrapping glitches; lists remain readable at narrow widths (container queries).
* [ ] No `[object Object]` anywhere (Notes only renders string/ReactNode).
* [ ] Tags not duplicated; if hero shows chips, Overview hides them.

---

## 16) Implementation Notes (where things live)

* **Order & visibility** enforced in `PackageDetailOverview.tsx`.
* **Pinned card flags** passed in `StickyRail.tsx` (or at callsite within Overview).
* **Rail chrome**: `StickyRail.module.css`.
* **Centered includes** & 2-up grid: `IncludesFromGroups.module.css` (cards variant).
* **Readable notes**: `NotesBlock.module.css` (emphasis class).
* **CTA row**: `CTARow.tsx` + `CTARow.module.css` (two buttons side-by-side grid).
* **Price teaser**: `PriceTeaser.tsx` calls `startingAtLabel(price)`.

---

This document replaces “Package Card Rules Quicklook” **for the Overview context** and should be kept alongside the component code to prevent drift.
