Two Separate Price Renderings TASK:

The pricing component/aspect of the package card. The pricing should only be displayed once. And the standard package display currently renders twice. Determine why after the summary in the standard version, it renders the price, and then after the features list, it renders the price again. But after the features list, when the price is rendered, it doesn't say starting at. What are the differences here? Are there two? What's controlling these? And then in the compact pinned display version, it renders it one time. How do we combine these into one and have it always be displayed right above the call to action?

---
### **Pricing Rules**

* Pricing must:

  * Always be displayed in a **single line/row**.
  * Never break up into multiple rows.
  * Always maintain a **consistent row**, regardless of length, card size, or screen size.
  * Be wrapped in its **own container** inside the card.

---
## **Package Card Rules for Pricing**

* Pricing should **only be displayed once** in a package card.
* Pricing must always:

  * Be in a **single line/row**.
  * Never break into multiple rows.
  * Remain consistent across card size and screen size.
  * Be wrapped in its **own container** inside the card.
* Pricing should always be displayed **right above the Call-to-Action (CTA)** section.

---

## **Current Issues with Pricing**

1. In the **standard package display**, pricing is currently rendered **twice**:

   * Once **after the summary**.
   * Again **after the features list**.
2. When rendered after the features list:

   * The pricing does **not include “Starting at”**, unlike the earlier instance.
3. The **Compact/Pinned Display** renders pricing correctly only **once**.
4. There appears to be **two different price renderings** or conditions controlling them.

---

## **Questions to Investigate**

* Why does the **standard package display** render the price twice?
* What is controlling the first rendering (after summary) vs. the second rendering (after features)?
* Why does the second rendering **not display “Starting at”**?
* Are there actually **two separate pricing components** being used?
* How can these be combined into **one consistent pricing component**?
* What changes are needed so pricing is always displayed **only once, directly above the CTA** across all package card variations?

---

After analyzing the PackageCard component code, I can explain exactly what's happening with the dual pricing display:

## Two Separate Price Renderings Identified

**1. First Price Display (Lines 218-224 in PackageCard.tsx)**
```typescript
{startingTeaser && (
  <div className={cls.priceDisplay} aria-label={startingTeaser}>
    {startingTeaser}
  </div>
)}
```
- **Location**: Inside the "value" section, after summary
- **Content**: Uses `startingTeaser` from `startingAtLabel(money)` function
- **Includes**: "Starting at" prefix text
- **CSS Class**: `.priceDisplay`
- **Always Shows**: In default and rail variants

**2. Second Price Display (Lines 239-245 in PackageCard.tsx)**
```typescript
{!isPinnedCompact && money && (
  <div className={cls.prices}>
    <div className={cls.priceChip}>
      <PriceLabel price={money} />
    </div>
  </div>
)}
```
- **Location**: Separate section after features, before tags
- **Content**: Uses `<PriceLabel>` component directly
- **Includes**: Raw price without "Starting at" prefix
- **CSS Class**: `.prices` and `.priceChip`
- **Shows**: Only in default and rail variants (hidden in pinned-compact)

## Why This Dual Display Exists

The code creates two different pricing presentations:
1. **Price teaser** - Marketing-focused "Starting at $X" in the value proposition section
2. **Detailed price chip** - Technical pricing breakdown in its own section

## Current Variant Behavior

- **Default/Rail**: Shows BOTH price displays
- **Pinned-Compact**: Shows ONLY the first (teaser) display

## Solution: Single Price Display Above CTA

Here's the refactoring needed:

### 1. Remove Both Existing Price Displays
```typescript
// REMOVE: Lines 218-224 (first price display)
// REMOVE: Lines 239-245 (second price display)
```

### 2. Add New Single Price Display Before CTA
```typescript
{/* NEW: Single price display right before actions */}
{money && (
  <div className={cls.priceSection}>
    <div className={cls.priceContainer}>
      <PriceLabel 
        price={money} 
        showStartingAt={true} // Always include "Starting at" 
      />
    </div>
  </div>
)}

{/* Divider — before actions */}
{!isPinnedCompact && <Divider />}
```

### 3. Update PriceLabel Component
The `PriceLabel` component needs modification to optionally include "Starting at":

```typescript
export type PriceLabelProps = {
  // ... existing props
  showStartingAt?: boolean; // New prop
};

// In component logic:
const prefixText = showStartingAt ? "Starting at " : "";
```

### 4. Add New CSS for Unified Price Section
```css
/* New unified price section */
.priceSection {
  margin-top: var(--spacing-sm, 0.75rem);
  display: flex;
  justify-content: center;
  align-items: center;
}

.priceContainer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 9999px;
  border: 1px solid var(--card-border, var(--border-subtle));
  background: var(--pkg-pricechip-bg, var(--chip-price-bg, #2D2D2F));
  color: var(--pkg-pricechip-fg, var(--chip-price-fg, var(--pkg-card-fg)));
  font-size: var(--font-size-body, 1rem);
  font-weight: 700;
}
```

### 5. Update Component Structure
The final structure should be:
```
- Header/Media
- Title + Divider  
- Summary (+ Description in standard)
- Features (if not hidden)
- Tags (if enabled)
- [NEW] Single Price Section
- Divider
- CTA Actions
- Footnote
```

This eliminates the dual pricing display and creates a single, consistent price presentation that appears directly above the CTA section across all variants, maintaining the "starting at" prefix and single-line formatting as required by your rules.
