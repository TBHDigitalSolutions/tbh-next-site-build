# Testimonials Component

A specialized organism component for displaying client testimonials across service pages, with built-in rotation, filtering, and service-specific configurations.

## Overview

The Testimonials component is an organism-level component that provides a consistent interface for displaying social proof across all TBH Digital Solutions service pages. It extends beyond basic testimonial display with service-specific configurations, multiple layout options, and comprehensive data handling.

## File Structure

```
src/components/ui/organisms/Testimonials/
├── Testimonials.tsx              # Main server component wrapper
├── Testimonials.types.ts         # TypeScript contracts & service types
├── Testimonials.module.css       # Component-scoped styles
├── TestimonialSlider.tsx         # Client component for interactive behavior
├── TestimonialSlider.module.css  # Slider-specific styles
├── adapters.ts                   # Data transformation utilities
├── utils/                        # Validation and helper utilities
│   └── testimonialsValidator.ts   # Zod validation & normalization
├── README.md                     # This documentation
└── index.ts                      # Barrel exports
```

## Installation & Usage

### Basic Import

```tsx
import Testimonials from "@/components/ui/organisms/Testimonials";
import type { Testimonial, TestimonialsSection } from "@/components/ui/organisms/Testimonials";
```

### Service Page Integration

```tsx
// In your service page component
import { webDevTestimonialsSection } from "@/data/page/services-pages/web-development";

function WebDevPage() {
  return (
    <div>
      {/* Other sections */}
      <Testimonials {...webDevTestimonialsSection} />
    </div>
  );
}
```

## Type Definitions

### Testimonial

```typescript
interface Testimonial {
  id?: string | number;              // Optional unique identifier
  // Content (canonical fields)
  quote?: string;                    // Testimonial text (canonical)
  testimonial?: string;              // Legacy alias
  // Identity (canonical fields)  
  author?: string;                   // Client name (canonical)
  name?: string;                     // Legacy alias
  title?: string;                    // Role/position (canonical)
  role?: string;                     // Legacy alias
  company?: string;                  // Company name
  // Media & metadata
  image?: string;                    // Avatar image (canonical)
  avatarUrl?: string;                // Legacy alias
  rating?: number;                   // Star rating (1-5)
  date?: string;                     // Display date
  service?: string;                  // Service category
  project?: string;                  // Project context
  featured?: boolean;                // Featured testimonial flag
}
```

### TestimonialsSection (Service Page Contract)

```typescript
interface TestimonialsSection {
  title?: string;                    // Section title
  subtitle?: string;                 // Section subtitle
  data: TestimonialInput;            // Testimonials in various formats
  count?: number;                    // Number to display per rotation
  intervalMs?: number;               // Auto-rotation interval
  variant?: "default" | "cards" | "minimal";
  layout?: "grid" | "slider" | "carousel";
  enableFiltering?: boolean;         // Enable service filtering
  featuredOnly?: boolean;            // Show only featured testimonials
}
```

### Service-Specific Types

The component provides typed contracts for all service pages:

```typescript
// Available service-specific testimonial section types
type WebDevTestimonialsSection = TestimonialsSection;
type VideoTestimonialsSection = TestimonialsSection;
type LeadGenTestimonialsSection = TestimonialsSection;
type MarketingAutomationTestimonialsSection = TestimonialsSection;
type SEOServicesTestimonialsSection = TestimonialsSection;
type ContentProductionTestimonialsSection = TestimonialsSection;
```

## Data File Structure

### Service Testimonials Data Pattern

```typescript
// src/data/page/services-pages/web-development/testimonials/web-dev_testimonials.ts
import type { Testimonial, WebDevTestimonialsSection } from "@/components/ui/organisms/Testimonials";

const webDevTestimonials = [
  {
    id: "web-dev-1",
    quote: "Our website performance improved by 300% and conversions doubled within the first month.",
    author: "Sarah Johnson",
    title: "Marketing Director",
    company: "TechCorp Solutions",
    image: "/testimonials/sarah-johnson.jpg",
    rating: 5,
    date: "2024-01-15",
    featured: true
  },
  {
    id: "web-dev-2", 
    quote: "TBH delivered a beautiful, fast website that perfectly represents our brand.",
    author: "Michael Chen",
    title: "CEO",
    company: "Innovation Labs",
    image: "/testimonials/michael-chen.jpg",
    rating: 5,
    date: "2024-02-20"
  }
] satisfies Testimonial[];

export const webDevTestimonialsSection = {
  title: "Web Development Results",
  subtitle: "Fast, accessible, and easy-to-update sites that convert",
  data: webDevTestimonials,
  count: 3,
  intervalMs: 6000,
  variant: "cards",
  layout: "grid",
  featuredOnly: false
} satisfies WebDevTestimonialsSection;
```

