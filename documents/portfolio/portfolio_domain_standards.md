# Portfolio Domain - Production Standards Guide

## Directory Structure Standards

### `/src/portfolio/` Root Standards
- `index.ts`: Clean barrel exports, no deep imports
- `README.md`: Architecture overview, usage patterns
- `lib/`: Single source of truth for types, adapters, validators
- `components/`: Reusable UI building blocks
- `sections/`: Page sections that compose components
- `templates/`: Page-level layouts (no data fetching)

---

## Component Standards (`/src/portfolio/components/*/`)

### Required Files
- `Component.tsx`: Main component implementation
- `Component.types.ts`: Public interface definitions
- `Component.module.css`: Scoped styles
- `adapters.ts`: Data transformation functions
- `index.ts`: Barrel exports
- `utils/componentValidator.ts`: Input validation

### Component File Standards

#### `Component.tsx`
```tsx
// File naming: PascalCase matching component name
// No data fetching - accept props only
// Correct client/server boundary with "use client" only when needed
// Props destructuring with TypeScript
// Error boundaries for production resilience

import type { ComponentNameProps } from './Component.types';
import styles from './Component.module.css';

export default function ComponentName({ 
  requiredProp, 
  optionalProp 
}: ComponentNameProps) {
  // Implementation
}
```

#### `Component.types.ts`
```ts
// Export all public interfaces
// No `any` types - use proper TypeScript
// Optional props marked with `?`
// Extend HTML attributes when wrapping elements

export interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: boolean;
  children?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export type ComponentVariant = 'primary' | 'secondary';
```

#### `adapters.ts`
```ts
// Pure functions only
// Transform external data → component props
// Handle edge cases gracefully
// Export typed adapter functions

import type { ComponentNameProps } from './Component.types';

export function toComponentNameProps(input: unknown): ComponentNameProps | null {
  // Validation and transformation
  if (!input || typeof input !== 'object') return null;
  
  return {
    requiredProp: String(input.requiredProp || ''),
    optionalProp: Boolean(input.optionalProp)
  };
}
```

#### `utils/componentValidator.ts`
```ts
// Zod schemas for runtime validation
// Export validation functions
// Handle both strict and tolerant modes

import { z } from 'zod';

export const ComponentInputSchema = z.object({
  requiredProp: z.string(),
  optionalProp: z.boolean().optional()
});

export function validateComponentInput(input: unknown, strict = false) {
  const result = ComponentInputSchema.safeParse(input);
  if (!result.success && strict) {
    throw new Error(`Invalid component input: ${result.error.message}`);
  }
  return result.success ? result.data : null;
}
```

#### `Component.module.css`
```css
/* Use CSS custom properties for theming */
/* Mobile-first responsive design */
/* Scoped class names */
/* Accessibility considerations */

.component {
  /* Base styles */
  display: block;
  width: 100%;
}

.component[data-variant="primary"] {
  background: var(--accent-primary);
}

@media (min-width: 768px) {
  .component {
    /* Tablet+ styles */
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .component {
    border-width: 2px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .component {
    transition: none;
  }
}
```

#### `index.ts`
```ts
// Default export for component
// Named exports for types and utilities
// Re-export adapters for convenience

export { default } from './ComponentName';
export { default as ComponentName } from './ComponentName';
export type * from './ComponentName.types';
export * from './adapters';
export * from './utils/componentValidator';
```

---

## Section Standards (`/src/portfolio/sections/*/`)

### Required Files
- `Section.tsx`: Section implementation
- `Section.types.ts`: Props interface
- `Section.module.css`: Section-specific styles
- `index.ts`: Exports
- `adapters.ts`: (optional) For flexible configs
- `utils/sectionValidator.ts`: (optional) For external inputs

### Section File Standards

#### `Section.tsx`
```tsx
// Orchestrate components, no data fetching
// Compose multiple components into cohesive section
// Handle loading states and error boundaries
// Semantic HTML structure

import type { SectionProps } from './Section.types';
import { Component1 } from '../../components/Component1';
import { Component2 } from '../../components/Component2';
import styles from './Section.module.css';

export default function SectionName({ 
  title, 
  items, 
  variant = 'default' 
}: SectionProps) {
  if (!items.length) return null;

  return (
    <section className={styles.section} aria-labelledby="section-title">
      {title && (
        <header className={styles.header}>
          <h2 id="section-title">{title}</h2>
        </header>
      )}
      <div className={styles.content}>
        {variant === 'grid' ? (
          <Component1 items={items} />
        ) : (
          <Component2 items={items} />
        )}
      </div>
    </section>
  );
}
```

#### `Section.types.ts`
```ts
// Section-specific props
// Import component types as needed
// Define section variants

import type { ComponentProps } from '../../components/Component/Component.types';

export interface SectionProps {
  title?: string;
  subtitle?: string;
  items: ComponentProps['items'];
  variant?: 'grid' | 'list';
  className?: string;
}

export type SectionVariant = NonNullable<SectionProps['variant']>;
```

#### `Section.module.css`
```css
/* Section-level layout */
/* Component spacing and rhythm */
/* Responsive section behavior */

.section {
  padding: var(--spacing-lg) 0;
  container-type: inline-size;
}

.header {
  margin-bottom: var(--spacing-md);
  text-align: center;
}

.content {
  display: grid;
  gap: var(--spacing-lg);
}

/* Container queries for responsive behavior */
@container (min-width: 768px) {
  .content {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

---

## Template Standards (`/src/portfolio/templates/`)

### Required Files
- `Template.tsx`: Layout implementation
- `Template.types.ts`: Template props
- `index.ts`: Exports (if multiple templates)

### Template File Standards

#### `Template.tsx`
```tsx
// Layout orchestration only
// No data fetching - receive prepared data
// Compose sections into full page layouts
// Handle SEO and structured data

