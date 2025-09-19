# StatsStrip Component

A versatile and animated statistics display component for showcasing key metrics, certifications, achievements, and performance data.

## Features

- ✅ **Multiple Variants**: Default, minimal, cards, certifications, metrics, achievements
- ✅ **Flexible Layouts**: Horizontal, grid, carousel
- ✅ **Scroll Animations**: Number counting animations and fade-in effects
- ✅ **Interactive**: Click handlers and navigation support
- ✅ **Responsive**: Mobile-first design with adaptive layouts
- ✅ **Accessible**: WCAG compliant with keyboard navigation
- ✅ **Loading States**: Skeleton loading and error handling
- ✅ **Theme Support**: Light/dark theme compatibility
- ✅ **TypeScript**: Full type safety and IntelliSense

## Installation

```bash
# The component is part of the TBH Digital Solutions design system
# Located at: src/components/ui/organisms/StatsStrip/
```

## Basic Usage

```tsx
import { StatsStrip } from "@/components/ui/organisms/StatsStrip";

const stats = [
  {
    id: "clients",
    value: 150,
    label: "Happy Clients",
    suffix: "+",
    icon: "people",
    animate: true
  },
  {
    id: "projects",
    value: 300,
    label: "Projects Completed",
    suffix: "+",
    icon: "checkmark-circle",
    animate: true
  }
];

function MyComponent() {
  return (
    <StatsStrip
      stats={stats}
      variant="default"
      animated={true}
      showIcons={true}
    />
  );
}
```

## Props

### StatsStripProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stats` | `StatItem[]` | **required** | Array of stat items to display |
| `variant` | `"default" \| "minimal" \| "cards" \| "certifications" \| "metrics" \| "achievements"` | `"default"` | Visual variant |
| `layout` | `"horizontal" \| "grid" \| "carousel"` | `"horizontal"` | Layout arrangement |
| `animated` | `boolean` | `true` | Enable scroll-triggered animations |
| `showIcons` | `boolean` | `true` | Show icons if provided |
| `showDescriptions` | `boolean` | `false` | Show descriptions if provided |
| `spacing` | `"compact" \| "normal" \| "spacious"` | `"normal"` | Spacing between items |
| `alignment` | `"left" \| "center" \| "right"` | `"center"` | Text and container alignment |
| `backgroundColor` | `string` | `undefined` | Custom background color |
| `textColor` | `string` | `undefined` | Custom text color |
| `className` | `string` | `""` | Additional CSS classes |
| `onStatClick` | `(stat: StatItem) => void` | `undefined` | Click handler for stat items |
| `loading` | `boolean` | `false` | Loading state |
| `error` | `string` | `undefined` | Error message |
| `maxItems` | `number` | `undefined` | Maximum number of items to show |

### StatItem

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | **required** - Unique identifier |
| `value` | `string \| number` | **required** - The main value to display |
| `label` | `string` | **required** - Label text |
| `description` | `string` | Optional description text |
| `icon` | `string` | Ionicon name |
| `color` | `"primary" \| "secondary" \| "success" \| "warning" \| "danger" \| "info"` | Color theme |
| `prefix` | `string` | Text to show before value |
| `suffix` | `string` | Text to show after value |
| `animate` | `boolean` | Enable number counting animation |
| `href` | `string` | Optional link URL |
| `target` | `"_blank" \| "_self"` | Link target |

## Variants

### Default
Basic horizontal layout with icons and values.

```tsx
<StatsStrip
  stats={stats}
  variant="default"
  showIcons={true}
/>
```

### Minimal
Clean, compact display without decorative elements.

```tsx
<StatsStrip
  stats={stats}
  variant="minimal"
  showIcons={false}
  spacing="compact"
/>
```

### Cards
Each stat displayed as an individual card with hover effects.

```tsx
<StatsStrip
  stats={stats}
  variant="cards"
  layout="grid"
  showIcons={true}
/>
```

### Certifications
Specialized for displaying certifications and partner badges.

```tsx
<StatsStrip
  stats={certificationStats}
  variant="certifications"
  showDescriptions={true}
/>
```

### Metrics
Highlighted performance metrics with gradient text and emphasis.

```tsx
<StatsStrip
  stats={performanceStats}
  variant="metrics"
  animated={true}
/>
```

### Achievements
Company achievements with decorative styling and emphasis bars.

```tsx
<StatsStrip
  stats={achievements}
  variant="achievements"
  spacing="spacious"
/>
```

