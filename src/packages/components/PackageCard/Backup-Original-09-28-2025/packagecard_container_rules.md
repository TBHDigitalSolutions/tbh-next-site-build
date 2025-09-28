# PackageCard Container & Layout Rules

## Container Architecture Rules

### 1. Root Container Structure
```
PackageCard (Root)
├── Header Container
│   ├── Media Container
│   └── Title Container
├── Content Container
│   ├── Summary Container
│   ├── Description Container (Standard only)
│   └── Features Container
├── Metadata Container
│   └── Tags Container (when enabled)
├── Pricing Container
└── Actions Container
    ├── Divider
    └── CTA Buttons Container
```

### 2. Container Hierarchy Rules

**Root Level Containers** - Direct children of PackageCard
- Header Container
- Content Container  
- Metadata Container
- Pricing Container
- Actions Container

**Nested Containers** - Children within main containers
- Media Container (within Header)
- Title Container (within Header)
- Summary Container (within Content)
- Description Container (within Content)
- Features Container (within Content)
- Tags Container (within Metadata)
- CTA Buttons Container (within Actions)

## Layout Control Rules

### 3. Container Display Properties

**All Main Containers Must:**
- Use `display: grid` for primary layout control
- Have explicit `gap` values using CSS custom properties
- Support container queries for responsive behavior
- Have `min-inline-size: 0` to prevent overflow
- Use logical properties (inline-size, block-size) over width/height

**Grid Template Rules:**
```css
.packageCard {
  display: grid;
  grid-template-rows: auto auto auto auto auto; /* 5 main sections */
  gap: var(--card-section-gap, 1rem);
  container-type: inline-size;
}
```

### 4. Responsive Container Behavior

**Container Query Breakpoints:**
- Small: `@container (max-width: 20rem)` - Mobile portrait
- Medium: `@container (min-width: 20.01rem) and (max-width: 32rem)` - Mobile landscape
- Large: `@container (min-width: 32.01rem) and (max-width: 48rem)` - Tablet
- XLarge: `@container (min-width: 48.01rem)` - Desktop

**Responsive Layout Changes:**
```css
/* Small containers - Stack everything */
@container (max-width: 20rem) {
  .headerContainer { grid-template-columns: 1fr; }
  .actionsContainer { grid-template-columns: 1fr; gap: 0.5rem; }
  .titleContainer { text-align: center; font-size: clamp(1rem, 4cqi, 1.25rem); }
}

/* Medium containers - Balanced layout */
@container (min-width: 20.01rem) and (max-width: 32rem) {
  .headerContainer { grid-template-columns: 1fr auto; }
  .actionsContainer { grid-template-columns: 1fr 1fr; }
}

/* Large containers - Full layout */
@container (min-width: 32.01rem) {
  .headerContainer { grid-template-columns: 2fr 1fr; }
  .actionsContainer { grid-template-columns: 2fr 1fr; justify-items: start end; }
}
```

## Container Wrapping Rules

### 5. Header Container Wrapping
```css
.headerContainer {
  display: grid;
  grid-template-rows: auto auto; /* Media row, Title row */
  gap: var(--header-gap, 0.75rem);
  align-items: start;
}

.mediaContainer {
  position: relative;
  grid-column: 1 / -1;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: var(--media-radius, 8px);
}

.titleContainer {
  display: grid;
  gap: var(--title-gap, 0.25rem);
  justify-items: center; /* Center titles per rules */
}
```

### 6. Content Container Wrapping
```css
.contentContainer {
  display: grid;
  gap: var(--content-gap, 0.75rem);
  /* Dynamic rows based on variant */
  grid-template-rows: 
    [summary-start] auto [summary-end]
    [description-start] auto [description-end] 
    [features-start] auto [features-end];
}

.summaryContainer {
  grid-area: summary;
  text-align: right; /* Per alignment rules */
}

.descriptionContainer {
  grid-area: description;
  text-align: right; /* Per alignment rules */
}

.featuresContainer {
  grid-area: features;
  display: grid;
  gap: var(--features-gap, 0.5rem);
}
```

### 7. Pricing Container Wrapping
```css
.pricingContainer {
  display: grid;
  place-items: center;
  padding: var(--pricing-padding, 0.75rem 0);
  border-top: 1px solid var(--divider-color, transparent);
  border-bottom: 1px solid var(--divider-color, transparent);
}

.priceWrapper {
  display: inline-grid;
  place-items: center;
  padding: var(--price-padding, 0.5rem 1rem);
  border-radius: 9999px;
  background: var(--price-bg);
  white-space: nowrap; /* Ensure single line */
  min-width: max-content; /* Prevent breaking */
}
```

