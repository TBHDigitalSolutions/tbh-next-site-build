// src/booking/sections/BookingOptionsSection/BookingOptionsSection.types.ts
// Production-ready types for the Booking Options section
// -----------------------------------------------------------------------------
// This section surfaces one or more "booking options" (e.g., meeting types,
// durations, or packaged services) and funnels the user into a scheduler flow.
//
// Conventions:
// - Strongly typed option objects that are provider-agnostic but allow
//   provider-specific metadata via `providerData`.
// - First-class accessibility & analytics hooks.
// - Safe defaults and optional theming without enforcing any design system.
// -----------------------------------------------------------------------------

import type { ReactNode } from "react";
import type { CanonicalService, BookingProvider } from "@/booking/lib/types";
import type { MeetingTypeKey } from "@/booking/components/MeetingTypeSelector/MeetingTypeSelector.types";

// ---------------------------------------
// Shared primitives
// ---------------------------------------

export type CurrencyCode =
  | "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "NZD" | "JPY" | "CNY" | "INR" | string;

export interface Price {
  amount: number;            // e.g. 150
  currency: CurrencyCode;    // e.g. "USD"
  /** Optional human-readable price (overrides default formatting) */
  formatted?: string;        // e.g. "$149 (intro price)"
  /** Optional frequency for subscriptions (display only) */
  cadence?: "one_time" | "per_hour" | "per_month" | "per_year";
  /** Optional strikethrough/original reference */
  compareAt?: {
    amount: number;
    currency: CurrencyCode;
    formatted?: string;
  };
}

export interface Badge {
  label: string;             // e.g. "Most Popular"
  tone?: "brand" | "success" | "info" | "warning" | "danger" | "neutral";
}

export interface Tag {
  label: string;             // e.g. "Remote", "30 min"
  tone?: "brand" | "success" | "info" | "warning" | "neutral";
}

// ---------------------------------------
// Option model
// ---------------------------------------

/**
 * Provider-specific metadata (optional).
 * Keep flexible to support Cal.com, Calendly, Acuity, or custom schedulers.
 */
export interface ProviderOptionData {
  cal?: {
    eventTypeId: string;
    bookingUrl?: string;
  };
  calendly?: {
    eventUuid: string;
    bookingUrl?: string;
  };
  acuity?: {
    appointmentTypeId: string | number;
    bookingUrl?: string;
  };
  custom?: Record<string, unknown>;
}

/** Action configuration for each option card/tile */
export interface OptionActions {
  /** Primary CTA: either href (link) or onClick (callback) is required */
  primary?: {
    label: string;
    href?: string;
    onClick?: (optionId: string) => void;
    /** Optional analytics name override */
    trackName?: string;
    /** Disable the button and show a tooltip reason if present */
    disabledReason?: string;
  };
  /** Secondary actions (e.g., "Learn more") */
  secondary?: Array<{
    label: string;
    href?: string;
    onClick?: (optionId: string) => void;
    trackName?: string;
  }>;
}

/** A single bookable option shown in the section */
export interface BookingOption {
  /** Stable unique id (used for selection state) */
  id: string;
  /** Canonical domain service this option belongs to */
  service: CanonicalService;
  /** Downstream booking provider powering this option */
  provider: BookingProvider;

  /** Optional mapping to a meeting type key used elsewhere in the app */
  meetingTypeKey?: MeetingTypeKey;

  /** Display content */
  title: string;                         // e.g. "Strategy Call (30 min)"
  subtitle?: string;                     // e.g. "Great for quick scoping"
  description?: string;                  // richer supporting text
  /** Optional icon or media rendered by the UI (kept as ReactNode for flexibility) */
  media?: ReactNode;

  /** UX affordances */
  badges?: Badge[];
  tags?: Tag[];
  ribbon?: string;                       // top-left "Most Popular" ribbon text

  /** Commercial info */
  durationMinutes?: number;              // e.g. 30
  price?: Price;

  /** Availability hints (display only; real availability comes from calendar) */
  availabilityHint?: string;             // e.g. "Next slot: Today 2:30 PM"
  hasNearTermAvailability?: boolean;

  /** Interactivity */
  disabled?: boolean;
  disabledReason?: string;

  /** Actions for this card/tile */
  actions?: OptionActions;

  /** Provider-specific data */
  providerData?: ProviderOptionData;

  /** Arbitrary metadata consumers may need */
  meta?: Record<string, unknown>;
}

// ---------------------------------------
// Layout & behavior
// ---------------------------------------

export type OptionsLayout =
  | "grid"        // tiled cards, responsive columns
  | "list"        // vertical list rows
  | "carousel";   // horizontally scrollable cards (mobile-first)

export interface OptionsLayoutConfig {
  layout?: OptionsLayout;
  /** Grid: number of columns at typical breakpoints (min 1, max 4 recommended) */
  columns?: {
    base?: 1 | 2;
    md?: 1 | 2 | 3;
    lg?: 2 | 3 | 4;
  };
  /** Optional max visible items before a "Show more" control (list or grid) */
  maxVisible?: number;
  /** Tight/comfortable/loose vertical rhythm */
  density?: "compact" | "comfortable" | "spacious";
  /** If carousel: show arrows/dots and item width hint */
  carousel?: {
    showArrows?: boolean;
    showDots?: boolean;
    snap?: "start" | "center" | "end";
    itemMinWidthPx?: number; // e.g. 260
  };
}

