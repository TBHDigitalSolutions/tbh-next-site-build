// src/booking/components/BookingProgress/lib/utils.ts
// Production utilities for BookingProgress component

import type { 
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
import type { CanonicalService } from '../../../lib/types';

// Storage key for progress persistence
const PROGRESS_STORAGE_KEY = 'booking_progress_state';

/**
 * Get pre-configured flow for booking types
 */
export function getFlowConfiguration(flowType: BookingFlowType, service?: CanonicalService): FlowConfiguration {
  const baseConfig = {
    type: flowType,
    estimatedTotalTime: 300,
    requiredSteps: [],
    optionalSteps: [],
  };

  switch (flowType) {
    case 'simple':
      return {
        ...baseConfig,
        steps: [
          {
            id: 'service-selection',
            label: 'Select Service',
            description: 'Choose the service you need',
            estimatedTime: 60,
            optional: false,
            clickable: true,
          },
          {
            id: 'time-selection',
            label: 'Choose Time',
            description: 'Pick your preferred time slot',
            estimatedTime: 90,
            optional: false,
            clickable: true,
          },
          {
            id: 'contact-info',
            label: 'Contact Details',
            description: 'Provide your contact information',
            estimatedTime: 120,
            optional: false,
            clickable: true,
          },
          {
            id: 'confirmation',
            label: 'Confirmation',
            description: 'Review and confirm your booking',
            estimatedTime: 30,
            optional: false,
            clickable: false,
          },
        ],
        estimatedTotalTime: 300,
        requiredSteps: ['service-selection', 'time-selection', 'contact-info', 'confirmation'],
      };

    case 'detailed':
      return {
        ...baseConfig,
        steps: [
          {
            id: 'service-selection',
            label: 'Select Service',
            description: 'Choose the service you need',
            estimatedTime: 60,
            optional: false,
            clickable: true,
          },
          {
            id: 'requirements',
            label: 'Requirements',
            description: 'Tell us about your project needs',
            estimatedTime: 180,
            optional: false,
            clickable: true,
          },
          {
            id: 'time-selection',
            label: 'Choose Time',
            description: 'Pick your preferred time slot',
            estimatedTime: 90,
            optional: false,
            clickable: true,
          },
          {
            id: 'contact-info',
            label: 'Contact Details',
            description: 'Provide your contact information',
            estimatedTime: 120,
            optional: false,
            clickable: true,
          },
          {
            id: 'payment',
            label: 'Payment',
            description: 'Complete payment for your booking',
            estimatedTime: 90,
            optional: true,
            clickable: true,
          },
          {
            id: 'confirmation',
            label: 'Confirmation',
            description: 'Review and confirm your booking',
            estimatedTime: 30,
            optional: false,
            clickable: false,
          },
        ],
        estimatedTotalTime: 570,
        requiredSteps: ['service-selection', 'requirements', 'time-selection', 'contact-info', 'confirmation'],
        optionalSteps: ['payment'],
      };

    case 'consultation':
      return {
        ...baseConfig,
        steps: [
          {
            id: 'service-selection',
            label: 'Select Service',
            description: 'Choose consultation type',
            estimatedTime: 60,
            optional: false,
            clickable: true,
          },
          {
            id: 'questionnaire',
            label: 'Questionnaire',
            description: 'Answer a few questions about your needs',
            estimatedTime: 240,
            optional: false,
            clickable: true,
          },
          {
            id: 'time-selection',
            label: 'Schedule Meeting',
            description: 'Choose your consultation time',
            estimatedTime: 90,
            optional: false,
            clickable: true,
          },
          {
            id: 'contact-info',
            label: 'Contact Details',
            description: 'Provide your contact information',
            estimatedTime: 90,
            optional: false,
            clickable: true,
          },
          {
            id: 'confirmation',
            label: 'Confirmation',
            description: 'Confirm your consultation',
            estimatedTime: 30,
            optional: false,
            clickable: false,
          },
        ],
        estimatedTotalTime: 510,
        requiredSteps: ['service-selection', 'questionnaire', 'time-selection', 'contact-info', 'confirmation'],
      };

    case 'quote':
      return {
        ...baseConfig,
        steps: [
          {
            id: 'service-selection',
            label: 'Select Service',
            description: 'Choose the service you need quoted',
            estimatedTime: 60,
            optional: false,
            clickable: true,
          },
          {
            id: 'project-details',
            label: 'Project Details',
            description: 'Provide detailed project information',
            estimatedTime: 300,
            optional: false,
            clickable: true,
          },
          {
            id: 'contact-info',
            label: 'Contact Details',
            description: 'How can we reach you with the quote?',
            estimatedTime: 90,
            optional: false,
            clickable: true,
          },
          {
            id: 'quote-generation',
            label: 'Generate Quote',
            description: 'We\'re preparing your custom quote',
            estimatedTime: 60,
            optional: false,
            clickable: false,
          },
        ],
        estimatedTotalTime: 510,
        requiredSteps: ['service-selection', 'project-details', 'contact-info', 'quote-generation'],
      };

    default:
      return {
        ...baseConfig,
        steps: [
          {
            id: 'step-1',
            label: 'Step 1',
            description: 'Complete the first step',
            estimatedTime: 60,
            optional: false,
            clickable: true,
          },
          {
            id: 'step-2',
            label: 'Step 2',
            description: 'Complete the second step',
            estimatedTime: 90,
            optional: false,
            clickable: true,
          },
          {
            id: 'confirmation',
            label: 'Confirmation',
            description: 'Confirm your selections',
            estimatedTime: 30,
            optional: false,
            clickable: false,
          },
        ],
        estimatedTotalTime: 180,
        requiredSteps: ['step-1', 'step-2', 'confirmation'],
      };
  }
}

/**
 * Calculate completion percentage based on step statuses
 */
export function calculateCompletionPercentage(steps: ProgressStep[]): number {
  if (steps.length === 0) return 0;
  
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  return Math.round((completedSteps / steps.length) * 100);
}

/**
 * Calculate time remaining based on current step and estimates
 */
export function calculateTimeRemaining(steps: ProgressStep[], currentStep: number): number {
  const remainingSteps = steps.slice(currentStep);
  return remainingSteps.reduce((total, step) => {
    return total + (step.estimatedTime || 60); // Default 1 minute per step
  }, 0);
}

/**
 * Format time duration for display
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Validate step navigation
 */
export function validateNavigation(
  fromStep: number, 
  toStep: number, 
  steps: ProgressStep[]
): NavigationResult {
  // Basic bounds checking
  if (toStep < 0 || toStep >= steps.length) {
    return {
      success: false,
      error: 'Invalid step index',
    };
  }

  // Backward navigation is always allowed
  if (toStep <= fromStep) {
    return {
      success: true,
      newStep: toStep,
    };
  }

  // Forward navigation - check if all intermediate required steps are completed
  const skippedSteps: number[] = [];
  for (let i = fromStep + 1; i < toStep; i++) {
    const step = steps[i];
    if (!step.optional && step.status !== 'completed') {
      return {
        success: false,
        error: `Must complete ${step.label} before proceeding`,
      };
    }
    
    if (step.optional && step.status === 'pending') {
      skippedSteps.push(i);
    }
  }

  return {
    success: true,
    newStep: toStep,
    skippedSteps,
  };
}

/**
 * Validate current step completion
 */
export function validateStepCompletion(
  step: ProgressStep,
  data?: Record<string, any>
): ProgressValidation {
  const validation: ProgressValidation = {
    isValid: true,
    errors: [],
    warnings: [],
    requiredFields: [],
    missingFields: [],
  };

  // Basic step validation
  if (!step.id) {
    validation.errors.push('Step must have an ID');
    validation.isValid = false;
  }

  if (!step.label) {
    validation.errors.push('Step must have a label');
    validation.isValid = false;
  }

  // Check if step can be completed
  if (step.status === 'error') {
    validation.errors.push(step.errorMessage || 'Step has an error');
    validation.isValid = false;
  }

  // Optional step warnings
  if (step.optional && step.status === 'pending') {
    validation.warnings?.push('This step is optional and can be skipped');
  }

  return validation;
}

/**
 * Update step status
 */
export function updateStepStatus(
  steps: ProgressStep[],
  stepIndex: number,
  status: StepStatus,
  errorMessage?: string
): ProgressStep[] {
  return steps.map((step, index) => {
    if (index === stepIndex) {
      return {
        ...step,
        status,
        errorMessage: status === 'error' ? errorMessage : undefined,
      };
    }
    return step;
  });
}

/**
 * Apply conditional steps based on data
 */
export function applyConditionalSteps(
  baseSteps: ProgressStep[],
  conditionalSteps: ConditionalStep[],
  data: Record<string, any>
): ProgressStep[] {
  const result = [...baseSteps];

  conditionalSteps.forEach(({ stepId, condition, step }) => {
    const shouldInclude = evaluateCondition(condition, data);
    
    if (shouldInclude) {
      // Find insertion point or replace existing
      const existingIndex = result.findIndex(s => s.id === stepId);
      const newStep: ProgressStep = { ...step, status: 'pending' };
      
      if (existingIndex >= 0) {
        result[existingIndex] = newStep;
      } else {
        // Insert in appropriate position based on step dependencies
        result.push(newStep);
      }
    } else {
      // Remove step if condition not met
      const existingIndex = result.findIndex(s => s.id === stepId);
      if (existingIndex >= 0) {
        result.splice(existingIndex, 1);
      }
    }
  });

  return result;
}

/**
 * Evaluate conditional step condition
 */
function evaluateCondition(condition: any, data: Record<string, any>): boolean {
  const { field, value, operator } = condition;
  const fieldValue = data[field];

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'not-equals':
      return fieldValue !== value;
    case 'contains':
      return Array.isArray(fieldValue) 
        ? fieldValue.includes(value)
        : String(fieldValue).includes(String(value));
    case 'greater-than':
      return Number(fieldValue) > Number(value);
    case 'less-than':
      return Number(fieldValue) < Number(value);
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null;
    default:
      return false;
  }
}

