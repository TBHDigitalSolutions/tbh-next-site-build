// src/packages/sections/PackageDetailExtras/PackageDetailExtras.tsx
"use client";

import * as React from "react";
import Divider from "@/components/ui/atoms/Divider/Divider";
import styles from "./PackageDetailExtras.module.css";

/* Local parts (re-exported to avoid duplication) */
import RequirementsBlock from "./RequirementsBlock";

export type TimelineItem = {
  title: string;
  note?: string;
  id?: string;
};

export type LegacyTimeline = {
  setup?: string;
  launch?: string;
  ongoing?: string;
};

export type PackageDetailExtrasProps = {
  /* ---- Timeline (new flexible + legacy fallback) ---- */
  timelineBlocks?: TimelineItem[];
  timeline?: LegacyTimeline;

  /* ---- Limits & Ethics ---- */
  ethics?: string[];
  limits?: string[];

  /* ---- Requirements (optional 3rd panel) ---- */
  requirements?: string[];
  requirementsTitle?: string;   // default: "Requirements"
  requirementsCaption?: string; // e.g., "What we need to get started"

  /* ---- Copy overrides (headers/taglines) ---- */
  timelineTitle?: string;     // default: "Timeline & Turnaround"
  timelineTagline?: string;   // default: "How we get you live and iterating."
  ethicsTitle?: string;       // default: "Limits & Ethics"
  ethicsTagline?: string;     // default: "Boundaries that keep outcomes fair and compliant."

  /* Back-compat aliases (kept for older callers) */
  /** @deprecated Use timelineTitle */
  timelineHeading?: string;
  /** @deprecated Use ethicsTitle */
  ethicsHeading?: string;

  /* ---- Utilities ---- */
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  "data-testid"?: string;
  ariaLabel?: string;
};

export default function PackageDetailExtras({
  timelineBlocks,
  timeline,
  ethics,
  limits,

  requirements,
  requirementsTitle = "Requirements",
  requirementsCaption,

  timelineTitle,
  timelineTagline,
  ethicsTitle,
  ethicsTagline,

  timelineHeading,
  ethicsHeading,

  className,
  style,
  id,
  "data-testid": testId = "package-detail-extras",
  ariaLabel,
}: PackageDetailExtrasProps) {
  /* --------------- Final copy (defaults + back-compat) ------------------- */
  const finalTimelineTitle =
    timelineTitle ?? timelineHeading ?? "Timeline & Turnaround";
  const finalTimelineTagline =
    timelineTagline ?? "How we get you live and iterating.";

  const finalEthicsTitle =
    ethicsTitle ?? ethicsHeading ?? "Limits & Ethics";
  const finalEthicsTagline =
    ethicsTagline ?? "Boundaries that keep outcomes fair and compliant.";

  /* --------------------------- Normalize timeline ------------------------ */
  const steps: TimelineItem[] = React.useMemo(() => {
    const fromBlocks =
      (timelineBlocks ?? [])
        .filter(Boolean)
        .map((b) => ({
          title: (b?.title ?? "").trim(),
          note: b?.note?.trim(),
          id: b?.id,
        }))
        .filter((b) => b.title.length > 0) || [];

    if (fromBlocks.length > 0) return fromBlocks.slice(0, 5);

    const derived: TimelineItem[] = [];
    if (timeline?.setup) derived.push({ title: "Setup", note: timeline.setup });
    if (timeline?.launch) derived.push({ title: "Launch", note: timeline.launch });
    if (timeline?.ongoing) derived.push({ title: "Ongoing", note: timeline.ongoing });
    return derived.slice(0, 5);
  }, [timelineBlocks, timeline]);

  const hasTimeline = steps.length > 0;
  const hasEthics = (ethics?.filter(Boolean).length ?? 0) > 0;
  const hasLimits = (limits?.filter(Boolean).length ?? 0) > 0;
  const hasRequirements = (requirements?.filter(Boolean).length ?? 0) > 0;

  if (!hasTimeline && !hasEthics && !hasLimits && !hasRequirements) return null;

  /* -------------------------------- Render -------------------------------- */
  return (
    <section
      id={id}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      style={style}
      aria-label={ariaLabel ?? "Additional package details"}
      data-testid={testId}
    >
      {/* ============================== TIMELINE ============================== */}
      {hasTimeline && (
        <section className={styles.block} aria-label="Timeline / Turnaround">
          <header className={styles.hgroup}>
            <div className={styles.hpair}>
              <h2 className={styles.hTitle}>{finalTimelineTitle}</h2>
              <Divider className={styles.hRule} />
            </div>
            {finalTimelineTagline ? (
              <div className={styles.hTaglineWrap}>
                <p className={styles.hTagline}>{finalTimelineTagline}</p>
              </div>
            ) : null}
          </header>

          <ol className={styles.timeline} aria-label="Project timeline">
            {steps.map((step, i) => {
              const key = step.id ?? `${step.title}-${i}`;
              const index = i + 1;
              const isLast = i === steps.length - 1;
              return (
                <React.Fragment key={key}>
                  <li
                    className={styles.step}
                    aria-label={`${step.title}${step.note ? ` — ${step.note}` : ""}`}
                  >
                    <div className={styles.stepCard}>
                      <div className={styles.stepIndex} aria-hidden="true">
                        {index}
                      </div>
                      <div className={styles.stepBody}>
                        <div className={styles.stepTitle}>{step.title}</div>
                        {step.note ? <p className={styles.stepNote}>{step.note}</p> : null}
                      </div>
                    </div>
                  </li>

                  {!isLast && (
                    <li className={styles.connector} aria-hidden="true">
                      <span className={styles.line} />
                      <span className={styles.chevron} />
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>
        </section>
      )}

      {/* ============================= REQUIREMENTS ========================== */}
      {hasRequirements && (
        <section className={styles.block} aria-label="Requirements">
          <header className={styles.hgroup}>
            <div className={styles.hpair}>
              <h2 className={styles.hTitle}>{requirementsTitle}</h2>
              <Divider className={styles.hRule} />
            </div>
            {requirementsCaption ? (
              <div className={styles.hTaglineWrap}>
                <p className={styles.hTagline}>{requirementsCaption}</p>
              </div>
            ) : null}
          </header>

          <RequirementsBlock
            items={requirements!.filter(Boolean)}
            title={requirementsTitle}
            caption={requirementsCaption}
          />
        </section>
      )}

      {/* =========================== LIMITS & ETHICS ========================== */}
      {(hasEthics || hasLimits) && (
        <section className={styles.block} aria-label="Limits and Ethics">
          <header className={styles.hgroup}>
            <div className={styles.hpair}>
              <h2 className={styles.hTitle}>{finalEthicsTitle}</h2>
              <Divider className={styles.hRule} />
            </div>
            {finalEthicsTagline ? (
              <div className={styles.hTaglineWrap}>
                <p className={styles.hTagline}>{finalEthicsTagline}</p>
              </div>
            ) : null}
          </header>

          {hasEthics && (
            <ul className={styles.ethicsList} aria-label="Ethics">
              {ethics!.filter(Boolean).map((e, i) => (
                <li key={`ethic-${i}`}>{e}</li>
              ))}
            </ul>
          )}

          {hasLimits && (
            <ul className={styles.limitsList} aria-label="Limits">
              {limits!.filter(Boolean).map((l, i) => (
                <li key={`limit-${i}`}>{l}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </section>
  );
}
