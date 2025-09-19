// src/booking/lib/adapters.ts
// Data transformation adapters: raw data → strict template/section props
// No React imports - keep this SSR/Node-safe

import { DEFAULT_BOOKING_VARIANT, FALLBACKS, QUERY_KEYS } from "./constants";
import { toCanonicalService, coerceString, coerceBool, merge } from "./utils";
import { validateInDevelopment, bookingSectionPropsSchema } from "./validators";
import { getDefaultVariantForService } from "./registry";
import type { 
  BookingHubTemplateProps, 
  BookingModalTemplateProps, 
  BookingSectionProps, 
  CalendarProviderConfig,
  IntakeFormSpec,
  Prefill,
  BookingVariant
} from "./types";
import type { CanonicalService } from "@/shared/services/types";

// Raw input types for adapters
interface RawBookingConfig {
  booking?: {
    variant?: string;
    service?: string;
    calendar?: any;
    intake?: any;
    prefill?: any;
    successHref?: string;
    cancelHref?: string;
  };
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
  analytics?: {
    context?: string;
  };
}

interface RawModalConfig {
  query?: URLSearchParams;
  data?: {
    variant?: string;
    service?: string;
    topic?: string;
    calendar?: any;
    intake?: any;
    prefill?: any;
    successHref?: string;
    cancelHref?: string;
  };
}

/**
 * Hub page adapter - transforms raw config into BookingHubTemplateProps
 */
export function adaptHubConfig(raw: RawBookingConfig): BookingHubTemplateProps {
  const service = toCanonicalService(raw?.booking?.service);
  const defaultVariant = service ? getDefaultVariantForService(service) : DEFAULT_BOOKING_VARIANT;
  const variant = (raw?.booking?.variant || defaultVariant) as BookingVariant;

  const booking: BookingSectionProps = {
    variant,
    service,
    calendar: sanitizeCalendar(raw?.booking?.calendar, service),
    intake: sanitizeIntake(raw?.booking?.intake, service),
    prefill: sanitizePrefill(raw?.booking?.prefill),
    successHref: coerceString(raw?.booking?.successHref) ?? FALLBACKS.successHref,
    cancelHref: coerceString(raw?.booking?.cancelHref) ?? FALLBACKS.cancelHref,
    analyticsContext: coerceString(raw?.analytics?.context) ?? "booking_page",
  };

  // Dev-only validation
  validateInDevelopment(bookingSectionPropsSchema, booking);

  return {
    meta: raw?.meta ? {
      title: coerceString(raw.meta.title),
      subtitle: coerceString(raw.meta.subtitle),
    } : undefined,
    features: raw?.features ? {
      showFAQ: coerceBool(raw.features.showFAQ),
      showPolicies: coerceBool(raw.features.showPolicies),
      showCTA: coerceBool(raw.features.showCTA),
    } : undefined,
    hero: raw?.hero ? {
      headline: coerceString(raw.hero.headline),
      subheadline: coerceString(raw.hero.subheadline),
      primaryCTA: raw.hero.primaryCTA ? {
        text: coerceString(raw.hero.primaryCTA.text) || "Get Started",
        href: coerceString(raw.hero.primaryCTA.href) || "/book",
      } : undefined,
    } : undefined,
    booking,
    analytics: {
      context: booking.analyticsContext,
    },
  };
}

/**
 * Modal route adapter - transforms query params + data into BookingModalTemplateProps
 */
