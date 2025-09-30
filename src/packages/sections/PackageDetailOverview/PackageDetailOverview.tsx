// src/packages/sections/PackageDetailOverview/PackageDetailOverview.tsx
"use client";

import * as React from "react";
import styles from "./PackageDetailOverview.module.css";

/* Shared types */
import type { Money } from "@/packages/lib/pricing";

/* UI types */
import type { OutcomeItem } from "@/components/ui/molecules/OutcomeList";
import type { ServiceSlug } from "@/components/ui/molecules/ServiceChip";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";
import type { PackageCardProps } from "@/packages/components/PackageCard";

/* Focused parts */
import MetaRow from "./parts/MetaRow";
import TitleBlock from "./parts/TitleBlock";
import OutcomesBlock from "./parts/OutcomesBlock";
import IncludesFromGroups, { type IncludesGroup } from "./parts/IncludesFromGroups";
import NotesBlock from "./parts/NotesBlock";
import PriceActionsBand from "./parts/PriceActionsBand";
import StickyRail from "./parts/StickyRail";

/* Fallback table renderer (used only when groups aren't provided) */
import PackageIncludesTable from "@/packages/components/PackageIncludesTable";

/* Highlights (molecule) */
import FeatureList from "@/components/ui/molecules/FeatureList/FeatureList";
/* Underlines for section headers */
import Divider from "@/components/ui/atoms/Divider/Divider";

/* Shared helpers */
import { bandPropsFor } from "@/packages/lib/band";
import { CTA } from "@/packages/lib/copy";

/* -------------------------------------------------------------------------- */

export type CTAItem = { label: string; href: string };

export type PackageDetailOverviewProps = {
  id?: string;

  /** Headline & hero meta (left column top) */
  title: string;
  valueProp: string;
  description?: string;
  icp?: string;
  service?: ServiceSlug;
  tags?: string[];
  showMeta?: boolean;

  /** Canonical pricing (SSOT) */
  packagePrice?: Money;

  /**
   * Explicit price band copy (detail page only).
   * Do NOT derive from summary; this is authored separately.
   */
  priceBand?: {
    tagline?: string;                  // marketing line (detail only)
    baseNote?: "proposal" | "final";   // override; default policy is applied if omitted
    finePrint?: string;                // e.g., "3-month minimum • + ad spend"
  };

  /** Primary/secondary CTAs for the band (labels standardized via copy.ts) */
  ctaPrimary?: CTAItem;
  ctaSecondary?: CTAItem;

  /** Highlights (features). If omitted, derived from includesGroups. */
  features?: string[];

  /** Outcomes (KPI bullets) */
  outcomes?: Array<string | OutcomeItem>;

  /** What’s included inputs */
  includesGroups?: IncludesGroup[];
  includesTable?: PackageIncludesTableProps;

  /** Section headings/taglines (optional overrides) */
  highlightsTitle?: string;
  highlightsTagline?: string;
  outcomesTitle?: string;
  outcomesTagline?: string;
  includesTitle?: string;
  includesCaption?: string;

  /** Visual knobs forwarded to IncludesFromGroups */
  includesVariant?: "cards" | "list";
  includesMaxCols?: 2 | 3;
  includesDense?: boolean;
  includesShowIcons?: boolean;
  includesFootnote?: React.ReactNode;

  /** Sticky right-rail pinned card */
  pinnedPackageCard: PackageCardProps;

  /** Notes under includes; extras below CTAs */
  notes?: React.ReactNode;
  extras?: React.ComponentProps<typeof import("@/packages/sections/PackageDetailExtras").default>;

  className?: string;
  style?: React.CSSProperties;
};

/* -------------------------------------------------------------------------- */

