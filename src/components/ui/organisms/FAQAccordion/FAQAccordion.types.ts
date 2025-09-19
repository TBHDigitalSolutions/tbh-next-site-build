// src/components/ui/organisms/FAQAccordion/FAQAccordion.types.ts

import type { AccordionItem, AccordionProps } from "@/components/ui/molecules/Accordion/Accordion.types";

/**
 * FAQ-Specific Types for Service Pages
 * Extends generic Accordion with FAQ business logic
 */

export interface FAQItem {
  /** Optional unique identifier */
  id?: string;
  /** FAQ question text (canonical) */
  question?: string;
  /** FAQ answer content (canonical) */
  answer?: string | React.ReactNode;
  /** Optional category for organization */
  category?: string | null;
  /** Optional tags for enhanced filtering */
  tags?: string[];
}

export interface FAQCategory {
  /** Category identifier */
  id: string;
  /** Display name */
  name: string;
  /** Optional description */
  description?: string;
  /** Number of FAQs in this category */
  count?: number;
}

// Legacy support types
export interface LegacyFAQData {
  /** Legacy: some pages used faqData instead of faqs */
  faqData?: FAQItem[];
  /** Legacy: some pages used sectionTitle instead of title */
  sectionTitle?: string;
}

export interface FAQAccordionProps extends LegacyFAQData {
  /** Primary prop: FAQ items to display */
  faqs?: FAQItem[];
  /** Section title */
  title?: string;
  /** Visual variant inherited from Accordion */
  variant?: AccordionProps['variant'];
  /** Allow multiple FAQs open simultaneously */
  allowMultiple?: boolean;
  /** Enable search functionality */
  enableSearch?: boolean;
  /** Enable category filtering */
  enableCategoryFilter?: boolean;
  /** Show metadata (kept for API compatibility) */
  showMetadata?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
}

// Service page integration types
export type FAQInput = 
  | FAQItem[]
  | { items?: FAQItem[] }
  | { faqs?: FAQItem[] }
  | { faqData?: FAQItem[] }
  | null
  | undefined;

export interface FAQSection {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** FAQ items */
  data: FAQInput;
  /** Display configuration */
  variant?: FAQAccordionProps['variant'];
  enableSearch?: boolean;
  enableCategoryFilter?: boolean;
  allowMultiple?: boolean;
}

// Transformation utilities
export interface FAQTransformer {
  /** Transform FAQ item to Accordion item */
  toAccordionItem: (faq: FAQItem, index: number) => AccordionItem;
  /** Normalize various FAQ input formats */
  normalizeFAQInput: (input: FAQInput) => FAQItem[];
  /** Generate safe slug from question text */
  slugifyQuestion: (question: string, fallback?: string) => string;
}

// Service-specific FAQ section types (following guide patterns)
export type WebDevFAQSection = FAQSection;
export type VideoFAQSection = FAQSection;
export type LeadGenFAQSection = FAQSection;
export type MarketingAutomationFAQSection = FAQSection;
export type SEOServicesFAQSection = FAQSection;
export type ContentProductionFAQSection = FAQSection;