### Barrel Export Pattern

```typescript
// src/data/page/services-pages/web-development/index.ts
export { webDevTestimonialsSection } from "./testimonials";
// ... other section exports
```

### Legacy Data Support

The component supports multiple data input formats for backward compatibility:

```typescript
// Legacy format 1: testimonialData prop
<Testimonials testimonialData={oldTestimonials} sectionTitle="Client Reviews" />

// Legacy format 2: nested object
const legacyData = { items: testimonialsArray };
<Testimonials data={legacyData} />

// Current format: direct data prop
<Testimonials data={testimonialsArray} title="Client Success Stories" />
```

## Component Features

### Visual Variants

```tsx
// Card-based layout (recommended for service pages)
<Testimonials variant="cards" data={testimonials} />

// Clean minimal design
<Testimonials variant="minimal" data={testimonials} />

// Standard layout
<Testimonials variant="default" data={testimonials} />
```

### Layout Options

```tsx
// Static grid layout
<Testimonials layout="grid" data={testimonials} />

// Auto-rotating slider
<Testimonials layout="slider" intervalMs={5000} data={testimonials} />

// Interactive carousel with controls
<Testimonials layout="carousel" data={testimonials} />
```

### Filtering & Display Options

```tsx
<Testimonials
  data={testimonials}
  enableFiltering={true}      // Filter by service type
  featuredOnly={true}         // Show only featured testimonials
  count={4}                   // Number to display at once
  intervalMs={6000}           // Auto-rotation interval
/>
```

## Service Page Implementation

### Step 1: Create Testimonials Data File

```typescript
// src/data/page/services-pages/seo-services/testimonials/seo_testimonials.ts
import type { Testimonial, SEOServicesTestimonialsSection } from "@/components/ui/organisms/Testimonials";

const seoTestimonials = [
  {
    id: "seo-1",
    quote: "Our organic traffic increased 250% in 6 months with TBH's SEO strategy.",
    author: "David Martinez",
    title: "Growth Manager",
    company: "E-commerce Plus",
    rating: 5,
    featured: true
  }
  // ... more testimonials
] satisfies Testimonial[];

export const seoServicesTestimonialsSection = {
  title: "SEO Services Results",
  subtitle: "Improved rankings and organic traffic growth",
  data: seoTestimonials,
  variant: "cards",
  featuredOnly: true
} satisfies SEOServicesTestimonialsSection;
```

### Step 2: Export from Service Barrel

```typescript
// src/data/page/services-pages/seo-services/index.ts
export { seoServicesTestimonialsSection } from "./testimonials";
```

### Step 3: Use in Page Component

```tsx
// src/app/services/seo-services/page.tsx
import Testimonials from "@/components/ui/organisms/Testimonials";
import { seoServicesTestimonialsSection } from "@/data/page/services-pages/seo-services";

export default function SEOServicesPage() {
  return (
    <div>
      {/* Other page sections */}
      <Testimonials {...seoServicesTestimonialsSection} />
    </div>
  );
}
```

## All Service Pages

The component supports all TBH Digital Solutions service pages:

- **Web Development** (`webDevTestimonialsSection`)
- **Video Production** (`videoTestimonialsSection`)
- **Lead Generation** (`leadGenTestimonialsSection`)
- **Marketing Automation** (`marketingAutomationTestimonialsSection`)
- **SEO Services** (`seoServicesTestimonialsSection`)
- **Content Production** (`contentProductionTestimonialsSection`)

## Data Adapters & Transformations

### Using Service-Specific Adapters

```typescript
import { createWebDevTestimonialsSection } from "@/components/ui/organisms/Testimonials/adapters";

// Create section with service-specific defaults
const webDevSection = createWebDevTestimonialsSection(testimonialData, {
  title: "Custom Web Development Results",
  variant: "minimal"
});
```

### CMS Integration

```typescript
import { 
  strapiTestimonialsAdapter,
  contentfulTestimonialsAdapter 
} from "@/components/ui/organisms/Testimonials/adapters";

// Strapi CMS integration
const strapiTestimonials = strapiTestimonialsAdapter(cmsData);

// Contentful CMS integration  
const contentfulTestimonials = contentfulTestimonialsAdapter(contentfulData);
```

