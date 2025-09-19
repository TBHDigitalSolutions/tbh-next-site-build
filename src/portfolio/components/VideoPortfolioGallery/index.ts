// src/components/ui/organisms/VideoPortfolioGallery/index.ts

/**
 * Comprehensive barrel exports for the VideoPortfolioGallery organism.
 * 
 * Refactored to focus on video display with comprehensive adapter support.
 * Search functionality is handled by the global search system.
 */

// Named exports: gallery components
export { default as VideoPortfolioGallery } from "./VideoPortfolioGallery";
export { default as VideoPortfolioClient } from "./VideoPortfolioClient";
export { default as VideoLightbox } from "./VideoLightbox";

// Types
export type {
  VideoCTALink,
  VideoItem,
  ClickBehavior,
  VideoPortfolioGalleryProps,
} from "./VideoPortfolioGallery.types";

// Adapters - main exports for template usage
export {
  toVideoPortfolioProps,
  toVideoPortfolioAdapter,
  createVideoProductionPortfolioSection,
  createMarketingVideoPortfolioSection,
  createContentVideoPortfolioSection,
  createVideoHighlightsSection,
  createVideoCaseStudiesSection,
  createPortfolioHubVideoSection,
  createServicePageVideoSection,
  createVideoTestimonialsSection,
  normalizeVideoInput,
  normalizeVideoItem,
  validateVideoPortfolioInput
} from "./adapters";

// Validators and utilities
export { 
  validateVideoPortfolioData, 
  logValidationResults,
  validateAndLog,
  validateVideoItem,
  parseVideoItem,
  validateVideoProductionPortfolio,
  validateMarketingVideoPortfolio
} from "./utils/videoPortfolioValidator";

// Default export
export { VideoPortfolioGallery as default } from "./VideoPortfolioGallery";