// src/components/ui/organisms/ProcessTimeline/index.ts

// ============================================================================
// Component Exports
// ============================================================================
export { default } from './ProcessTimeline';
export { default as ProcessTimeline } from './ProcessTimeline';

// ============================================================================
// Type Exports from ProcessTimeline.types.ts
// ============================================================================

// Core interfaces
export type {
  ProcessPhase,
  ProcessTimelineProps,
  ProcessTimelineSection,
  ProcessTimelineInput,
  DurationObject,
  DurationUnit,
  Owner,
  PhaseStatus
} from './ProcessTimeline.types';

// Service-specific type exports
export type {
  WebDevProcessTimeline,
  VideoProductionProcessTimeline,
  LeadGenerationProcessTimeline,
  MarketingAutomationProcessTimeline,
  SEOServicesProcessTimeline,
  ContentProductionProcessTimeline
} from './ProcessTimeline.types';

// Configuration types
export type {
  TimelineConfig,
  TimelineStyling,
  ContentVisibility,
  ProcessTimelineConfiguration,
  ResponsiveTimelineConfig
} from './ProcessTimeline.types';

// Advanced types
export type {
  ProcessTimelineFilter,
  ProcessTimelineSortOptions,
  ProcessTimelineAnalytics,
  ProcessTimelineSummary,
  ProcessTimelineMetrics,
  ProcessTimelineTemplate
} from './ProcessTimeline.types';

// Event handler types
export type {
  PhaseClickHandler,
  PhaseStatusChangeHandler,
  TimelineCompleteHandler,
  PhaseReorderHandler,
  TimelineStateChangeHandler
} from './ProcessTimeline.types';

// Legacy support types
export type {
  LegacyProcessPhase,
  TimelineStep
} from './ProcessTimeline.types';

// Union types for validation
export type {
  TimelineVariant,
  TimelineOrientation,
  TimelineSize,
  ColorScheme
} from './ProcessTimeline.types';

// Component ref types
export type {
  ProcessTimelineRef
} from './ProcessTimeline.types';

// ============================================================================
// Adapter Function Exports
// ============================================================================

// Service-specific adapters
export {
  createWebDevProcessTimeline,
  createVideoProductionProcessTimeline,
  createLeadGenProcessTimeline,
  createMarketingAutomationProcessTimeline,
  createSEOServicesProcessTimeline,
  createContentProductionProcessTimeline
} from './adapters';

// Data transformation utilities
export {
  normalizeProcessTimelineInput,
  normalizeProcessPhase
} from './adapters';

// External data adapters
export {
  adaptStrapiProcessTimeline,
  adaptContentfulProcessTimeline,
  adaptAsanaProject,
  adaptLinearProject,
  adaptGenericProjectManagement,
  adaptMondayBoard
} from './adapters';

// Filtering and sorting utilities
export {
  filterPhasesByService,
  sortProcessPhases,
  groupProcessPhases,
  estimateTimelineDuration
} from './adapters';

// Section factory
export {
  createProcessTimelineSection
} from './adapters';

// ============================================================================
// Validation Function Exports
// ============================================================================

// Core validation functions
export {
  validateProcessPhase,
  validateProcessTimelineProps,
  validateProcessTimelineSection
} from './utils/ProcessTimelineValidator';

// Business rules validation
export {
  validatePhaseBusinessRules,
  validatePhaseDuration,
  validateTimelineConfiguration,
  validatePhaseSequence
} from './utils/ProcessTimelineValidator';

// Quality assessment
export {
  assessProcessTimelineQuality
} from './utils/ProcessTimelineValidator';

// Duration utilities
export {
  parseDurationString,
  formatDuration
} from './utils/ProcessTimelineValidator';

// Service-specific validators
export {
  webDevProcessTimelineValidator,
  videoProductionProcessTimelineValidator,
  leadGenerationProcessTimelineValidator,
  marketingAutomationProcessTimelineValidator,
  seoServicesProcessTimelineValidator,
  contentProductionProcessTimelineValidator
} from './utils/ProcessTimelineValidator';

// Development helpers
export {
  createMockProcessPhases,
  debugProcessTimelineValidation
} from './utils/ProcessTimelineValidator';

// Zod schemas (for advanced usage)
export {
  processPhaseSchema,
  durationObjectSchema,
  processTimelinePropsSchema,
  processTimelineSectionSchema
} from './utils/ProcessTimelineValidator';