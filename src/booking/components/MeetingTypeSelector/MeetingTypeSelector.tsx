// src/booking/components/MeetingTypeSelector/MeetingTypeSelector.tsx
"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { formatDuration, getUserTimezone } from "../../lib/utils";
import styles from "./MeetingTypeSelector.module.css";

type CanonicalService = import("../../lib/types").CanonicalService;
type BookingProvider = import("../../lib/types").BookingProvider;

/** A single meeting type option */
export interface MeetingTypeOption {
  /** Stable id from provider or your API */
  id: string;
  /** Human name – e.g., “Intro Call” */
  title: string;
  /** Short description / value prop */
  description?: string;
  /** Minutes */
  duration: number;
  /** Price info (optional) */
  price?: { amount: number; currency: string };
  /** Provider glue */
  providerData?: {
    eventTypeId?: string; // e.g., Cal.com / Calendly event type id
    bookingUrl?: string;
  };
  /** Tag/badge, e.g., “Popular” */
  badge?: string;
  /** Availability hint (optional) */
  availabilityNote?: string;
  /** Whether the option is selectable */
  enabled?: boolean;
}

export type LoadingState = "idle" | "loading" | "success" | "error";

/** Props */
export interface MeetingTypeSelectorProps {
  /** Which service the meeting types belong to */
  service: CanonicalService;
  /** Which provider we’ll ultimately book with */
  provider: BookingProvider;
  /** Options to render (if you already have them) */
  options?: MeetingTypeOption[];
  /** Optional async loader if you want the component to fetch its own list */
  onLoadOptions?: (args: {
    service: CanonicalService;
    provider: BookingProvider;
    timezone: string;
  }) => Promise<MeetingTypeOption[]>;
  /** Currently selected id (controlled) */
  selectedId?: string | null;
  /** Default selected id (uncontrolled) */
  defaultSelectedId?: string | null;
  /** Called when selection changes */
  onSelect?: (option: MeetingTypeOption) => void;
  /** Disable the whole selector */
  disabled?: boolean;
  /** Hide price display */
  hidePrice?: boolean;
  /** Hide duration display */
  hideDuration?: boolean;
  /** Search/filter input on top */
  enableFilter?: boolean;
  /** Placeholder for the filter input */
  filterPlaceholder?: string;
  /** Custom empty state node */
  emptyState?: React.ReactNode;
  /** Custom error state node */
  errorState?: React.ReactNode;
  /** Additional class */
  className?: string;
  /** Analytics hook */
  onTrack?: (event: string, props?: Record<string, any>) => void;
  /** Used in analytics payloads */
  analyticsContext?: string;
  /** Aria-label for the group */
  ariaLabel?: string;
}

/** Local icons (replace with your icon system if desired) */
const ClockIcon = () => <span aria-hidden>🕑</span>;
const CoinIcon = () => <span aria-hidden>💸</span>;
const CheckIcon = () => <span aria-hidden>✓</span>;
const StarIcon = () => <span aria-hidden>★</span>;
const SearchIcon = () => <span aria-hidden>🔎</span>;

/** Defaults */
const DEFAULTS = {
  enableFilter: true,
  filterPlaceholder: "Search meeting types…",
  analyticsContext: "meeting_type_selector",
} as const;

