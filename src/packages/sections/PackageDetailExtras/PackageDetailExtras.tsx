// src/packages/sections/PackageDetailExtras/PackageDetailExtras.tsx
/**
 * PackageDetailExtras
 * =============================================================================
 * Purpose
 * -------
 * Renders the “extras” panel for a Package detail page:
 *   • Timeline (setup → launch → ongoing)
 *   • Requirements (access/integrations we need)
 *   • Limits & Ethics (guardrails and boundaries)
 *
 * Schema alignment
 * ----------------
 * This component **reuses** the exact shapes validated at build-time by the
 * registry `PackageSchema`. We import `PackageMetadata` (the type derived from
 * that Zod schema) and compose our props from it so UI and data remain in lockstep.
 *
 *   - `timeline`     → Picked from `PackageMetadata["timeline"]`
 *   - `ethics`       → Picked from `PackageMetadata["ethics"]`
 *   - `requirements` → Picked from `PackageMetadata["requirements"]`
 *
 * Extra ergonomics
 * ----------------
 * - Supports an optional `timelineBlocks` prop for callers that prefer a fully
 *   authored set of timeline steps (title/note). If not provided, we derive
 *   steps from the simple `timeline` (setup/launch/ongoing) provided by schema.
 * - `limits` is supported as a non-schema array for legacy/back-compat; you can
 *   remove it once all callers migrate to `ethics`.
 * - Copy overrides are provided for headings/taglines and we keep a pair of
 *   **deprecated** aliases to avoid breaking older callers.
 *
 * Accessibility
 * -------------
 * - Each sub-section renders a semantic heading and a <Divider/> for a11y and
 *   visual consistency with other Phase components.
 * - Lists include aria-labels and stable keys.
 */

"use client";

import * as React from "react";
import Divider from "@/components/ui/atoms/Divider/Divider";
import styles from "./PackageDetailExtras.module.css";

import type { PackageMetadata } from "@/types/package";
import RequirementsBlock from "./RequirementsBlock";

/* ----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export type TimelineItem = {
  /** Short step title, e.g., “Setup”, “Launch”, “Ongoing” */
  title: string;
  /** Optional one-liner shown beneath the title */
  note?: string;
  /** Optional stable id (used as React key when provided) */
  id?: string;
};

/**
 * Public prop surface for the Extras panel.
 * We reuse shapes from the validated registry object to prevent drift.
 */
export type PackageDetailExtrasProps =
  Pick<PackageMetadata, "timeline" | "ethics" | "requirements"> & {
    /** Optional fully-authored steps; overrides `timeline` if present */
    timelineBlocks?: TimelineItem[];

    /** Legacy/optional list separate from `ethics`. Prefer `ethics`. */
    limits?: string[];

    /* ---- Copy overrides (headers/taglines) ---- */
    requirementsTitle?: string;   // default: "Requirements"
    requirementsCaption?: string; // e.g., "What we need to get started"
    timelineTitle?: string;       // default: "Timeline & Turnaround"
    timelineTagline?: string;     // default: "How we get you live and iterating."
    ethicsTitle?: string;         // default: "Limits & Ethics"
    ethicsTagline?: string;       // default: "Boundaries that keep outcomes fair and compliant."

    /** @deprecated Use `timelineTitle` */
    timelineHeading?: string;
    /** @deprecated Use `ethicsTitle` */
    ethicsHeading?: string;

    /* ---- Utilities ---- */
    className?: string;
    style?: React.CSSProperties;
    id?: string;
    "data-testid"?: string;
    ariaLabel?: string;
  };

/* ----------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function PackageDetailExtras({
  /* Schema-aligned fields */
  timeline,
  ethics,
  requirements,

  /* Optional authored timeline */
  timelineBlocks,
  /* Legacy non-schema field (kept for back-compat) */
  limits,

  /* Copy overrides */
  requirementsTitle = "Requirements",
  requirementsCaption,

  timelineTitle,
  timelineTagline,
  ethicsTitle,
  ethicsTagline,

  /* Deprecated aliases */
  timelineHeading,
  ethicsHeading,

  /* Utilities */
  className,
  style,
  id,
  "data-testid": testId = "package-detail-extras",
  ariaLabel,
}: PackageDetailExtrasProps) {
  /* -------------------------------- Headings -------------------------------- */

  const finalTimelineTitle =
    timelineTitle ?? timelineHeading ?? "Timeline & Turnaround";
  const finalTimelineTagline =
    timelineTagline ?? "How we get you live and iterating.";

  const finalEthicsTitle = ethicsTitle ?? ethicsHeading ?? "Limits & Ethics";
  const finalEthicsTagline =
    ethicsTagline ??
    "Boundaries that keep outcomes fair and compliant.";

  /* ---------------------------- Normalize timeline --------------------------- */
  /**
   * Compute the ordered steps to render in the timeline. We accept:
   *   1) `timelineBlocks` (fully-authored, preferred when provided)
   *   2) Derived steps from the simple schema `timeline` (setup/launch/ongoing)
   *
   * We keep a conservative cap (5 steps) to avoid layout overflow.
   */
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

  /* --------------------------------- Guards --------------------------------- */

  const hasTimeline = steps.length > 0;
  const hasEthics = (ethics?.filter(Boolean).length ?? 0) > 0;
  const hasLimits = (limits?.filter(Boolean).length ?? 0) > 0;
  const hasRequirements = (requirements?.filter(Boolean).length ?? 0) > 0;

  // If every panel would be empty, render nothing
  if (!hasTimeline && !hasEthics && !hasLimits && !hasRequirements) return null;

  /* -------------------------------- Render ---------------------------------- */

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
