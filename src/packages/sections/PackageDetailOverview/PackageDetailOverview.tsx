// src/packages/sections/PackageDetailOverview/PackageDetailOverview.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import styles from "./PackageDetailOverview.module.css";

// Pinned card (the one the user clicked)
import PackageCard, { type PackageCardProps } from "@/packages/components/PackageCard";
 
// Shared molecules
import { PriceLabel, type Money } from "@/components/ui/molecules/PriceLabel";
import { OutcomeList, type OutcomeItem } from "@/components/ui/molecules/OutcomeList";
import { ServiceChip, type ServiceSlug } from "@/components/ui/molecules/ServiceChip";
import TagChips from "@/components/ui/molecules/TagChips";

// “What’s included” table
import { default as PackageIncludesTable } from "@/packages/components/PackageIncludesTable";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";

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
  icp?: string;                // who it's for
  service?: ServiceSlug;       // for the ServiceChip
  tags?: string[];             // taxonomy chips

  /** Price teaser (if omitted, we’ll derive from `packagePrice`) */
  priceTeaser?: { label?: string; price?: Money; notes?: string };

  /** Primary / Secondary calls to action */
  ctaPrimary?: CTA;
  ctaSecondary?: CTA;

  /** Outcomes (short bullets) */
  outcomes?: Array<string | OutcomeItem>;

  /** "What's included" table input */
  includesTable: PackageIncludesTableProps;

  /** The package card that was clicked on the hub page (rendered sticky, top-right) */
  pinnedPackageCard: PackageCardProps;

  /** Optional notes under the table (assumptions/terms) */
  notes?: React.ReactNode;

  /** Fallback Money used for teaser when priceTeaser not provided */
  packagePrice?: Money;

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
  priceTeaser,
  ctaPrimary,
  ctaSecondary,
  outcomes = [],
  includesTable,
  pinnedPackageCard,
  notes,
  packagePrice,
  className,
  style,
}: PackageDetailOverviewProps) {
  // Normalize outcomes to OutcomeList items
  const outcomeItems = outcomes.map((o, i) =>
    typeof o === "string" ? { id: `o-${i}`, label: o } : o
  );

  const teaserPrice = priceTeaser?.price ?? packagePrice;
  const teaserLabel = priceTeaser?.label ?? (teaserPrice ? "Starting at" : undefined);

  return (
    <section
      id={id}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      style={style}
      aria-labelledby={id ? `${id}__title` : undefined}
    >
      <div className={styles.grid}>
        {/* LEFT COLUMN — hero-ish summary + outcomes + includes */}
        <div className={styles.left}>
          {/* Headline & meta */}
          <header className={styles.header}>
            <div className={styles.metaRow}>
              {service ? <ServiceChip service={service} size="sm" /> : null}
              {tags?.length ? <TagChips tags={tags} /> : null}
            </div>

            <h1 className={styles.title} id={id ? `${id}__title` : undefined}>
              {title}
            </h1>

            <p className={styles.valueProp}>{valueProp}</p>
            {icp ? <p className={styles.icp}><strong>For:</strong> {icp}</p> : null}

            {teaserLabel || teaserPrice ? (
              <div className={styles.teaser}>
                {teaserLabel ? <span className={styles.teaserLabel}>{teaserLabel}</span> : null}
                {teaserPrice ? <PriceLabel price={teaserPrice} /> : null}
                {priceTeaser?.notes ? <span className={styles.teaserNotes}>{priceTeaser.notes}</span> : null}
              </div>
            ) : null}

            {(ctaPrimary || ctaSecondary) && (
              <div className={styles.ctaRow}>
                {ctaPrimary ? (
                  <Link className={styles.btnPrimary} href={ctaPrimary.href}>
                    {ctaPrimary.label}
                  </Link>
                ) : null}
                {ctaSecondary ? (
                  <Link className={styles.btnSecondary} href={ctaSecondary.href}>
                    {ctaSecondary.label}
                  </Link>
                ) : null}
              </div>
            )}
          </header>

          {/* Outcomes */}
          {outcomeItems.length > 0 && (
            <section className={styles.outcomes} aria-label="Expected outcomes">
              <OutcomeList items={outcomeItems} layout="grid" columns={3} size="sm" variant="check" />
            </section>
          )}

          {/* What's included (table) */}
          <section className={styles.includes} aria-label="What's included">
            <h2 className={styles.subhead}>What’s included</h2>
            <PackageIncludesTable {...includesTable} />
            {notes ? <div className={styles.notes}>{notes}</div> : null}
          </section>
        </div>

        {/* RIGHT COLUMN — sticky pinned card */}
        <aside className={styles.right} aria-label="Selected package">
          <div className={styles.sticky}>
            <PackageCard {...pinnedPackageCard} variant="rail" />
          </div>
        </aside>
      </div>
    </section>
  );
}
