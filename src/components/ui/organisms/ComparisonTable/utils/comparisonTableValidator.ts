// src/components/ui/organisms/ComparisonTable/utils/comparisonTableValidator.ts

import { z } from "zod";
import type { 
  FlatComparisonRow,
  GroupedComparisonFeature,
  ComparisonTier,
  ComparisonTableProps,
  AnyComparisonInput
} from "../ComparisonTable.types";

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Comparison tier schema with validation rules
 */
export const comparisonTierSchema = z.object({
  id: z.string().min(1, "Tier ID is required"),
  name: z.string().min(1, "Tier name is required"),
  badge: z.string().optional()
});

/**
 * Flat comparison row schema
 */
export const flatComparisonRowSchema = z.object({
  label: z.string().min(1, "Feature label is required"),
  helpText: z.string().optional(),
  values: z.record(z.string(), z.union([z.boolean(), z.string()]))
    .refine(obj => Object.keys(obj).length > 0, {
      message: "Values object must contain at least one tier"
    })
});

/**
 * Grouped comparison feature schema
 */
export const groupedComparisonFeatureSchema = z.object({
  category: z.string().min(1, "Category name is required"),
  features: z.array(z.object({
    name: z.string().min(1, "Feature name is required"),
    helpText: z.string().optional(),
    plans: z.record(z.string(), z.union([z.boolean(), z.string()]))
      .refine(obj => Object.keys(obj).length > 0, {
        message: "Plans object must contain at least one tier"
      })
  })).min(1, "Category must contain at least one feature")
});

/**
 * Union schema for any comparison input
 */
export const comparisonInputSchema = z.array(
  z.union([flatComparisonRowSchema, groupedComparisonFeatureSchema])
).min(1, "Comparison input must contain at least one item");

/**
 * Complete comparison table props schema
 */
export const comparisonTablePropsSchema = z.object({
  tiers: z.array(comparisonTierSchema).min(2, "Must have at least 2 tiers for comparison"),
  features: comparisonInputSchema,
  stickyHeader: z.boolean().optional(),
  highlightTierId: z.string().optional(),
  className: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional()
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a single comparison tier
 */
export const validateComparisonTier = (tier: unknown): tier is ComparisonTier => {
  const result = comparisonTierSchema.safeParse(tier);
  return result.success;
};

/**
 * Validates an array of comparison tiers
 */
export const validateComparisonTiers = (tiers: unknown): tiers is ComparisonTier[] => {
  if (!Array.isArray(tiers)) return false;
  return tiers.every(validateComparisonTier);
};

/**
 * Validates flat comparison row
 */
export const validateFlatComparisonRow = (row: unknown): row is FlatComparisonRow => {
  const result = flatComparisonRowSchema.safeParse(row);
  return result.success;
};

/**
 * Validates grouped comparison feature
 */
export const validateGroupedComparisonFeature = (feature: unknown): feature is GroupedComparisonFeature => {
  const result = groupedComparisonFeatureSchema.safeParse(feature);
  return result.success;
};

/**
 * Validates comparison input (flat or grouped)
 */
export const validateComparisonInput = (input: unknown): input is AnyComparisonInput => {
  const result = comparisonInputSchema.safeParse(input);
  return result.success;
};

/**
 * Validates complete comparison table props
 */
export const validateComparisonTableProps = (props: unknown): props is ComparisonTableProps => {
  const result = comparisonTablePropsSchema.safeParse(props);
  return result.success;
};

// ============================================================================
// Parsing Functions with Error Handling
// ============================================================================

/**
 * Safely parse comparison tier with detailed error reporting
 */
export const parseComparisonTier = (tier: unknown): { 
  success: boolean; 
  data?: ComparisonTier; 
  error?: string 
} => {
  const result = comparisonTierSchema.safeParse(tier);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
  };
};

/**
 * Safely parse comparison input with detailed error reporting
 */
export const parseComparisonInput = (input: unknown): { 
  success: boolean; 
  data?: AnyComparisonInput; 
  error?: string 
} => {
  const result = comparisonInputSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
  };
};

// ============================================================================
// Normalization & Transformation Utilities
// ============================================================================

/**
 * Normalizes comparison input to grouped format
 */
export const normalizeComparisonInput = (input: AnyComparisonInput): GroupedComparisonFeature[] => {
  if (!Array.isArray(input) || input.length === 0) return [];
  
  const first = input[0] as any;
  
  // Check if it's flat format (has 'label' and 'values')
  if (first && "label" in first && "values" in first) {
    const rows = input as FlatComparisonRow[];
    return [
      {
        category: "Features",
        features: rows.map((r) => ({
          name: r.label,
          helpText: r.helpText,
          plans: r.values,
        })),
      },
    ];
  }
  
  // Already in grouped format
  return (input as GroupedComparisonFeature[])
    .map((g) => ({
      category: g?.category ?? "Features",
      features: Array.isArray(g?.features) ? g.features : [],
    }))
    .filter((g) => g.features.length > 0);
};

