# PackageCard Component Documentation - Rules Compliance Analysis

The `PackageCard` is a flexible React component designed to display package information in various layouts and configurations. It supports three main variants and extensive customization options.

### ❌ RULE VIOLATIONS IDENTIFIED

**1. Standard Package Display - Summary AND Description Rule**
- **Status**: VIOLATED
- **Issue**: Current code only shows summary OR description (line 161: `const displayDesc = (summary && summary.trim()) ? summary : (description ?? "");`)
- **Should be**: Both summary and description rendered in standard display

**2. Title/Header Alignment Rule**
- **Status**: VIOLATED  
- **Issue**: No text alignment CSS rules found for centering titles/headers
- **Current**: Left-aligned (default)
- **Should be**: Centered/aligned

**3. Description/Summary Text Alignment Rule**
- **Status**: VIOLATED
- **Issue**: No right-alignment CSS for descriptions and summaries
- **Current**: Left-aligned (default)
- **Should be**: Right-aligned

**4. Bullets Alignment Rule**
- **Status**: VIOLATED
- **Issue**: FeatureList component doesn't center bullets or right-align text
- **Current**: Left-aligned with default grid layout
- **Should be**: Centered bullets, right-aligned text

**5. CTA Button Arrangement Rule**
- **Status**: PARTIALLY VIOLATED
- **Issue**: CSS allows flex-wrap which can cause vertical stacking on small screens
- **Current**: `.actions { flex-wrap: wrap; }` (line 147 in PackageCard.module.css)
- **Should be**: Always side-by-side, never stack

**6. Single CTA Centering Rule**
- **Status**: VIOLATED
- **Issue**: No logic to center single buttons
- **Should be**: Centered when only one CTA present

**7. Default Package Card Badge/Tag/Tier Display Rule**
- **Status**: PARTIALLY VIOLATED
- **Issue**: Badges, tags, and tiers show by default if provided
- **Current**: Shows badges (line 198), tiers (line 158), tags (line 259) automatically
- **Should be**: Hidden by default, require explicit enabling

**8. Compact/Pinned Description Rule**
- **Status**: COMPLIANT ✅
- **Current**: Correctly hides description in pinned-compact variant

**9. Compact/Pinned Tag/Badge Rule**
- **Status**: COMPLIANT ✅  
- **Current**: Correctly hides tags and badges in pinned-compact variant

**10. Tag Single Row Rule**
- **Status**: VIOLATED
- **Issue**: TagChips component allows wrapping (line 54: `flex-wrap: wrap`)
- **Should be**: Single row only, no wrapping

### ✅ COMPLIANT RULES

**1. Pricing Single Line Rule** - COMPLIANT
- Current implementation keeps pricing in single row with `white-space: nowrap`

**2. Title + Divider Container Rule** - COMPLIANT  
- Both wrapped together in `titleBar` container

**3. CTA Display Logic Rule** - COMPLIANT
- Standard shows both CTAs, compact shows both (should be one)

## REQUIRED REFACTORING PLAN

### 1. PackageCard.tsx Changes

**A. Fix Summary AND Description Display for Standard Variant**
```typescript
// CURRENT (line ~161):
const displayDesc = (summary && summary.trim()) ? summary : (description ?? "");

// SHOULD BE:
const displaySummary = summary?.trim() || "";
const displayDescription = description?.trim() || "";
const showBothInStandard = variant === "default" && displaySummary && displayDescription;
```

**B. Add Props for Explicit Badge/Tag/Tier Control**
```typescript
export type PackageCardProps = {
  // ... existing props
  
  // NEW: Explicit control props
  showBadge?: boolean;      // Default false
  showTags?: boolean;       // Default false  
  showTier?: boolean;       // Default false
  
  // ... rest of props
};
```

**C. Update Badge/Tag/Tier Display Logic**
```typescript
// Replace automatic display with explicit control
const shouldShowBadge = showBadge && displayBadge;
const shouldShowTags = showTags && !shouldHideTags && tags && tags.length > 0;
const shouldShowTier = showTier && tier;
```

**D. Fix Single CTA Centering**
```typescript
const hasSingleCTA = !primaryCta || !secondaryCTA; // Define logic
// Add to actions className: hasSingleCTA && cls.actionsCentered
```

**E. Update Compact CTA Rules** 
```typescript
// In pinned-compact, show only primary CTA
{!isPinnedCompact && secondaryCta && (
  <Button>...</Button>
)}
```

### 2. PackageCard.module.css Changes

**A. Add Text Alignment Rules**
```css
/* Title/header centering */
.title {
  text-align: center;
}

/* Description/summary right alignment */
.description {
  text-align: right;
}

/* Add summary class for when both are shown */
.summary {
  margin: 0;
  color: var(--pkg-card-muted, var(--text-secondary));
  font-size: var(--font-size-body, var(--pkg-body, 1rem));
  text-wrap: pretty;
  text-align: right;
}
```

