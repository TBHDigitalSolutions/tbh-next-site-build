// src/packages/sections/PackageDetailOverview/PackageDetailOverview.tsx
"use client";

import * as React from "react";
import styles from "./PackageDetailOverview.module.css";

/* Types from shared UI */
import type { Money } from "@/components/ui/molecules/PriceLabel";
import type { OutcomeItem } from "@/components/ui/molecules/OutcomeList";
import type { ServiceSlug } from "@/components/ui/molecules/ServiceChip";

/* Types from package components */
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";
import type { PackageCardProps } from "@/packages/components/PackageCard";

/* Focused parts */
import MetaRow from "./parts/MetaRow";
import TitleBlock from "./parts/TitleBlock";
import OutcomesBlock from "./parts/OutcomesBlock";
import IncludesFromGroups, { type IncludesGroup } from "./parts/IncludesFromGroups";
import NotesBlock from "./parts/NotesBlock";
/* ⬇️ Replaced PriceTeaser + CTARow with PriceActionsBand */
import PriceActionsBand from "./parts/PriceActionsBand";
import StickyRail from "./parts/StickyRail";

/* Fallback table renderer (used only when groups aren't provided) */
import PackageIncludesTable from "@/packages/components/PackageIncludesTable";

/* Highlights (molecule) */
import FeatureList from "@/components/ui/molecules/FeatureList/FeatureList";
/* Underlines for section headers */
import Divider from "@/components/ui/atoms/Divider/Divider";

/* Optional extras (timeline, ethics, etc.) rendered after CTAs */
import PackageDetailExtras from "@/packages/sections/PackageDetailExtras";

/* -------------------------------------------------------------------------- */

export type CTA = { label: string; href: string };

export type PackageDetailOverviewProps = {
  id?: string;

  /** Headline + hero meta (left column top) */
  title: string;
  valueProp: string;
  description?: string;
  icp?: string;
  service?: ServiceSlug;
  tags?: string[];
  showMeta?: boolean;

  /** Pricing — pass canonical Money only; teaser is derived */
  packagePrice?: Money;

  /** Calls to action (rendered inside PriceActionsBand on the left) */
  ctaPrimary?: CTA;
  ctaSecondary?: CTA;

  /** Highlights (features). If omitted, we derive from includesGroups. */
  features?: string[];

  /** Outcomes (KPI bullets) */
  outcomes?: Array<string | OutcomeItem>;

  /** What’s included (SSOT) */
  includesGroups?: IncludesGroup[];
  includesTable?: PackageIncludesTableProps;

  /** Section headings/taglines (overrides are optional) */
  highlightsTitle?: string;          // default: "Highlights"
  highlightsTagline?: string;        // default set below
  outcomesTitle?: string;            // default: "Outcomes you can expect"
  outcomesTagline?: string;          // default set below
  includesTitle?: string;            // default: "What’s included"
  includesCaption?: string;          // used as the tagline under "What’s included"

  /** Visual knobs forwarded to IncludesFromGroups */
  includesVariant?: "cards" | "list";
  includesMaxCols?: 2 | 3;
  includesDense?: boolean;
  includesShowIcons?: boolean;
  includesFootnote?: React.ReactNode;

  /** Sticky right-rail: the card the user clicked on */
  pinnedPackageCard: PackageCardProps;

  /** Notes under includes; extras below CTAs */
  notes?: React.ReactNode;
  extras?: React.ComponentProps<typeof PackageDetailExtras>;

  /** Optional: pricing fine print line (e.g., "3-month minimum • + ad spend") */
  priceFinePrint?: string;

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
  includesCaption, // if undefined, we’ll set a sensible default below

  includesVariant = "cards",
  includesMaxCols = 3,
  includesDense = false,
  includesShowIcons = true,
  includesFootnote,

  pinnedPackageCard,

  notes,
  extras,
  priceFinePrint,

  className,
  style,
}: PackageDetailOverviewProps) {
  /* ----------------------------- Derived strings ------------------------- */
  const includesTagline =
    typeof includesCaption === "string" && includesCaption.trim().length > 0
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

  /* ------------------------------ Price logic ---------------------------- */
  const isHybrid = !!(packagePrice?.monthly && packagePrice?.oneTime);
  const bandVariant = isHybrid ? "detail-hybrid" : "detail-oneTime" as const;
  const baseNote = isHybrid ? "proposal" : "final" as const;

  // Fine print: pass through if provided, otherwise omit (band will hide the row)
  const finePrint = priceFinePrint && priceFinePrint.trim().length > 0 ? priceFinePrint : undefined;

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
          {/* Title block (title + value prop + optional long description + ICP) */}
          <TitleBlock
            id={id ? `${id}__title` : undefined}
            title={title}
            valueProp={valueProp}
            description={description}
            icp={icp}
          />

          {/* Meta row (service chip + tags). Hide if HERO already shows chips. */}
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
              {/* Parent owns header; OutcomesBlock renders grid only */}
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
                /* Parent owns header; child renders grid only */
                hideHeading
                variant={includesVariant}    // default "cards"
                maxCols={includesMaxCols}    // 2-up / 3-up as configured
                dense={includesDense}
                showIcons={includesShowIcons}
                footnote={includesFootnote}
                ariaLabel="What's included"
                data-testid="includes-from-groups"
              />
              {includesFootnote ? (
                <p className={styles.includesFootnote}>{includesFootnote}</p>
              ) : null}
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
          {/* Duplication guard: band is the ONLY pricing area on the left. */}
          {packagePrice && (
            <div className={styles.bandArea}>
              <PriceActionsBand
                variant={bandVariant}
                price={packagePrice}
                tagline={valueProp /* marketing line, optional */}
                baseNote={baseNote}
                finePrint={finePrint}
                ctaPrimary={{ label: "Request proposal", href: "/contact" }}
                ctaSecondary={{ label: "Book a call", href: "/book" }}
                showDivider
                align="center"
              />
            </div>
          )}
        </div>

        {/* =============================== RIGHT ============================== */}
        <aside className={styles.right} aria-label="Selected package">
          {/* Compact/pinned card — summary (clamped) + price + CTAs */}
          <StickyRail
            card={{
              ...pinnedPackageCard,
              variant: "pinned-compact",
              hideTags: true,
              hideOutcomes: true,
              hideIncludes: true,
              descriptionMaxLines: 3,
              /* Card continues to show its own price area in the rail. */
            }}
          />
        </aside>
      </div>

      {/* ======================= BELOW GRID (FULL WIDTH) ====================== */}
      {extras ? (
        <div className={styles.belowGrid}>
          <PackageDetailExtras {...extras} />
        </div>
      ) : null}
    </section>
  );
}
