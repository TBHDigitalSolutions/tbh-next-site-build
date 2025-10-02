// src/packages/sections/PackageDetailOverview/PackageDetailOverview.tsx
/**
 * PackageDetailOverview
 * -----------------------------------------------------------------------------
 * High-level “super card” for a Package Detail page. This composes five
 * first-class phases (Hero, Why, What, Detail, Next) plus a sticky right-rail.
 *
 * ✅ Fix for runtime error:
 *    You saw:  TypeError: Cannot read properties of undefined (reading 'showBaseNote')
 *    Root cause: <PriceActionsBand> expected a `variant` that matches one of
 *    its internal PRESET keys ("detail-hybrid" | "card-hybrid" | "detail-oneTime" | "card-oneTime").
 *    We were passing "detail", which isn’t a valid key → PRESET[variant] was
 *    undefined → p.showBaseNote crashed.
 *
 *    Resolution here:
 *    - Compute a valid `variant` from the price shape:
 *        • monthly+oneTime  → "detail-hybrid"
 *        • monthly-only     → "detail-oneTime"  (layout flags are fine)
 *        • oneTime-only     → "detail-oneTime"
 *    - Build `bandProps` with that `variant` and pass it to Phase 1.
 *
 * Other goals:
 * - Keep the public prop surface backward-compatible.
 * - Derive Highlights from Includes when authors don’t pass `features`.
 * - Enforce a single, canonical pricing area in Phase 1.
 */

"use client";

import * as React from "react";
import styles from "./PackageDetailOverview.module.css";

/* ------------------------------- Shared types ------------------------------ */
import type { Money } from "@/packages/lib/pricing";

/* ------------------------------- UI contracts ------------------------------ */
import type { OutcomeItem } from "@/components/ui/molecules/OutcomeList";
import type { ServiceSlug } from "@/components/ui/molecules/ServiceChip";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";
import type { PackageCardProps } from "@/packages/components/PackageCard";
import type { IncludesGroup } from "./parts/IncludesFromGroups"; // type-only

/* ------------------------------ Right rail card ---------------------------- */
import StickyRail from "./parts/StickyRail";

/* ---------------------------------- Phases -------------------------------- */
import Phase1HeroSection from "./PackageDetailPhases/Phase1HeroSection";
import Phase2WhySection from "./PackageDetailPhases/Phase2WhySection";
import Phase3WhatSection from "./PackageDetailPhases/Phase3WhatSection";
import Phase4DetailsSection from "./PackageDetailPhases/Phase4DetailsSection";
import Phase5NextSection from "./PackageDetailPhases/Phase5NextSection";

/* --------------------------- Optional extras bundle ------------------------ */
import PackageDetailExtras from "@/packages/sections/PackageDetailExtras";

/* ----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export type CTAItem = { label: string; href: string };

export type PackageDetailOverviewProps = {
  id?: string;

  /** Phase 1 (Hero) */
  title: string;
  valueProp: string;
  description?: string;
  icp?: string;
  service?: ServiceSlug;
  tags?: string[];
  showMeta?: boolean;

  /** Pricing (canonical Money shape – SSOT) */
  packagePrice?: Money;

  /**
   * Explicit price band copy (detail page only).
   * Do NOT derive from summary; author separately for detail UX.
   */
  priceBand?: {
    tagline?: string;                // marketing line (detail-only)
    baseNote?: "proposal" | "final"; // rendering hint
    finePrint?: string;              // e.g., "3-month minimum • + ad spend"
  };

  /** CTA policy (labels/links typically provided by mappers) */
  ctaPrimary?: CTAItem;
  ctaSecondary?: CTAItem;

  /** Phase 2 (Why) */
  purposeHtml?: string;
  painPoints?: string[];
  outcomes?: Array<string | OutcomeItem>;

  /** Phase 3 (What) – Highlights + Includes */
  features?: string[];
  includesGroups?: IncludesGroup[];
  includesTable?: PackageIncludesTableProps;

  /** Optional headings/taglines overrides */
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

  /** Right sticky card */
  pinnedPackageCard: PackageCardProps;

  /** Phase 4 (Detail) – notes + extras (timeline/ethics/limits/requirements) */
  notes?: React.ReactNode;
  extras?: React.ComponentProps<typeof PackageDetailExtras>;

  /** Legacy fine print passthrough (kept for back-compat) */
  priceFinePrint?: string;

  className?: string;
  style?: React.CSSProperties;
};

