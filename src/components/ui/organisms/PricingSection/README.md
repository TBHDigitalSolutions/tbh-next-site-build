# PricingSection Component

A specialized organism component for displaying pricing tiers across service pages, with built-in validation, comparison features, and service-specific configurations.

## Overview

The PricingSection component is an organism-level component that provides a consistent interface for displaying pricing information across all TBH Digital Solutions service pages. It handles multiple pricing formats, validation, and includes specialized adapters for different business models and external integrations.

## File Structure

```
src/components/ui/organisms/PricingSection/
├── PricingSection.tsx              # Main server component wrapper
├── PricingSection.types.ts         # TypeScript contracts & service types
├── PricingSection.module.css       # Component-scoped styles
├── adapters.ts                     # Data transformation utilities
├── utils/                          # Validation and helper utilities
│   └── PricingSectionValidator.ts  # Zod validation & normalization
├── README.md                       # This documentation
└── index.ts                        # Barrel exports
```

## Installation & Usage

### Basic Import

```tsx
import PricingSection from "@/components/ui/organisms/PricingSection";
import type { PricingTier, PricingSection as PricingSectionType } from "@/components/ui/organisms/PricingSection";
```

### Service Page Integration

```tsx
// In your service page component
import { webDevPricingSection } from "@/data/page/services-pages/web-development";

function WebDevPage() {
  return (
    <div>
      {/* Other sections */}
      <PricingSection {...webDevPricingSection} />
    </div>
  );
}
```

## Type Definitions

### PricingTier

```typescript
interface PricingTier {
  id: string;                        // Unique identifier
  name: string;                      // Tier name (e.g., "Basic", "Professional")
  price: string;                     // Price display (e.g., "$2,999", "Custom")
  startingFrom?: boolean;            // Whether this is a starting price
  period?: string;                   // Billing period ("project", "month", "year")
  description?: string;              // Brief description of ideal use case
  features: string[];                // List of included features
  featured?: boolean;                // Whether this tier is highlighted
  badge?: string;                    // Badge text (e.g., "Most Popular")
  turnaround?: string;               // Delivery timeframe
  revisions?: string;                // Number of revision rounds
  usage?: string;                    // Usage rights or limitations
  cta: PricingCTA;                   // Call-to-action configuration
  metadata?: {
    category?: string;
    complexity?: "basic" | "standard" | "premium";
    recommended?: boolean;
  };
}
```

### PricingSection (Service Page Contract)

```typescript
interface PricingSection {
  title?: string;                    // Section title
  subtitle?: string;                 // Section subtitle
  data: PricingInput;                // Pricing tiers in various formats
  variant?: "default" | "cards" | "minimal" | "comparison";
  layout?: "grid" | "list" | "comparison-table";
  columns?: 2 | 3 | 4;               // Grid column count
  showBillingToggle?: boolean;       // Show monthly/yearly toggle
  currency?: {
    code: string;                    // Currency code (USD, EUR, etc.)
    symbol: string;                  // Currency symbol ($, €, etc.)
  };
  notes?: PricingNotes;              // Additional disclaimers/info
}
```

### Service-Specific Types

The component provides typed contracts for all service pages:

```typescript
// Available service-specific pricing section types
type WebDevPricingSection = PricingSection;
type VideoPricingSection = PricingSection;
type LeadGenPricingSection = PricingSection;
type MarketingAutomationPricingSection = PricingSection;
type SEOServicesPricingSection = PricingSection;
type ContentProductionPricingSection = PricingSection;
```

## Data File Structure

### Service Pricing Data Pattern

