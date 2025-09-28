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
import PriceTeaser from "./parts/PriceTeaser";
import CTARow from "./parts/CTARow";
import StickyRail from "./parts/StickyRail";

/* Fallback table renderer (used only when groups aren't provided) */
import PackageIncludesTable from "@/packages/components/PackageIncludesTable";

/* Highlights (molecule) */
import { FeatureList } from "@/components/ui/molecules/FeatureList";
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

  /** Calls to action (rendered below grid; left column owns them) */
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
  includesMaxCols = 2,
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
              <OutcomesBlock outcomes={outcomes} className={styles.outcomes} />
            </section>
          )}

          {/* ------------------------- What’s included ------------------------ */}
          {hasGroups ? (
            <section className={styles.block} aria-labelledby={`${id ?? title}-includes`}>
              <div className={styles.blockHeaderCenter}>
                <h2 id={`${id ?? title}-includes`} className={[styles.blockTitle, styles.center].join(" ")}>
                  {includesTitle}
                </h2>
                <Divider className={[styles.blockDivider, styles.center].join(" ")} />
                <p className={[styles.blockTagline, styles.center].join(" ")}>{includesTagline}</p>
              </div>
              <IncludesFromGroups
                packageName={title}
                groups={includesGroups!}
                title={includesTitle}
                caption={includesTagline}
                variant={includesVariant}    // default "cards"
                maxCols={includesMaxCols}    // 2-up “boom boom”
                dense={includesDense}
                showIcons={includesShowIcons}
                footnote={includesFootnote}
                ariaLabel="What's included"
                data-testid="includes-from-groups"
              />
            </section>
          ) : hasTable ? (
            <section className={styles.block} aria-label="What's included">
              <div className={styles.blockHeaderCenter}>
                <h2 className={[styles.blockTitle, styles.center].join(" ")}>{includesTitle}</h2>
                <Divider className={[styles.blockDivider, styles.center].join(" ")} />
                <p className={[styles.blockTagline, styles.center].join(" ")}>{includesTagline}</p>
              </div>
              <PackageIncludesTable {...(includesTable as PackageIncludesTableProps)} />
              {includesFootnote ? <p className={styles.includesFootnote}>{includesFootnote}</p> : null}
            </section>
          ) : null}

          {/* ------------------------------- Notes ---------------------------- */}
          <NotesBlock className={styles.notesEmphasis}>{notes}</NotesBlock>

          {/* --------------------------- Price teaser ------------------------- */}
          {/* PriceTeaser already derives the teaser from Money → consistent with right card */}
          <PriceTeaser price={packagePrice} />

          {/* ------------------------------- CTAs ----------------------------- */}
          {/* Buttons are standardized in CTARow (primary/secondary) */}
          <CTARow primary={ctaPrimary} secondary={ctaSecondary} />
        </div>

        {/* =============================== RIGHT ============================== */}
        <aside className={styles.right} aria-label="Selected package">
          {/* True compact/pinned card — summary (clamped) + price punchline + CTAs */}
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
          <PackageDetailExtras {...extras} />
        </div>
      ) : null}
    </section>
  );
}
