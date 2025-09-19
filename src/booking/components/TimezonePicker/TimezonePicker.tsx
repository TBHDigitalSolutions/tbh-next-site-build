// src/booking/components/TimezonePicker/TimezonePicker.tsx
"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { getUserTimezone } from "../../lib/utils";

type TrackFn = (event: string, props?: Record<string, unknown>) => void;

export interface TimezonePickerProps {
  /** Controlled value (IANA tz like "America/Chicago") */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  /** Called when a timezone is chosen */
  onChange?: (tz: string) => void;

  /** Label text for accessibility */
  label?: string;
  /** Placeholder for search input */
  placeholder?: string;

  /** Disable the picker */
  disabled?: boolean;
  /** Extra class on the root */
  className?: string;

  /** Show UTC offset badge next to each option (default: true) */
  showOffset?: boolean;
  /** Show search input (default: true) */
  showSearch?: boolean;
  /** Show "Use my timezone" quick action (default: true) */
  allowAutoDetect?: boolean;

  /** Pin these timezones to the top of the list (keep IANA names) */
  preferred?: string[];

  /** Provide a custom list of timezones. If omitted, uses `Intl.supportedValuesOf('timeZone')` when available, otherwise falls back to a curated set. */
  timezones?: string[];

  /** Optional analytics hook */
  onTrack?: TrackFn;
  /** Context string for analytics */
  analyticsContext?: string;

  /** Render override for each option (return a11y-friendly content only) */
  renderOption?: (opt: TimezoneOption) => React.ReactNode;

  /** Max list height in px (default: 280) */
  maxListHeight?: number;
}

type TimezoneOption = {
  tz: string; // IANA
  label: string; // Human label (City/Friendly)
  offsetMinutes: number; // current offset vs UTC
  isPreferred?: boolean;
};