/**
 * Save progress to browser storage
 */
export function saveProgressToStorage(
  flowType: BookingFlowType,
  steps: ProgressStep[],
  currentStep: number,
  startTime: number,
  service?: CanonicalService
): void {
  if (typeof window === 'undefined') return;

  try {
    const progressData = {
      flowType,
      service,
      steps,
      currentStep,
      startTime,
      savedAt: Date.now(),
      version: '1.0.0',
    };

    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressData));
  } catch (error) {
    console.warn('Failed to save progress to storage:', error);
  }
}

/**
 * Load progress from browser storage
 */
export function loadProgressFromStorage(): {
  flowType: BookingFlowType;
  service?: CanonicalService;
  steps: ProgressStep[];
  currentStep: number;
  startTime: number;
} | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!stored) return null;

    const progressData = JSON.parse(stored);
    
    // Check if data is recent (within 24 hours)
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (Date.now() - progressData.savedAt > maxAge) {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
      return null;
    }

    return progressData;
  } catch (error) {
    console.warn('Failed to load progress from storage:', error);
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    return null;
  }
}

/**
 * Clear progress from storage
 */
export function clearProgressFromStorage(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear progress from storage:', error);
  }
}

/**
 * Generate analytics event data
 */
export function createProgressEventData(
  event: string,
  step: number,
  stepId: string,
  context: {
    flowType: BookingFlowType;
    service?: CanonicalService;
    provider?: string;
    totalSteps: number;
    completionPercentage: number;
  },
  additionalData?: Record<string, any>
): ProgressEventData {
  return {
    event: event as any,
    step,
    stepId,
    timestamp: Date.now(),
    data: additionalData,
    context,
  };
}

