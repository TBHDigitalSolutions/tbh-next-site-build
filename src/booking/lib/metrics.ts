// src/booking/lib/metrics.ts
// Analytics helpers for standardized event tracking
// No React imports - pluggable dispatcher pattern

import { ANALYTICS_EVENTS } from "./constants";
import type { CanonicalService } from "@/shared/services/types";
import type { BookingVariant, BookingProvider } from "./types";

// Analytics context type for consistent event payloads
type AnalyticsContext = { 
  context?: string; 
  service?: CanonicalService; 
  variant?: BookingVariant;
  source?: string;
  [key: string]: any; 
};

// Pluggable dispatcher interface
type AnalyticsDispatcher = (event: string, payload: Record<string, any>) => void;

// Runtime dispatcher (set by app layer)
let dispatcher: AnalyticsDispatcher | null = null;

/**
 * Set the analytics dispatcher (called once by app on client)
 * Supports multiple analytics providers via a single interface
 */
export function setBookingAnalyticsDispatcher(fn: AnalyticsDispatcher): void {
  dispatcher = fn;
}

/**
 * Safe event emission with error handling
 */
function emit(event: string, payload: Record<string, any>): void {
  if (!dispatcher) return;
  
  try {
    // Add timestamp and session info
    const enrichedPayload = {
      ...payload,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
      domain: "booking",
    };
    
    dispatcher(event, enrichedPayload);
  } catch (error) {
    // Swallow analytics errors to not break user experience
    if (process.env.NODE_ENV === "development") {
      console.warn("Analytics dispatch failed:", error);
    }
  }
}

/**
 * Core booking events
 */
export const trackBookingView = (ctx: AnalyticsContext): void => {
  emit(ANALYTICS_EVENTS.VIEW, {
    ...ctx,
    event_category: "booking",
    event_label: ctx.service || "unknown",
  });
};

export const trackBookingOpenModal = (ctx: AnalyticsContext): void => {
  emit(ANALYTICS_EVENTS.OPEN_MODAL, {
    ...ctx,
    event_category: "booking",
    event_label: "modal_opened",
    modal_type: ctx.variant || "unknown",
  });
};

export const trackBookingCloseModal = (ctx: AnalyticsContext & { reason?: string }): void => {
  emit(ANALYTICS_EVENTS.CLOSE_MODAL, {
    ...ctx,
    event_category: "booking",
    event_label: "modal_closed",
    close_reason: ctx.reason || "unknown",
  });
};

export const trackBookingSubmit = (ctx: AnalyticsContext & { 
  fieldsPresent?: string[]; 
  marketingOptIn?: boolean;
  formStep?: number;
}): void => {
  emit(ANALYTICS_EVENTS.SUBMIT, {
    ...ctx,
    event_category: "booking",
    event_label: "form_submitted",
    fields_count: ctx.fieldsPresent?.length || 0,
    marketing_consent: ctx.marketingOptIn || false,
    form_step: ctx.formStep || 1,
  });
};

export const trackBookingSuccess = (ctx: AnalyticsContext & { 
  provider?: BookingProvider; 
  slotIso?: string; 
  timezone?: string;
  duration?: number;
  eventId?: string;
}): void => {
  emit(ANALYTICS_EVENTS.SUCCESS, {
    ...ctx,
    event_category: "booking",
    event_label: "booking_completed",
    booking_provider: ctx.provider || "unknown",
    scheduled_time: ctx.slotIso,
    user_timezone: ctx.timezone,
    meeting_duration: ctx.duration,
    external_event_id: ctx.eventId,
    conversion: true, // Flag for conversion tracking
  });
};

export const trackBookingError = (ctx: AnalyticsContext & { 
  provider?: BookingProvider; 
  code?: string; 
  message?: string;
  step?: string;
}): void => {
  emit(ANALYTICS_EVENTS.ERROR, {
    ...ctx,
    event_category: "booking",
    event_label: "booking_error",
    error_provider: ctx.provider,
    error_code: ctx.code || "unknown",
    error_message: ctx.message || "Unknown error",
    error_step: ctx.step || "unknown",
  });
};

export const trackBookingAbandon = (ctx: AnalyticsContext & { 
  step?: string;
  timeSpent?: number;
  completionPercentage?: number;
}): void => {
  emit(ANALYTICS_EVENTS.ABANDON, {
    ...ctx,
    event_category: "booking",
    event_label: "booking_abandoned",
    abandon_step: ctx.step || "unknown",
    time_spent_seconds: ctx.timeSpent || 0,
    completion_percentage: ctx.completionPercentage || 0,
  });
};

export const trackBookingProviderLoad = (ctx: AnalyticsContext & { 
  provider: BookingProvider;
  loadTime?: number;
  success?: boolean;
}): void => {
  emit(ANALYTICS_EVENTS.PROVIDER_LOAD, {
    ...ctx,
    event_category: "booking",
    event_label: "provider_loaded",
    provider_name: ctx.provider,
    load_time_ms: ctx.loadTime,
    load_success: ctx.success !== false,
  });
};

