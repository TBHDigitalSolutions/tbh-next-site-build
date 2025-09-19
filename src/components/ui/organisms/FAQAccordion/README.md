# FAQAccordion Component

A specialized accordion component for displaying Frequently Asked Questions (FAQs) across service pages, with built-in validation, search, and category filtering.

## Overview

FAQAccordion is an organism-level component that extends the base Accordion molecule with FAQ-specific business logic, data handling, and service page integration. It provides a consistent interface for FAQ sections across all TBH Digital Solutions service pages.

## File Structure

```
src/components/ui/organisms/FAQAccordion/
├── FAQAccordion.module.css    # Component-scoped styles
├── FAQAccordion.tsx           # Main component implementation  
├── FAQAccordion.types.ts      # TypeScript contracts & service types
├── README.md                  # This documentation
├── index.ts                   # Barrel exports
└── utils/
    └── faqAccordionValidator.ts # Zod validation & transformation
```

## Installation & Usage

### Basic Import

```tsx
import FAQAccordion from "@/components/ui/organisms/FAQAccordion";
import type { FAQItem, FAQSection } from "@/components/ui/organisms/FAQAccordion";
```

### Service Page Integration

```tsx
// In your service page component
import { webDevFAQSection } from "@/data/page/services-pages/web-development";

function WebDevPage() {
  return (
    <div>
      {/* Other sections */}
      <FAQAccordion {...webDevFAQSection} />
    </div>
  );
}
```

## Type Definitions

### FAQItem

```typescript
interface FAQItem {
  id?: string;                           // Optional unique identifier
  question?: string;                     // FAQ question text (canonical)
  answer?: string | React.ReactNode;     // FAQ answer content (canonical) 
  category?: string | null;              // Optional category for organization
  tags?: string[];                       // Optional tags for enhanced filtering
}
```

### FAQSection (Service Page Contract)

```typescript
interface FAQSection {
  title?: string;                        // Section title
  subtitle?: string;                     // Section subtitle  
  data: FAQInput;                        // FAQ items in various formats
  variant?: "default" | "bordered" | "minimal" | "cards";
  enableSearch?: boolean;                // Enable search functionality
  enableCategoryFilter?: boolean;        // Enable category filtering
  allowMultiple?: boolean;               // Allow multiple FAQs open
}
```

### Service-Specific Types

The component provides typed contracts for all service pages:

```typescript
// Available service-specific FAQ section types
type WebDevFAQSection = FAQSection;
type VideoFAQSection = FAQSection;  
type LeadGenFAQSection = FAQSection;
type MarketingAutomationFAQSection = FAQSection;
type SEOServicesFAQSection = FAQSection;
type ContentProductionFAQSection = FAQSection;
```

## Data File Structure

### Service FAQ Data Pattern

```typescript
// src/data/page/services-pages/web-development/faq/web-dev_faq.ts
import type { FAQItem, WebDevFAQSection } from "@/components/ui/organisms/FAQAccordion";

const webDevFAQs = [
  {
    id: "web-dev-1",
    question: "How long does a typical website project take?",
    answer: "Most projects complete in 4-8 weeks depending on complexity and requirements.",
    category: "Timeline",
    tags: ["timeline", "project-duration", "planning"]
  },
  {
    id: "web-dev-2", 
    question: "Do you provide ongoing maintenance?",
    answer: "Yes, we offer comprehensive maintenance packages including updates, security monitoring, and performance optimization.",
    category: "Services",
    tags: ["maintenance", "support", "ongoing"]
  },
  {
    id: "web-dev-3",
    question: "What technologies do you use?",
    answer: `We use modern technologies including:
    - Next.js & React for frontend
    - Node.js for backend services  
    - Tailwind CSS for styling
    - Vercel/AWS for hosting`,
    category: "Technical",
    tags: ["technology", "stack", "frameworks"]
  }
] satisfies FAQItem[];

export const webDevFAQSection = {
  title: "Web Development FAQ",
  subtitle: "Common questions about our web development process",
  data: webDevFAQs,
  variant: "bordered",
  enableSearch: true,
  enableCategoryFilter: true,
  allowMultiple: false,
} satisfies WebDevFAQSection;
```

### Barrel Export Pattern

```typescript
// src/data/page/services-pages/web-development/index.ts
export { webDevFAQSection } from "./faq";
// ... other section exports
```

### Legacy Data Support

The component supports multiple data input formats for backward compatibility:

