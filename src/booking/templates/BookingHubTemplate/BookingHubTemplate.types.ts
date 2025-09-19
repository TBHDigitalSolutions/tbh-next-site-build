// src/booking/templates/BookingHubTemplate/BookingHubTemplate.types.ts
// Types for BookingHubTemplate - the main booking page template

import type { ReactNode } from "react";
import type { CanonicalService } from "@/shared/services/types";
import type { BookingSectionProps } from "@/booking/sections/BookingSection";
import type { BookingHeroSectionProps } from "@/booking/sections/BookingHeroSection";
import type { BookingOptionsSectionProps } from "@/booking/sections/BookingOptionsSection";
import type { BookingFAQSectionProps } from "@/booking/sections/BookingFAQSection";

// ============================================================================
// Template-level Props
// ============================================================================

/**
 * Page metadata for SEO and social sharing
 */
export interface BookingHubMeta {
  /** Page title for document head */
  title?: string;
  /** Page subtitle/description for SEO */
  subtitle?: string;
  /** Meta description */
  description?: string;
  /** Keywords for SEO */
  keywords?: string[];
  /** Canonical URL */
  canonical?: string;
  /** Open Graph image */
  ogImage?: string;
  /** Schema.org structured data type */
  schemaType?: "WebPage" | "ContactPage" | "Service";
}

/**
 * Feature flags for showing/hiding template sections
 */
export interface BookingHubFeatures {
  /** Show the hero section */
  showHero?: boolean;
  /** Show the main booking section */
  showBooking?: boolean;
  /** Show the options/packages section */
  showOptions?: boolean;
  /** Show the FAQ section */
  showFAQ?: boolean;
  /** Show the CTA section */
  showCTA?: boolean;
  /** Show trust badges/testimonials */
  showTrust?: boolean;
  /** Show breadcrumb navigation */
  showBreadcrumbs?: boolean;
}

/**
 * Layout configuration options
 */
export interface BookingHubLayout {
  /** Container width preset */
  containerSize?: "narrow" | "normal" | "wide";
  /** Spacing between sections */
  sectionSpacing?: "compact" | "comfortable" | "spacious";
  /** Background style */
  background?: "solid" | "gradient" | "pattern";
  /** Header style */
  headerStyle?: "minimal" | "default" | "prominent";
}

/**
 * Theme and styling options
 */
export interface BookingHubTheme {
  /** Primary color scheme */
  colorScheme?: "light" | "dark" | "auto";
  /** Accent color */
  accentColor?: string;
  /** Border radius preset */
  radius?: "none" | "sm" | "md" | "lg" | "xl";
  /** Typography scale */
  scale?: "sm" | "md" | "lg";
}

/**
 * Analytics configuration
 */
export interface BookingHubAnalytics {
  /** Analytics context identifier */
  context?: string;
  /** Page category for analytics */
  category?: string;
  /** Custom tracking properties */
  properties?: Record<string, unknown>;
  /** Enable automatic page view tracking */
  autoTrack?: boolean;
  /** Custom event handlers */
  onPageView?: (props: Record<string, unknown>) => void;
  onSectionView?: (section: string, props: Record<string, unknown>) => void;
  onCtaClick?: (cta: string, props: Record<string, unknown>) => void;
}

/**
 * Trust and credibility elements
 */
export interface BookingHubTrust {
  /** Security badges */
  securityBadges?: Array<{
    label: string;
    icon?: ReactNode;
    description?: string;
  }>;
  /** Certification badges */
  certifications?: Array<{
    label: string;
    icon?: ReactNode;
    description?: string;
  }>;
  /** Social proof elements */
  socialProof?: Array<{
    type: "testimonial" | "review" | "stat" | "client";
    content: string;
    author?: string;
    rating?: number;
    company?: string;
  }>;
}

/**
 * CTA (Call to Action) configuration
 */
export interface BookingHubCTA {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Primary CTA button */
  primary?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "outline";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    loading?: boolean;
  };
  /** Secondary CTA buttons */
  secondary?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
  }>;
  /** Background style for CTA section */
  background?: "none" | "subtle" | "strong" | "brand";
}

/**
 * Breadcrumb navigation
 */
export interface BookingHubBreadcrumb {
  label: string;
  href?: string;
  current?: boolean;
}

/**
 * Error and loading states
 */
export interface BookingHubState {
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Empty state message */
  empty?: string;
  /** Custom loading component */
  LoadingComponent?: () => ReactNode;
  /** Custom error component */
  ErrorComponent?: (props: { error: string; retry?: () => void }) => ReactNode;
  /** Custom empty component */
  EmptyComponent?: () => ReactNode;
}

// ============================================================================
// Main Template Props
// ============================================================================