```typescript
// src/data/page/services-pages/web-development/pricing/web-dev_pricing.ts
import type { PricingTier, WebDevPricingSection } from "@/components/ui/organisms/PricingSection";

const webDevPricing = [
  {
    id: "web-dev-starter",
    name: "Starter Website",
    price: "$2,999",
    description: "Perfect for small businesses getting online",
    features: [
      "5 custom pages",
      "Mobile-responsive design", 
      "Basic SEO optimization",
      "Contact form integration",
      "30 days of support"
    ],
    turnaround: "2-3 weeks",
    revisions: "3 rounds",
    usage: "Commercial use included",
    cta: {
      label: "Start Project",
      href: "/contact?service=web-dev&tier=starter",
      variant: "secondary"
    }
  },
  {
    id: "web-dev-professional",
    name: "Professional Website",
    price: "$5,999",
    description: "Ideal for growing businesses that need advanced features",
    features: [
      "15 custom pages",
      "Advanced animations",
      "E-commerce integration",
      "Performance optimization",
      "Analytics setup",
      "90 days of support"
    ],
    featured: true,
    badge: "Most Popular",
    turnaround: "4-6 weeks",
    revisions: "5 rounds", 
    usage: "Full commercial rights",
    cta: {
      label: "Get Professional",
      href: "/contact?service=web-dev&tier=professional",
      variant: "primary"
    }
  }
] satisfies PricingTier[];

export const webDevPricingSection = {
  title: "Web Development Investment",
  subtitle: "Transparent pricing for high-performance websites that drive results",
  data: webDevPricing,
  variant: "cards",
  columns: 3,
  notes: {
    disclaimer: "All packages include responsive design, SEO optimization, and support period.",
    guarantee: "100% satisfaction guaranteed or your money back within 30 days."
  }
} satisfies WebDevPricingSection;
```

### Barrel Export Pattern

```typescript
// src/data/page/services-pages/web-development/index.ts
export { webDevPricingSection } from "./pricing";
// ... other section exports
```

## Component Features

### Visual Variants

```tsx
// Card-based layout (recommended for most services)
<PricingSection variant="cards" data={pricing} />

// Comparison table format
<PricingSection variant="comparison" data={pricing} />

// Clean minimal design
<PricingSection variant="minimal" data={pricing} />
```

### Layout Options

```tsx
// Grid layout with configurable columns
<PricingSection layout="grid" columns={3} data={pricing} />

// Comparison table with feature matrix
<PricingSection layout="comparison-table" data={pricing} />

// Vertical list layout
<PricingSection layout="list" data={pricing} />
```

### Billing Toggle

```tsx
<PricingSection
  data={pricing}
  showBillingToggle={true}
  currency={{ code: "USD", symbol: "$" }}
/>
```

## Service Page Implementation

### Step 1: Create Pricing Data File

```typescript
// src/data/page/services-pages/seo-services/pricing/seo_pricing.ts
import type { PricingTier, SEOServicesPricingSection } from "@/components/ui/organisms/PricingSection";

const seoPricing = [
  {
    id: "seo-local",
    name: "Local SEO",
    price: "$1,499",
    period: "month", 
    description: "Perfect for local businesses",
    features: [
      "Local keyword optimization",
      "Google My Business setup",
      "Monthly reporting",
      "Citation building"
    ],
    turnaround: "2-4 weeks setup",
    cta: {
      label: "Start Local SEO",
      href: "/contact?service=seo&tier=local"
    }
  }
  // ... more tiers
] satisfies PricingTier[];

export const seoServicesPricingSection = {
  title: "SEO Services Investment",
  subtitle: "Data-driven SEO strategies that improve rankings and drive organic traffic",
  data: seoPricing,
  showBillingToggle: true,
  notes: {
    disclaimer: "SEO results typically show within 3-6 months. Timeline varies by competition.",
    guarantee: "Guaranteed ranking improvements or continued optimization at no additional cost."
  }
} satisfies SEOServicesPricingSection;
```

### Step 2: Export from Service Barrel

```typescript
// src/data/page/services-pages/seo-services/index.ts
export { seoServicesPricingSection } from "./pricing";
```

### Step 3: Use in Page Component