### 8. Actions Container Wrapping
```css
.actionsContainer {
  display: grid;
  gap: var(--actions-gap, 0.75rem);
  grid-template-rows: auto auto; /* Divider row, Buttons row */
}

.actionsButtonsContainer {
  display: grid;
  gap: var(--buttons-gap, 0.75rem);
  /* Dynamic columns based on CTA count */
  grid-template-columns: repeat(var(--cta-count, 2), 1fr);
  justify-items: var(--cta-justify, stretch);
}

/* Single CTA centering */
.actionsButtonsContainer[data-single-cta="true"] {
  --cta-count: 1;
  --cta-justify: center;
  justify-items: center;
}
```

## Dynamic Responsiveness Rules

### 9. Container Size Adaptation
**Each container must adapt based on:**
- Available inline space (container queries)
- Content volume (auto-sizing)
- Variant type (standard/rail/compact)
- Device capabilities (touch/hover)

### 10. Content-Aware Containers
```css
/* Containers adapt to content presence */
.contentContainer:has(.summaryContainer:empty) {
  grid-template-rows: [description-start] auto [description-end] [features-start] auto [features-end];
}

.contentContainer:has(.descriptionContainer:empty) {
  grid-template-rows: [summary-start] auto [summary-end] [features-start] auto [features-end];
}

.contentContainer:has(.featuresContainer:empty) {
  grid-template-rows: [summary-start] auto [summary-end] [description-start] auto [description-end];
}
```

### 11. Variant-Specific Container Behavior
```css
/* Standard variant - All containers visible */
.packageCard[data-variant="default"] .contentContainer {
  grid-template-rows: auto auto auto; /* Summary, Description, Features */
}

/* Rail variant - Compact spacing */
.packageCard[data-variant="rail"] {
  --card-section-gap: 0.5rem;
  --content-gap: 0.5rem;
}

/* Compact variant - Minimal containers */
.packageCard[data-variant="pinned-compact"] .contentContainer {
  grid-template-rows: auto auto; /* Summary only, Features */
}

.packageCard[data-variant="pinned-compact"] .descriptionContainer {
  display: none; /* Never show in compact */
}
```

### 12. Overflow and Scroll Management
```css
/* Horizontal scroll for tags when needed */
.tagsContainer {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.tagsContainer::-webkit-scrollbar {
  display: none;
}

/* Text overflow for long content */
.summaryContainer,
.descriptionContainer {
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
}
```

### 13. Container State Management
```css
/* Loading states */
.packageCard[data-loading="true"] .contentContainer {
  opacity: 0.6;
  pointer-events: none;
}

/* Interactive states */
.packageCard:hover .mediaContainer {
  transform: scale(1.02);
}

.packageCard:focus-within .titleContainer {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}
```

### 14. Accessibility Container Rules
- All containers must have logical tab order
- Interactive containers need proper ARIA labels
- Container focus must be visually distinct
- Screen reader navigation must be intuitive
- Reduced motion preferences must be respected

### 15. Performance Container Rules
- Use `contain: layout style` on stable containers
- Implement `content-visibility: auto` for off-screen cards
- Minimize reflow with fixed container dimensions where possible
- Use `transform` instead of layout properties for animations
- Implement lazy loading for media containers

## Implementation Notes

**CSS Custom Properties for Dynamic Control:**
```css
:root {
  --card-section-gap: 1rem;
  --header-gap: 0.75rem;
  --content-gap: 0.75rem;
  --actions-gap: 0.75rem;
  --buttons-gap: 0.75rem;
  --cta-count: 2;
  --cta-justify: stretch;
}
```

**Container Query Support:**
All containers must use container queries instead of media queries for true component-level responsiveness.

**Grid Template Areas (Alternative Approach):**
```css
.packageCard {
  display: grid;
  grid-template-areas:
    "header"
    "content"
    "metadata"
    "pricing"
    "actions";
  grid-template-rows: auto auto auto auto auto;
}
```

This container architecture provides maximum layout control, ensures responsive behavior across all devices and screen sizes, and maintains the structural integrity needed for the PackageCard component to adapt dynamically to different contexts and content variations.