// src/booking/hooks/useBookingAnalytics.ts
// Analytics tracking hook for booking interactions and funnel analysis

"use client";

import { useCallback, useRef, useEffect } from "react";
import { 
  setBookingAnalyticsDispatcher,
  trackBookingFunnel,
  createAnalyticsContext,
  trackBookingExperiment,
  trackBookingAttribution 
} from "../lib/metrics";
import { ANALYTICS_EVENTS } from "../lib/constants";
import type { CanonicalService, BookingVariant, BookingProvider } from "../lib/types";

// Analytics configuration
export interface UseBookingAnalyticsOptions {
  /** Service being booked */
  service?: CanonicalService;
  /** Booking variant */
  variant?: BookingVariant;
  /** Analytics context (page, modal, etc.) */
  context?: string;
  /** Source of the booking interaction */
  source?: string;
  /** Enable automatic page view tracking */
  autoTrackPageView?: boolean;
  /** Enable performance tracking */
  enablePerformanceTracking?: boolean;
  /** Custom analytics dispatcher */
  customDispatcher?: (event: string, payload: Record<string, any>) => void;
}

// Event data interfaces
export interface BookingEventData {
  service?: CanonicalService;
  variant?: BookingVariant;
  provider?: BookingProvider;
  source?: string;
  context?: string;
  [key: string]: any;
}

export interface ConversionEventData extends BookingEventData {
  conversionValue?: number;
  conversionCurrency?: string;
  leadScore?: number;
}

export interface ErrorEventData extends BookingEventData {
  errorCode?: string;
  errorMessage?: string;
  errorStep?: string;
  recovery?: boolean;
}

