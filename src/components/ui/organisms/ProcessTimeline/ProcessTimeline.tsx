// src/components/features/about/ProcessTimeline/ProcessTimeline.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./ProcessTimeline.module.css";

/* =========================================================
   Types
========================================================= */

export type DurationUnit = "days" | "weeks";
export type Owner = "client" | "studio" | "shared";

export type DurationObject = { min: number; max: number; unit: DurationUnit };

export type TimelinePhase = {
  id: string;
  stepNumber?: number;
  title: string;
  description: string;
  icon?: string;

  /** Accepts string, structured object, or both (for resilience) */
  duration?: string | DurationObject;
  /** Explicit label if you store it separately (e.g., "1–2 weeks") */
  durationLabel?: string;
  /** Explicit structured data */
  durationData?: DurationObject;

  activities?: string[];
  clientInputs?: string[];
  deliverables?: string[];
  approval?: string;
  owner?: Owner;
  status?: "upcoming" | "active" | "complete";
};

export interface ProcessTimelineProps {
  title?: string;
  subtitle?: string;
  /** Preferred */
  phases?: TimelinePhase[];
  /** Back-compat: accepts `steps` and maps into phases */
  steps?: Partial<TimelinePhase>[];
  className?: string;

  /* UI */
  variant?: "vertical" | "detailed";
  interactive?: boolean;
  showProgress?: boolean;

  /* New options */
  showActivities?: boolean;
  showClientInputs?: boolean;
  showApproval?: boolean;
  collapsible?: boolean;
  /** Which panel opens initially; "all" expands all (default). */
  defaultOpen?: number | "all";
  /** Show computed total (e.g., “Typical timeline: 6–10 weeks”). */
  showSummary?: boolean;

  /** Optional per-phase CTA renderer */
  ctaRenderer?: (phase: TimelinePhase) => React.ReactNode;
}

/* =========================================================
   Helpers
========================================================= */

/** Parse strings like "1–2 weeks", "1-2 weeks", "5 days" */
function parseDurationLabel(label?: unknown): DurationObject | null {
  if (!label) return null;
  if (typeof label === "object") {
    const lo = label as Partial<DurationObject>;
    if (
      typeof lo.min === "number" &&
      typeof lo.max === "number" &&
      (lo.unit === "weeks" || lo.unit === "days")
    ) {
      return { min: lo.min, max: lo.max, unit: lo.unit };
    }
    return null;
  }
  if (typeof label !== "string") return null;

  const cleaned = label.trim().toLowerCase();

  const rangeMatch = cleaned.match(
    /(\d+(?:\.\d+)?)\s*[–-]\s*(\d+(?:\.\d+)?)\s*(week|weeks|day|days)/
  );
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    const unit: DurationUnit = rangeMatch[3].startsWith("week")
      ? "weeks"
      : "days";
    return { min, max, unit };
  }

  const singleMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(week|weeks|day|days)/);
  if (singleMatch) {
    const n = parseFloat(singleMatch[1]);
    const unit: DurationUnit = singleMatch[2].startsWith("week")
      ? "weeks"
      : "days";
    return { min: n, max: n, unit };
  }

  return null;
}

const toDays = (n: number, unit: DurationUnit) => (unit === "weeks" ? n * 7 : n);

function formatDaysRange(minDays: number, maxDays: number) {
  const bothWeeks = minDays % 7 === 0 && maxDays % 7 === 0;
  if (bothWeeks) {
    const minW = Math.round(minDays / 7);
    const maxW = Math.round(maxDays / 7);
    return `${minW}–${maxW} weeks`;
  }
  return `${minDays}–${maxDays} days`;
}

function formatDurationLabelFromData(d?: DurationObject | null): string | null {
  if (!d) return null;
  if (d.min === d.max) {
    return d.unit === "weeks"
      ? `${d.min} week${d.min === 1 ? "" : "s"}`
      : `${d.min} day${d.min === 1 ? "" : "s"}`;
  }
  return `${d.min}–${d.max} ${d.unit}`;
}

/** Derive both label (string) and data (object) from any combination */
function deriveDuration(p: TimelinePhase): { label: string | null; data?: DurationObject } {
  // 1) Explicit data wins
  let data = p.durationData ?? null;

  // 2) If duration is object, prefer it
  if (!data && typeof p.duration === "object") {
    data = parseDurationLabel(p.duration);
  }

  // 3) If duration is a string or durationLabel provided, parse string to data if needed
  const labelCandidate =
    (typeof p.duration === "string" ? p.duration : undefined) ??
    p.durationLabel ??
    null;

  if (!data && labelCandidate) {
    data = parseDurationLabel(labelCandidate);
  }

  // 4) Choose display label
  const label =
    (typeof p.duration === "string" && p.duration) ||
    p.durationLabel ||
    formatDurationLabelFromData(data);

  return { label: label ?? null, data: data ?? undefined };
}

/** Prefer `phases`; fallback to `steps` (for backward-compat). */
function useNormalizedPhases(props: ProcessTimelineProps): TimelinePhase[] {
  const { phases, steps } = props;
  return useMemo(() => {
    const base = (phases && phases.length ? phases : steps ?? []) as TimelinePhase[];
    return base.map((p, i) => {
      const stepNumber = p.stepNumber ?? i + 1;
      const { label, data } = deriveDuration(p);
      return {
        ...p,
        stepNumber,
        durationLabel: label ?? p.durationLabel,
        durationData: data ?? p.durationData,
      };
    });
  }, [phases, steps]);
}