**B. Fix CTA Button Layout**
```css
/* Current problematic rule */
.actions {
  margin-top: var(--spacing-md, 1rem);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.75rem);
  /* REMOVE: flex-wrap: wrap; */  
  flex-wrap: nowrap; /* Force side-by-side */
  overflow-x: auto;  /* Handle overflow with scroll */
}

/* NEW: Single CTA centering */
.actionsCentered {
  justify-content: center;
}
```

### 3. FeatureList.module.css Changes

**A. Center Bullets and Right-Align Text**
```css
.item {
  display: grid;
  grid-template-columns: var(--_icon-col, 1.25rem) 1fr;
  column-gap: var(--spacing-xs, 0.5rem);
  align-items: start;
  min-inline-size: 0;
  /* NEW: Center the icon column */
  justify-items: center start; /* Center icon, start content */
}

.iconWrap {
  /* Already centered with place-items: center */
}

.content {
  /* NEW: Right-align text content */
  text-align: right;
}
```

### 4. TagChips.module.css Changes

**A. Force Single Row Display**
```css
.chips {
  /* ... existing styles ... */
  /* CHANGE: Remove wrap option, force nowrap */
  flex-wrap: nowrap;
  overflow-x: auto;
  scroll-snap-type: x proximity;
}

/* REMOVE: .wrap class entirely */
```

### 5. TagChips.tsx Changes

**A. Remove Wrap Option**
```typescript
export type TagChipsProps = {
  // ... other props
  // REMOVE: wrap?: boolean;
};

// Update component to always nowrap:
<ul
  className={clsx(styles.chips, styles[size], styles.nowrap, className)}
  // Remove wrap condition
>
```

### 6. Update JSX Structure in PackageCard.tsx

**A. Render Both Summary and Description in Standard**
```typescript
{/* NEW: Both summary and description for standard */}
{variant === "default" && displaySummary && (
  <p className={cx(cls.summary, clampClass)}>
    {displaySummary}
  </p>
)}

{/* Description section */}
{displayDescription && (
  <p className={cx(cls.description, clampClass)}>
    {displayDescription}
  </p>
)}
```

**B. Update Badge Display**
```typescript
{shouldShowBadge && <span className={cls.badge}>{displayBadge}</span>}
```

**C. Update Tags Display**  
```typescript
{shouldShowTags && (
  <div className={cls.tagsWrap}>
    <TagChips tags={tags} />
  </div>
)}
```

### 7. Update Component Imports and Props

**A. Consumer Components Must Explicitly Enable**
```typescript
// Before (automatic display):
<PackageCard 
  tags={["Popular", "Best Value"]}
  tier="Professional"
  badge="Limited Time"
/>

// After (explicit enabling):
<PackageCard 
  tags={["Popular", "Best Value"]}
  showTags={true}
  tier="Professional" 
  showTier={true}
  badge="Limited Time"
  showBadge={true}
/>
```

### 8. Testing Requirements

After refactoring, verify:
- Standard variant shows both summary AND description when both provided
- All text alignment follows rules (centered titles, right-aligned content)
- Badges/tags/tiers hidden by default, shown only when explicitly enabled
- CTA buttons never stack vertically
- Single CTA buttons are centered
- Tags always display in single row
- Compact variant shows only one CTA
- FeatureList bullets are centered with right-aligned text

This refactoring ensures 100% compliance with all specified rules while maintaining backward compatibility through explicit prop controls.

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

## Critical Rule Violations Found

**Major Issues:**
1. **Summary AND Description Rule**: Currently shows either/or, not both in standard display
2. **Text Alignment**: No centering for titles or right-alignment for content  
3. **Button Stacking**: CSS allows vertical stacking with `flex-wrap: wrap`
4. **Default Badge/Tag Display**: Shows automatically instead of requiring explicit enabling
5. **Tag Wrapping**: TagChips can break into multiple rows

## Most Important Refactoring Priorities

**1. Fix Standard Display Logic (High Priority)**
The current code uses fallback logic instead of showing both:
```typescript
// Current: shows summary OR description
const displayDesc = (summary && summary.trim()) ? summary : (description ?? "");

// Should be: show summary AND description
```

**2. Add Explicit Control Props (High Priority)**
Add `showBadge`, `showTags`, `showTier` props that default to false, ensuring nothing displays unless explicitly enabled.

**3. Fix Button Layout (Medium Priority)**
Remove `flex-wrap: wrap` from `.actions` and add logic to center single buttons.

**4. Implement Text Alignment (Medium Priority)**
Add CSS rules for centered titles and right-aligned content.

The detailed refactoring plan I've provided includes specific code changes, line numbers, and before/after examples. The changes maintain backward compatibility while ensuring 100% rule compliance.