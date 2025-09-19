// src/data/booking/_utils/validation.ts
// src/data/booking/_utils/validation.ts
// Booking validation utilities
// Comprehensive validation for booking data integrity

import { z } from 'zod';
import type {
  BookingResult,
  CustomerInfo,
  IntakeFormSpec,
  ProviderConfig,
  ValidationResult,
  BookingHealthCheck,
} from '../_types';

// ============================================================================
// Validation Schemas
// ============================================================================

const emailSchema = z.string().email('Invalid email format');
const phoneSchema = z.string().regex(
  /^[\+]?[1-9][\d]{0,15}$/,
  'Invalid phone number format'
);
const timezoneSchema = z.string().min(1, 'Timezone is required');
const urlSchema = z.string().url('Invalid URL format');

export const customerInfoSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  company: z.string().max(100, 'Company name too long').optional(),
  role: z.string().max(50, 'Role too long').optional(),
  timezone: timezoneSchema,
  notes: z.string().max(1000, 'Notes too long').optional(),
  referralSource: z.string().max(50, 'Referral source too long').optional(),
});

export const bookingResultSchema = z.object({
  id: z.string().min(1, 'Booking ID is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  service: z.enum([
    'web-development-services',
    'video-production-services',
    'seo-services',
    'marketing-services',
    'lead-generation-services',
    'content-production-services'
  ]),
  provider: z.enum(['cal', 'calendly', 'acuity', 'custom']),
  meetingType: z.enum(['consultation', 'discovery', 'strategy', 'review', 'support']),
  startTime: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid start time'),
  endTime: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid end time'),
  duration: z.number().positive('Duration must be positive'),
  timezone: timezoneSchema,
  location: z.object({
    type: z.enum(['video', 'phone', 'in-person', 'hybrid']),
    details: z.record(z.any()),
  }),
  customer: customerInfoSchema,
  status: z.enum(['pending', 'confirmed', 'cancelled', 'rescheduled', 'completed']),
  pricing: z.object({
    amount: z.number().nonnegative(),
    currency: z.string().length(3),
    paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']),
    paymentMethod: z.string().optional(),
    invoiceUrl: urlSchema.optional(),
  }).optional(),
  metadata: z.object({
    source: z.enum(['modal', 'page', 'direct']),
    campaign: z.string().optional(),
    utm: z.record(z.string()).optional(),
    sessionId: z.string().min(1),
  }),
  createdAt: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid creation date'),
  updatedAt: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid update date'),
});

// ============================================================================
// Validation Functions
// ============================================================================

export function validateCustomerInfo(data: unknown): ValidationResult<CustomerInfo> {
  try {
    const validated = customerInfoSchema.parse(data);
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: 'Customer information validation failed',
          details: formatZodErrors(error),
        },
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Unknown validation error',
        details: {},
      },
    };
  }
}

export function validateBookingResult(data: unknown): ValidationResult<BookingResult> {
  try {
    const validated = bookingResultSchema.parse(data);
    
    // Additional business logic validation
    const businessValidation = validateBookingBusinessRules(validated);
    if (!businessValidation.success) {
      return businessValidation;
    }
    
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: 'Booking validation failed',
          details: formatZodErrors(error),
        },
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Unknown validation error',
        details: {},
      },
    };
  }
}

export function validateIntakeForm(data: unknown): ValidationResult<IntakeFormSpec> {
  const intakeFormSchema = z.object({
    service: z.enum([
      'web-development-services',
      'video-production-services',
      'seo-services',
      'marketing-services',
      'lead-generation-services',
      'content-production-services'
    ]),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    fields: z.array(z.object({
      name: z.string().min(1),
      label: z.string().min(1),
      type: z.enum(['text', 'email', 'textarea', 'select', 'checkbox', 'radio', 'phone']),
      required: z.boolean().optional(),
      placeholder: z.string().optional(),
      helpText: z.string().optional(),
      options: z.array(z.object({
        label: z.string().min(1),
        value: z.string().min(1),
        description: z.string().optional(),
      })).optional(),
      validation: z.object({
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        pattern: z.string().optional(),
        custom: z.string().optional(),
      }).optional(),
      conditional: z.object({
        dependsOn: z.string().min(1),
        value: z.union([z.string(), z.array(z.string())]),
      }).optional(),
    })).min(1),
    consent: z.object({
      privacyPolicyHref: urlSchema,
      termsHref: urlSchema.optional(),
      marketingOptIn: z.boolean().optional(),
      dataProcessingAgreement: z.boolean(),
    }),
    submitText: z.string().min(1),
    successMessage: z.string().min(1),
  });

  try {
    const validated = intakeFormSchema.parse(data);
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: 'Intake form validation failed',
          details: formatZodErrors(error),
        },
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Unknown validation error',
        details: {},
      },
    };
  }
}

