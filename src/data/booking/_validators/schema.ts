// src/data/booking/_validators/schema.ts
// Zod schemas for booking system validation
// Centralized schema definitions with strict typing

import { z } from 'zod';

// ============================================================================
// Base Schemas
// ============================================================================

export const canonicalServiceSchema = z.enum([
  'web-development-services',
  'video-production-services',
  'seo-services',
  'marketing-services',
  'lead-generation-services',
  'content-production-services'
], {
  errorMap: () => ({ message: 'Invalid service type' }),
});

export const bookingProviderSchema = z.enum(['cal', 'calendly', 'acuity', 'custom'], {
  errorMap: () => ({ message: 'Invalid booking provider' }),
});

export const meetingTypeSchema = z.enum([
  'consultation',
  'discovery', 
  'strategy',
  'review',
  'support'
], {
  errorMap: () => ({ message: 'Invalid meeting type' }),
});

export const bookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'cancelled',
  'rescheduled',
  'completed'
], {
  errorMap: () => ({ message: 'Invalid booking status' }),
});

// ============================================================================
// Utility Schemas
// ============================================================================

export const emailSchema = z.string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(254, 'Email too long')
  .toLowerCase()
  .transform(email => email.trim());

export const phoneSchema = z.string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
  .optional();

export const urlSchema = z.string()
  .url('Invalid URL format')
  .max(2048, 'URL too long');

export const timezoneSchema = z.string()
  .min(1, 'Timezone is required')
  .refine(
    tz => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Invalid timezone' }
  );

export const datetimeSchema = z.string()
  .refine(date => !isNaN(Date.parse(date)), 'Invalid date format')
  .transform(date => new Date(date).toISOString());

export const currencySchema = z.string()
  .length(3, 'Currency must be 3 characters')
  .toUpperCase()
  .refine(
    currency => ['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(currency),
    { message: 'Unsupported currency' }
  );

// ============================================================================
// Customer Schema
// ============================================================================

export const customerInfoSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters')
    .transform(name => name.trim()),
  
  email: emailSchema,
  
  phone: phoneSchema,
  
  company: z.string()
    .max(100, 'Company name too long')
    .transform(company => company?.trim())
    .optional(),
  
  role: z.string()
    .max(50, 'Role too long')
    .transform(role => role?.trim())
    .optional(),
  
  timezone: timezoneSchema,
  
  notes: z.string()
    .max(1000, 'Notes too long')
    .transform(notes => notes?.trim())
    .optional(),
  
  referralSource: z.string()
    .max(50, 'Referral source too long')
    .transform(source => source?.trim())
    .optional(),
});

// ============================================================================
// Location Schema
// ============================================================================

export const meetingLocationSchema = z.object({
  type: z.enum(['video', 'phone', 'in-person', 'hybrid']),
  details: z.record(z.any()),
});

// ============================================================================
// Pricing Schema
// ============================================================================

export const bookingPricingSchema = z.object({
  amount: z.number()
    .nonnegative('Amount cannot be negative')
    .max(100000, 'Amount too large'),
  
  currency: currencySchema,
  
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']),
  
  paymentMethod: z.string()
    .max(50, 'Payment method name too long')
    .optional(),
  
  invoiceUrl: urlSchema.optional(),
});

// ============================================================================
// Metadata Schema
// ============================================================================

export const bookingMetadataSchema = z.object({
  source: z.enum(['modal', 'page', 'direct']),
  
  campaign: z.string()
    .max(100, 'Campaign name too long')
    .optional(),
  
  utm: z.record(z.string().max(100))
    .optional(),
  
  sessionId: z.string()
    .min(1, 'Session ID is required')
    .max(100, 'Session ID too long'),
});

// ============================================================================
// Main Booking Schema
// ============================================================================

