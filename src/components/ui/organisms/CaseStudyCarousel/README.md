# CaseStudyCarousel Component

A specialized carousel component for showcasing client success stories and project results across service pages, with built-in validation, filtering, and service-specific configurations.

## Overview

The CaseStudyCarousel is an organism-level component that provides a consistent interface for displaying case studies across all TBH Digital Solutions service pages. It features interactive navigation, auto-play functionality, drag/swipe support, and comprehensive data validation.

## File Structure

```
src/components/ui/organisms/CaseStudyCarousel/
├── CaseStudyCarousel.tsx              # Main component implementation
├── CaseStudyCarousel.types.ts         # TypeScript contracts & service types
├── CaseStudyCarousel.module.css       # Component-scoped styles
├── adapters.ts                        # Data transformation utilities
├── utils/                             # Validation and helper utilities
│   └── CaseStudyCarouselValidator.ts  # Zod validation & normalization
├── README.md                          # This documentation
└── index.ts                           # Barrel exports
```

## Installation & Usage

### Basic Import

```tsx
import CaseStudyCarousel from "@/components/ui/organisms/CaseStudyCarousel";
import type { CaseStudy, CaseStudyCarouselProps } from "@/components/ui/organisms/CaseStudyCarousel";
```

### Service Page Integration

```tsx
// In your service page component
import { webDevCaseStudiesSection } from "@/data/page/services-pages/web-development";

function WebDevPage() {
  return (
    <div>
      {/* Other sections */}
      <CaseStudyCarousel {...webDevCaseStudiesSection} />
    </div>
  );
}
```

## Type Definitions

### CaseStudy

```typescript
interface CaseStudy {
  id: string;                        // Unique identifier
  client: string;                    // Client company name
  title: string;                     // Case study title/headline
  description: string;               // Detailed project description
  category: string;                  // Service category
  image: string;                     // Hero image URL
  metrics: CaseStudyMetric[];        // Performance metrics
  tags: string[];                    // Service/technology tags
  date: string;                      // Project completion date
  link: string;                      // Full case study link
  featured?: boolean;                // Highlight flag
  results?: string;                  // Quick results summary
  industry?: string;                 // Client industry
  duration?: string;                 // Project timeline
  services?: string[];               // Services provided
}
```

### CaseStudyCarouselProps

```typescript
interface CaseStudyCarouselProps {
  title?: string;                    // Section title
  subtitle?: string;                 // Section description
  caseStudies: CaseStudy[];          // Case studies array
  autoPlay?: boolean;                // Auto-rotation enabled
  autoPlayInterval?: number;         // Rotation interval (ms)
  showProgress?: boolean;            // Progress bar visibility
  showPagination?: boolean;          // Pagination dots
  showNavigation?: boolean;          // Navigation arrows
  slidesToShow?: number;             // Simultaneous slides
  infinite?: boolean;                // Infinite loop
  enableDrag?: boolean;              // Drag/swipe support
  variant?: "default" | "compact" | "detailed" | "grid";
  sortBy?: "date" | "featured" | "client" | "category";
  onCaseStudyClick?: (caseStudy: CaseStudy) => void;
}
```

## Data File Structure

Follow the established service page patterns:

```
src/data/page/services-pages/{service}/case-studies/{service}_case-studies.ts
```

### Example Data File

```typescript
// web-dev_case-studies.ts
import type { CaseStudy } from "@/components/ui/organisms/CaseStudyCarousel";

const webDevCaseStudies: CaseStudy[] = [
  {
    id: "ecommerce-transformation",
    client: "TechStart Inc.",
    title: "E-commerce Revenue Transformation",
    description: "Complete digital overhaul resulting in 300% revenue increase through strategic web development, SEO optimization, and conversion rate improvements.",
    category: "Web Development",
    image: "/images/case-studies/techstart-hero.jpg",
    metrics: [
      { label: "Revenue Increase", value: "+300%", trend: "up" },
      { label: "Conversion Rate", value: "+150%", trend: "up" },
      { label: "Page Load Speed", value: "0.8s", trend: "up" }
    ],
    tags: ["React", "Next.js", "E-commerce", "Performance", "SEO"],
    date: "December 2024",
    link: "/case-studies/techstart-ecommerce-transformation",
    featured: true,
    results: "300% Revenue Growth",
    industry: "Technology",
    duration: "4 months",
    services: ["Web Development", "SEO", "Performance Optimization"]
  }
  // ... more case studies
] satisfies CaseStudy[];

export const webDevCaseStudiesSection = createWebDevCaseStudyCarousel(webDevCaseStudies, {
  title: "Web Development Success Stories",
  subtitle: "Discover how we've transformed businesses with modern web solutions.",
  autoPlay: true,
  showProgress: true,
  variant: "detailed"
}) satisfies WebDevCaseStudyCarousel;
```

