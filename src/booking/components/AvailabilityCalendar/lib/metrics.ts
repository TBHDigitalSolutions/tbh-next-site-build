// src/booking/lib/metrics.ts - Calendar-specific analytics tracking

import type { CanonicalService, BookingProvider } from './types';

// Calendar-specific analytics events
export interface CalendarSelectEvent {
  service: CanonicalService;
  provider: BookingProvider;
  slotTime: string;
  context: string;
  timestamp?: number;
}

export interface CalendarViewEvent {
  service?: CanonicalService;
  view: 'month' | 'week' | 'day';
  context: string;
  timestamp?: number;
}

export interface CalendarNavigationEvent {
  action: 'next' | 'previous' | 'today' | 'date_select';
  view: 'month' | 'week' | 'day';
  context: string;
  timestamp?: number;
}

export interface CalendarErrorEvent {
  error: string;
  errorType: 'load_failed' | 'timeout' | 'network' | 'invalid_data';
  service?: CanonicalService;
  context: string;
  timestamp?: number;
}

// Analytics wrapper - replace with your actual analytics implementation
function track(eventName: string, properties: Record<string, any>) {
  // Production implementation would use your analytics service
  // Examples: Mixpanel, Amplitude, Google Analytics, etc.
  
  if (typeof window !== 'undefined') {
    // Browser environment
    if (window.gtag) {
      // Google Analytics 4
      window.gtag('event', eventName, properties);
    }
    
    if (window.mixpanel) {
      // Mixpanel
      window.mixpanel.track(eventName, properties);
    }
    
    if (window.amplitude) {
      // Amplitude
      window.amplitude.track(eventName, properties);
    }
    
    // Custom analytics service
    if (window.analytics?.track) {
      window.analytics.track(eventName, properties);
    }
  }
  
  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, properties);
  }
}

// Calendar slot selection tracking
export function trackBookingCalendarSelect(event: CalendarSelectEvent): void {
  const properties = {
    ...event,
    timestamp: event.timestamp || Date.now(),
    event_category: 'booking',
    event_label: 'calendar_slot_select',
  };
  
  track('booking_calendar_select', properties);
}

// Calendar view tracking
export function trackBookingCalendarView(event: CalendarViewEvent): void {
  const properties = {
    ...event,
    timestamp: event.timestamp || Date.now(),
    event_category: 'booking',
    event_label: 'calendar_view',
  };
  
  track('booking_calendar_view', properties);
}

// Calendar navigation tracking
export function trackBookingCalendarNavigation(event: CalendarNavigationEvent): void {
  const properties = {
    ...event,
    timestamp: event.timestamp || Date.now(),
    event_category: 'booking',
    event_label: 'calendar_navigation',
  };
  
  track('booking_calendar_navigation', properties);
}

// Calendar error tracking
export function trackBookingCalendarError(event: CalendarErrorEvent): void {
  const properties = {
    ...event,
    timestamp: event.timestamp || Date.now(),
    event_category: 'booking',
    event_label: 'calendar_error',
    error_category: 'calendar',
  };
  
  track('booking_calendar_error', properties);
}

// Calendar load performance tracking
export function trackBookingCalendarPerformance(loadTime: number, context: string): void {
  const properties = {
    load_time: loadTime,
    context,
    timestamp: Date.now(),
    event_category: 'booking',
    event_label: 'calendar_performance',
  };
  
  track('booking_calendar_performance', properties);
}

// Batch tracking for multiple events
export function trackBookingCalendarBatch(events: Array<{
  type: 'select' | 'view' | 'navigation' | 'error' | 'performance';
  data: any;
}>): void {
  events.forEach(event => {
    switch (event.type) {
      case 'select':
        trackBookingCalendarSelect(event.data);
        break;
      case 'view':
        trackBookingCalendarView(event.data);
        break;
      case 'navigation':
        trackBookingCalendarNavigation(event.data);
        break;
      case 'error':
        trackBookingCalendarError(event.data);
        break;
      case 'performance':
        trackBookingCalendarPerformance(event.data.loadTime, event.data.context);
        break;
    }
  });
}

// Typed global analytics interfaces for better IDE support
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    mixpanel?: {
      track: (eventName: string, properties: Record<string, any>) => void;
    };
    amplitude?: {
      track: (eventName: string, properties: Record<string, any>) => void;
    };
    analytics?: {
      track: (eventName: string, properties: Record<string, any>) => void;
    };
  }
}