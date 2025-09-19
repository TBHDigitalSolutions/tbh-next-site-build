// src/booking/sections/index.ts
// Main barrel export for all booking sections

// ============================================================================
// Section Components
// ============================================================================

// BookingSection - Main orchestrator
export { 
  default as BookingSection,
  BookingSection as BookingSectionOrchestrator 
} from "./BookingSection";

// BookingHeroSection - Hero banner with CTAs
export { 
  default as BookingHeroSection,
  BookingHeroSection as BookingHero
} from "./BookingHeroSection";

// BookingOptionsSection - Service/package options display
export { 
  default as BookingOptionsSection,
  BookingOptionsSection as BookingOptions
} from "./BookingOptionsSection";

// BookingFAQSection - Frequently asked questions
export { 
  default as BookingFAQSection,
  BookingFAQSection as BookingFAQ
} from "./BookingFAQSection";

// ============================================================================
// BookingSection (Orchestrator) Types
// ============================================================================

export type {
  BookingSectionProps,
  BookingResult,
  BookingError,
  BookingStep,
  BookingSectionState,
  BookingSectionWrapperProps,
  BookingVariantConfig,
  UseBookingSectionReturn,
  BookingAnalyticsContext,
} from "./BookingSection";

// ============================================================================
// BookingHeroSection Types
// ============================================================================

export type {
  BookingHeroSectionProps,
  BookingHeroMedia,
  BookingHeroCta,
  BookingTrustBadge,
  BookingHeroLayout,
  BookingHeroTheme,
  BookingHeroAnalytics,
  BookingHeroEyebrow,
  DefaultBookingHeroSectionProps,
} from "./BookingHeroSection";

// ============================================================================
// BookingOptionsSection Types
// ============================================================================

export type {
  BookingOptionsSectionProps,
  BookingOption,
  BookingOptionsSectionState,
  OptionsLayout,
  OptionsLayoutConfig,
  OptionSelectionMode,
  SelectionState,
  OptionsA11y,
  OptionsTheme,
  OptionsLoadingState,
  OptionsAnalytics,
  ProviderOptionData,
  OptionActions,
  Price,
  Badge,
  Tag,
  CurrencyCode,
  BookingOptionsDerived,
  UseBookingOptionsReturn,
  UseBookingOptionsConfig,
} from "./BookingOptionsSection";

// ============================================================================
// BookingFAQSection Types
// ============================================================================

export type {
  BookingFAQSectionProps,
  BookingFAQItem,
  BookingFAQDisplay,
  BookingFAQTheme,
  BookingFAQAnalyticsEvent,
  BookingFAQSort,
  BookingFAQSectionRef,
  BookingFAQSectionState,
  BookingFAQFilterResult,
  HelpfulnessVote,
} from "./BookingFAQSection";

// ============================================================================
// Section Registry and Utilities
// ============================================================================

import type { CanonicalService } from "@/shared/services/types";
import type { BookingVariant } from "@/booking/lib/types";

/**
 * Section configuration for building booking experiences
 */
export interface BookingSectionConfig {
  /** Which sections to include */
  sections: {
    hero?: boolean;
    options?: boolean;
    main?: boolean; // BookingSection orchestrator
    faq?: boolean;
  };
  /** Default variant for the main booking section */
  defaultVariant?: BookingVariant;
  /** Service context for configuration */
  service?: CanonicalService;
  /** Analytics context */
  analyticsContext?: string;
}

/**
 * Default section configurations by service
 */
export const DEFAULT_SECTION_CONFIGS: Record<CanonicalService, BookingSectionConfig> = {
  "web-development-services": {
    sections: { hero: true, options: true, main: true, faq: true },
    defaultVariant: "embed",
    analyticsContext: "web-dev-booking",
  },
  "video-production-services": {
    sections: { hero: true, options: true, main: true, faq: true },
    defaultVariant: "calendar",
    analyticsContext: "video-booking",
  },
  "seo-services": {
    sections: { hero: true, options: false, main: true, faq: true },
    defaultVariant: "form",
    analyticsContext: "seo-booking",
  },
  "marketing-services": {
    sections: { hero: true, options: true, main: true, faq: true },
    defaultVariant: "form",
    analyticsContext: "marketing-booking",
  },
  "lead-generation-services": {
    sections: { hero: true, options: true, main: true, faq: true },
    defaultVariant: "embed",
    analyticsContext: "lead-gen-booking",
  },
  "content-production-services": {
    sections: { hero: true, options: false, main: true, faq: true },
    defaultVariant: "calendar",
    analyticsContext: "content-booking",
  },
};

