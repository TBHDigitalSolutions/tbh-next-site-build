# Accordion Component

A flexible, accessible, and reusable accordion/collapsible component for displaying expandable content sections.

## Overview

The Accordion component is a generic molecule-level UI component that can be used across various contexts - from FAQ sections to settings panels, help documentation, and feature lists. It provides a consistent interface for collapsible content with built-in search, filtering, and accessibility features.

## File Structure

```
src/components/ui/molecules/Accordion/
├── Accordion.css              # Global styles with theme tokens
├── Accordion.tsx              # Main component implementation
├── Accordion.types.ts         # TypeScript contracts
├── README.md                  # This documentation
└── index.ts                   # Barrel exports
```

## Installation & Usage

### Basic Import

```tsx
import Accordion from "@/components/ui/molecules/Accordion";
import type { AccordionItem } from "@/components/ui/molecules/Accordion";
```

### Basic Usage

```tsx
const items: AccordionItem[] = [
  {
    id: "item-1",
    title: "What is Next.js?",
    content: "Next.js is a React framework for production...",
    category: "Framework",
    tags: ["react", "framework"]
  },
  {
    id: "item-2", 
    title: "How to deploy?",
    content: "Deployment options include Vercel, Netlify...",
    category: "Deployment"
  }
];

function MyComponent() {
  return (
    <Accordion 
      items={items}
      variant="bordered"
      enableSearch={true}
      enableCategoryFilter={true}
    />
  );
}
```

## Type Definitions

### AccordionItem

```typescript
interface AccordionItem {
  id: string;                    // Unique identifier
  title: string;                 // Display title/header
  content: string | ReactNode;   // Collapsible content
  category?: string;             // Optional category for grouping
  tags?: string[];              // Optional tags for search
  icon?: string;                // Optional icon identifier
  badge?: string;               // Optional badge text
  disabled?: boolean;           // Whether item is disabled
  defaultOpen?: boolean;        // Whether item opens by default
}
```

### AccordionProps

```typescript
interface AccordionProps {
  items?: AccordionItem[];
  allowMultiple?: boolean;       // Allow multiple items open
  variant?: "default" | "bordered" | "minimal" | "cards";
  size?: "small" | "medium" | "large";
  animationDuration?: number;    // Animation duration in ms
  defaultOpenItems?: string[];   // Items open by default
  enableSearch?: boolean;        // Enable search functionality
  enableCategoryFilter?: boolean; // Enable category filtering
  searchPlaceholder?: string;    // Search input placeholder
  className?: string;            // Additional CSS classes
  onItemToggle?: (itemId: string, isOpen: boolean) => void;
  onSearchChange?: (searchTerm: string) => void;
  renderCustomIcon?: (isOpen: boolean, item: AccordionItem) => ReactNode;
}
```

## Variants

### Visual Variants

- **default**: Clean, minimal styling
- **bordered**: Items with visible borders
- **minimal**: Flat design with subtle dividers
- **cards**: Card-based layout with shadows

### Size Variants

- **small**: Compact padding
- **medium**: Standard padding (default)
- **large**: Generous padding

## Features

### Search & Filtering

```tsx
<Accordion
  items={items}
  enableSearch={true}
  enableCategoryFilter={true}
  searchPlaceholder="Search items..."
  onSearchChange={(term) => console.log('Search:', term)}
/>
```

### Multiple Open Items

```tsx
<Accordion
  items={items}
  allowMultiple={true}
  defaultOpenItems={["item-1", "item-3"]}
/>
```

### Custom Icon Rendering

```tsx
<Accordion
  items={items}
  renderCustomIcon={(isOpen, item) => (
    <ChevronIcon 
      direction={isOpen ? "up" : "down"}
      className="custom-icon" 
    />
  )}
/>
```

## Accessibility

The Accordion component follows WAI-ARIA guidelines:

- **Keyboard Navigation**: Tab to navigate, Enter/Space to toggle
- **Screen Reader Support**: Proper ARIA attributes and roles
- **Focus Management**: Clear focus indicators and logical tab order
- **Reduced Motion**: Respects `prefers-reduced-motion` setting

### ARIA Attributes

- `role="region"` on container
- `aria-expanded` on headers
- `aria-controls` linking headers to content
- `aria-hidden` on collapsed content
- `aria-label` on search and filter controls

## Styling & Theming

The component uses CSS custom properties (theme tokens) for consistent styling:

```css
.accordion {
  /* Uses theme tokens */
  background: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}
```

### Custom Styling

```tsx
<Accordion
  className="my-custom-accordion"
  items={items}
/>
```

```css
.my-custom-accordion {
  --accordion-border-color: #custom-color;
  --accordion-padding: 24px;
}
```

## Performance

- **Virtualization**: Not implemented (suitable for < 100 items)
- **Memoization**: Component uses React.memo for item rendering
- **Lazy Content**: Content is rendered but hidden when collapsed
- **Animation**: Smooth height transitions with configurable duration

## Integration Examples

### Settings Panel

```tsx
const settingsItems = [
  {
    id: "account",
    title: "Account Settings", 
    content: <AccountSettingsForm />
  },
  {
    id: "privacy",
    title: "Privacy Settings",
    content: <PrivacySettingsForm />
  }
];

<Accordion items={settingsItems} variant="cards" />
```

### Help Documentation

```tsx
const helpItems = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: "Step-by-step guide...",
    category: "Basics"
  }
];

<Accordion 
  items={helpItems}
  enableSearch={true}
  enableCategoryFilter={true}
/>
```

## Data File Structure

When creating data files for Accordion usage:

```typescript
// data/help-sections.ts
import type { AccordionItem } from "@/components/ui/molecules/Accordion";

export const helpSections = [
  {
    id: "setup",
    title: "Initial Setup",
    content: "Getting started instructions...",
    category: "Basics",
    tags: ["setup", "getting-started"]
  }
] satisfies AccordionItem[];
```

## Best Practices

### Data Organization

- Use meaningful, unique IDs
- Group related content with categories
- Add relevant tags for search functionality
- Keep titles concise but descriptive

### Content Guidelines

- Limit content length for better UX
- Use semantic HTML in content
- Provide fallback text for empty states
- Consider mobile viewport constraints

### Performance Tips

- Limit to < 100 items for optimal performance  
- Use categories to organize large datasets
- Consider pagination for very large collections
- Optimize images and media in content

## Browser Support

- Modern browsers (ES2020+)
- Progressive enhancement for older browsers
- Graceful degradation without JavaScript
- CSS Grid and Flexbox support required

## Related Components

- **FAQAccordion**: Specialized organism for FAQ sections
- **Tabs**: Alternative navigation pattern
- **Disclosure**: Single collapsible item
- **Drawer**: Off-canvas collapsible panels