import type { TemplateProps } from './Template.types';
import { Section1 } from '../sections/Section1';
import { Section2 } from '../sections/Section2';

export default function TemplateName({
  hero,
  sections,
  footer
}: TemplateProps) {
  return (
    <main>
      {hero && (
        <Section1 {...hero} />
      )}
      
      {sections.map((section, index) => (
        <Section2 key={section.id || index} {...section} />
      ))}
      
      {footer && (
        <footer>
          {footer}
        </footer>
      )}
    </main>
  );
}
```

#### `Template.types.ts`
```ts
// Template-specific prop contracts
// Import section props as needed
// Define template configuration

import type { Section1Props } from '../sections/Section1/Section1.types';
import type { Section2Props } from '../sections/Section2/Section2.types';

export interface TemplateProps {
  hero?: Section1Props;
  sections: Section2Props[];
  footer?: React.ReactNode;
  metadata?: TemplateMetadata;
}

export interface TemplateMetadata {
  title: string;
  description: string;
  canonicalUrl?: string;
}
```

---

## Lib Standards (`/src/portfolio/lib/`)

### Required Files
- `types.ts`: Domain types and constants
- `adapters.ts`: Cross-component adapters
- `validators.ts`: Domain-wide validation
- `metrics.ts`: Data transformation utilities
- `registry.ts`: Component/viewer registry

### Lib File Standards

#### `types.ts`
```ts
// Central type definitions
// Re-export from data layer when appropriate
// Domain-specific constants and enums

// Re-exports from canonical sources
export type { Project, CategorySlug } from '@/data/portfolio/types';

// Domain-specific types
export type PortfolioVariant = 'gallery' | 'video' | 'interactive';

// Configuration constants
export const PORTFOLIO_VARIANTS = ['gallery', 'video', 'interactive'] as const;

// Type guards
export function isPortfolioVariant(value: unknown): value is PortfolioVariant {
  return typeof value === 'string' && PORTFOLIO_VARIANTS.includes(value as any);
}
```

#### `adapters.ts`
```ts
// Main domain adapters
// Cross-component transformation functions
// Handle complex data mapping scenarios

import type { Project, PortfolioVariant } from './types';

export interface PortfolioSectionConfig {
  variant: PortfolioVariant;
  title?: string;
  items: Project[];
}

export function toPortfolioSectionProps(input: unknown): PortfolioSectionConfig | null {
  // Complex transformation logic
  // Handle multiple input formats
  // Return null for invalid inputs
}
```

#### `validators.ts`
```ts
// Domain-wide validation schemas
// Shared validation utilities
// Export both strict and lenient validators

import { z } from 'zod';
import type { PortfolioVariant } from './types';

export const PortfolioVariantSchema = z.enum(['gallery', 'video', 'interactive']);

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string().optional()
});

export function validateProject(input: unknown): Project | null {
  const result = ProjectSchema.safeParse(input);
  return result.success ? result.data : null;
}
```

#### `metrics.ts`
```ts
// Data transformation utilities
// Metric formatting and normalization
// Safe data coercion functions

export function formatMetricValue(value: string | number): string {
  if (typeof value === 'number') {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  }
  return String(value);
}

export function sanitizeVideoItems<T extends { metrics?: any }>(items: T[]): T[] {
  return items.map(item => ({
    ...item,
    metrics: normalizeMetrics(item.metrics)
  }));
}
```

#### `registry.ts`
```ts
// Component and viewer registries
// Dynamic import functions
// Fallback handling for missing components

import type { PortfolioVariant, MediaType } from './types';

export const portfolioComponentRegistry = {
  gallery: () => import('../components/StandardPortfolioGallery'),
  video: () => import('../components/VideoPortfolioGallery'),
  interactive: () => import('../components/PortfolioDemo')
} as const;

export async function getPortfolioComponent(variant: PortfolioVariant) {
  try {
    const module = await portfolioComponentRegistry[variant]();
    return module.default;
  } catch (error) {
    console.error(`Failed to load component: ${variant}`, error);
    return null;
  }
}
```

---

## Production Readiness Checklist

### Code Quality
- [ ] No `any` types in production code
- [ ] All imports use proper TypeScript paths
- [ ] Error boundaries around dynamic components
- [ ] Consistent naming conventions (PascalCase components, camelCase functions)
- [ ] No console.log in production builds

### Performance
- [ ] Components use React.memo where appropriate
- [ ] Dynamic imports for code splitting
- [ ] CSS modules for scoped styles
- [ ] Container queries over media queries where possible
- [ ] Lazy loading for non-critical components

### Accessibility
- [ ] Proper ARIA labels and roles
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast mode support
- [ ] Reduced motion preferences

### Testing
- [ ] Unit tests for adapters and validators
- [ ] Integration tests for component interactions
- [ ] Visual regression tests for UI components
- [ ] Performance tests for large datasets
- [ ] Accessibility audits

### Documentation
- [ ] README.md with architecture overview
- [ ] Inline code documentation
- [ ] Type definitions serve as API documentation
- [ ] Usage examples in component README files
- [ ] Migration guides for breaking changes

### Security
- [ ] Input validation on all external data
- [ ] XSS protection in dynamic content rendering  
- [ ] Safe HTML attributes and className handling
- [ ] No direct DOM manipulation
- [ ] CSP-compatible inline styles only

This standards guide ensures your portfolio domain follows production-ready practices while maintaining flexibility and developer experience.