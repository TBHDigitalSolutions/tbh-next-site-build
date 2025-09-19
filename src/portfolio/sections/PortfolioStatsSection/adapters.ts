// ===================================================================
// adapters.ts - Production Ready Adapters
// ===================================================================

import {
  DEFAULTS,
  DEFAULT_ICONS,
  VARIANT_COLORS,
  type PortfolioStatsSectionInput,
  type PortfolioStatsSectionProps,
  type StatItem,
  type SimpleStatInput,
  type StatsVariant,
  type StatsLayout,
  type StatsSize,
  type PortfolioStats,
  type CompanyStats,
  type PerformanceStats,
  isStatsVariant,
  isStatsLayout,
  isStatsSize,
  isValidStatItem,
  isSimpleStatInput,
} from './PortfolioStatsSection.types';

// ----------------------------
// Adapter Options
// ----------------------------

export interface AdapterOptions {
  /** Fill missing defaults */
  fillDefaults?: boolean;
  /** Validate input strictly (throw on invalid) */
  strict?: boolean;
  /** Maximum stats to process */
  maxStats?: number;
  /** Default variant if not specified */
  defaultVariant?: StatsVariant;
  /** Automatically add icons based on labels */
  autoIcons?: boolean;
  /** Automatically add colors based on variant */
  autoColors?: boolean;
}

const DEFAULT_ADAPTER_OPTIONS: AdapterOptions = {
  fillDefaults: true,
  strict: false,
  maxStats: 12,
  defaultVariant: 'portfolio',
  autoIcons: true,
  autoColors: true,
};

// ----------------------------
// Type Guards
// ----------------------------

function isPortfolioStatsSectionProps(raw: any): raw is PortfolioStatsSectionProps {
  return raw && 
         typeof raw === 'object' && 
         (Array.isArray(raw.customStats) || 'variant' in raw);
}

function isPortfolioStatsSectionInput(raw: any): raw is PortfolioStatsSectionInput {
  return raw && 
         typeof raw === 'object' && 
         (Array.isArray(raw.stats) || 'variant' in raw || 'title' in raw);
}

// ----------------------------
// Content Processing
// ----------------------------

/**
 * Convert simple stat input to full StatItem
 */
function normalizeStatItem(
  stat: StatItem | SimpleStatInput | any, 
  index: number,
  options: AdapterOptions
): StatItem | null {
  // Already a valid StatItem
  if (isValidStatItem(stat)) {
    return enhanceStatItem(stat, options);
  }
  
  // Simple stat input
  if (isSimpleStatInput(stat)) {
    const id = `stat-${index}`;
    return enhanceStatItem({
      id,
      label: stat.label,
      value: stat.value,
      helpText: stat.helpText,
    }, options);
  }
  
  // Try to coerce from various formats
  if (typeof stat === 'object' && stat !== null) {
    const label = stat.label || stat.name || stat.title || `Stat ${index + 1}`;
    const value = stat.value ?? stat.count ?? stat.amount ?? stat.number;
    
    if (value !== null && value !== undefined) {
      const id = stat.id || `stat-${index}`;
      return enhanceStatItem({
        id: String(id),
        label: String(label),
        value,
        suffix: stat.suffix,
        prefix: stat.prefix,
        icon: stat.icon,
        color: stat.color,
        highlight: stat.highlight,
        trend: stat.trend,
        helpText: stat.helpText,
        animationType: stat.animationType,
      }, options);
    }
  }
  
  if (options.strict) {
    throw new Error(`Invalid stat item at index ${index}`);
  }
  
  return null;
}

/**
 * Enhance a stat item with auto-generated properties
 */