export function adaptModalConfig(raw: RawModalConfig): BookingModalTemplateProps {
  const q = raw.query;
  const data = raw.data;
  
  // Extract service from topic query param or data
  const topic = q?.get(QUERY_KEYS.topic) ?? coerceString(data?.topic);
  const service = toCanonicalService(topic) ?? toCanonicalService(data?.service);
  
  // Determine variant
  const defaultVariant = service ? getDefaultVariantForService(service) : DEFAULT_BOOKING_VARIANT;
  const variant = (coerceString(data?.variant) || defaultVariant) as BookingVariant;

  // Build prefill from query params and data
  const prefill: Prefill = {
    name: q?.get(QUERY_KEYS.name) ?? coerceString(data?.prefill?.name),
    email: q?.get(QUERY_KEYS.email) ?? coerceString(data?.prefill?.email),
    timezone: q?.get(QUERY_KEYS.tz) ?? coerceString(data?.prefill?.timezone),
    notes: q?.get(QUERY_KEYS.notes) ?? coerceString(data?.prefill?.notes),
    ref: q?.get(QUERY_KEYS.ref) ?? coerceString(data?.prefill?.ref),
    topic: topic ?? coerceString(data?.prefill?.topic),
  };

  const booking: BookingSectionProps = {
    variant,
    service,
    calendar: sanitizeCalendar(data?.calendar, service),
    intake: sanitizeIntake(data?.intake, service),
    prefill,
    successHref: coerceString(data?.successHref) ?? FALLBACKS.successHref,
    cancelHref: coerceString(data?.cancelHref) ?? FALLBACKS.cancelHref,
    analyticsContext: "booking_modal",
  };

  // Dev-only validation
  validateInDevelopment(bookingSectionPropsSchema, booking);

  return {
    booking,
    analytics: {
      context: "booking_modal",
    },
  };
}

/**
 * Lower-level adapter for direct BookingSection usage
 */
export function toBookingSectionProps(raw: any): BookingSectionProps {
  const service = toCanonicalService(raw?.service);
  const defaultVariant = service ? getDefaultVariantForService(service) : DEFAULT_BOOKING_VARIANT;
  const variant = (coerceString(raw?.variant) || defaultVariant) as BookingVariant;

  const props: BookingSectionProps = {
    variant,
    service,
    calendar: sanitizeCalendar(raw?.calendar, service),
    intake: sanitizeIntake(raw?.intake, service),
    prefill: sanitizePrefill(raw?.prefill),
    successHref: coerceString(raw?.successHref) ?? FALLBACKS.successHref,
    cancelHref: coerceString(raw?.cancelHref) ?? FALLBACKS.cancelHref,
    analyticsContext: coerceString(raw?.analyticsContext),
  };

  // Dev-only validation
  validateInDevelopment(bookingSectionPropsSchema, props);
  
  return props;
}

/**
 * Adapter for service-specific booking data from CMS/data layer
 */
export function adaptServiceBookingData(raw: {
  service: string;
  calendar?: any;
  intake?: any;
  variant?: string;
  context?: string;
}): BookingSectionProps {
  const service = toCanonicalService(raw.service);
  if (!service) {
    throw new Error(`Invalid service: ${raw.service}`);
  }

  const defaultVariant = getDefaultVariantForService(service);
  const variant = (coerceString(raw.variant) || defaultVariant) as BookingVariant;

  return toBookingSectionProps({
    variant,
    service,
    calendar: raw.calendar,
    intake: raw.intake,
    analyticsContext: coerceString(raw.context) || "service_booking",
  });
}

/**
 * Adapter for URL search params (used by modal routes)
 */
export function adaptSearchParams(searchParams: URLSearchParams): Partial<BookingSectionProps> {
  const topic = searchParams.get(QUERY_KEYS.topic);
  const service = toCanonicalService(topic || "");

  return {
    service,
    prefill: {
      name: coerceString(searchParams.get(QUERY_KEYS.name)),
      email: coerceString(searchParams.get(QUERY_KEYS.email)),
      timezone: coerceString(searchParams.get(QUERY_KEYS.tz)),
      notes: coerceString(searchParams.get(QUERY_KEYS.notes)),
      ref: coerceString(searchParams.get(QUERY_KEYS.ref)),
      topic: coerceString(topic),
    },
  };
}

// Private sanitization functions

