// src/components/ui/molecules/Accordion/Accordion.types.ts

/**
 * Generic Accordion Component Types
 * Reusable accordion interface for any collapsible content
 */

export interface AccordionItem {
  /** Unique identifier */
  id: string;
  /** Display title/header */
  title: string;
  /** Collapsible content */
  content: string | React.ReactNode;
  /** Optional category for grouping/filtering */
  category?: string;
  /** Optional tags for search/filtering */
  tags?: string[];
  /** Optional icon identifier */
  icon?: string;
  /** Optional badge text */
  badge?: string;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Whether item opens by default */
  defaultOpen?: boolean;
}

export interface AccordionProps {
  /** Items to display */
  items?: AccordionItem[];
  /** Allow multiple items open simultaneously */
  allowMultiple?: boolean;
  /** Visual variant */
  variant?: "default" | "bordered" | "minimal" | "cards";
  /** Size variant */
  size?: "small" | "medium" | "large";
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Items that should be open by default */
  defaultOpenItems?: string[];
  /** Enable search functionality */
  enableSearch?: boolean;
  /** Enable category filtering */
  enableCategoryFilter?: boolean;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when item is toggled */
  onItemToggle?: (itemId: string, isOpen: boolean) => void;
  /** Callback when search changes */
  onSearchChange?: (searchTerm: string) => void;
  /** Custom icon renderer */
  renderCustomIcon?: (isOpen: boolean, item: AccordionItem) => React.ReactNode;
}

// Union types for validation
export type AccordionVariant = NonNullable<AccordionProps['variant']>;
export type AccordionSize = NonNullable<AccordionProps['size']>;

// Input validation helpers
export type AccordionInput = 
  | AccordionItem[] 
  | { items?: AccordionItem[] }
  | null 
  | undefined;