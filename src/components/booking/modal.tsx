"use client";

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import BookingModal from "./BookingModal";

export type OpenBookingModalOptions = {
  /** Source/context for analytics, e.g. "cta-section", "hero", "pricing" */
  source?: string;
  /** URL to open inside the iframe. Defaults to /book */
  url?: string;
  /** Optional dialog title */
  title?: string;
  /** Optional description (SR only) */
  description?: string;
  /** Optional UTM parameters to append to the URL */
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
  /** Optional callback when modal closes */
  onClose?: () => void;
  /** Optional callback when booking is successful */
  onSuccess?: () => void;
  /** Optional callback when booking fails */
  onError?: (error: Error) => void;
};

const MOUNT_ID = "booking-modal-root";

/**
 * Analytics helper to track booking interactions
 */
function trackBookingEvent(action: string, source?: string, additionalData?: Record<string, any>) {
  if (typeof window !== "undefined") {
    // Google Analytics 4
    if (typeof window.gtag === "function") {
      window.gtag("event", "booking_interaction", {
        action,
        source: source ?? "unknown",
        ...additionalData,
      });
    }

    // Custom analytics hook
    if (typeof window.analytics === "object" && window.analytics?.track) {
      window.analytics.track("Booking Interaction", {
        action,
        source: source ?? "unknown",
        ...additionalData,
      });
    }

    // PostHog
    if (typeof window.posthog === "object" && window.posthog?.capture) {
      window.posthog.capture("booking_interaction", {
        action,
        source: source ?? "unknown",
        ...additionalData,
      });
    }
  }
}

/**
 * Build URL with UTM parameters
 */
function buildUrlWithParams(baseUrl: string, utm?: OpenBookingModalOptions["utm"], source?: string): string {
  const url = new URL(baseUrl, window.location.origin);
  
  // Add source as a query parameter
  if (source) {
    url.searchParams.set("src", source);
  }
  
  // Add UTM parameters
  if (utm) {
    if (utm.source) url.searchParams.set("utm_source", utm.source);
    if (utm.medium) url.searchParams.set("utm_medium", utm.medium);
    if (utm.campaign) url.searchParams.set("utm_campaign", utm.campaign);
    if (utm.content) url.searchParams.set("utm_content", utm.content);
    if (utm.term) url.searchParams.set("utm_term", utm.term);
  }
  
  return url.toString();
}

/**
 * Opens a BookingModal in a React portal with sensible cleanup.
 * Safe to call multiple times; reuses the same root.
 */
export function openBookingModal(opts: OpenBookingModalOptions = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    console.warn("openBookingModal called in non-browser environment");
    return;
  }

  // Clean up any existing modal first
  const existingMount = document.getElementById(MOUNT_ID);
  if (existingMount) {
    try {
      if ((existingMount as any)._root) {
        (existingMount as any)._root.unmount();
      }
      existingMount.remove();
    } catch (error) {
      console.warn("Error cleaning up existing booking modal:", error);
    }
  }

  // Create new mount point
  const mount = document.createElement("div");
  mount.id = MOUNT_ID;
  mount.setAttribute("data-booking-modal", "true");
  document.body.appendChild(mount);

  const root = createRoot(mount);
  (mount as any)._root = root;

  // Build the final URL with parameters
  const finalUrl = buildUrlWithParams(
    opts.url ?? "/book",
    opts.utm,
    opts.source
  );

  function ModalWrapper() {
    const [open, setOpen] = useState(true);
    
    const handleClose = () => {
      setOpen(false);
      trackBookingEvent("modal_close", opts.source);
      opts.onClose?.();
    };

    const handleLoad = () => {
      trackBookingEvent("modal_load", opts.source, { url: finalUrl });
    };

    const handleError = (error: Error) => {
      trackBookingEvent("modal_error", opts.source, { 
        error: error.message,
        url: finalUrl 
      });
      opts.onError?.(error);
    };

    // Unmount & cleanup when closed
    useEffect(() => {
      if (open) return;
      
      const cleanup = () => {
        try {
          root.unmount();
        } catch (error) {
          console.warn("Error unmounting booking modal:", error);
        }
        
        if (mount?.parentNode) {
          mount.parentNode.removeChild(mount);
        }
      };

      // Small delay to allow for exit animations
      const timer = setTimeout(cleanup, 150);
      return () => clearTimeout(timer);
    }, [open]);

    // Track modal open
    useEffect(() => {
      if (open) {
        trackBookingEvent("modal_open", opts.source, { url: finalUrl });
      }
    }, [open]);

    // Handle success events from iframe (if supported)
    useEffect(() => {
      if (!open) return;

      const handleMessage = (event: MessageEvent) => {
        // Only listen to messages from our iframe
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === "booking_success") {
          trackBookingEvent("booking_success", opts.source, event.data.data);
          opts.onSuccess?.();
        }
      };

      window.addEventListener("message", handleMessage);
      return () => window.removeEventListener("message", handleMessage);
    }, [open]);

    return (
      <BookingModal
        isOpen={open}
        onClose={handleClose}
        src={finalUrl}
        title={opts.title ?? "Schedule Consultation"}
        description={opts.description ?? "Book a consultation with our team to discuss your project needs."}
        onLoad={handleLoad}
        onError={handleError}
      />
    );
  }

  root.render(<ModalWrapper />);
}

/**
 * Check if a booking modal is currently open
 */
export function isBookingModalOpen(): boolean {
  if (typeof document === "undefined") return false;
  return !!document.getElementById(MOUNT_ID);
}

/**
 * Close any open booking modal
 */
export function closeBookingModal(): void {
  if (typeof document === "undefined") return;
  
  const mount = document.getElementById(MOUNT_ID);
  if (mount && (mount as any)._root) {
    try {
      (mount as any)._root.unmount();
      mount.remove();
    } catch (error) {
      console.warn("Error closing booking modal:", error);
    }
  }
}

/**
 * Augment window object for TypeScript
 */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void;
    };
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void;
    };
  }
}