function sanitizeCalendar(
  c: any, 
  service?: CanonicalService
): CalendarProviderConfig | undefined {
  if (!c || typeof c !== "object") return undefined;

  // Validate provider
  const provider = ["cal", "calendly", "custom"].includes(c.provider) ? c.provider : "custom";
  
  // Ensure we have a service
  const calService = service ?? toCanonicalService(c.service);
  if (!calService) return undefined;

  const config: CalendarProviderConfig = {
    provider,
    service: calService,
    eventTypeId: coerceString(c.eventTypeId),
    organization: coerceString(c.organization),
    eventSlug: coerceString(c.eventSlug),
    fallbackHref: coerceString(c.fallbackHref),
    params: sanitizeProviderParams(c.params),
  };

  return config;
}

function sanitizeIntake(
  i: any, 
  service?: CanonicalService
): IntakeFormSpec | undefined {
  if (!i || typeof i !== "object") return undefined;

  const intakeService = service ?? toCanonicalService(i.service);
  if (!intakeService) return undefined;

  // Sanitize fields array
  const fields = Array.isArray(i.fields) ? i.fields.filter((field: any) => {
    return field && 
           typeof field === "object" && 
           coerceString(field.name) && 
           coerceString(field.label) &&
           ["text", "email", "textarea", "select", "checkbox"].includes(field.type);
  }).map((field: any) => ({
    name: coerceString(field.name)!,
    label: coerceString(field.label)!,
    type: field.type,
    required: coerceBool(field.required),
    options: Array.isArray(field.options) ? field.options.map((opt: any) => ({
      label: coerceString(opt.label) || String(opt.label),
      value: coerceString(opt.value) || String(opt.value),
    })) : undefined,
    placeholder: coerceString(field.placeholder),
    helpText: coerceString(field.helpText),
    validate: coerceString(field.validate),
  })) : [];

  // Sanitize consent configuration
  const consent = {
    privacyPolicyHref: coerceString(i.consent?.privacyPolicyHref) || FALLBACKS.privacyPolicyHref,
    termsHref: coerceString(i.consent?.termsHref),
    marketingOptIn: coerceBool(i.consent?.marketingOptIn),
  };

  return {
    service: intakeService,
    fields,
    consent,
  };
}

function sanitizePrefill(p: any): Prefill | undefined {
  if (!p || typeof p !== "object") return undefined;

  return {
    name: coerceString(p.name),
    email: coerceString(p.email),
    timezone: coerceString(p.timezone),
    notes: coerceString(p.notes),
    ref: coerceString(p.ref),
    topic: coerceString(p.topic),
  };
}

function sanitizeProviderParams(
  params: any
): Record<string, string | number | boolean> | undefined {
  if (!params || typeof params !== "object") return undefined;

  const sanitized: Record<string, string | number | boolean> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    } else if (value != null) {
      // Try to coerce other types
      const stringValue = coerceString(value);
      const boolValue = coerceBool(value);
      
      if (stringValue !== undefined) {
        sanitized[key] = stringValue;
      } else if (boolValue !== undefined) {
        sanitized[key] = boolValue;
      }
    }
  });

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

/**
 * Utility to merge booking section props (for overrides)
 */
export function mergeBookingSectionProps(
  base: BookingSectionProps,
  overrides: Partial<BookingSectionProps>
): BookingSectionProps {
  const merged = merge(base, overrides);
  
  // Merge nested objects properly
  if (base.prefill && overrides.prefill) {
    merged.prefill = merge(base.prefill, overrides.prefill);
  }
  
  if (base.calendar && overrides.calendar) {
    merged.calendar = merge(base.calendar, overrides.calendar);
  }

  if (base.intake && overrides.intake) {
    merged.intake = merge(base.intake, overrides.intake);
  }

  // Dev-only validation
  validateInDevelopment(bookingSectionPropsSchema, merged);
  
  return merged;
}

