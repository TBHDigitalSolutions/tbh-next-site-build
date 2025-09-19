// src/booking/components/BookingProgress/BookingProgress.types.ts
// Complete types for the booking progress component

import type { CanonicalService, BookingProvider } from "../../lib/types";

// Progress step status
export type StepStatus = "pending" | "current" | "completed" | "error" | "skipped";

// Progress step definition
export interface ProgressStep {
  /** Unique step identifier */
  id: string;
  /** Step display label */
  label: string;
  /** Step description */
  description?: string;
  /** Step status */
  status: StepStatus;
  /** Whether step is optional */
  optional?: boolean;
  /** Step icon */
  icon?: string | React.ComponentType;
  /** Estimated time for completion in seconds */
  estimatedTime?: number;
  /** Step-specific metadata */
  metadata?: Record<string, any>;
  /** Error message if status is error */
  errorMessage?: string;
  /** Whether step can be clicked/navigated to */
  clickable?: boolean;
  /** Custom CSS class for step */
  className?: string;
  /** Required fields for this step */
  requiredFields?: string[];
  /** Validation function for step completion */
  validator?: (data: any) => { valid: boolean; errors: string[] };
}

// Booking flow types
export type BookingFlowType = 
  | "simple" // Service selection → Time selection → Contact info → Confirmation
  | "detailed" // Service selection → Requirements → Time selection → Contact info → Payment → Confirmation
  | "consultation" // Service selection → Questionnaire → Time selection → Contact info → Confirmation
  | "quote" // Service selection → Project details → Contact info → Quote generation
  | "custom"; // Custom flow definition

// Progress display variants
export type ProgressVariant = 
  | "horizontal" // Steps displayed horizontally
  | "vertical" // Steps displayed vertically
  | "compact" // Minimal progress indicator
  | "detailed" // Full step descriptions
  | "circular"; // Circular progress indicator

// Progress position options
export type ProgressPosition = "top" | "bottom" | "left" | "right" | "floating";

// Animation types
export type AnimationType = "slide" | "fade" | "scale" | "bounce" | "none";

// Main component props
export interface BookingProgressProps {
  /** Current booking flow type */
  flowType: BookingFlowType;
  /** Progress steps configuration */
  steps: ProgressStep[];
  /** Current step index */
  currentStep: number;
  /** Progress display variant */
  variant?: ProgressVariant;
  /** Progress position on screen */
  position?: ProgressPosition;
  /** Show step numbers */
  showStepNumbers?: boolean;
  /** Show step descriptions */
  showDescriptions?: boolean;
  /** Show estimated completion time */
  showEstimatedTime?: boolean;
  /** Show overall progress percentage */
  showPercentage?: boolean;
  /** Enable step navigation */
  enableNavigation?: boolean;
  /** Allow skipping optional steps */
  allowSkipping?: boolean;
  /** Animation type for transitions */
  animation?: AnimationType;
  /** Custom CSS class */
  className?: string;
  /** Service context */
  service?: CanonicalService;
  /** Provider context */
  provider?: BookingProvider;
  /** Callback when step is clicked */
  onStepClick?: (stepIndex: number, step: ProgressStep) => void;
  /** Callback when step navigation is requested */
  onNavigate?: (fromStep: number, toStep: number) => boolean;
  /** Callback for analytics tracking */
  onTrack?: (event: string, properties: Record<string, any>) => void;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom step renderer */
  customStepRenderer?: (step: ProgressStep, index: number, isActive: boolean) => React.ReactNode;
  /** Show time remaining */
  showTimeRemaining?: boolean;
  /** Compact mode for mobile */
  compactMobile?: boolean;
  /** Accessibility configuration */
  accessibility?: AccessibilityConfig;
  /** Theme customization */
  theme?: ProgressTheme;
  /** Auto-save progress */
  autoSave?: boolean;
  /** Progress validation */
  validation?: ProgressValidation;
}

// Progress state management
export interface ProgressState {
  /** Current step index */
  currentStep: number;
  /** Steps configuration */
  steps: ProgressStep[];
  /** Overall completion percentage */
  completionPercentage: number;
  /** Estimated time remaining */
  timeRemaining?: number;
  /** Start time of the flow */
  startTime: number;
  /** Time spent on current step */
  stepStartTime: number;
  /** Navigation history */
  navigationHistory: number[];
  /** Whether navigation is allowed */
  canNavigate: boolean;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error?: string;
  /** Step completion data */
  completions?: StepCompletionData[];
}

