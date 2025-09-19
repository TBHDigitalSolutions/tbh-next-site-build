// ===================================================================
// /src/portfolio/sections/index.ts - Production Ready Barrel
// ===================================================================
// Central export point for all portfolio sections
// - Clean separation of concerns between different section types
// - Tree-shaking friendly exports
// - Consistent naming patterns following domain architecture
// ===================================================================

// -------------------------------------------------------------------
// Main Portfolio Section (orchestrator component)
// -------------------------------------------------------------------
export { default as PortfolioSection } from "./PortfolioSection/PortfolioSection";
export { default } from "./PortfolioSection/PortfolioSection";

// Types for PortfolioSection
export type {
  PortfolioSectionProps,
  PortfolioSectionInput,
  PortfolioVariant,
  PortfolioLayout,
  PortfolioSize,
} from "./PortfolioSection/PortfolioSection.types";

// Adapters for PortfolioSection
export {
  adaptPortfolioSection,
  toPortfolioSectionProps,
  portfolioSectionFromInput,
  type AdapterOptions as PortfolioSectionAdapterOptions,
} from "./PortfolioSection/adapters";

// Validators for PortfolioSection
export {
  validatePortfolioSectionInput,
  validatePortfolioSectionProps,
  validatePortfolioSection,
  type ValidatedPortfolioSectionInput,
  type ValidatedPortfolioSectionProps,
} from "./PortfolioSection/utils/portfolioSectionValidator";

// -------------------------------------------------------------------
// Portfolio Overview Section (text + stats composition)
// -------------------------------------------------------------------
export { default as PortfolioOverviewSection } from "./PortfolioOverviewSection/PortfolioOverviewSection";

// Types for PortfolioOverviewSection
export type {
  PortfolioOverviewSectionProps,
  PortfolioOverviewSectionInput,
  OverviewLayout,
  OverviewCTA,
  OverviewTextContent,
  OverviewStatistics,
} from "./PortfolioOverviewSection/PortfolioOverviewSection.types";

// Adapters for PortfolioOverviewSection
export {
  adaptPortfolioOverview,
  mapTextContent,
  mapStatistics,
  type AdapterOptions as OverviewAdapterOptions,
} from "./PortfolioOverviewSection/adapters";

// Validators for PortfolioOverviewSection
export {
  validatePortfolioOverviewInput,
  validatePortfolioOverviewProps,
  smartParsePortfolioOverview,
  type ValidatedOverviewInput,
  type ValidatedOverviewProps,
} from "./PortfolioOverviewSection/utils/portfolioOverviewValidator";

// -------------------------------------------------------------------
// Portfolio Overview Text (copy block)
// -------------------------------------------------------------------
export { default as PortfolioOverviewText } from "./PortfolioOverviewText/PortfolioOverviewText";

// Types for PortfolioOverviewText
export type {
  PortfolioOverviewTextProps,
  PortfolioOverviewTextInput,
  TextVariant,
  TextCTA,
} from "./PortfolioOverviewText/PortfolioOverviewText.types";

// Adapters for PortfolioOverviewText
export {
  adaptPortfolioOverviewText,
  mapTextCTA,
  type TextAdapterOptions,
} from "./PortfolioOverviewText/adapters";

// Validators for PortfolioOverviewText
export {
  validatePortfolioOverviewTextInput,
  validatePortfolioOverviewTextProps,
  validateTextContent,
  type ValidatedTextInput,
  type ValidatedTextProps,
} from "./PortfolioOverviewText/utils/portfolioOverviewTextValidator";

// -------------------------------------------------------------------
// Portfolio Stats Section (metrics display)
// -------------------------------------------------------------------
export { default as PortfolioStatsSection } from "./PortfolioStatsSection/PortfolioStatsSection";

// Types for PortfolioStatsSection  
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
} from "./PortfolioStatsSection/PortfolioStatsSection.types";

// Configuration constants for PortfolioStatsSection
export {
  DEFAULTS as STATS_DEFAULTS,
  STATS_VARIANTS,
  STATS_LAYOUTS,
  STATS_SIZES,
  ANIMATION_TYPES,
  DEFAULT_ICONS,
  VARIANT_COLORS,
} from "./PortfolioStatsSection/PortfolioStatsSection.types";

// Type guards for PortfolioStatsSection
export {
  isStatsVariant,
  isStatsLayout,
  isStatsSize,
  isAnimationType,
  isValidStatItem,
  isSimpleStatInput,
} from "./PortfolioStatsSection/PortfolioStatsSection.types";

// Adapters for PortfolioStatsSection
export {
  adaptPortfolioStatsSection,
  adaptSimpleStats,
  portfolioStatsSectionFromInput,
  mapToPortfolioStatsSection,
  type AdapterOptions as StatsAdapterOptions,
} from "./PortfolioStatsSection/adapters";