// ---------------------------------------
// Selection
// ---------------------------------------

export type OptionSelectionMode = "none" | "single" | "multiple";

export interface SelectionState {
  /** Selected option ids (empty when mode is 'none') */
  selectedIds: string[];
  /** Limit for multiple select; ignored in single/none */
  maxSelect?: number;
  /** Prevent deselecting last item when minSelect=1 (optional) */
  minSelect?: number;
}

// ---------------------------------------
// Accessibility & theming
// ---------------------------------------

export interface OptionsA11y {
  /** Section heading for screen readers if no visible title */
  ariaLabel?: string;
  /** Describe the set role (listbox/grid) when selection is enabled */
  roleHint?: "list" | "listbox" | "grid" | "region";
  /** Pass-through attributes for testing/accessibility */
  attributes?: Record<string, string>;
}

export interface OptionsTheme {
  /** Token-like overrides (kept generic so the lib is CSS/DesignSystem agnostic) */
  radius?: "sm" | "md" | "lg" | "xl";
  emphasis?: "subtle" | "elevated" | "outlined";
  tone?: "brand" | "neutral";
}

// ---------------------------------------
// Loading / error states
// ---------------------------------------

export interface OptionsLoadingState {
  /** Show a skeleton while options are fetching */
  loading?: boolean;
  /** Number of skeleton cards to render */
  skeletonCount?: number;
  /** Error text to show instead of options */
  error?: string;
  /** Retry callback (e.g., refetch list) */
  onRetry?: () => void;
}

// ---------------------------------------
// Analytics
// ---------------------------------------

export interface OptionsAnalytics {
  /** Analytics context (e.g., "booking-options-section") */
  context?: string;
  /** Called for interactions not covered by `onSelect` or button handlers */
  onTrackEvent?: (event: string, props?: Record<string, unknown>) => void;
}

// ---------------------------------------
// Section props (public)
// ---------------------------------------

export interface BookingOptionsSectionProps {
  /** Section heading/subheading (optional if using a custom header) */
  title?: string;
  subtitle?: string;

  /** Options to render */
  options: BookingOption[];

  /** Selection behavior */
  selectionMode?: OptionSelectionMode; // default: "none"
  selection?: SelectionState;

  /** Current service/provider context (helps downstream components) */
  service?: CanonicalService;
  provider?: BookingProvider;

  /** Layout & presentation */
  layout?: OptionsLayoutConfig;
  theme?: OptionsTheme;

  /** Accessibility helpers */
  a11y?: OptionsA11y;

  /** Loading / error handling */
  state?: OptionsLoadingState;

  /** Section-level actions (e.g., a global CTA above/below the options) */
  sectionActions?: {
    primary?: {
      label: string;
      href?: string;
      onClick?: () => void;
      trackName?: string;
      disabledReason?: string;
    };
    secondary?: Array<{
      label: string;
      href?: string;
      onClick?: () => void;
      trackName?: string;
    }>;
  };

  /** Event handlers */
  onSelect?: (selectedIds: string[], lastChangedId?: string) => void;
  onOptionPrimaryAction?: (optionId: string) => void;
  onOptionSecondaryAction?: (optionId: string, index: number) => void;

  /** Analytics */
  analytics?: OptionsAnalytics;

  /** CSS className passthrough */
  className?: string;

  /** Render overrides (advanced) */
  renderOptionHeader?: (option: BookingOption) => ReactNode;     // e.g., custom title row
  renderOptionFooter?: (option: BookingOption) => ReactNode;     // e.g., custom badges/footer
  renderEmptyState?: () => ReactNode;                            // shown when options = []

  /** Test ID for QA */
  "data-testid"?: string;
}

// ---------------------------------------
// Internal types (for component implementation)
// ---------------------------------------

export interface BookingOptionsSectionState {
  internalSelectedIds: string[];
  expandedIds?: Set<string>;        // if the UI supports expand/collapse per option
  isClient?: boolean;               // SSR safety
}

/** Derived helpers for memoization inside the component */
export interface BookingOptionsDerived {
  canSelectMore: boolean;
  isSelected: (id: string) => boolean;
  selectToggle: (id: string) => string[]; // returns next selected ids
}

// ---------------------------------------
// Hook types
// ---------------------------------------

export interface UseBookingOptionsReturn {
  selectedIds: string[];
  canSelectMore: boolean;
  isSelected: (id: string) => boolean;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  handlePrimaryAction: (optionId: string) => void;
  handleSecondaryAction: (optionId: string, index: number) => void;
}

export interface UseBookingOptionsConfig {
  options: BookingOption[];
  selectionMode: OptionSelectionMode;
  initialSelection?: string[];
  maxSelect?: number;
  minSelect?: number;
  onSelect?: (selectedIds: string[], lastChangedId?: string) => void;
  onPrimaryAction?: (optionId: string) => void;
  onSecondaryAction?: (optionId: string, index: number) => void;
  analytics?: OptionsAnalytics;
}