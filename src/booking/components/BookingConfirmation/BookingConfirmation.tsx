// src/booking/components/BookingConfirmation/BookingConfirmation.tsx
"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { formatDisplayDate, formatTime, getUserTimezone } from "../../lib/utils";
import { trackBookingConfirmation } from "../../lib/metrics";
import styles from "./BookingConfirmation.module.css";
import type {
  BookingConfirmationProps,
  ConfirmationState,
  CalendarFormat,
  ShareMethod,
  VideoMeetingDetails,
  PhoneMeetingDetails,
  InPersonMeetingDetails,
} from "./BookingConfirmation.types";

/** Replace these with your icon library in app code */
const CheckIcon = () => <span aria-hidden="true">✓</span>;
const CalendarIcon = () => <span aria-hidden="true">📅</span>;
const ShareIcon = () => <span aria-hidden="true">📤</span>;
const EditIcon = () => <span aria-hidden="true">✏️</span>;
const CancelIcon = () => <span aria-hidden="true">❌</span>;
const ChevronIcon = () => <span aria-hidden="true">▼</span>;
const ExternalIcon = () => <span aria-hidden="true">↗</span>;
const CopyIcon = () => <span aria-hidden="true">📋</span>;
const PrintIcon = () => <span aria-hidden="true">🖨</span>;
const EmailIcon = () => <span aria-hidden="true">✉️</span>;
const DownloadIcon = () => <span aria-hidden="true">⬇</span>;

const DEFAULT_PROPS = {
  showDetails: true,
  showPreparation: true,
  showFollowUp: true,
  showCalendarIntegration: true,
  showShareOptions: true,
  successMessage: "Your booking has been confirmed!",
  printMode: false,
  actionsLoading: false,
  actionsDisabled: false,
} as const;

/** Small helpers */
const isBrowser = typeof window !== "undefined";
const safeOpen = (url: string) => {
  if (!isBrowser) return;
  window.open(url, "_blank", "noopener,noreferrer");
};
const escapeICS = (s: string) =>
  String(s)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

/** Build an RFC5545 DTSTART/DTEND string (UTC basic format) */
const toICSDateTime = (iso: string) =>
  new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

