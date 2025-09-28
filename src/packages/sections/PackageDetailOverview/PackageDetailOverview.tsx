// src/packages/sections/PackageDetailOverview/PackageDetailOverview.tsx
"use client";

import * as React from "react";
import styles from "./PackageDetailOverview.module.css";

/* Types */
import type { PackageCardProps } from "@/packages/components/PackageCard";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";
import type { OutcomeItem } from "@/components/ui/molecules/OutcomeList";
import type { ServiceSlug } from "@/components/ui/molecules/ServiceChip";
import type { Money } from "@/components/ui/molecules/PriceLabel";

/* Parts (focused presentational components) */
import MetaRow from "./parts/MetaRow";
import TitleBlock from "./parts/TitleBlock";
import OutcomesBlock from "./parts/OutcomesBlock";
import IncludesFromGroups, { type IncludesGroup } from "./parts/IncludesFromGroups";
import NotesBlock from "./parts/NotesBlock";
import PriceTeaser from "./parts/PriceTeaser";
import CTARow from "./parts/CTARow";
import StickyRail from "./parts/StickyRail";

/* Fallback table (only used when groups aren't provided) */
import PackageIncludesTable from "@/packages/components/PackageIncludesTable";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

export type CTA = { label: string; href: string };

export type PackageDetailOverviewProps = {
  /** Unique anchor id for deep-links */
  id?: string;

  /** Headline & hero-style meta */
  title: string;
  valueProp: string;
  icp?: string;
  service?: ServiceSlug;
  tags?: string[];

  /** Show/Hide the meta chips row to avoid duplication with page hero */
  showMeta?: boolean; // default: true

  /** Optional explicit teaser; otherwise we derive from `packagePrice` */
  priceTeaser?: { label?: string; price?: Money; notes?: string };

  /** Fallback Money used for teaser when priceTeaser not provided */
  packagePrice?: Money;

  /** Primary / Secondary calls to action */
  ctaPrimary?: CTA;
  ctaSecondary?: CTA;

  /** Outcomes (short bullets) */
  outcomes?: Array<string | OutcomeItem>;

  /**
   * What’s included:
   * Prefer authoring as grouped bullets (UI adapts to {columns,rows} via IncludesFromGroups).
   * If only a pre-built table is available, pass `includesTable` as a fallback.
   */
  includesGroups?: IncludesGroup[];
  includesTable?: PackageIncludesTableProps;
  includesTitle?: string;
  includesCaption?: string;
  includesCompact?: boolean;

  /** The package card that was clicked on the hub page (rendered sticky, top-right) */
  pinnedPackageCard: PackageCardProps;

  /** Optional notes under the includes section (assumptions/terms) */
  notes?: React.ReactNode;

  /** Style hooks */
  className?: string;
  style?: React.CSSProperties;
};

/* -------------------------------------------------------------------------- */
/*                                 COMPONENT                                  */
/* -------------------------------------------------------------------------- */

export default function PackageDetailOverview({
  id,
  title,
  valueProp,
  icp,
  service,
  tags,
  showMeta = true,
  priceTeaser,
  packagePrice,
  ctaPrimary,
  ctaSecondary,
  outcomes = [],
  includesGroups,
  includesTable,
  includesTitle,
  includesCaption = "What’s included",
  includesCompact = false,
  pinnedPackageCard,
  notes,
  className,
  style,
}: PackageDetailOverviewProps) {
  const hasGroups = (includesGroups?.length ?? 0) > 0;
  const hasTable = !!includesTable && (includesTable.rows?.length ?? 0) > 0;

  return (
    <section
      id={id}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      style={style}
      data-component="PackageDetailOverview"
      aria-labelledby={id ? `${id}__title` : undefined}
    >
      <div className={styles.grid}>
        {/* =============================== LEFT =============================== */}
        <div className={styles.left}>
          {/* Meta chips (service + tags) */}
          <MetaRow service={service} tags={tags} show={showMeta} />

          {/* Title + value prop + ICP */}
          <TitleBlock
            id={id ? `${id}__title` : undefined}
            title={title}
            valueProp={valueProp}
            icp={icp}
          />

          {/* Outcomes */}
          <OutcomesBlock outcomes={outcomes} />

          {/* What's included */}
          {hasGroups ? (
            <IncludesFromGroups
              packageName={title}
              groups={includesGroups!}
              title={includesTitle ?? includesCaption}
              caption={includesCaption}
              compact={includesCompact}
              ariaLabel="What's included"
            />
          ) : hasTable ? (
            <section className={styles.includes} aria-label="What's included">
              <h2 className={styles.subhead}>{includesTitle ?? includesCaption}</h2>
              <PackageIncludesTable {...(includesTable as PackageIncludesTableProps)} />
            </section>
          ) : null}

          {/* Notes (small print) */}
          <NotesBlock>{notes}</NotesBlock>

          {/* Price teaser (derived from canonical Money) */}
          <PriceTeaser price={priceTeaser?.price ?? packagePrice} label={priceTeaser?.label} notes={priceTeaser?.notes} />

          {/* Primary actions */}
          <CTARow primary={ctaPrimary} secondary={ctaSecondary} />
        </div>

        {/* =============================== RIGHT ============================== */}
        <aside className={styles.right} aria-label="Selected package">
          <StickyRail card={pinnedPackageCard} />
        </aside>
      </div>
    </section>
  );
}