```typescript
// Legacy format 1: faqData prop
<FAQAccordion faqData={oldFAQData} sectionTitle="Legacy FAQ" />

// Legacy format 2: nested object
const legacyData = { items: faqArray };
<FAQAccordion data={legacyData} />

// Current format: direct faqs prop  
<FAQAccordion faqs={faqArray} title="Modern FAQ" />
```

## Component Features

### Search & Filtering

```tsx
<FAQAccordion
  faqs={faqData}
  enableSearch={true}
  enableCategoryFilter={true}
  searchPlaceholder="Search FAQ..."
/>
```

### Visual Variants

```tsx
// Bordered cards (recommended for service pages)
<FAQAccordion variant="bordered" faqs={faqData} />

// Minimal flat design
<FAQAccordion variant="minimal" faqs={faqData} />

// Card-based layout
<FAQAccordion variant="cards" faqs={faqData} />
```

### Interactive Behavior

```tsx
<FAQAccordion
  faqs={faqData}
  allowMultiple={false}  // Only one FAQ open at a time
  enableSearch={true}
  enableCategoryFilter={true}
/>
```

## Validation & Error Handling

### Using the Validator

```typescript
import { webDevFAQValidator } from "@/components/ui/organisms/FAQAccordion/utils/faqAccordionValidator";

// Validate FAQ data
const result = webDevFAQValidator.validate(rawFAQData);
if (!result.isValid) {
  console.error("FAQ validation errors:", result.errors);
}

// Create validated section
const faqSection = webDevFAQValidator.createSection(faqData, {
  title: "Custom Web Development FAQ",
  variant: "bordered"
});
```

### Data Normalization

The component automatically handles various input formats:

```typescript
// All of these work:
const faqInputs = [
  // Array format
  [{ question: "...", answer: "..." }],
  
  // Object with items
  { items: [{ question: "...", answer: "..." }] },
  
  // Object with faqs
  { faqs: [{ question: "...", answer: "..." }] },
  
  // Legacy faqData format  
  { faqData: [{ question: "...", answer: "..." }] }
];
```

## Service Page Implementation

### Step 1: Create FAQ Data File

```typescript
// src/data/page/services-pages/seo-services/faq/seo_faq.ts
import type { FAQItem, SEOServicesFAQSection } from "@/components/ui/organisms/FAQAccordion";

const seoFAQs = [
  {
    id: "seo-1",
    question: "How long does SEO take to show results?",
    answer: "SEO typically shows initial improvements in 3-6 months, with significant results in 6-12 months.",
    category: "Timeline",
    tags: ["timeline", "results", "expectations"]
  }
  // ... more FAQs
] satisfies FAQItem[];

export const seoServicesFAQSection = {
  title: "SEO Services FAQ", 
  subtitle: "Everything you need to know about our SEO process",
  data: seoFAQs,
  variant: "cards",
  enableSearch: true,
  enableCategoryFilter: true
} satisfies SEOServicesFAQSection;
```

### Step 2: Export from Service Barrel

```typescript
// src/data/page/services-pages/seo-services/index.ts
export { seoServicesFAQSection } from "./faq";
```

### Step 3: Use in Page Component

```tsx
// src/app/services/seo-services/page.tsx
import FAQAccordion from "@/components/ui/organisms/FAQAccordion";
import { seoServicesFAQSection } from "@/data/page/services-pages/seo-services";

export default function SEOServicesPage() {
  return (
    <div>
      {/* Other page sections */}
      <FAQAccordion {...seoServicesFAQSection} />
    </div>
  );
}
```

## All Service Pages

The component supports all TBH Digital Solutions service pages:

- **Web Development** (`webDevFAQSection`)
- **Video Production** (`videoFAQSection`) 
- **Lead Generation** (`leadGenFAQSection`)
- **Marketing Automation** (`marketingAutomationFAQSection`)
- **SEO Services** (`seoServicesFAQSection`)
- **Content Production** (`contentProductionFAQSection`)

## Validation Utilities

### Pre-configured Validators

```typescript
import { 
  webDevFAQValidator,
  videoFAQValidator,
  leadGenFAQValidator,
  marketingAutomationFAQValidator,
  seoServicesFAQValidator,
  contentProductionFAQValidator
} from "@/components/ui/organisms/FAQAccordion/utils/faqAccordionValidator";

// Use service-specific validator
const result = seoServicesFAQValidator.validate(faqData);
```

### Development Helpers

```typescript
import { createMockFAQs, debugFAQValidation } from "@/components/ui/organisms/FAQAccordion/utils/faqAccordionValidator";

// Create test data
const mockFAQs = createMockFAQs(5, "web-dev");

// Debug validation issues
debugFAQValidation(problematicData, "Web Development");
```

