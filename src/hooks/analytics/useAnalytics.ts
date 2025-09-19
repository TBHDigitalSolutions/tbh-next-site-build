// shared-ui/hooks/analytics/useAnalytics.ts

"use client";

import { useCallback } from "react";
import { useAnalyticsContext } from "../../contexts/AnalyticsContext";
import { AnalyticsEvents, AnalyticsEventName } from "../../utils/eventSchema";

/**
 * Media event types that can be tracked
 */
type MediaEventAction = 
  | "load"
  | "play"
  | "pause"
  | "complete"
  | "seek"
  | "error"
  | "buffer"
  | "quality_change"
  | "fullscreen"
  | "volume_change"
  | "share";

/**
 * Event properties for media tracking
 */
interface MediaEventProps {
  action: MediaEventAction;
  mediaType: string;
  url: string;
  metadata?: Record<string, any>;
}

/**
 * Generic track event properties
 */
interface TrackEventProps {
  name: AnalyticsEventName;
  properties?: Record<string, any>;
  callback?: () => void;
}

/**
 * Hook for tracking analytics events throughout the application
 * 
 * This hook provides a unified interface for tracking events across different
 * analytics providers, allowing for easy implementation of analytics throughout
 * the application without tightly coupling to any specific provider.
 */
export const useAnalytics = () => {
  const { provider } = useAnalyticsContext();

  /**
   * Track a generic analytics event
   * 
   * @param name - The name of the event to track
   * @param properties - Additional properties to include with the event
   * @param callback - Optional callback to execute after tracking
   */
  const trackEvent = useCallback(
    ({ name, properties, callback }: TrackEventProps) => {
      try {
        // Send event based on provider
        switch (provider) {
          case "plausible":
            if (window.plausible) {
              window.plausible(name, { props: properties });
            } else {
              console.warn("Plausible is not available");
            }
            break;
          case "gtag":
            if (window.gtag) {
              window.gtag("event", name, properties);
            } else {
              console.warn("Google Analytics is not available");
            }
            break;
          case "posthog":
            if (window.posthog) {
              window.posthog.capture(name, properties);
            } else {
              console.warn("PostHog is not available");
            }
            break;
          default:
            // Log to console in development
            if (process.env.NODE_ENV === "development") {
              console.log(`[Analytics] ${name}`, properties);
            }
        }

        // Execute callback if provided
        if (callback) {
          callback();
        }
      } catch (error) {
        console.error(`Error tracking event ${name}:`, error);
      }
    },
    [provider]
  );

  /**
   * Track a page view event
   * 
   * @param path - Optional path to track instead of current path
   * @param properties - Additional properties to include with the event
   */
  const trackPageView = useCallback(
    (path?: string, properties?: Record<string, any>) => {
      const currentPath = path || (typeof window !== "undefined" ? window.location.pathname : "");
      
      trackEvent({
        name: AnalyticsEvents.PAGE_VIEW,
        properties: {
          path: currentPath,
          title: typeof document !== "undefined" ? document.title : "",
          referrer: typeof document !== "undefined" ? document.referrer : "",
          ...properties,
        },
      });
    },
    [trackEvent]
  );

  /**
   * Track a media-related event
   * 
   * This method automatically maps media actions to the appropriate event types
   * based on the media type, making it easy to track consistent events across
   * different media platforms.
   * 
   * @param mediaEvent - Object containing media event details
   */
  const trackMediaEvent = useCallback(
    (mediaEvent: MediaEventProps | Record<string, any>) => {
      // Support both object structure and direct parameters for backward compatibility
      let action: MediaEventAction;
      let mediaType: string;
      let url: string;
      let metadata: Record<string, any> | undefined;
      
      if ('action' in mediaEvent && typeof mediaEvent.action === 'string') {
        // New structure with an object parameter
        ({ action, mediaType, url, metadata } = mediaEvent as MediaEventProps);
      } else {
        // Legacy structure for backward compatibility
        action = (mediaEvent as any).eventAction || 'play';
        mediaType = (mediaEvent as any).mediaType || 'unknown';
        url = (mediaEvent as any).mediaUrl || '';
        metadata = (mediaEvent as any).metadata || (mediaEvent as any).properties;
      }
      
      // Map media actions to event names
      let eventName: AnalyticsEventName;
      
      switch (action) {
        case "play":
          eventName = mediaType.includes("audio") || mediaType === "spotify" || mediaType === "soundcloud" 
            ? AnalyticsEvents.AUDIO_PLAY 
            : AnalyticsEvents.VIDEO_PLAY;
          break;
        case "pause":
          eventName = mediaType.includes("audio") || mediaType === "spotify" || mediaType === "soundcloud"
            ? AnalyticsEvents.AUDIO_PAUSE
            : AnalyticsEvents.VIDEO_PAUSE;
          break;
        case "complete":
          eventName = mediaType.includes("audio") || mediaType === "spotify" || mediaType === "soundcloud"
            ? AnalyticsEvents.AUDIO_COMPLETE
            : AnalyticsEvents.VIDEO_COMPLETE;
          break;
        case "seek":
          eventName = mediaType.includes("audio") || mediaType === "spotify" || mediaType === "soundcloud"
            ? AnalyticsEvents.AUDIO_SEEK
            : AnalyticsEvents.VIDEO_SEEK;
          break;
        case "buffer":
          eventName = AnalyticsEvents.VIDEO_BUFFER;
          break;
        case "share":
          eventName = AnalyticsEvents.SHARE_CLICKED;
          break;
        case "error":
          // For error events, we use the same event name but add error information
          eventName = mediaType.includes("audio") ? AnalyticsEvents.AUDIO_PAUSE : AnalyticsEvents.VIDEO_PAUSE;
          metadata = {
            ...metadata,
            error: true,
            errorType: metadata?.errorType || 'unknown',
          };
          break;
        default:
          eventName = AnalyticsEvents.VIDEO_PLAY; // Default fallback
      }
      
      trackEvent({
        name: eventName,
        properties: {
          mediaType,
          url,
          action,
          timestamp: new Date().toISOString(),
          ...metadata,
        },
      });
    },
    [trackEvent]
  );

  /**
   * Track when a CTA is clicked
   * 
   * @param ctaId - Identifier for the CTA
   * @param ctaText - Text content of the CTA
   * @param destination - Destination URL
   * @param properties - Additional properties
   */
  const trackCTA = useCallback(
    (ctaId: string, ctaText: string, destination: string, properties?: Record<string, any>) => {
      trackEvent({
        name: AnalyticsEvents.CTA_CLICKED,
        properties: {
          ctaId,
          ctaText,
          destination,
          timestamp: new Date().toISOString(),
          ...properties,
        },
      });
    },
    [trackEvent]
  );

  /**
   * Track when a button is clicked
   * 
   * @param buttonId - Identifier for the button
   * @param buttonText - Text content of the button
   * @param properties - Additional properties
   */
  const trackButtonClick = useCallback(
    (buttonId: string, buttonText: string, properties?: Record<string, any>) => {
      trackEvent({
        name: AnalyticsEvents.BUTTON_CLICKED,
        properties: {
          buttonId,
          buttonText,
          timestamp: new Date().toISOString(),
          ...properties,
        },
      });
    },
    [trackEvent]
  );

  /**
   * Track when a form is submitted
   * 
   * @param formId - Identifier for the form
   * @param formName - Name of the form
   * @param properties - Additional properties
   */
  const trackFormSubmit = useCallback(
    (formId: string, formName: string, properties?: Record<string, any>) => {
      trackEvent({
        name: AnalyticsEvents.FORM_SUBMITTED,
        properties: {
          formId,
          formName,
          timestamp: new Date().toISOString(),
          ...properties,
        },
      });
    },
    [trackEvent]
  );

  /**
   * Track when a user views content beyond a certain scroll depth
   * 
   * @param contentId - Identifier for the content
   * @param scrollDepth - How far the user scrolled (percentage)
   * @param properties - Additional properties
   */
  const trackContentEngagement = useCallback(
    (contentId: string, scrollDepth: number, properties?: Record<string, any>) => {
      // Only track at meaningful thresholds
      if (scrollDepth === 25 || scrollDepth === 50 || scrollDepth === 75 || scrollDepth === 100) {
        trackEvent({
          name: AnalyticsEvents.BLOG_READ,
          properties: {
            contentId,
            scrollDepth,
            timestamp: new Date().toISOString(),
            ...properties,
          },
        });
      }
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackMediaEvent,
    trackCTA,
    trackButtonClick,
    trackFormSubmit,
    trackContentEngagement,
  };
};

// Add TypeScript support for global window objects
declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
    gtag?: (command: string, action: string, params?: Record<string, any>) => void;
    posthog?: {
      capture: (eventName: string, properties?: Record<string, any>) => void;
      identify?: (userId: string, properties?: Record<string, any>) => void;
    };
  }
}

export default useAnalytics;