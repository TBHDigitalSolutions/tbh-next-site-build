// src/lib/booking/bookingPolicy.ts

export type BookingMode = "modal" | "page";

export interface BookingModeOptions {
  /** True when user is on /services/** pages */
  inServicesHierarchy: boolean;
  /** True for L2 leaf services or L3 sub-services */
  isLeafService: boolean;
  /** True when booking requires multiple meeting type selection */
  hasMultipleMeetingTypes: boolean;
  /** True when user has reduced motion preference */
  prefersReducedMotion: boolean;
  /** True when accessibility mode is enabled (screen readers, etc.) */
  a11yMode?: boolean;
  /** Current viewport width in pixels */
  viewportWidth: number;
  /** Breakpoint for mobile vs desktop (default: 768px) */
  breakpoint?: number;
  /** Override for testing or special cases */
  forceMode?: BookingMode;
}

export interface BookingContext {
  /** Current page path */
  pathname: string;
  /** Service hierarchy level (L1, L2, L2B, L3) */
  level?: "L1" | "L2" | "L2B" | "L3";
  /** Service slug */
  serviceSlug?: string;
  /** Hub slug */
  hubSlug?: string;
  /** Source of the booking trigger */
  source?: string;
}

/**
 * Determines whether to open booking in a modal or navigate to /book page
 * Based on context, viewport size, accessibility needs, and user preferences
 */
export function chooseBookingMode(opts: BookingModeOptions): BookingMode {
  // Apply force override for testing or special cases
  if (opts.forceMode) {
    return opts.forceMode;
  }

  const breakpoint = opts.breakpoint ?? 768;

  // Hard redirects to page for accessibility and UX
  if (opts.hasMultipleMeetingTypes || opts.prefersReducedMotion || opts.a11yMode) {
    return "page";
  }

  // Outside services hierarchy - always use page
  if (!opts.inServicesHierarchy) {
    return "page";
  }

  // Small screens - always use page for better UX
  if (opts.viewportWidth < breakpoint) {
    return "page";
  }

  // Desktop within services: modal for leaf services, page for directories
  return opts.isLeafService ? "modal" : "page";
}

/**
 * Enhanced booking mode selection with context awareness
 */
export function chooseBookingModeWithContext(
  opts: BookingModeOptions,
  context: BookingContext
): {
  mode: BookingMode;
  reason: string;
  analytics: Record<string, any>;
} {
  const mode = chooseBookingMode(opts);
  
  let reason: string;
  const analytics = {
    mode,
    context: context.pathname,
    level: context.level,
    serviceSlug: context.serviceSlug,
    hubSlug: context.hubSlug,
    source: context.source,
    viewportWidth: opts.viewportWidth,
    breakpoint: opts.breakpoint ?? 768,
  };

  // Determine reason for the choice
  if (opts.forceMode) {
    reason = `Forced to ${mode} mode`;
  } else if (opts.hasMultipleMeetingTypes) {
    reason = "Multiple meeting types require full page";
  } else if (opts.prefersReducedMotion) {
    reason = "Reduced motion preference";
  } else if (opts.a11yMode) {
    reason = "Accessibility mode enabled";
  } else if (!opts.inServicesHierarchy) {
    reason = "Outside services hierarchy";
  } else if (opts.viewportWidth < (opts.breakpoint ?? 768)) {
    reason = "Small screen size";
  } else if (opts.isLeafService) {
    reason = "Leaf service on desktop - modal for low friction";
  } else {
    reason = "Directory page - full page for complete options";
  }

  return { mode, reason, analytics };
}

/**
 * Utility to detect current booking context from pathname
 */
export function detectBookingContext(pathname: string): BookingContext {
  const context: BookingContext = { pathname };

  // Parse services path
  const servicesMatch = pathname.match(/^\/services(?:\/([^\/]+))?(?:\/([^\/]+))?(?:\/([^\/]+))?/);
  
  if (servicesMatch) {
    const [, hub, service, sub] = servicesMatch;
    
    context.hubSlug = hub;
    context.serviceSlug = service;
    
    if (sub) {
      context.level = "L3"; // Sub-service
    } else if (service) {
      // Could be L2 or L2B - would need taxonomy data to determine
      context.level = "L2";
    } else if (hub) {
      context.level = "L1"; // Hub
    }
  }

  return context;
}

/**
 * Utility to check if user prefers reduced motion
 */
export function checkReducedMotionPreference(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)")?.matches ?? false;
  } catch {
    return false;
  }
}

/**
 * Utility to get current viewport width safely
 */
export function getCurrentViewportWidth(): number {
  if (typeof window === "undefined") return 1024; // SSR fallback
  
  try {
    return window.innerWidth;
  } catch {
    return 1024; // Fallback
  }
}

/**
 * Utility to detect accessibility mode
 */
export function detectAccessibilityMode(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    // Check for screen reader or high contrast mode
    const hasScreenReader = window.navigator.userAgent.includes("NVDA") ||
                           window.navigator.userAgent.includes("JAWS") ||
                           window.speechSynthesis?.speaking;
    
    const hasHighContrast = window.matchMedia("(prefers-contrast: high)")?.matches;
    
    return hasScreenReader || hasHighContrast || false;
  } catch {
    return false;
  }
}

/**
 * Complete booking mode resolver with automatic context detection
 */
export function resolveBookingMode(
  overrides: Partial<BookingModeOptions> = {}
): {
  mode: BookingMode;
  reason: string;
  context: BookingContext;
  analytics: Record<string, any>;
} {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const context = detectBookingContext(pathname);
  
  // Determine if we're in services hierarchy
  const inServicesHierarchy = pathname.startsWith("/services");
  
  // Determine if it's a leaf service (would need taxonomy data for accuracy)
  // For now, assume L3 is always leaf, L2 depends on structure
  const isLeafService = context.level === "L3" || 
                       (context.level === "L2" && !pathname.endsWith("/packages"));

  const options: BookingModeOptions = {
    inServicesHierarchy,
    isLeafService,
    hasMultipleMeetingTypes: false, // Default, should be passed in
    prefersReducedMotion: checkReducedMotionPreference(),
    a11yMode: detectAccessibilityMode(),
    viewportWidth: getCurrentViewportWidth(),
    ...overrides,
  };

  return chooseBookingModeWithContext(options, context);
}

/**
 * Track booking mode decision for analytics
 */
export function trackBookingModeDecision(
  mode: BookingMode,
  reason: string,
  analytics: Record<string, any>
): void {
  if (typeof window === "undefined") return;

  try {
    // Google Analytics 4
    if (typeof window.gtag === "function") {
      window.gtag("event", "booking_mode_decision", {
        booking_mode: mode,
        decision_reason: reason,
        ...analytics,
      });
    }

    // Custom analytics
    if (typeof (window as any).analytics === "object" && (window as any).analytics?.track) {
      (window as any).analytics.track("Booking Mode Decision", {
        mode,
        reason,
        ...analytics,
      });
    }
  } catch (error) {
    console.warn("Failed to track booking mode decision:", error);
  }
}

/**
 * Default export for backwards compatibility
 */
export default chooseBookingMode;