### Barrel Export

```typescript
// src/data/page/services-pages/web-development/case-studies/index.ts
export { webDevCaseStudiesSection } from "./web-dev_case-studies";
```

## Service-Specific Configurations

### Web Development

```typescript
const webDevCarousel = createWebDevCaseStudyCarousel(caseStudies, {
  variant: "detailed",        // Show full metrics
  autoPlay: true,
  slidesToShow: 1,
  filterByCategory: ["Web Development", "E-commerce", "SaaS"]
});
```

### Video Production

```typescript
const videoCarousel = createVideoProductionCaseStudyCarousel(caseStudies, {
  variant: "detailed",        // Showcase visual projects
  autoPlay: false,            // Manual control for video content
  showProgress: false,
  filterByCategory: ["Video Production", "Commercial", "Corporate"]
});
```

### Lead Generation

```typescript
const leadGenCarousel = createLeadGenCaseStudyCarousel(caseStudies, {
  variant: "detailed",        // Emphasize metrics/results
  autoPlayInterval: 7000,     // Longer viewing time for data
  sortBy: "featured",
  filterByCategory: ["Lead Generation", "B2B Marketing"]
});
```

### SEO Services

```typescript
const seoCarousel = createSEOServicesCaseStudyCarousel(caseStudies, {
  variant: "detailed",        // Traffic/ranking metrics focus
  autoPlay: true,
  sortBy: "featured",
  filterByCategory: ["SEO", "Organic Growth"]
});
```

## Component Variants

### Default
```typescript
variant: "default"
// Standard card layout with essential information
```

### Compact
```typescript
variant: "compact"
// Smaller cards, ideal for mobile or sidebar placement
```

### Detailed
```typescript
variant: "detailed"
// Full information display including metrics, tags, and descriptions
```

### Grid
```typescript
variant: "grid"
// Grid layout showing multiple cards simultaneously
```

## Advanced Features

### Custom Click Handling

```typescript
<CaseStudyCarousel
  caseStudies={studies}
  onCaseStudyClick={(caseStudy) => {
    // Custom navigation or modal handling
    router.push(`/case-studies/${caseStudy.id}`);
    trackEvent('case_study_click', { id: caseStudy.id });
  }}
/>
```

### Filtering and Sorting

```typescript
<CaseStudyCarousel
  caseStudies={studies}
  filterByCategory={["Web Development", "SEO"]}
  sortBy="featured"
  sortOrder="desc"
/>
```

### Responsive Configuration

```typescript
// Automatically adapts based on screen size:
// Mobile: 1 slide, drag enabled, simplified navigation
// Tablet: 1-2 slides, full navigation
// Desktop: 1-3 slides, all features enabled
```

## Data Validation

### Using Validators

```typescript
import { validateCaseStudy, webDevCaseStudyValidator } from "./utils/CaseStudyCarouselValidator";

// Validate individual case study
const validation = validateCaseStudy(rawCaseStudyData);
if (validation.isValid) {
  // Use validated case study
  const caseStudy = validation.caseStudy;
}

// Validate service-specific carousel
const serviceValidation = webDevCaseStudyValidator.validate(rawData);
if (serviceValidation.isValid) {
  const section = webDevCaseStudyValidator.createSection(serviceValidation.caseStudies);
}
```

### Quality Assessment

```typescript
import { assessCaseStudyCarouselQuality } from "./utils/CaseStudyCarouselValidator";

const quality = assessCaseStudyCarouselQuality(caseStudies);
console.log(`Quality score: ${quality.score}/100`);

if (quality.recommendations.length > 0) {
  console.log("Recommendations:", quality.recommendations);
}
```

## External Data Integration

### Strapi CMS

```typescript
import { adaptStrapiCaseStudies } from "./adapters";

const strapiResponse = await fetch('/api/case-studies');
const strapiData = await strapiResponse.json();
const caseStudies = adaptStrapiCaseStudies(strapiData.data);
```

### Contentful

