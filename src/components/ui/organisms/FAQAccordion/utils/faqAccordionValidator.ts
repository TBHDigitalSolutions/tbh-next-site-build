// src/components/ui/organisms/FAQAccordion/utils/faqAccordionValidator.ts

import { z } from "zod";
import type { 
  FAQItem, 
  FAQSection, 
  FAQInput, 
  FAQCategory,
  FAQTransformer 
} from "../FAQAccordion.types";
import type { AccordionItem } from "@/components/ui/molecules/Accordion/Accordion.types";

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Base FAQ item schema with validation rules
 */
export const faqItemSchema = z.object({
  id: z.string().optional(),
  question: z.string().optional(),
  answer: z.union([z.string(), z.any()]).optional(), // React.ReactNode can't be validated
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional()
});

/**
 * FAQ category schema
 */
export const faqCategorySchema = z.object({
  id: z.string().min(1, "Category ID is required"),
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  count: z.number().nonnegative().optional()
});

/**
 * FAQ section schema for service pages
 */
export const faqSectionSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  data: z.union([
    z.array(faqItemSchema),
    z.object({ items: z.array(faqItemSchema).optional() }),
    z.object({ faqs: z.array(faqItemSchema).optional() }),
    z.object({ faqData: z.array(faqItemSchema).optional() }),
    z.null(),
    z.undefined()
  ]),
  variant: z.enum(["default", "bordered", "minimal", "cards"]).optional(),
  enableSearch: z.boolean().optional(),
  enableCategoryFilter: z.boolean().optional(),
  allowMultiple: z.boolean().optional()
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a single FAQ item
 */
export const validateFAQItem = (item: unknown): item is FAQItem => {
  const result = faqItemSchema.safeParse(item);
  return result.success;
};

/**
 * Validates an array of FAQ items
 */
export const validateFAQItems = (items: unknown): items is FAQItem[] => {
  if (!Array.isArray(items)) return false;
  return items.every(validateFAQItem);
};

/**
 * Validates FAQ section data structure
 */
export const validateFAQSection = (section: unknown): section is FAQSection => {
  const result = faqSectionSchema.safeParse(section);
  return result.success;
};

/**
 * Validates FAQ category
 */
export const validateFAQCategory = (category: unknown): category is FAQCategory => {
  const result = faqCategorySchema.safeParse(category);
  return result.success;
};

// ============================================================================
// Parsing Functions with Error Handling
// ============================================================================

/**
 * Safely parse FAQ item with detailed error reporting
 */