/**
 * Get step completion data
 */
export function getStepCompletionData(
  step: ProgressStep,
  timeSpent: number,
  data?: Record<string, any>
): StepCompletionData {
  return {
    stepId: step.id,
    completedAt: Date.now(),
    timeSpent,
    data,
    skipped: step.status === 'skipped',
    skipReason: step.status === 'skipped' ? 'User skipped optional step' : undefined,
  };
}

/**
 * Validate flow configuration
 */
export function validateFlowConfiguration(config: FlowConfiguration): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!config.type) {
    errors.push('Flow must have a type');
  }

  if (!config.steps || config.steps.length === 0) {
    errors.push('Flow must have at least one step');
  }

  // Check step IDs are unique
  const stepIds = config.steps.map(s => s.id);
  const duplicateIds = stepIds.filter((id, index) => stepIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate step IDs found: ${duplicateIds.join(', ')}`);
  }

  // Check required steps exist
  config.requiredSteps.forEach(stepId => {
    if (!stepIds.includes(stepId)) {
      errors.push(`Required step "${stepId}" not found in steps`);
    }
  });

  // Check optional steps exist
  config.optionalSteps.forEach(stepId => {
    if (!stepIds.includes(stepId)) {
      errors.push(`Optional step "${stepId}" not found in steps`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create minimal step configuration
 */
export function createStep(
  id: string,
  label: string,
  options: Partial<Omit<ProgressStep, 'id' | 'label'>> = {}
): ProgressStep {
  return {
    id,
    label,
    status: 'pending',
    optional: false,
    clickable: true,
    estimatedTime: 60,
    ...options,
  };
}

/**
 * Create minimal flow configuration
 */
export function createFlow(
  type: BookingFlowType,
  steps: ProgressStep[],
  options: Partial<Omit<FlowConfiguration, 'type' | 'steps'>> = {}
): FlowConfiguration {
  const totalTime = steps.reduce((sum, step) => sum + (step.estimatedTime || 60), 0);
  
  return {
    type,
    steps,
    estimatedTotalTime: totalTime,
    requiredSteps: steps.filter(s => !s.optional).map(s => s.id),
    optionalSteps: steps.filter(s => s.optional).map(s => s.id),
    ...options,
  };
}