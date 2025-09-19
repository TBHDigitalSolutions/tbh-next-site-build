// src/components/portfolio/StandardPortfolioGallery/index.ts

// ============================================================================
// Component Exports
// ============================================================================
export { StandardPortfolioGallery } from "./StandardPortfolioGallery";

// ============================================================================
// Type Exports
// ============================================================================
export type {
  PortfolioItem,
  StandardPortfolioGalleryProps,
  PortfolioInput,
  PortfolioSection,
  FilterState,
  ModalState,
  PortfolioAnalytics,
  AdvancedFilters,
  StandardPortfolioGalleryExtendedProps
} from "./StandardPortfolioGallery.types";

// Service-specific type exports
export type {
  WebDevPortfolioSection,
  VideoPortfolioSection,
  SEOPortfolioSection,
  MarketingPortfolioSection,
  LeadGenPortfolioSection,
  ContentPortfolioSection
} from "./StandardPortfolioGallery.types";

// Re-export shared portfolio types
export type {
  Project,
  MediaType,
  MediaItem
} from "./StandardPortfolioGallery.types";

// ============================================================================
// Adapter Function Exports
// ============================================================================

// Main adapter functions
export {
  toStandardPortfolioGalleryProps,
  toPortfolioGalleryAdapter,
  normalizePortfolioInput,
  normalizePortfolioItem,
  validatePortfolioGalleryInput
} from "./adapters";

// Service-specific adapters
export {
  createWebDevPortfolioSection,
  createVideoPortfolioSection,
  createSEOPortfolioSection,
  createMarketingPortfolioSection,
  createLeadGenPortfolioSection,
  createContentPortfolioSection,
  createPortfolioGallerySection
} from "./adapters";

// Utility functions
export {
  filterFeaturedOnly,
  sortPortfolioItems,
  groupByCategory
} from "./adapters";

// ============================================================================
// Validator Function Exports
// ============================================================================
export {
  validatePortfolioItem,
  parsePortfolioItem,
  validatePortfolioGalleryProps,
  parsePortfolioGalleryProps,
  parsePortfolioSection,
  validateAndCleanPortfolioGallery,
  isValidMediaType,
  getValidMediaTypes,
  validateFilterState,
  extractPortfolioCategories,
  extractPortfolioTags,
  validatePortfolioMedia,
  validatePortfolioGalleryConfig,
  validateServicePortfolioRequirements,
  portfolioItemSchema,
  portfolioSectionSchema
} from "./utils/portfolioGalleryValidator";

// ============================================================================
// Default Export
// ============================================================================
export { StandardPortfolioGallery as default } from "./StandardPortfolioGallery";