export const bookingResultSchema = z.object({
  id: z.string()
    .min(1, 'Booking ID is required')
    .max(50, 'Booking ID too long'),
  
  referenceNumber: z.string()
    .min(1, 'Reference number is required')
    .max(50, 'Reference number too long'),
  
  service: canonicalServiceSchema,
  provider: bookingProviderSchema,
  meetingType: meetingTypeSchema,
  
  startTime: datetimeSchema,
  endTime: datetimeSchema,
  
  duration: z.number()
    .positive('Duration must be positive')
    .min(15, 'Minimum duration is 15 minutes')
    .max(480, 'Maximum duration is 8 hours'),
  
  timezone: timezoneSchema,
  location: meetingLocationSchema,
  customer: customerInfoSchema,
  status: bookingStatusSchema,
  pricing: bookingPricingSchema.optional(),
  metadata: bookingMetadataSchema,
  
  createdAt: datetimeSchema,
  updatedAt: datetimeSchema,
})
.refine(
  data => new Date(data.endTime) > new Date(data.startTime),
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
)
.refine(
  data => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const actualDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    return Math.abs(actualDuration - data.duration) <= 5; // 5-minute tolerance
  },
  {
    message: 'Duration does not match start/end times',
    path: ['duration'],
  }
);

// ============================================================================
// Provider Configuration Schemas
// ============================================================================

export const baseProviderConfigSchema = z.object({
  service: canonicalServiceSchema,
  enabled: z.boolean(),
  priority: z.number().min(1).max(10),
  fallbackHref: urlSchema.optional(),
});

export const calComConfigSchema = baseProviderConfigSchema.extend({
  provider: z.literal('cal'),
  namespace: z.string().min(1, 'Namespace is required'),
  eventTypeId: z.string().min(1, 'Event type ID is required'),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  embedType: z.enum(['inline', 'floating-popup', 'element-click']).optional(),
});