/**
 * Extracts all unique tier IDs from comparison data
 */
export const extractTierIds = (input: AnyComparisonInput): string[] => {
  const tierIds = new Set<string>();
  
  const normalized = normalizeComparisonInput(input);
  
  normalized.forEach(group => {
    group.features.forEach(feature => {
      Object.keys(feature.plans || {}).forEach(tierId => {
        tierIds.add(tierId);
      });
    });
  });
  
  return Array.from(tierIds);
};

/**
 * Validates that all tiers have data for all features
 */
export const validateDataCompleteness = (
  tiers: ComparisonTier[],
  features: AnyComparisonInput
): { isComplete: boolean; missing: string[] } => {
  const tierIds = tiers.map(t => t.id);
  const normalized = normalizeComparisonInput(features);
  const missing: string[] = [];
  
  normalized.forEach(group => {
    group.features.forEach(feature => {
      tierIds.forEach(tierId => {
        if (!(tierId in (feature.plans || {}))) {
          missing.push(`${group.category} > ${feature.name} > ${tierId}`);
        }
      });
    });
  });
  
  return {
    isComplete: missing.length === 0,
    missing
  };
};

// ============================================================================
// Service-Specific Validators
// ============================================================================

/**
 * Creates a validator for specific service comparison tables
 */
