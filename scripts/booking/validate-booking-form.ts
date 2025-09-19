// scripts/booking/validate-booking-form.ts
// Comprehensive validation and testing for BookingForm component

import { z } from 'zod';
import type {
  FormField,
  FormConfig,
  BookingFormProps,
  FormData,
  ValidationResult,
} from '../../src/booking/components/BookingForm/BookingForm.types';

// Validation schemas
const FieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  disabled: z.boolean().optional(),
  description: z.string().optional(),
});

const FieldValidationSchema = z.object({
  minLength: z.number().positive().optional(),
  maxLength: z.number().positive().optional(),
  pattern: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  acceptedFileTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().positive().optional(),
  custom: z.function().optional(),
});

const ConditionalLogicSchema = z.object({
  dependsOn: z.string(),
  showWhen: z.any(),
  operator: z.enum(['equals', 'not-equals', 'contains', 'greater-than', 'less-than']).optional(),
});

const FormFieldSchema = z.object({
  id: z.string().min(1, 'Field ID is required'),
  type: z.enum(['text', 'email', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'date', 'time', 'datetime', 'number', 'url', 'file']),
  label: z.string().min(1, 'Field label is required'),
  placeholder: z.string().optional(),
  required: z.boolean(),
  validation: FieldValidationSchema.optional(),
  options: z.array(FieldOptionSchema).optional(),
  defaultValue: z.any().optional(),
  helpText: z.string().optional(),
  group: z.string().optional(),
  conditional: ConditionalLogicSchema.optional(),
  properties: z.record(z.any()).optional(),
});

const SubmissionConfigSchema = z.object({
  endpoint: z.string().url('Invalid submission endpoint'),
  method: z.enum(['POST', 'PUT']),
  successUrl: z.string().url().optional(),
  successMessage: z.string().optional(),
  autoSave: z.object({
    enabled: z.boolean(),
    interval: z.number().positive(),
    key: z.string(),
  }).optional(),
  fileUpload: z.object({
    enabled: z.boolean(),
    maxFiles: z.number().positive(),
    maxSize: z.number().positive(),
    allowedTypes: z.array(z.string()),
    endpoint: z.string().url(),
  }).optional(),
});

const ValidationConfigSchema = z.object({
  validateOnBlur: z.boolean(),
  validateOnChange: z.boolean(),
  showValidationImmediately: z.boolean(),
  messages: z.record(z.string()).optional(),
});

const UIConfigSchema = z.object({
  layout: z.enum(['single-column', 'two-column', 'accordion', 'steps']),
  showProgress: z.boolean(),
  progressPosition: z.enum(['top', 'bottom', 'sticky']).optional(),
  grouping: z.boolean(),
  compact: z.boolean(),
  showOptionalIndicators: z.boolean(),
});

const FormConfigSchema = z.object({
  service: z.enum([
    'web-development-services',
    'video-production-services',
    'seo-services',
    'marketing-services',
    'lead-generation-services',
    'content-production-services'
  ]),
  variant: z.enum(['intake', 'consultation', 'quote', 'contact', 'custom']),
  fields: z.array(FormFieldSchema).min(1, 'At least one field is required'),
  submission: SubmissionConfigSchema,
  validation: ValidationConfigSchema,
  ui: UIConfigSchema,
});

// Validation functions
export function validateFormField(field: unknown): { valid: boolean; errors: string[] } {
  try {
    FormFieldSchema.parse(field);
    
    const errors: string[] = [];
    const typedField = field as FormField;
    
    // Business logic validation
    if (typedField.type === 'select' || typedField.type === 'radio') {
      if (!typedField.options || typedField.options.length === 0) {
        errors.push(`${typedField.type} field must have options`);
      }
    }
    
    if (typedField.type === 'file' && typedField.validation) {
      if (!typedField.validation.acceptedFileTypes) {
        errors.push('File field must specify accepted file types');
      }
      if (!typedField.validation.maxFileSize) {
        errors.push('File field must specify maximum file size');
      }
    }
    
    if (typedField.validation?.minLength && typedField.validation?.maxLength) {
      if (typedField.validation.minLength > typedField.validation.maxLength) {
        errors.push('minLength cannot be greater than maxLength');
      }
    }
    
    if (typedField.validation?.min !== undefined && typedField.validation?.max !== undefined) {
      if (typedField.validation.min > typedField.validation.max) {
        errors.push('min value cannot be greater than max value');
      }
    }
    
    // Field ID validation (should be valid for nested objects)
    if (!/^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)*$/.test(typedField.id)) {
      errors.push('Field ID must be valid for nested object access (e.g., "customer.email")');
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return {
      valid: false,
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid form field']
    };
  }
}