### Legacy Data Migration

```typescript
import { legacyTestimonialMigrationAdapter } from "@/components/ui/organisms/Testimonials/adapters";

// Migrate old data format
const migratedTestimonials = legacyTestimonialMigrationAdapter(legacyData);
```

## Validation & Error Handling

### Using the Validator

```typescript
import { testimonialsValidator } from "@/components/ui/organisms/Testimonials/utils/testimonialsValidator";

// Validate testimonial data
const result = testimonialsValidator.validateCollection(rawData);
if (!result.isValid) {
  console.error("Testimonials validation errors:", result.errors);
}

// Create validated section
const section = testimonialsValidator.createValidatedSection(testimonials, {
  title: "Validated Testimonials"
});
```

### Data Normalization

The component automatically handles various input formats:

```typescript
// All of these work:
const testimonialInputs = [
  // Array format
  [{ quote: "Great service!", author: "John Doe" }],
  
  // Object with items
  { items: [{ quote: "Amazing work!", author: "Jane Smith" }] },
  
  // Object with testimonials
  { testimonials: [{ quote: "Excellent results!", author: "Bob Johnson" }] }
];
```

## Styling & Theming

The component uses CSS Modules with theme tokens:

```css
/* Testimonials.module.css uses theme tokens */
.testimonials-section {
  background: var(--gradient-section);
  color: var(--text-primary);
  padding-block: var(--section-pad-block-lg);
}

.testimonials-title {
  color: var(--text-accent);
  border-bottom: 2px solid var(--brand-blue);
}
```

### Dark Theme Support

```css
[data-theme="dark"] .testimonials-section {
  background: var(--gradient-section-dark);
}
```

## Performance Considerations

- **Lazy Loading**: Images are loaded with Next.js Image optimization
- **Auto-rotation**: Efficient interval management with cleanup
- **Memoization**: Component uses React.memo for testimonial cards
- **Data Filtering**: Client-side filtering for small datasets

## Accessibility

- **Keyboard Navigation**: Full keyboard accessibility for interactive elements
- **Screen Readers**: Proper ARIA labels and landmark roles
- **Focus Management**: Clear focus indicators and logical tab order
- **Motion Preferences**: Respects `prefers-reduced-motion` settings

## Best Practices

### Testimonial Content Guidelines

1. **Quotes**: Specific, outcome-focused, authentic
2. **Length**: Keep testimonials under 50 words for readability
3. **Attribution**: Include full name, title, and company
4. **Images**: Use high-quality professional photos (400x400px minimum)
5. **Ratings**: Include ratings when available for credibility

### Data Organization

```typescript
// Good: Specific, measurable outcomes
{
  quote: "Our website speed improved by 300% and conversions doubled within the first month.",
  author: "Sarah Johnson",
  title: "Marketing Director",
  company: "TechCorp Solutions",
  rating: 5,
  featured: true
}

// Avoid: Vague, generic testimonials
{
  quote: "Great work!",
  author: "Client",
  // Missing specific details
}
```

### Service Page Integration

1. Follow the data file naming convention: `{service}_testimonials.ts`
2. Use service-specific type annotations
3. Include at least 3-5 testimonials per service
4. Mark your best testimonials as `featured: true`
5. Include ratings when available

## Migration Guide

### From Inline Types

```typescript
// Old: Inline type definition
interface ClientTestimonial {
  name: string;
  text: string;
  company: string;
}

// New: Import from types
import type { Testimonial } from "@/components/ui/organisms/Testimonials";
```

### From Legacy Props

```typescript
// Old: Legacy props
<Testimonials 
  testimonialData={data}
  sectionTitle="Reviews"
/>

// New: Modern props  
<Testimonials
  data={data}
  title="Client Success Stories"
/>
```

## Related Components

- **FAQAccordion**: Questions and answers sections
- **GenericCard**: Base card component for various content types
- **PricingTiers**: Service pricing displays
- **CaseStudyCarousel**: Portfolio showcases

## Troubleshooting

### Common Issues

1. **Type Errors**: Ensure you're importing types from the correct component
2. **Data Validation**: Use the provided validators to check data integrity
3. **Missing Images**: Provide fallback images for testimonials without photos
4. **Auto-rotation Not Working**: Verify `intervalMs` is set to a positive number

### Debug Tools