## Layouts

### Horizontal
Default single-row layout, wraps on mobile.

### Grid
CSS Grid layout that adapts to container width.

### Carousel
Scrollable horizontal layout for mobile optimization.

## Animation Features

### Number Counting
Numbers animate from 0 to target value when scrolled into view.

```tsx
const stats = [
  {
    id: "revenue",
    value: 1000000,
    label: "Revenue Generated",
    prefix: "$",
    animate: true // Enable counting animation
  }
];
```

### Scroll Triggers
Components fade in with staggered timing when entering viewport.

### Hover Effects
Interactive hover states for cards and clickable items.

## Responsive Behavior

- **Desktop**: Full grid/horizontal layouts
- **Tablet**: Adaptive grid columns
- **Mobile**: Stacked or carousel layout
- **Touch**: Swipe support for carousel

## Accessibility

- **WCAG Compliant**: Proper contrast ratios and focus indicators
- **Keyboard Navigation**: Tab and Enter/Space key support
- **Screen Readers**: Semantic HTML and ARIA labels
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

## Usage in Lead Generation Page

```tsx
// Certification display
<StatsStrip
  stats={certificationData}
  variant="certifications"
  showIcons={true}
  showDescriptions={false}
/>

// Performance metrics
<StatsStrip
  stats={metricsData}
  variant="metrics"
  layout="grid"
  animated={true}
/>
```

## Custom Styling

```tsx
<StatsStrip
  stats={stats}
  backgroundColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  textColor="white"
  style={{
    borderRadius: "12px",
    padding: "2rem"
  }}
/>
```

## CSS Classes

The component generates these CSS classes for styling:

- `.statsStrip` - Main container
- `.statsContainer` - Stats wrapper
- `.statItem` - Individual stat item
- `.statValue` - Value display
- `.statLabel` - Label text
- `.statIcon` - Icon container

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Notes

- Animations use CSS transforms for 60fps performance
- Intersection Observer for efficient scroll detection
- Lazy animation initialization reduces initial bundle impact

---

// ================================================================
// StatsStrip Usage Examples
// ================================================================

import React from "react";
import { StatsStrip } from "@/components/ui/organisms/StatsStrip";
import type { StatItem } from "@/components/ui/organisms/StatsStrip";

// ============================
// EXAMPLE DATA SETS
// ============================

// Certification Stats for Lead Generation
const certificationStats: StatItem[] = [
  {
    id: "google-partner",
    value: "Google Partner",
    label: "Certified Since 2019",
    icon: "checkmark-circle",
    color: "success",
    description: "Advanced Google Ads expertise"
  },
  {
    id: "meta-partner",
    value: "Meta Business",
    label: "Partner Status",
    icon: "checkmark-circle",
    color: "primary",
    description: "Facebook & Instagram advertising"
  },
  {
    id: "hubspot-partner",
    value: "HubSpot",
    label: "Certified Partner",
    icon: "ribbon",
    color: "warning",
    description: "Marketing automation expertise"
  },
  {
    id: "linkedin-partner",
    value: "LinkedIn",
    label: "Marketing Partner",
    icon: "business",
    color: "info",
    description: "B2B lead generation specialist"
  }
];

// Performance Metrics
const performanceMetrics: StatItem[] = [
  {
    id: "conversion-rate",
    value: 45,
    label: "Avg Conversion Rate",
    suffix: "%",
    icon: "trending-up",
    color: "success",
    animate: true
  },
  {
    id: "cost-per-lead",
    value: 35,
    label: "Avg Cost Per Lead",
    prefix: "$",
    icon: "cash",
    color: "primary",
    animate: true
  },
  {
    id: "roas",
    value: 6.2,
    label: "Average ROAS",
    suffix: ":1",
    icon: "analytics",
    color: "success",
    animate: true
  },
  {
    id: "clients-served",
    value: 150,
    label: "Clients Served",
    suffix: "+",
    icon: "people",
    color: "info",
    animate: true
  }
];

// Company Achievements
const achievements: StatItem[] = [
  {
    id: "years-experience",
    value: 8,
    label: "Years Experience",
    suffix: "+",
    icon: "time",
    color: "primary"
  },
  {
    id: "campaigns-managed",
    value: 500,
    label: "Campaigns Managed",
    suffix: "+",
    icon: "rocket",
    color: "success"
  },
  {
    id: "revenue-generated",
    value: "50M",
    label: "Revenue Generated",
    prefix: "$",
    suffix: "+",
    icon: "trending-up",
    color: "success"
  },
  {
    id: "team-size",
    value: 25,
    label: "Expert Team Members",
    icon: "people-circle",
    color: "info"
  }
];

