// src/data/booking/configs/analytics.ts
// Booking analytics: event names, config, thin client runtime.
// - SSR-safe (guards window/document)
// - GA4 first-class, easy to extend to Mixpanel/Amplitude/Segment

// If you already have these in /_types, import from there. Otherwise, keep local.
export type CanonicalService =
  | 'content-production-services'
  | 'lead-generation-services'
  | 'marketing-services'
  | 'seo-services'
  | 'video-production-services'
  | 'web-development-services';

export type BookingProvider = 'calcom' | 'calendly' | 'acuity';

export const BOOKING_EVENTS = {
  // Page/Modal
  HUB_VIEW: 'booking_hub_view',
  PAGE_VIEW: 'booking_page_view',
  MODAL_OPEN: 'booking_modal_open',
  MODAL_CLOSE: 'booking_modal_close',

  // Journey
  SERVICE_SELECTED: 'booking_service_selected',
  PROVIDER_LOADED: 'booking_provider_loaded',
  FORM_STARTED: 'booking_form_started',
  FORM_STEP: 'booking_form_step_completed',
  FORM_ERROR: 'booking_form_validation_error',

  // Conversion
  INITIATED: 'booking_initiated',
  CONFIRMED: 'booking_confirmed',
  FAILED: 'booking_failed',
  ABANDONED: 'booking_abandoned',

  // Perf
  PROVIDER_LOAD_TIME: 'booking_provider_load_time',
  FORM_COMPLETION_TIME: 'booking_form_completion_time',
} as const;

export type BookingEventName = typeof BOOKING_EVENTS[keyof typeof BOOKING_EVENTS];

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  batchSize: number;
  flushIntervalMs: number;
  providers: {
    ga4?: { measurementId: string; enabled: boolean };
    mixpanel?: { token: string; enabled: boolean };
    amplitude?: { apiKey: string; enabled: boolean };
    segment?: { writeKey: string; enabled: boolean };
  };
}

export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  enabled: true,
  debug: process.env.NODE_ENV !== 'production',
  batchSize: 10,
  flushIntervalMs: 30_000,
  providers: {
    ga4: {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '',
      enabled: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    },
  },
};

type Base = {
  service?: CanonicalService;
  provider?: BookingProvider;
  source?: 'page' | 'modal' | 'direct';
  formStep?: string;
  value?: number;
  duration?: number;
};

export type BookingEvent = {
  name: BookingEventName;
  payload?: Record<string, unknown> & Base;
};

class BookingAnalytics {
  private static _instance: BookingAnalytics | null = null;
  private cfg: AnalyticsConfig;
  private queue: BookingEvent[] = [];
  private timer?: ReturnType<typeof setInterval>;
  private sessionId = `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  private constructor(cfg: AnalyticsConfig) {
    this.cfg = cfg;
    if (this.cfg.enabled) {
      this.initProviders();
      this.timer = setInterval(() => this.flush(), this.cfg.flushIntervalMs);
    }
  }

  static getInstance(cfg: Partial<AnalyticsConfig> = {}): BookingAnalytics {
    if (!this._instance) this._instance = new BookingAnalytics({ ...DEFAULT_ANALYTICS_CONFIG, ...cfg });
    return this._instance;
  }

  track(evt: BookingEvent) {
    if (!this.cfg.enabled) return;
    const enriched: BookingEvent = {
      ...evt,
      payload: {
        ...evt.payload,
        sessionId: this.sessionId,
        ts: new Date().toISOString(),
        ...(typeof window !== 'undefined' ? { ua: window.navigator.userAgent } : {}),
      },
    };
    if (this.cfg.debug) console.debug('📊 booking.track', enriched);
    this.queue.push(enriched);
    if (this.queue.length >= this.cfg.batchSize) this.flush();
  }

  flush() {
    if (!this.queue.length) return;
    const batch = this.queue.splice(0, this.queue.length);

    // GA4
    if (this.cfg.providers.ga4?.enabled && typeof window !== 'undefined' && (window as any).gtag) {
      const gtag = (window as any).gtag as (...args: any[]) => void;
      for (const evt of batch) {
        gtag('event', evt.name, {
          event_category: 'booking',
          ...evt.payload,
        });
      }
    }

    // Other providers (no-ops by default)
    if (this.cfg.debug) console.debug(`📤 booking.flush x${batch.length}`);
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
    this.flush();
  }

  private initProviders() {
    const ga = this.cfg.providers.ga4;
    if (!ga?.enabled || typeof window === 'undefined') return;

    // load GA4 script once
    if (!(window as any).__booking_ga4_loaded__) {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${ga.measurementId}`;
      document.head.appendChild(s);
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).gtag = function gtag() {
        (window as any).dataLayer.push(arguments);
      };
      (window as any).gtag('js', new Date());
      (window as any).gtag('config', ga.measurementId);
      (window as any).__booking_ga4_loaded__ = true;
    }
  }
}

// Singleton & helpers
export const bookingAnalytics = BookingAnalytics.getInstance();

export const trackBooking = (name: BookingEventName, payload?: BookingEvent['payload']) =>
  bookingAnalytics.track({ name, payload });

// Some convenience wrappers
export const trackHubView = (service?: CanonicalService) =>
  trackBooking(BOOKING_EVENTS.HUB_VIEW, { service, source: 'page' });

export const trackModalOpen = (service?: CanonicalService) =>
  trackBooking(BOOKING_EVENTS.MODAL_OPEN, { service, source: 'modal' });

export const trackModalClose = (service?: CanonicalService) =>
  trackBooking(BOOKING_EVENTS.MODAL_CLOSE, { service, source: 'modal' });

export const trackServiceSelected = (service: CanonicalService) =>
  trackBooking(BOOKING_EVENTS.SERVICE_SELECTED, { service, source: 'page' });

export default bookingAnalytics;