/**
 * Get section configuration for a service
 */
export function getSectionConfig(service: CanonicalService): BookingSectionConfig {
  return DEFAULT_SECTION_CONFIGS[service] || {
    sections: { hero: true, main: true, faq: false },
    defaultVariant: "form",
    analyticsContext: "default-booking",
  };
}

/**
 * Validate section configuration
 */
export function validateSectionConfig(
  config: BookingSectionConfig
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Must have at least the main booking section
  if (!config.sections.main) {
    errors.push("Section configuration must include the main booking section");
  }

  // Validate variant
  if (config.defaultVariant) {
    const validVariants: BookingVariant[] = ["embed", "form", "calendar"];
    if (!validVariants.includes(config.defaultVariant)) {
      errors.push(`Invalid default variant: ${config.defaultVariant}`);
    }
  }

  // Warnings for UX considerations
  if (config.sections.hero && config.sections.options && !config.sections.faq) {
    warnings.push("Consider including FAQ section when showing both hero and options");
  }

  if (!config.sections.hero && !config.sections.options) {
    warnings.push("Minimal configuration may provide poor user experience");
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Section component factory for dynamic rendering
 */
export interface SectionFactory {
  createHero: (props: BookingHeroSectionProps) => React.ReactNode;
  createOptions: (props: BookingOptionsSectionProps) => React.ReactNode;
  createMain: (props: BookingSectionProps) => React.ReactNode;
  createFAQ: (props: BookingFAQSectionProps) => React.ReactNode;
}

// ============================================================================
// Validation Utilities (re-exported for convenience)
// ============================================================================

export {
  validateBookingSectionProps,
  validateBookingResult,
  validateBookingError,
  validateVariantConfiguration,
  debugBookingSectionProps,
} from "./BookingSection/utils/bookingSectionValidator";

export {
  validateBookingHeroSectionProps,
  validateBookingHeroMedia,
  validateBookingHeroCta,
  debugBookingHeroProps,
  createMockBookingHeroProps,
} from "./BookingHeroSection/utils/bookingHeroValidator";

export {
  validateBookingOptionsSectionProps,
  validateBookingOption,
  validateProviderOptionData,
  validateSelectionState,
  debugBookingOptionsProps,
  createMockBookingOption,
} from "./BookingOptionsSection/utils/bookingOptionsValidator";

// ============================================================================
// Default Exports (for consistency with other domains)
// ============================================================================

/**
 * Main sections registry
 */
export const BookingSections = {
  Section: BookingSection,
  Hero: BookingHeroSection,
  Options: BookingOptionsSection,
  FAQ: BookingFAQSection,
  
  // Configuration utilities
  getConfig: getSectionConfig,
  validateConfig: validateSectionConfig,
  defaults: DEFAULT_SECTION_CONFIGS,
};

// Legacy compatibility exports
export const BookingHero = BookingHeroSection;
export const BookingOptions = BookingOptionsSection;
export const BookingFAQ = BookingFAQSection;

// ============================================================================
// Section Constants
// ============================================================================

/**
 * Section identifiers for consistent naming
 */
export const BOOKING_SECTION_IDS = {
  HERO: "booking-hero",
  OPTIONS: "booking-options", 
  MAIN: "booking-main",
  FAQ: "booking-faq",
} as const;

/**
 * Section analytics contexts
 */
export const BOOKING_SECTION_ANALYTICS = {
  HERO: "booking_hero_section",
  OPTIONS: "booking_options_section",
  MAIN: "booking_section",
  FAQ: "booking_faq_section",
} as const;

/**
 * Section loading priorities for performance optimization
 */
export const SECTION_LOAD_PRIORITIES = {
  HERO: 1, // Load first (above fold)
  MAIN: 2, // Load second (primary interaction)
  OPTIONS: 3, // Load third (secondary content)
  FAQ: 4, // Load last (supplementary content)
} as const;

export type BookingSectionId = keyof typeof BOOKING_SECTION_IDS;