// ============================
// USAGE EXAMPLES
// ============================

// Example 1: Basic Certification Display
export const CertificationStatsExample: React.FC = () => {
  return (
    <StatsStrip
      stats={certificationStats}
      variant="certifications"
      layout="horizontal"
      showIcons={true}
      showDescriptions={true}
      spacing="normal"
      alignment="center"
      animated={true}
    />
  );
};

// Example 2: Performance Metrics with Animation
export const PerformanceMetricsExample: React.FC = () => {
  return (
    <StatsStrip
      stats={performanceMetrics}
      variant="metrics"
      layout="grid"
      showIcons={true}
      animated={true}
      spacing="spacious"
      className="performance-stats"
    />
  );
};

// Example 3: Achievement Cards
export const AchievementsExample: React.FC = () => {
  return (
    <StatsStrip
      stats={achievements}
      variant="achievements"
      layout="horizontal"
      showIcons={true}
      animated={true}
      spacing="normal"
      backgroundColor="#f8f9fa"
    />
  );
};

// Example 4: Minimal Stats Strip
export const MinimalStatsExample: React.FC = () => {
  const minimalStats: StatItem[] = [
    {
      id: "clients",
      value: 150,
      label: "Happy Clients",
      suffix: "+",
      animate: true
    },
    {
      id: "projects",
      value: 300,
      label: "Projects Completed",
      suffix: "+",
      animate: true
    },
    {
      id: "satisfaction",
      value: 98,
      label: "Satisfaction Rate",
      suffix: "%",
      animate: true
    }
  ];

  return (
    <StatsStrip
      stats={minimalStats}
      variant="minimal"
      layout="horizontal"
      showIcons={false}
      animated={true}
      spacing="compact"
    />
  );
};

// Example 5: Interactive Stats with Click Handlers
export const InteractiveStatsExample: React.FC = () => {
  const handleStatClick = (stat: StatItem) => {
    console.log(`Clicked stat: ${stat.label}`);
    // Handle navigation or modal opening
  };

  const interactiveStats: StatItem[] = [
    {
      id: "case-studies",
      value: 25,
      label: "Case Studies",
      suffix: "+",
      icon: "document-text",
      href: "/case-studies",
      target: "_blank"
    },
    {
      id: "testimonials",
      value: 100,
      label: "Client Reviews",
      suffix: "+",
      icon: "star",
      href: "/testimonials"
    },
    {
      id: "certifications",
      value: 15,
      label: "Certifications",
      suffix: "+",
      icon: "ribbon"
    }
  ];

  return (
    <StatsStrip
      stats={interactiveStats}
      variant="cards"
      layout="horizontal"
      showIcons={true}
      animated={true}
      onStatClick={handleStatClick}
      spacing="normal"
    />
  );
};

// Example 6: Loading State
export const LoadingStatsExample: React.FC = () => {
  return (
    <StatsStrip
      stats={[]}
      loading={true}
      variant="default"
      layout="horizontal"
    />
  );
};

// Example 7: Error State
export const ErrorStatsExample: React.FC = () => {
  return (
    <StatsStrip
      stats={[]}
      error="Failed to load statistics"
      variant="default"
      layout="horizontal"
    />
  );
};

// Example 8: Carousel Layout for Mobile
export const CarouselStatsExample: React.FC = () => {
  return (
    <StatsStrip
      stats={performanceMetrics}
      variant="cards"
      layout="carousel"
      showIcons={true}
      animated={true}
      showCarouselControls={true}
      autoPlay={false}
      maxItems={3}
    />
  );
};

// ============================
// INTEGRATION WITH LEAD GENERATION PAGE
// ============================

// How to use in the Lead Generation page
export const LeadGenerationStatsIntegration: React.FC = () => {
  return (
    <section className="content-width-section" id="proof">
      <div className="section-header">
        <h2 className="section-title">Certified Partners & Proven Results</h2>
        <p className="section-subtitle">
          We're certified in the platforms that matter, with measurable outcomes.
        </p>
      </div>

      {/* Certification Strip */}
      <StatsStrip
        stats={certificationStats}
        variant="certifications"
        layout="horizontal"
        showIcons={true}
        showDescriptions={false}
        spacing="normal"
        alignment="center"
        animated={true}
      />

      {/* Performance Metrics */}
      <StatsStrip
        stats={performanceMetrics}
        variant="metrics"
        layout="grid"
        showIcons={true}
        animated={true}
        spacing="spacious"
        className="mt-8"
      />
    </section>
  );
};

