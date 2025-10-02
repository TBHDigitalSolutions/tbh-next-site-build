/**
 * Phase 2 — "Why You Need This"
 * =============================================================================
 * PURPOSE
 *  - Presents the rationale for the package using four logical blocks:
 *    1) Purpose (narrative of success / "what good looks like")
 *    2) ICP one-liner ("Ideal for …")
 *    3) Pain points (common challenges this solves)
 *    4) Outcomes (KPI-style results customers can expect)
 *
 * ACCESSIBILITY & STRUCTURE
 *  - The *phase* itself has a consistent header — Title → Divider → Tagline —
 *    via <PhaseSectionHeader/> to match your design system.
 *  - Each inner block is wrapped by <SubSection/>, which also renders a small
 *    header (Title → Divider → optional Tagline), keeping a predictable
 *    hierarchy and ARIA semantics (`aria-labelledby` for each group).
 *
 * LAYOUT
 *  - Top: Purpose (full width)
 *  - Middle (optional): ICP callout (full width)
 *  - Bottom: Two-column responsive grid → Pain Points (left) + Outcomes (right)
 *  - When `stackOnDesktop` is true, the bottom grid will stack as a single
 *    column even on desktop (useful for dense content).
 *
 * IMPORTS
 *  - IMPORTANT: use the *parts/* paths you provided for PhaseSectionHeader/SubSection.
 *    Avoid ad-hoc component paths so we don’t introduce export mismatches.
 *
 * PERFORMANCE
 *  - This component contains only light composition logic. Expensive work
 *    (markdown → HTML, data fetching, etc.) should be performed upstream.
 */

"use client";

import * as React from "react";
import styles from "./Phase2WhySection.module.css";

/* ------------------------------- PDO parts -------------------------------- */
import { PurposeBlock } from "@/packages/sections/PackageDetailOverview/parts/PurposeBlock";
import { PainPointsBlock } from "@/packages/sections/PackageDetailOverview/parts/PainPointsBlock";
import OutcomesBlock from "@/packages/sections/PackageDetailOverview/parts/OutcomesBlock";

/* --------------------- Headers / wrappers (use these paths) ---------------- */
import PhaseSectionHeader from "@/packages/sections/PackageDetailOverview/parts/PhaseSectionHeader/PhaseSectionHeader";
import SubSection from "@/packages/sections/PackageDetailOverview/parts/SubSection/SubSection";

/* ------------------------------- Public types ------------------------------ */
export type PurposeBlockProps = React.ComponentProps<typeof PurposeBlock>;
export type PainPointsBlockProps = React.ComponentProps<typeof PainPointsBlock>;
export type OutcomesBlockProps = React.ComponentProps<typeof OutcomesBlock>;

export interface Phase2WhySectionProps {
  /** Narrative of what success looks like (HTML preferred via build). */
  purpose?: PurposeBlockProps;
  /** Common challenges this package addresses. */
  painPoints?: PainPointsBlockProps;
  /** KPI-style outcomes customers can expect. */
  outcomes?: OutcomesBlockProps;

  /**
   * Optional “Ideal for” one-liner (ICP).
   * When present, renders a compact card between Purpose and the grid.
   */
  icpText?: string;

  /** Layout hooks */
  id?: string;
  className?: string;

  /**
   * When true, forces the lower grid (PainPoints/Outcomes) to stack in a single
   * column on desktop as well (useful for very dense lists).
   */
  stackOnDesktop?: boolean;

  /** Phase header copy (shown at the top of this section) */
  phaseTitle?: string;    // default: "Why you need this"
  phaseTagline?: string;  // default: "Common problems, purpose & outcomes"
}

/* ----------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

function Phase2WhySection({
  purpose,
  painPoints,
  outcomes,
  icpText,
  id,
  className,
  stackOnDesktop = false,
  phaseTitle = "Why you need this",
  phaseTagline = "Common problems, purpose & outcomes",
}: Phase2WhySectionProps) {
  const hasAny =
    !!purpose ||
    !!icpText ||
    (painPoints && (painPoints.items?.length ?? 0) > 0) ||
    (outcomes && ((outcomes as any).items?.length ?? 0) > 0);

  if (!hasAny) return null;

  const sectionClass = [
    styles.wrap,
    stackOnDesktop ? styles.stackDesktop : styles.splitDesktop,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      id={id}
      className={sectionClass}
      data-section="Phase2WhySection"
      aria-labelledby={id ? `${id}__heading` : undefined}
    >
      {/* ===== Phase header (title/divider/tagline) ===== */}
      <PhaseSectionHeader
        id={id ? `${id}__heading` : undefined}
        title={phaseTitle}
        tagline={phaseTagline}
        className={styles.phaseHeader}
      />

      {/* ================= Purpose ================= */}
      {purpose ? (
        <SubSection
          id={id ? `${id}__purpose` : undefined}
          title="Purpose"
          tagline="What good looks like"
          className={styles.row}
          data-block="purpose"
        >
          <PurposeBlock {...purpose} />
        </SubSection>
      ) : null}

      {/* =================== ICP =================== */}
      {icpText ? (
        <SubSection
          id={id ? `${id}__icp` : undefined}
          title="Ideal for"
          tagline="Audience fit in one line"
          className={styles.icp}
          data-block="icp"
        >
          <div className={styles.icpBadge} aria-hidden="true">
            Ideal for
          </div>
          <p className={styles.icpText}>{icpText}</p>
        </SubSection>
      ) : null}

      {/* ========== Two-column grid (Pain / Outcomes) ========== */}
      {(painPoints || outcomes) ? (
        <div className={styles.gridTwo}>
          <div className={styles.col}>
            {painPoints ? (
              <SubSection
                id={id ? `${id}__pain-points` : undefined}
                title="Why this matters"
                tagline="Common pain points this solves"
                data-block="pain-points"
              >
                <PainPointsBlock {...painPoints} />
              </SubSection>
            ) : null}
          </div>

          <div className={styles.col}>
            {outcomes ? (
              <SubSection
                id={id ? `${id}__outcomes` : undefined}
                title="Expected outcomes"
                tagline="KPIs you can expect"
                data-block="outcomes"
              >
                <OutcomesBlock {...outcomes} />
              </SubSection>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default React.memo(Phase2WhySection);