/* =========================================================
   Component
========================================================= */

const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
  title = "Our Production Process",
  subtitle,
  phases,
  steps,
  className,
  variant = "vertical",
  interactive = true,
  showProgress = false, // reserved for future visual progress
  showActivities = true,
  showClientInputs = true,
  showApproval = true,
  collapsible = true,
  defaultOpen = "all",
  showSummary = true,
  ctaRenderer,
}) => {
  const items = useNormalizedPhases({ phases, steps });

  // Compute “Typical timeline” summary
  const total = useMemo(() => {
    let min = 0,
      max = 0,
      hasAny = false;
    items.forEach((p) => {
      const d =
        p.durationData ??
        parseDurationLabel(p.duration) ??
        parseDurationLabel(p.durationLabel);
      if (d) {
        min += toDays(d.min, d.unit);
        max += toDays(d.max, d.unit);
        hasAny = true;
      }
    });
    return hasAny ? formatDaysRange(min, max) : null;
  }, [items]);

  // Expand/collapse state
  const [openSet, setOpenSet] = useState<Set<number>>(() => {
    if (defaultOpen === "all") return new Set(items.map((_, idx) => idx));
    if (typeof defaultOpen === "number") return new Set([defaultOpen]);
    return new Set();
  });

  // Sync when item count changes
  useEffect(() => {
    if (defaultOpen === "all") {
      setOpenSet(new Set(items.map((_, idx) => idx)));
    }
  }, [items.length, defaultOpen]);

  const toggle = (idx: number) => {
    if (!collapsible) return;
    setOpenSet((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const isOpen = (idx: number) => openSet.has(idx);

  const phaseClass = (p: TimelinePhase, idx: number) => {
    const arr = [styles.item];
    if (p.status === "active") arr.push(styles.active);
    if (p.status === "complete") arr.push(styles.complete);
    if (isOpen(idx)) arr.push(styles.expanded);
    return arr.join(" ");
  };

  return (
    <section
      className={[styles.timeline, styles[`variant-${variant}`], className || ""].join(
        " "
      )}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {showSummary && total && (
          <p className={styles.summary} aria-live="polite">
            Typical timeline: {total}
          </p>
        )}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>

      <div className={styles.container}>
        <div className={styles.line} aria-hidden />
        <ol className={styles.list} aria-label="Production process">
          {items.map((p, idx) => {
            const { label } = deriveDuration(p);
            return (
              <li key={p.id || idx} id={p.id} className={phaseClass(p, idx)}>
                {/* Marker + icon */}
                <div className={styles.marker} aria-hidden>
                  {p.icon && (
                    <span className={styles.markerIcon} role="img" aria-label="">
                      {p.icon}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className={styles.content}>
                  <div className={styles.head}>
                    <div className={styles.phaseMeta}>
                      <span className={styles.stepLabel}>Step :</span>
                      <span className={styles.stepNumber}>{p.stepNumber}</span>
                    </div>

                    <div className={styles.titleWrap}>
                      <h3 className={styles.phaseTitle}>{p.title}</h3>
                      {label && (
                        <span
                          className={styles.badge}
                          aria-label={`Estimated duration ${label}`}
                        >
                          {label}
                        </span>
                      )}
                    </div>

                    {p.description && (
                      <p className={styles.description}>{p.description}</p>
                    )}

                    {collapsible && (
                      <button
                        type="button"
                        className={styles.toggle}
                        aria-expanded={isOpen(idx)}
                        aria-controls={`${p.id}-details`}
                        onClick={() => toggle(idx)}
                      >
                        <span className={styles.toggleIcon} aria-hidden>
                          ▾
                        </span>
                        {isOpen(idx) ? "Hide details" : "Show details"}
                      </button>
                    )}
                  </div>

                  {/* Details */}
                  <div
                    id={`${p.id}-details`}
                    className={styles.details}
                    hidden={!isOpen(idx)}
                  >
                    {showActivities && p.activities?.length ? (
                      <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Activities</h4>
                        <ul className={styles.bullets}>
                          {p.activities.map((a, i) => (
                            <li key={`act-${p.id}-${i}`}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {showClientInputs && p.clientInputs?.length ? (
                      <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>What we need from you</h4>
                        <ul className={styles.bullets}>
                          {p.clientInputs.map((a, i) => (
                            <li key={`inp-${p.id}-${i}`}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {p.deliverables?.length ? (
                      <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Key Deliverables</h4>
                        <ul className={styles.bullets}>
                          {p.deliverables.map((d, i) => (
                            <li key={`del-${p.id}-${i}`}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {showApproval && p.approval ? (
                      <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Approval Gate</h4>
                        <p className={styles.note}>{p.approval}</p>
                      </div>
                    ) : null}

                    {ctaRenderer && (
                      <div className={styles.footer}>
                        <div className={styles.ctaSlot}>{ctaRenderer(p)}</div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default ProcessTimeline;