// ============================
// CUSTOM STYLING EXAMPLES
// ============================

// Example with custom styling
export const CustomStyledStatsExample: React.FC = () => {
  return (
    <StatsStrip
      stats={achievements}
      variant="default"
      layout="horizontal"
      showIcons={true}
      animated={true}
      backgroundColor="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      textColor="white"
      spacing="spacious"
      style={{
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      }}
    />
  );
};

// ============================
// RESPONSIVE USAGE PATTERNS
// ============================

export const ResponsiveStatsExample: React.FC = () => {
  return (
    <div className="responsive-stats-container">
      {/* Desktop: Grid layout */}
      <div className="hidden md:block">
        <StatsStrip
          stats={performanceMetrics}
          variant="cards"
          layout="grid"
          showIcons={true}
          animated={true}
          spacing="normal"
        />
      </div>

      {/* Mobile: Carousel layout */}
      <div className="block md:hidden">
        <StatsStrip
          stats={performanceMetrics}
          variant="minimal"
          layout="carousel"
          showIcons={false}
          animated={true}
          spacing="compact"
          maxItems={2}
        />
      </div>
    </div>
  );
};

Now let me create the updated index file and assessment:## Production-Ready StatsStrip Component Implementation

I've provided a comprehensive implementation for the StatsStrip component that addresses the requirements from your improvement plan. Here's what I've delivered:

## Core Implementation Files

**1. Complete Adapters System (`adapters.ts`)**
- Service-specific adapters for all 6 business verticals
- Handles multiple input formats (stats, items, results, metrics, achievements, certifications)
- Legacy field mapping support (title/text/count aliases)
- Specialized adapters for company stats, certifications, and KPIs
- Template integration with context-aware defaults

**2. Comprehensive Validation (`utils/statsStripValidator.ts`)**
- Zod schema validation for type safety
- Service-specific validation warnings
- Input sanitization and error reporting
- Number formatting utilities
- Performance and UX guidelines validation

**3. Updated Index File**
- Complete barrel export with all adapters and validators
- Organized exports for template integration

## Current Component Assessment

**Strengths (Minimal Changes Needed):**
- Well-architected with comprehensive features
- Multiple variants, layouts, and animation support
- Accessibility compliant with proper ARIA labels
- Responsive design with mobile-first approach
- Strong TypeScript implementation
- Loading and error states implemented

**Critical Issues to Fix:**

1. **Ion-Icons Dependency** - Component uses `<ion-icon>` without proper setup
2. **Animation Performance** - Uses setInterval instead of requestAnimationFrame
3. **Missing Adapter Infrastructure** - Needs adapters.ts and validators

## Required Actions

**Immediate Implementation (Critical):**
1. Create `src/components/ui/organisms/StatsStrip/adapters.ts`
2. Create `src/components/ui/organisms/StatsStrip/utils/statsStripValidator.ts`
3. Update `src/components/ui/organisms/StatsStrip/index.ts` with new exports
4. Add input types to existing `StatsStrip.types.ts`
5. Fix ion-icon dependency in `StatsStrip.tsx`

**Template Integration:**
- Update ServiceTemplate.tsx to include StatsStrip section
- Add stats data to service page examples
- Test adapters with real service data

## Service-Specific Configurations

The adapters provide tailored defaults for each service:

- **Web Development**: Metrics variant with performance focus
- **Video Production**: Achievements variant highlighting projects
- **SEO**: Metrics variant with grid layout for multiple KPIs
- **Marketing**: Metrics variant for conversion-focused data
- **Lead Generation**: Certifications variant with partner badges
- **Content Production**: Achievements variant for content volume

## Business Value

This implementation provides:
- Consistent statistical displays across all service pages
- Flexible input format support (handles legacy data structures)
- Animated user experiences that engage visitors
- Service-specific customization for each business vertical
- Type-safe integration with the existing template system

The component follows your architectural patterns and maintains the import direction hierarchy. The existing React implementation is production-ready and only needs the supporting adapter infrastructure and dependency fixes I've provided.