```tsx
// src/app/services/seo-services/page.tsx
import PricingSection from "@/components/ui/organisms/PricingSection";
import { seoServicesPricingSection } from "@/data/page/services-pages/seo-services";

export default function SEOServicesPage() {
  return (
    <div>
      {/* Other page sections */}
      <PricingSection {...seoServicesPricingSection} />
    </div>
  );
}
```

## All Service Pages

The component supports all TBH Digital Solutions service pages:

- **Web Development** (`webDevPricingSection`)
- **Video Production** (`videoPricingSection`)
- **Lead Generation** (`leadGenPricingSection`) 
- **Marketing Automation** (`marketingAutomationPricingSection`)
- **SEO Services** (`seoServicesPricingSection`)
- **Content Production** (`contentProductionPricingSection`)

## Data Adapters & Transformations

### Using Service-Specific Adapters

```typescript
import { createWebDevPricingSection } from "@/components/ui/organisms/PricingSection/adapters";

// Create section with service-specific defaults
const webDevSection = createWebDevPricingSection(pricingData, {
  title: "Custom Web Development Packages",
  variant: "comparison"
});
```

### External Integrations

```typescript
import { 
  stripePricingAdapter,
  cmsPricingAdapter 
} from "@/components/ui/organisms/PricingSection/adapters";

// Stripe integration
const stripePricing = stripePricingAdapter(stripeData);

// CMS integration
const cmsPricing = cmsPricingAdapter(contentfulData);
```

### Legacy Data Migration

```typescript
import { legacyPricingMigrationAdapter } from "@/components/ui/organisms/PricingSection/adapters";

// Migrate old pricing format
const migratedPricing = legacyPricingMigrationAdapter(legacyData);
```

## Validation & Error Handling

### Using the Validator

```typescript
import { pricingValidator } from "@/components/ui/organisms/PricingSection/utils/PricingSectionValidator";

// Validate pricing data
const result = pricingValidator.validateCollection(rawData);
if (!result.isValid) {
  console.error("Pricing validation errors:", result.errors);
}

// Create validated section
const section = pricingValidator.createValidatedSection(pricing, {
  title: "Validated Pricing"
});
```

### Quality Assessment

```typescript
import { checkPricingQuality } from "@/components/ui/organisms/PricingSection/utils/PricingSectionValidator";

const quality = checkPricingQuality(pricingTiers);
console.log(`Quality Score: ${quality.score}/100`);
quality.recommendations.forEach(rec => console.log(`Recommendation: ${rec}`));
```

### Data Normalization

The component automatically handles various input formats:

```typescript
// All of these work:
const pricingInputs = [
  // Array format
  [{ id: "basic", name: "Basic", price: "$99", features: [...], cta: {...} }],
  
  // Object with items
  { items: [{ id: "pro", name: "Pro", price: "$199", features: [...], cta: {...} }] },
  
  // Object with tiers
  { tiers: [{ id: "premium", name: "Premium", price: "$299", features: [...], cta: {...} }] }
];
```

## Styling & Theming

The component uses CSS Modules with theme tokens:

```css
/* PricingSection.module.css uses theme tokens */
.pricingSection {
  padding: var(--section-padding-vertical) 0;
  background: transparent;
}

.pricingTier {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}
```

### Dark Theme Support

```css
:root[data-theme="dark"] .pricingTier {
  background: var(--bg-elevated);
  border-color: var(--border-subtle);
}
```

## Performance Considerations

- **Static Data**: Pricing tiers are typically static and cached effectively
- **Image Optimization**: Any tier images use Next.js Image component
- **Lazy Loading**: Non-critical tiers can be rendered below the fold
- **Validation Caching**: Validation results are memoized for repeated calls

## Accessibility

- **Keyboard Navigation**: Full keyboard accessibility for interactive elements
- **Screen Readers**: Proper ARIA labels and semantic markup
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: All text meets WCAG AA standards

## Best Practices

### Pricing Content Guidelines

