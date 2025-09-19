// src/components/ui/organisms/StatsStrip/adapters.ts

import type { 
  StatsStripProps, 
  StatItem 
} from "./StatsStrip.types";

/**
 * StatsStrip Data Adapters for Service Templates
 * Maps raw service page data to StatsStrip component props
 */

// ============================================================================
// Input Types (What Service Pages Provide)
// ============================================================================

export interface StatsStripInput {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Array of statistics or results */
  stats?: StatInput[];
  /** Legacy field support */
  items?: StatInput[];
  results?: StatInput[];
  metrics?: StatInput[];
  achievements?: StatInput[];
  certifications?: StatInput[];
  /** Configuration options */
  variant?: StatsStripProps['variant'];
  layout?: StatsStripProps['layout'];
  animated?: boolean;
  showIcons?: boolean;
  showDescriptions?: boolean;
}

export interface StatInput {
  id?: string;
  value: string | number;
  label: string;
  description?: string;
  icon?: string;
  color?: StatItem['color'];
  prefix?: string;
  suffix?: string;
  animate?: boolean;
  href?: string;
  target?: string;
  // Legacy field aliases
  title?: string;
  text?: string;
  count?: number;
  metric?: string | number;
  achievement?: string;
  certification?: string;
}

export type StatsStripSection = {
  title?: string;
  subtitle?: string;
  data: StatsStripInput | StatInput[] | null | undefined;
}

// ============================================================================
// Core Transformation Functions
// ============================================================================

/**
 * Normalizes various stats input formats into consistent StatItem[]
 */
export const normalizeStatsInput = (input: StatsStripInput | StatInput[] | null | undefined): StatItem[] => {
  if (!input) return [];
  
  // Handle direct array of stats
  if (Array.isArray(input)) {
    return input.map(normalizeStatItem).filter(Boolean);
  }
  
  const stats: StatItem[] = [];
  
  // Handle structured input with multiple possible arrays
  const possibleArrays = ['stats', 'items', 'results', 'metrics', 'achievements', 'certifications'];
  
  for (const arrayKey of possibleArrays) {
    const array = (input as any)[arrayKey];
    if (Array.isArray(array)) {
      stats.push(...array.map(normalizeStatItem).filter(Boolean));
    }
  }
  
  return stats;
};

/**
 * Normalizes a single stat item with field mapping and validation
 */
export const normalizeStatItem = (stat: StatInput): StatItem | null => {
  if (!stat) return null;
  
  // Extract value from various possible fields
  const value = stat.value ?? stat.count ?? stat.metric ?? stat.achievement ?? stat.certification;
  if (value === undefined || value === null) return null;
  
  // Extract label from various possible fields
  const label = stat.label || stat.title || stat.text || 'Untitled Stat';
  
  return {
    id: stat.id || generateStatId(label),
    value,
    label,
    description: stat.description,
    icon: stat.icon,
    color: normalizeStatColor(stat.color),
    prefix: stat.prefix,
    suffix: stat.suffix,
    animate: stat.animate !== false, // Default to true for numeric values
    href: stat.href,
    target: (stat.target as StatItem['target']) || '_self'
  };
};

/**
 * Normalizes color strings to valid StatItem color values
 */
export const normalizeStatColor = (color: string | undefined): StatItem['color'] => {
  if (!color) return undefined;
  
  const validColors: StatItem['color'][] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'];
  const normalizedColor = color.toLowerCase() as StatItem['color'];
  
  return validColors.includes(normalizedColor) ? normalizedColor : 'primary';
};

/**
 * Generates a safe ID from stat label
 */