export default function PackageDetailOverview({
  id,
  title,
  valueProp,
  description,
  icp,
  service,
  tags,
  showMeta = true,

  packagePrice,
  priceBand,

  ctaPrimary,
  ctaSecondary,

  features,
  outcomes = [],

  includesGroups,
  includesTable,

  highlightsTitle = "Highlights",
  highlightsTagline = "This package includes these key features.",
  outcomesTitle = "Outcomes you can expect",
  outcomesTagline = "Projected results you can expect to achieve with this package.",
  includesTitle = "What’s included",
  includesCaption,

  includesVariant = "cards",
  includesMaxCols = 3,
  includesDense = false,
  includesShowIcons = true,
  includesFootnote,

  pinnedPackageCard,

  notes,
  extras,

  className,
  style,
}: PackageDetailOverviewProps) {
  /* ----------------------------- Derived strings ------------------------- */
  const includesTagline =
    typeof includesCaption === "string" && includesCaption.trim()
      ? includesCaption
      : "Everything that ships with this package.";

  /* ----------------------------- Includes flags -------------------------- */
  const hasGroups = (includesGroups?.length ?? 0) > 0;
  const hasTable =
    !!includesTable && (Array.isArray(includesTable.rows) ? includesTable.rows.length > 0 : true);

  /* --------------------------- Derived highlights ------------------------ */
  const derivedHighlights: string[] = React.useMemo(() => {
    if (features?.length) return features;
    if (!hasGroups) return [];
    return (includesGroups ?? [])
      .flatMap((g) => (g.items ?? []).map((it: any) => (typeof it === "string" ? it : it?.label ?? "")))
      .filter(Boolean)
      .slice(0, 6);
  }, [features, hasGroups, includesGroups]);

  /* ------------------------------ Band props ----------------------------- */
  // One and only pricing area on the left. Do not render any other “Starting at …”.
  const band = packagePrice ? bandPropsFor("detail", packagePrice, priceBand) : null;

  /* -------------------------------- Render -------------------------------- */
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
          {/* Title + value prop + optional long description + ICP */}
          <TitleBlock
            id={id ? `${id}__title` : undefined}
            title={title}
            valueProp={valueProp}
            description={description}
            icp={icp}
          />

          {/* Service chip + tags row */}
          <MetaRow service={service} tags={tags} show={showMeta} />

          {/* --------------------------- Highlights --------------------------- */}
          {derivedHighlights.length > 0 && (
            <section className={styles.block} aria-labelledby={`${id ?? title}-highlights`}>
              <div className={styles.blockHeader}>
                <h2 id={`${id ?? title}-highlights`} className={styles.blockTitle}>
                  {highlightsTitle}
                </h2>
                <Divider className={styles.blockDivider} />
                <p className={styles.blockTagline}>{highlightsTagline}</p>
              </div>
              <FeatureList
                items={derivedHighlights.map((f, i) => ({ id: `hl-${i}`, label: f }))}
                size="md"
                align="center"
                textAlign="right"
                ariaLabel="Key highlights"
              />
            </section>
          )}

          {/* ---------------------------- Outcomes ---------------------------- */}
          {(outcomes?.length ?? 0) > 0 && (
            <section className={styles.block} aria-labelledby={`${id ?? title}-outcomes`}>
              <div className={styles.blockHeader}>
                <h2 id={`${id ?? title}-outcomes`} className={styles.blockTitle}>
                  {outcomesTitle}
                </h2>
                <Divider className={styles.blockDivider} />
                <p className={styles.blockTagline}>{outcomesTagline}</p>
              </div>
              <OutcomesBlock outcomes={outcomes} className={styles.outcomes} hideHeading />
            </section>
          )}

          {/* ------------------------- What’s included ------------------------ */}
          {hasGroups ? (
            <section className={styles.block} aria-labelledby={`${id ?? title}-includes`}>
              <div className={styles.blockHeader}>
                <h2 id={`${id ?? title}-includes`} className={styles.blockTitle}>
                  {includesTitle}
                </h2>
                <Divider className={styles.blockDivider} />
                <p className={styles.blockTagline}>{includesTagline}</p>
              </div>
              <IncludesFromGroups
                packageName={title}
                groups={includesGroups!}
                hideHeading
                variant={includesVariant}
                maxCols={includesMaxCols}
                dense={includesDense}
                showIcons={includesShowIcons}
                footnote={includesFootnote}
                ariaLabel="What's included"
                data-testid="includes-from-groups"
              />
              {includesFootnote ? <p className={styles.includesFootnote}>{includesFootnote}</p> : null}
            </section>
          ) : hasTable ? (
            <section className={styles.block} aria-label="What's included">
              <div className={styles.blockHeader}>
                <h2 className={styles.blockTitle}>{includesTitle}</h2>
                <Divider className={styles.blockDivider} />
                <p className={styles.blockTagline}>{includesTagline}</p>
              </div>
              <PackageIncludesTable {...(includesTable as PackageIncludesTableProps)} />
              {includesFootnote ? <p className={styles.includesFootnote}>{includesFootnote}</p> : null}
            </section>
          ) : null}

          {/* ------------------------------- Notes ---------------------------- */}
          <NotesBlock className={styles.notesEmphasis}>{notes}</NotesBlock>

          {/* ========================= Price + Actions ======================== */}
          {band ? (
            <div className={styles.bandArea}>
              <PriceActionsBand
                {...band}
                ctaPrimary={ctaPrimary ?? { label: CTA.REQUEST_PROPOSAL, href: "/contact" }}
                ctaSecondary={ctaSecondary ?? { label: CTA.BOOK_A_CALL, href: "/book" }}
                /* Divider + alignment come from the band preset; no need to override */
              />
            </div>
          ) : null}
        </div>

        {/* =============================== RIGHT ============================== */}
        <aside className={styles.right} aria-label="Selected package">
          {/* Compact/pinned card — the mapper builds this; we enforce compact flags */}
          <StickyRail
            card={{
              ...pinnedPackageCard,
              variant: "pinned-compact",
              hideTags: true,
              hideOutcomes: true,
              hideIncludes: true,
              descriptionMaxLines: 3,
            }}
          />
        </aside>
      </div>

      {/* ======================= BELOW GRID (FULL WIDTH) ====================== */}
      {extras ? (
        <div className={styles.belowGrid}>
          {/* Loaded lazily by Next; typed above via import() */}
          {React.createElement(require("@/packages/sections/PackageDetailExtras").default, extras)}
        </div>
      ) : null}
    </section>
  );
}