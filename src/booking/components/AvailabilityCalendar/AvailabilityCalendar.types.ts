// src/booking/components/AvailabilityCalendar/AvailabilityCalendar.types.ts
// Production-ready types for the AvailabilityCalendar component

import type { ComponentType } from "react";
import type { CanonicalService, BookingProvider } from "../../lib/types";

/* ------------------------------------------------------------------ *
 * Core domain types
 * ------------------------------------------------------------------ */

// Time slot representation
export interface TimeSlot {
  /** ISO datetime string for the slot start time (UTC recommended) */
  startTime: string;
  /** ISO datetime string for the slot end time (UTC recommended) */
  endTime: string;
  /** Duration in minutes */
  duration: number;
  /** Whether this slot is available for booking */
  available: boolean;
  /** Optional provider-specific identifier for this slot */
  providerId?: string;
  /** Meeting type this slot is for (e.g., "intro_call", "demo") */
  meetingType?: string;
  /** Display timezone for the slot (IANA TZ, e.g., "America/New_York") */
  timezone: string;
  /** Optional pricing information attached to this slot */
  price?: {
    amount: number;
    currency: string; // ISO 4217 code, e.g., "USD"
    /** Optional preformatted display (fallback for unknown currency rules) */
    display?: string;
  };
  /**
   * Arbitrary provider-specific data for richer UIs (not rendered by default).
   * Keep minimal to avoid tight coupling.
   */
  providerData?: ProviderSlotData;
}

// Provider-specific slot data (lightweight, optional)
export interface ProviderSlotData {
  cal?: {
    eventTypeId: string;
    bookingUrl: string;
  };
  calendly?: {
    eventUuid: string;
    bookingUrl: string;
  };
  acuity?: {
    appointmentTypeId?: string;
    bookingUrl?: string;
  };
  custom?: Record<string, unknown>;
}

// Day availability data (server response unit)
export interface DayAvailability {
  /** Date in YYYY-MM-DD format (local to calendar’s canonical TZ) */
  date: string;
  /** Whether any slots are available on this day */
  hasAvailability: boolean;
  /** Array of available (or displayable) time slots for this day */
  slots: TimeSlot[];
  /** Optional day-level metadata */
  metadata?: {
    /** 0-6, Sunday = 0 (local to canonical TZ) */
    dayOfWeek: number;
    isWeekend: boolean;
    /** Basic “is holiday” flag; sophisticated logic should live server-side */
    isHoliday: boolean;
    specialNote?: string;
  };
}

/* ------------------------------------------------------------------ *
 * View & formatting
 * ------------------------------------------------------------------ */

export type CalendarView = "month" | "week" | "day";
export type TimeFormat = "12h" | "24h";

export type LoadingState = "idle" | "loading" | "error" | "success";

/**
 * Selection mode:
 * - single: one slot at a time
 * - multiple: arbitrary set of slots, constrained by min/max
 * - range: contiguous slots within a single day (component implements same-day range)
 */
export type SelectionMode = "single" | "range" | "multiple";

/** Optional policy hints for range selection */
export interface RangeSelectionPolicy {
  /** Enforce same-day range (component currently enforces this) */
  sameDayOnly?: boolean;
  /** Whether range must be contiguous across available slots */
  contiguous?: boolean;
}

/* ------------------------------------------------------------------ *
 * Configuration
 * ------------------------------------------------------------------ */

export interface BusinessHours {
  /** "09:00" */
  start: string;
  /** "17:00" */
  end: string;
  /** IANA timezone, e.g., "America/New_York" */
  timezone: string;
}

export interface CalendarConfig {
  /** Service this calendar is for (domain canonical identifier) */
  service: CanonicalService;
  /** Calendar/booking provider in use */
  provider: BookingProvider;
  /** Optional meeting type filter (provider- or domain-specific) */
  meetingType?: string;
  /** Minimum advance booking time in hours */
  minAdvanceHours?: number;
  /** Maximum future booking window in days */
  maxFutureDays?: number;
  /** Allowed days of the week (0-6, Sunday = 0); omit for all days */
  availableDays?: number[];
  /** Business hours constraint (used for display/validation only) */
  businessHours?: BusinessHours;
}

/* ------------------------------------------------------------------ *
 * Component props (public API)
 * ------------------------------------------------------------------ */

export interface AvailabilityCalendarProps {
  /** Calendar configuration */
  config: CalendarConfig;

  /** Current/initial view mode */
  view?: CalendarView;

  /** Selection behavior */
  selectionMode?: SelectionMode;
  /** Range policy hints (applies if selectionMode === "range") */
  rangePolicy?: RangeSelectionPolicy;

  /** Currently selected slots (controlled) */
  selectedSlots?: TimeSlot[];

  /** User's timezone for display; defaults to auto-detected */
  userTimezone?: string;

  /** Time format preference */
  timeFormat?: TimeFormat;

  /** Whether to show time zone info below the calendar */
  showTimezone?: boolean;

  /** Whether to show pricing on slots */
  showPricing?: boolean;

  /** Custom loading component */
  loadingComponent?: ComponentType;

  /** Custom error component */
  errorComponent?: ComponentType<{ error: string; onRetry: () => void }>;

  /** Custom empty state component */
  emptyStateComponent?: ComponentType;

  /** Callback when slots are selected (always sends the fresh selection array) */
  onSlotSelect?: (slots: TimeSlot[]) => void;