function enhanceStatItem(stat: StatItem, options: AdapterOptions): StatItem {
  const enhanced = { ...stat };
  
  // Auto-add icons based on label keywords
  if (options.autoIcons && !enhanced.icon) {
    const label = enhanced.label.toLowerCase();
    
    if (label.includes('project')) enhanced.icon = DEFAULT_ICONS.projects;
    else if (label.includes('client')) enhanced.icon = DEFAULT_ICONS.clients;
    else if (label.includes('rating') || label.includes('star')) enhanced.icon = DEFAULT_ICONS.rating;
    else if (label.includes('experience') || label.includes('year')) enhanced.icon = DEFAULT_ICONS.experience;
    else if (label.includes('revenue') || label.includes('money')) enhanced.icon = DEFAULT_ICONS.revenue;
    else if (label.includes('growth')) enhanced.icon = DEFAULT_ICONS.growth;
    else if (label.includes('satisfaction')) enhanced.icon = DEFAULT_ICONS.satisfaction;
    else if (label.includes('conversion')) enhanced.icon = DEFAULT_ICONS.conversion;
    else if (label.includes('traffic')) enhanced.icon = DEFAULT_ICONS.traffic;
    else if (label.includes('performance') || label.includes('speed')) enhanced.icon = DEFAULT_ICONS.performance;
  }
  
  return enhanced;
}

/**
 * Process stats array with validation and enhancement
 */
function processStats(
  stats: any[], 
  options: AdapterOptions
): StatItem[] {
  if (!Array.isArray(stats)) return [];
  
  const processed = stats
    .map((stat, index) => normalizeStatItem(stat, index, options))
    .filter((stat): stat is StatItem => stat !== null);
  
  // Limit stats count
  if (options.maxStats && processed.length > options.maxStats) {
    console.warn(`Portfolio stats: Limiting to ${options.maxStats} stats`);
    return processed.slice(0, options.maxStats);
  }
  
  return processed;
}

// ----------------------------
// Preset Adapters
// ----------------------------

/**
 * Convert portfolio stats to StatItems
 */
function adaptPortfolioStats(stats: PortfolioStats): StatItem[] {
  const items: StatItem[] = [];
  
  if (stats.projectsCompleted) {
    items.push({
      id: 'projects-completed',
      label: 'Projects Completed',
      value: stats.projectsCompleted,
      icon: DEFAULT_ICONS.projects,
      highlight: true,
    });
  }
  
  if (stats.clientsSatisfied) {
    items.push({
      id: 'clients-satisfied',
      label: 'Clients Satisfied',
      value: stats.clientsSatisfied,
      suffix: '+',
      icon: DEFAULT_ICONS.clients,
    });
  }
  
  if (stats.averageRating) {
    items.push({
      id: 'average-rating',
      label: 'Average Rating',
      value: stats.averageRating,
      suffix: '/5',
      icon: DEFAULT_ICONS.rating,
    });
  }
  
  if (stats.yearsExperience) {
    items.push({
      id: 'years-experience',
      label: 'Years Experience',
      value: stats.yearsExperience,
      suffix: '+',
      icon: DEFAULT_ICONS.experience,
    });
  }
  
  if (stats.technologiesUsed) {
    items.push({
      id: 'technologies-used',
      label: 'Technologies Used',
      value: stats.technologiesUsed,
      suffix: '+',
    });
  }
  
  if (stats.awardswon) {
    items.push({
      id: 'awards-won',
      label: 'Awards Won',
      value: stats.awardswon,
    });
  }
  
  return items;
}

/**
 * Convert company stats to StatItems
 */
function adaptCompanyStats(stats: CompanyStats): StatItem[] {
  const items: StatItem[] = [];
  
  if (stats.revenue) {
    items.push({
      id: 'revenue',
      label: 'Annual Revenue',
      value: stats.revenue,
      icon: DEFAULT_ICONS.revenue,
      highlight: true,
    });
  }
  
  if (stats.employees) {
    items.push({
      id: 'employees',
      label: 'Team Members',
      value: stats.employees,
      suffix: '+',
      icon: DEFAULT_ICONS.clients,
    });
  }
  
  if (stats.clients) {
    items.push({
      id: 'clients',
      label: 'Active Clients',
      value: stats.clients,
      suffix: '+',
      icon: DEFAULT_ICONS.clients,
    });
  }
  
  if (stats.marketShare) {
    items.push({
      id: 'market-share',
      label: 'Market Share',
      value: stats.marketShare,
      icon: DEFAULT_ICONS.growth,
    });
  }
  
  if (stats.growth) {
    items.push({
      id: 'growth',
      label: 'Year-over-Year Growth',
      value: stats.growth,
      icon: DEFAULT_ICONS.growth,
      trend: {
        direction: 'up',
        value: stats.growth,
        period: 'YoY'
      }
    });
  }
  
  if (stats.satisfaction) {
    items.push({
      id: 'satisfaction',
      label: 'Client Satisfaction',
      value: stats.satisfaction,
      icon: DEFAULT_ICONS.satisfaction,
    });
  }
  
  return items;
}

