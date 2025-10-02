// src/packages/sections/PackageDetailOverview/PackageDetailPhases/Phase5NextSection/Phase5NextSection.tsx
/**
 * Phase 5 — “What’s next”
 * =============================================================================
 * PURPOSE
 *  - Close the page with clear next steps and helpful navigation:
 *      • CTA row (primary + secondary)
 *      • FAQs (to preempt objections)
 *      • Related packages & Add-ons rails (cross-sell / attachables)
 *      • Optional small notes block
 *
 * CONSISTENT STRUCTURE
 *  - Each *phase* begins with a standard header (Title → Divider → Tagline)
 *    using <PhaseSectionHeader/>.
 *  - Each *child block* in the phase (CTAs, FAQs, rails, notes) is wrapped in
 *    <SubSection/>, which provides a smaller Title → Divider → Tagline header
 *    and section semantics. This matches your requirement that “each phase
 *    should have a title with an underline and divider component with a
 *    tagline, and then each of the components inside should also have a
 *    header + divider + tagline.”
 *
 * ACCESSIBILITY
 *  - Phase header gets a stable id (`${id}__heading`) so the outer <section>
 *    can use aria-labelledby.
 *  - Each <SubSection/> manages its own heading semantics for screen readers.
 *
 * IMPORT PATHS (IMPORTANT)
 *  - The two wrapper parts below MUST be imported from the provided paths:
 *      PhaseSectionHeader → "@/packages/sections/PackageDetailOverview/parts/PhaseSectionHeader/PhaseSectionHeader"
 *      SubSection        → "@/packages/sections/PackageDetailOverview/parts/SubSection/SubSection"
 *
 * PERFORMANCE
 *  - This is a presentational composition layer. Normalize data upstream
 *    (e.g., FAQ arrays) and pass them in; this component only maps & renders.
 */

"use client";

import * as React from "react";
import styles from "./Phase5NextSection.module.css";

/* ------------------------------- PDO parts -------------------------------- */
import CTARow from "@/packages/sections/PackageDetailOverview/parts/CTARow/CTARow";
import FAQSection from "@/components/sections/section-layouts/FAQSection";
import RelatedItemsRail from "@/packages/components/RelatedItemsRail";

/* ----------- Headers / wrappers (use provided parts/* import paths) -------- */
import PhaseSectionHeader from "@/packages/sections/PackageDetailOverview/parts/PhaseSectionHeader/PhaseSectionHeader";
import SubSection from "@/packages/sections/PackageDetailOverview/parts/SubSection/SubSection";

/* --------------------------------- Types ---------------------------------- */
type Cta = { label: string; href: string };

export interface Phase5NextSectionProps {
  /** DOM id for the outer phase section (also used to derive nested ids). */
  id?: string;

  /** Optional class/style hooks for the outer wrapper. */
  className?: string;
  style?: React.CSSProperties;

  /** Phase header copy (top of the phase). */
  phaseTitle?: string;   // default: "What’s next"
  phaseTagline?: string; // default: "How to proceed and what else to explore"

  /**
   * CTA row — small horizontal button row for detail pages.
   * If neither `primary` nor `secondary` is provided, this block is omitted.
   */
  ctaRow?: {
    primary?: Cta;
    secondary?: Cta;
    align?: "start" | "center";
  };

  /**
   * FAQs — minimal flat list used by your site-wide <FAQSection/>.
   * If empty/omitted, the FAQ block is omitted.
   */
  faqs?: Array<{ id?: string | number; question?: string; answer?: string }>;

  /**
   * Cross-sell rails (optional).
   * These forward the public props for your <RelatedItemsRail /> component,
   * keeping this phase decoupled from card/item specifics.
   */
  relatedRail?: React.ComponentProps<typeof RelatedItemsRail>;
  addOnsRail?: React.ComponentProps<typeof RelatedItemsRail>;

  /** Final notes/small print (optional). */
  notes?: React.ReactNode;

  /**
   * Layout: when true, rails render in a single column on desktop as well.
   * (Useful for very dense rails or narrow page layouts.)
   */
  stackRailsOnDesktop?: boolean;
}

