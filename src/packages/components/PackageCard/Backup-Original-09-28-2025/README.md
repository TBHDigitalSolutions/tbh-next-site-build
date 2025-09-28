# PackageCard Component Documentation

The `PackageCard` is a flexible React component designed to display package information in various layouts and configurations. It supports three main variants and extensive customization options.

## Installation & Import

```typescript
// Default import
import PackageCard from "@/packages/components/PackageCard";

// Named import (both available)
import { PackageCard } from "@/packages/components/PackageCard";

// With TypeScript props
import { PackageCardProps } from "@/packages/components/PackageCard";
```

## Component Variants

The component supports three distinct variants via the `variant` prop:

### 1. Default Variant (`variant="default"`)

**Purpose**: Standard package display for main content areas, package listings, and detailed views.

**Rendered Content**:

- Full header with media (image or service icon fallback)
- Complete title bar with divider
- Full description/summary text (unclamped)
- Value section with price teaser
- Feature list (up to 5 items with "+X more" indicator)
- Detailed price chip display
- Tag chips (if provided)
- Visual divider before actions
- Primary and secondary CTA buttons
- Optional footnote

**Best Used For**: Package catalogs, detailed package pages, main content areas

### 2. Rail Variant (`variant="rail"`)

**Purpose**: Optimized for horizontal carousels, sliders, and compact grid layouts.

**Rendered Content**:

- Same content as default variant
- **Visual Difference**: Tighter spacing (uses `--spacing-xs` instead of `--spacing-sm`)
- More compact vertical rhythm for carousel/rail contexts

**Best Used For**: Horizontal package carousels, related package suggestions, sidebar recommendations

### 3. Pinned Compact Variant (`variant="pinned-compact"`)

**Purpose**: Summarized view for sticky/pinned contexts, selected package summaries, or minimal space displays.

**Rendered Content**:

- Header with media and badge
- Title bar with divider
- **Clamped description** (default 3 lines, configurable via `descriptionMaxLines`)
- Price teaser only (no detailed price chip)
- **Hidden by default**: feature list, tags, detailed pricing
- **No divider** before actions (cleaner compact look)
- Primary and secondary CTA buttons
- Optional footnote

**Best Used For**: Sticky package summaries, checkout sidebars, mobile compact views

## Core Props Configuration

### Basic Information

```typescript
<PackageCard
  id="pkg-001"
  slug="premium-web-development" 
  name="Premium Web Development Package"
  title="Custom Web Solutions" // Fallback if no name
  href="/packages/premium-web-development"
/>
```

### Content & Description

```typescript
<PackageCard
  summary="Complete web development solution with modern tech stack" // Preferred for cards
  description="Fallback longer description if no summary provided"
  features={["React/Next.js", "Custom Design", "SEO Optimization", "Mobile Responsive", "Analytics Setup"]}
  highlights={["Feature A", "Feature B"]} // Fallback if no features
/>
```

### Service & Categorization

```typescript
<PackageCard
  service="web-development" // Shows service chip icon
  tier="Professional" // "Essential" | "Professional" | "Enterprise"
  popular={true} // Shows "Most Popular" badge
  badge="Limited Time" // Custom badge text
/>
```

### Media & Visual Elements

```typescript
<PackageCard
  image={{ 
    src: "/images/package-preview.jpg", 
    alt: "Package preview" 
  }}
  // If no image, falls back to service icon
/>
```

### Pricing Configuration

**Canonical Money Format** (Preferred):

```typescript
<PackageCard
  price={{
    oneTime: 2500,
    monthly: 299,
    currency: "USD"
  }}
/>
```

**Legacy Format** (Supported):

```typescript
<PackageCard
  price={{
    setup: 2500,
    monthly: 299,
    currency: "USD"
  }}
/>
```

### Actions & CTAs

```typescript
<PackageCard
  primaryCta={{
    label: "View Details",
    href: "/packages/details",
    onClick: (slug) => handlePrimaryAction(slug)
  }}
  secondaryCta={{
    label: "Schedule Call", 
    href: "/book-consultation",
    onClick: (slug) => handleSecondaryAction(slug)
  }}
  detailsHref="/packages/premium-web-development" // Fallback href
/>
```

### Tags & Metadata

```typescript
<PackageCard
  tags={["Popular", "Best Value", "Custom Development"]}
  footnote="*Setup fee applies to new projects"
  analyticsCategory="premium-packages"
/>
```

## Compact Content Controls

These props work across all variants but are especially useful for space-constrained layouts:

```typescript
<PackageCard
  variant="pinned-compact"
  
  // Content visibility controls
  hideTags={true}              // Hides tag chips
  hideIncludes={true}          // Hides feature/highlights list  
  hideOutcomes={true}          // Reserved for future use
  
  // Text clamping
  descriptionMaxLines={2}      // Clamps to 2 lines (supports 1-5)
/>
```

