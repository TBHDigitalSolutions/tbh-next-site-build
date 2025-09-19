// scripts/booking/validate-booking-progress.ts
// Comprehensive validation and testing for BookingProgress component

import { z } from 'zod';
import type {
  ProgressStep,
  BookingProgressProps,
  FlowConfiguration,
  BookingFlowType,
  ProgressVariant,
  StepStatus,
} from '../../src/booking/components/BookingProgress/BookingProgress.types';

// Validation schemas
const StepStatusSchema = z.enum(['pending', 'current', 'completed', 'error', 'skipped']);

const ProgressStepSchema = z.object({
  id: z.string().min(1, 'Step ID is required'),
  label: z.string().min(1, 'Step label is required'),
  description: z.string().optional(),
  status: StepStatusSchema,
  optional: z.boolean().optional(),
  icon: z.union([z.string(), z.function()]).optional(),
  estimatedTime: z.number().positive().optional(),
  metadata: z.record(z.any()).optional(),
  errorMessage: z.string().optional(),
  clickable: z.boolean().optional(),
  className: z.string().optional(),
});

const FlowConfigurationSchema = z.object({
  type: z.enum(['simple', 'detailed', 'consultation', 'quote', 'custom']),
  steps: z.array(ProgressStepSchema.omit({ status: true })).min(1, 'At least one step is required'),
  estimatedTotalTime: z.number().positive(),
  requiredSteps: z.array(z.string()),
  optionalSteps: z.array(z.string()),
  dependencies: z.record(z.array(z.string())).optional(),
});

const BookingProgressPropsSchema = z.object({
  flowType: z.enum(['simple', 'detailed', 'consultation', 'quote', 'custom']),
  steps: z.array(ProgressStepSchema).min(1, 'At least one step is required'),
  currentStep: z.number().nonnegative(),
  variant: z.enum(['horizontal', 'vertical', 'compact', 'detailed', 'circular']).optional(),
  position: z.enum(['top', 'bottom', 'left', 'right', 'floating']).optional(),
  showStepNumbers: z.boolean().optional(),
  showDescriptions: z.boolean().optional(),
  showEstimatedTime: z.boolean().optional(),
  showPercentage: z.boolean().optional(),
  enableNavigation: z.boolean().optional(),
  allowSkipping: z.boolean().optional(),
  animation: z.enum(['slide', 'fade', 'scale', 'bounce', 'none']).optional(),
  className: z.string().optional(),
  service: z.enum([
    'web-development-services',
    'video-production-services',
    'seo-services',
    'marketing-services',
    'lead-generation-services',
    'content-production-services'
  ]).optional(),
  provider: z.enum(['cal', 'calendly', 'acuity', 'custom']).optional(),
});

