// src/booking/components/MeetingTypeSelector/MeetingTypeSelector.types.ts
// Types for the MeetingTypeSelector component

import type { ComponentType, ReactNode } from "react";
import type { CanonicalService, BookingProvider } from "../../lib/types";

/**
 * A single Meeting Type option the user can pick from.
 */
export interface MeetingTypeOption {
  /** Stable unique id from provider or your API */
  id: string;
  /** Human-friendly name (e.g., "Intro Call") */
  title: string;
  /** Short description / value proposition */
  description?: string;
  /** Duration in minutes */
  duration: number;
  /** Optional price information */
  price?: {
    amount: number;
    currency: string;
  };
  /** Provider-specific glue/metadata */
  providerData?: {
    /** Generic provider eventTypeId (e.g., Cal.com / Calendly) */
    eventTypeId?: string;
    /** Direct booking URL for this meeting type (if available) */
    bookingUrl?: string;
    /** Arbitrary extension point for other providers */
    [key: string]: unknown;
  };
  /** Optional badge text (e.g., "Popular") */
  badge?: string;
  /** Optional availability hint shown beneath the card */
  availabilityNote?: string;
  /** Whether the option can be selected */
  enabled?: boolean;
}

/** Loading lifecycle for the selector */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Props for MeetingTypeSelector
 */
export interface MeetingTypeSelectorProps {
  /** Which service these meeting types belong to (used for analytics/filtering) */
  service: CanonicalService;
  /** Which booking provider will ultimately be used */
  provider: BookingProvider;

  /** Pre-fetched list of meeting type options (skip async loader if provided) */
  options?: MeetingTypeOption[];

  /**
   * Optional async loader to fetch options.
   * If provided and `options` is not set, the component will call this on mount.
   */
  onLoadOptions?: (args: {
    service: CanonicalService;
    provider: BookingProvider;
    timezone: string;
  }) => Promise<MeetingTypeOption[]>;

  /** Controlled selected id (if you want to control selection externally) */
  selectedId?: string | null;

  /** Uncontrolled default selected id (if you don't pass `selectedId`) */
  defaultSelectedId?: string | null;

  /** Called whenever a meeting type is selected */
  onSelect?: (option: MeetingTypeOption) => void;

  /** Disable the entire selector (UI + keyboard interactions) */
  disabled?: boolean;

  /** Hide price tokens in the UI */
  hidePrice?: boolean;

  /** Hide duration tokens in the UI */
  hideDuration?: boolean;

  /** Enable a filter/search input above the grid (defaults to true) */
  enableFilter?: boolean;

  /** Placeholder text for the filter/search input */
  filterPlaceholder?: string;

  /** Optional custom empty state node when no options match the filter */
  emptyState?: ReactNode;

  /** Optional custom error state node when loading fails */
  errorState?: ReactNode;

  /** Additional CSS class to apply to the root of the component */
  className?: string;

  /**
   * Analytics callback.
   * Fired for lifecycle and interaction events, e.g.:
   * - "meeting_types_loaded" { service, provider, count, context }
   * - "meeting_types_error"  { service, provider, error, context }
   * - "meeting_type_selected" { service, provider, option_id, title, duration, price_amount, price_currency, context }
   */
  onTrack?: (event: string, props?: Record<string, unknown>) => void;

  /** Analytics context string to help segment where this component is used */
  analyticsContext?: string;

  /** ARIA label for the listbox container (accessibility) */
  ariaLabel?: string;
}

/**
 * Optional headless render-prop surface
 * (Exposed in case you want to build a custom UI shell around the logic/state.)
 */
export interface MeetingTypeSelectorState {
  /** Flattened, post-filter list the UI should show */
  filtered: MeetingTypeOption[];
  /** Current loading phase */
  loading: LoadingState;
  /** Error message, if any */
  error?: string | null;
  /** Current filter query */
  filter: string;
  /** Setter for the filter query */
  setFilter: (q: string) => void;
  /** Currently selected id (controlled or uncontrolled) */
  selectedId: string | null | undefined;
  /** Select a given option programmatically */
  select: (option: MeetingTypeOption) => void;
  /** Whether the component is globally disabled */
  disabled: boolean;
}

/**
 * Optional component overrides if you later decide to expose them.
 * (Kept for future extensibility; not required by the default UI.)
 */
export interface MeetingTypeSelectorOverrides {
  /** Replace the option card entirely */
  OptionCard?: ComponentType<{ option: MeetingTypeOption; selected: boolean; onSelect: () => void; disabled?: boolean }>;
  /** Replace the filter input */
  FilterInput?: ComponentType<{ value: string; onChange: (v: string) => void; disabled?: boolean; placeholder?: string }>;
}

/**
 * Public export surface for consumers who want to import types from this module.
 */
export type {
  CanonicalService,
  BookingProvider,
};