/* ----------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

function Phase5NextSection({
  id,
  className,
  style,

  phaseTitle = "What’s next",
  phaseTagline = "How to proceed and what else to explore",

  ctaRow,
  faqs = [],
  relatedRail,
  addOnsRail,
  notes,
  stackRailsOnDesktop = false,
}: Phase5NextSectionProps) {
  /* ------------------------------- Presence flags -------------------------- */
  const hasCtas = !!(ctaRow?.primary || ctaRow?.secondary);
  const hasFaqs = (faqs?.length ?? 0) > 0;
  const hasRelated = !!relatedRail && (Array.isArray((relatedRail as any).items) ? (relatedRail as any).items.length > 0 : true);
  const hasAddOns = !!addOnsRail && (Array.isArray((addOnsRail as any).items) ? (addOnsRail as any).items.length > 0 : true);
  const hasNotes = !!notes;

  // Nothing to render — keep DOM clean
  if (!hasCtas && !hasFaqs && !hasRelated && !hasAddOns && !hasNotes) return null;

  const sectionClass = [styles.wrap, className].filter(Boolean).join(" ");
  const railsGridClass = [
    styles.railsGrid,
    stackRailsOnDesktop ? styles.stackDesktop : styles.splitDesktop,
  ]
    .filter(Boolean)
    .join(" ");

  /* ---------------------------------- Render -------------------------------- */
  return (
    <section
      id={id}
      className={sectionClass}
      style={style}
      data-section="Phase5NextSection"
      aria-labelledby={id ? `${id}__heading` : undefined}
    >
      {/* ======================= Phase header (title/divider/tagline) ======================= */}
      <PhaseSectionHeader
        id={id ? `${id}__heading` : undefined}
        title={phaseTitle}
        tagline={phaseTagline}
        className={styles.phaseHeader}
      />

      {/* =================================== CTA Row ==================================== */}
      {hasCtas ? (
        <SubSection
          id={id ? `${id}__cta` : undefined}
          title="Get started"
          tagline="Choose the next best step"
          className={styles.block}
          data-block="cta-row"
        >
          <CTARow
            primary={ctaRow?.primary}
            secondary={ctaRow?.secondary}
            align={ctaRow?.align ?? "center"}
          />
        </SubSection>
      ) : null}

      {/* ===================================== FAQs ===================================== */}
      {hasFaqs ? (
        <SubSection
          id={id ? `${id}__faqs` : undefined}
          title="FAQs"
          tagline="Answers to common questions"
          className={styles.block}
          data-block="faqs"
        >
          <FAQSection
            id={id ? `${id}__faqs-accordion` : "phase5-faq"}
            title=""
            faqs={faqs.map((f, i) => ({
              id: String(f?.id ?? i),
              question: f?.question,
              answer: f?.answer,
            }))}
            variant="default"
            allowMultiple={false}
            enableSearch={true}
            enableCategoryFilter={false}
            searchPlaceholder="Search FAQs"
          />
        </SubSection>
      ) : null}

      {/* ============================== Cross-sell Rails =============================== */}
      {(hasRelated || hasAddOns) ? (
        <div className={railsGridClass}>
          {/* Related packages rail */}
          {hasRelated ? (
            <SubSection
              id={id ? `${id}__related` : undefined}
              title={(relatedRail as any)?.title ?? "Related packages"}
              tagline={(relatedRail as any)?.subtitle ?? "You may also be interested in"}
              className={styles.railCol}
              data-block="related-rail"
            >
              <RelatedItemsRail {...(relatedRail as any)} />
            </SubSection>
          ) : null}

          {/* Add-ons rail */}
          {hasAddOns ? (
            <SubSection
              id={id ? `${id}__addons` : undefined}
              title={(addOnsRail as any)?.title ?? "Recommended add-ons"}
              tagline={(addOnsRail as any)?.subtitle ?? "Enhance or extend your plan"}
              className={styles.railCol}
              data-block="addons-rail"
            >
              <RelatedItemsRail {...(addOnsRail as any)} />
            </SubSection>
          ) : null}
        </div>
      ) : null}

      {/* ===================================== Notes ==================================== */}
      {hasNotes ? (
        <SubSection
          id={id ? `${id}__notes` : undefined}
          title="Notes"
          tagline="Small print"
          className={styles.block}
          data-block="notes"
        >
          {notes}
        </SubSection>
      ) : null}
    </section>
  );
}

export default React.memo(Phase5NextSection);