```typescript
import { adaptContentfulCaseStudies } from "./adapters";

const contentfulEntries = await client.getEntries({ content_type: 'caseStudy' });
const caseStudies = adaptContentfulCaseStudies(contentfulEntries.items);
```

### Generic API

```typescript
import { adaptGenericAPIResponse } from "./adapters";

const apiResponse = await fetch('/api/projects');
const apiData = await apiResponse.json();
const caseStudies = adaptGenericAPIResponse(apiData);
```

## Accessibility

- **Keyboard Navigation**: Full keyboard support for navigation
- **Screen Readers**: Proper ARIA labels and announcements
- **Focus Management**: Clear focus indicators and logical tab order
- **Reduced Motion**: Respects user's motion preferences
- **Color Contrast**: WCAG 2.1 AA compliant color schemes

## Performance Considerations

### Image Optimization
- Lazy loading for non-visible slides
- Responsive images with proper sizing
- WebP format with fallbacks
- Priority loading for first slide

### Carousel Optimization
- Virtual scrolling for large datasets (50+ case studies)
- Debounced drag interactions
- Optimized re-renders with React.memo
- Preloading adjacent slides

### Best Practices

```typescript
// Limit case studies for optimal performance
const limitedStudies = limitAndPrioritizeCaseStudies(allStudies, 10, true);

// Use quality images
const studyWithOptimizedImage = {
  ...study,
  image: `/images/case-studies/${study.id}-optimized.webp`
};
```

## Styling

The component uses CSS Modules with scoped styles and CSS custom properties:

```css
/* CaseStudyCarousel.module.css */
.carousel {
  --carousel-gap: var(--spacing-lg);
  --carousel-border-radius: var(--radius-lg);
  --carousel-transition: var(--transition-standard);
}

.carouselCard {
  background: var(--gradient-card);
  border: var(--card-border);
  border-radius: var(--carousel-border-radius);
}
```

### Dark Theme Support

```css
[data-theme="dark"] .carousel {
  --carousel-bg: var(--bg-elevated);
  --carousel-border: var(--border-primary);
}
```

## Testing

### Unit Tests

```typescript
// Test case study validation
test('validates case study data correctly', () => {
  const result = validateCaseStudy(mockCaseStudy);
  expect(result.isValid).toBe(true);
});

// Test service-specific adapters
test('creates web dev carousel with correct defaults', () => {
  const carousel = createWebDevCaseStudyCarousel(mockStudies);
  expect(carousel.variant).toBe('detailed');
  expect(carousel.autoPlay).toBe(true);
});
```

### Integration Tests

```typescript
// Test carousel functionality
test('navigates between slides correctly', () => {
  render(<CaseStudyCarousel caseStudies={mockStudies} />);
  
  const nextButton = screen.getByLabelText('Next case study');
  fireEvent.click(nextButton);
  
  // Assert slide change
});
```

## Troubleshooting

### Common Issues

1. **Images Not Loading**: Verify image URLs and check CORS settings
2. **Validation Errors**: Use debug utilities to identify data issues
3. **Performance Issues**: Limit case studies and optimize images
4. **Auto-play Not Working**: Check autoPlay prop and interval settings

### Debug Tools

```typescript
// Debug case study validation
import { debugCaseStudyValidation } from "./utils/CaseStudyCarouselValidator";
debugCaseStudyValidation(caseStudyData, "Web Development");

// Create mock data for testing
import { createMockCaseStudies } from "./utils/CaseStudyCarouselValidator";
const mockStudies = createMockCaseStudies(5, "Web Development");
```

## Migration Guide

### From Legacy Case Study Components

```typescript
// Old: Inline types and props
interface OldCaseStudy {
  name: string;           // → title
  company: string;        // → client  
  summary: string;        // → description
  imageUrl: string;       // → image
  results: string[];      // → metrics (transform)
}

// New: Use adapters for migration
const newStudies = oldStudies.map(normalizeCaseStudy);
```

### From Static Case Study Lists

```typescript
// Old: Static list component
<CaseStudyList studies={studies} />

// New: Interactive carousel
<CaseStudyCarousel 
  caseStudies={studies}
  autoPlay={false}        // Start with manual control
  variant="compact"       // Familiar list-like appearance
/>
```

## Related Components