// Progress flow configuration
export interface FlowConfiguration {
  /** Flow type */
  type: BookingFlowType;
  /** Steps for this flow */
  steps: Omit<ProgressStep, 'status'>[];
  /** Estimated total time */
  estimatedTotalTime: number;
  /** Required steps (cannot be skipped) */
  requiredSteps: string[];
  /** Optional steps */
  optionalSteps: string[];
  /** Step dependencies */
  dependencies?: Record<string, string[]>;
  /** Conditional steps */
  conditionalSteps?: ConditionalStep[];
  /** Flow metadata */
  metadata?: Record<string, any>;
}

// Conditional step logic
export interface ConditionalStep {
  /** Step ID */
  stepId: string;
  /** Condition to show step */
  condition: StepCondition;
  /** Step configuration if condition is met */
  step: Omit<ProgressStep, 'status'>;
  /** Position to insert step */
  insertAfter?: string;
}

export interface StepCondition {
  /** Field to check */
  field: string;
  /** Value to compare against */
  value: any;
  /** Comparison operator */
  operator: "equals" | "not-equals" | "contains" | "greater-than" | "less-than" | "exists";
}

// Step navigation result
export interface NavigationResult {
  /** Whether navigation was successful */
  success: boolean;
  /** Error message if navigation failed */
  error?: string;
  /** New step index */
  newStep?: number;
  /** Steps that were skipped */
  skippedSteps?: number[];
  /** Navigation type */
  navigationType?: "forward" | "backward" | "jump";
}

// Progress analytics
export interface ProgressAnalytics {
  /** Flow type */
  flowType: BookingFlowType;
  /** Service context */
  service?: CanonicalService;
  /** Provider context */
  provider?: BookingProvider;
  /** Total steps */
  totalSteps: number;
  /** Completed steps */
  completedSteps: number;
  /** Current step */
  currentStep: number;
  /** Time spent in flow */
  timeSpent: number;
  /** Steps visited */
  stepsVisited: number[];
  /** Steps skipped */
  stepsSkipped: number[];
  /** Completion percentage */
  completionPercentage: number;
  /** Average time per step */
  averageTimePerStep: number;
  /** Conversion funnel data */
  funnelData?: FunnelStepData[];
}

export interface FunnelStepData {
  stepId: string;
  stepIndex: number;
  entered: number;
  completed: number;
  abandoned: number;
  averageTime: number;
  conversionRate: number;
}

// Theme customization
export interface ProgressTheme {
  /** Primary color */
  primaryColor?: string;
  /** Secondary color */
  secondaryColor?: string;
  /** Completed step color */
  completedColor?: string;
  /** Current step color */
  currentColor?: string;
  /** Pending step color */
  pendingColor?: string;
  /** Error color */
  errorColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Border radius */
  borderRadius?: string;
  /** Step size */
  stepSize?: string;
  /** Font family */
  fontFamily?: string;
  /** Custom CSS variables */
  customVariables?: Record<string, string>;
}

// Accessibility configuration
export interface AccessibilityConfig {
  /** ARIA label for progress */
  ariaLabel?: string;
  /** Announce step changes to screen readers */
  announceStepChanges?: boolean;
  /** Custom announcements for each step */
  stepAnnouncements?: Record<string, string>;
  /** Focus management */
  manageFocus?: boolean;
  /** High contrast mode */
  highContrast?: boolean;
  /** Reduced motion */
  reducedMotion?: boolean;
  /** Keyboard navigation */
  keyboardNavigation?: boolean;
  /** Screen reader optimization */
  screenReaderOptimized?: boolean;
}

// Progress validation
export interface ProgressValidation {
  /** Whether current step is valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Warning messages */
  warnings?: string[];
  /** Required fields for current step */
  requiredFields?: string[];
  /** Missing required fields */
  missingFields?: string[];
  /** Custom validation function */
  customValidator?: (step: ProgressStep, data: any) => { valid: boolean; errors: string[] };
}

