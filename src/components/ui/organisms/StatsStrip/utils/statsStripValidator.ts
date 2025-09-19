// src/components/ui/organisms/StatsStrip/utils/statsStripValidator.ts

import { z } from "zod";
import type { 
  StatsStripProps, 
  StatItem 
} from "../StatsStrip.types";

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Stat color enum schema
 */
export const statColorSchema = z.enum([
  "primary", 
  "secondary", 
  "success", 
  "warning", 
  "danger", 
  "info"
]).optional();

/**
 * Stat target enum schema
 */
export const statTargetSchema = z.enum([
  "_blank", 
  "_self"
]).optional();

/**
 * Single stat item schema
 */
export const statItemSchema = z.object({
  id: z.string().min(1, "Stat ID is required"),
  value: z.union([z.string(), z.number()], {
    required_error: "Stat value is required"
  }),
  label: z.string().min(1, "Stat label is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: statColorSchema,
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  animate: z.boolean().optional(),
  href: z.string().url().optional().or(z.literal("")),
  target: statTargetSchema,
});

/**
 * StatsStrip props schema
 */
export const statsStripPropsSchema = z.object({
  stats: z.array(statItemSchema).min(1, "At least one stat is required"),
  variant: z.enum([
    "default", 
    "minimal", 
    "cards", 
    "certifications", 
    "metrics", 
    "achievements"
  ]).optional(),
  layout: z.enum([
    "horizontal", 
    "grid", 
    "carousel"
  ]).optional(),
  animated: z.boolean().optional(),
  showIcons: z.boolean().optional(),
  showDescriptions: z.boolean().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  spacing: z.enum([
    "compact", 
    "normal", 
    "spacious"
  ]).optional(),
  alignment: z.enum([
    "left", 
    "center", 
    "right"
  ]).optional(),
  className: z.string().optional(),
  loading: z.boolean().optional(),
  error: z.string().optional(),
  maxItems: z.number().positive().optional(),
  showCarouselControls: z.boolean().optional(),
  autoPlay: z.boolean().optional(),
  autoPlayInterval: z.number().positive().optional(),
});

/**
 * Input validation schemas (what adapters accept)
 */
export const statInputSchema = z.object({
  id: z.string().optional(),
  value: z.union([z.string(), z.number()]).optional(),
  label: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  animate: z.boolean().optional(),
  href: z.string().optional(),
  target: z.string().optional(),
  // Legacy field aliases
  title: z.string().optional(),
  text: z.string().optional(),
  count: z.number().optional(),
  metric: z.union([z.string(), z.number()]).optional(),
  achievement: z.string().optional(),
  certification: z.string().optional(),
}).refine(
  data => data.value !== undefined || data.count !== undefined || 
         data.metric !== undefined || data.achievement !== undefined || 
         data.certification !== undefined,
  "Stat must have a value, count, metric, achievement, or certification"
).refine(
  data => data.label || data.title || data.text,
  "Stat must have a label, title, or text"
);

export const statsStripInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  stats: z.array(statInputSchema).optional(),
  items: z.array(statInputSchema).optional(),
  results: z.array(statInputSchema).optional(),
  metrics: z.array(statInputSchema).optional(),
  achievements: z.array(statInputSchema).optional(),
  certifications: z.array(statInputSchema).optional(),
  variant: z.string().optional(),
  layout: z.string().optional(),
  animated: z.boolean().optional(),
  showIcons: z.boolean().optional(),
  showDescriptions: z.boolean().optional(),
}).refine(
  data => data.stats || data.items || data.results || data.metrics || 
         data.achievements || data.certifications,
  "At least one stats array must be provided"
);

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a single stat item
 */
export const validateStatItem = (stat: unknown): stat is StatItem => {
  const result = statItemSchema.safeParse(stat);
  return result.success;
};

/**
 * Validates stat input with detailed error reporting
 */
