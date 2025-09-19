// src/booking/lib/utils.ts - Additional utilities for BookingForm

import type { FormData, FormField } from '../components/BookingForm/BookingForm.types';

// Form validation utilities
export function validateFormField(field: FormField, value: any): string | null {
  // Required field validation
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${field.label} is required`;
  }

  // Skip validation for empty optional fields
  if (!field.required && (value === undefined || value === null || value === '')) {
    return null;
  }

  // Type-specific validation
  switch (field.type) {
    case 'email':
      if (!isValidEmail(value)) {
        return 'Please enter a valid email address';
      }
      break;

    case 'phone':
      if (!isValidPhone(value)) {
        return 'Please enter a valid phone number';
      }
      break;

    case 'url':
      if (!isValidURL(value)) {
        return 'Please enter a valid URL';
      }
      break;

    case 'number':
      const num = Number(value);
      if (isNaN(num)) {
        return 'Please enter a valid number';
      }
      if (field.validation?.min !== undefined && num < field.validation.min) {
        return `Value must be at least ${field.validation.min}`;
      }
      if (field.validation?.max !== undefined && num > field.validation.max) {
        return `Value must be no more than ${field.validation.max}`;
      }
      break;
  }

  // Length validation
  if (field.validation?.minLength && value.length < field.validation.minLength) {
    return `${field.label} must be at least ${field.validation.minLength} characters`;
  }

  if (field.validation?.maxLength && value.length > field.validation.maxLength) {
    return `${field.label} must be no more than ${field.validation.maxLength} characters`;
  }

  // Pattern validation
  if (field.validation?.pattern) {
    const regex = new RegExp(field.validation.pattern);
    if (!regex.test(value)) {
      return `${field.label} format is invalid`;
    }
  }

  return null;
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (supports various international formats)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[\d\s\(\)\-\.]{10,}$/;
  const cleanPhone = phone.replace(/\s/g, '');
  return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10;
}

// URL validation
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Sanitize form data to remove potentially harmful content
export function sanitizeFormData(data: Partial<FormData>): Partial<FormData> {
  const sanitized = { ...data };

  // Helper function to sanitize strings
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  };

  // Recursively sanitize object
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitizedObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitizedObj[key] = sanitizeObject(value);
      }
      return sanitizedObj;
    }
    
    return obj;
  };

  return sanitizeObject(sanitized);
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return as-is if format doesn't match
}

// Generate form field ID from label
export function generateFieldId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// Validate file upload
export function validateFileUpload(
  file: File, 
  maxSize?: number, 
  allowedTypes?: string[]
): string | null {
  if (maxSize && file.size > maxSize) {
    return `File size must be less than ${formatFileSize(maxSize)}`;
  }
  
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }
  
  return null;
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Generate form validation schema
export function generateValidationSchema(fields: FormField[]): Record<string, any> {
  const schema: Record<string, any> = {};
  
  fields.forEach(field => {
    const fieldSchema: any = {};
    
    if (field.required) {
      fieldSchema.required = true;
    }
    
    if (field.validation?.minLength) {
      fieldSchema.minLength = field.validation.minLength;
    }
    
    if (field.validation?.maxLength) {
      fieldSchema.maxLength = field.validation.maxLength;
    }
    
    if (field.validation?.pattern) {
      fieldSchema.pattern = field.validation.pattern;
    }
    
    if (field.type === 'email') {
      fieldSchema.type = 'email';
    }
    
    if (field.type === 'number') {
      fieldSchema.type = 'number';
      if (field.validation?.min !== undefined) {
        fieldSchema.min = field.validation.min;
      }
      if (field.validation?.max !== undefined) {
        fieldSchema.max = field.validation.max;
      }
    }
    
    schema[field.id] = fieldSchema;
  });
  
  return schema;
}

// Auto-save utilities
export function saveFormToLocalStorage(key: string, data: Partial<FormData>): void {
  try {
    const autoSaveData = {
      data,
      timestamp: Date.now(),
      version: '1.0',
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };
    localStorage.setItem(key, JSON.stringify(autoSaveData));
  } catch (error) {
    console.warn('Failed to auto-save form data:', error);
  }
}

export function loadFormFromLocalStorage(key: string): Partial<FormData> | null {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return null;
    
    const autoSaveData = JSON.parse(saved);
    
    // Check if data has expired
    if (Date.now() > autoSaveData.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    
    return autoSaveData.data;
  } catch (error) {
    console.warn('Failed to load saved form data:', error);
    return null;
  }
}

export function clearFormFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear saved form data:', error);
  }
}

// Form analytics utilities
export function calculateFormCompletionScore(
  fields: FormField[], 
  data: Partial<FormData>
): number {
  const totalFields = fields.length;
  const completedFields = fields.filter(field => {
    const value = getNestedValue(data, field.id);
    return value !== undefined && value !== null && value !== '';
  }).length;
  
  return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
}

export function getFormInteractionData(
  startTime: number,
  fields: FormField[],
  data: Partial<FormData>
): Record<string, any> {
  return {
    completion_time: Math.round((Date.now() - startTime) / 1000),
    completion_score: calculateFormCompletionScore(fields, data),
    total_fields: fields.length,
    completed_fields: fields.filter(field => {
      const value = getNestedValue(data, field.id);
      return value !== undefined && value !== null && value !== '';
    }).length,
    required_fields: fields.filter(f => f.required).length,
    optional_fields: fields.filter(f => !f.required).length,
  };
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Form field generators for common use cases
export function createEmailField(
  id: string = 'customer.email',
  required: boolean = true
): FormField {
  return {
    id,
    type: 'email',
    label: 'Email Address',
    placeholder: 'your@email.com',
    required,
    validation: {
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
    },
    helpText: 'We\'ll use this to send you updates about your project',
  };
}

export function createPhoneField(
  id: string = 'customer.phone',
  required: boolean = false
): FormField {
  return {
    id,
    type: 'phone',
    label: 'Phone Number',
    placeholder: '(555) 123-4567',
    required,
    helpText: 'Optional. We may call to discuss your project',
  };
}

export function createNameField(
  id: string = 'customer.name',
  required: boolean = true
): FormField {
  return {
    id,
    type: 'text',
    label: 'Full Name',
    placeholder: 'John Doe',
    required,
    validation: {
      minLength: 2,
      maxLength: 100,
    },
  };
}

export function createCompanyField(
  id: string = 'customer.company',
  required: boolean = false
): FormField {
  return {
    id,
    type: 'text',
    label: 'Company',
    placeholder: 'Your Company Name',
    required,
    validation: {
      maxLength: 100,
    },
  };
}

export function createProjectDescriptionField(
  id: string = 'requirements.projectDescription',
  required: boolean = true
): FormField {
  return {
    id,
    type: 'textarea',
    label: 'Project Description',
    placeholder: 'Tell us about your project...',
    required,
    validation: {
      minLength: 20,
      maxLength: 2000,
    },
    helpText: 'Please provide as much detail as possible about your project goals and requirements',
  };
}

export function createBudgetField(
  id: string = 'requirements.budget',
  required: boolean = false
): FormField {
  return {
    id,
    type: 'select',
    label: 'Budget Range',
    required,
    options: [
      { value: '5k-10k', label: '$5,000 - $10,000' },
      { value: '10k-25k', label: '$10,000 - $25,000' },
      { value: '25k-50k', label: '$25,000 - $50,000' },
      { value: '50k-100k', label: '$50,000 - $100,000' },
      { value: '100k+', label: '$100,000+' },
      { value: 'not-sure', label: 'Not sure yet' },
    ],
    helpText: 'This helps us provide appropriate recommendations',
  };
}

export function createTimelineField(
  id: string = 'requirements.timeline',
  required: boolean = false
): FormField {
  return {
    id,
    type: 'select',
    label: 'Project Timeline',
    required,
    options: [
      { value: 'asap', label: 'As soon as possible' },
      { value: '1-month', label: 'Within 1 month' },
      { value: '2-3-months', label: '2-3 months' },
      { value: '3-6-months', label: '3-6 months' },
      { value: '6-months+', label: '6+ months' },
      { value: 'flexible', label: 'Flexible timing' },
    ],
  };
}

export function createConsentField(
  id: string = 'marketing.emailConsent',
  required: boolean = true
): FormField {
  return {
    id,
    type: 'checkbox',
    label: 'I agree to receive email updates about my project',
    required,
  };
}

// Pre-built form configurations for common use cases
export function createIntakeFormFields(): FormField[] {
  return [
    createNameField(),
    createEmailField(),
    createPhoneField(),
    createCompanyField(),
    createProjectDescriptionField(),
    createBudgetField(),
    createTimelineField(),
    createConsentField(),
  ];
}

export function createConsultationFormFields(): FormField[] {
  return [
    createNameField(),
    createEmailField(),
    createPhoneField(),
    {
      id: 'meeting.type',
      type: 'radio',
      label: 'Preferred Meeting Type',
      required: true,
      options: [
        { value: 'video', label: 'Video Call', description: 'Meet via Zoom or Google Meet' },
        { value: 'phone', label: 'Phone Call', description: 'Traditional phone conversation' },
        { value: 'in-person', label: 'In Person', description: 'Meet at our office' },
      ],
    },
    {
      id: 'meeting.preferredTimes',
      type: 'checkbox',
      label: 'Preferred Times',
      required: false,
      options: [
        { value: 'morning', label: 'Morning (9am - 12pm)' },
        { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
        { value: 'evening', label: 'Evening (5pm - 8pm)' },
      ],
    },
    createProjectDescriptionField(),
    createConsentField(),
  ];
}

export function createQuoteFormFields(): FormField[] {
  return [
    createNameField(),
    createEmailField(),
    createCompanyField(),
    createProjectDescriptionField(),
    createBudgetField(),
    createTimelineField(),
    {
      id: 'requirements.goals',
      type: 'checkbox',
      label: 'Project Goals',
      required: false,
      options: [
        { value: 'increase-sales', label: 'Increase sales' },
        { value: 'improve-brand', label: 'Improve brand image' },
        { value: 'reduce-costs', label: 'Reduce operational costs' },
        { value: 'expand-market', label: 'Expand to new markets' },
        { value: 'improve-efficiency', label: 'Improve efficiency' },
      ],
    },
    createConsentField(),
  ];
}