// ============================================================================
// Business Rules Validation
// ============================================================================

function validateBookingBusinessRules(booking: BookingResult): ValidationResult<BookingResult> {
  const errors: Record<string, string[]> = {};
  
  // Validate time logic
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  
  if (endTime <= startTime) {
    errors.endTime = ['End time must be after start time'];
  }
  
  const actualDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  if (Math.abs(actualDuration - booking.duration) > 5) { // Allow 5 minute tolerance
    errors.duration = ['Duration does not match start/end times'];
  }
  
  // Validate future booking
  if (startTime < new Date()) {
    errors.startTime = ['Booking cannot be in the past'];
  }
  
  // Validate reasonable duration (15 minutes to 8 hours)
  if (booking.duration < 15 || booking.duration > 480) {
    errors.duration = ['Duration must be between 15 minutes and 8 hours'];
  }
  
  // Validate email format more strictly for business context
  const emailDomain = booking.customer.email.split('@')[1];
  if (emailDomain && isDisposableEmailDomain(emailDomain)) {
    errors['customer.email'] = ['Please use a business email address'];
  }
  
  // Validate pricing if present
  if (booking.pricing) {
    if (booking.pricing.amount < 0) {
      errors['pricing.amount'] = ['Amount cannot be negative'];
    }
    
    if (!isValidCurrency(booking.pricing.currency)) {
      errors['pricing.currency'] = ['Invalid currency code'];
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      error: {
        message: 'Business rule validation failed',
        details: errors,
      },
    };
  }
  
  return {
    success: true,
    data: booking,
  };
}

// ============================================================================
// Provider Configuration Validation
// ============================================================================

export function validateProviderConfig(data: unknown): ValidationResult<ProviderConfig> {
  const baseConfigSchema = z.object({
    provider: z.enum(['cal', 'calendly', 'acuity', 'custom']),
    service: z.enum([
      'web-development-services',
      'video-production-services',
      'seo-services',
      'marketing-services',
      'lead-generation-services',
      'content-production-services'
    ]),
    enabled: z.boolean(),
    priority: z.number().min(1).max(10),
    fallbackHref: urlSchema.optional(),
  });

  const calConfigSchema = baseConfigSchema.extend({
    provider: z.literal('cal'),
    namespace: z.string().min(1),
    eventTypeId: z.string().min(1),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    embedType: z.enum(['inline', 'floating-popup', 'element-click']).optional(),
  });

  const calendlyConfigSchema = baseConfigSchema.extend({
    provider: z.literal('calendly'),
    username: z.string().min(1),
    eventSlug: z.string().min(1),
    hideEventTypeDetails: z.boolean().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
  });

  const acuityConfigSchema = baseConfigSchema.extend({
    provider: z.literal('acuity'),
    ownerId: z.string().min(1),
    appointmentTypeId: z.string().min(1),
    certificateId: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
  });

  const providerConfigSchema = z.discriminatedUnion('provider', [
    calConfigSchema,
    calendlyConfigSchema,
    acuityConfigSchema,
  ]);

  try {
    const validated = providerConfigSchema.parse(data);
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: 'Provider configuration validation failed',
          details: formatZodErrors(error),
        },
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Unknown validation error',
        details: {},
      },
    };
  }
}

// ============================================================================
// Health Check Functions
// ============================================================================

