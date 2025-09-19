// src/booking/lib/types.ts
// Core booking types shared across templates and sections
// No React imports - keep this SSR/Node-safe

import type { CanonicalService } from "@/shared/services/types";

// Booking variant selection in BookingSection
export type BookingVariant = "embed" | "form" | "calendar";

// Provider identifiers and config
export type BookingProvider = "cal" | "calendly" | "custom";

// Calendar provider configuration per service
export interface CalendarProviderConfig {
  provider: BookingProvider;
  /** Canonical service slug this config belongs to */
  service: CanonicalService;
  /** Provider-specific identifiers */
  eventTypeId?: string;        // cal.com event type
  organization?: string;       // calendly org
  eventSlug?: string;          // calendly event slug
  /** Optional fallback URL (provider-hosted booking page) */
  fallbackHref?: string;
  /** Additional provider params (prefill, locale, etc.) */
  params?: Record<string, string | number | boolean | undefined>;
}

// Intake form field definition
export interface IntakeField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  helpText?: string;
  /** RegExp string or simple keyword like 'email' for built-in validation */
  validate?: string;
}

// Complete intake form specification
export interface IntakeFormSpec {
  service: CanonicalService;
  fields: IntakeField[];
  consent: {
    privacyPolicyHref: string;
    termsHref?: string;
    marketingOptIn?: boolean; // show marketing checkbox
  };
}

// Pre-fill data for forms/embeds
export interface Prefill {
  name?: string;
  email?: string;
  timezone?: string;
  notes?: string;
  ref?: string; // source path or campaign ref
  // Allow service to be preselected via query (?topic=…)
  topic?: string;
}

// Core section props for BookingSection orchestrator
export interface BookingSectionProps {
  variant: BookingVariant;
  service?: CanonicalService;
  calendar?: CalendarProviderConfig;
  intake?: IntakeFormSpec;
  /** Pre-populate form/embed when possible */
  prefill?: Prefill;
  /** Navigation URLs */
  successHref?: string;
  cancelHref?: string;
  /** Analytics */
  analyticsContext?: string; // e.g., 'booking_modal' | 'booking_page'
}

// Template props for full booking hub page
export interface BookingHubTemplateProps {
  meta?: {
    title?: string;
    subtitle?: string;
  };
  features?: {
    showFAQ?: boolean;
    showPolicies?: boolean;
    showCTA?: boolean;
  };
  hero?: {
    headline?: string;
    subheadline?: string;
    primaryCTA?: { text: string; href: string };
  };
  booking: BookingSectionProps;
  analytics?: {
    context?: string;
  };
}

// Template props for modal overlay
export interface BookingModalTemplateProps {
  booking: BookingSectionProps;
  analytics?: {
    context?: string;
  };
}

// Analytics context for tracking
export interface AnalyticsContext {
  context?: string;
  service?: CanonicalService;
  variant?: BookingVariant;
  source?: string;
  [key: string]: any;
}

// Booking result/success data
export interface BookingResult {
  provider: BookingProvider;
  service: CanonicalService;
  eventId?: string;
  scheduledAt?: string;
  timezone?: string;
  attendeeEmail?: string;
}

// Booking error data
export interface BookingError {
  code: string;
  message: string;
  provider?: BookingProvider;
  service?: CanonicalService;
  context?: string;
}