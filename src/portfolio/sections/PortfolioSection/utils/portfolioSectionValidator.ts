// ===================================================================
// portfolioSectionValidator.ts - Production Ready Validation
// ===================================================================

import { z } from 'zod';

// ----------------------------
// Base schemas
// ----------------------------

export const portfolioVariantSchema = z.enum(["gallery", "video", "interactive"]);
export const portfolioLayoutSchema = z.enum(["grid", "masonry", "list"]);
export const portfolioSizeSchema = z.enum(["small", "medium", "large"]);

// ----------------------------
// Project schema
// ----------------------------

export const mediaItemSchema = z.object({
  type: z.enum(['image', 'video', 'interactive', 'pdf']),
  src: z.string().url("Media src must be a valid URL"),
  alt: z.string().optional(),
  thumbnail: z.string().url().optional(),
  poster: z.string().url().optional(),
});

export const projectMetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.union([z.string().min(1), z.number()]),
});

export const projectSchema = z.object({
  id: z.string().min(1, "Project id is required"),
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  client: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  href: z.string().url().optional(),
  media: mediaItemSchema.optional(),
  metrics: z.array(projectMetricSchema).optional(),
});

// ----------------------------
// Input schema (authoring format)
// ----------------------------

export const portfolioSectionInputSchema = z.object({
  // Content
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  items: z.array(projectSchema).optional(),
  
  // Display configuration
  variant: portfolioVariantSchema.optional(),
  layout: portfolioLayoutSchema.optional(),
  size: portfolioSizeSchema.optional(),
  
  // Behavior
  maxItems: z.number().positive().optional(),
  showSearch: z.boolean().optional(),
  showFilters: z.boolean().optional(),
  showLoadMore: z.boolean().optional(),
  showTitles: z.boolean().optional(),
  
  // CTA
  viewAllHref: z.string().url().optional(),
  viewAllText: z.string().optional(),
  
  // Analytics
  analyticsContext: z.string().optional(),
  
  // Styling
  className: z.string().optional(),
  background: z.string().optional(),
});

// ----------------------------
// Props schema (component format)
// ----------------------------

export const portfolioSectionPropsSchema = z.object({
  // Content (items is required for props)
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  items: z.array(projectSchema),
  
  // Configuration
  variant: portfolioVariantSchema.optional(),
  layout: portfolioLayoutSchema.optional(),
  size: portfolioSizeSchema.optional(),
  maxItems: z.number().positive().optional(),
  
  // Features
  showSearch: z.boolean().optional(),
  showFilters: z.boolean().optional(),
  showLoadMore: z.boolean().optional(),
  showTitles: z.boolean().optional(),
  showItemCount: z.boolean().optional(),
  
  // View All CTA
  viewAllHref: z.string().url().optional(),
  viewAllText: z.string().optional(),
  
  // Analytics
  analyticsContext: z.string().optional(),
  
  // Loading state
  loading: z.boolean().optional(),
  
  // Styling
  className: z.string().optional(),
  background: z.string().optional(),
}).refine(
  data => data.items.length > 0,
  { message: "At least one portfolio item is required" }
);

// ----------------------------
// Validation functions
// ----------------------------

/**
 * Validate portfolio section input (authoring format)
 */
export function validatePortfolioSectionInput(input: unknown, strict = false) {
  if (strict) {
    return portfolioSectionInputSchema.parse(input);
  }
  
  const result = portfolioSectionInputSchema.safeParse(input);
  if (!result.success) {
    console.warn('Portfolio section input validation failed:', result.error.issues);
    return null;
  }
  
  return result.data;
}

/**
 * Validate portfolio section props (component format)
 */
export function validatePortfolioSectionProps(props: unknown, strict = false) {
  if (strict) {
    return portfolioSectionPropsSchema.parse(props);
  }
  
  const result = portfolioSectionPropsSchema.safeParse(props);
  if (!result.success) {
    console.warn('Portfolio section props validation failed:', result.error.issues);
    return null;
  }
  
  return result.data;
}

/**
 * Validate individual project
 */
export function validateProject(project: unknown, strict = false) {
  if (strict) {
    return projectSchema.parse(project);
  }
  
  const result = projectSchema.safeParse(project);
  return result.success ? result.data : null;
}

/**
 * Validate array of projects
 */
export function validateProjects(projects: unknown[], strict = false) {
  if (!Array.isArray(projects)) return [];
  
  const validated = projects
    .map(project => validateProject(project, strict))
    .filter(Boolean);
  
  if (strict && validated.length !== projects.length) {
    throw new Error(`Validation failed: ${projects.length - validated.length} invalid projects`);
  }
  
  return validated;
}

/**
 * Smart validator that detects input format
 */
export function validatePortfolioSection(data: unknown, strict = false) {
  // Try props format first (more specific)
  const propsResult = portfolioSectionPropsSchema.safeParse(data);
  if (propsResult.success) {
    return { format: 'props' as const, data: propsResult.data };
  }
  
  // Try input format
  const inputResult = portfolioSectionInputSchema.safeParse(data);
  if (inputResult.success) {
    return { format: 'input' as const, data: inputResult.data };
  }
  
  // Try raw project array
  if (Array.isArray(data)) {
    const projects = validateProjects(data, strict);
    if (projects.length > 0) {
      return { 
        format: 'array' as const, 
        data: { items: projects } 
      };
    }
  }
  
  if (strict) {
    throw new Error('Data does not match any valid portfolio section format');
  }
  
  return null;
}

/**
 * Validate variant value
 */
export function validateVariant(variant: unknown) {
  const result = portfolioVariantSchema.safeParse(variant);
  return result.success ? result.data : null;
}

/**
 * Validate layout value
 */
export function validateLayout(layout: unknown) {
  const result = portfolioLayoutSchema.safeParse(layout);
  return result.success ? result.data : null;
}

/**
 * Check if items array has required content
 */
export function hasValidItems(items: any[]): boolean {
  if (!Array.isArray(items) || items.length === 0) return false;
  return items.some(item => 
    typeof item === 'object' && 
    item !== null && 
    typeof item.id === 'string' && 
    typeof item.title === 'string'
  );
}

/**
 * Content quality validator
 */
export function validateContentQuality(items: any[]): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (!hasValidItems(items)) {
    issues.push('No valid portfolio items found');
    return { valid: false, issues };
  }
  
  const validItems = items.filter(validateProject);
  const invalidCount = items.length - validItems.length;
  
  if (invalidCount > 0) {
    issues.push(`${invalidCount} invalid portfolio items found`);
  }
  
  const itemsWithoutMedia = validItems.filter(item => !item.media?.src);
  if (itemsWithoutMedia.length > 0) {
    issues.push(`${itemsWithoutMedia.length} items missing media`);
  }
  
  const itemsWithoutDescription = validItems.filter(item => !item.description);
  if (itemsWithoutDescription.length > validItems.length * 0.5) {
    issues.push('Many items missing descriptions');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

// ----------------------------
// Type exports
// ----------------------------

export type ValidatedInput = z.infer<typeof portfolioSectionInputSchema>;
export type ValidatedProps = z.infer<typeof portfolioSectionPropsSchema>;
export type ValidatedProject = z.infer<typeof projectSchema>;

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