// src/packages/sections/PackageDetailOverview/PackageDetailPhases/Phase4DetailsSection/Phase4DetailsSection.tsx
/**
 * Phase 4 — “Details & Trust”
 * =============================================================================
 * PURPOSE
 *  - Surface everything a buyer needs to feel confident moving forward:
 *      • Canonical pricing JSON (optional; mirrors authoring template)
 *      • Policy & process (timeline, requirements, ethics, limits)
 *      • Notes / small print (short clarifications, caveats)
 *      • Optional custom footer slot (e.g., compliance badges, trust cards)
 *
 * COMPOSITION
 *  - The *phase header* uses <PhaseSectionHeader/> to render:
 *      Title → Divider → Tagline
 *  - Each child “block” is wrapped in <SubSection/> which also renders a
 *      smaller Title → Divider → Tagline for consistency across phases.
 *
 * ACCESSIBILITY
 *  - The outer <section> is labeled by the phase header’s id via aria-labelledby.
 *  - Each <SubSection/> manages its own a11y (heading, grouping semantics).
 *
 * IMPORT PATHS (IMPORTANT)
 *  - Use the provided parts/ paths below (do NOT import from local “components”):
 *      PhaseSectionHeader → "@/packages/sections/PackageDetailOverview/parts/PhaseSectionHeader/PhaseSectionHeader"
 *      SubSection        → "@/packages/sections/PackageDetailOverview/parts/SubSection/SubSection"
 *
 * PERFORMANCE
 *  - This is a presentation/composition component. Heavy work (e.g., building
 *    HTML, fetching timeline data) should be done upstream and passed as props.
 */

"use client";

import * as React from "react";
import styles from "./Phase4DetailsSection.module.css";

/* ------------------------------- Child parts -------------------------------- */
import PackageDetailExtras from "@/packages/sections/PackageDetailExtras";
import PhaseSectionHeader from "@/packages/sections/PackageDetailOverview/parts/PhaseSectionHeader/PhaseSectionHeader";
import SubSection from "@/packages/sections/PackageDetailOverview/parts/SubSection/SubSection";

/* --------------------------------- Types ----------------------------------- */
export interface Phase4DetailsSectionProps {
  /** DOM id for the outer section; also used to derive stable nested ids. */
  id?: string;
  className?: string;
  style?: React.CSSProperties;

  /** Phase header copy */
  phaseTitle?: string;    // default: "Details & Trust"
  phaseTagline?: string;  // default: "Timeline, requirements, and guardrails"

  /**
   * Canonical extras bundle (timeline, ethics, requirements, limits, etc.)
   * This mirrors the public API for <PackageDetailExtras />.
   */
  extras?: React.ComponentProps<typeof PackageDetailExtras>;

  /**
   * Simple notes/small-print block. Kept permissive intentionally so callers
   * can pass any ReactNode (markdown/JSX) while retaining a hook for styling.
   */
  notes?: { className?: string; children: React.ReactNode };

  /**
   * If you want to mirror the authoring template strictly, you can optionally
   * render the pricing canonical object verbatim.
   */
  pricingJson?: Record<string, unknown> | null;

  /**
   * Optional slot for custom content you want at the end of this phase
   * (e.g., compliance badges, trust seals, certifications).
   */
  footerSlot?: React.ReactNode;
}

/* ----------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

function Phase4DetailsSection({
  id,
  className,
  style,

  phaseTitle = "Details & Trust",
  phaseTagline = "Timeline, requirements, and guardrails",

  extras,
  notes,
  pricingJson,
  footerSlot,
}: Phase4DetailsSectionProps) {
  /* ---------------------------- Presence checks ---------------------------- */
  // We consider the extras “present” if *any* of the well-known fields exist.
  const extrasHasTimeline =
    !!extras?.timeline?.setup || !!extras?.timeline?.launch || !!extras?.timeline?.ongoing;
  const extrasHasEthics = (extras?.ethics?.length ?? 0) > 0;

  // These are optional fields some implementations include in extras:
  const extrasHasRequirements =
    Array.isArray((extras as any)?.requirements) && ((extras as any).requirements.length ?? 0) > 0;
  const extrasHasLimits =
    Array.isArray((extras as any)?.limits) && ((extras as any).limits.length ?? 0) > 0;

  const showExtras = extrasHasTimeline || extrasHasEthics || extrasHasRequirements || extrasHasLimits;
  const showNotes = !!notes?.children;
  const showPricingJson = !!pricingJson && Object.keys(pricingJson).length > 0;
  const showFooter = !!footerSlot;

  // Nothing to render — keep the DOM clean.
  if (!showExtras && !showNotes && !showPricingJson && !showFooter) return null;

  const sectionClass = [styles.wrap, className].filter(Boolean).join(" ");

  /* --------------------------------- Render -------------------------------- */
  return (
    <section
      id={id}
      className={sectionClass}
      style={style}
      data-section="Phase4DetailsSection"
      aria-labelledby={id ? `${id}__heading` : undefined}
    >
      {/* ======================= Phase header (title/divider/tagline) ======================= */}
      <PhaseSectionHeader
        id={id ? `${id}__heading` : undefined}
        title={phaseTitle}
        tagline={phaseTagline}
        className={styles.phaseHeader}
      />

      {/* ========================== Pricing (canonical JSON) =========================== */}
      {showPricingJson ? (
        <SubSection
          id={id ? `${id}__pricing-json` : undefined}
          title="Pricing (canonical JSON)"
          tagline="Single source of truth for this package"
          className={styles.block}
          data-block="pricing-json"
        >
          {/* Preformatted for readability; keep it simple and accessible */}
          <pre className={styles.code} aria-label="Pricing JSON">
            {JSON.stringify(pricingJson, null, 2)}
          </pre>
        </SubSection>
      ) : null}

      {/* ============================== Policy & Process ============================== */}
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

      {/* ===================================== Notes ===================================== */}
      {showNotes ? (
        <SubSection
          id={id ? `${id}__notes` : undefined}
          title="Notes"
          tagline="Additional context & clarifications"
          className={styles.block}
          data-block="notes"
        >
          {/* Allow a style hook for the caller’s content while not imposing markup */}
          <div className={notes?.className}>{notes?.children}</div>
        </SubSection>
      ) : null}

      {/* ================================== Footer slot ================================== */}
      {showFooter ? (
        <SubSection
          id={id ? `${id}__footer` : undefined}
          title="Additional details"
          tagline="Trust badges, certifications, or compliance"
          className={styles.block}
          data-block="footer"
        >
          {footerSlot}
        </SubSection>
      ) : null}
    </section>
  );
}

export default React.memo(Phase4DetailsSection);
