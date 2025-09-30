// src/packages/sections/PackageDetailOverview/parts/Phase5NextSection/Phase5NextSection.tsx
import * as React from "react";
import styles from "./Phase5NextSection.module.css";

import { CTARow } from "@/packages/sections/PackageDetailOverview/parts/CTARow";
import { FAQSection } from "@/components/sections/section-layouts/FAQSection";
import { RelatedItemsRail } from "@/packages/components/RelatedItemsRail";

export type CTARowProps = React.ComponentProps<typeof CTARow>;
export type FAQSectionProps = React.ComponentProps<typeof FAQSection>;
export type RelatedItemsRailProps = React.ComponentProps<typeof RelatedItemsRail>;

export interface Phase5NextSectionProps {
  /** Section heading + optional subtitle */
  title?: string;        // defaults to "What’s next"
  subtitle?: string;

  /** Primary CTA row (e.g., Request proposal / Book a call) */
  ctaRow?: CTARowProps;

  /** Frequently asked questions (accordion) */
  faq?: FAQSectionProps;

  /** Cross-sell rail of related packages (uses your existing RelatedItemsRail) */
  relatedRail?: RelatedItemsRailProps;

  /** Add-ons rail (can reuse RelatedItemsRail with a different title/list) */
  addOnsRail?: RelatedItemsRailProps;

  /** Layout hooks */
  id?: string;
  className?: string;

  /**
   * When true, forces the rails (related/add-ons) to stack in one column
   * on desktop as well. Default: false (two columns on ≥1024px).
   */
  stackRailsOnDesktop?: boolean;
}

/**
 * Phase5NextSection
 * Phase 5 of the Packages Detail: “Next steps”
 * - CTA row to move forward
 * - FAQ to resolve objections
 * - Related/Add-ons rails to encourage exploration or attachables
 */
export function Phase5NextSection({
  title = "What’s next",
  subtitle,
  ctaRow,
  faq,
  relatedRail,
  addOnsRail,
  id,
  className,
  stackRailsOnDesktop = false,
}: Phase5NextSectionProps) {
  const hasAny =
    !!ctaRow ||
    !!faq ||
    !!relatedRail ||
    !!addOnsRail;

  if (!hasAny) return null;

  const headingId = React.useId();

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={[
        styles.wrap,
        stackRailsOnDesktop ? styles.stackDesktop : styles.splitDesktop,
        className,
      ].filter(Boolean).join(" ")}
      data-section="Phase5NextSection"
    >
      <header className={styles.header}>
        <h2 id={headingId} className={styles.h2}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      {ctaRow ? (
        <div className={styles.row}>
          <CTARow {...ctaRow} />
        </div>
      ) : null}

      {faq ? (
        <div className={styles.row}>
          <FAQSection {...faq} />
        </div>
      ) : null}

      {(relatedRail || addOnsRail) ? (
        <div className={styles.railsGrid}>
          <div className={styles.railCol}>
            {relatedRail ? <RelatedItemsRail {...relatedRail} /> : null}
          </div>
          <div className={styles.railCol}>
            {addOnsRail ? <RelatedItemsRail {...addOnsRail} /> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Phase5NextSection;