// Step completion data
export interface StepCompletionData {
  /** Step ID */
  stepId: string;
  /** Step index */
  stepIndex: number;
  /** Completion timestamp */
  completedAt: number;
  /** Time spent on step */
  timeSpent: number;
  /** Data collected in step */
  data?: Record<string, any>;
  /** Whether step was skipped */
  skipped: boolean;
  /** Skip reason if applicable */
  skipReason?: string;
  /** Validation errors if any */
  validationErrors?: string[];
  /** Step outcome */
  outcome: "completed" | "skipped" | "abandoned" | "error";
}

// Progress events
export type ProgressEvent = 
  | "step_enter"
  | "step_exit" 
  | "step_complete"
  | "step_error"
  | "step_skip"
  | "navigation_attempt"
  | "flow_start"
  | "flow_complete"
  | "flow_abandon"
  | "flow_pause"
  | "flow_resume";

export interface ProgressEventData {
  /** Event type */
  event: ProgressEvent;
  /** Current step */
  step: number;
  /** Step ID */
  stepId: string;
  /** Timestamp */
  timestamp: number;
  /** Additional event data */
  data?: Record<string, any>;
  /** Flow context */
  context: {
    flowType: BookingFlowType;
    service?: CanonicalService;
    provider?: BookingProvider;
    totalSteps: number;
    completionPercentage: number;
    sessionId?: string;
    userId?: string;
  };
}

// Pre-defined flow templates
export interface FlowTemplate {
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Flow configuration */
  config: FlowConfiguration;
  /** Recommended services */
  recommendedFor: CanonicalService[];
  /** Template tags */
  tags: string[];
  /** Template version */
  version: string;
  /** Template author */
  author?: string;
  /** Creation date */
  createdAt: string;
  /** Last updated */
  updatedAt?: string;
}

// Progress export data
export interface ProgressExportData {
  /** Flow configuration */
  flow: FlowConfiguration;
  /** Progress state */
  state: ProgressState;
  /** Step completion history */
  completions: StepCompletionData[];
  /** Analytics data */
  analytics: ProgressAnalytics;
  /** Export timestamp */
  exportedAt: number;
  /** Export version */
  version: string;
  /** Export format version */
  formatVersion: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

// Progress hooks return types
export interface UseProgressReturn {
  /** Current progress state */
  state: ProgressState;
  /** Navigate to specific step */
  goToStep: (stepIndex: number) => void;
  /** Go to next step */
  nextStep: () => void;
  /** Go to previous step */
  previousStep: () => void;
  /** Skip current step */
  skipStep: () => void;
  /** Complete current step */
  completeStep: (data?: any) => void;
  /** Mark step as error */
  errorStep: (error: string) => void;
  /** Reset progress */
  reset: () => void;
  /** Save progress */
  save: () => void;
  /** Load progress */
  load: () => void;
}

// Progress provider context
export interface ProgressContextValue {
  /** Current flow configuration */
  flowConfig?: FlowConfiguration;
  /** Progress state */
  state: ProgressState;
  /** Update progress state */
  updateState: (updates: Partial<ProgressState>) => void;
  /** Progress actions */
  actions: {
    goToStep: (stepIndex: number) => void;
    nextStep: () => void;
    previousStep: () => void;
    skipStep: () => void;
    completeStep: (data?: any) => void;
    errorStep: (error: string) => void;
    reset: () => void;
  };
  /** Analytics tracking */
  track: (event: string, properties: Record<string, any>) => void;
}

// Component size variants
export type ProgressSize = "small" | "medium" | "large";

// Step interaction modes
export type StepInteractionMode = "click" | "hover" | "focus" | "disabled";

// Progress orientation
export type ProgressOrientation = "horizontal" | "vertical";

// Step number display modes
export type StepNumberMode = "numbers" | "dots" | "icons" | "none";

// Error recovery options
export interface ErrorRecoveryOptions {
  /** Allow retry on error */
  allowRetry?: boolean;
  /** Maximum retry attempts */
  maxRetries?: number;
  /** Retry delay in ms */
  retryDelay?: number;
  /** Auto-retry on transient errors */
  autoRetry?: boolean;
  /** Error recovery callback */
  onRecover?: (step: ProgressStep, attempt: number) => void;
}