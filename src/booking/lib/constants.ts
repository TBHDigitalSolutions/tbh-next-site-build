// src/booking/lib/constants.ts
// Domain constants: defaults, query keys, error codes, analytics events

export const DEFAULT_BOOKING_VARIANT = "embed" as const;

// Query parameter keys for URL state management
export const QUERY_KEYS = {
  topic: "topic",
  ref: "ref",
  name: "name",
  email: "email",
  tz: "tz",
  notes: "notes",
  source: "source",
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
} as const;

// Error codes for consistent error handling
export const ERROR_CODES = {
  PROVIDER_LOAD_FAILED: "provider_load_failed",
  PROVIDER_TIMEOUT: "provider_timeout",
  INVALID_SERVICE: "invalid_service",
  INVALID_CONFIG: "invalid_config",
  RATE_LIMITED: "rate_limited",
  NETWORK_ERROR: "network_error",
  FORM_VALIDATION_ERROR: "form_validation_error",
  CALENDAR_UNAVAILABLE: "calendar_unavailable",
  BOOKING_CONFLICT: "booking_conflict",
} as const;

// Analytics event names for consistent tracking
export const ANALYTICS_EVENTS = {
  VIEW: "booking_view",
  OPEN_MODAL: "booking_open_modal",
  CLOSE_MODAL: "booking_close_modal",
  SUBMIT: "booking_submit",
  SUCCESS: "booking_success",
  ERROR: "booking_error",
  ABANDON: "booking_abandon",
  PROVIDER_LOAD: "booking_provider_load",
  PROVIDER_ERROR: "booking_provider_error",
  FORM_STEP: "booking_form_step",
  CALENDAR_SELECT: "booking_calendar_select",
} as const;

// Default fallback URLs
export const FALLBACKS = {
  /** default success URL if not provided by consumer */
  successHref: "/thank-you",
  /** default cancel/back URL */
  cancelHref: "/",
  /** default privacy policy URL */
  privacyPolicyHref: "/privacy",
  /** default terms URL */
  termsHref: "/terms",
} as const;

// Provider-specific constants
export const PROVIDER_DEFAULTS = {
  cal: {
    embedHeight: "630px",
    theme: "auto",
    layout: "month_view",
  },
  calendly: {
    embedHeight: "630px",
    hideEventTypeDetails: false,
    hideLandingPageDetails: false,
  },
  custom: {
    embedHeight: "600px",
  },
} as const;

// Timeout and retry settings
export const TIMEOUTS = {
  /** Provider embed load timeout (ms) */
  providerLoad: 10000,
  /** Form submission timeout (ms) */
  formSubmit: 15000,
  /** Analytics dispatch timeout (ms) */
  analytics: 2000,
} as const;

// Validation constraints
export const VALIDATION = {
  /** Maximum notes/message length */
  maxNotesLength: 1000,
  /** Maximum name length */
  maxNameLength: 100,
  /** Minimum name length */
  minNameLength: 2,
  /** Email regex pattern */
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Feature flags for progressive enhancement
export const FEATURES = {
  /** Enable analytics tracking */
  enableAnalytics: true,
  /** Enable form validation */
  enableValidation: true,
  /** Enable provider fallbacks */
  enableFallbacks: true,
  /** Enable timezone detection */
  enableTimezoneDetection: true,
  /** Enable consent collection */
  enableConsent: true,
} as const;

// CSS class names for consistent styling
export const CSS_CLASSES = {
  container: "booking-container",
  modal: "booking-modal",
  form: "booking-form",
  embed: "booking-embed",
  error: "booking-error",
  loading: "booking-loading",
  success: "booking-success",
} as const;