export const createServiceComparisonValidator = (serviceName: string) => ({
  /**
   * Validates comparison data for the service
   */
  validate: (data: {
    tiers: unknown;
    features: unknown;
  }): { 
    isValid: boolean; 
    errors: string[]; 
    warnings: string[];
    tiers: ComparisonTier[];
    features: AnyComparisonInput;
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let tiers: ComparisonTier[] = [];
    let features: AnyComparisonInput = [];

    try {
      // Validate tiers
      const tiersResult = z.array(comparisonTierSchema).safeParse(data.tiers);
      if (!tiersResult.success) {
        errors.push(`${serviceName} Tiers: ${tiersResult.error.issues.map(i => i.message).join(', ')}`);
      } else {
        tiers = tiersResult.data;
        
        if (tiers.length < 2) {
          errors.push(`${serviceName}: Must have at least 2 tiers for meaningful comparison`);
        }
        
        if (tiers.length > 5) {
          warnings.push(`${serviceName}: ${tiers.length} tiers may be overwhelming - consider consolidating`);
        }
      }
      
      // Validate features
      const featuresResult = comparisonInputSchema.safeParse(data.features);
      if (!featuresResult.success) {
        errors.push(`${serviceName} Features: ${featuresResult.error.issues.map(i => i.message).join(', ')}`);
      } else {
        features = featuresResult.data;
        
        const normalized = normalizeComparisonInput(features);
        const totalFeatures = normalized.reduce((acc, group) => acc + group.features.length, 0);
        
        if (totalFeatures < 5) {
          warnings.push(`${serviceName}: Only ${totalFeatures} features - consider adding more comparison points`);
        }
        
        if (totalFeatures > 25) {
          warnings.push(`${serviceName}: ${totalFeatures} features may be too detailed - consider grouping or summarizing`);
        }
      }
      
      // Cross-validation
      if (tiers.length > 0 && features.length > 0) {
        const completeness = validateDataCompleteness(tiers, features);
        if (!completeness.isComplete) {
          errors.push(`${serviceName}: Missing data for: ${completeness.missing.slice(0, 3).join(', ')}${completeness.missing.length > 3 ? '...' : ''}`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        tiers,
        features
      };
    } catch (error) {
      errors.push(`${serviceName}: Failed to validate comparison data - ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings, tiers: [], features: [] };
    }
  }
});

// ============================================================================
// Pre-configured Service Validators
// ============================================================================

export const webDevComparisonValidator = createServiceComparisonValidator("Web Development");
export const videoComparisonValidator = createServiceComparisonValidator("Video Production");
export const leadGenComparisonValidator = createServiceComparisonValidator("Lead Generation");
export const marketingAutomationComparisonValidator = createServiceComparisonValidator("Marketing Automation");
export const seoServicesComparisonValidator = createServiceComparisonValidator("SEO Services");
export const contentProductionComparisonValidator = createServiceComparisonValidator("Content Production");

// ============================================================================
// Collection Validator
// ============================================================================

/**
 * Comprehensive comparison table validator
 */
export const comparisonTableValidator = {
  /**
   * Validates complete comparison table configuration
   */
  validateTable: (props: unknown): { 
    isValid: boolean; 
    errors: string[]; 
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const result = comparisonTablePropsSchema.safeParse(props);
      
      if (!result.success) {
        errors.push(...result.error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        ));
        return { isValid: false, errors, warnings };
      }

      const { tiers, features } = result.data;
      
      // Business logic validation
      const completeness = validateDataCompleteness(tiers, features);
      if (!completeness.isComplete) {
        errors.push(`Incomplete data matrix - missing values for: ${completeness.missing.slice(0, 5).join(', ')}`);
      }
      
      // Quality warnings
      const normalized = normalizeComparisonInput(features);
      const categoriesCount = normalized.length;
      
      if (categoriesCount > 6) {
        warnings.push(`${categoriesCount} feature categories may be overwhelming - consider consolidating`);
      }
      
      const featuredTiers = tiers.filter(t => t.badge).length;
      if (featuredTiers === 0 && tiers.length > 2) {
        warnings.push("No tiers have badges - consider highlighting the recommended option");
      }
      
      if (featuredTiers > 1) {
        warnings.push(`${featuredTiers} tiers have badges - consider highlighting only one primary option`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Failed to validate comparison table: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings };
    }
  }
};

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Creates mock comparison data for development/testing
 */
export const createMockComparisonData = (
  tierCount: number = 3,
  featureCount: number = 8,
  servicePrefix = "test"
): {
  tiers: ComparisonTier[];
  features: FlatComparisonRow[];
} => {
  const tierNames = ['Basic', 'Professional', 'Premium', 'Enterprise'];
  const featureLabels = [
    'Pages included',
    'Design revisions',
    'Support period',
    'Response time',
    'Custom integrations',
    'Analytics setup',
    'Performance optimization',
    'SEO configuration'
  ];
  
  const tiers: ComparisonTier[] = Array.from({ length: Math.min(tierCount, 4) }, (_, i) => ({
    id: `${servicePrefix}-${tierNames[i].toLowerCase()}`,
    name: `${tierNames[i]} Package`,
    badge: i === 1 ? 'Most Popular' : undefined
  }));
  
  const features: FlatComparisonRow[] = Array.from({ length: Math.min(featureCount, 8) }, (_, i) => {
    const values: Record<string, boolean | string> = {};
    
    tiers.forEach((tier, tierIndex) => {
      if (featureLabels[i].includes('Pages') || featureLabels[i].includes('revisions')) {
        values[tier.id] = `${(tierIndex + 1) * 5}${featureLabels[i].includes('Pages') ? ' pages' : ' rounds'}`;
      } else if (featureLabels[i].includes('period') || featureLabels[i].includes('time')) {
        const periods = ['30 days', '90 days', '1 year', '2 years'];
        const times = ['48 hours', '24 hours', '4 hours', '1 hour'];
        values[tier.id] = featureLabels[i].includes('period') ? periods[tierIndex] : times[tierIndex];
      } else {
        values[tier.id] = tierIndex > 0; // Basic tier gets false, others get true
      }
    });
    
    return {
      label: featureLabels[i],
      helpText: i % 3 === 0 ? `Details about ${featureLabels[i].toLowerCase()}` : undefined,
      values
    };
  });
  
  return { tiers, features };
};

/**
 * Debug utility for comparison validation issues
 */
export const debugComparisonValidation = (
  tiers: unknown,
  features: unknown,
  serviceName = "Unknown"
): void => {
  console.group(`Comparison Table Validation Debug: ${serviceName}`);
  
  console.log("Input tiers:", tiers);
  console.log("Input features:", features);
  
  const validation = createServiceComparisonValidator(serviceName).validate({ tiers, features });
  
  if (validation.isValid) {
    console.log("✅ Validation passed");
  } else {
    console.error("❌ Validation failed");
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.warn("⚠️ Validation warnings:");
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  if (validation.tiers.length > 0 && validation.features.length > 0) {
    const completeness = validateDataCompleteness(validation.tiers, validation.features);
    const normalized = normalizeComparisonInput(validation.features);
    
    console.log(`📊 Statistics:
    - Tiers: ${validation.tiers.length}
    - Feature groups: ${normalized.length}
    - Total features: ${normalized.reduce((acc, g) => acc + g.features.length, 0)}
    - Data completeness: ${completeness.isComplete ? 'Complete' : `Missing ${completeness.missing.length} entries`}`);
  }
  
  console.groupEnd();
};

// ============================================================================
// Export All Utilities
// ============================================================================

export default {
  // Schemas
  comparisonTierSchema,
  flatComparisonRowSchema,
  groupedComparisonFeatureSchema,
  comparisonInputSchema,
  comparisonTablePropsSchema,
  
  // Validation functions
  validateComparisonTier,
  validateComparisonTiers,
  validateFlatComparisonRow,
  validateGroupedComparisonFeature,
  validateComparisonInput,
  validateComparisonTableProps,
  
  // Parsing functions
  parseComparisonTier,
  parseComparisonInput,
  
  // Transformation utilities
  normalizeComparisonInput,
  extractTierIds,
  validateDataCompleteness,
  
  // Main validator
  comparisonTableValidator,
  
  // Service validators
  webDevComparisonValidator,
  videoComparisonValidator,
  leadGenComparisonValidator,
  marketingAutomationComparisonValidator,
  seoServicesComparisonValidator,
  contentProductionComparisonValidator,
  
  // Development helpers
  createMockComparisonData,
  debugComparisonValidation,
  createServiceComparisonValidator
};