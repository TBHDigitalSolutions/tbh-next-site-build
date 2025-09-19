// src/booking/components/BookingProgress/index.ts
// Barrel export for BookingProgress component

export { default as BookingProgress } from "./BookingProgress";
export type * from "./BookingProgress.types";

// Re-export commonly used types for convenience
export type {
  BookingProgressProps,
  ProgressStep,
  ProgressState,
  StepStatus,
  BookingFlowType,
  ProgressVariant,
  FlowConfiguration,
  ProgressAnalytics,
  NavigationResult,
  ProgressValidation,
  StepCompletionData,
  ProgressEventData,
  ProgressTheme,
  AccessibilityConfig,
} from "./BookingProgress.types";

// Re-export utilities
export {
  getFlowConfiguration,
  calculateCompletionPercentage,
  calculateTimeRemaining,
  formatTime,
  validateNavigation,
  validateStepCompletion,
  updateStepStatus,
  applyConditionalSteps,
  saveProgressToStorage,
  loadProgressFromStorage,
  clearProgressFromStorage,
  createProgressEventData,
  getStepCompletionData,
  validateFlowConfiguration,
  createStep,
  createFlow,
} from "./lib/utils";