// src/components/ui/organisms/PlaybookShowcase/index.ts

// ============================================================================
// Component Exports
// ============================================================================
export { default } from "./PlaybookShowcase";
export { default as PlaybookShowcase } from "./PlaybookShowcase";

// ============================================================================
// Type Exports
// ============================================================================
export type {
  PlaybookItem,
  PlaybookShowcaseProps,
  PlaybookDifficulty,
  PlaybookCategory,
  PlaybookInput,
  PlaybookSection
} from "./PlaybookShowcase.types";

// Service-specific type exports
export type {
  WebDevPlaybookSection,
  VideoPlaybookSection,
  MarketingPlaybookSection,
  SEOPlaybookSection,
  LeadGenPlaybookSection,
  ContentPlaybookSection
} from "./PlaybookShowcase.types";

// ============================================================================
// Adapter Function Exports
// ============================================================================

// Main adapter functions
export {
  toPlaybookShowcaseProps,
  toPlaybookShowcaseAdapter,
  normalizePlaybookInput,
  normalizePlaybookItem,
  validatePlaybookShowcaseInput
} from "./adapters";

// Service-specific adapters
export {
  createWebDevPlaybookSection,
  createVideoPlaybookSection,
  createMarketingPlaybookSection,
  createSEOPlaybookSection,
  createLeadGenPlaybookSection,
  createContentPlaybookSection,
  createPlaybookShowcaseSection
} from "./adapters";

// ============================================================================
// Validator Function Exports
// ============================================================================
export {
  validatePlaybookItem,
  parsePlaybookItem,
  validatePlaybookShowcaseProps,
  parsePlaybookShowcaseProps,
  parsePlaybookSection,
  validateAndCleanPlaybookShowcase,
  isValidPlaybookDifficulty,
  getValidPlaybookDifficulties,
  isValidFileType,
  extractPlaybookCategories,
  extractPlaybookDifficulties,
  playbookItemSchema,
  playbookSectionSchema
} from "./utils/playbookShowcaseValidator";

// Default export for convenience
export default PlaybookShowcase;