```typescript
// Debug testimonials validation
import { debugTestimonialsValidation } from "./utils/testimonialsValidator";
debugTestimonialsValidation(yourTestimonialData, "Your Service Name");
```

### Performance Issues

- Limit to 10-15 testimonials per service for optimal performance
- Use `featuredOnly={true}` to reduce data load
- Optimize images (WebP format, proper sizing)
- Consider pagination for large testimonial collections

---

I've created a comprehensive README.md file for the Testimonials component that covers all aspects of its implementation and integration with the Service Page Type Contracts pattern.

## **Key Features of the README:**

### **Complete Documentation Structure**
- Overview of the component's role as an organism-level component
- Full file structure showing all component files and utilities
- Type definitions with canonical field mapping and alias support

### **Service Page Integration**
- Step-by-step implementation guide for all 6 service pages
- Data file structure following the established patterns
- Service-specific type contracts (WebDevTestimonialsSection, etc.)

### **Practical Code Examples**
- Real-world implementation examples
- CMS integration patterns (Strapi, Contentful, Google Reviews)
- Legacy data migration utilities
- Validation and error handling

### **Production-Ready Guidance**
- Best practices for testimonial content
- Performance considerations
- Accessibility compliance
- Troubleshooting common issues

### **Data Transformation Patterns**
- Service-specific adapters with appropriate defaults
- Multiple input format support
- Legacy compatibility layers
- Validation utilities

The README addresses the gaps identified in the current testimonials implementation by providing clear guidance on:

1. **Type Safety**: Proper TypeScript contracts following the service page patterns
2. **Data Structure**: Consistent file organization and naming conventions
3. **Service Integration**: Step-by-step implementation for each service page
4. **Validation**: Data integrity and error handling approaches
5. **Migration**: Path from legacy implementations to the new structure

This documentation ensures developers can implement testimonials consistently across all service pages while maintaining the type safety and organizational patterns established by the Service Page Type Contracts implementation guide.

---

I've created comprehensive scripts for both the Testimonials adapters and validator utilities.

## **Testimonials Adapters (adapters.ts)**

### **Core Features:**
- **Service-specific adapters** for all 6 services with tailored defaults
- **CMS integration** for Strapi, Contentful, Google Reviews, and Trustpilot
- **Legacy migration utilities** for various data formats
- **Page component integration helpers** for seamless service page usage

### **Key Adapters:**
```typescript
// Service-specific with optimized defaults
createWebDevTestimonialsSection() // Cards layout, no filtering
createVideoTestimonialsSection() // Slider layout, with filtering
createLeadGenTestimonialsSection() // Featured only, grid layout
// ... and 3 more services
```

### **External Integration:**
- **Strapi CMS**: Full attribute mapping with image handling
- **Google Reviews**: Auto-filters 4+ star reviews, truncates long text
- **Trustpilot**: Similar filtering with proper date handling
- **WordPress**: ACF field mapping with HTML stripping

## **Testimonials Validator (utils/testimonialsValidator.ts)**

### **Comprehensive Validation:**
- **Zod schemas** for runtime validation with detailed error reporting
- **Content requirements**: Ensures testimonials have both content and author
- **Quality checks**: Warns about short/long testimonials, missing images
- **Service-specific validators** for all 6 services

### **Advanced Features:**
```typescript
// Quality assessment
checkTestimonialsQuality(testimonials) // Returns score + recommendations

// Mock data generation
createMockTestimonials(5, "web-dev") // For development/testing

// Debug utilities
debugTestimonialsValidation(data, "SEO Services") // Detailed logging
```

### **Validation Capabilities:**
- **Content validation**: Requires meaningful content and author info
- **Quality scoring**: 100-point system with specific recommendations
- **Warning system**: Non-blocking warnings for quality improvements
- **Statistics tracking**: Counts images, ratings, featured testimonials

## **Key Integration Patterns:**

### **Service Page Usage:**
```typescript
// Validate and create section
const validation = seoServicesTestimonialsValidator.validate(rawData);
if (validation.isValid) {
  const section = createSEOServicesTestimonialsSection(validation.testimonials);
}
```

### **Quality Control:**
```typescript
// Check testimonials quality
const quality = checkTestimonialsQuality(testimonials);
if (quality.score < 70) {
  console.warn("Testimonials quality issues:", quality.recommendations);
}
```

The scripts provide robust data handling with comprehensive error checking, making testimonials implementation consistent and reliable across all service pages. The validation system helps maintain content quality while the adapters handle various data sources seamlessly.