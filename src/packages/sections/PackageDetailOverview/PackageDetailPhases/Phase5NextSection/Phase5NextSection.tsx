/**
 * Phase 5 — "What’s Next"
 * =============================================================================
 * PURPOSE
 *  - Close the loop: clear CTAs, FAQs to handle objections, and cross-sell rails.
 *
 * ACCESSIBILITY & STRUCTURE
 *  - Phase heading via <PhaseSectionHeader/>.
 *  - Each logical area wrapped in <SubSection/> for consistent structure and
 *    testability (`data-block` hooks).
 *
 * NOTES
 *  - Uses CTASection (primary/secondary CTAs), FAQSection, and RelatedItemsRail.
 */

"use client";

import * as React from "react";
import styles from "./Phase5NextSection.module.css";

import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import FAQSection from "@/components/sections/section-layouts/FAQSection";
import RelatedItemsRail from "@/packages/components/RelatedItemsRail";

/* ---- Correct wrapper paths ---- */
import PhaseSectionHeader from "@/packages/sections/PackageDetailOverview/parts/PhaseSectionHeader/PhaseSectionHeader";
import SubSection from "@/packages/sections/PackageDetailOverview/parts/SubSection/SubSection";

type Cta = { label: string; href: string };

export interface Phase5NextSectionProps {
  id?: string;
  className?: string;

  /** Phase header copy */
  phaseTitle?: string;    // default: "What’s next"
  phaseTagline?: string;  // default: "How to proceed and what else to explore"

  /** CTA row */
  ctaRow?: {
    primary?: Cta;
    secondary?: Cta;
    align?: "start" | "center";
  };

  /** FAQs (optional) */
  faqs?: Array<{ id?: string | number; question?: string; answer?: string }>;

  /** Cross-sell (optional) */
  relatedRail?: Array<any>;
  addOnsRail?: Array<any>;

  /** Optional final notes (if small print belongs here too) */
  notes?: React.ReactNode;
}

function Phase5NextSection({
  id,
  className,
  phaseTitle = "What’s next",
  phaseTagline = "How to proceed and what else to explore",
  ctaRow,
  faqs = [],
  relatedRail = [],
  addOnsRail = [],
  notes,
}: Phase5NextSectionProps) {
  const sectionClass = [styles.wrap, className].filter(Boolean).join(" ");
  const hasCtas = !!(ctaRow?.primary || ctaRow?.secondary);
  const hasFaqs = (faqs?.length ?? 0) > 0;
  const hasRelated = (relatedRail?.length ?? 0) > 0;
  const hasAddOns = (addOnsRail?.length ?? 0) > 0;
  const hasNotes = !!notes;

  if (!hasCtas && !hasFaqs && !hasRelated && !hasAddOns && !hasNotes) return null;

  return (
    <section id={id} className={sectionClass} data-section="Phase5NextSection" aria-labelledby={id ? `${id}__heading` : undefined}>
      <PhaseSectionHeader
        id={id ? `${id}__heading` : undefined}
        title={phaseTitle}
        tagline={phaseTagline}
        className={styles.phaseHeader}
      />

      {hasCtas ? (
        <SubSection
          id={id ? `${id}__cta` : undefined}
          title="Get started"
          tagline="Choose the next best step"
          className={styles.block}
          data-block="cta-row"
        >
          <CTASection
            title=""
            subtitle=""
            primaryCta={ctaRow?.primary}
            secondaryCta={ctaRow?.secondary}
            align={ctaRow?.align ?? "center"}
          />
        </SubSection>
      ) : null}

      {hasFaqs ? (
        <SubSection
          id={id ? `${id}__faqs` : undefined}
          title="FAQs"
          tagline="Answers to common questions"
          className={styles.block}
          data-block="faqs"
        >
          <FAQSection
            id="phase5-faq"
            title=""
            faqs={faqs.map((f, i) => ({
              id: String(f?.id ?? i),
              question: f?.question,
              answer: f?.answer,
            }))}
            variant="default"
            allowMultiple={false}
            enableSearch
            enableCategoryFilter={false}
            searchPlaceholder="Search FAQs"
          />
        </SubSection>
      ) : null}

      {hasRelated ? (
        <SubSection
          id={id ? `${id}__related` : undefined}
          title="Related packages"
          tagline="You may also be interested in"
          className={styles.block}
          data-block="related"
        >
          <RelatedItemsRail items={relatedRail as any} />
        </SubSection>
      ) : null}

      {hasAddOns ? (
        <SubSection
          id={id ? `${id}__addons` : undefined}
          title="Recommended add-ons"
          tagline="Enhance or extend your plan"
          className={styles.block}
          data-block="addons"
        >
          <RelatedItemsRail items={addOnsRail as any} />
        </SubSection>
      ) : null}

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