export const parseStatItem = (stat: unknown): { 
  success: boolean; 
  data?: StatItem; 
  error?: string 
} => {
  const result = statItemSchema.safeParse(stat);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

/**
 * Validates StatsStrip props
 */
export const validateStatsStripProps = (props: unknown): props is StatsStripProps => {
  const result = statsStripPropsSchema.safeParse(props);
  return result.success;
};

/**
 * Validates StatsStrip props with detailed error reporting
 */
export const parseStatsStripProps = (props: unknown): { 
  success: boolean; 
  data?: StatsStripProps; 
  error?: string 
} => {
  const result = statsStripPropsSchema.safeParse(props);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

/**
 * Validates raw StatsStrip input data
 */
export const validateStatsStripInput = (input: unknown): { 
  success: boolean; 
  data?: any; 
  error?: string 
} => {
  const result = statsStripInputSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a string is a valid stat color
 */
export const isValidStatColor = (color: string): color is NonNullable<StatItem['color']> => {
  return statColorSchema.safeParse(color).success;
};

/**
 * Get all valid stat colors
 */
export const getValidStatColors = (): NonNullable<StatItem['color']>[] => {
  return ["primary", "secondary", "success", "warning", "danger", "info"];
};

/**
 * Sanitize stat label for ID generation
 */
export const sanitizeStatLabel = (label: string): string => {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate unique stat ID from label
 */
export const generateUniqueStatId = (label: string, existingIds: string[] = []): string => {
  let baseId = sanitizeStatLabel(label);
  if (!baseId) baseId = 'stat-item';
  
  let uniqueId = baseId;
  let counter = 1;
  
  while (existingIds.includes(uniqueId)) {
    uniqueId = `${baseId}-${counter}`;
    counter++;
  }
  
  return uniqueId;
};

/**
 * Format numeric values for display
 */
export const formatStatValue = (value: string | number, options?: {
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: string;
}): string => {
  const { prefix = '', suffix = '', decimals = 0, separator = ',' } = options || {};
  
  if (typeof value === 'string') {
    return `${prefix}${value}${suffix}`;
  }
  
  // Format numbers with separators
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
  
  return `${prefix}${formatted}${suffix}`;
};

/**
 * Validate and clean stats data for service templates
 */
export const validateAndCleanStatsStrip = (
  input: unknown,
  context?: { serviceName?: string; hub?: string; level?: string }
): {
  isValid: boolean;
  stats: StatItem[];
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stats: StatItem[] = [];
  
  // Validate input structure
  const inputValidation = validateStatsStripInput(input);
  if (!inputValidation.success) {
    return {
      isValid: false,
      stats: [],
      errors: [inputValidation.error || 'Invalid StatsStrip input'],
      warnings: []
    };
  }
  
  const data = inputValidation.data;
  const existingIds: string[] = [];
  
  // Process all possible stat arrays
  const arrayKeys = ['stats', 'items', 'results', 'metrics', 'achievements', 'certifications'];
  
  arrayKeys.forEach(arrayKey => {
    const array = (data as any)[arrayKey];
    if (Array.isArray(array)) {
      array.forEach((stat: any, index: number) => {
        const validation = parseStatItem({
          id: stat.id || generateUniqueStatId(
            stat.label || stat.title || stat.text || `${arrayKey}-${index}`, 
            existingIds
          ),
          value: stat.value ?? stat.count ?? stat.metric ?? stat.achievement ?? stat.certification,
          label: stat.label || stat.title || stat.text || 'Untitled Stat',
          description: stat.description,
          icon: stat.icon,
          color: stat.color,
          prefix: stat.prefix,
          suffix: stat.suffix,
          animate: stat.animate !== false,
          href: stat.href,
          target: stat.target || '_self'
        });
        
        if (validation.success && validation.data) {
          existingIds.push(validation.data.id);
          stats.push(validation.data);
        } else {
          errors.push(`${arrayKey}[${index}]: ${validation.error}`);
        }
      });
    }
  });
  
  // Final validation
  if (stats.length === 0) {
    errors.push('No valid stats found');
  }
  
  // Service-specific warnings
  if (context?.serviceName) {
    const serviceWarnings = validateServiceSpecificStatsStrip(stats, context.serviceName);
    warnings.push(...serviceWarnings);
  }
  
  // Layout warnings
  if (stats.length > 6 && data.layout !== 'carousel') {
    warnings.push('Consider using carousel layout for more than 6 stats');
  }
  
  if (stats.length > 12) {
    warnings.push('More than 12 stats may impact performance and UX');
  }
  
  return {
    isValid: errors.length === 0,
    stats,
    errors,
    warnings
  };
};

/**
 * Service-specific validation warnings
 */
export const validateServiceSpecificStatsStrip = (
  stats: StatItem[], 
  serviceName: string
): string[] => {
  const warnings: string[] = [];
  const hasNumericStats = stats.some(s => typeof s.value === 'number');
  const hasIcons = stats.some(s => s.icon);
  
  switch (serviceName.toLowerCase()) {
    case 'web-development':
      if (!hasNumericStats) {
        warnings.push('Web development stats should include numeric metrics (projects, clients, etc.)');
      }
      if (stats.length > 4 && !hasIcons) {
        warnings.push('Consider adding icons to web development stats for better visual hierarchy');
      }
      break;
      
    case 'video-production':
      if (!stats.some(s => String(s.label).toLowerCase().includes('video') || 
                            String(s.label).toLowerCase().includes('project'))) {
        warnings.push('Video production stats should highlight video-specific metrics');
      }
      break;
      
    case 'seo':
      if (!stats.some(s => String(s.label).toLowerCase().includes('ranking') ||
                            String(s.label).toLowerCase().includes('traffic') ||
                            String(s.label).toLowerCase().includes('keyword'))) {
        warnings.push('SEO stats should include ranking, traffic, or keyword metrics');
      }
      break;
      
    case 'marketing':
      if (!stats.some(s => String(s.label).toLowerCase().includes('conversion') ||
                            String(s.label).toLowerCase().includes('roas') ||
                            String(s.label).toLowerCase().includes('lead'))) {
        warnings.push('Marketing stats should include conversion, ROAS, or lead metrics');
      }
      break;
      
    case 'lead-generation':
      if (!stats.some(s => String(s.label).toLowerCase().includes('lead') ||
                            String(s.label).toLowerCase().includes('conversion'))) {
        warnings.push('Lead generation stats should highlight lead and conversion metrics');
      }
      // Lead gen often uses certifications
      if (stats.length > 0 && !stats.some(s => s.href)) {
        warnings.push('Consider adding links to certification pages for lead gen stats');
      }
      break;
      
    case 'content-production':
      if (!stats.some(s => String(s.label).toLowerCase().includes('content') ||
                            String(s.label).toLowerCase().includes('article') ||
                            String(s.label).toLowerCase().includes('word'))) {
        warnings.push('Content production stats should highlight content volume or quality metrics');
      }
      break;
  }
  
  return warnings;
};