// Validators for PortfolioStatsSection
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
  type ValidatedInput as ValidatedStatsInput,
  type ValidatedProps as ValidatedStatsProps,
  type ValidatedStatItem,
  type ValidatedTrend,
} from "./PortfolioStatsSection/utils/portfolioStatsValidator";

// Schemas for external use
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
} from "./PortfolioStatsSection/utils/portfolioStatsValidator";

// -------------------------------------------------------------------
// Convenience Re-exports for Common Usage Patterns
// -------------------------------------------------------------------

/**
 * Main orchestrator function - accepts any portfolio data and returns
 * normalized props for the PortfolioSection component
 */
export { adaptPortfolioSection as toPortfolioSectionProps } from "./PortfolioSection/adapters";

/**
 * Composite overview adapter - handles both text and stats together
 */
export { adaptPortfolioOverview as toPortfolioOverviewProps } from "./PortfolioOverviewSection/adapters";

/**
 * Stats-only adapter for standalone statistics sections
 */
export { adaptPortfolioStatsSection as toPortfolioStatsProps } from "./PortfolioStatsSection/adapters";

/**
 * Text-only adapter for standalone text sections
 */
export { adaptPortfolioOverviewText as toPortfolioTextProps } from "./PortfolioOverviewText/adapters";

// -------------------------------------------------------------------
// Legacy Aliases (for backward compatibility during migration)
// -------------------------------------------------------------------

// Main section aliases
export { PortfolioSection as PortfolioGallerySection } from "./PortfolioSection/PortfolioSection";
export type { PortfolioSectionProps as PortfolioGallerySectionProps } from "./PortfolioSection/PortfolioSection.types";

// Overview section aliases
export { PortfolioOverviewSection as PortfolioTextStatsSection } from "./PortfolioOverviewSection/PortfolioOverviewSection";

// -------------------------------------------------------------------
// Section Configuration Types (for template usage)
// -------------------------------------------------------------------

/**
 * Union type for any portfolio section configuration
 */
export type AnyPortfolioSectionInput = 
  | PortfolioSectionInput
  | PortfolioOverviewSectionInput  
  | PortfolioStatsSectionInput
  | PortfolioOverviewTextInput;

/**
 * Union type for any portfolio section props
 */
export type AnyPortfolioSectionProps = 
  | PortfolioSectionProps
  | PortfolioOverviewSectionProps
  | PortfolioStatsSectionProps  
  | PortfolioOverviewTextProps;

/**
 * Section type discriminator for dynamic section rendering
 */
export type PortfolioSectionType = 'gallery' | 'overview' | 'stats' | 'text';

/**
 * Configuration for dynamic section rendering in templates
 */
export interface DynamicPortfolioSectionConfig {
  type: PortfolioSectionType;
  data: AnyPortfolioSectionInput;
  id?: string;
  className?: string;
}

// -------------------------------------------------------------------
// Utility Functions
// -------------------------------------------------------------------

/**
 * Determine section type from data shape
 */
export function getPortfolioSectionType(data: unknown): PortfolioSectionType {
  if (!data || typeof data !== 'object') return 'gallery';
  
  const obj = data as any;
  
  // Check for overview section (has both text and stats)
  if (obj.text && obj.statistics) return 'overview';
  
  // Check for stats-only section
  if (obj.stats || obj.customStats || Array.isArray(obj) && obj.every((item: any) => 
    item && typeof item === 'object' && 'label' in item && 'value' in item
  )) return 'stats';
  
  // Check for text-only section
  if (obj.headline || obj.paragraphs || (obj.text && !obj.statistics)) return 'text';
  
  // Default to gallery/main section
  return 'gallery';
}

/**
 * Smart adapter that detects section type and applies appropriate adapter
 */
export function adaptAnyPortfolioSection(
  data: unknown,
  options: { 
    defaultType?: PortfolioSectionType;
    strict?: boolean;
  } = {}
): { 
  type: PortfolioSectionType; 
  props: AnyPortfolioSectionProps; 
} {
  const type = options.defaultType || getPortfolioSectionType(data);
  
  switch (type) {
    case 'overview':
      return {
        type: 'overview',
        props: adaptPortfolioOverview(data, { strict: options.strict })
      };
    case 'stats':
      return {
        type: 'stats', 
        props: adaptPortfolioStatsSection(data, { strict: options.strict })
      };
    case 'text':
      return {
        type: 'text',
        props: adaptPortfolioOverviewText(data, { strict: options.strict })
      };
    case 'gallery':
    default:
      return {
        type: 'gallery',
        props: adaptPortfolioSection(data, { strict: options.strict })
      };
  }
}