export default function BookingConfirmation(props: BookingConfirmationProps) {
  const {
    booking,
    actions,
    preparation,
    followUp,
    showDetails = DEFAULT_PROPS.showDetails,
    showPreparation = DEFAULT_PROPS.showPreparation,
    showFollowUp = DEFAULT_PROPS.showFollowUp,
    showCalendarIntegration = DEFAULT_PROPS.showCalendarIntegration,
    showShareOptions = DEFAULT_PROPS.showShareOptions,
    successMessage = DEFAULT_PROPS.successMessage,
    className = "",
    onAction,
    onTrack,
    printMode = DEFAULT_PROPS.printMode,
    actionsLoading = DEFAULT_PROPS.actionsLoading,
    actionsDisabled = DEFAULT_PROPS.actionsDisabled,
  } = props;

  const [state, setState] = useState<ConfirmationState>({
    detailsExpanded: showDetails,
    preparationExpanded: showPreparation,
    followUpExpanded: showFollowUp,
    copyStatus: "idle",
  });
  const rootRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef(false);

  /** Track view once */
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;

    try {
      trackBookingConfirmation({
        bookingId: booking.id,
        service: booking.service,
        provider: booking.provider,
        viewTime: Date.now(),
        actionsTaken: [],
        calendarIntegrations: [],
        shareMethods: [],
      });
    } catch {
      // swallow analytics errors
    }

    onTrack?.("booking_confirmation_view", {
      booking_id: booking.id,
      service: booking.service,
      provider: booking.provider,
      reference_number: booking.referenceNumber,
    });
  }, [booking, onTrack]);

  /** Memo-ized meeting time block (respects user TZ vs booking TZ) */
  const meetingTime = useMemo(() => {
    const userTz = getUserTimezone();
    const dateStr = formatDisplayDate(booking.startTime, "long");
    const timeRange = `${formatTime(booking.startTime, "12h")} - ${formatTime(
      booking.endTime,
      "12h"
    )}`;
    return {
      date: dateStr,
      time: timeRange,
      timezone: booking.timezone !== userTz ? booking.timezone : undefined,
    };
  }, [booking]);

  /** Calendar links + ICS content */
  const calendar = useMemo(() => {
    const start = toICSDateTime(booking.startTime);
    const end = toICSDateTime(booking.endTime);
    const title = `${booking.meetingType} - ${String(booking.service).replace(/-/g, " ")}`;
    const details = `Meeting with ${booking.customer.name}`;
    let locationPlain = "In-person meeting";

    if (booking.location.type === "video") {
      const d = booking.location.details as VideoMeetingDetails;
      locationPlain = d.joinUrl || `${d.platform} meeting`;
    } else if (booking.location.type === "phone") {
      const d = booking.location.details as PhoneMeetingDetails;
      locationPlain = d.phoneNumber;
    } else if (booking.location.type === "in-person") {
      const d = booking.location.details as InPersonMeetingDetails;
      const a = d.address;
      locationPlain = `${a.street}, ${a.city}, ${a.state} ${a.postalCode}, ${a.country}`;
    }

    const enc = encodeURIComponent;
    const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${enc(
      title
    )}&dates=${start}/${end}&details=${enc(details)}&location=${enc(locationPlain)}`;
    const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${enc(
      title
    )}&startdt=${start}&enddt=${end}&body=${enc(details)}&location=${enc(locationPlain)}`;
    const yahoo = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${enc(
      title
    )}&st=${start}&et=${end}&desc=${enc(details)}&in_loc=${enc(locationPlain)}`;

    // Proper ICS file (CRLF)
    const ics =
      [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Booking Domain//Booking Confirmation//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${escapeICS(booking.id)}`,
        `DTSTAMP:${toICSDateTime(new Date().toISOString())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeICS(title)}`,
        `DESCRIPTION:${escapeICS(details)}`,
        `LOCATION:${escapeICS(locationPlain)}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n") + "\r\n";

    return { google, outlook, yahoo, ics };
  }, [booking]);

  /** Action wrapper (toggles local spinner and emits tracking) */
  const handleAction = useCallback(
    (action: string, data?: Record<string, unknown>) => {
      setState((p) => ({ ...p, loadingAction: action }));

      try {
        onAction?.(action, data);
      } finally {
        onTrack?.("booking_action", {
          action,
          booking_id: booking.id,
          service: booking.service,
          ...data,
        });
      }

      // short lived visual feedback
      const id = setTimeout(() => {
        setState((p) => ({ ...p, loadingAction: undefined }));
      }, 900);
      return () => clearTimeout(id);
    },
    [booking, onAction, onTrack]
  );

  /** Calendar integration handler */
  const handleCalendarIntegration = useCallback(
    (format: CalendarFormat) => {
      if (!isBrowser) return;

      if (format === "ics") {
        const blob = new Blob([calendar.ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `booking-${booking.referenceNumber}.ics`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } else if (format === "google") {
        safeOpen(calendar.google);
      } else if (format === "outlook") {
        safeOpen(calendar.outlook);
      } else if (format === "yahoo") {
        safeOpen(calendar.yahoo);
      }

      handleAction("calendar_integration", { format });
    },
    [booking.referenceNumber, calendar, handleAction]
  );

  /** Share handler (clipboard/Web Share/email/print) */
  const handleShare = useCallback(
    async (method: ShareMethod) => {
      const shareTitle = `Booking Confirmation - ${booking.referenceNumber}`;
      const text = `Your booking for ${booking.meetingType} has been confirmed for ${meetingTime.date} at ${meetingTime.time}.`;
      const url = isBrowser ? window.location.href : "";

      try {
        switch (method) {
          case "link":
            if (isBrowser && navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(url);
              setState((p) => ({ ...p, copyStatus: "copied" }));
              setTimeout(() => setState((p) => ({ ...p, copyStatus: "idle" })), 2000);
            }
            break;
          case "email": {
            const mailto = `mailto:?subject=${encodeURIComponent(
              shareTitle
            )}&body=${encodeURIComponent(`${text}\n\nView full details: ${url}`)}`;
            safeOpen(mailto);
            break;
          }
          case "print":
            if (isBrowser) window.print();
            break;
          default:
            if (isBrowser && (navigator as any).share) {
              await (navigator as any).share({ title: shareTitle, text, url });
            }
        }
        handleAction("share", { method });
      } catch {
        setState((p) => ({ ...p, copyStatus: "error" }));
        setTimeout(() => setState((p) => ({ ...p, copyStatus: "idle" })), 2000);
      }
    },
    [booking.referenceNumber, booking.meetingType, meetingTime, handleAction]
  );

  /** Expand/collapse sections with a11y states */
  const toggleSection = useCallback((section: "details" | "preparation" | "followUp") => {
    setState((p) => ({
      ...p,
      [`${section}Expanded`]: !p[`${section}Expanded` as keyof ConfirmationState],
    }));
  }, []);

  /** Render meeting location block */
  const renderLocation = () => {
    const { location } = booking;
    if (location.type === "video") {
      const d = location.details as VideoMeetingDetails;
      return (
        <div className={styles.locationValue}>
          <div>{d.platform} Meeting</div>
          {d.joinUrl && (
            <a
              href={d.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.joinButton}
              onClick={() => handleAction("join_meeting", { url: d.joinUrl })}
            >
              <span className="sr-only">Open video meeting link</span>
              <DownloadIcon /> Join Meeting
            </a>
          )}
          {d.meetingId && <div className={styles.meetingId}>ID: {d.meetingId}</div>}
        </div>
      );
    }
    if (location.type === "phone") {
      const d = location.details as PhoneMeetingDetails;
      return (
        <div className={styles.locationValue}>
          <div>Phone Call</div>
          <div>{d.phoneNumber}</div>
          {d.conferenceId && <div className={styles.meetingId}>Conference ID: {d.conferenceId}</div>}
        </div>
      );
    }
    if (location.type === "in-person") {
      const d = location.details as InPersonMeetingDetails;
      const a = d.address;
      return (
        <div className={styles.locationValue}>
          <div>In Person</div>
          <address>
            {a.street}
            <br />
            {a.city}, {a.state} {a.postalCode}
          </address>
        </div>
      );
    }
    return <div className={styles.locationValue}>To be determined</div>;
  };

  /** Status pill */
  const renderStatusBadge = () => (
    <span
      className={styles.statusBadge ?? ""}
      data-status={booking.status}
      aria-label={`Status: ${booking.status}`}
    >
      <CheckIcon /> {booking.status}
    </span>
  );

  return (
    <div
      ref={rootRef}
      className={`${styles.confirmation} ${printMode ? styles.printMode : ""} ${className}`}
      role="region"
      aria-label="Booking confirmation"
    >
      {/* Header */}
      <header className={styles.header} role="banner">
        <div className={styles.successIcon} aria-hidden="true">
          <CheckIcon />
        </div>
        <h1 className={styles.headerTitle}>{successMessage}</h1>
        <p className={styles.headerSubtitle}>
          We&apos;ve sent a confirmation email to <strong>{booking.customer.email}</strong>
        </p>
        <div className={styles.referenceNumber} aria-live="polite">
          Reference: {booking.referenceNumber}
        </div>
      </header>

      <main className={styles.content}>
        {/* Booking Details */}
        <section className={styles.section} aria-labelledby="bc-details-title">
          <h2 id="bc-details-title" className={styles.sectionTitle}>
            <CalendarIcon /> Booking Details
          </h2>

          <div className={styles.bookingDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Service</span>
              <span className={`${styles.detailValue} ${styles.serviceValue}`}>{booking.meetingType}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Date &amp; Time</span>
              <div className={styles.detailValue}>
                <div className={styles.timeValue}>{meetingTime.date}</div>
                <div className={styles.timeValue}>{meetingTime.time}</div>
                {meetingTime.timezone && <div className={styles.meetingId}>{meetingTime.timezone}</div>}
              </div>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Duration</span>
              <span className={styles.detailValue}>{booking.duration} minutes</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Location</span>
              {renderLocation()}
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <div className={styles.detailValue}>{renderStatusBadge()}</div>
            </div>

            {booking.pricing && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Price</span>
                <span className={styles.detailValue}>
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: booking.pricing.currency,
                    currencyDisplay: "symbol",
                  }).format(booking.pricing.amount)}
                  {booking.pricing.paymentStatus !== "paid" && (
                    <div className={styles.meetingId}>({booking.pricing.paymentStatus})</div>
                  )}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Calendar Integration */}
        {showCalendarIntegration && (
          <section className={styles.section} aria-labelledby="bc-cal-title">
            <h3 id="bc-cal-title" className={styles.sectionTitle}>
              <CalendarIcon /> Add to Calendar
            </h3>
            <div className={styles.calendarGrid}>
              <button
                type="button"
                className={styles.calendarButton}
                onClick={() => handleCalendarIntegration("google")}
                aria-label="Add to Google Calendar"
              >
                <span className={styles.calendarIcon} aria-hidden="true">
                  G
                </span>
                Google
              </button>
              <button
                type="button"
                className={styles.calendarButton}
                onClick={() => handleCalendarIntegration("outlook")}
                aria-label="Add to Outlook Calendar"
              >
                <span className={styles.calendarIcon} aria-hidden="true">
                  O
                </span>
                Outlook
              </button>
              <button
                type="button"
                className={styles.calendarButton}
                onClick={() => handleCalendarIntegration("yahoo")}
                aria-label="Add to Yahoo Calendar"
              >
                <span className={styles.calendarIcon} aria-hidden="true">
                  Y
                </span>
                Yahoo
              </button>
              <button
                type="button"
                className={styles.calendarButton}
                onClick={() => handleCalendarIntegration("ics")}
                aria-label="Download .ics calendar file"
              >
                <DownloadIcon /> Download
              </button>
            </div>
          </section>
        )}

        {/* Actions */}
        {actions && !printMode && (
          <section className={styles.section} aria-labelledby="bc-actions-title">
            <h3 id="bc-actions-title" className="sr-only">
              Booking actions
            </h3>
            <div className={styles.actions}>
              {actions.rescheduleUrl && (
                <a
                  href={actions.rescheduleUrl}
                  className={`${styles.actionButton} ${styles.primary}`}
                  onClick={(e) => {
                    handleAction("reschedule");
                    // allow native nav
                  }}
                  aria-label="Reschedule this booking"
                >
                  {state.loadingAction === "reschedule" ? (
                    <div className={styles.loadingSpinner} aria-hidden="true" />
                  ) : (
                    <EditIcon />
                  )}
                  Reschedule
                </a>
              )}

              {actions.cancelUrl && (
                <a
                  href={actions.cancelUrl}
                  className={`${styles.actionButton} ${styles.danger}`}
                  onClick={() => handleAction("cancel")}
                  aria-label="Cancel this booking"
                >
                  {state.loadingAction === "cancel" ? (
                    <div className={styles.loadingSpinner} aria-hidden="true" />
                  ) : (
                    <CancelIcon />
                  )}
                  Cancel
                </a>
              )}

              {actions.contactSupport && (
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => {
                    actions.contactSupport?.();
                    handleAction("contact_support");
                  }}
                  disabled={actionsDisabled || actionsLoading}
                  aria-disabled={actionsDisabled || actionsLoading}
                  aria-label="Contact support"
                >
                  {state.loadingAction === "contact_support" ? (
                    <div className={styles.loadingSpinner} aria-hidden="true" />
                  ) : (
                    <ExternalIcon />
                  )}
                  Contact Support
                </button>
              )}
            </div>
          </section>
        )}

        {/* Preparation */}
        {preparation && (
          <section className={styles.section} aria-labelledby="bc-prep-title">
            <div className={styles.expandableSection}>
              <button
                type="button"
                className={styles.expandableHeader}
                onClick={() => toggleSection("preparation")}
                aria-expanded={!!state.preparationExpanded}
                aria-controls="bc-prep-panel"
                id="bc-prep-title"
              >
                <h3 className={styles.expandableTitle}>Preparation</h3>
                <span
                  className={`${styles.expandIcon} ${state.preparationExpanded ? styles.expanded : ""}`}
                  aria-hidden="true"
                >
                  <ChevronIcon />
                </span>
              </button>

              {state.preparationExpanded && (
                <div id="bc-prep-panel" className={styles.expandableContent} role="region" aria-labelledby="bc-prep-title">
                  {preparation.checklist?.length ? (
                    <div className={styles.checklist}>
                      {preparation.checklist.map((item, i) => (
                        <div key={i} className={styles.checklistItem}>
                          <span className={styles.checklistIcon}>
                            <CheckIcon />
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {typeof preparation.prepTime === "number" && (
                    <div className={styles.timeline}>Estimated preparation time: {preparation.prepTime} minutes</div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Follow-up */}
        {followUp && (
          <section className={styles.section} aria-labelledby="bc-follow-title">
            <div className={styles.expandableSection}>
              <button
                type="button"
                className={styles.expandableHeader}
                onClick={() => toggleSection("followUp")}
                aria-expanded={!!state.followUpExpanded}
                aria-controls="bc-follow-panel"
                id="bc-follow-title"
              >
                <h3 className={styles.expandableTitle}>What Happens Next</h3>
                <span
                  className={`${styles.expandIcon} ${state.followUpExpanded ? styles.expanded : ""}`}
                  aria-hidden="true"
                >
                  <ChevronIcon />
                </span>
              </button>

              {state.followUpExpanded && (
                <div id="bc-follow-panel" className={styles.expandableContent} role="region" aria-labelledby="bc-follow-title">
                  <div className={styles.followUp}>
                    {followUp.nextSteps?.length ? (
                      <div className={styles.checklist}>
                        {followUp.nextSteps.map((step, i) => (
                          <div key={i} className={styles.checklistItem}>
                            <span className={styles.checklistIcon}>
                              <CheckIcon />
                            </span>
                            {step}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {followUp.timeline && <div className={styles.timeline}>{followUp.timeline}</div>}

                    {followUp.resources?.length ? (
                      <div className={styles.resources}>
                        {followUp.resources.map((r, i) => (
                          <a
                            key={i}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.resourceLink}
                            onClick={() => handleAction("resource_click", { title: r.title })}
                          >
                            <ExternalIcon /> {r.title}
                            {r.description && <div className={styles.resourceDescription}>{r.description}</div>}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Share */}
        {showShareOptions && !printMode && (
          <section className={styles.section} aria-labelledby="bc-share-title">
            <h3 id="bc-share-title" className={styles.sectionTitle}>
              <ShareIcon /> Share Confirmation
            </h3>
            <div className={styles.shareOptions}>
              <button
                type="button"
                className={`${styles.shareButton} ${state.copyStatus === "copied" ? styles.copied : ""}`}
                onClick={() => handleShare("link")}
                aria-live="polite"
              >
                <CopyIcon />
                {state.copyStatus === "copied" ? "Copied!" : "Copy Link"}
              </button>

              <button type="button" className={styles.shareButton} onClick={() => handleShare("email")}>
                <EmailIcon /> Email
              </button>

              <button type="button" className={styles.shareButton} onClick={() => handleShare("print")}>
                <PrintIcon /> Print
              </button>
            </div>
          </section>
        )}

        {state.error && <div className={styles.error} role="alert">{state.error}</div>}
      </main>
    </div>
  );
}