## Accessibility

- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and structure  
- **Focus Management**: Clear focus indicators
- **Semantic HTML**: Proper heading hierarchy and landmark roles

## Styling

The component uses CSS Modules with scoped styles:

```css
/* FAQAccordion.module.css uses theme tokens */
.faq {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.faqHeader {
  border-bottom: 2px solid color-mix(in oklab, var(--brand-blue) 30%, transparent);
}
```

### Dark Theme Support

```css
[data-theme="dark"] .faq :global(.faq-accordion) {
  background: var(--bg-elevated);
}
```

## Performance Considerations

- **Component Memoization**: React.memo optimization
- **Search Debouncing**: Built-in search performance
- **Lazy Content**: Content rendered but hidden when collapsed
- **Category Extraction**: Memoized category derivation

## Best Practices

### FAQ Content Guidelines

1. **Questions**: Clear, specific, user-focused
2. **Answers**: Concise but comprehensive
3. **Categories**: Logical grouping (Timeline, Pricing, Technical, etc.)
4. **Tags**: Relevant keywords for search functionality

### Data Organization

```typescript
// Good: Clear categories and searchable content
{
  question: "How long does a typical website project take?",
  answer: "Most projects complete in 4-8 weeks...",
  category: "Timeline", 
  tags: ["timeline", "project-duration"]
}

// Avoid: Vague questions and missing metadata
{
  question: "About projects?",
  answer: "It depends.",
  // Missing category and tags
}
```

### Service Page Integration

1. Follow the data file naming convention: `{service}_faq.ts`
2. Use service-specific type annotations
3. Include validation in your build process
4. Test with the provided validators

## Migration Guide

### From Inline Types

```typescript
// Old: Inline type definition
type Faq = {
  id?: string;
  question?: string;
  answer?: string | React.ReactNode;
  category?: string | null;
  tags?: string[];
};

// New: Import from types
import type { FAQItem } from "@/components/ui/organisms/FAQAccordion";
```

### From Legacy Props

```typescript
// Old: Legacy props
<FAQAccordion 
  faqData={data} 
  sectionTitle="FAQ" 
/>

// New: Modern props
<FAQAccordion 
  faqs={data}
  title="FAQ"
/>
```

## Related Components

- **Accordion**: Base molecule component
- **Testimonials**: Social proof sections
- **PricingTiers**: Service pricing display
- **ProcessTimeline**: Step-by-step workflows

## Troubleshooting

### Common Issues

1. **Type Errors**: Ensure you're importing types from the correct component
2. **Data Validation**: Use the provided validators to check data integrity
3. **Missing Categories**: Categories are auto-generated from FAQ data
4. **Search Not Working**: Verify `enableSearch` prop is set to `true`

### Debug Tools

```typescript
// Debug FAQ validation
import { debugFAQValidation } from "./utils/faqAccordionValidator";
debugFAQValidation(yourFAQData, "Your Service Name");
```

---

I've created comprehensive README.md files for both the Accordion and FAQAccordion components.

## **Accordion README** (Molecule Component)

Covers the generic accordion component with:
- **Type definitions** and interfaces
- **Usage examples** for different contexts
- **Variant options** (default, bordered, minimal, cards)
- **Accessibility features** and ARIA compliance
- **Performance considerations**
- **Integration examples** (settings panels, help docs)

## **FAQAccordion README** (Organism Component)

Covers the FAQ-specific implementation with:
- **Service page integration** patterns
- **Data file structure** for all 6 services
- **Type contracts** and service-specific types
- **Validation utilities** and error handling
- **Migration guide** from legacy implementations
- **Step-by-step implementation** for new service pages

## **Key Documentation Features**

### **Practical Examples**
Both READMEs include working code examples showing real implementation patterns used across the TBH Digital Solutions service pages.

### **Type Safety**
Complete coverage of TypeScript contracts, including:
- Interface definitions with detailed property descriptions
- Service-specific type exports
- Data validation patterns using Zod schemas

### **Data File Structure**
Clear guidance on organizing FAQ data files:
```
src/data/page/services-pages/{service}/faq/{service}_faq.ts
```

### **Validation & Error Handling**
Documentation of the comprehensive validation system with pre-configured validators for all services.

### **Migration Support**
Guidance for transitioning from inline types and legacy prop patterns to the new standardized contracts.

The documentation follows the Service Page Type Contracts implementation guide patterns while providing practical, actionable guidance for developers working with these components.