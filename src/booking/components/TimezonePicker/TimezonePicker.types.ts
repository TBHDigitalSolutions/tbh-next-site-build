// src/booking/components/TimezonePicker/TimezonePicker.types.ts
// Production-ready types for the TimezonePicker component
// ---------------------------------------------------------------------------

import type { PropsWithChildren } from "react";

/**
 * A valid IANA timezone identifier (e.g., "America/New_York", "UTC")
 */
export type IANATimezone = string;

/**
 * Strategy for grouping timezones in the UI.
 */
export type TimezoneGroupBy = "none" | "region" | "country" | "utcOffset";

/**
 * Strategy for sorting timezones in the UI.
 */
export type TimezoneSortBy =
  | "labelAsc"
  | "labelDesc"
  | "utcOffsetAsc"
  | "utcOffsetDesc"
  | "popularity"; // optional popularity scoring in dataSource

/**
 * A single timezone option rendered in the selector.
 */
export interface TimezoneOption {
  /** IANA timezone id: "America/Chicago" */
  id: IANATimezone;
  /** Short label displayed to users, e.g. "Chicago (CDT)" */
  label: string;
  /** Displayed secondary text, e.g. "UTC−05:00" */
  secondaryLabel?: string;
  /** Current absolute offset from UTC in minutes (includes DST if applicable) */
  offsetMinutes: number;
  /** Whether this timezone currently observes DST at this moment */
  isDST?: boolean;
  /** Region bucket inferred from id (e.g. "America", "Europe") */
  region?: string;
  /** ISO 3166-1 alpha-2 country code if known (e.g. "US") */
  countryCode?: string;
  /** Optional weighted popularity score for sorting (higher is more popular) */
  popularityScore?: number;
  /** Optional alias list that can improve search matching */
  aliases?: string[];
  /** Arbitrary provider metadata */
  meta?: Record<string, unknown>;
}

/**
 * A section of timezones when grouping is enabled.
 */
export interface TimezoneGroup {
  /** Group id (region name, country code, or "UTC±HH:MM") */
  id: string;
  /** Group label for UI */
  label: string;
  /** Members belonging to this group */
  options: TimezoneOption[];
}

/**
 * TimezonePicker loading state.
 */
export type TimezonePickerStatus = "idle" | "loading" | "error" | "ready";

/**
 * Data source contract to provide timezone options.
 * Implementations may return cached/static data or fetch from an API.
 */
export interface TimezoneDataSource {
  /**
   * Resolve a list of timezone options. Implementations should already include
   * current offsetMinutes and isDST if available.
   */
  load: () => Promise<TimezoneOption[]> | TimezoneOption[];

  /**
   * Optional hook to resolve a single timezone by id (used to hydrate
   * server-provided values or validate input).
   */
  getById?: (id: IANATimezone) => Promise<TimezoneOption | undefined> | TimezoneOption | undefined;
}

/**
 * Built-in filter options for search UX.
 */
export interface TimezoneFilterOptions {
  /** Enable client-side fuzzy search over id/label/aliases (default: true) */
  enableSearch?: boolean;
  /** Debounce (ms) before applying search input (default: 120) */
  searchDebounceMs?: number;
  /** Case-insensitive substring match when fuzzy is off (default: true) */
  caseInsensitive?: boolean;
  /** Whether to include alias fields in search (default: true) */
  includeAliases?: boolean;
  /** Whether to match country codes (e.g., "US") in search (default: true) */
  includeCountryCodes?: boolean;
}

/**
 * Accessibility props for the combobox/listbox experience.
 */
export interface TimezoneA11yProps {
  /** ARIA label for the root combobox */
  "aria-label"?: string;
  /** ARIA labelledby id */
  "aria-labelledby"?: string;
  /** ARIA describedby id */
  "aria-describedby"?: string;
}

/**
 * Telemetry callback shape for lightweight analytics.
 */
export type TimezoneTelemetry =
  | { event: "open" }
  | { event: "close" }
  | { event: "select"; option: TimezoneOption }
  | { event: "search"; query: string }
  | { event: "error"; error: string };

/**
 * Theme tokens (mapped to CSS variables in implementation).
 */
export interface TimezonePickerTheme {
  /** Primary brand color (fallback handled in CSS) */
  primaryColor?: string;
  /** High-contrast mode toggle */
  highContrast?: boolean;
  /** Border radius token (e.g., "6px", "0.5rem") */
  borderRadius?: string;
}

/**
 * Props for the TimezonePicker component.
 */