export const trackBookingProviderError = (ctx: AnalyticsContext & { 
  provider: BookingProvider;
  errorType?: string;
  message?: string;
}): void => {
  emit(ANALYTICS_EVENTS.PROVIDER_ERROR, {
    ...ctx,
    event_category: "booking",
    event_label: "provider_error",
    provider_name: ctx.provider,
    error_type: ctx.errorType || "unknown",
    error_message: ctx.message,
  });
};

export const trackBookingFormStep = (ctx: AnalyticsContext & { 
  step: number;
  stepName?: string;
  direction?: "forward" | "backward";
}): void => {
  emit(ANALYTICS_EVENTS.FORM_STEP, {
    ...ctx,
    event_category: "booking",
    event_label: "form_step",
    step_number: ctx.step,
    step_name: ctx.stepName || `step_${ctx.step}`,
    step_direction: ctx.direction || "forward",
  });
};

export const trackBookingCalendarSelect = (ctx: AnalyticsContext & { 
  selectedDate?: string;
  selectedTime?: string;
  timezone?: string;
}): void => {
  emit(ANALYTICS_EVENTS.CALENDAR_SELECT, {
    ...ctx,
    event_category: "booking",
    event_label: "calendar_selection",
    selected_date: ctx.selectedDate,
    selected_time: ctx.selectedTime,
    user_timezone: ctx.timezone,
  });
};

/**
 * Composite tracking functions for common workflows
 */
export const trackBookingFunnel = {
  start: (ctx: AnalyticsContext) => trackBookingView(ctx),
  
  modalOpen: (ctx: AnalyticsContext) => trackBookingOpenModal(ctx),
  
  formProgress: (ctx: AnalyticsContext & { step: number; stepName?: string }) => 
    trackBookingFormStep(ctx),
    
  providerLoad: (ctx: AnalyticsContext & { provider: BookingProvider; loadTime?: number }) => 
    trackBookingProviderLoad(ctx),
    
  submit: (ctx: AnalyticsContext & { fieldsPresent?: string[] }) => 
    trackBookingSubmit(ctx),
    
  success: (ctx: AnalyticsContext & { provider?: BookingProvider; eventId?: string }) => 
    trackBookingSuccess(ctx),
    
  error: (ctx: AnalyticsContext & { code?: string; message?: string; step?: string }) => 
    trackBookingError(ctx),
    
  abandon: (ctx: AnalyticsContext & { step?: string; timeSpent?: number }) => 
    trackBookingAbandon(ctx),
    
  modalClose: (ctx: AnalyticsContext & { reason?: string }) => 
    trackBookingCloseModal(ctx),
};

/**
 * Utilities for analytics context
 */
export function createAnalyticsContext(base: {
  service?: CanonicalService;
  variant?: BookingVariant;
  source?: string;
  context?: string;
}): AnalyticsContext {
  return {
    ...base,
    page_url: typeof window !== "undefined" ? window.location.href : undefined,
    page_title: typeof document !== "undefined" ? document.title : undefined,
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    viewport_width: typeof window !== "undefined" ? window.innerWidth : undefined,
    viewport_height: typeof window !== "undefined" ? window.innerHeight : undefined,
  };
}

/**
 * Performance tracking utilities
 */
export function createPerformanceTracker() {
  const start = performance.now();
  
  return {
    stop: () => performance.now() - start,
    mark: (label: string) => performance.mark(`booking_${label}`),
    measure: (name: string, startMark: string, endMark?: string) => {
      try {
        performance.measure(`booking_${name}`, `booking_${startMark}`, endMark ? `booking_${endMark}` : undefined);
      } catch {
        // Marks may not exist, ignore
      }
    },
  };
}

/**
 * Session ID generation and retrieval
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  
  try {
    let sessionId = sessionStorage.getItem("booking_session_id");
    if (!sessionId) {
      sessionId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("booking_session_id", sessionId);
    }
    return sessionId;
  } catch {
    return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * A/B testing and feature flag support
 */
export function trackBookingExperiment(ctx: AnalyticsContext & {
  experimentName: string;
  variant: string;
  conversionEvent?: boolean;
}): void {
  emit("booking_experiment", {
    ...ctx,
    event_category: "booking_experiment",
    experiment_name: ctx.experimentName,
    experiment_variant: ctx.variant,
    is_conversion: ctx.conversionEvent || false,
  });
}

/**
 * Conversion attribution tracking
 */
export function trackBookingAttribution(ctx: AnalyticsContext & {
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}): void {
  emit("booking_attribution", {
    ...ctx,
    event_category: "booking_attribution",
    referrer_url: ctx.referrer,
    utm_source: ctx.utmSource,
    utm_medium: ctx.utmMedium,
    utm_campaign: ctx.utmCampaign,
    utm_content: ctx.utmContent,
    utm_term: ctx.utmTerm,
  });
}