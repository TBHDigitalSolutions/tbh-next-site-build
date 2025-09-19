// ===================================================================
// portfolioOverviewTextValidator.ts - Production Ready Validation
// ===================================================================

import { z } from 'zod';

// ----------------------------
// Base schemas
// ----------------------------

export const textVariantSchema = z.enum(["default", "services", "about", "marketing"]);
export const textSizeSchema = z.enum(["small", "medium", "large"]);
export const textAlignSchema = z.enum(["left", "center", "right"]);
export const ctaVariantSchema = z.enum(["primary", "secondary", "outline"]);
export const ctaTargetSchema = z.enum(["_self", "_blank"]);
export const headingLevelSchema = z.number().int().min(1).max(6);

// ----------------------------
// Content schemas
// ----------------------------

export const overviewCTASchema = z.object({
  label: z.string().min(1, "CTA label is required"),
  href: z.string().url("CTA href must be a valid URL"),
  target: ctaTargetSchema.optional(),
  rel: z.string().optional(),
  ariaLabel: z.string().optional(),
  variant: ctaVariantSchema.optional(),
});

// ----------------------------
// Input schema (authoring format)
// ----------------------------

export const portfolioOverviewTextInputSchema = z.object({
  // Content fields
  headline: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  paragraphs: z.array(z.string().min(1)).optional(),
  highlights: z.array(z.string().min(1)).optional(),
  
  // CTA
  cta: overviewCTASchema.optional(),
  
  // Configuration
  variant: textVariantSchema.optional(),
  size: textSizeSchema.optional(),
  align: textAlignSchema.optional(),
  className: z.string().optional(),
  maxWidth: z.string().optional(),
  
  // Interactive features
  showReadMore: z.boolean().optional(),
  readMoreText: z.string().optional(),
  readLessText: z.string().optional(),
  truncateAt: z.number().positive().optional(),
}).refine(
  data => data.headline || data.title || data.description || data.paragraphs?.length,
  { message: "At least one content field (headline, title, description, or paragraphs) is required" }
);

// ----------------------------
// Props schema (component format)
// ----------------------------

export const portfolioOverviewTextPropsSchema = z.object({
  // Primary content
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  paragraphs: z.array(z.string().min(1)).optional(),
  
  // Configuration
  variant: textVariantSchema.optional(),
  size: textSizeSchema.optional(),
  align: textAlignSchema.optional(),
  maxWidth: z.string().optional(),
  className: z.string().optional(),
  
  // CTA fields (flattened)
  showCTA: z.boolean().optional(),
  ctaText: z.string().min(1).optional(),
  ctaHref: z.string().url().optional(),
  ctaTarget: ctaTargetSchema.optional(),
  ctaRel: z.string().optional(),
  ctaAriaLabel: z.string().optional(),
  ctaVariant: ctaVariantSchema.optional(),
  
  // Interactive features
  showReadMore: z.boolean().optional(),
  readMoreText: z.string().optional(),
  readLessText: z.string().optional(),
  truncateAt: z.number().positive().optional(),
  
  // Accessibility
  headingLevel: headingLevelSchema.optional(),
}).refine(
  data => {
    // If showCTA is true, we need ctaText and ctaHref
    if (data.showCTA && (!data.ctaText || !data.ctaHref)) {
      return false;
    }
    // Need at least some content
    return data.title || data.subtitle || data.paragraphs?.length;
  },
  { message: "Content is required, and if showCTA is true, ctaText and ctaHref are required" }
);

// ----------------------------
// Validation functions
// ----------------------------

/**
 * Validate portfolio overview text input (authoring format)
 */
export function validatePortfolioOverviewTextInput(input: unknown, strict = false) {
  if (strict) {
    return portfolioOverviewTextInputSchema.parse(input);
  }
  
  const result = portfolioOverviewTextInputSchema.safeParse(input);
  if (!result.success) {
    console.warn('Portfolio overview text input validation failed:', result.error.issues);
    return null;
  }
  
  return result.data;
}

/**
 * Validate portfolio overview text props (component format)
 */
export function validatePortfolioOverviewTextProps(props: unknown, strict = false) {
  if (strict) {
    return portfolioOverviewTextPropsSchema.parse(props);
  }
  
  const result = portfolioOverviewTextPropsSchema.safeParse(props);
  if (!result.success) {
    console.warn('Portfolio overview text props validation failed:', result.error.issues);
    return null;
  }
  
  return result.data;
}

/**
 * Smart validator that detects input format and validates accordingly
 */
export function validatePortfolioOverviewText(data: unknown, strict = false) {
  // Try props format first (more specific)
  const propsResult = portfolioOverviewTextPropsSchema.safeParse(data);
  if (propsResult.success) {
    return { format: 'props' as const, data: propsResult.data };
  }
  
  // Try input format
  const inputResult = portfolioOverviewTextInputSchema.safeParse(data);
  if (inputResult.success) {
    return { format: 'input' as const, data: inputResult.data };
  }
  
  if (strict) {
    throw new Error('Data does not match either input or props format');
  }
  
  return null;
}

/**
 * Validate CTA object specifically
 */
export function validateCTA(cta: unknown, strict = false) {
  if (strict) {
    return overviewCTASchema.parse(cta);
  }
  
  const result = overviewCTASchema.safeParse(cta);
  return result.success ? result.data : null;
}

/**
 * Validate array of paragraphs
 */
export function validateParagraphs(paragraphs: unknown, maxCount = 10) {
  const schema = z.array(z.string().min(1)).max(maxCount, `Maximum ${maxCount} paragraphs allowed`);
  const result = schema.safeParse(paragraphs);
  return result.success ? result.data : [];
}

/**
 * Content length validator
 */
export function validateContentLength(content: string, maxLength = 2000) {
  return content.length <= maxLength;
}

/**
 * URL validator for CTAs
 */
export function validateCTAUrl(url: string) {
  const result = z.string().url().safeParse(url);
  return result.success;
}

// ----------------------------
// Type exports
// ----------------------------

export type ValidatedInput = z.infer<typeof portfolioOverviewTextInputSchema>;
export type ValidatedProps = z.infer<typeof portfolioOverviewTextPropsSchema>;
export type ValidatedCTA = z.infer<typeof overviewCTASchema>;

// ----------------------------
// Helper functions
// ----------------------------

/**
 * Extract validation errors as user-friendly messages
 */
export function getValidationErrors(error: z.ZodError): string[] {
  return error.issues.map(issue => {
    const path = issue.path.join('.');
    return `${path}: ${issue.message}`;
  });
}

/**
 * Check if data has required content fields
 */
export function hasRequiredContent(data: any): boolean {
  return Boolean(
    data?.title || 
    data?.headline || 
    data?.subtitle || 
    data?.description || 
    (Array.isArray(data?.paragraphs) && data.paragraphs.length > 0)
  );
}