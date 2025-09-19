// src/booking/components/AvailabilityCalendar/AvailabilityCalendar.tsx
"use client";

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  KeyboardEvent,
} from "react";
import {
  trackBookingCalendarSelect,
  trackBookingCalendarView,
  trackBookingCalendarNavigation,
} from "../../lib/metrics";
import { getUserTimezone, formatDuration } from "../../lib/utils";
import styles from "./AvailabilityCalendar.module.css";
import type {
  AvailabilityCalendarProps,
  CalendarState,
  TimeSlot,
  DayAvailability,
  CalendarView,
  LoadingState,
} from "./AvailabilityCalendar.types";

/* ----------------------------- Defaults ----------------------------- */

const DEFAULT_PROPS = {
  view: "month" as CalendarView,
  selectionMode: "single" as const,
  timeFormat: "12h" as const,
  showTimezone: true,
  showPricing: false,
  disablePastDates: true,
  disableWeekends: false,
  minSlots: 1,
  maxSlots: 1,
  selectedSlots: [] as TimeSlot[],
  userTimezone: getUserTimezone(),
};

/* ---------------------------- Date helpers --------------------------- */

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getMonthDates(date: Date): Date[] {
  const y = date.getFullYear();
  const m = date.getMonth();
  const firstDay = new Date(y, m, 1);
  const lastDay = new Date(y, m + 1, 0);
  const startGrid = new Date(firstDay);
  startGrid.setDate(startGrid.getDate() - firstDay.getDay());

  const dates: Date[] = [];
  const cur = new Date(startGrid);
  while (cur <= lastDay || dates.length % 7 !== 0) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function getWeekDates(date: Date): Date[] {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
}

function formatTime(timeString: string, format: "12h" | "24h"): string {
  const d = new Date(timeString);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: format === "12h",
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

function isPastDate(d: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cmp = new Date(d);
  cmp.setHours(0, 0, 0, 0);
  return cmp < today;
}

/* ----------------------------- UI Bits ------------------------------ */

function DefaultLoadingComponent() {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <div className={styles.loadingSpinner} aria-hidden="true" />
      <p className={styles.loadingText}>Loading availability…</p>
    </div>
  );
}

function DefaultErrorComponent({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className={styles.error} role="alert">
      <h3 className={styles.errorTitle}>Unable to load availability</h3>
      <p className={styles.errorMessage}>{error}</p>
      <button className={styles.retryButton} onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

function DefaultEmptyStateComponent() {
  return (
    <div className={styles.empty}>
      <h3 className={styles.emptyTitle}>No availability</h3>
      <p className={styles.emptyMessage}>
        There are no available time slots for the selected period.
      </p>
    </div>
  );
}

/* --------------------------- Main component -------------------------- */

export default function AvailabilityCalendar(props: AvailabilityCalendarProps) {
  const {
    config,
    view = DEFAULT_PROPS.view,
    selectionMode = DEFAULT_PROPS.selectionMode,
    selectedSlots = DEFAULT_PROPS.selectedSlots,
    userTimezone = DEFAULT_PROPS.userTimezone,
    timeFormat = DEFAULT_PROPS.timeFormat,
    showTimezone = DEFAULT_PROPS.showTimezone,
    showPricing = DEFAULT_PROPS.showPricing,
    disablePastDates = DEFAULT_PROPS.disablePastDates,
    disableWeekends = DEFAULT_PROPS.disableWeekends,
    disabledDates = [],
    minSlots = DEFAULT_PROPS.minSlots,
    maxSlots = DEFAULT_PROPS.maxSlots,
    className = "",
    loadingComponent: LoadingComponent = DefaultLoadingComponent,
    errorComponent: ErrorComponent = DefaultErrorComponent,
    emptyStateComponent: EmptyStateComponent = DefaultEmptyStateComponent,
    onSlotSelect,
    onViewChange,
    onDateRangeChange,
    onLoadAvailability,
    analyticsContext = "calendar",
  } = props;

  /* ---------------------------- Local state ---------------------------- */

  const [state, setState] = useState<CalendarState>(() => ({
    currentDate: new Date(),
    view,
    loading: "idle" as LoadingState,
    availabilityCache: new Map<string, DayAvailability>(),
    selectedSlots: [...selectedSlots],
  }));

  const lastFetchRef = useRef<string>("");
  const loadingTimeoutRef = useRef<number | undefined>(undefined);

  // currency formatter (used only if showPricing && slot.price)
  const currencyFmt = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
      }),
    []
  );

  /* ---------------------- Derived ranges / memoized -------------------- */

  const currentMonthDates = useMemo(
    () => getMonthDates(state.currentDate),
    [state.currentDate]
  );

  const currentWeekDates = useMemo(
    () => getWeekDates(state.currentDate),
    [state.currentDate]
  );

  const displayRange = useMemo(() => {
    const start =
      state.view === "month"
        ? currentMonthDates[0]
        : state.view === "week"
        ? currentWeekDates[0]
        : state.currentDate;
    const end =
      state.view === "month"
        ? currentMonthDates[currentMonthDates.length - 1]
        : state.view === "week"
        ? currentWeekDates[6]
        : state.currentDate;

    return { start: formatDateKey(start), end: formatDateKey(end) };
  }, [state.view, state.currentDate, currentMonthDates, currentWeekDates]);

  /* --------------------------- Data loading ---------------------------- */

  const loadAvailability = useCallback(
    async (startDate: string, endDate: string) => {
      if (!onLoadAvailability) return;

      const cacheKey = `${startDate}-${endDate}-${config.service}-${config.meetingType ?? ""}`;
      if (lastFetchRef.current === cacheKey) return;
      lastFetchRef.current = cacheKey;

      setState((p) => ({ ...p, loading: "loading", error: undefined }));

      // timeout safeguard
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = window.setTimeout(() => {
        setState((p) => ({ ...p, loading: "error", error: "Request timeout" }));
      }, 10_000);

      try {
        const availabilityData = await onLoadAvailability(startDate, endDate);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);

        setState((prev) => {
          const nextCache = new Map(prev.availabilityCache);
          for (const day of availabilityData) nextCache.set(day.date, day);
          return {
            ...prev,
            loading: "success",
            error: undefined,
            availabilityCache: nextCache,
            loadedRange: { start: startDate, end: endDate },
          };
        });

        onDateRangeChange?.(startDate, endDate);
      } catch (err: any) {
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        setState((p) => ({
          ...p,
          loading: "error",
          error: err?.message || "Failed to load availability",
        }));
      }
    },
    [onLoadAvailability, onDateRangeChange, config.service, config.meetingType]
  );

  useEffect(() => {
    if (onLoadAvailability) loadAvailability(displayRange.start, displayRange.end);
  }, [displayRange.start, displayRange.end, loadAvailability, onLoadAvailability]);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  // sync external selected slots
  useEffect(() => {
    setState((p) => ({ ...p, selectedSlots: [...selectedSlots] }));
  }, [selectedSlots]);

  /* ------------------------ Navigation + a11y -------------------------- */

  const goToToday = useCallback(() => {
    setState((p) => ({ ...p, currentDate: new Date() }));
    trackBookingCalendarNavigation({
      action: "today",
      view: state.view,
      context: analyticsContext,
    });
  }, [analyticsContext, state.view]);

  const goToNext = useCallback(() => {
    setState((prev) => {
      const d = new Date(prev.currentDate);
      if (prev.view === "month") d.setMonth(d.getMonth() + 1);
      else if (prev.view === "week") d.setDate(d.getDate() + 7);
      else d.setDate(d.getDate() + 1);
      return { ...prev, currentDate: d };
    });
    trackBookingCalendarNavigation({
      action: "next",
      view: state.view,
      context: analyticsContext,
    });
  }, [analyticsContext, state.view]);

  const goToPrevious = useCallback(() => {
    setState((prev) => {
      const d = new Date(prev.currentDate);
      if (prev.view === "month") d.setMonth(d.getMonth() - 1);
      else if (prev.view === "week") d.setDate(d.getDate() - 7);
      else d.setDate(d.getDate() - 1);
      return { ...prev, currentDate: d };
    });
    trackBookingCalendarNavigation({
      action: "previous",
      view: state.view,
      context: analyticsContext,
    });
  }, [analyticsContext, state.view]);

  const changeView = useCallback(
    (newView: CalendarView) => {
      setState((p) => ({ ...p, view: newView }));
      onViewChange?.(newView);
      trackBookingCalendarView({
        service: config.service,
        view: newView,
        context: analyticsContext,
      });
    },
    [onViewChange, config.service, analyticsContext]
  );

  // basic keyboard support for header nav
  const onHeaderKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        goToToday();
      }
    },
    [goToNext, goToPrevious, goToToday]
  );

  // fire initial view event once
  const viewTrackedRef = useRef(false);
  useEffect(() => {
    if (!viewTrackedRef.current) {
      viewTrackedRef.current = true;
      trackBookingCalendarView({
        service: config.service,
        view: state.view,
        context: analyticsContext,
      });
    }
  }, [config.service, analyticsContext, state.view]);

  /* ------------------------- Selection helpers ------------------------- */

  const getDateAvailability = useCallback(
    (date: Date): DayAvailability | undefined => {
      return state.availabilityCache.get(formatDateKey(date));
    },
    [state.availabilityCache]
  );

  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      if (disablePastDates && isPastDate(date)) return true;
      if (disableWeekends && (date.getDay() === 0 || date.getDay() === 6))
        return true;
      if (disabledDates.includes(formatDateKey(date))) return true;
      if (config.availableDays && !config.availableDays.includes(date.getDay()))
        return true;
      return false;
    },
    [
      disablePastDates,
      disableWeekends,
      disabledDates,
      config.availableDays,
    ]
  );

  const isSlotSelected = useCallback(
    (slot: TimeSlot): boolean =>
      state.selectedSlots.some(
        (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
      ),
    [state.selectedSlots]
  );

  const canSelectSlot = useCallback(
    (slot: TimeSlot): boolean => {
      if (!slot.available) return false;
      if (selectionMode === "single") return true;

      if (selectionMode === "multiple") {
        const already = isSlotSelected(slot);
        if (already) return true; // can deselect
        return state.selectedSlots.length < maxSlots;
      }

      // simple range: only within same day; choose contiguous within day
      if (selectionMode === "range") {
        const selected = state.selectedSlots;
        if (selected.length === 0) return true;
        if (selected.length === 1) {
          const d1 = new Date(selected[0].startTime);
          const d2 = new Date(slot.startTime);
          return isSameDay(d1, d2);
        }
        return true;
      }

      return true;
    },
    [selectionMode, isSlotSelected, state.selectedSlots, maxSlots]
  );

  const selectSlot = useCallback(
    (slot: TimeSlot) => {
      if (!canSelectSlot(slot)) return;

      setState((prev) => {
        let newSelected: TimeSlot[] = [];

        if (selectionMode === "single") {
          newSelected = [slot];
        } else if (selectionMode === "multiple") {
          const already = prev.selectedSlots.some(
            (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
          );
          newSelected = already
            ? prev.selectedSlots.filter(
                (s) =>
                  !(s.startTime === slot.startTime && s.endTime === slot.endTime)
              )
            : [...prev.selectedSlots, slot].slice(0, maxSlots);
        } else {
          // range selection (same-day convenience)
          if (prev.selectedSlots.length === 0) {
            newSelected = [slot];
          } else if (prev.selectedSlots.length === 1) {
            const a = prev.selectedSlots[0];
            const da = new Date(a.startTime);
            const db = new Date(slot.startTime);
            if (!isSameDay(da, db)) {
              newSelected = [slot];
            } else {
              const day = getDateAvailability(da);
              const slots = (day?.slots ?? [])
                .filter((s) => s.available)
                .sort(
                  (x, y) =>
                    new Date(x.startTime).getTime() -
                    new Date(y.startTime).getTime()
                );
              const start = Math.min(
                new Date(a.startTime).getTime(),
                new Date(slot.startTime).getTime()
              );
              const end = Math.max(
                new Date(a.startTime).getTime(),
                new Date(slot.startTime).getTime()
              );
              newSelected = slots.filter((s) => {
                const t = new Date(s.startTime).getTime();
                return t >= start && t <= end;
              });
              if (newSelected.length === 0) newSelected = [slot];
              if (newSelected.length > maxSlots)
                newSelected = newSelected.slice(0, maxSlots);
              if (newSelected.length < minSlots) {
                // keep anchor only if below min; caller can enforce later
                newSelected = [slot];
              }
            }
          } else {
            // if already had a range, start a new one
            newSelected = [slot];
          }
        }

        // fire analytics BEFORE returning (selection always occurs)
        trackBookingCalendarSelect({
          service: config.service,
          provider: config.provider,
          slotTime: slot.startTime,
          context: analyticsContext,
        });

        // notify parent with the fresh array
        onSlotSelect?.(newSelected);

        return { ...prev, selectedSlots: newSelected };
      });
    },
    [
      canSelectSlot,
      selectionMode,
      maxSlots,
      minSlots,
      getDateAvailability,
      config.service,
      config.provider,
      analyticsContext,
      onSlotSelect,
    ]
  );

  /* ------------------------------- Views ------------------------------- */

  const renderMonthView = () => {
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className={styles.monthView} role="grid" aria-label="Month view">
        <div className={styles.weekdayHeader} role="row">
          {weekdayNames.map((day) => (
            <div key={day} className={styles.weekdayCell} role="columnheader">
              {day}
            </div>
          ))}
        </div>

        <div className={styles.monthGrid}>
          {currentMonthDates.map((date, idx) => {
            const availability = getDateAvailability(date);
            const disabled = isDateDisabled(date);
            const inCurrentMonth = date.getMonth() === state.currentDate.getMonth();
            const today = isToday(date);
            const hasSlots = availability?.hasAvailability || false;

            const classNames = [
              styles.dayCell,
              !inCurrentMonth ? styles.dayCellOtherMonth : "",
              today ? styles.dayCellToday : "",
              disabled ? styles.dayCellDisabled : "",
              hasSlots ? styles.dayCellHasAvailability : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={`${formatDateKey(date)}-${idx}`}
                type="button"
                role="gridcell"
                aria-selected={isSameDay(date, state.currentDate)}
                aria-disabled={disabled || !hasSlots}
                className={classNames}
                onClick={() => {
                  if (!disabled && hasSlots) {
                    setState((p) => ({ ...p, currentDate: date, view: "day" }));
                    trackBookingCalendarNavigation({
                      action: "date_select",
                      view: "day",
                      context: analyticsContext,
                    });
                  }
                }}
              >
                <div className={styles.dayNumber}>{date.getDate()}</div>
                {availability && (
                  <div className={styles.dayAvailability}>
                    {availability.slots.length} slot
                    {availability.slots.length !== 1 ? "s" : ""}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekdayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return (
      <div className={styles.weekView} aria-label="Week view">
        <div className={styles.weekGrid}>
          {currentWeekDates.map((date, index) => {
            const availability = getDateAvailability(date);
            const disabled = isDateDisabled(date);
            const today = isToday(date);

            return (
              <section key={formatDateKey(date)} className={styles.weekDay}>
                <div className={styles.weekDayHeader}>
                  <div className={styles.weekDayName}>{weekdayNames[index]}</div>
                  <div
                    className={`${styles.weekDayDate} ${
                      today ? styles.dayCellToday : ""
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>

                {disabled ? (
                  <div className={styles.empty}>
                    <p className={styles.emptyMessage}>Not available</p>
                  </div>
                ) : availability?.slots.length ? (
                  <div className={styles.slotsContainer} role="list">
                    {availability.slots.slice(0, 100).map((slot) => (
                      <button
                        key={`${slot.startTime}-${slot.endTime}`}
                        type="button"
                        className={[
                          styles.timeSlot,
                          isSlotSelected(slot) ? styles.timeSlotSelected : "",
                          !canSelectSlot(slot) ? styles.timeSlotDisabled : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        role="listitem"
                        aria-pressed={isSlotSelected(slot)}
                        aria-disabled={!canSelectSlot(slot)}
                        onClick={() => selectSlot(slot)}
                      >
                        <span className={styles.slotTime}>
                          {formatTime(slot.startTime, timeFormat)}
                        </span>
                        <div className={styles.slotInfo}>
                          <span className={styles.slotDuration}>
                            {formatDuration(slot.duration)}
                          </span>
                          {showPricing && slot.price && (
                            <span className={styles.slotPrice}>
                              {currencyFmt.format(
                                Number(slot.price.amount || 0)
                              )}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className={styles.empty}>
                    <p className={styles.emptyMessage}>No slots available</p>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const availability = getDateAvailability(state.currentDate);
    const disabled = isDateDisabled(state.currentDate);

    return (
      <div className={styles.dayView} aria-label="Day view">
        <div className={styles.dayViewHeader} aria-live="polite">
          <h2 className={styles.dayViewDate}>
            {state.currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
        </div>

        {disabled ? (
          <div className={styles.empty}>
            <h3 className={styles.emptyTitle}>Date not available</h3>
            <p className={styles.emptyMessage}>
              This date is not available for booking.
            </p>
          </div>
        ) : availability?.slots.length ? (
          <div className={styles.dayViewSlots} role="list">
            {availability.slots.map((slot) => (
              <button
                key={`${slot.startTime}-${slot.endTime}`}
                type="button"
                className={[
                  styles.timeSlot,
                  isSlotSelected(slot) ? styles.timeSlotSelected : "",
                  !canSelectSlot(slot) ? styles.timeSlotDisabled : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="listitem"
                aria-pressed={isSlotSelected(slot)}
                aria-disabled={!canSelectSlot(slot)}
                onClick={() => selectSlot(slot)}
              >
                <span className={styles.slotTime}>
                  {formatTime(slot.startTime, timeFormat)}
                </span>
                <div className={styles.slotInfo}>
                  <span className={styles.slotDuration}>
                    {formatDuration(slot.duration)}
                  </span>
                  {showPricing && slot.price && (
                    <span className={styles.slotPrice}>
                      {currencyFmt.format(Number(slot.price.amount || 0))}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyStateComponent />
        )}
      </div>
    );
  };

  /* ----------------------------- Rendering ----------------------------- */

  const renderContent = () => {
    if (state.loading === "loading") return <LoadingComponent />;
    if (state.loading === "error" && (state as any).error)
      return (
        <ErrorComponent
          error={(state as any).error as string}
          onRetry={() => loadAvailability(displayRange.start, displayRange.end)}
        />
      );

    if (state.view === "month") return renderMonthView();
    if (state.view === "week") return renderWeekView();
    return renderDayView();
  };

  return (
    <div
      className={`${styles.calendar} ${className}`}
      onKeyDown={onHeaderKey}
      aria-label="Availability calendar"
    >
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.headerTitle} aria-live="polite">
          {state.view === "month" &&
            state.currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          {state.view === "week" &&
            `Week of ${currentWeekDates[0].toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}`}
          {state.view === "day" &&
            state.currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
        </h1>

        <div className={styles.headerNav}>
          <div className={styles.viewToggle} role="tablist" aria-label="View">
            <button
              className={`${styles.viewButton} ${
                state.view === "month" ? styles.viewButtonActive : ""
              }`}
              role="tab"
              aria-selected={state.view === "month"}
              onClick={() => changeView("month")}
            >
              Month
            </button>
            <button
              className={`${styles.viewButton} ${
                state.view === "week" ? styles.viewButtonActive : ""
              }`}
              role="tab"
              aria-selected={state.view === "week"}
              onClick={() => changeView("week")}
            >
              Week
            </button>
            <button
              className={`${styles.viewButton} ${
                state.view === "day" ? styles.viewButtonActive : ""
              }`}
              role="tab"
              aria-selected={state.view === "day"}
              onClick={() => changeView("day")}
            >
              Day
            </button>
          </div>

          <button
            className={`${styles.navButton} ${styles.todayButton}`}
            onClick={goToToday}
          >
            Today
          </button>

          <button className={styles.navButton} onClick={goToPrevious} aria-label="Previous">
            ‹
          </button>
          <button className={styles.navButton} onClick={goToNext} aria-label="Next">
            ›
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>{renderContent()}</div>

      {/* Timezone info */}
      {showTimezone && (
        <div className={styles.timezoneInfo} aria-live="polite">
          Times shown in {userTimezone}
        </div>
      )}
    </div>
  );
}