/* ----------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

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

  /* Why */
  purposeHtml,
  painPoints,
  outcomes = [],

  /* What */
  features,
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

  /* Rail + Detail */
  pinnedPackageCard,
  notes,
  extras,

  /* Misc */
  priceFinePrint,
  className,
  style,
}: PackageDetailOverviewProps) {
  /* ------------------------------------------------------------------------ *
   * Derived labels / flags
   * ------------------------------------------------------------------------ */
  const includesTagline =
    typeof includesCaption === "string" && includesCaption.trim()
      ? includesCaption
      : "Everything that ships with this package.";

  const hasGroups = (includesGroups?.length ?? 0) > 0;
  const hasTable =
    !!includesTable && (Array.isArray(includesTable.rows) ? includesTable.rows.length > 0 : true);

  /**
   * Derive "Highlights" from the first N include items when authors don't pass
   * a dedicated `features` list. Mirrors prior Overview behavior.
   */
  const derivedHighlights: Array<string | { label: string; icon?: React.ReactNode }> =
    React.useMemo(() => {
      if (features?.length) return features;
      if (!hasGroups) return [];
      const fromGroups = (includesGroups ?? [])
        .flatMap((g) => (g.items ?? []).map((it: any) => (typeof it === "string" ? it : it?.label ?? "")))
        .filter(Boolean);
      return fromGroups.slice(0, 6); // conservative cap for a tidy UI
    }, [features, hasGroups, includesGroups]);

  /* ------------------------------------------------------------------------ *
   * Band (canonical pricing area)
   * ------------------------------------------------------------------------ *
   * NOTE: <PriceActionsBand> requires a valid `variant` key that exists in its
   * PRESET map. We compute it from the `packagePrice` shape.
   */
  const hasMonthly = typeof packagePrice?.monthly === "number";
  const hasSetup = typeof packagePrice?.oneTime === "number";

  // Valid variants for the detail page:
  // - monthly + oneTime → "detail-hybrid"
  // - monthly only      → "detail-oneTime" (flags/layout still appropriate)
  // - oneTime only      → "detail-oneTime"
  const bandVariant: "detail-hybrid" | "detail-oneTime" | null =
    packagePrice ? (hasSetup ? "detail-hybrid" : "detail-oneTime") : null;

  const bandProps = packagePrice && bandVariant
    ? {
        variant: bandVariant,
        price: packagePrice,
        // Prefer authored detail tagline; otherwise fall back to hero valueProp.
        tagline: priceBand?.tagline ?? valueProp,
        baseNote: priceBand?.baseNote,
        finePrint: priceBand?.finePrint ?? priceFinePrint,
        ctaPrimary: ctaPrimary ?? { label: "Request proposal", href: "/contact" },
        ctaSecondary: ctaSecondary ?? { label: "Book a call", href: "/book" },
        showDivider: true,
        align: "center" as const,
      }
    : null;

  /* ------------------------------------------------------------------------ *
   * Render
   * ------------------------------------------------------------------------ */
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
          {/* --------------------------- Phase 1: HERO ------------------------ */}
          <Phase1HeroSection
            id={id ? `${id}__phase1` : undefined}
            titleBlock={{
              id: id ? `${id}__title` : undefined,
              title,
              valueProp,
              description,
              icp,
            }}
            metaRow={
              showMeta
                ? {
                    service,
                    tags,
                    show: showMeta,
                  }
                : undefined
            }
            band={bandProps as any /* computed above; safe cast to phase prop */}
          />

          {/* --------------------------- Phase 2: WHY ------------------------- */}
          <Phase2WhySection
            id={id ? `${id}__phase2` : undefined}
            purpose={purposeHtml ? { html: purposeHtml } : undefined}
            painPoints={painPoints && painPoints.length > 0 ? { items: painPoints } : undefined}
            outcomes={
              outcomes && (Array.isArray(outcomes) ? outcomes.length > 0 : true)
                ? { outcomes, hideHeading: true }
                : undefined
            }
            icpText={icp}
            headings={{
              highlights: { title: highlightsTitle, tagline: highlightsTagline },
              outcomes: { title: outcomesTitle, tagline: outcomesTagline },
            }}
          />

          {/* --------------------------- Phase 3: WHAT ------------------------ */}
          <Phase3WhatSection
            id={id ? `${id}__phase3` : undefined}
            title={includesTitle}
            subtitle={includesTagline}
            highlights={
              (derivedHighlights?.length ?? 0) > 0
                ? { items: derivedHighlights, title: highlightsTitle, tagline: highlightsTagline }
                : undefined
            }
            includesFromGroups={
              hasGroups
                ? {
                    packageName: title,
                    groups: includesGroups!,
                    hideHeading: true,
                    variant: includesVariant,
                    maxCols: includesMaxCols,
                    dense: includesDense,
                    showIcons: includesShowIcons,
                    footnote: includesFootnote,
                    "ariaLabel": "What's included",
                    "data-testid": "includes-from-groups",
                  }
                : undefined
            }
            includesTable={hasTable ? (includesTable as PackageIncludesTableProps) : undefined}
            preferTable={!hasGroups && hasTable}
            stackOnDesktop={false}
          />

          {/* -------------------------- Phase 4: DETAILS ---------------------- */}
          <Phase4DetailsSection
            id={id ? `${id}__phase4` : undefined}
            title="Details & Trust"
            extras={extras}
            notes={notes ? { className: styles.notesEmphasis, children: notes } as any : undefined}
          />

          {/* --------------------------- Phase 5: NEXT ------------------------ */}
          <Phase5NextSection
            id={id ? `${id}__phase5` : undefined}
            title="What’s next"
            ctaRow={
              (ctaPrimary || ctaSecondary)
                ? {
                    primary: ctaPrimary ?? { label: "Request proposal", href: "/contact" },
                    secondary: ctaSecondary ?? { label: "Book a call", href: "/book" },
                    align: "center",
                  }
                : undefined
            }
          />
        </div>

        {/* =============================== RIGHT ============================== */}
        <aside className={styles.right} aria-label="Selected package">
          {/* Compact/pinned card — mapper builds the base; we enforce compact flags */}
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
    </section>
  );
}
