// src/packages/sections/PackageDetailOverview/parts/Phase2WhySection/Phase2WhySection.tsx
import * as React from "react";
import styles from "./Phase2WhySection.module.css";

import { PurposeBlock } from "@/packages/sections/PackageDetailOverview/parts/PurposeBlock";
import { PainPointsBlock } from "@/packages/sections/PackageDetailOverview/parts/PainPointsBlock";
import { OutcomesBlock } from "@/packages/sections/PackageDetailOverview/parts/OutcomesBlock";

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
   * If provided, renders a small callout card between Purpose and the 2-column grid.
   */
  icpText?: string;

  /** Layout hooks */
  id?: string;
  className?: string;

  /**
   * When true, forces the lower grid (PainPoints/Outcomes) to stack in a single column
   * on desktop as well (useful for very dense lists).
   */
  stackOnDesktop?: boolean;
}

/**
 * Phase2WhySection
 * Phase 2 of the Packages Detail: “Why you need this”
 * - Purpose (narrative)
 * - Optional ICP callout (“Ideal for …” one-liner)
 * - Pain points (left) + Outcomes (right) in a responsive two-column grid
 *
 * All sub-blocks reuse the existing PDO parts to keep copy/props in sync.
 */
export function Phase2WhySection({
  purpose,
  painPoints,
  outcomes,
  icpText,
  id,
  className,
  stackOnDesktop = false,
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
    <section id={id} className={sectionClass} data-section="Phase2WhySection">
      {purpose ? (
        <div className={styles.row}>
          <PurposeBlock {...purpose} />
        </div>
      ) : null}

      {icpText ? (
        <aside className={styles.icp} aria-label="Ideal customer profile">
          <div className={styles.icpBadge} aria-hidden="true">Ideal for</div>
          <p className={styles.icpText}>{icpText}</p>
        </aside>
      ) : null}

      {(painPoints || outcomes) ? (
        <div className={styles.gridTwo}>
          <div className={styles.col}>
            {painPoints ? <PainPointsBlock {...painPoints} /> : null}
          </div>
          <div className={styles.col}>
            {outcomes ? <OutcomesBlock {...outcomes} /> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Phase2WhySection;