export async function validateBookingHealth(
  provider: string,
  service: string,
  config: ProviderConfig
): Promise<BookingHealthCheck> {
  const startTime = Date.now();
  
  try {
    // Simulate health check based on provider
    await performProviderHealthCheck(config);
    
    const responseTime = Date.now() - startTime;
    
    return {
      provider: config.provider,
      service: config.service,
      status: responseTime < 2000 ? 'healthy' : 'degraded',
      responseTime,
      lastCheck: new Date().toISOString(),
    };
  } catch (error) {
    return {
      provider: config.provider,
      service: config.service,
      status: 'down',
      responseTime: Date.now() - startTime,
      lastCheck: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function performProviderHealthCheck(config: ProviderConfig): Promise<void> {
  switch (config.provider) {
    case 'cal':
      // Check Cal.com API availability
      if (!config.namespace || !config.eventTypeId) {
        throw new Error('Invalid Cal.com configuration');
      }
      break;
    
    case 'calendly':
      // Check Calendly API availability
      if (!config.username || !config.eventSlug) {
        throw new Error('Invalid Calendly configuration');
      }
      break;
    
    case 'acuity':
      // Check Acuity API availability
      if (!config.ownerId || !config.appointmentTypeId) {
        throw new Error('Invalid Acuity configuration');
      }
      break;
    
    default:
      throw new Error('Unknown provider');
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
}

// ============================================================================
// Sanitization Functions
// ============================================================================

export function sanitizeCustomerInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/[<>]/g, '') // Remove HTML brackets
    .substring(0, 1000); // Limit length
}

export function sanitizeNotes(notes: string): string {
  return notes
    .trim()
    .replace(/[<>]/g, '') // Remove HTML
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .substring(0, 1000); // Limit length
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }
  
  return errors;
}

function isDisposableEmailDomain(domain: string): boolean {
  const disposableDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'throwaway.email',
  ];
  
  return disposableDomains.includes(domain.toLowerCase());
}

function isValidCurrency(currency: string): boolean {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
  return validCurrencies.includes(currency.toUpperCase());
}

// ============================================================================
// Validation Helpers for Forms
// ============================================================================

export function validateFormField(
  fieldName: string,
  value: unknown,
  fieldConfig: IntakeFormSpec['fields'][0]
): ValidationResult<unknown> {
  try {
    let schema: z.ZodSchema;
    
    switch (fieldConfig.type) {
      case 'email':
        schema = emailSchema;
        break;
      case 'phone':
        schema = phoneSchema;
        break;
      case 'text':
      case 'textarea':
        schema = z.string().min(
          fieldConfig.required ? 1 : 0,
          `${fieldConfig.label} is required`
        );
        if (fieldConfig.validation?.maxLength) {
          schema = schema.max(fieldConfig.validation.maxLength);
        }
        if (fieldConfig.validation?.minLength) {
          schema = schema.min(fieldConfig.validation.minLength);
        }
        if (fieldConfig.validation?.pattern) {
          schema = schema.regex(new RegExp(fieldConfig.validation.pattern));
        }
        break;
      case 'select':
      case 'radio':
        const validOptions = fieldConfig.options?.map(opt => opt.value) || [];
        schema = z.enum(validOptions as [string, ...string[]]);
        break;
      case 'checkbox':
        schema = z.boolean();
        break;
      default:
        schema = z.unknown();
    }
    
    if (!fieldConfig.required) {
      schema = schema.optional();
    }
    
    const validated = schema.parse(value);
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: `Validation failed for ${fieldConfig.label}`,
          details: formatZodErrors(error),
        },
      };
    }
    
    return {
      success: false,
      error: {
        message: 'Unknown validation error',
        details: {},
      },
    };
  }
}

// ============================================================================
// Batch Validation
// ============================================================================

export function validateBookingBatch(bookings: unknown[]): ValidationResult<BookingResult[]> {
  const results: BookingResult[] = [];
  const errors: Record<string, string[]> = {};
  
  for (let i = 0; i < bookings.length; i++) {
    const validation = validateBookingResult(bookings[i]);
    
    if (validation.success && validation.data) {
      results.push(validation.data);
    } else if (validation.error) {
      errors[`booking_${i}`] = [validation.error.message];
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      error: {
        message: 'Batch validation failed',
        details: errors,
      },
    };
  }
  
  return {
    success: true,
    data: results,
  };
}