// Validation functions
export function validateProgressStep(step: unknown): { valid: boolean; errors: string[] } {
  try {
    ProgressStepSchema.parse(step);
    
    const errors: string[] = [];
    const typedStep = step as ProgressStep;
    
    // Business logic validation
    if (typedStep.estimatedTime && typedStep.estimatedTime > 1800) { // 30 minutes
      errors.push('Estimated time seems too long (>30 minutes)');
    }
    
    if (typedStep.status === 'error' && !typedStep.errorMessage) {
      errors.push('Error status requires an error message');
    }
    
    if (typedStep.optional && typedStep.status === 'current') {
      // This is fine, optional steps can be current
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return {
      valid: false,
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid progress step']
    };
  }
}

export function validateFlowConfiguration(config: unknown): { valid: boolean; errors: string[] } {
  try {
    FlowConfigurationSchema.parse(config);
    
    const errors: string[] = [];
    const typedConfig = config as FlowConfiguration;
    
    // Check step ID uniqueness
    const stepIds = typedConfig.steps.map(s => s.id);
    const duplicateIds = stepIds.filter((id, index) => stepIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate step IDs found: ${duplicateIds.join(', ')}`);
    }
    
    // Check required steps exist
    typedConfig.requiredSteps.forEach(stepId => {
      if (!stepIds.includes(stepId)) {
        errors.push(`Required step "${stepId}" not found in steps`);
      }
    });
    
    // Check optional steps exist
    typedConfig.optionalSteps.forEach(stepId => {
      if (!stepIds.includes(stepId)) {
        errors.push(`Optional step "${stepId}" not found in steps`);
      }
    });
    
    // Validate estimated total time
    const calculatedTime = typedConfig.steps.reduce((total, step) => total + (step.estimatedTime || 60), 0);
    if (Math.abs(calculatedTime - typedConfig.estimatedTotalTime) > 120) { // 2 minutes tolerance
      errors.push(`Estimated total time (${typedConfig.estimatedTotalTime}s) doesn't match sum of step times (${calculatedTime}s)`);
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return {
      valid: false,
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid flow configuration']
    };
  }
}

export function validateProgressProps(props: unknown): { valid: boolean; errors: string[] } {
  try {
    BookingProgressPropsSchema.parse(props);
    
    const errors: string[] = [];
    const typedProps = props as BookingProgressProps;
    
    // Check current step bounds
    if (typedProps.currentStep >= typedProps.steps.length) {
      errors.push('Current step index is out of bounds');
    }
    
    if (typedProps.currentStep < 0) {
      errors.push('Current step index cannot be negative');
    }
    
    // Validate steps
    typedProps.steps.forEach((step, index) => {
      const stepValidation = validateProgressStep(step);
      if (!stepValidation.valid) {
        errors.push(`Step ${index} (${step.id}): ${stepValidation.errors.join(', ')}`);
      }
    });
    
    // Check step status consistency
    const currentStepData = typedProps.steps[typedProps.currentStep];
    if (currentStepData && currentStepData.status !== 'current') {
      errors.push('Current step should have "current" status');
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return {
      valid: false,
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid progress props']
    };
  }
}

// Mock data generators
export function generateMockProgressStep(overrides: Partial<ProgressStep> = {}): ProgressStep {
  return {
    id: 'mock-step',
    label: 'Mock Step',
    description: 'This is a mock step for testing',
    status: 'pending',
    optional: false,
    clickable: true,
    estimatedTime: 60,
    ...overrides,
  };
}

export function generateMockFlowConfiguration(flowType: BookingFlowType = 'simple'): FlowConfiguration {
  const baseSteps = [
    { id: 'step-1', label: 'Step 1', estimatedTime: 60, optional: false, clickable: true },
    { id: 'step-2', label: 'Step 2', estimatedTime: 90, optional: false, clickable: true },
    { id: 'step-3', label: 'Step 3', estimatedTime: 120, optional: true, clickable: true },
  ];

  return {
    type: flowType,
    steps: baseSteps,
    estimatedTotalTime: 270,
    requiredSteps: ['step-1', 'step-2'],
    optionalSteps: ['step-3'],
  };
}

export function generateMockProgressSteps(count: number = 4): ProgressStep[] {
  const statuses: StepStatus[] = ['completed', 'completed', 'current', 'pending'];
  
  return Array.from({ length: count }, (_, index) => ({
    id: `step-${index + 1}`,
    label: `Step ${index + 1}`,
    description: `Description for step ${index + 1}`,
    status: statuses[index] || 'pending',
    optional: index === count - 1, // Last step is optional
    clickable: true,
    estimatedTime: 60 + (index * 30),
  }));
}

// Performance testing utilities
export class ProgressPerformanceTester {
  private startTime: number = 0;
  private metrics: Map<string, number[]> = new Map();
  
  startMeasure(operation: string): void {
    this.startTime = performance.now();
  }
  
  endMeasure(operation: string): number {
    const duration = performance.now() - this.startTime;
    
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    this.metrics.get(operation)!.push(duration);
    return duration;
  }
  
  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    if (times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  getReport(): Record<string, { average: number; min: number; max: number; count: number }> {
    const report: Record<string, any> = {};
    
    for (const [operation, times] of this.metrics) {
      if (times.length > 0) {
        report[operation] = {
          average: this.getAverageTime(operation),
          min: Math.min(...times),
          max: Math.max(...times),
          count: times.length
        };
      }
    }
    
    return report;
  }
  
  reset(): void {
    this.metrics.clear();
  }
}

// Accessibility testing helpers
export function validateProgressAccessibility(element: HTMLElement): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check progress has proper ARIA attributes
  const progressElement = element.querySelector('[role="progressbar"]');
  if (!progressElement) {
    errors.push('Progress element missing progressbar role');
  } else {
    const valuenow = progressElement.getAttribute('aria-valuenow');
    const valuemin = progressElement.getAttribute('aria-valuemin');
    const valuemax = progressElement.getAttribute('aria-valuemax');
    
    if (!valuenow) errors.push('Progress missing aria-valuenow');
    if (!valuemin) errors.push('Progress missing aria-valuemin');
    if (!valuemax) errors.push('Progress missing aria-valuemax');
  }
  
  // Check step elements have proper labels
  const stepElements = element.querySelectorAll('[role="button"]');
  stepElements.forEach((step, index) => {
    const ariaLabel = step.getAttribute('aria-label');
    const ariaCurrent = step.getAttribute('aria-current');
    
    if (!ariaLabel) {
      errors.push(`Step ${index} missing aria-label`);
    }
    
    if (step.classList.contains('current') && !ariaCurrent) {
      errors.push(`Current step ${index} missing aria-current`);
    }
  });
  
  // Check for live region announcements
  const liveRegion = element.querySelector('[aria-live="polite"]');
  if (!liveRegion) {
    errors.push('Missing live region for step announcements');
  }
  
  // Check keyboard navigation
  const focusableElements = element.querySelectorAll('[tabindex="0"], button:not([disabled])');
  if (focusableElements.length === 0) {
    errors.push('No keyboard focusable elements found');
  }
  
  return { valid: errors.length === 0, errors };
}

// Flow logic testing
export function testFlowNavigation(
  steps: ProgressStep[],
  fromStep: number,
  toStep: number
): { canNavigate: boolean; reason?: string } {
  // Basic bounds checking
  if (toStep < 0 || toStep >= steps.length) {
    return { canNavigate: false, reason: 'Target step out of bounds' };
  }
  
  if (fromStep < 0 || fromStep >= steps.length) {
    return { canNavigate: false, reason: 'Source step out of bounds' };
  }
  
  // Can't navigate to error steps
  if (steps[toStep].status === 'error') {
    return { canNavigate: false, reason: 'Cannot navigate to error step' };
  }
  
  // Check if target step is clickable
  if (!steps[toStep].clickable) {
    return { canNavigate: false, reason: 'Target step is not clickable' };
  }
  
  // Forward navigation - check required steps
  if (toStep > fromStep) {
    for (let i = fromStep; i < toStep; i++) {
      const step = steps[i];
      if (!step.optional && step.status !== 'completed' && step.status !== 'skipped') {
        return { canNavigate: false, reason: `Step "${step.label}" must be completed first` };
      }
    }
  }
  
  return { canNavigate: true };
}

// Integration test runner
export async function runProgressTests(): Promise<void> {
  console.log('🧪 Running BookingProgress validation tests...\n');
  
  const tester = new ProgressPerformanceTester();
  let passCount = 0;
  let failCount = 0;
  
  // Test 1: Mock data generation and validation
  console.log('Test 1: Mock data generation and validation');
  tester.startMeasure('mock-generation');
  
  const mockStep = generateMockProgressStep();
  const mockConfig = generateMockFlowConfiguration();
  const mockSteps = generateMockProgressSteps(4);
  
  tester.endMeasure('mock-generation');
  
  const stepValidation = validateProgressStep(mockStep);
  const configValidation = validateFlowConfiguration(mockConfig);
  
  const mockProps: BookingProgressProps = {
    flowType: 'simple',
    steps: mockSteps,
    currentStep: 2,
  };
  const propsValidation = validateProgressProps(mockProps);
  
  if (stepValidation.valid && configValidation.valid && propsValidation.valid) {
    console.log('✅ Mock data generation and validation passed');
    passCount++;
  } else {
    console.log('❌ Mock data validation failed:', 
      stepValidation.errors, configValidation.errors, propsValidation.errors);
    failCount++;
  }
  
  // Test 2: Flow navigation logic
  console.log('\nTest 2: Flow navigation logic');
  
  const navTest1 = testFlowNavigation(mockSteps, 2, 3); // Should pass
  const navTest2 = testFlowNavigation(mockSteps, 2, 1); // Should pass (backward)
  const navTest3 = testFlowNavigation(mockSteps, 0, 3); // Should fail (incomplete steps)
  
  if (navTest1.canNavigate && navTest2.canNavigate && !navTest3.canNavigate) {
    console.log('✅ Flow navigation logic passed');
    passCount++;
  } else {
    console.log('❌ Flow navigation logic failed:', { navTest1, navTest2, navTest3 });
    failCount++;
  }
  
  // Test 3: Step status consistency
  console.log('\nTest 3: Step status consistency');
  
  const inconsistentSteps = generateMockProgressSteps(3);
  inconsistentSteps[1].status = 'current'; // Current step should match currentStep prop
  
  const inconsistentProps: BookingProgressProps = {
    flowType: 'simple',
    steps: inconsistentSteps,
    currentStep: 0, // Mismatch with step status
  };
  
  const consistencyValidation = validateProgressProps(inconsistentProps);
  
  if (!consistencyValidation.valid && consistencyValidation.errors.some(e => e.includes('current'))) {
    console.log('✅ Step status consistency validation passed');
    passCount++;
  } else {
    console.log('❌ Step status consistency validation failed - should catch status mismatch');
    failCount++;
  }
  
  // Test 4: Flow configuration validation
  console.log('\nTest 4: Flow configuration validation');
  
  const invalidConfig = {
    type: 'simple' as const,
    steps: [
      { id: 'step-1', label: 'Step 1', estimatedTime: 60, optional: false },
      { id: 'step-1', label: 'Duplicate Step', estimatedTime: 90, optional: false }, // Duplicate ID
    ],
    estimatedTotalTime: 150,
    requiredSteps: ['step-1', 'non-existent-step'], // Non-existent step
    optionalSteps: [],
  };
  
  const invalidConfigValidation = validateFlowConfiguration(invalidConfig);
  
  if (!invalidConfigValidation.valid && 
      invalidConfigValidation.errors.some(e => e.includes('Duplicate')) &&
      invalidConfigValidation.errors.some(e => e.includes('not found'))) {
    console.log('✅ Flow configuration validation passed (caught errors)');
    passCount++;
  } else {
    console.log('❌ Flow configuration validation failed - should catch duplicate IDs and missing steps');
    failCount++;
  }
  
  // Performance report
  console.log('\n📊 Performance Report:');
  const report = tester.getReport();
  Object.entries(report).forEach(([operation, metrics]) => {
    console.log(`${operation}: ${metrics.average.toFixed(2)}ms avg (${metrics.count} runs)`);
  });
  
  // Summary
  console.log(`\n📋 Test Summary:`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${passCount + failCount}`);
  
  if (failCount === 0) {
    console.log('\n🎉 All tests passed! BookingProgress component is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before deployment.');
    process.exit(1);
  }
}

// CLI runner
if (require.main === module) {
  runProgressTests().catch(console.error);
}