export const generateStatId = (label: string): string => {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// ============================================================================
// Service-Specific Adapter Functions
// ============================================================================

/**
 * Creates StatsStrip section for Web Development services
 */
export const createWebDevStatsSection = (
  input: StatsStripInput | StatInput[],
  overrides: Partial<StatsStripProps> = {}
): StatsStripProps => ({
  stats: normalizeStatsInput(input),
  variant: "metrics",
  layout: "horizontal",
  animated: true,
  showIcons: true,
  showDescriptions: false,
  spacing: "normal",
  alignment: "center",
  ...overrides
});

/**
 * Creates StatsStrip section for Video Production services
 */
export const createVideoStatsSection = (
  input: StatsStripInput | StatInput[],
  overrides: Partial<StatsStripProps> = {}
): StatsStripProps => ({
  stats: normalizeStatsInput(input),
  variant: "achievements",
  layout: "horizontal",
  animated: true,
  showIcons: true,
  showDescriptions: false,
  spacing: "spacious",
  alignment: "center",
  ...overrides
});

/**
 * Creates StatsStrip section for SEO Services
 */
export const createSEOStatsSection = (
  input: StatsStripInput | StatInput[],
  overrides: Partial<StatsStripProps> = {}
): StatsStripProps => ({
  stats: normalizeStatsInput(input),
  variant: "metrics",
  layout: "grid",
  animated: true,
  showIcons: true,
  showDescriptions: false,
  spacing: "normal",
  alignment: "center",
  ...overrides
});

/**
 * Creates StatsStrip section for Marketing Services
 */
export const createMarketingStatsSection = (
  input: StatsStripInput | StatInput[],
  overrides: Partial<StatsStripProps> = {}
): StatsStripProps => ({
  stats: normalizeStatsInput(input),
  variant: "metrics",
  layout: "horizontal",
  animated: true,
  showIcons: true,
  showDescriptions: false,
  spacing: "normal",
  alignment: "center",
  ...overrides
});

/**
 * Creates StatsStrip section for Lead Generation
 */
export const createLeadGenStatsSection = (
  input: StatsStripInput | StatInput[],
  overrides: Partial<StatsStripProps> = {}
): StatsStripProps => ({
  stats: normalizeStatsInput(input),
  variant: "certifications",
  layout: "horizontal",
  animated: true,
  showIcons: true,
  showDescriptions: true, // Lead gen often shows cert details
  spacing: "normal",
  alignment: "center",
  ...overrides
});

/**
 * Creates StatsStrip section for Content Production
 */
export const createContentStatsSection = (
  input: StatsStripInput | StatInput[],
  overrides: Partial<StatsStripProps> = {}
): StatsStripProps => ({
  stats: normalizeStatsInput(input),
  variant: "achievements",
  layout: "horizontal",
  animated: true,
  showIcons: true,
  showDescriptions: false,
  spacing: "normal",
  alignment: "center",
  ...overrides
});

// ============================================================================
// Results-Specific Adapters (SubService Level)
// ============================================================================

/**
 * Creates results-focused StatsStrip for SubService templates
 */
export const createResultsStatsSection = (
  resultsData: any,
  overrides: Partial<StatsStripProps> = {}
): StatsStripProps => {
  // Handle ResultsData structure from SubServiceTemplateData
  const items = resultsData?.items || [];
  const stats = items.map((item: any) => ({
    id: generateStatId(item.label),
    value: item.value,
    label: item.label,
    description: item.sublabel,
    icon: item.icon,
    animate: true
  }));
  
  return {
    stats,
    variant: "metrics",
    layout: "grid",
    animated: true,
    showIcons: true,
    showDescriptions: true,
    spacing: "spacious",
    alignment: "center",
    ...overrides
  };
};

// ============================================================================
// Template Integration Adapter
// ============================================================================

/**
 * Main adapter function for service templates
 * Auto-detects service type and applies appropriate defaults
 */
export const toStatsStripProps = (
  section: StatsStripSection,
  context?: { 
    hub?: string; 
    service?: string;
    serviceType?: 'web-development' | 'video-production' | 'seo' | 'marketing' | 'lead-generation' | 'content-production';
    level?: 'hub' | 'service' | 'subservice';
  }
): StatsStripProps | null => {
  
  const input = section.data;
  if (!input) return null;
  
  const stats = normalizeStatsInput(input);
  if (stats.length === 0) return null;
  
  // Determine service type from context
  const serviceType = context?.serviceType || inferServiceType(context?.hub, context?.service);
  
  // Apply service-specific defaults
  const baseProps = {
    stats,
    // Allow section-level overrides
    variant: (input as StatsStripInput)?.variant,
    layout: (input as StatsStripInput)?.layout,
    animated: (input as StatsStripInput)?.animated,
    showIcons: (input as StatsStripInput)?.showIcons,
    showDescriptions: (input as StatsStripInput)?.showDescriptions,
  };
  
  switch (serviceType) {
    case 'web-development':
      return createWebDevStatsSection(input, baseProps);
    case 'video-production':
      return createVideoStatsSection(input, baseProps);
    case 'seo':
      return createSEOStatsSection(input, baseProps);
    case 'marketing':
      return createMarketingStatsSection(input, baseProps);
    case 'lead-generation':
      return createLeadGenStatsSection(input, baseProps);
    case 'content-production':
      return createContentStatsSection(input, baseProps);
    default:
      // Generic fallback
      return {
        stats,
        variant: "default",
        layout: "horizontal",
        animated: true,
        showIcons: true,
        showDescriptions: false,
        spacing: "normal",
        alignment: "center",
        ...baseProps,
      };
  }
};

/**
 * Infers service type from hub/service context
 */
export const inferServiceType = (
  hub?: string, 
  service?: string
): 'web-development' | 'video-production' | 'seo' | 'marketing' | 'lead-generation' | 'content-production' | 'generic' => {
  
  const contextStr = `${hub || ''} ${service || ''}`.toLowerCase();
  
  if (contextStr.includes('web') || contextStr.includes('development')) return 'web-development';
  if (contextStr.includes('video') || contextStr.includes('production')) return 'video-production';
  if (contextStr.includes('seo') || contextStr.includes('search')) return 'seo';
  if (contextStr.includes('marketing') || contextStr.includes('advertising')) return 'marketing';
  if (contextStr.includes('lead') || contextStr.includes('generation')) return 'lead-generation';
  if (contextStr.includes('content') || contextStr.includes('editorial')) return 'content-production';
  
  return 'generic';
};

// ============================================================================
// Specialized Adapters for Business Use Cases
// ============================================================================

/**
 * Company-wide achievement stats
 */
export const createCompanyStatsSection = (
  stats: Array<{
    metric: string;
    value: string | number;
    description?: string;
    icon?: string;
  }>
): StatsStripProps => ({
  stats: stats.map(stat => ({
    id: generateStatId(stat.metric),
    value: stat.value,
    label: stat.metric,
    description: stat.description,
    icon: stat.icon,
    animate: true,
    color: 'primary' as const
  })),
  variant: "achievements",
  layout: "horizontal",
  animated: true,
  showIcons: true,
  showDescriptions: false,
  spacing: "spacious",
  alignment: "center"
});

/**
 * Certification badges for partnerships
 */
export const createCertificationStatsSection = (
  certifications: Array<{
    name: string;
    level?: string;
    year?: string | number;
    icon?: string;
    link?: string;
  }>
): StatsStripProps => ({
  stats: certifications.map(cert => ({
    id: generateStatId(cert.name),
    value: cert.name,
    label: cert.level || 'Certified Partner',
    description: cert.year ? `Since ${cert.year}` : undefined,
    icon: cert.icon || 'checkmark-circle',
    href: cert.link,
    target: '_blank' as const,
    color: 'success' as const,
    animate: false // Certifications don't animate
  })),
  variant: "certifications",
  layout: "horizontal",
  animated: true,
  showIcons: true,
  showDescriptions: true,
  spacing: "normal",
  alignment: "center"
});

/**
 * Performance metrics with KPI focus
 */
export const createKPIStatsSection = (
  kpis: Array<{
    metric: string;
    value: number;
    target?: number;
    unit?: string;
    trend?: 'up' | 'down' | 'stable';
  }>
): StatsStripProps => ({
  stats: kpis.map(kpi => ({
    id: generateStatId(kpi.metric),
    value: kpi.value,
    label: kpi.metric,
    suffix: kpi.unit || '',
    icon: kpi.trend === 'up' ? 'trending-up' : 
          kpi.trend === 'down' ? 'trending-down' : 'analytics',
    color: kpi.trend === 'up' ? 'success' : 
           kpi.trend === 'down' ? 'warning' : 'primary',
    animate: true
  })),
  variant: "metrics",
  layout: "grid",
  animated: true,
  showIcons: true,
  showDescriptions: false,
  spacing: "normal",
  alignment: "center"
});

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates StatsStrip input data
 */
export const validateStatsStripInput = (input: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  data?: StatsStripInput 
} => {
  const errors: string[] = [];
  
  if (!input) {
    return { isValid: false, errors: ['StatsStrip input is required'] };
  }
  
  if (Array.isArray(input)) {
    if (input.length === 0) {
      errors.push('Stats array cannot be empty');
    }
    
    input.forEach((stat, index) => {
      if (!stat || typeof stat !== 'object') {
        errors.push(`Stat at index ${index} must be an object`);
      } else if (!stat.value && stat.value !== 0) {
        errors.push(`Stat at index ${index} must have a value`);
      } else if (!stat.label && !stat.title && !stat.text) {
        errors.push(`Stat at index ${index} must have a label, title, or text`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? { stats: input } : undefined
    };
  }
  
  if (typeof input === 'object') {
    const statsInput = input as StatsStripInput;
    const hasAnyStats = ['stats', 'items', 'results', 'metrics', 'achievements', 'certifications']
      .some(key => Array.isArray((statsInput as any)[key]) && (statsInput as any)[key].length > 0);
    
    if (!hasAnyStats) {
      errors.push('StatsStrip must have at least one stat in any supported array field');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? statsInput : undefined
    };
  }
  
  return { isValid: false, errors: ['Invalid StatsStrip input format'] };
};

// Export main adapter function for template usage
export { toStatsStripProps as toStatsStripAdapter };