/**
 * Convert performance stats to StatItems
 */
function adaptPerformanceStats(stats: PerformanceStats): StatItem[] {
  const items: StatItem[] = [];
  
  if (stats.conversionRate) {
    items.push({
      id: 'conversion-rate',
      label: 'Conversion Rate',
      value: stats.conversionRate,
      icon: DEFAULT_ICONS.conversion,
      highlight: true,
    });
  }
  
  if (stats.trafficIncrease) {
    items.push({
      id: 'traffic-increase',
      label: 'Traffic Increase',
      value: stats.trafficIncrease,
      icon: DEFAULT_ICONS.traffic,
      trend: {
        direction: 'up',
        value: stats.trafficIncrease,
        period: '6 months'
      }
    });
  }
  
  if (stats.revenueGrowth) {
    items.push({
      id: 'revenue-growth',
      label: 'Revenue Growth',
      value: stats.revenueGrowth,
      icon: DEFAULT_ICONS.revenue,
      trend: {
        direction: 'up',
        value: stats.revenueGrowth,
        period: '12 months'
      }
    });
  }
  
  if (stats.loadTime) {
    items.push({
      id: 'load-time',
      label: 'Page Load Time',
      value: stats.loadTime,
      icon: DEFAULT_ICONS.performance,
    });
  }
  
  if (stats.seoRanking) {
    items.push({
      id: 'seo-ranking',
      label: 'SEO Ranking',
      value: stats.seoRanking,
      prefix: '#',
    });
  }
  
  if (stats.engagement) {
    items.push({
      id: 'engagement',
      label: 'User Engagement',
      value: stats.engagement,
    });
  }
  
  return items;
}

// ----------------------------
// Main Adapter
// ----------------------------

/**
 * Convert various input formats to PortfolioStatsSectionProps
 */
export function adaptPortfolioStatsSection(
  raw: unknown,
  options: AdapterOptions = {}
): PortfolioStatsSectionProps {
  const opts = { ...DEFAULT_ADAPTER_OPTIONS, ...options };
  
  // Input validation
  if (!raw || typeof raw !== 'object') {
    if (opts.strict) {
      throw new Error('Invalid input: expected object');
    }
    return createFallbackProps(opts);
  }
  
  try {
    // Handle pre-adapted props
    if (isPortfolioStatsSectionProps(raw)) {
      return normalizeProps(raw as PortfolioStatsSectionProps, opts);
    }
    
    // Handle authoring input
    if (isPortfolioStatsSectionInput(raw)) {
      return convertInputToProps(raw as PortfolioStatsSectionInput, opts);
    }
    
    // Handle preset stat objects
    if ('projectsCompleted' in raw || 'clientsSatisfied' in raw) {
      const stats = adaptPortfolioStats(raw as PortfolioStats);
      return {
        customStats: stats,
        variant: 'portfolio',
        layout: 'horizontal',
      };
    }
    
    if ('revenue' in raw || 'employees' in raw) {
      const stats = adaptCompanyStats(raw as CompanyStats);
      return {
        customStats: stats,
        variant: 'company',
        layout: 'grid',
      };
    }
    
    if ('conversionRate' in raw || 'trafficIncrease' in raw) {
      const stats = adaptPerformanceStats(raw as PerformanceStats);
      return {
        customStats: stats,
        variant: 'performance',
        layout: 'grid',
        showTrends: true,
      };
    }
    
    // Handle raw stats array
    if (Array.isArray(raw)) {
      const stats = processStats(raw, opts);
      return {
        customStats: stats,
        variant: opts.defaultVariant || DEFAULTS.variant,
        layout: DEFAULTS.layout,
      };
    }
    
    // Unknown format
    if (opts.strict) {
      throw new Error('Invalid input: unrecognized format');
    }
    return createFallbackProps(opts);
    
  } catch (error) {
    if (opts.strict) throw error;
    
    console.warn('Portfolio stats section adapter error:', error);
    return createFallbackProps(opts);
  }
}