export function useBookingAnalytics(options: UseBookingAnalyticsOptions = {}) {
  const {
    service,
    variant,
    context,
    source,
    autoTrackPageView = true,
    enablePerformanceTracking = true,
    customDispatcher,
  } = options;

  // Refs for tracking state
  const sessionStartRef = useRef<number>(Date.now());
  const pageViewTrackedRef = useRef(false);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);
  const interactionCountRef = useRef(0);
  
  // Base analytics context
  const baseContext = createAnalyticsContext({
    service,
    variant,
    context,
    source,
  });

  // Set up analytics dispatcher
  useEffect(() => {
    const dispatcher = customDispatcher || createDefaultDispatcher();
    setBookingAnalyticsDispatcher(dispatcher);
    
    return () => {
      // Clean up dispatcher on unmount
      setBookingAnalyticsDispatcher(() => {});
    };
  }, [customDispatcher]);

  // Auto page view tracking
  useEffect(() => {
    if (autoTrackPageView && !pageViewTrackedRef.current) {
      trackPageView();
      pageViewTrackedRef.current = true;
    }
  }, [autoTrackPageView, service, variant, context]);

  // Performance tracking setup
  useEffect(() => {
    if (!enablePerformanceTracking || typeof window === "undefined") return;

    try {
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name.includes("booking")) {
              trackPerformanceMetric(entry);
            }
          });
        });

        observer.observe({ 
          entryTypes: ["measure", "navigation", "paint", "largest-contentful-paint"] 
        });
        
        performanceObserverRef.current = observer;
      }
    } catch (error) {
      console.warn("Performance tracking setup failed:", error);
    }

    return () => {
      performanceObserverRef.current?.disconnect();
    };
  }, [enablePerformanceTracking]);

  // Interaction tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    const trackInteraction = () => {
      interactionCountRef.current += 1;
    };

    const events = ["click", "keydown", "scroll", "touchstart"];
    events.forEach(event => {
      document.addEventListener(event, trackInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackInteraction);
      });
    };
  }, []);

  // Core tracking functions
  const trackPageView = useCallback((additionalData?: BookingEventData) => {
    const eventData = {
      ...baseContext,
      ...additionalData,
      page_type: "booking_page",
      session_start: sessionStartRef.current,
    };

    trackBookingFunnel.start(eventData);
  }, [baseContext]);

  const trackModalOpen = useCallback((additionalData?: BookingEventData) => {
    const eventData = {
      ...baseContext,
      ...additionalData,
      modal_trigger: additionalData?.source || "unknown",
    };

    trackBookingFunnel.modalOpen(eventData);
  }, [baseContext]);

  const trackModalClose = useCallback((reason?: string, additionalData?: BookingEventData) => {
    const eventData = {
      ...baseContext,
      ...additionalData,
      reason: reason || "user_action",
      interaction_count: interactionCountRef.current,
    };

    trackBookingFunnel.modalClose(eventData);
  }, [baseContext]);

  const trackFormStart = useCallback((additionalData?: BookingEventData) => {
    const eventData = {
      ...baseContext,
      ...additionalData,
      form_type: variant || "unknown",
    };

    trackBookingFunnel.formProgress({
      ...eventData,
      step: 1,
      stepName: "form_start",
      direction: "forward",
    });
  }, [baseContext, variant]);

  const trackFormStep = useCallback((
    step: number,
    stepName: string,
    additionalData?: BookingEventData
  ) => {
    const eventData = {
      ...baseContext,
      ...additionalData,
      step,
      stepName,
      direction: "forward",
    };

    trackBookingFunnel.formProgress(eventData);
  }, [baseContext]);

  const trackFormSubmit = useCallback((
    formData: Record<string, any>,
    additionalData?: BookingEventData
  ) => {
    const fieldsPresent = Object.keys(formData).filter(key => 
      formData[key] !== undefined && formData[key] !== null && formData[key] !== ""
    );

    const eventData = {
      ...baseContext,
      ...additionalData,
      fieldsPresent,
      fieldCount: fieldsPresent.length,
      hasEmail: !!formData.email,
      hasPhone: !!formData.phone,
      marketingOptIn: !!formData.marketingConsent,
    };

    trackBookingFunnel.submit(eventData);
  }, [baseContext]);

  const trackConversion = useCallback((
    conversionData: ConversionEventData
  ) => {
    const sessionTime = Date.now() - sessionStartRef.current;
    
    const eventData = {
      ...baseContext,
      ...conversionData,
      sessionTime,
      interactionCount: interactionCountRef.current,
      conversionType: "booking_completed",
    };

    trackBookingFunnel.success(eventData);

    // Additional conversion tracking for marketing platforms
    if (typeof window !== "undefined") {
      // Google Analytics 4
      if (typeof window.gtag === "function") {
        window.gtag("event", "purchase", {
          transaction_id: conversionData.eventId || `booking_${Date.now()}`,
          value: conversionData.conversionValue || 0,
          currency: conversionData.conversionCurrency || "USD",
          items: [{
            item_id: `booking_${service}`,
            item_name: `${service} consultation`,
            category: "booking",
            quantity: 1,
            price: conversionData.conversionValue || 0,
          }],
        });
      }

      // Facebook Pixel
      if (typeof window.fbq === "function") {
        window.fbq("track", "Purchase", {
          value: conversionData.conversionValue || 0,
          currency: conversionData.conversionCurrency || "USD",
          content_type: "booking",
          content_category: service,
        });
      }
    }
  }, [baseContext, service]);

  const trackError = useCallback((
    errorData: ErrorEventData
  ) => {
    const eventData = {
      ...baseContext,
      ...errorData,
      sessionTime: Date.now() - sessionStartRef.current,
      interactionCount: interactionCountRef.current,
    };

    trackBookingFunnel.error(eventData);
  }, [baseContext]);

  const trackAbandonment = useCallback((
    step: string,
    reason?: string,
    additionalData?: BookingEventData
  ) => {
    const sessionTime = Date.now() - sessionStartRef.current;
    
    const eventData = {
      ...baseContext,
      ...additionalData,
      step,
      reason: reason || "unknown",
      sessionTime,
      interactionCount: interactionCountRef.current,
    };

    trackBookingFunnel.abandon(eventData);
  }, [baseContext]);

  const trackProviderInteraction = useCallback((
    provider: BookingProvider,
    action: string,
    additionalData?: BookingEventData
  ) => {
    const eventData = {
      ...baseContext,
      ...additionalData,
      provider,
      providerAction: action,
    };

    trackBookingFunnel.providerLoad(eventData);
  }, [baseContext]);

  // A/B testing and experiments
  const trackExperiment = useCallback((
    experimentName: string,
    variant: string,
    isConversion = false
  ) => {
    trackBookingExperiment({
      ...baseContext,
      experimentName,
      variant,
      conversionEvent: isConversion,
    });
  }, [baseContext]);

  // Attribution tracking
  const trackAttribution = useCallback((utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  }) => {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);
    
    trackBookingAttribution({
      ...baseContext,
      referrer,
      utmSource: utmParams?.source || urlParams.get("utm_source"),
      utmMedium: utmParams?.medium || urlParams.get("utm_medium"),
      utmCampaign: utmParams?.campaign || urlParams.get("utm_campaign"),
      utmContent: utmParams?.content || urlParams.get("utm_content"),
      utmTerm: utmParams?.term || urlParams.get("utm_term"),
    });
  }, [baseContext]);

  // Performance tracking
  const trackPerformanceMetric = useCallback((entry: PerformanceEntry) => {
    const performanceData = {
      ...baseContext,
      metricName: entry.name,
      metricType: entry.entryType,
      duration: entry.duration || 0,
      startTime: entry.startTime,
    };

    // Track specific performance metrics
    if (entry.entryType === "largest-contentful-paint") {
      trackBookingFunnel.providerLoad({
        ...performanceData,
        provider: "page" as BookingProvider,
        loadTime: entry.startTime,
      });
    }
  }, [baseContext]);

  // Utility functions
  const getSessionData = useCallback(() => ({
    sessionId: `booking_${sessionStartRef.current}`,
    sessionDuration: Date.now() - sessionStartRef.current,
    interactionCount: interactionCountRef.current,
    context: baseContext,
  }), [baseContext]);

  const resetSession = useCallback(() => {
    sessionStartRef.current = Date.now();
    interactionCountRef.current = 0;
    pageViewTrackedRef.current = false;
  }, []);

  return {
    // Core tracking functions
    trackPageView,
    trackModalOpen,
    trackModalClose,
    trackFormStart,
    trackFormStep,
    trackFormSubmit,
    trackConversion,
    trackError,
    trackAbandonment,
    trackProviderInteraction,

    // Advanced tracking
    trackExperiment,
    trackAttribution,
    trackPerformanceMetric,

    // Utilities
    getSessionData,
    resetSession,

    // Analytics context for manual tracking
    analyticsContext: baseContext,
  };
}

// Default analytics dispatcher
function createDefaultDispatcher(): (event: string, payload: Record<string, any>) => void {
  return (event: string, payload: Record<string, any>) => {
    try {
      // Google Analytics 4
      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", event, {
          event_category: "booking",
          ...payload,
        });
      }

      // Custom analytics (if available)
      if (typeof window !== "undefined" && typeof window.analytics === "object" && window.analytics?.track) {
        window.analytics.track(event, payload);
      }

      // PostHog
      if (typeof window !== "undefined" && typeof window.posthog === "object" && window.posthog?.capture) {
        window.posthog.capture(event, payload);
      }

      // Development logging
      if (process.env.NODE_ENV === "development") {
        console.log(`[Booking Analytics] ${event}:`, payload);
      }
    } catch (error) {
      console.warn("Analytics dispatch failed:", error);
    }
  };
}

// Augment window types for analytics providers
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void;
    };
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void;
    };
  }
}