/**
 * Create analytics-ready context from booking props
 */
export function createAnalyticsContextFromProps(
  props: BookingSectionProps,
  additional?: Record<string, any>
): Record<string, any> {
  return {
    service: props.service,
    variant: props.variant,
    context: props.analyticsContext,
    has_calendar: !!props.calendar,
    has_intake: !!props.intake,
    has_prefill: !!props.prefill,
    provider: props.calendar?.provider,
    ...additional,
  };
}

/**
 * Batch adapter for multiple booking configurations
 */
export function adaptMultipleBookingConfigs(
  configs: Array<{ id: string; config: RawBookingConfig }>
): Record<string, BookingHubTemplateProps> {
  const adapted: Record<string, BookingHubTemplateProps> = {};
  
  configs.forEach(({ id, config }) => {
    try {
      adapted[id] = adaptHubConfig(config);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Failed to adapt booking config for ${id}:`, error);
      }
      // Skip invalid configs in production
    }
  });
  
  return adapted;
}

/**
 * Validation helper for raw booking data
 */
export function validateRawBookingData(raw: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check basic structure
  if (!raw || typeof raw !== "object") {
    errors.push("Raw booking data must be an object");
    return { isValid: false, errors, warnings };
  }

  // Validate service if provided
  if (raw.booking?.service) {
    const service = toCanonicalService(raw.booking.service);
    if (!service) {
      errors.push(`Invalid service: ${raw.booking.service}`);
    }
  }

  // Validate calendar config if provided
  if (raw.booking?.calendar) {
    const cal = raw.booking.calendar;
    if (!["cal", "calendly", "custom"].includes(cal.provider)) {
      warnings.push(`Unknown calendar provider: ${cal.provider}, defaulting to 'custom'`);
    }
    
    if (cal.provider === "cal" && !cal.eventTypeId) {
      warnings.push("Cal.com provider missing eventTypeId");
    }
    
    if (cal.provider === "calendly" && (!cal.organization || !cal.eventSlug)) {
      warnings.push("Calendly provider missing organization or eventSlug");
    }
  }

  // Validate intake form if provided
  if (raw.booking?.intake) {
    const intake = raw.booking.intake;
    if (!Array.isArray(intake.fields) || intake.fields.length === 0) {
      warnings.push("Intake form has no fields defined");
    }
    
    if (!intake.consent?.privacyPolicyHref) {
      warnings.push("Intake form missing privacy policy URL");
    }
  }

  // Validate URLs
  const urlFields = [
    'booking.successHref',
    'booking.cancelHref', 
    'booking.calendar.fallbackHref',
    'booking.intake.consent.privacyPolicyHref',
    'booking.intake.consent.termsHref',
    'hero.primaryCTA.href'
  ];
  
  urlFields.forEach(field => {
    const value = getNestedValue(raw, field);
    if (value && typeof value === 'string' && !isValidUrl(value)) {
      warnings.push(`Invalid URL format for ${field}: ${value}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Helper functions

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url, 'https://example.com'); // Allow relative URLs
    return true;
  } catch {
    return false;
  }
}

/**
 * Default booking configuration generator
 */
export function createDefaultBookingConfig(service: CanonicalService): RawBookingConfig {
  return {
    booking: {
      service,
      variant: getDefaultVariantForService(service),
      successHref: FALLBACKS.successHref,
      cancelHref: FALLBACKS.cancelHref,
    },
    meta: {
      title: `Book ${service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      subtitle: "Schedule a consultation with our team",
    },
    features: {
      showFAQ: true,
      showPolicies: true,
      showCTA: true,
    },
    hero: {
      headline: "Ready to get started?",
      subheadline: "Book a consultation and let's discuss your project needs.",
      primaryCTA: {
        text: "Schedule Now",
        href: "/book",
      },
    },
    analytics: {
      context: "booking_page",
    },
  };
}