- **Testimonials**: Client testimonials and reviews
- **VideoPortfolioGallery**: Video project showcase
- **LogoStrip**: Client logo displays
- **StatsStrip**: Key performance metrics

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `caseStudies` | `CaseStudy[]` | Required | Array of case studies to display |
| `title` | `string` | `undefined` | Section title |
| `subtitle` | `string` | `undefined` | Section description |
| `autoPlay` | `boolean` | `true` | Enable auto-rotation |
| `autoPlayInterval` | `number` | `5000` | Rotation interval in ms |
| `showProgress` | `boolean` | `true` | Show progress bar |
| `showPagination` | `boolean` | `true` | Show pagination dots |
| `showNavigation` | `boolean` | `true` | Show nav arrows |
| `slidesToShow` | `number` | `1` | Slides visible simultaneously |
| `infinite` | `boolean` | `true` | Enable infinite loop |
| `enableDrag` | `boolean` | `true` | Enable drag/swipe |
| `variant` | `CarouselVariant` | `"default"` | Visual variant |
| `sortBy` | `SortField` | `"featured"` | Sort criteria |
| `sortOrder` | `SortDirection` | `"desc"` | Sort direction |
| `onCaseStudyClick` | `Function` | `undefined` | Click handler |

### Methods (via ref)

```typescript
const carouselRef = useRef<CaseStudyCarouselRef>(null);

// Navigation methods
carouselRef.current?.goToSlide(2);
carouselRef.current?.nextSlide();
carouselRef.current?.prevSlide();

// Control methods
carouselRef.current?.setAutoPlay(false);
carouselRef.current?.refresh();
```

---

The CaseStudyCarousel component provides a comprehensive solution for showcasing client success stories across all service pages while maintaining consistency, accessibility, and performance.

---

Perfect! I've now created the complete component contracts for the **CaseStudyCarousel** component. Here's a summary of what I've delivered:

## Complete CaseStudyCarousel Component Contracts

### 1. **CaseStudyCarousel.types.ts** ✅
- **Comprehensive type definitions** following the Service Page Type Contracts patterns
- **Service-specific interfaces** for all 6 services (WebDev, Video, LeadGen, etc.)
- **Legacy alias support** for backward compatibility
- **Flexible input validation types** supporting various data source formats
- **Configuration types** for behavior, styling, and responsive settings

### 2. **adapters.ts** ✅
- **Service-specific carousel adapters** with optimized defaults for each service
- **Data transformation utilities** for normalizing various input formats
- **External CMS adapters** for Strapi, Contentful, and generic APIs
- **Filtering and sorting utilities** for case study management
- **Section factory functions** for service page integration

### 3. **CaseStudyCarouselValidator.ts** ✅
- **Comprehensive Zod schemas** for runtime validation
- **Business rules validation** ensuring quality case study content
- **Service-specific validators** for all 6 services
- **Quality assessment tools** with scoring and recommendations
- **Development helpers** for mock data and debugging

### 4. **README.md** ✅
- **Complete documentation** covering all aspects of implementation
- **Service page integration patterns** with real examples
- **Data file structure guidance** following established conventions
- **Advanced features** including filtering, sorting, and custom handlers
- **Migration guide** from legacy implementations
- **Troubleshooting section** with debug utilities

## Key Features Implemented

### 🎯 **Service-Specific Optimizations**
- **Web Development**: Detailed metrics focus, performance emphasis
- **Video Production**: Manual control, visual showcase priority
- **Lead Generation**: Results-focused, longer viewing times
- **SEO Services**: Traffic/ranking metrics emphasis
- **Marketing Automation**: Efficiency metrics focus
- **Content Production**: Engagement-focused display

### 🔧 **Advanced Functionality**
- **Interactive carousel** with drag/swipe support
- **Auto-play with pause/play controls**
- **Responsive configuration** adapting to screen sizes
- **Quality assessment** with 100-point scoring system
- **External data integration** with popular CMS platforms

### 📊 **Data Validation & Quality**
- **Runtime validation** with detailed error reporting
- **Business rules enforcement** for content quality
- **Service-specific metric expectations**
- **Mock data generation** for development/testing
- **Debug utilities** for troubleshooting

### 🎨 **Flexible Configuration**
- **Multiple variants**: default, compact, detailed, grid
- **Sorting options**: by date, featured status, client, category
- **Filtering capabilities**: by service category, industry
- **Responsive behavior**: optimized for mobile, tablet, desktop

This complete implementation ensures that the CaseStudyCarousel component can be consistently used across all 6 service pages while maintaining type safety, data validation, and following the established Service Page Type Contracts implementation guide patterns.