export const calendlyConfigSchema = baseProviderConfigSchema.extend({
  provider: z.literal('calendly'),
  username: z.string().min(1, 'Username is required'),
  eventSlug: z.string().min(1, 'Event slug is required'),
  hideEventTypeDetails: z.boolean().optional(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
  textColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
});

export const acuityConfigSchema = baseProviderConfigSchema.extend({
  provider: z.literal('acuity'),
  ownerId: z.string().min(1, 'Owner ID is required'),
  appointmentTypeId: z.string().min(1, 'Appointment type ID is required'),
  certificateId: z.string().optional(),
  width: z.string().regex(/^\d+(px|%|rem|em)$/, 'Invalid width format').optional(),
  height: z.string().regex(/^\d+(px|%|rem|em)$/, 'Invalid height format').optional(),
});

export const providerConfigSchema = z.discriminatedUnion('provider', [
  calComConfigSchema,
  calendlyConfigSchema,
  acuityConfigSchema,
]);

// ============================================================================
// Intake Form Schemas
// ============================================================================

export const intakeFieldOptionSchema = z.object({
  label: z.string().min(1, 'Option label is required'),
  value: z.string().min(1, 'Option value is required'),
  description: z.string().max(200, 'Description too long').optional(),
});

export const intakeFieldValidationSchema = z.object({
  minLength: z.number().min(0).optional(),
  maxLength: z.number().min(1).optional(),
  pattern: z.string().max(200).optional(),
  custom: z.string().max(500).optional(),
}).refine(
  data => !data.minLength || !data.maxLength || data.minLength <= data.maxLength,
  {
    message: 'Min length cannot be greater than max length',
    path: ['maxLength'],
  }
);

export const intakeFieldConditionalSchema = z.object({
  dependsOn: z.string().min(1, 'Dependency field name is required'),
  value: z.union([z.string(), z.array(z.string())]),
});

export const intakeFieldSchema = z.object({
  name: z.string()
    .min(1, 'Field name is required')
    .max(50, 'Field name too long')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Invalid field name format'),
  
  label: z.string()
    .min(1, 'Field label is required')
    .max(100, 'Field label too long'),
  
  type: z.enum(['text', 'email', 'textarea', 'select', 'checkbox', 'radio', 'phone']),
  
  required: z.boolean().optional().default(false),
  
  placeholder: z.string()
    .max(100, 'Placeholder too long')
    .optional(),
  
  helpText: z.string()
    .max(200, 'Help text too long')
    .optional(),
  
  options: z.array(intakeFieldOptionSchema)
    .min(1, 'At least one option is required for select/radio fields')
    .optional(),
  
  validation: intakeFieldValidationSchema.optional(),
  conditional: intakeFieldConditionalSchema.optional(),
})
.refine(
  data => {
    if (['select', 'radio'].includes(data.type)) {
      return data.options && data.options.length > 0;
    }
    return true;
  },
  {
    message: 'Select and radio fields must have options',
    path: ['options'],
  }
);

export const intakeFormConsentSchema = z.object({
  privacyPolicyHref: urlSchema,
  termsHref: urlSchema.optional(),
  marketingOptIn: z.boolean().optional().default(false),
  dataProcessingAgreement: z.boolean().default(true),
});

export const intakeFormSpecSchema = z.object({
  service: canonicalServiceSchema,
  
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long'),
  
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description too long'),
  
  fields: z.array(intakeFieldSchema)
    .min(1, 'At least one field is required')
    .max(20, 'Too many fields'),
  
  consent: intakeFormConsentSchema,
  
  submitText: z.string()
    .min(1, 'Submit text is required')
    .max(50, 'Submit text too long'),
  
  successMessage: z.string()
    .min(1, 'Success message is required')
    .max(500, 'Success message too long'),
})
.refine(
  data => {
    // Ensure field names are unique
    const fieldNames = data.fields.map(field => field.name);
    const uniqueNames = new Set(fieldNames);
    return fieldNames.length === uniqueNames.size;
  },
  {
    message: 'Field names must be unique',
    path: ['fields'],
  }
);

// ============================================================================
// Search and Analytics Schemas
// ============================================================================

export const bookingSearchParamsSchema = z.object({
  service: canonicalServiceSchema.optional(),
  provider: bookingProviderSchema.optional(),
  meetingType: meetingTypeSchema.optional(),
  duration: z.number().positive().optional(),
  timezone: timezoneSchema.optional(),
  dateRange: z.object({
    start: datetimeSchema,
    end: datetimeSchema,
  }).optional(),
  query: z.string().max(200).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const bookingAnalyticsEventSchema = z.object({
  event: z.string().min(1).max(100),
  service: canonicalServiceSchema,
  provider: bookingProviderSchema,
  timestamp: datetimeSchema,
  metadata: z.object({
    sessionId: z.string().min(1),
    userId: z.string().optional(),
    source: z.enum(['modal', 'page', 'direct']),
    step: z.string().max(50).optional(),
    duration: z.number().nonnegative().optional(),
    error: z.record(z.any()).optional(),
  }),
});

// ============================================================================
// Health Check Schema
// ============================================================================

export const bookingHealthCheckSchema = z.object({
  provider: bookingProviderSchema,
  service: canonicalServiceSchema,
  status: z.enum(['healthy', 'degraded', 'down']),
  responseTime: z.number().nonnegative(),
  lastCheck: datetimeSchema,
  error: z.string().optional(),
});

// ============================================================================
// Export All Schemas
// ============================================================================

export const schemas = {
  // Base schemas
  canonicalService: canonicalServiceSchema,
  bookingProvider: bookingProviderSchema,
  meetingType: meetingTypeSchema,
  bookingStatus: bookingStatusSchema,
  
  // Utility schemas
  email: emailSchema,
  phone: phoneSchema,
  url: urlSchema,
  timezone: timezoneSchema,
  datetime: datetimeSchema,
  currency: currencySchema,
  
  // Core schemas
  customerInfo: customerInfoSchema,
  meetingLocation: meetingLocationSchema,
  bookingPricing: bookingPricingSchema,
  bookingMetadata: bookingMetadataSchema,
  bookingResult: bookingResultSchema,
  
  // Provider schemas
  baseProviderConfig: baseProviderConfigSchema,
  calComConfig: calComConfigSchema,
  calendlyConfig: calendlyConfigSchema,
  acuityConfig: acuityConfigSchema,
  providerConfig: providerConfigSchema,
  
  // Intake form schemas
  intakeFieldOption: intakeFieldOptionSchema,
  intakeFieldValidation: intakeFieldValidationSchema,
  intakeFieldConditional: intakeFieldConditionalSchema,
  intakeField: intakeFieldSchema,
  intakeFormConsent: intakeFormConsentSchema,
  intakeFormSpec: intakeFormSpecSchema,
  
  // Search and analytics
  bookingSearchParams: bookingSearchParamsSchema,
  bookingAnalyticsEvent: bookingAnalyticsEventSchema,
  
  // Health check
  bookingHealthCheck: bookingHealthCheckSchema,
};