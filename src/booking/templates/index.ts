// src/booking/templates/index.ts
// Barrel exports for all booking templates

// ============================================================================
// Template Components
// ============================================================================

// BookingHubTemplate - Full page booking experience
export { 
  default as BookingHubTemplate,
  BookingHubTemplate as BookingHub 
} from "./BookingHubTemplate";

// BookingModalTemplate - Modal overlay booking experience
export { 
  default as BookingModalTemplate,
  BookingModalTemplate as BookingModal 
} from "./BookingModalTemplate";

// ============================================================================
// BookingHubTemplate Types
// ============================================================================

export type {
  BookingHubTemplateProps,
  BookingHubMeta,
  BookingHubFeatures,
  BookingHubLayout,
  BookingHubTheme,
  BookingHubAnalytics,
  BookingHubTrust,
  BookingHubCTA,
  BookingHubBreadcrumb,
  BookingHubState,
  BookingHubTemplateState,
  BookingHubSection,
  BookingHubContext,
  BookingHubValidation,
  BookingHubAnalyticsEvents,
  BookingHubSEO,
  UseBookingHubTemplateReturn,
  UseBookingHubTemplateConfig,
} from "./BookingHubTemplate";

// ============================================================================
// BookingModalTemplate Types
// ============================================================================

export type {
  BookingModalTemplateProps,
  BookingModalSize,
  BookingModalCloseBehavior,
  BookingModalAnimation,
  BookingModalBackdrop,
  BookingModalHeader,
  BookingModalFooter,
  BookingModalContext,
  BookingModalAnalytics,
  BookingModalAccessibility,
  BookingModalState,
  BookingModalInternalState,
  BookingModalEvent,
  BookingModalValidation,
  BookingModalFocusTargets,
  UseBookingModalReturn,
  UseBookingModalConfig,
  BookingModalSizeConfig,
  BookingModalAnimationConfig,
  BookingModalDefaults,
} from "./BookingModalTemplate";

// ============================================================================
// Template Registry and Utilities
// ============================================================================

import type { CanonicalService } from "@/shared/services/types";
import type { BookingHubTemplateProps } from "./BookingHubTemplate";
import type { BookingModalTemplateProps } from "./BookingModalTemplate";

/**
 * Template selection options
 */
export interface BookingTemplateSelection {
  /** Use modal overlay */
  useModal: boolean;
  /** Template size (for modal) */
  size?: BookingModalTemplateProps["size"];
  /** Reason for selection */
  reason: string;
}

/**
 * Template factory configuration
 */
export interface BookingTemplateConfig {
  service?: CanonicalService;
  source?: string;
  userAgent?: string;
  viewport?: { width: number; height: number };
  featureFlags?: Record<string, boolean>;
}

/**
 * Determine the appropriate template based on context
 */
export function selectBookingTemplate(
  config: BookingTemplateConfig
): BookingTemplateSelection {
  const { viewport, userAgent, source } = config;

  // Mobile-first: use modal on larger screens, full page on mobile
  if (viewport && viewport.width < 768) {
    return {
      useModal: false,
      reason: "mobile_viewport"
    };
  }

  // Check user agent for mobile devices
  if (userAgent) {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    if (isMobile) {
      return {
        useModal: false,
        reason: "mobile_user_agent"
      };
    }
  }

  // Prefer modal for engaged users (coming from service pages)
  if (source && source.includes("/services/")) {
    return {
      useModal: true,
      size: "lg",
      reason: "service_page_engagement"
    };
  }

  // Default to modal for desktop users
  return {
    useModal: true,
    size: "md",
    reason: "default_desktop"
  };
}

/**
 * Template props factory for consistent configuration
 */
export interface BookingTemplateFactory {
  /** Create hub template props */
  createHubProps(config: BookingTemplateConfig): Partial<BookingHubTemplateProps>;
  
  /** Create modal template props */
  createModalProps(config: BookingTemplateConfig): Partial<BookingModalTemplateProps>;
}

export const bookingTemplateFactory: BookingTemplateFactory = {
  createHubProps(config) {
    return {
      meta: {
        title: config.service 
          ? `Book ${config.service.replace(/-/g, ' ')} Consultation`
          : "Book a Consultation",
        description: "Schedule your consultation with our experts",
        schemaType: "ContactPage",
      },
      features: {
        showHero: true,
        showBooking: true,
        showOptions: !!config.service,
        showFAQ: true,
        showCTA: true,
        showTrust: true,
        showBreadcrumbs: true,
      },
      layout: {
        containerSize: "normal",
        sectionSpacing: "comfortable",
        background: "solid",
        headerStyle: "default",
      },
      theme: {
        colorScheme: "light",
        radius: "md",
        scale: "md",
      },
      analytics: {
        context: "booking_hub",
        category: "booking",
        autoTrack: true,
        properties: {
          service: config.service,
          source: config.source,
          template: "hub",
        },
      },
    };
  },

  createModalProps(config) {
    return {
      size: "md",
      closeBehavior: {
        allowBackdropClose: true,
        allowEscClose: true,
        showCloseButton: true,
        confirmUnsavedChanges: true,
      },
      animation: {
        variant: "fade",
        duration: 200,
        easing: "ease-out",
        respectReducedMotion: true,
      },
      backdrop: {
        opacity: 0.5,
        blur: 4,
      },
      header: {
        title: config.service 
          ? `Book ${config.service.replace(/-/g, ' ')}`
          : "Schedule your session",
        variant: "default",
        showProgress: false,
      },
      footer: {
        variant: "minimal",
        showBranding: true,
      },
      analytics: {
        context: "booking_modal",
        autoTrack: true,
        properties: {
          service: config.service,
          source: config.source,
          template: "modal",
        },
      },
      accessibility: {
        focusTrap: true,
        ariaLabel: "Booking form",
      },
    };
  },
};