## Variant-Specific Behavior

| Feature | Default | Rail | Pinned Compact |
|---------|---------|------|----------------|
| **Spacing** | Standard (`--spacing-sm`) | Compact (`--spacing-xs`) | Standard |
| **Description** | Full text | Full text | Clamped (3 lines default) |
| **Feature List** | Shown (5 max + counter) | Shown (5 max + counter) | Hidden by default |
| **Detailed Price Chip** | Shown | Shown | Hidden |
| **Tags** | Shown | Shown | Hidden by default |
| **Divider Before Actions** | Shown | Shown | Hidden |
| **Price Teaser** | Shown | Shown | Shown |

## Complete Configuration Examples

### Standard Package Display

```typescript
<PackageCard
  variant="default"
  slug="web-development-pro"
  name="Professional Web Development"
  summary="Complete web solution with React, custom design, and SEO optimization"
  features={["React/Next.js", "Custom Design", "SEO Optimization", "Mobile Responsive", "Analytics"]}
  service="web-development"
  tier="Professional"
  popular={true}
  image={{ src: "/images/web-dev-preview.jpg", alt: "Web development preview" }}
  price={{ oneTime: 2500, monthly: 299, currency: "USD" }}
  tags={["Most Popular", "Best Value"]}
  primaryCta={{ label: "View Details", href: "/packages/web-development-pro" }}
  secondaryCta={{ label: "Schedule Call", href: "/book" }}
  footnote="*Monthly maintenance fee applies"
/>
```

### Carousel/Rail Display  

```typescript
<PackageCard
  variant="rail"
  slug="basic-web"
  name="Basic Web Package"
  summary="Essential web presence for small businesses"
  features={["Static Website", "Basic SEO", "Contact Forms"]}
  service="web-development"
  tier="Essential"
  price={{ oneTime: 1200, currency: "USD" }}
  primaryCta={{ label: "Learn More" }}
/>
```

### Compact/Pinned Display

```typescript
<PackageCard
  variant="pinned-compact" 
  slug="selected-package"
  name="Selected: Premium Web Development"
  summary="Complete web development solution with modern tech stack and ongoing support"
  service="web-development"
  price={{ oneTime: 2500, monthly: 299, currency: "USD" }}
  
  // Compact-specific overrides
  hideTags={true}
  hideIncludes={true} 
  descriptionMaxLines={3}
  
  primaryCta={{ label: "Proceed to Checkout" }}
  secondaryCta={{ label: "Modify Package" }}
/>
```

## Styling & Theming

The component uses CSS custom properties for theming:

```css
.package-card {
  --pkg-card-fg: var(--text-primary);
  --pkg-card-title: var(--text-primary); 
  --pkg-card-muted: var(--text-secondary);
  --pkg-badge-bg: color-mix(in oklab, var(--brand-blue) 12%, var(--bg-surface));
  --pkg-savings-bg: color-mix(in oklab, #16a34a 18%, var(--bg-surface));
}
```

## Accessibility Features

- Semantic HTML structure with proper heading hierarchy
- ARIA labels for screen readers
- Focus management for interactive elements  
- Reduced motion support via CSS media queries
- Color contrast compliance for text and badges

## Analytics Integration

Built-in Google Analytics tracking:

- `package_primary_cta_click` - Primary button interactions
- `package_secondary_cta_click` - Secondary button interactions  
- Automatic package slug and name tracking
- Configurable analytics category

## TypeScript Support

Full TypeScript support with exported types:

- `PackageCardProps` - Main component props
- `ServiceSlug` - Supported service types
- `PackageCardVariant` - Available variants
- `LegacyPrice` - Backward compatibility pricing

---

I'll create comprehensive documentation for the PackageCard component based on the provided files.I've created comprehensive documentation for the PackageCard component that covers:

## Key Highlights

**Three Distinct Variants:**

1. **Default** - Full-featured display for main content areas
2. **Rail** - Compact spacing for carousels and horizontal layouts  
3. **Pinned Compact** - Minimal display for sidebars and sticky contexts

**Flexible Configuration Options:**

- Complete pricing support (both new Money format and legacy)
- Media handling (images with service icon fallbacks)
- Extensive content controls (hide features, clamp text, etc.)
- Custom CTAs with analytics tracking
- Service categorization and badge system

**Smart Content Display Logic:**

- Prefers `summary` over `description` for card text
- Shows up to 5 features with "+X more" counter
- Automatic fallbacks for missing content
- Responsive media with proper aspect ratios

**Built-in Features:**

