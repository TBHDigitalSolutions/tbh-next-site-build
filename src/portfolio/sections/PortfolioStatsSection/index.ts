// ===================================================================
// index.ts - Production Ready Barrel
// ===================================================================

export { default } from './PortfolioStatsSection';
export { default as PortfolioStatsSection } from './PortfolioStatsSection';

// Types
export type {
  PortfolioStatsSectionProps,
  PortfolioStatsSectionInput,
  StatItem,
  StatTrend,
  SimpleStatInput,
  StatsVariant,
  StatsLayout,
  StatsSize,
  AnimationType,
  PortfolioStats,
  CompanyStats,
  PerformanceStats,
} from './PortfolioStatsSection.types';

// Configuration
export {
  DEFAULTS,
  STATS_VARIANTS,
  STATS_LAYOUTS,
  STATS_SIZES,
  ANIMATION_TYPES,
  DEFAULT_ICONS,
  VARIANT_COLORS,
} from './PortfolioStatsSection.types';

// Type guards
export {
  isStatsVariant,
  isStatsLayout,
  isStatsSize,
  isAnimationType,
  isValidStatItem,
  isSimpleStatInput,
} from './PortfolioStatsSection.types';

// Adapters
export {
  adaptPortfolioStatsSection,
  adaptSimpleStats,
  portfolioStatsSectionFromInput,
  mapToPortfolioStatsSection,
  type AdapterOptions,
} from './adapters';

// Validators (optional - only if Zod is available)
export {
  validatePortfolioStatsSectionInput,
  validatePortfolioStatsSectionProps,
  validatePortfolioStatsSection,
  validateStatItem,
  validateSimpleStatInput,
  validateStats,
  validatePortfolioStats,
  validateCompanyStats,
  validatePerformanceStats,
  validateStatsQuality,
  validateStatValue,
  validateTrend,
  getValidationErrors,
  hasValidStats,
  type ValidatedInput,
  type ValidatedProps,
  type ValidatedStatItem,
  type ValidatedTrend,
} from './utils/portfolioStatsValidator';

// Schemas (for external use)
export {
  portfolioStatsSectionInputSchema,
  portfolioStatsSectionPropsSchema,
  statItemSchema,
  simpleStatInputSchema,
  statTrendSchema,
  statsVariantSchema,
  statsLayoutSchema,
  statsSizeSchema,
  animationTypeSchema,
  portfolioStatsSchema,
  companyStatsSchema,
  performanceStatsSchema,
} from './utils/portfolioStatsValidator';