export const parseFAQItem = (item: unknown): { success: boolean; data?: FAQItem; error?: string } => {
  const result = faqItemSchema.safeParse(item);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

/**
 * Safely parse FAQ section with detailed error reporting
 */
export const parseFAQSection = (section: unknown): { success: boolean; data?: FAQSection; error?: string } => {
  const result = faqSectionSchema.safeParse(section);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

// ============================================================================
// Normalization & Transformation Utilities
// ============================================================================

/**
 * Normalizes FAQ input into a consistent FAQItem[] format
 */
export const normalizeFAQInput = (input: FAQInput): FAQItem[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  
  // Handle object formats
  if (typeof input === 'object') {
    if ('items' in input && Array.isArray(input.items)) return input.items.filter(Boolean);
    if ('faqs' in input && Array.isArray(input.faqs)) return input.faqs.filter(Boolean);
    if ('faqData' in input && Array.isArray(input.faqData)) return input.faqData.filter(Boolean);
  }
  
  return [];
};

/**
 * Creates a safe slug from question text
 */
export const slugifyQuestion = (question: string, fallback = "general"): string => {
  if (typeof question !== "string" || !question.trim()) return fallback;
  
  return question
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

/**
 * Transforms FAQ item to Accordion item format
 */
export const transformFAQToAccordion = (faq: FAQItem, index: number): AccordionItem => {
  const question = typeof faq?.question === "string" && faq.question.trim() 
    ? faq.question 
    : "Untitled question";
    
  const id = faq?.id ?? `${slugifyQuestion(question)}-${index}`;
  const category = typeof faq?.category === "string" && faq.category.trim() 
    ? faq.category 
    : "General";

  const content = typeof faq?.answer === "string" || faq?.answer == null 
    ? faq?.answer ?? "No answer provided."
    : faq.answer;

  return {
    id,
    title: question,
    content,
    category,
    tags: Array.isArray(faq?.tags) ? faq.tags.filter(Boolean) : undefined,
  };
};

/**
 * Extracts and validates categories from FAQ items
 */
export const extractCategories = (faqs: FAQItem[]): FAQCategory[] => {
  const categoryMap = new Map<string, number>();
  
  faqs.forEach(faq => {
    const category = faq.category || "General";
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });

  return Array.from(categoryMap.entries()).map(([name, count]) => ({
    id: slugifyQuestion(name),
    name,
    count
  }));
};

// ============================================================================
// FAQ Transformer Implementation
// ============================================================================

export const faqTransformer: FAQTransformer = {
  toAccordionItem: transformFAQToAccordion,
  normalizeFAQInput,
  slugifyQuestion
};

// ============================================================================
// Validation Utilities for Service Pages
// ============================================================================

/**
 * Creates a validator for specific service FAQ sections
 */
export const createServiceFAQValidator = (serviceName: string) => ({
  /**
   * Validates FAQ data for the service
   */
  validate: (data: unknown): { isValid: boolean; errors: string[]; faqs: FAQItem[] } => {
    const errors: string[] = [];
    let faqs: FAQItem[] = [];

    try {
      faqs = normalizeFAQInput(data as FAQInput);
      
      if (faqs.length === 0) {
        errors.push(`${serviceName}: No FAQ items found`);
      }

      faqs.forEach((faq, index) => {
        const result = parseFAQItem(faq);
        if (!result.success) {
          errors.push(`${serviceName} FAQ ${index + 1}: ${result.error}`);
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        faqs
      };
    } catch (error) {
      errors.push(`${serviceName}: Failed to parse FAQ data - ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, faqs: [] };
    }
  },

  /**
   * Creates a validated FAQ section for the service
   */
  createSection: (data: FAQInput, options: Partial<FAQSection> = {}): FAQSection | null => {
    const validation = createServiceFAQValidator(serviceName).validate(data);
    
    if (!validation.isValid) {
      console.warn(`${serviceName} FAQ validation failed:`, validation.errors);
      return null;
    }

    return {
      title: `${serviceName} FAQ`,
      data: validation.faqs,
      variant: "bordered",
      enableSearch: true,
      enableCategoryFilter: validation.faqs.some(faq => faq.category),
      allowMultiple: false,
      ...options
    };
  }
});

// ============================================================================
// Pre-configured Service Validators
// ============================================================================

export const webDevFAQValidator = createServiceFAQValidator("Web Development");
export const videoFAQValidator = createServiceFAQValidator("Video Production");
export const leadGenFAQValidator = createServiceFAQValidator("Lead Generation");
export const marketingAutomationFAQValidator = createServiceFAQValidator("Marketing Automation");
export const seoServicesFAQValidator = createServiceFAQValidator("SEO Services");
export const contentProductionFAQValidator = createServiceFAQValidator("Content Production");

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Creates mock FAQ data for development/testing
 */
export const createMockFAQs = (count: number, servicePrefix = "test"): FAQItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${servicePrefix}-faq-${i + 1}`,
    question: `Sample question ${i + 1} about ${servicePrefix}?`,
    answer: `This is the answer to question ${i + 1} about ${servicePrefix} services.`,
    category: i % 3 === 0 ? "General" : i % 3 === 1 ? "Pricing" : "Technical",
    tags: [`${servicePrefix}`, "common", i % 2 === 0 ? "beginner" : "advanced"]
  }));
};

/**
 * Debug utility for FAQ validation issues
 */
export const debugFAQValidation = (data: unknown, serviceName = "Unknown"): void => {
  console.group(`FAQ Validation Debug: ${serviceName}`);
  
  const normalizedFAQs = normalizeFAQInput(data as FAQInput);
  console.log("Normalized FAQs:", normalizedFAQs);
  
  normalizedFAQs.forEach((faq, index) => {
    const result = parseFAQItem(faq);
    if (!result.success) {
      console.error(`FAQ ${index + 1} validation failed:`, result.error);
    } else {
      console.log(`FAQ ${index + 1} validation passed`);
    }
  });
  
  console.groupEnd();
};