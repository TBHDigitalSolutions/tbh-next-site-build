// src/booking/components/BookingProgress/lib/index.ts
// Barrel exports for BookingProgress lib utilities

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
} from './utils';

// Re-export types for convenience
export type {
  ProgressStep,
  FlowConfiguration,
  BookingFlowType,
  ProgressEventData,
  StepStatus,
  ProgressState,
  StepCompletionData,
  NavigationResult,
  ProgressValidation,
  ConditionalStep,
} from '../BookingProgress.types';