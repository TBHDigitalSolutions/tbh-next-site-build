// src/components/ui/organisms/StatsStrip/index.ts

// Main component
export { StatsStrip } from "./StatsStrip";

// Types
export type {
  StatsStripProps,
  StatItem
} from "./StatsStrip.types";

// Adapters - main exports for template usage
export {
  toStatsStripProps,
  toStatsStripAdapter,
  createWebDevStatsSection,
  createVideoStatsSection,
  createSEOStatsSection,
  createMarketingStatsSection,
  createLeadGenStatsSection,
  createContentStatsSection,
  createResultsStatsSection,
  createCompanyStatsSection,
  createCertificationStatsSection,
  createKPIStatsSection,
  normalizeStatsInput,
  normalizeStatItem,
  validateStatsStripInput
} from "./adapters";

// Validators
export {
  validateStatItem,
  parseStatItem,
  validateStatsStripProps,
  parseStatsStripProps,
  validateAndCleanStatsStrip,
  isValidStatColor,
  getValidStatColors,
  formatStatValue
} from "./utils/statsStripValidator";

// Default export for convenience
export default StatsStrip;