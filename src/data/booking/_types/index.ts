// src/data/booking/_types
// src/data/booking/_types/index.ts
// Core booking system types and interfaces
// Provides type safety for all booking operations

import { z } from 'zod';

// ============================================================================
// Core Service Types
// ============================================================================

export type CanonicalService =
  | 'web-development-services'
  | 'video-production-services'
  | 'seo-services'
  | 'marketing-services'
  | 'lead-generation-services'
  | 'content-production-services';

export type BookingProvider = 'cal' | 'calendly' | 'acuity' | 'custom';

export type MeetingType = 'consultation' | 'discovery' | 'strategy' | 'review' | 'support';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'rescheduled' | 'completed';

// ============================================================================
// Provider Configuration Types
// ============================================================================

export interface BaseProviderConfig {
  provider: BookingProvider;
  service: CanonicalService;
  enabled: boolean;
  priority: number;
  fallbackHref?: string;
}

export interface CalComConfig extends BaseProviderConfig {
  provider: 'cal';
  namespace: string;
  eventTypeId: string;
  theme?: 'light' | 'dark' | 'auto';
  embedType?: 'inline' | 'floating-popup' | 'element-click';
}

export interface CalendlyConfig extends BaseProviderConfig {
  provider: 'calendly';
  username: string;
  eventSlug: string;
  hideEventTypeDetails?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export interface AcuityConfig extends BaseProviderConfig {
  provider: 'acuity';
  ownerId: string;
  appointmentTypeId: string;
  certificateId?: string;
  width?: string;
  height?: string;
}

export type ProviderConfig = CalComConfig | CalendlyConfig | AcuityConfig;

// ============================================================================
// Intake Form Types
// ============================================================================

export interface IntakeFieldOption {
  label: string;
  value: string;
  description?: string;
}

export type IntakeFieldType = 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'phone';

export interface IntakeField {
  name: string;
  label: string;
  type: IntakeFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: IntakeFieldOption[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: string;
  };
  conditional?: {
    dependsOn: string;
    value: string | string[];
  };
}

export interface IntakeFormSpec {
  service: CanonicalService;
  title: string;
  description: string;
  fields: IntakeField[];
  consent: {
    privacyPolicyHref: string;
    termsHref?: string;
    marketingOptIn?: boolean;
    dataProcessingAgreement: boolean;
  };
  submitText: string;
  successMessage: string;
}

// ============================================================================
// Booking Result Types
// ============================================================================

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  timezone: string;
  notes?: string;
  referralSource?: string;
}

export interface MeetingLocation {
  type: 'video' | 'phone' | 'in-person' | 'hybrid';
  details: {
    platform?: string;
    url?: string;
    phone?: string;
    address?: string;
    instructions?: string;
  };
}

export interface BookingPricing {
  amount: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: string;
  invoiceUrl?: string;
}

export interface BookingResult {
  id: string;
  referenceNumber: string;
  service: CanonicalService;
  provider: BookingProvider;
  meetingType: MeetingType;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  timezone: string;
  location: MeetingLocation;
  customer: CustomerInfo;
  status: BookingStatus;
  pricing?: BookingPricing;
  metadata: {
    source: 'modal' | 'page' | 'direct';
    campaign?: string;
    utm?: Record<string, string>;
    sessionId: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Booking Error Types
// ============================================================================

export interface BookingError {
  code: string;
  message: string;
  provider?: BookingProvider;
  service?: CanonicalService;
  details?: Record<string, unknown>;
  timestamp: string;
}

export type BookingErrorCode =
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_TIME_SLOT'
  | 'CUSTOMER_INFO_INVALID'
  | 'PAYMENT_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SERVICE_UNAVAILABLE'
  | 'VALIDATION_ERROR';

// ============================================================================
// Analytics Types
// ============================================================================

export interface BookingAnalyticsEvent {
  event: string;
  service: CanonicalService;
  provider: BookingProvider;
  timestamp: string;
  metadata: {
    sessionId: string;
    userId?: string;
    source: 'modal' | 'page' | 'direct';
    step?: string;
    duration?: number;
    error?: BookingError;
  };
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface BookingModalOptions {
  service?: CanonicalService;
  prefill?: Partial<CustomerInfo>;
  theme?: 'light' | 'dark';
  variant?: 'modal' | 'inline' | 'sidebar';
  onSuccess?: (result: BookingResult) => void;
  onError?: (error: BookingError) => void;
  onClose?: () => void;
}

export interface BookingHubConfig {
  title: string;
  description: string;
  services: CanonicalService[];
  defaultService?: CanonicalService;
  showServiceCards: boolean;
  showTestimonials: boolean;
  showFAQ: boolean;
  analyticsEnabled: boolean;
}

// ============================================================================
// Search and Filter Types
// ============================================================================

export interface BookingSearchParams {
  service?: CanonicalService;
  provider?: BookingProvider;
  meetingType?: MeetingType;
  duration?: number;
  timezone?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface BookingSearchResult {
  bookings: BookingResult[];
  total: number;
  filters: {
    services: CanonicalService[];
    providers: BookingProvider[];
    meetingTypes: MeetingType[];
    dateRange: {
      earliest: string;
      latest: string;
    };
  };
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details: Record<string, string[]>;
  };
}

export interface BookingHealthCheck {
  provider: BookingProvider;
  service: CanonicalService;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: string;
  error?: string;
}

// ============================================================================
// Export Schema Types
// ============================================================================

export type BookingConfigSchema = z.ZodSchema<ProviderConfig>;
export type IntakeFormSchema = z.ZodSchema<IntakeFormSpec>;
export type BookingResultSchema = z.ZodSchema<BookingResult>;
export type CustomerInfoSchema = z.ZodSchema<CustomerInfo>;