1. **Clear Value Proposition**: Each tier should have a clear target audience
2. **Feature Hierarchy**: Most important features listed first
3. **Pricing Psychology**: Use anchoring (high-value tier first) effectively
4. **Call-to-Action**: Specific, action-oriented CTA text
5. **Social Proof**: Include badges like "Most Popular" strategically

### Data Organization

```typescript
// Good: Clear value differentiation
{
  id: "professional",
  name: "Professional Website",
  price: "$5,999",
  description: "Perfect for growing businesses that need advanced functionality",
  features: [
    "Up to 15 custom pages",
    "Advanced e-commerce integration", 
    "Custom animations and interactions",
    "Performance optimization (95+ PageSpeed)",
    "Advanced SEO configuration"
  ],
  featured: true,
  cta: { label: "Start Professional Project", href: "/contact?tier=pro" }
}

// Avoid: Vague or generic descriptions
{
  name: "Package 2",
  price: "$5000",
  features: ["More features", "Better support"],
  cta: { label: "Buy Now", href: "/buy" }
}
```

### Service Page Integration

1. Follow the data file naming convention: `{service}_pricing.ts`
2. Use service-specific type annotations
3. Include 2-4 pricing tiers (optimal for decision-making)
4. Always mark one tier as `featured: true`
5. Include meaningful turnaround times and revision counts

## Migration Guide

### From Inline Types

```typescript
// Old: Inline type definition
interface PricingPackage {
  name: string;
  cost: string;
  features: string[];
}

// New: Import from types
import type { PricingTier } from "@/components/ui/organisms/PricingSection";
```

### From Legacy Props

```typescript
// Old: Legacy props
<PricingSection 
  pricingData={data}
  sectionTitle="Pricing"
/>

// New: Modern props
<PricingSection
  data={data}
  title="Investment Options"
/>
```

## Related Components

- **FAQAccordion**: Address common pricing questions
- **Testimonials**: Social proof supporting pricing decisions  
- **CTASection**: Drive action after pricing review
- **ComparisonTable**: Detailed feature comparisons

## Troubleshooting

### Common Issues

1. **Type Errors**: Ensure you're importing types from the correct component
2. **Data Validation**: Use provided validators to check data integrity
3. **Missing CTAs**: Every tier must have a complete CTA configuration
4. **Price Formatting**: Use consistent price formatting across tiers

### Debug Tools

```typescript
// Debug pricing validation
import { debugPricingValidation } from "./utils/PricingSectionValidator";
debugPricingValidation(yourPricingData, "Your Service Name");
```

### Performance Issues

- Limit to 4 tiers maximum for optimal decision-making
- Optimize any images used in pricing tiers
- Use static data when possible (avoid API calls for pricing)
- Consider A/B testing different pricing presentations

---

I've created a comprehensive README.md for the PricingSection component that covers all aspects of implementation and integration following the Service Page Type Contracts pattern.

## Key Features of the README:

### **Complete Implementation Guide**
- Step-by-step service page integration for all 6 services
- Data file structure with real examples showing proper `satisfies` usage
- Type contracts documentation with canonical field mapping

### **Practical Code Examples**
- Service-specific pricing configurations with tailored defaults
- External integration patterns (Stripe, CMS platforms)
- Legacy migration utilities for existing data

### **Comprehensive Feature Documentation**
- Visual variants (cards, comparison, minimal)
- Layout options (grid, comparison-table, list)
- Billing toggle functionality
- Currency configuration

### **Quality Guidelines**
- Pricing psychology best practices
- Content guidelines for effective tier descriptions
- Feature hierarchy recommendations
- CTA optimization suggestions

### **Production-Ready Patterns**
- Validation and error handling workflows
- Quality assessment tools (100-point scoring system)
- Performance optimization strategies
- Accessibility compliance details

The README provides developers with everything needed to implement pricing sections consistently across all service pages while maintaining the type safety, validation, and organizational patterns established by the Service Page Type Contracts implementation guide.

The documentation emphasizes practical implementation over theoretical concepts, providing working code examples and addressing common issues developers encounter when implementing pricing components.