/**
 * Props for BookingHubTemplate - the main booking page template
 */
export interface BookingHubTemplateProps {
  /** Page metadata */
  meta?: BookingHubMeta;

  /** Feature flags for sections */
  features?: BookingHubFeatures;

  /** Layout configuration */
  layout?: BookingHubLayout;

  /** Theme and styling */
  theme?: BookingHubTheme;

  /** Analytics configuration */
  analytics?: BookingHubAnalytics;

  /** Hero section props */
  hero?: BookingHeroSectionProps;

  /** Main booking section props (required) */
  booking: BookingSectionProps;

  /** Options/packages section props */
  options?: BookingOptionsSectionProps;

  /** FAQ section props */
  faq?: BookingFAQSectionProps;

  /** Trust and credibility elements */
  trust?: BookingHubTrust;

  /** CTA section configuration */
  cta?: BookingHubCTA;

  /** Breadcrumb navigation */
  breadcrumbs?: BookingHubBreadcrumb[];

  /** Template state */
  state?: BookingHubState;

  /** Service context (helps with defaults and configuration) */
  service?: CanonicalService;

  /** Additional CSS classes */
  className?: string;

  /** Custom render overrides */
  renderHeader?: () => ReactNode;
  renderFooter?: () => ReactNode;
  renderSidebar?: () => ReactNode;

  /** Test ID for QA */
  "data-testid"?: string;

  /** Children for custom content injection */
  children?: ReactNode;
}

// ============================================================================
// Internal Types
// ============================================================================

/**
 * Internal template state
 */
export interface BookingHubTemplateState {
  /** Currently visible sections */
  visibleSections: Set<string>;
  /** Client-side hydration state */
  isClient: boolean;
  /** Current scroll position for sticky elements */
  scrollY: number;
  /** Mobile menu state */
  mobileMenuOpen: boolean;
}

/**
 * Section configuration for internal rendering
 */
export interface BookingHubSection {
  /** Section identifier */
  id: string;
  /** Display name */
  name: string;
  /** Whether section is enabled */
  enabled: boolean;
  /** Section priority/order */
  priority: number;
  /** Section component props */
  props: Record<string, unknown>;
  /** Custom render function */
  render?: () => ReactNode;
}

/**
 * Template context passed to child sections
 */
export interface BookingHubContext {
  /** Current service */
  service?: CanonicalService;
  /** Analytics context */
  analytics: BookingHubAnalytics;
  /** Theme configuration */
  theme: BookingHubTheme;
  /** Layout configuration */
  layout: BookingHubLayout;
  /** Feature flags */
  features: BookingHubFeatures;
}

// ============================================================================
// Validation and Helper Types
// ============================================================================

/**
 * Template validation result
 */
export interface BookingHubValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Analytics event payloads
 */
export interface BookingHubAnalyticsEvents {
  page_view: {
    page: string;
    service?: CanonicalService;
    features: string[];
    timestamp: number;
  };
  section_view: {
    section: string;
    service?: CanonicalService;
    timestamp: number;
  };
  cta_click: {
    cta: string;
    location: string;
    service?: CanonicalService;
    timestamp: number;
  };
  booking_start: {
    variant: string;
    service?: CanonicalService;
    source: string;
    timestamp: number;
  };
  error: {
    type: string;
    message: string;
    section?: string;
    timestamp: number;
  };
}

/**
 * SEO and structured data helpers
 */
export interface BookingHubSEO {
  /** Generate structured data for the page */
  structuredData: Record<string, unknown>;
  /** Generate meta tags */
  metaTags: Record<string, string>;
  /** Generate Open Graph tags */
  openGraph: Record<string, string>;
  /** Generate Twitter Card tags */
  twitterCard: Record<string, string>;
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Hook for managing template state
 */
export interface UseBookingHubTemplateReturn {
  /** Current template state */
  state: BookingHubTemplateState;
  /** Actions to update state */
  actions: {
    toggleMobileMenu: () => void;
    updateScrollY: (y: number) => void;
    markSectionVisible: (sectionId: string) => void;
    markSectionHidden: (sectionId: string) => void;
  };
  /** Computed values */
  computed: {
    enabledSections: BookingHubSection[];
    sortedSections: BookingHubSection[];
    contextValue: BookingHubContext;
  };
}

/**
 * Hook configuration
 */
export interface UseBookingHubTemplateConfig {
  /** Template props */
  props: BookingHubTemplateProps;
  /** Enable intersection observer for section visibility */
  trackVisibility?: boolean;
  /** Enable scroll tracking */
  trackScroll?: boolean;
  /** Analytics integration */
  analytics?: BookingHubAnalytics;
}