- TypeScript support with exported types
- Accessibility compliance (ARIA labels, semantic HTML)
- Analytics integration (Google Analytics events)
- CSS custom properties for theming
- Container queries for responsive behavior

The component is designed to handle everything from detailed package showcases to minimal sticky summaries, with intelligent defaults and extensive customization options for different use cases.

---

# PackageCard Rules

---

## PackageCard Rules Quicklook Overview Document

---

### **Package Card Rules**

- On the **standard package display**, the package card must render both the **summary** and the **description**.
- The **title/header** must:

  - Always be on a **single line**, regardless of length.
  - Always have the **divider component directly underneath it**.
  - Be wrapped together with the divider in a **single container**.
- The **summary** should be placed **underneath the wrapped title + divider**, and all three (title, divider, summary) should be wrapped together.
- The **description** (when shown in the standard package display) should be wrapped as its **own section**.
➡️ All titles/headers should be centered/aligned and all descriptions and summaries should have text right aligned.
➡️ All bullets should be centered and text/bullets should be right aligned.

---

### **Package Card — Pricing Rules**

- **Single render only:** Pricing must be displayed **once per card**.
- **Placement:** Pricing must appear **directly above the Call-to-Action (CTA)** section.
- **Layout:**

  - Pricing must be on **one line/row** and **must not wrap** to multiple lines.
  - The row must remain **consistent** across all card sizes and screen sizes.
- **Containerization:** Pricing must be wrapped in its **own container** inside the card.

---

### **Call-to-Action (CTA) Rules**

- **Display rules**:

  - In the **standard package display** → show **both primary and secondary CTAs**.
  - In the **Compact/Pinned display** → show **only one CTA**.

- **Button arrangement**:

  - If there are **two buttons**, they must always be **side-by-side** across **all screen sizes**.
  - Buttons should **never stack vertically**.
  - If there is **one button**, it must be **centered**.

- **Scaling behavior**:

  - Both the **buttons** and their **text** should **scale proportionally** with the component size (small, medium, large).

- **Divider usage**:

  - A **divider component** must always be placed **directly above the CTA buttons**.
  - The divider should be **wrapped together with the buttons**, creating a clear separation from the rest of the card.

- **Implementation notes**:

  - All components with buttons should use the **`Button.tsx`** component.
  - Apply the proper **attributes/links, styling, and configuration** in code.
  - **CTA button rules**:

    - Single buttons → **centered**.
    - Double buttons → **always side by side** (regardless of screen size or container size).
    - Buttons and text must **scale appropriately**.

- **Button notes:** All components with buttons should use the Button.tsx component and apply the buttons’ attrs/links, styling, etc in the component configuration.

---

### **Compact/Pinned Display Rules**

- The **Compact/Pinned Display** must:

  - **Never render or display the description**.
  - Only ever show the **summary**.
  - **Never display tags or badges** (even if passed).

---

### **Default Package Card Rules**

- By default, the package card should:

  - **Not render or display badges, tags, or tier**, even if they are passed.
  - These must be **explicitly enabled** to show.

---

### **Tag Display Rules**

- When **tags are enabled**:

  - They must always render in a **single row/single line**.
  - Tags must **never break into multiple rows**.
  - In the **Compact/Pinned Display**, tags must **not be displayed**.

---

### **Container & Layout Rules**

* **Container Architecture**:
  - Use **5-level hierarchy**: Root → Section → Nested → Wrapper → Content containers.
  - All containers must use **CSS Grid** for layout control.
  - Each section (Header, Content, Metadata, Pricing, Actions) gets its **own container**.

- **Responsive Behavior**:
  - Use **container queries** (`@container`) instead of media queries.
  - **4 breakpoints**: Small (≤20rem), Medium (20-32rem), Large (32-48rem), XLarge (>48rem).
  - Containers must **auto-adapt** based on content presence using `:has()` selectors.

- **Layout Control**:
  - All containers need `min-inline-size: 0` to prevent overflow.
  - Use logical properties (`inline-size`, `block-size`) over width/height.
  - Implement `gap` values using CSS custom properties for consistent spacing.

- **Container Structure**:

```
Root Container
├── Header Container (Media + Title)
├── Content Container (Summary + Description + Features)
├── Metadata Container (Tags when enabled)
├── Pricing Container (Single price display)
└── Actions Container (Divider + CTA Buttons)
```

- **Dynamic Features**:
  - CTA buttons container uses `grid-template-columns: repeat(var(--cta-count), 1fr)`.
  - Single CTA: `--cta-count: 1` with `justify-items: center`.
  - Tags container: `overflow-x: auto` for horizontal scroll, never wrap.
  - All containers support variant-specific behavior via data attributes.
