// src/booking/lib/metrics.ts - Additional metrics for BookingConfirmation

import type { CanonicalService, BookingProvider } from './types';

// Confirmation-specific analytics events
export interface BookingConfirmationEvent {
  bookingId: string;
  service: CanonicalService;
  provider: BookingProvider;
  timestamp: number;
  referenceNumber?: string;
}

export interface BookingActionEvent {
  action: string;
  bookingId: string;
  service: CanonicalService;
  provider: BookingProvider;
  timestamp: number;
  actionData?: Record<string, any>;
}

export interface CalendarIntegrationEvent {
  format: 'google' | 'outlook' | 'apple' | 'yahoo' | 'ics';
  bookingId: string;
  service: CanonicalService;
  timestamp: number;
}

export interface ShareEvent {
  method: 'link' | 'email' | 'sms' | 'print' | 'calendar';
  bookingId: string;
  service: CanonicalService;
  timestamp: number;
}

// Analytics wrapper function (extend existing metrics.ts)
function track(eventName: string, properties: Record<string, any>) {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventName, properties);
    }
    
    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(eventName, properties);
    }
    
    // Custom analytics
    if (window.analytics?.track) {
      window.analytics.track(eventName, properties);
    }
  }
  
  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, properties);
  }
}

// Booking confirmation view tracking
export function trackBookingConfirmation(event: BookingConfirmationEvent): void {
  const properties = {
    ...event,
    event_category: 'booking',
    event_label: 'confirmation_view',
    page_type: 'confirmation',
  };
  
  track('booking_confirmation_view', properties);
}

// Booking action tracking (reschedule, cancel, etc.)
export function trackBookingAction(event: BookingActionEvent): void {
  const properties = {
    ...event,
    event_category: 'booking',
    event_label: 'confirmation_action',
    action_type: event.action,
  };
  
  track('booking_confirmation_action', properties);
}

// Calendar integration tracking
export function trackCalendarIntegration(event: CalendarIntegrationEvent): void {
  const properties = {
    ...event,
    event_category: 'booking',
    event_label: 'calendar_integration',
    integration_type: event.format,
  };
  
  track('booking_calendar_integration', properties);
}

// Share functionality tracking
export function trackBookingShare(event: ShareEvent): void {
  const properties = {
    ...event,
    event_category: 'booking',
    event_label: 'confirmation_share',
    share_method: event.method,
  };
  
  track('booking_confirmation_share', properties);
}

// Conversion funnel tracking
export function trackBookingFunnelStep(step: string, bookingId: string, service: CanonicalService): void {
  const properties = {
    booking_id: bookingId,
    service,
    funnel_step: step,
    timestamp: Date.now(),
    event_category: 'booking',
    event_label: 'funnel_progression',
  };
  
  track('booking_funnel_step', properties);
}

// Time spent on confirmation page
export function trackConfirmationDuration(startTime: number, bookingId: string, service: CanonicalService): void {
  const duration = Date.now() - startTime;
  
  const properties = {
    booking_id: bookingId,
    service,
    duration_ms: duration,
    duration_seconds: Math.round(duration / 1000),
    timestamp: Date.now(),
    event_category: 'booking',
    event_label: 'confirmation_duration',
  };
  
  track('booking_confirmation_duration', properties);
}

// Error tracking for confirmation page
export function trackConfirmationError(error: string, bookingId: string, context?: string): void {
  const properties = {
    booking_id: bookingId,
    error_message: error,
    error_context: context || 'unknown',
    timestamp: Date.now(),
    event_category: 'booking',
    event_label: 'confirmation_error',
  };
  
  track('booking_confirmation_error', properties);
}

// Batch tracking for multiple confirmation events
export function trackConfirmationBatch(events: Array<{
  type: 'view' | 'action' | 'calendar' | 'share' | 'funnel' | 'duration' | 'error';
  data: any;
}>): void {
  events.forEach(event => {
    switch (event.type) {
      case 'view':
        trackBookingConfirmation(event.data);
        break;
      case 'action':
        trackBookingAction(event.data);
        break;
      case 'calendar':
        trackCalendarIntegration(event.data);
        break;
      case 'share':
        trackBookingShare(event.data);
        break;
      case 'funnel':
        trackBookingFunnelStep(event.data.step, event.data.bookingId, event.data.service);
        break;
      case 'duration':
        trackConfirmationDuration(event.data.startTime, event.data.bookingId, event.data.service);
        break;
      case 'error':
        trackConfirmationError(event.data.error, event.data.bookingId, event.data.context);
        break;
    }
  });
}