// ===================================================================
// index.ts - Production Ready Barrel
// ===================================================================

export { default } from "./PortfolioOverviewSection";
export { default as PortfolioOverviewSection } from "./PortfolioOverviewSection";

// Types
export type {
  PortfolioOverviewSectionProps,
  PortfolioOverviewSectionInput,
  PortfolioOverviewTextProps,
  PortfolioStatsSectionProps,
  OverviewLayout,
  OverviewBackground,
  OverviewCTA,
  OverviewTextContent,
  OverviewStatistics,
  StatItem,
} from "./PortfolioOverviewSection.types";

// Configuration
export { DEFAULTS, OVERVIEW_LAYOUTS, OVERVIEW_BACKGROUNDS } from "./PortfolioOverviewSection.types";

// Adapters
export {
  adaptPortfolioOverview,
  overviewFromInput,
  mapToPortfolioOverviewSection,
  type AdapterOptions,
} from "./adapters";

// Validator (optional - only export if Zod is available)
export * as portfolioOverviewValidator from "./utils/portfolioOverviewValidator";