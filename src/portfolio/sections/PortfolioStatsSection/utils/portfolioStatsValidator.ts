// ===================================================================
// portfolioStatsValidator.ts - Production Ready Validation
// ===================================================================

import { z } from 'zod';

// ----------------------------
// Base schemas
// ----------------------------

export const statsVariantSchema = z.enum(["portfolio", "company", "services", "performance"]);
export const statsLayoutSchema = z.enum(["horizontal", "grid", "vertical"]);
export const statsSizeSchema = z.enum(["small", "medium", "large"]);
export const animationTypeSchema = z.enum(["fade", "slide", "count", "none"]);

// ----------------------------
// Stat item schemas
// ----------------------------

export const statTrendSchema = z.object({
  direction: z.enum(["up", "down", "neutral"]),
  value: z.union([z.string().min(1), z.number()]),
  period: z.string().optional(),
  label: z.string().optional(),
});

export const statItemSchema = z.object({
  id: z.string().min(1, "Stat id is required"),
  label: z.string().min(1, "Stat label is required"),
  value: z.union([z.string().min(1), z.number()]),
  suffix: z.string().optional(),
  prefix: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  highlight: z.boolean().optional(),
  trend: statTrendSchema.optional(),
  helpText: z.string().optional(),
  animationType: animationTypeSchema.optional(),
});

export const simpleStatInputSchema = z.object({
  label: z.string().min(1, "Stat label is required"),
  value: z.union([z.string().min(1), z.number()]),
  helpText: z.string().optional(),
});

// ----------------------------
// Input schema (authoring format)
// ----------------------------

export const portfolioStatsSectionInputSchema = z.object({
  // Content
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  stats: z.array(z.union([statItemSchema, simpleStatInputSchema])).optional(),
  
  // Configuration
  variant: statsVariantSchema.optional(),
  layout: statsLayoutSchema.optional(),
  size: statsSizeSchema.optional(),
  
  // Display options
  showTrends: z.boolean().optional(),
  showIcons: z.boolean().optional(),
  animated: z.boolean().optional(),
  showHelp: z.boolean().optional(),
  
  // Styling
  className: z.string().optional(),
  background: z.string().optional(),
  compact: z.boolean().optional(),
});

// ----------------------------
// Props schema (component format)
// ----------------------------

export const portfolioStatsSectionPropsSchema = z.object({
  // Content
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  
  // Stats data (required for props)
  customStats: z.array(statItemSchema),
  
  // Configuration
  variant: statsVariantSchema.optional(),
  layout: statsLayoutSchema.optional(),
  size: statsSizeSchema.optional(),
  
  // Display features
  showTrends: z.boolean().optional(),
  showIcons: z.boolean().optional(),
  animated: z.boolean().optional(),
  showHelp: z.boolean().optional(),
  compact: z.boolean().optional(),
  
  // Analytics
  analyticsContext: z.string().optional(),
  
  // Loading state
  loading: z.boolean().optional(),
  
  // Styling
  className: z.string().optional(),
  background: z.string().optional(),
}).refine(
  data => data.customStats.length > 0,
  { message: "At least one stat is required" }
);

// ----------------------------
// Preset schemas
// ----------------------------

export const portfolioStatsSchema = z.object({
  projectsCompleted: z.number().positive(),
  clientsSatisfied: z.number().positive(),
  averageRating: z.number().min(0).max(5),
  yearsExperience: z.number().positive(),
  technologiesUsed: z.number().positive().optional(),
  awardswon: z.number().nonnegative().optional(),
});

export const companyStatsSchema = z.object({
  revenue: z.union([z.string().min(1), z.number().positive()]),
  employees: z.number().positive(),
  clients: z.number().positive(),
  marketShare: z.string().optional(),
  growth: z.string().optional(),
  satisfaction: z.string().optional(),
});

export const performanceStatsSchema = z.object({
  conversionRate: z.string().min(1),
  trafficIncrease: z.string().min(1),
  revenueGrowth: z.string().min(1),
  loadTime: z.string().min(1),
  seoRanking: z.number().positive().optional(),
  engagement: z.string().optional(),
});

// ----------------------------
// Validation functions
// ----------------------------

/**
 * Validate portfolio stats section input (authoring format)
 */
export function validatePortfolioStatsSectionInput(input: unknown, strict = false) {
  if (strict) {
    return portfolioStatsSectionInputSchema.parse(input);
  }
  
  const result = portfolioStatsSectionInputSchema.safeParse(input);
  if (!result.success) {
    console.warn('Portfolio stats section input validation failed:', result.error.issues);
    return null;
  }
  
  return result.data;
}

/**
 * Validate portfolio stats section props (component format)
 */
export function validatePortfolioStatsSectionProps(props: unknown, strict = false) {
  if (strict) {
    return portfolioStatsSectionPropsSchema.parse(props);
  }
  
  const result = portfolioStatsSectionPropsSchema.safeParse(props);
  if (!result.success) {
    console.warn('Portfolio stats section props validation failed:', result.error.issues);
    return null;
  }
  
  return result.data;
}

/**
 * Validate individual stat item
 */
export function validateStatItem(stat: unknown, strict = false) {
  if (strict) {
    return statItemSchema.parse(stat);
  }
  
  const result = statItemSchema.safeParse(stat);
  return result.success ? result.data : null;
}

/**
 * Validate simple stat input
 */
