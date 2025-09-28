// src/packages/sections/PackageDetailOverview/PackageDetailOverview.tsx
"use client";

import * as React from "react";
import styles from "./PackageDetailOverview.module.css";

/* Types from shared UI */
import type { Money } from "@/components/ui/molecules/PriceLabel";
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

/* Highlights now live on the left since the pinned card is compact */
import { FeatureList } from "@/components/ui/molecules/FeatureList";
import Divider from "@/components/ui/atoms/Divider/Divider";

/* Optional extras (timeline, ethics, etc.) rendered at the end of the left stack */
import PackageDetailExtras from "@/packages/sections/PackageDetailExtras";

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
  /** Optional longer blurb beneath the value prop (forwarded to TitleBlock) */
  description?: string;
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

  /** Highlights (features). If omitted, we derive top 4–6 from includesGroups. */
  features?: string[];

  /** Outcomes (short bullets) — strings or objects with `{ label }` */
  outcomes?: Array<string | { label?: string }>;

  /**
   * What’s included (SSOT):
   * Prefer `includesGroups` sourced from base.ts (Array<{ title, items }>)
   * If you truly only have a matrix/table, `includesTable` is supported as a fallback.
   */
  includesGroups?: IncludesGroup[];
  includesTable?: PackageIncludesTableProps;

  /** Includes section heading + optional helper text */
  includesTitle?: string;          // e.g., "What’s included"
  includesCaption?: string;        // short helper text under the section title

  /** Includes visual knobs (pass-through to IncludesFromGroups) */
  includesVariant?: "cards" | "list"; // default "cards"
  includesMaxCols?: 2 | 3;            // clamp for auto-fit layout
  includesDense?: boolean;            // tighter spacing for long lists
  includesShowIcons?: boolean;        // default true
  includesFootnote?: React.ReactNode; // small print specific to includes

  /** Sticky right-rail: the card the user clicked on */
  pinnedPackageCard: PackageCardProps;

  /** Optional page-level notes under the includes section (assumptions/terms) */
  notes?: React.ReactNode;

  /** Optional extras under CTAs (timeline, ethics, requirements…) */
  extras?: React.ComponentProps<typeof PackageDetailExtras>;

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
  description,
  icp,
  service,
  tags,
  showMeta = true,
  priceTeaser,
  packagePrice,
  ctaPrimary,
  ctaSecondary,
  features,
  outcomes = [],
  includesGroups,
  includesTable,
  includesTitle,
  includesCaption,
  includesVariant = "cards",   // default to CARDS for single-package details
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
  /* ------------------------------- Pricing -------------------------------- */
  const teaserPrice = priceTeaser?.price ?? packagePrice;
  const teaserLabel = priceTeaser?.label ?? (teaserPrice ? "Starting at" : undefined);
  const teaserNotes = priceTeaser?.notes;

  /* ----------------------------- Includes data ---------------------------- */
  const hasGroups = (includesGroups?.length ?? 0) > 0;
  const hasTable =
    !!includesTable && (Array.isArray(includesTable.rows) ? includesTable.rows.length > 0 : true);

  /* --------------------------- Derived highlights ------------------------- */
  const derivedHighlights: string[] = React.useMemo(() => {
    if (features?.length) return features;
    if (!hasGroups) return [];
    // Flatten all include bullets → take first 4–6 for concise highlights
    const flat = (includesGroups ?? []).flatMap((g) =>
      (g.items ?? []).map((it: any) => (typeof it === "string" ? it : it?.label ?? "")),
    );
    return flat.filter(Boolean).slice(0, 6);
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
          {/* Title + value prop + (optional) description + ICP */}
          <TitleBlock
            id={id ? `${id}__title` : undefined}
            title={title}
            valueProp={valueProp}
            description={description}
            icp={icp}
          />

          {/* Meta chips (service + tags) */}
          <MetaRow service={service} tags={tags} show={showMeta} />

          {/* -------------------------- Highlights --------------------------- */}
          {derivedHighlights.length > 0 && (
            <section className={styles.block} aria-labelledby={`${id ?? title}-highlights`}>
              <h2 id={`${id ?? title}-highlights`} className={styles.blockTitle}>
                Highlights
              </h2>
              <Divider className={styles.blockDivider} />
              <FeatureList
                items={derivedHighlights.map((f, i) => ({ id: `hl-${i}`, label: f }))}
                size="md"
                ariaLabel="Key highlights"
              />
            </section>
          )}

          {/* --------------------------- Outcomes ---------------------------- */}
          {(outcomes?.length ?? 0) > 0 && (
            <section className={styles.block} aria-labelledby={`${id ?? title}-outcomes`}>
              <h2 id={`${id ?? title}-outcomes`} className={styles.blockTitle}>
                Outcomes you can expect
              </h2>
              <Divider className={styles.blockDivider} />
              <OutcomesBlock
                outcomes={outcomes}
                className={styles.outcomes}
                /* If your OutcomesBlock supports props like layout/columns, pass them here */
              />
            </section>
          )}

          {/* ------------------------ What’s included ------------------------ */}
          {hasGroups ? (
            <IncludesFromGroups
              packageName={title}
              groups={includesGroups!}
              title={includesTitle ?? "What’s included"}
              caption={includesCaption}
              variant={includesVariant}         // "cards" | "list" (cards by default)
              maxCols={includesMaxCols}         // clamp auto-fit columns (2 or 3)
              dense={includesDense}
              showIcons={includesShowIcons}
              footnote={includesFootnote}
              ariaLabel="What's included"
              data-testid="includes-from-groups"
            />
          ) : hasTable ? (
            <section className={styles.includes} aria-label="What's included">
              <h2 className={styles.subhead}>{includesTitle ?? "What’s included"}</h2>
              <Divider className={styles.blockDivider} />
              <PackageIncludesTable {...(includesTable as PackageIncludesTableProps)} />
              {includesFootnote ? <p className={styles.includesFootnote}>{includesFootnote}</p> : null}
            </section>
          ) : null}

          {/* ------------------------------ Notes ---------------------------- */}
          <NotesBlock>{notes}</NotesBlock>

          {/* --------------------------- Price teaser ------------------------ */}
          <PriceTeaser price={teaserPrice} label={teaserLabel} notes={teaserNotes} />

          {/* ------------------------------ CTAs ----------------------------- */}
          <CTARow primary={ctaPrimary} secondary={ctaSecondary} />

          {/* ------------------------------ Extras --------------------------- */}
          {extras ? <PackageDetailExtras {...extras} /> : null}
        </div>

        {/* =============================== RIGHT ============================== */}
        <aside className={styles.right} aria-label="Selected package">
          {/* True compact/pinned card — summary (clamped) + price punchline + CTAs */}
          <StickyRail
            card={{
              ...pinnedPackageCard,
              summary: valueProp,            // ← use the short value prop that’s already on the page
              variant: "pinned-compact",
              hideTags: true,
              hideOutcomes: true,
              hideIncludes: true,
              descriptionMaxLines: 3,
              footnote: undefined,           // ← hide small print in pinned card
            }}
          />
        </aside>
      </div>
    </section>
  );
}