// ============================================================================
// Template Validation Utilities
// ============================================================================

/**
 * Validate hub template props
 */
export function validateHubTemplateProps(
  props: BookingHubTemplateProps
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required props
  if (!props.booking) {
    errors.push("booking prop is required");
  }

  // Feature consistency
  if (props.features?.showHero && !props.hero) {
    errors.push("hero prop required when showHero is enabled");
  }

  if (props.features?.showOptions && !props.options) {
    errors.push("options prop required when showOptions is enabled");
  }

  if (props.features?.showFAQ && !props.faq) {
    errors.push("faq prop required when showFAQ is enabled");
  }

  // Analytics validation
  if (props.analytics?.autoTrack && !props.analytics.context) {
    errors.push("analytics.context required when autoTrack is enabled");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate modal template props
 */
export function validateModalTemplateProps(
  props: BookingModalTemplateProps
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required props
  if (!props.booking) {
    errors.push("booking prop is required");
  }

  if (!props.onClose) {
    errors.push("onClose handler is required");
  }

  // Size validation
  const validSizes = ["sm", "md", "lg", "xl", "full"];
  if (props.size && !validSizes.includes(props.size)) {
    errors.push(`size must be one of: ${validSizes.join(", ")}`);
  }

  // Animation validation
  const validAnimations = ["fade", "slide", "scale", "none"];
  if (props.animation?.variant && !validAnimations.includes(props.animation.variant)) {
    errors.push(`animation.variant must be one of: ${validAnimations.join(", ")}`);
  }

  // Accessibility validation
  if (props.accessibility?.focusTrap && !props.accessibility.ariaLabel && !props.accessibility.ariaLabelledBy) {
    errors.push("ariaLabel or ariaLabelledBy required when focusTrap is enabled");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Template Hooks (type definitions for implementation elsewhere)
// ============================================================================

/**
 * Hook for managing booking hub template state
 * Implementation should be in separate hook file
 */
export interface UseBookingHubTemplate {
  (config: UseBookingHubTemplateConfig): UseBookingHubTemplateReturn;
}

/**
 * Hook for managing booking modal template state
 * Implementation should be in separate hook file
 */
export interface UseBookingModalTemplate {
  (config: UseBookingModalConfig): UseBookingModalReturn;
}

// ============================================================================
// Default Exports (for consistency with other domains)
// ============================================================================

/**
 * Default template selection - chooses hub or modal based on context
 */
export const BookingTemplate = {
  Hub: BookingHubTemplate,
  Modal: BookingModalTemplate,
  select: selectBookingTemplate,
  factory: bookingTemplateFactory,
  validateHub: validateHubTemplateProps,
  validateModal: validateModalTemplateProps,
};

// Legacy exports for backward compatibility
export const BookingHub = BookingHubTemplate;
export const BookingModal = BookingModalTemplate;

// ============================================================================
// Template Constants
// ============================================================================

/**
 * Template configuration constants
 */
export const BOOKING_TEMPLATE_CONSTANTS = {
  // Size breakpoints (px)
  BREAKPOINTS: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
  },
  
  // Animation durations (ms)
  ANIMATIONS: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  
  // Z-index layers
  Z_INDEX: {
    modal: 1000,
    portal: 9999,
    focus: 10000,
  },
  
  // Default analytics contexts
  ANALYTICS: {
    hub: "booking_hub",
    modal: "booking_modal",
  },
} as const;

/**
 * Template feature flags
 */
export const BOOKING_TEMPLATE_FEATURES = {
  // Core features
  HERO_SECTION: "hero_section",
  OPTIONS_SECTION: "options_section", 
  FAQ_SECTION: "faq_section",
  TRUST_SECTION: "trust_section",
  CTA_SECTION: "cta_section",
  
  // Modal features
  FOCUS_TRAP: "focus_trap",
  BACKDROP_CLOSE: "backdrop_close",
  UNSAVED_WARNING: "unsaved_warning",
  PROGRESS_INDICATOR: "progress_indicator",
  
  // Analytics features
  AUTO_TRACKING: "auto_tracking",
  SECTION_VISIBILITY: "section_visibility",
  INTERACTION_TRACKING: "interaction_tracking",
} as const;