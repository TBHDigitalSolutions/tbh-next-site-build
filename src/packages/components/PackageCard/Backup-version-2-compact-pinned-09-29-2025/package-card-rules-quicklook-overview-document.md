## PackageCard Rules Quicklook Overview Document

---

### **Package Card Rules**

* On the **standard package display**, the package card must render both the **summary** and the **description**.
* The **title/header** must:

  * Always be on a **single line**, regardless of length.
  * Always have the **divider component directly underneath it**.
  * Be wrapped together with the divider in a **single container**.
* The **summary** should be placed **underneath the wrapped title + divider**, and all three (title, divider, summary) should be wrapped together.
* The **description** (when shown in the standard package display) should be wrapped as its **own section**.
➡️ All titles/headers should be centered/aligned and all descriptions and summaries should have text right aligned.
➡️ All bullets should be centered and text/bullets should be right aligned.
---

### **Package Card — Pricing Rules**

* **Single render only:** Pricing must be displayed **once per card**.
* **Placement:** Pricing must appear **directly above the Call-to-Action (CTA)** section.
* **Layout:**

  * Pricing must be on **one line/row** and **must not wrap** to multiple lines.
  * The row must remain **consistent** across all card sizes and screen sizes.
* **Containerization:** Pricing must be wrapped in its **own container** inside the card.

---

### **Call-to-Action (CTA) Rules**

* **Display rules**:

  * In the **standard package display** → show **both primary and secondary CTAs**.
  * In the **Compact/Pinned display** → show **only one CTA**.

* **Button arrangement**:

  * If there are **two buttons**, they must always be **side-by-side** across **all screen sizes**.
  * Buttons should **never stack vertically**.
  * If there is **one button**, it must be **centered**.

* **Scaling behavior**:

  * Both the **buttons** and their **text** should **scale proportionally** with the component size (small, medium, large).

* **Divider usage**:

  * A **divider component** must always be placed **directly above the CTA buttons**.
  * The divider should be **wrapped together with the buttons**, creating a clear separation from the rest of the card.

* **Implementation notes**:

  * All components with buttons should use the **`Button.tsx`** component.
  * Apply the proper **attributes/links, styling, and configuration** in code.
  * **CTA button rules**:

    * Single buttons → **centered**.
    * Double buttons → **always side by side** (regardless of screen size or container size).
    * Buttons and text must **scale appropriately**.

* **Button notes:** All components with buttons should use the Button.tsx component and apply the buttons’ attrs/links, styling, etc in the component configuration.

---

### **Compact/Pinned Display Rules**

* The **Compact/Pinned Display** must:

  * **Never render or display the description**.
  * Only ever show the **summary**.
  * **Never display tags or badges** (even if passed).

---

### **Default Package Card Rules**

* By default, the package card should:

  * **Not render or display badges, tags, or tier**, even if they are passed.
  * These must be **explicitly enabled** to show.

---

### **Tag Display Rules**

* When **tags are enabled**:

  * They must always render in a **single row/single line**.
  * Tags must **never break into multiple rows**.
  * In the **Compact/Pinned Display**, tags must **not be displayed**.

---
### **Container & Layout Rules**
* **Container Architecture**:
  * Use **5-level hierarchy**: Root → Section → Nested → Wrapper → Content containers.
  * All containers must use **CSS Grid** for layout control.
  * Each section (Header, Content, Metadata, Pricing, Actions) gets its **own container**.

* **Responsive Behavior**:
  * Use **container queries** (`@container`) instead of media queries.
  * **4 breakpoints**: Small (≤20rem), Medium (20-32rem), Large (32-48rem), XLarge (>48rem).
  * Containers must **auto-adapt** based on content presence using `:has()` selectors.

* **Layout Control**:
  * All containers need `min-inline-size: 0` to prevent overflow.
  * Use logical properties (`inline-size`, `block-size`) over width/height.
  * Implement `gap` values using CSS custom properties for consistent spacing.

* **Container Structure**:
```
Root Container
├── Header Container (Media + Title)
├── Content Container (Summary + Description + Features)
├── Metadata Container (Tags when enabled)
├── Pricing Container (Single price display)
└── Actions Container (Divider + CTA Buttons)
```

* **Dynamic Features**:
  * CTA buttons container uses `grid-template-columns: repeat(var(--cta-count), 1fr)`.
  * Single CTA: `--cta-count: 1` with `justify-items: center`.
  * Tags container: `overflow-x: auto` for horizontal scroll, never wrap.
  * All containers support variant-specific behavior via data attributes.