export function validateFormConfig(config: unknown): { valid: boolean; errors: string[] } {
  try {
    FormConfigSchema.parse(config);
    
    const errors: string[] = [];
    const typedConfig = config as FormConfig;
    
    // Check for duplicate field IDs
    const fieldIds = typedConfig.fields.map(f => f.id);
    const duplicateIds = fieldIds.filter((id, index) => fieldIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate field IDs found: ${duplicateIds.join(', ')}`);
    }
    
    // Validate conditional logic dependencies
    typedConfig.fields.forEach(field => {
      if (field.conditional) {
        const dependencyExists = typedConfig.fields.some(f => f.id === field.conditional!.dependsOn);
        if (!dependencyExists) {
          errors.push(`Field "${field.id}" depends on non-existent field "${field.conditional.dependsOn}"`);
        }
      }
    });
    
    // Check required fields have meaningful validation
    const requiredFields = typedConfig.fields.filter(f => f.required);
    requiredFields.forEach(field => {
      if (field.type === 'email' && !field.validation?.pattern) {
        // This is okay, email type has built-in validation
      }
      if (field.type === 'text' && !field.validation?.minLength) {
        errors.push(`Required text field "${field.id}" should have minimum length validation`);
      }
    });
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return {
      valid: false,
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid form config']
    };
  }
}

export function validateFormProps(props: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!props || typeof props !== 'object') {
    return { valid: false, errors: ['Props must be an object'] };
  }
  
  const typedProps = props as Partial<BookingFormProps>;
  
  // Required config validation
  if (!typedProps.config) {
    errors.push('config is required');
  } else {
    const configValidation = validateFormConfig(typedProps.config);
    if (!configValidation.valid) {
      errors.push(`Invalid config: ${configValidation.errors.join(', ')}`);
    }
  }
  
  // Required onSubmit validation
  if (!typedProps.onSubmit || typeof typedProps.onSubmit !== 'function') {
    errors.push('onSubmit callback is required');
  }
  
  // Optional props validation
  if (typedProps.errorDisplay && !['inline', 'summary', 'both'].includes(typedProps.errorDisplay)) {
    errors.push('errorDisplay must be "inline", "summary", or "both"');
  }
  
  return { valid: errors.length === 0, errors };
}

// Mock data generators
export function generateMockFormField(overrides: Partial<FormField> = {}): FormField {
  return {
    id: 'customer.name',
    type: 'text',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    validation: {
      minLength: 2,
      maxLength: 100,
    },
    helpText: 'Please enter your first and last name',
    ...overrides,
  };
}

export function generateMockFormConfig(overrides: Partial<FormConfig> = {}): FormConfig {
  return {
    service: 'web-development-services',
    variant: 'intake',
    fields: [
      generateMockFormField({ id: 'customer.name', label: 'Full Name' }),
      generateMockFormField({ 
        id: 'customer.email', 
        type: 'email', 
        label: 'Email Address',
        placeholder: 'your@email.com'
      }),
      generateMockFormField({ 
        id: 'customer.phone', 
        type: 'phone', 
        label: 'Phone Number',
        required: false
      }),
      generateMockFormField({ 
        id: 'requirements.projectDescription', 
        type: 'textarea', 
        label: 'Project Description',
        validation: { minLength: 20, maxLength: 2000 }
      }),
    ],
    submission: {
      endpoint: 'https://api.example.com/forms/submit',
      method: 'POST',
      successMessage: 'Thank you for your submission!',
    },
    validation: {
      validateOnBlur: true,
      validateOnChange: false,
      showValidationImmediately: false,
    },
    ui: {
      layout: 'single-column',
      showProgress: true,
      grouping: true,
      compact: false,
      showOptionalIndicators: true,
    },
    ...overrides,
  };
}

export function generateMockFormData(): Partial<FormData> {
  return {
    customer: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      company: 'Acme Corp',
      timezone: 'America/New_York',
    },
    meeting: {
      type: 'video',
      duration: 30,
      preferredTimes: ['morning', 'afternoon'],
    },
    requirements: {
      projectDescription: 'We need a new website for our business that will help us attract more customers and improve our online presence.',
      budget: '10k-25k',
      timeline: '2-3-months',
      goals: ['increase-sales', 'improve-brand'],
    },
    marketing: {
      emailConsent: true,
      smsConsent: false,
      source: 'google',
    },
  };
}

// Performance testing utilities
export class FormPerformanceTester {
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
export function validateFormAccessibility(element: HTMLElement): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check form has proper structure
  const form = element.querySelector('form');
  if (!form) {
    errors.push('No form element found');
  }
  
  // Check all inputs have labels
  const inputs = element.querySelectorAll('input, textarea, select');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const label = element.querySelector(`label[for="${id}"]`);
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (!label && !ariaLabel && !ariaLabelledBy) {
      errors.push(`Input ${index} missing accessible label`);
    }
  });
  
  // Check required fields are marked
  const requiredInputs = element.querySelectorAll('input[required], textarea[required], select[required]');
  requiredInputs.forEach((input, index) => {
    const hasRequiredIndicator = input.parentElement?.querySelector('[aria-label*="required"], .required');
    const hasAriaRequired = input.getAttribute('aria-required') === 'true';
    
    if (!hasRequiredIndicator && !hasAriaRequired) {
      errors.push(`Required input ${index} not properly marked as required`);
    }
  });
  
  // Check error messages are associated
  const errorMessages = element.querySelectorAll('[class*="error"]');
  errorMessages.forEach((error, index) => {
    const describedBy = error.getAttribute('id');
    if (describedBy) {
      const associatedInput = element.querySelector(`[aria-describedby*="${describedBy}"]`);
      if (!associatedInput) {
        errors.push(`Error message ${index} not associated with an input`);
      }
    }
  });
  
  // Check fieldsets for radio/checkbox groups
  const radioGroups = element.querySelectorAll('input[type="radio"]');
  const checkboxGroups = element.querySelectorAll('input[type="checkbox"]');
  
  if (radioGroups.length > 1) {
    const fieldset = element.querySelector('fieldset');
    if (!fieldset) {
      errors.push('Radio button groups should be wrapped in fieldset');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Form data validation utilities
export function validateFormData(data: Partial<FormData>, fields: FormField[]): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Helper function to get nested value
  const getValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };
  
  fields.forEach(field => {
    const value = getValue(data, field.id);
    
    // Required field validation
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.id] = `${field.label} is required`;
      return;
    }
    
    // Skip validation for empty optional fields
    if (!field.required && (value === undefined || value === null || value === '')) {
      return;
    }
    
    // Type-specific validation
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field.id] = 'Please enter a valid email address';
        }
        break;
        
      case 'phone':
        const phoneRegex = /^[\+]?[\d\s\(\)\-\.]{10,}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          errors[field.id] = 'Please enter a valid phone number';
        }
        break;
        
      case 'url':
        try {
          new URL(value);
        } catch {
          errors[field.id] = 'Please enter a valid URL';
        }
        break;
        
      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          errors[field.id] = 'Please enter a valid number';
        }
        break;
    }
    
    // Length validation
    if (field.validation?.minLength && value.length < field.validation.minLength) {
      errors[field.id] = `${field.label} must be at least ${field.validation.minLength} characters`;
    }
    
    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      errors[field.id] = `${field.label} must be no more than ${field.validation.maxLength} characters`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Integration test runner
export async function runFormTests(): Promise<void> {
  console.log('🧪 Running BookingForm validation tests...\n');
  
  const tester = new FormPerformanceTester();
  let passCount = 0;
  let failCount = 0;
  
  // Test 1: Mock data generation and validation
  console.log('Test 1: Mock data generation and validation');
  tester.startMeasure('mock-generation');
  
  const mockField = generateMockFormField();
  const mockConfig = generateMockFormConfig();
  const mockData = generateMockFormData();
  
  tester.endMeasure('mock-generation');
  
  const fieldValidation = validateFormField(mockField);
  const configValidation = validateFormConfig(mockConfig);
  const dataValidation = validateFormData(mockData, mockConfig.fields);
  
  if (fieldValidation.valid && configValidation.valid && dataValidation.isValid) {
    console.log('✅ Mock data generation and validation passed');
    passCount++;
  } else {
    console.log('❌ Mock data validation failed:', 
      fieldValidation.errors, configValidation.errors, dataValidation.errors);
    failCount++;
  }
  
  // Test 2: Props validation
  console.log('\nTest 2: Props validation');
  
  const validProps: BookingFormProps = {
    config: mockConfig,
    onSubmit: async (data) => console.log('Submit:', data),
    initialData: mockData,
  };
  
  const propsValidation = validateFormProps(validProps);
  
  if (propsValidation.valid) {
    console.log('✅ Props validation passed');
    passCount++;
  } else {
    console.log('❌ Props validation failed:', propsValidation.errors);
    failCount++;
  }
  
  // Test 3: Edge case validation
  console.log('\nTest 3: Edge case validation');
  
  const edgeCaseConfig = generateMockFormConfig({
    fields: [
      generateMockFormField({
        id: 'invalid-id!', // Invalid field ID
        validation: { minLength: 10, maxLength: 5 } // Invalid validation
      })
    ]
  });
  
  const edgeCaseValidation = validateFormConfig(edgeCaseConfig);
  
  if (!edgeCaseValidation.valid && edgeCaseValidation.errors.length > 0) {
    console.log('✅ Edge case validation passed (correctly caught errors)');
    passCount++;
  } else {
    console.log('❌ Edge case validation failed - should have caught validation errors');
    failCount++;
  }
  
  // Test 4: Conditional field logic
  console.log('\nTest 4: Conditional field logic');
  
  const conditionalConfig = generateMockFormConfig({
    fields: [
      generateMockFormField({ id: 'trigger', type: 'select', options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]}),
      generateMockFormField({ 
        id: 'conditional', 
        conditional: { dependsOn: 'trigger', showWhen: 'yes' }
      })
    ]
  });
  
  const conditionalValidation = validateFormConfig(conditionalConfig);
  
  if (conditionalValidation.valid) {
    console.log('✅ Conditional field validation passed');
    passCount++;
  } else {
    console.log('❌ Conditional field validation failed:', conditionalValidation.errors);
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
    console.log('\n🎉 All tests passed! BookingForm component is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before deployment.');
    process.exit(1);
  }
}

// CLI runner
if (require.main === module) {
  runFormTests().catch(console.error);
}