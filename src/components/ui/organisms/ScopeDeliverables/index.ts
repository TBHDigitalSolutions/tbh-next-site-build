// src/components/ui/organisms/ScopeDeliverables/index.ts

// Main component export
export { default as ScopeDeliverables } from './ScopeDeliverables';
export { default } from './ScopeDeliverables';

// Type exports
export type {
  ScopeData,
  ScopeDeliverablesProps,
  ExtendedScopeData,
  ScopeItem,
  DetailedScopeData,
  ScopeSection,
  ScopeAnalyticsEvent,
  ScopeDeliverablesState,
  ScopeValidationResult,
  ScopeExportConfig,
  ScopeTemplate,
  ScopeDataKeys,
  ScopeSectionHandler,
} from './ScopeDeliverables.types';

// Utility exports
export {
  validateScopeData,
  sanitizeScopeData,
  mergeScopeData,
  convertToDetailedScope,
  estimateComplexity,
  generateScopeSummary,
  searchScopeData,
  exportScopeData,
  hasAnyItems,
  getTotalItemCount,
  trackScopeAnalytics,
} from './utils';

// Validation exports
export {
  ScopeDataSchema,
  ScopeDeliverablesPropsSchema,
  validateScopeDataWithZod,
  isScopeData,
  safeParseScopeData,
  validateAndSanitizeScopeData,
  devValidateScopeData,
} from './validator';

// Type guards and constants
export {
  isScopeData as isValidScopeData,
  isDetailedScopeData,
  DEFAULT_SCOPE_SECTIONS,
} from './ScopeDeliverables.types';

// Re-export for convenience
export type ScopeDeliverablesComponent = typeof import('./ScopeDeliverables').default;