/** Curated fallback when `Intl.supportedValuesOf('timeZone')` is unavailable */
const FALLBACK_TZS = [
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const DEFAULTS = {
  showOffset: true,
  showSearch: true,
  allowAutoDetect: true,
  maxListHeight: 280,
};

/** Compute current UTC offset (in minutes) for a given IANA zone */
function getCurrentOffsetMinutes(zone: string): number {
  try {
    const now = new Date();
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    // Convert to parts then compose an ISO-like in that TZ, then compare timestamps
    const parts = dtf.formatToParts(now);
    const y = parts.find((p) => p.type === "year")?.value ?? "1970";
    const m = parts.find((p) => p.type === "month")?.value ?? "01";
    const d = parts.find((p) => p.type === "day")?.value ?? "01";
    const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
    const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
    const ss = parts.find((p) => p.type === "second")?.value ?? "00";
    // Build a "local in zone" string then parse as if local; compare to UTC ms
    const asIfLocal = new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}.000`);
    // offset = zoned - utc
    const diffMs = asIfLocal.getTime() - now.getTime();
    return Math.round(diffMs / 60000);
  } catch {
    // Fallback: 0 if anything fails
    return 0;
  }
}

/** Human label like "UTC-05:00 — America/Chicago" + city */
function makeOption(tz: string, preferredSet: Set<string>): TimezoneOption {
  const offset = getCurrentOffsetMinutes(tz);
  const sign = offset <= 0 ? "-" : "+";
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  const city = tz.split("/").slice(-1)[0]?.replace(/_/g, " ") ?? tz;
  const label = `UTC${sign}${hh}:${mm} — ${city} (${tz})`;
  return {
    tz,
    label,
    offsetMinutes: offset,
    isPreferred: preferredSet.has(tz),
  };
}

/** Very small fuzzy matcher: checks all tokens in any order */
function fuzzyIncludes(haystack: string, needle: string): boolean {
  const h = haystack.toLowerCase();
  const tokens = needle.toLowerCase().split(/\s+/).filter(Boolean);
  return tokens.every((t) => h.includes(t));
}

export default function TimezonePicker({
  value,
  defaultValue,
  onChange,
  label = "Timezone",
  placeholder = "Search timezones…",
  disabled,
  className = "",
  showOffset = DEFAULTS.showOffset,
  showSearch = DEFAULTS.showSearch,
  allowAutoDetect = DEFAULTS.allowAutoDetect,
  preferred = ["America/Los_Angeles", "America/Chicago", "America/New_York", "Europe/London"],
  timezones,
  onTrack,
  analyticsContext = "timezone_picker",
  renderOption,
  maxListHeight = DEFAULTS.maxListHeight,
}: TimezonePickerProps) {
  const inputId = useId();
  const listboxId = useId();
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value! : internal;

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const btnDetectRef = useRef<HTMLButtonElement>(null);

  // Build available tz list
  const allTzs: string[] = useMemo(() => {
    if (timezones?.length) return Array.from(new Set(timezones));
    // @ts-expect-error: supportedValuesOf may not exist in TS lib yet
    if (typeof Intl.supportedValuesOf === "function") {
      // @ts-ignore
      const list: string[] = Intl.supportedValuesOf("timeZone") || [];
      if (list.length) return list;
    }
    return FALLBACK_TZS;
  }, [timezones]);

  const options: TimezoneOption[] = useMemo(() => {
    const prefSet = new Set(preferred);
    const built = allTzs.map((tz) => makeOption(tz, prefSet));
    // Sort by (preferred desc, absolute offset asc, label asc)
    built.sort((a, b) => {
      if (a.isPreferred && !b.isPreferred) return -1;
      if (!a.isPreferred && b.isPreferred) return 1;
      const ao = Math.abs(a.offsetMinutes) - Math.abs(b.offsetMinutes);
      if (ao !== 0) return ao;
      return a.label.localeCompare(b.label);
    });
    return built;
  }, [allTzs, preferred]);

  const filtered = useMemo(() => {
    if (!query) return options;
    return options.filter(
      (o) => fuzzyIncludes(o.tz, query) || fuzzyIncludes(o.label, query)
    );
  }, [options, query]);

  const currentIndex = useMemo(
    () => filtered.findIndex((o) => o.tz === currentValue),
    [filtered, currentValue]
  );

  // Ensure activeIndex is in bounds when list changes
  useEffect(() => {
    if (filtered.length === 0) {
      setActiveIndex(-1);
      return;
    }
    if (activeIndex < 0 || activeIndex >= filtered.length) {
      setActiveIndex(Math.max(0, currentIndex));
    }
  }, [filtered.length, activeIndex, currentIndex]);

  const commit = useCallback(
    (tz: string) => {
      if (!isControlled) setInternal(tz);
      onChange?.(tz);
      onTrack?.("timezone_select", { tz, context: analyticsContext });
    },
    [isControlled, onChange, onTrack, analyticsContext]
  );

  const handleDetect = useCallback(() => {
    const detected = getUserTimezone();
    if (detected) {
      commit(detected);
      setQuery("");
    }
  }, [commit]);

  // Keyboard navigation for the listbox
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (!filtered.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(filtered.length - 1);
      } else if (e.key === "Enter" || e.key === " ") {
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          e.preventDefault();
          commit(filtered[activeIndex].tz);
        }
      } else if (e.key === "Escape") {
        (e.target as HTMLElement)?.blur();
      }
    },
    [disabled, filtered, activeIndex, commit]
  );

  const renderBadge = (opt: TimezoneOption) => {
    if (!showOffset) return null;
    const m = opt.offsetMinutes;
    const sign = m <= 0 ? "-" : "+";
    const abs = Math.abs(m);
    const hh = String(Math.floor(abs / 60)).padStart(2, "0");
    const mm = String(abs % 60).padStart(2, "0");
    return (
      <span
        aria-hidden="true"
        style={{
          fontVariantNumeric: "tabular-nums",
          background: "var(--bg-elevated, #f8f9fa)",
          border: "1px solid var(--border-subtle, #e5e5e5)",
          padding: "2px 6px",
          borderRadius: 6,
          fontSize: 12,
          color: "var(--text-secondary, #6b7280)",
        }}
      >
        UTC{sign}{hh}:{mm}
      </span>
    );
  };

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gap: 8,
        width: "100%",
      }}
    >
      {/* Label row + quick action */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <label
          htmlFor={inputId}
          style={{
            fontWeight: 600,
            color: "var(--text-primary, #121417)",
          }}
        >
          {label}
        </label>

        {allowAutoDetect && (
          <button
            ref={btnDetectRef}
            type="button"
            onClick={handleDetect}
            disabled={disabled}
            aria-label="Use my current timezone"
            style={{
              border: "1px solid var(--border-subtle, #e5e5e5)",
              background: "var(--bg-surface, #ffffff)",
              color: "var(--text-secondary, #6b7280)",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Use my timezone
          </button>
        )}
      </div>

      {/* Search input */}
      {showSearch && (
        <input
          id={inputId}
          type="text"
          inputMode="search"
          autoComplete="off"
          role="combobox"
          aria-controls={listboxId}
          aria-expanded={true}
          aria-autocomplete="list"
          aria-disabled={disabled || undefined}
          aria-activedescendant={
            activeIndex >= 0 && filtered[activeIndex]
              ? `${listboxId}-opt-${activeIndex}`
              : undefined
          }
          placeholder={placeholder}
          disabled={disabled}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onTrack?.("timezone_search", {
              q: e.target.value,
              context: analyticsContext,
            });
          }}
          onKeyDown={onKeyDown}
          style={{
            border: "1px solid var(--border-subtle, #e5e5e5)",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 14,
            outline: "none",
            width: "100%",
            background: disabled
              ? "var(--bg-secondary, #f1f5f9)"
              : "var(--bg-surface, #ffffff)",
          }}
        />
      )}

      {/* Listbox */}
      <ul
        id={listboxId}
        role="listbox"
        aria-label="Timezones"
        ref={listRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          maxHeight: maxListHeight,
          overflowY: "auto",
          border: "1px solid var(--border-subtle, #e5e5e5)",
          borderRadius: 8,
          background: "var(--bg-surface, #ffffff)",
        }}
      >
        {filtered.length === 0 && (
          <li
            aria-disabled="true"
            style={{
              padding: "10px 12px",
              color: "var(--text-secondary, #6b7280)",
              fontSize: 14,
            }}
          >
            No matches
          </li>
        )}

        {filtered.map((opt, i) => {
          const selected = currentValue === opt.tz;
          const active = i === activeIndex;
          return (
            <li
              id={`${listboxId}-opt-${i}`}
              key={opt.tz}
              role="option"
              aria-selected={selected}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseDown={(e) => e.preventDefault()} // prevent focus loss on click
              onClick={() => commit(opt.tz)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "10px 12px",
                cursor: "pointer",
                background: active
                  ? "color-mix(in oklab, var(--accent-primary, #0ea5e9) 7%, transparent)"
                  : selected
                  ? "color-mix(in oklab, var(--accent-primary, #0ea5e9) 12%, transparent)"
                  : "transparent",
                color: "var(--text-primary, #121417)",
                borderBottom:
                  i < filtered.length - 1
                    ? "1px solid var(--border-subtle, #e5e5e5)"
                    : "none",
              }}
            >
              <div style={{ display: "grid", gap: 2 }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  {renderOption ? renderOption(opt) : opt.label}
                </span>
                {opt.isPreferred && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-secondary, #6b7280)",
                    }}
                  >
                    Preferred
                  </span>
                )}
              </div>
              {renderBadge(opt)}
            </li>
          );
        })}
      </ul>

      {/* Current selection helper text */}
      {currentValue && (
        <div
          aria-live="polite"
          style={{
            fontSize: 12,
            color: "var(--text-secondary, #6b7280)",
          }}
        >
          Selected: <strong>{currentValue}</strong>
        </div>
      )}
    </div>
  );
}
