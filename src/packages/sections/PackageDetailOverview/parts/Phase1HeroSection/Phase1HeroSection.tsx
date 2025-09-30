// src/packages/sections/PackageDetailOverview/parts/Phase1HeroSection/Phase1HeroSection.tsx
import * as React from "react";
import styles from "./Phase1HeroSection.module.css";

// Reuse existing, battle-tested atoms from the PackageDetailOverview parts
import { TitleBlock } from "@/packages/sections/PackageDetailOverview/parts/TitleBlock";
import { MetaRow } from "@/packages/sections/PackageDetailOverview/parts/MetaRow";
import { PriceActionsBand } from "@/packages/sections/PackageDetailOverview/parts/PriceActionsBand";

/**
 * To keep this section future-proof and aligned with the PDO parts,
 * we accept the child component prop types directly. This means you
 * can pass whatever the existing parts already support, without
 * duplicating types here.
 */
export type TitleBlockProps = React.ComponentProps<typeof TitleBlock>;
export type MetaRowProps = React.ComponentProps<typeof MetaRow>;
export type PriceActionsBandProps = React.ComponentProps<typeof PriceActionsBand>;

export interface Phase1HeroSectionProps {
  /**
   * Title + summary + descriptionHtml (+ optional image/icp)
   * Pass exactly what TitleBlock expects.
   */
  titleBlock: TitleBlockProps;

  /**
   * Service taxonomy row (service, tags, badges, tier, etc.)
   * Pass exactly what MetaRow expects. Optional—omit to hide.
   */
  metaRow?: MetaRowProps;

  /**
   * Canonical pricing band with CTAs (detail context).
   * Typically assembled with mappers/band helpers.
   */
  band: PriceActionsBandProps;

  /** Optional section id + extra class for layout contexts. */
  id?: string;
  className?: string;

  /**
   * If true, the band stacks below copy on desktop (one-column),
   * useful for very long descriptions. Defaults to false (two-column).
   */
  stackBandOnDesktop?: boolean;
}

/**
 * Phase1HeroSection
 * The top-of-page hero for Packages Detail:
 * - Left: TitleBlock (title, summary, longer description, optional image/icp)
 * - Under title: MetaRow (service/tags/badges)
 * - Right: PriceActionsBand (pricing + CTA policy)
 *
 * Layout:
 * - Mobile: single column (copy first, band second)
 * - ≥1024px: two columns; optional single-column via `stackBandOnDesktop`
 */
export function Phase1HeroSection({
  titleBlock,
  metaRow,
  band,
  id,
  className,
  stackBandOnDesktop = false,
}: Phase1HeroSectionProps) {
  const sectionClass = [
    styles.wrap,
    stackBandOnDesktop ? styles.stackDesktop : styles.splitDesktop,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={id} className={sectionClass} data-section="Phase1HeroSection">
      <div className={styles.colA}>
        <TitleBlock {...titleBlock} />
        {metaRow ? (
          <div className={styles.meta}>
            <MetaRow {...metaRow} />
          </div>
        ) : null}
      </div>

      <aside className={styles.colB} aria-label="Pricing and actions">
        <PriceActionsBand {...band} />
      </aside>
    </section>
  );
}

export default Phase1HeroSection;
