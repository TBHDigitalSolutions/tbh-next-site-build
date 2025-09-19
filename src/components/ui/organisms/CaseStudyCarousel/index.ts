// src/components/ui/organisms/CaseStudyCarousel/index.ts

// ============================================================================
// Component Exports
// ============================================================================
export { default } from './CaseStudyCarousel';
export { default as CaseStudyCarousel } from './CaseStudyCarousel';

// ============================================================================
// Type Exports from CaseStudyCarousel.types.ts
// ============================================================================

// Core interfaces
export type {
  CaseStudy,
  CaseStudyMetric,
  CaseStudyCarouselProps,
  CaseStudyCarouselSection,
  CaseStudyInput
} from './CaseStudyCarousel.types';

// Service-specific type exports
export type {
  WebDevCaseStudyCarousel,
  VideoProductionCaseStudyCarousel,
  LeadGenerationCaseStudyCarousel,
  MarketingAutomationCaseStudyCarousel,
  SEOServicesCaseStudyCarousel,
  ContentProductionCaseStudyCarousel
} from './CaseStudyCarousel.types';

// Configuration types
export type {
  CarouselConfig,
  CarouselStyling,
  CaseStudyCarouselConfiguration,
  ResponsiveCarouselConfig
} from './CaseStudyCarousel.types';

// Filtering and sorting types
export type {
  CaseStudyFilter,
  CaseStudySortOptions,
  CarouselVariant,
  SortField,
  SortDirection
} from './CaseStudyCarousel.types';

// Event handler types
export type {
  CaseStudyClickHandler,
  CarouselNavigationHandler,
  CarouselStateChangeHandler
} from './CaseStudyCarousel.types';

// Legacy support types
export type {
  LegacyCaseStudy
} from './CaseStudyCarousel.types';

// Component ref types
export type {
  CaseStudyCarouselRef
} from './CaseStudyCarousel.types';

// ============================================================================
// Adapter Function Exports
// ============================================================================

// Service-specific adapters
export {
  createWebDevCaseStudyCarousel,
  createVideoProductionCaseStudyCarousel,
  createLeadGenCaseStudyCarousel,
  createMarketingAutomationCaseStudyCarousel,
  createSEOServicesCaseStudyCarousel,
  createContentProductionCaseStudyCarousel
} from './adapters';

// Data transformation utilities
export {
  normalizeCaseStudyInput,
  normalizeCaseStudy,
  normalizeMetrics
} from './adapters';

// External data adapters
export {
  adaptStrapiCaseStudies,
  adaptContentfulCaseStudies,
  adaptGenericAPIResponse
} from './adapters';

// Filtering and sorting utilities
export {
  filterCaseStudiesByService,
  sortCaseStudies,
  limitAndPrioritizeCaseStudies
} from './adapters';

// Section factory
export {
  createCaseStudySection
} from './adapters';

// ============================================================================
// Validation Function Exports
// ============================================================================

// Core validation functions
export {
  validateCaseStudy,
  validateCaseStudyCarouselProps,
  validateCaseStudySection
} from './utils/CaseStudyCarouselValidator';

// Business rules validation
export {
  validateCaseStudyBusinessRules,
  validateCarouselConfiguration
} from './utils/CaseStudyCarouselValidator';

// Quality assessment
export {
  assessCaseStudyCarouselQuality
} from './utils/CaseStudyCarouselValidator';

// Service-specific validators
export {
  webDevCaseStudyValidator,
  videoProductionCaseStudyValidator,
  leadGenerationCaseStudyValidator,
  marketingAutomationCaseStudyValidator,
  seoServicesCaseStudyValidator,
  contentProductionCaseStudyValidator
} from './utils/CaseStudyCarouselValidator';

// Development helpers
export {
  createMockCaseStudies,
  debugCaseStudyValidation
} from './utils/CaseStudyCarouselValidator';

// Zod schemas (for advanced usage)
export {
  caseStudySchema,
  caseStudyMetricSchema,
  caseStudyCarouselPropsSchema,
  caseStudyCarouselSectionSchema
} from './utils/CaseStudyCarouselValidator';