/**
 * Normalize pre-adapted props
 */
function normalizeProps(
  props: PortfolioStatsSectionProps, 
  opts: AdapterOptions
): PortfolioStatsSectionProps {
  const customStats = processStats(props.customStats || [], opts);
  
  return {
    ...props,
    customStats,
    variant: isStatsVariant(props.variant) ? props.variant : DEFAULTS.variant,
    layout: isStatsLayout(props.layout) ? props.layout : DEFAULTS.layout,
    size: isStatsSize(props.size) ? props.size : DEFAULTS.size,
    showTrends: typeof props.showTrends === 'boolean' ? props.showTrends : DEFAULTS.showTrends,
    showIcons: typeof props.showIcons === 'boolean' ? props.showIcons : DEFAULTS.showIcons,
    animated: typeof props.animated === 'boolean' ? props.animated : DEFAULTS.animated,
    showHelp: typeof props.showHelp === 'boolean' ? props.showHelp : DEFAULTS.showHelp,
    compact: typeof props.compact === 'boolean' ? props.compact : DEFAULTS.compact,
    analyticsContext: props.analyticsContext || DEFAULTS.analyticsContext,
    loading: typeof props.loading === 'boolean' ? props.loading : DEFAULTS.loading,
  };
}

/**
 * Convert authoring input to component props
 */
function convertInputToProps(
  input: PortfolioStatsSectionInput, 
  opts: AdapterOptions
): PortfolioStatsSectionProps {
  const customStats = processStats(input.stats || [], opts);
  
  return {
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    customStats,
    variant: isStatsVariant(input.variant) ? input.variant : opts.defaultVariant || DEFAULTS.variant,
    layout: isStatsLayout(input.layout) ? input.layout : DEFAULTS.layout,
    size: isStatsSize(input.size) ? input.size : DEFAULTS.size,
    showTrends: input.showTrends ?? DEFAULTS.showTrends,
    showIcons: input.showIcons ?? DEFAULTS.showIcons,
    animated: input.animated ?? DEFAULTS.animated,
    showHelp: input.showHelp ?? DEFAULTS.showHelp,
    compact: input.compact ?? DEFAULTS.compact,
    className: input.className || '',
    background: input.background,
  };
}

/**
 * Create fallback props for error cases
 */
function createFallbackProps(opts: AdapterOptions): PortfolioStatsSectionProps {
  return {
    title: opts.fillDefaults ? "Statistics" : undefined,
    customStats: [],
    variant: opts.defaultVariant || DEFAULTS.variant,
    layout: DEFAULTS.layout,
    size: DEFAULTS.size,
    showTrends: DEFAULTS.showTrends,
    showIcons: DEFAULTS.showIcons,
    animated: DEFAULTS.animated,
    showHelp: DEFAULTS.showHelp,
    compact: DEFAULTS.compact,
    analyticsContext: DEFAULTS.analyticsContext,
    loading: DEFAULTS.loading,
  };
}

// ----------------------------
// Convenience Functions
// ----------------------------

/**
 * Quick adapter for simple stats list
 */
export function adaptSimpleStats(
  stats: Array<{ label: string; value: string | number }>, 
  title?: string,
  variant: StatsVariant = 'portfolio'
): PortfolioStatsSectionProps {
  return adaptPortfolioStatsSection({
    title,
    stats,
    variant,
    layout: 'horizontal',
  });
}

/**
 * Legacy aliases for backward compatibility
 */
export const portfolioStatsSectionFromInput = adaptPortfolioStatsSection;
export const mapToPortfolioStatsSection = adaptPortfolioStatsSection;