export function validateSimpleStatInput(stat: unknown, strict = false) {
  if (strict) {
    return simpleStatInputSchema.parse(stat);
  }
  
  const result = simpleStatInputSchema.safeParse(stat);
  return result.success ? result.data : null;
}

/**
 * Validate array of stats
 */
export function validateStats(stats: unknown[], strict = false) {
  if (!Array.isArray(stats)) return [];
  
  const validated = stats
    .map(stat => validateStatItem(stat, strict) || validateSimpleStatInput(stat, strict))
    .filter(Boolean);
  
  if (strict && validated.length !== stats.length) {
    throw new Error(`Validation failed: ${stats.length - validated.length} invalid stats`);
  }
  
  return validated;
}

/**
 * Validate preset stat objects
 */
export function validatePortfolioStats(stats: unknown, strict = false) {
  if (strict) return portfolioStatsSchema.parse(stats);
  const result = portfolioStatsSchema.safeParse(stats);
  return result.success ? result.data : null;
}

export function validateCompanyStats(stats: unknown, strict = false) {
  if (strict) return companyStatsSchema.parse(stats);
  const result = companyStatsSchema.safeParse(stats);
  return result.success ? result.data : null;
}

export function validatePerformanceStats(stats: unknown, strict = false) {
  if (strict) return performanceStatsSchema.parse(stats);
  const result = performanceStatsSchema.safeParse(stats);
  return result.success ? result.data : null;
}

/**
 * Smart validator that detects input format
 */
export function validatePortfolioStatsSection(data: unknown, strict = false) {
  // Try props format first
  const propsResult = portfolioStatsSectionPropsSchema.safeParse(data);
  if (propsResult.success) {
    return { format: 'props' as const, data: propsResult.data };
  }
  
  // Try input format
  const inputResult = portfolioStatsSectionInputSchema.safeParse(data);
  if (inputResult.success) {
    return { format: 'input' as const, data: inputResult.data };
  }
  
  // Try preset formats
  const portfolioResult = portfolioStatsSchema.safeParse(data);
  if (portfolioResult.success) {
    return { format: 'portfolio' as const, data: portfolioResult.data };
  }
  
  const companyResult = companyStatsSchema.safeParse(data);
  if (companyResult.success) {
    return { format: 'company' as const, data: companyResult.data };
  }
  
  const performanceResult = performanceStatsSchema.safeParse(data);
  if (performanceResult.success) {
    return { format: 'performance' as const, data: performanceResult.data };
  }
  
  // Try raw stats array
  if (Array.isArray(data)) {
    const stats = validateStats(data, strict);
    if (stats.length > 0) {
      return { 
        format: 'array' as const, 
        data: { customStats: stats } 
      };
    }
  }
  
  if (strict) {
    throw new Error('Data does not match any valid portfolio stats section format');
  }
  
  return null;
}

/**
 * Content quality validator
 */
export function validateStatsQuality(stats: any[]): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (!Array.isArray(stats) || stats.length === 0) {
    issues.push('No stats provided');
    return { valid: false, issues };
  }
  
  const validStats = stats.filter(validateStatItem);
  const invalidCount = stats.length - validStats.length;
  
  if (invalidCount > 0) {
    issues.push(`${invalidCount} invalid stat items found`);
  }
  
  const statsWithoutValues = stats.filter(stat => 
    stat && typeof stat === 'object' && (stat.value === null || stat.value === undefined || stat.value === '')
  );
  if (statsWithoutValues.length > 0) {
    issues.push(`${statsWithoutValues.length} stats missing values`);
  }
  
  const statsWithoutLabels = stats.filter(stat => 
    stat && typeof stat === 'object' && (!stat.label || stat.label.trim() === '')
  );
  if (statsWithoutLabels.length > 0) {
    issues.push(`${statsWithoutLabels.length} stats missing labels`);
  }
  
  const duplicateIds = new Set();
  const seenIds = new Set();
  stats.forEach(stat => {
    if (stat && stat.id) {
      if (seenIds.has(stat.id)) {
        duplicateIds.add(stat.id);
      } else {
        seenIds.add(stat.id);
      }
    }
  });
  if (duplicateIds.size > 0) {
    issues.push(`Duplicate stat IDs found: ${Array.from(duplicateIds).join(', ')}`);
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Validate stat value format
 */
export function validateStatValue(value: unknown): boolean {
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'string') return value.trim().length > 0;
  return false;
}

/**
 * Validate trend data
 */
export function validateTrend(trend: unknown, strict = false) {
  if (strict) {
    return statTrendSchema.parse(trend);
  }
  
  const result = statTrendSchema.safeParse(trend);
  return result.success ? result.data : null;
}

// ----------------------------
// Type exports
// ----------------------------

export type ValidatedInput = z.infer<typeof portfolioStatsSectionInputSchema>;
export type ValidatedProps = z.infer<typeof portfolioStatsSectionPropsSchema>;
export type ValidatedStatItem = z.infer<typeof statItemSchema>;
export type ValidatedTrend = z.infer<typeof statTrendSchema>;

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
 * Check if data has required stats
 */
export function hasValidStats(data: any): boolean {
  if (Array.isArray(data?.customStats)) {
    return data.customStats.some(validateStatItem);
  }
  if (Array.isArray(data?.stats)) {
    return data.stats.some((stat: any) => validateStatItem(stat) || validateSimpleStatInput(stat));
  }
  return false;
}