export default function MeetingTypeSelector({
  service,
  provider,
  options,
  onLoadOptions,
  selectedId,
  defaultSelectedId = null,
  onSelect,
  disabled = false,
  hidePrice = false,
  hideDuration = false,
  enableFilter = DEFAULTS.enableFilter,
  filterPlaceholder = DEFAULTS.filterPlaceholder,
  emptyState,
  errorState,
  className = "",
  onTrack,
  analyticsContext = DEFAULTS.analyticsContext,
  ariaLabel = "Select a meeting type",
}: MeetingTypeSelectorProps) {
  const [internalOptions, setInternalOptions] = useState<MeetingTypeOption[]>(
    options ?? []
  );
  const [loading, setLoading] = useState<LoadingState>(
    options ? "success" : onLoadOptions ? "loading" : "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [uncontrolledId, setUncontrolledId] = useState<string | null>(
    defaultSelectedId
  );

  // SSR-safe timezone
  const tz = useMemo(() => getUserTimezone(), []);

  // Derived “current selection id”
  const currentSelectedId =
    selectedId !== undefined ? selectedId : uncontrolledId;

  // Fetch options when needed
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!onLoadOptions) return;
      try {
        setLoading("loading");
        setError(null);
        const data = await onLoadOptions({ service, provider, timezone: tz });
        if (cancelled) return;
        setInternalOptions(Array.isArray(data) ? data : []);
        setLoading("success");
        onTrack?.("meeting_types_loaded", {
          service,
          provider,
          count: Array.isArray(data) ? data.length : 0,
          context: analyticsContext,
        });
      } catch (e: any) {
        if (cancelled) return;
        setLoading("error");
        setError(e?.message || "Failed to load meeting types");
        onTrack?.("meeting_types_error", {
          service,
          provider,
          error: String(e?.message || e),
          context: analyticsContext,
        });
      }
    };
    if (!options && onLoadOptions) load();
    return () => {
      cancelled = true;
    };
  }, [onLoadOptions, options, provider, service, tz, onTrack, analyticsContext]);

  // Keep internal list in sync if parent passes a new `options`
  useEffect(() => {
    if (options) {
      setInternalOptions(options);
      if (loading !== "success") setLoading("success");
    }
  }, [options, loading]);

  // Filtered list
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return internalOptions;
    return internalOptions.filter((opt) => {
      return (
        opt.title.toLowerCase().includes(q) ||
        (opt.description?.toLowerCase().includes(q) ?? false) ||
        (opt.badge?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [filter, internalOptions]);

  // Keyboard roving focus
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusByIndex = (idx: number) => {
    const opt = filtered[idx];
    if (!opt) return;
    optionRefs.current[opt.id]?.focus();
  };

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const ids = filtered.map((o) => o.id);
    const activeId =
      document.activeElement &&
      Object.values(optionRefs.current).find((btn) => btn === document.activeElement)?.dataset
        ?.id;
    const current = activeId ? ids.indexOf(activeId) : -1;

    if (e.key === "Home") return focusByIndex(0);
    if (e.key === "End") return focusByIndex(ids.length - 1);

    const delta = e.key === "ArrowDown" ? 1 : -1;
    const nextIndex = Math.min(Math.max((current ?? -1) + delta, 0), ids.length - 1);
    focusByIndex(nextIndex);
  };

  const select = useCallback(
    (opt: MeetingTypeOption) => {
      if (disabled || opt.enabled === false) return;

      // Controlled vs uncontrolled
      if (selectedId === undefined) setUncontrolledId(opt.id);
      onSelect?.(opt);

      onTrack?.("meeting_type_selected", {
        service,
        provider,
        option_id: opt.id,
        title: opt.title,
        duration: opt.duration,
        price_amount: opt.price?.amount,
        price_currency: opt.price?.currency,
        context: analyticsContext,
      });
    },
    [
      analyticsContext,
      disabled,
      onSelect,
      onTrack,
      provider,
      selectedId,
      service,
    ]
  );

  // Render helpers
  const renderPrice = (opt: MeetingTypeOption) => {
    if (hidePrice || !opt.price) return null;
    return (
      <span className={styles.optionPrice} aria-label="price">
        <CoinIcon /> {opt.price.currency} {opt.price.amount}
      </span>
    );
  };

  const renderDuration = (opt: MeetingTypeOption) => {
    if (hideDuration) return null;
    return (
      <span className={styles.optionDuration} aria-label="duration">
        <ClockIcon /> {formatDuration(opt.duration)}
      </span>
    );
  };

  // States
  if (loading === "loading") {
    return (
      <div
        className={`${styles.selector} ${className}`}
        aria-busy="true"
        aria-live="polite"
      >
        <div className={styles.header}>
          {enableFilter && (
            <div className={styles.filter}>
              <SearchIcon />
              <input
                className={styles.filterInput}
                type="search"
                inputMode="search"
                placeholder={filterPlaceholder}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                disabled
                aria-disabled="true"
              />
            </div>
          )}
        </div>
        <div className={styles.skeletonGrid} role="status" aria-label="Loading meeting types">
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
          <div className={styles.skeletonCard} />
        </div>
      </div>
    );
  }

  if (loading === "error") {
    return (
      <div className={`${styles.selector} ${className}`} role="alert">
        {errorState ?? (
          <div className={styles.error}>
            <p className={styles.errorTitle}>Unable to load meeting types</p>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        )}
      </div>
    );
  }

  const nothingToShow = filtered.length === 0;

  return (
    <div
      className={`${styles.selector} ${className}`}
      aria-label={ariaLabel}
      aria-describedby={enableFilter ? "mts-filter" : undefined}
    >
      {/* Header / Filter */}
      {enableFilter && (
        <div className={styles.header}>
          <div id="mts-filter" className={styles.filter}>
            <SearchIcon />
            <input
              className={styles.filterInput}
              type="search"
              inputMode="search"
              placeholder={filterPlaceholder}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              disabled={disabled}
              aria-disabled={disabled ? "true" : "false"}
            />
          </div>
          <div className={styles.meta}>
            <span className={styles.tz}>Times shown in {tz}</span>
          </div>
        </div>
      )}

      {/* Empty */}
      {nothingToShow ? (
        <div className={styles.empty} role="status">
          {emptyState ?? <p className={styles.emptyText}>No meeting types found.</p>}
        </div>
      ) : (
        <div
          className={styles.grid}
          role="listbox"
          aria-label="Meeting types"
          aria-activedescendant={currentSelectedId ?? undefined}
          onKeyDown={handleKeyDownList}
          ref={listRef}
        >
          {filtered.map((opt) => {
            const selected = currentSelectedId === opt.id;
            const isDisabled = disabled || opt.enabled === false;

            return (
              <button
                key={opt.id}
                data-id={opt.id}
                ref={(el) => (optionRefs.current[opt.id] = el)}
                role="option"
                aria-selected={selected}
                aria-disabled={isDisabled}
                id={opt.id}
                className={[
                  styles.card,
                  selected ? styles.cardSelected : "",
                  isDisabled ? styles.cardDisabled : "",
                ].join(" ")}
                onClick={() => select(opt)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    select(opt);
                  }
                }}
                disabled={isDisabled}
                title={opt.description || opt.title}
              >
                {/* Badge */}
                {opt.badge && (
                  <span className={styles.badge} aria-label="badge">
                    <StarIcon /> {opt.badge}
                  </span>
                )}

                {/* Title */}
                <div className={styles.cardHeader}>
                  <h3 className={styles.title}>{opt.title}</h3>
                  {selected && (
                    <span className={styles.check}>
                      <CheckIcon />
                    </span>
                  )}
                </div>

                {/* Description */}
                {opt.description && (
                  <p className={styles.description}>{opt.description}</p>
                )}

                {/* Meta row */}
                <div className={styles.metaRow}>
                  {renderDuration(opt)}
                  {renderPrice(opt)}
                </div>

                {/* Availability hint */}
                {opt.availabilityNote && (
                  <p className={styles.note}>{opt.availabilityNote}</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