export interface TimezonePickerProps extends TimezoneA11yProps, PropsWithChildren {
  /** Controlled value: selected IANA timezone id */
  value?: IANATimezone;
  /** Uncontrolled default value */
  defaultValue?: IANATimezone;
  /** Fired whenever a timezone selection changes */
  onChange?: (timezone: IANATimezone, option?: TimezoneOption) => void;

  /** Optional id for the input/combobox */
  id?: string;
  /** Optional name for HTML forms */
  name?: string;

  /** Disable all interactions */
  disabled?: boolean;
  /** Make value read-only (focusable but not changeable via UI) */
  readOnly?: boolean;
  /** Optional placeholder when no value is selected */
  placeholder?: string;

  /** Preferred/featured timezone ids shown at the top */
  preferredTimezones?: IANATimezone[];
  /** Recent timezone ids (e.g., from user profile/localStorage) */
  recentTimezones?: IANATimezone[];
  /**
   * If true, attempts to detect a timezone from the environment (Intl API)
   * and use it when no value/defaultValue provided (default: true)
   */
  autoDetect?: boolean;

  /** Data source for timezone options. If omitted, a built-in static list may be used. */
  dataSource?: TimezoneDataSource;

  /** Grouping strategy for options (default: 'utcOffset') */
  groupBy?: TimezoneGroupBy;
  /** Sorting strategy for options (default: 'utcOffsetAsc') */
  sortBy?: TimezoneSortBy;

  /** Filter/search behaviour */
  filterOptions?: TimezoneFilterOptions;

  /** Whether to show "UTC" and "Etc/GMT±X" aliases (default: true) */
  includeUTCAliases?: boolean;
  /** Whether to hide deprecated/legacy zones if present (default: true) */
  hideDeprecated?: boolean;

  /** Visual density: affects paddings/sizes */
  density?: "compact" | "comfortable";
  /** Width behavior of dropdown list */
  menuWidth?: "auto" | number | string;
  /** Max height of dropdown list (px or CSS size) */
  menuMaxHeight?: number | string;

  /** Class names for styling hooks */
  className?: string;
  dropdownClassName?: string;
  optionClassName?: string;

  /** Optional theme tokens */
  theme?: TimezonePickerTheme;

  /** Portal target for the dropdown (e.g., document.body) */
  portalContainer?: HTMLElement | null;

  /** Lifecycle callbacks */
  onOpen?: () => void;
  onClose?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Called when the user types in the search box */
  onSearchChange?: (query: string) => void;
  /** Error callback (e.g., data source failure) */
  onError?: (message: string) => void;
  /** Lightweight analytics hook */
  onTrack?: (payload: TimezoneTelemetry) => void;
}

/**
 * Public ref methods exposed by the component (optional).
 */
export interface TimezonePickerRef {
  /** Focus the input programmatically */
  focus: () => void;
  /** Open the dropdown programmatically */
  open: () => void;
  /** Close the dropdown programmatically */
  close: () => void;
  /** Imperatively set the search query (if supported) */
  setSearch: (query: string) => void;
}

/**
 * Internal state managed by the component (exported for tests).
 */
export interface TimezonePickerState {
  status: TimezonePickerStatus;
  /** All options after loading (unfiltered) */
  allOptions: TimezoneOption[];
  /** Options after search/filter/sort/group transforms */
  visibleOptions: TimezoneOption[] | TimezoneGroup[];
  /** Current search query */
  query: string;
  /** Whether dropdown is open */
  open: boolean;
  /** Currently highlighted option id for keyboard nav */
  activeId?: IANATimezone;
  /** Selected timezone id (controlled or uncontrolled) */
  selectedId?: IANATimezone;
  /** Last error message (if any) */
  error?: string;
}

/**
 * Utility guard to detect grouped results at runtime.
 */
export function isTimezoneGroupArray(
  value: TimezonePickerState["visibleOptions"]
): value is TimezoneGroup[] {
  return Array.isArray(value) && value.length > 0 && "options" in (value[0] as any);
}

/**
 * Helper to format an offset label from minutes (e.g., -300 -> "UTC−05:00").
 * Implementations can import and reuse this signature to ensure consistency.
 */
export type FormatOffsetLabel = (offsetMinutes: number) => string;

/**
 * Helper used by the component to normalize a raw `TimezoneOption`.
 * Exported for testing and custom data source pipelines.
 */
export type NormalizeTimezoneOption = (raw: TimezoneOption) => TimezoneOption;
