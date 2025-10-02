/**
 * Phase 4 — "Details & Trust"
 * =============================================================================
 * PURPOSE
 *  - Provide operational clarity: timeline, requirements, ethics/limits,
 *    optional pricing JSON (for debugging/author visibility), and notes.
 *
 * ACCESSIBILITY & STRUCTURE
 *  - Phase heading via <PhaseSectionHeader/>.
 *  - Each logical block within a <SubSection/> for standardized semantics.
 *
 * NOTES
 *  - `PackageDetailExtras` is a high-level presenter for timeline/ethics/
 *    requirements/limits. Pass through the validated content object.
 */

"use client";

import * as React from "react";
import styles from "./Phase4DetailsSection.module.css";

import PackageDetailExtras from "@/packages/sections/PackageDetailExtras";

/* ---- Correct wrapper paths ---- */
import PhaseSectionHeader from "@/packages/sections/PackageDetailOverview/parts/PhaseSectionHeader/PhaseSectionHeader";
import SubSection from "@/packages/sections/PackageDetailOverview/parts/SubSection/SubSection";

export interface Phase4DetailsSectionProps {
  id?: string;
  className?: string;

  /** Phase header copy */
  phaseTitle?: string;    // default: "Details & Trust"
  phaseTagline?: string;  // default: "Timeline, requirements, and guardrails"

  /** Extras bundle (timeline, ethics, requirements, limits) */
  extras?: React.ComponentProps<typeof PackageDetailExtras>;

  /** Optional notes block (small print) */
  notes?: { className?: string; children: React.ReactNode };

  /** Optional raw pricing JSON display (mirrors template strictly; mainly for debug) */
  pricingJson?: Record<string, unknown> | null;
}

function Phase4DetailsSection({
  id,
  className,
  phaseTitle = "Details & Trust",
  phaseTagline = "Timeline, requirements, and guardrails",
  extras,
  notes,
  pricingJson,
}: Phase4DetailsSectionProps) {
  const sectionClass = [styles.wrap, className].filter(Boolean).join(" ");

  const showExtras =
    !!extras?.timeline?.setup ||
    !!extras?.timeline?.launch ||
    !!extras?.timeline?.ongoing ||
    (extras as any)?.requirements?.length > 0 ||
    (extras as any)?.ethics?.length > 0 ||
    (extras as any)?.limits?.length > 0;

  const showNotes = !!notes?.children;
  const showPricingJson = !!pricingJson && Object.keys(pricingJson).length > 0;

  if (!showExtras && !showNotes && !showPricingJson) return null;

  return (
    <section id={id} className={sectionClass} data-section="Phase4DetailsSection" aria-labelledby={id ? `${id}__heading` : undefined}>
      <PhaseSectionHeader
        id={id ? `${id}__heading` : undefined}
        title={phaseTitle}
        tagline={phaseTagline}
        className={styles.phaseHeader}
      />

      {showPricingJson ? (
        <SubSection
          id={id ? `${id}__pricing` : undefined}
          title="Pricing (canonical JSON)"
          tagline="Single source of truth for this package"
          className={styles.block}
          data-block="pricing-json"
        >
          <pre className={styles.code} aria-label="Pricing JSON">
            {JSON.stringify(pricingJson, null, 2)}
          </pre>
        </SubSection>
      ) : null}

      {showExtras ? (
        <SubSection
          id={id ? `${id}__extras` : undefined}
          title="Policy & process"
          tagline="Timeline, ethics, requirements, and limits"
          className={styles.block}
          data-block="extras"
        >
          <PackageDetailExtras {...(extras as any)} />
        </SubSection>
      ) : null}

      {showNotes ? (
        <SubSection
          id={id ? `${id}__notes` : undefined}
          title="Notes"
          tagline="Additional context & clarifications"
          className={styles.block}
          data-block="notes"
        >
          <div className={notes?.className}>{notes?.children}</div>
        </SubSection>
      ) : null}
    </section>
  );
}

export default React.memo(Phase4DetailsSection);