  /** Callback when view changes */
  onViewChange?: (view: CalendarView) => void;

  /** Callback when the visible date range changes (YYYY-MM-DD) */
  onDateRangeChange?: (startDate: string, endDate: string) => void;

  /**
   * Callback to load availability for the provided date range.
   * You should return data for all dates between startDate and endDate (inclusive).
   */
  onLoadAvailability?: AvailabilityFetcher;

  /** Extra CSS class for the root container */
  className?: string;

  /** Disable selection of past dates (default: true) */
  disablePastDates?: boolean;

  /** Disable selection of weekends (default: false) */
  disableWeekends?: boolean;

  /** Specific dates to disable (YYYY-MM-DD) */
  disabledDates?: string[];

  /** Minimum slots required for selection (multiple/range) */
  minSlots?: number;

  /** Maximum slots allowed for selection (multiple/range) */
  maxSlots?: number;

  /**
   * Analytics context for tracking (passed into metrics helpers).
   * Example: "booking-page" or "widget-home"
   */
  analyticsContext?: string;
}

/* ------------------------------------------------------------------ *
 * Internal state (private to component, exported for tests)
 * ------------------------------------------------------------------ */

export interface CalendarState {
  /** Current month/week/day being viewed */
  currentDate: Date;
  /** Calendar view mode */
  view: CalendarView;
  /** Loading state for availability */
  loading: LoadingState;
  /** Error message when loading fails */
  error?: string;
  /** Cache of availability keyed by YYYY-MM-DD */
  availabilityCache: Map<string, DayAvailability>;
  /** Currently selected slots (uncontrolled internal mirror) */
  selectedSlots: TimeSlot[];
  /** Most recently loaded date range (inclusive) */
  loadedRange?: {
    start: string;
    end: string;
  };
}

/* ------------------------------------------------------------------ *
 * Data loading contracts
 * ------------------------------------------------------------------ */

export interface AvailabilityFetchOptions {
  /** AbortSignal for cancelling in-flight requests */
  signal?: AbortSignal;
  /**
   * Optional provider/auth context. Avoid coupling: pass only if your loader needs it.
   * e.g., { orgId, userId, token } or custom headers map.
   */
  context?: Record<string, unknown>;
}

/** Optional metadata your API can return to inform client behavior */
export interface AvailabilityServerHints {
  /** Canonical timezone used when calculating days (IANA TZ) */
  canonicalTimezone?: string;
  /** When the server suggests the client refresh (ms) */
  ttlMs?: number;
  /** Pagination or windowing hints (if applicable) */
  paging?: {
    hasMore?: boolean;
    nextCursor?: string;
  };
}

/** Result shape for availability loader; plain array also accepted for convenience */
export interface AvailabilityResult {
  days: DayAvailability[];
  /** Optional server hints; the component ignores it but you can use it in your app */
  hints?: AvailabilityServerHints;
}

/**
 * Fetcher function type. You may return either:
 * - DayAvailability[] (legacy/compact), or
 * - AvailabilityResult (richer, with server hints).
 *
 * The component will consume only the array of days; hints are for app-level use.
 */
export type AvailabilityFetcher = (
  startDate: string,
  endDate: string,
  config: CalendarConfig,
  options?: AvailabilityFetchOptions
) => Promise<DayAvailability[] | AvailabilityResult>;

/* ------------------------------------------------------------------ *
 * Imperative helpers (useful for tests or external controllers)
 * ------------------------------------------------------------------ */

export interface CalendarNavigation {
  goToToday: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToDate: (date: Date) => void;
  changeView: (view: CalendarView) => void;
}

export interface SlotSelection {
  selectSlot: (slot: TimeSlot) => void;
  deselectSlot: (slot: TimeSlot) => void;
  clearSelection: () => void;
  isSlotSelected: (slot: TimeSlot) => boolean;
  canSelectSlot: (slot: TimeSlot) => boolean;
}

/* ------------------------------------------------------------------ *
 * Formatting & utilities (optional adapter interfaces)
 * ------------------------------------------------------------------ */

export interface DateUtilities {
  /** Format arbitrary date/time value for display */
  formatDate: (date: Date | string, format?: string) => string;
  /** Format a time string in the user’s preferred format */
  formatTime: (time: string, format: TimeFormat) => string;
  /** Check if a slot is within a given inclusive date range (YYYY-MM-DD) */
  isSlotInRange: (slot: TimeSlot, startDate: string, endDate: string) => boolean;
  /** Get 7 dates for the provided date’s week */
  getWeekDates: (date: Date) => Date[];
  /** Get all grid dates for the provided date’s month */
  getMonthDates: (date: Date) => Date[];
  /** Convert a time between timezones, return ISO */
  convertTimezone: (time: string, fromTz: string, toTz: string) => string;
}

/* ------------------------------------------------------------------ *
 * Theming (non-blocking, CSS-module friendly)
 * ------------------------------------------------------------------ */

export interface CalendarTheme {
  /** Brand colors (CSS color strings) */
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverColor?: string;
  selectedColor?: string;
  disabledColor?: string;
  /**
   * Optional CSS variables hook; if provided, the component may attach
   * a style attribute with these variables on the root container.
   */
  cssVars?: Record<string, string>;
}

/* ------------------------------------------------------------------ *
 * Export aliases (for external composition)
 * ------------------------------------------------------------------ */

export type { TimeSlot as AvailabilityTimeSlot, DayAvailability as AvailabilityDay };
