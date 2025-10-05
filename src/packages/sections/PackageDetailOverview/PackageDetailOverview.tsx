// src/packages/sections/PackageDetailOverview/PackageDetailOverview.tsx
/**
 * PackageDetailOverview
 * =============================================================================
 * The “super card” for a Package Detail page. This component composes the
 * five top-level phases (Hero → Why → What → Details → Next) and the sticky
 * right rail card. It is intentionally **presentation-only**: heavy logic
 * lives in the content pipeline (MDX → JSON → Zod) and in the mappers layer.
 *
 * Production goals
 * -----------------------------------------------------------------------------
 * - **Safe pricing band**: Always derive a valid `variant` for <PriceActionsBand>
 *   via `bandPropsFor("detail", price, copy)` to avoid runtime crashes.
 * - **Strict inputs**: Accept the canonical Money shape for price (`Money`).
 * - **Predictable headings**: Provide consistent default titles/taglines for
 *   each phase and subsection, overridable via props.
 * - **A11y**: Expose stable ids for aria-labelledby relationships.
 * - **No hidden policy**: Don’t inject hero summary into band tagline; that
 *   copy must be explicitly authored (policy).
 *
 * Lifecycle / Data flow
 * -----------------------------------------------------------------------------
 * 1) Validated package data is shaped by registry mappers into this component’s props.
 * 2) We compute final props for each sub-section and render the phases.
 * 3) The sticky rail card receives a compact/pinned variant.
 *
 * Notes
 * -----------------------------------------------------------------------------
 * - This is a client component because a few child blocks rely on client-only
 *   effects. Keep side effects minimal; expensive work belongs upstream.
 */

"use client";

import * as React from "react";
import styles from "./PackageDetailOverview.module.css";

/* -------------------------------- Pricing helpers ------------------------- */
/** Canonical Money shape + band helper */
import type { Money } from "@/packages/lib/types/pricing";
import { bandPropsFor } from "@/packages/lib/types/band";

/* --------------------------------- UI contracts --------------------------- */
import type { OutcomeItem } from "@/components/ui/molecules/OutcomeList";
import type { ServiceSlug } from "@/components/ui/molecules/ServiceChip";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";
import type { PackageCardProps } from "@/packages/components/PackageCard";
import type { IncludesGroup } from "./parts/IncludesFromGroups"; // type-only

/* -------------------------------- Right rail card ------------------------- */
import StickyRail from "./parts/StickyRail";

/* ------------------------------------ Phases ------------------------------ */
import Phase1HeroSection from "./PackageDetailPhases/Phase1HeroSection";
import Phase2WhySection from "./PackageDetailPhases/Phase2WhySection";
import Phase3WhatSection from "./PackageDetailPhases/Phase3WhatSection";
import Phase4DetailsSection from "./PackageDetailPhases/Phase4DetailsSection";
import Phase5NextSection from "./PackageDetailPhases/Phase5NextSection";

/* --------------------------- Optional extras bundle ----------------------- */
import PackageDetailExtras from "@/packages/sections/PackageDetailExtras";

/* =============================================================================
 * Types
 * ========================================================================== */

/** Simple CTA contract shared by multiple surfaces. */
export type CTAItem = { label: string; href: string };

/**
 * Public prop surface for the overview “super card”.
 * Data is usually produced by the registry mappers (validated content).
 */
export type PackageDetailOverviewProps = {
  id?: string;

  /** Phase 1 (Hero) */
  title: string;
  valueProp: string;            // concise benefit statement (hero subtitle)
  description?: string;         // longer paragraph under the value prop
  icp?: string;                 // ideal-customer one-liner
  service?: ServiceSlug;
  tags?: string[];
  showMeta?: boolean;           // controls Service/Tags chips in hero meta row

  /** Pricing (canonical Money shape – SSOT) */
  packagePrice?: Money;

  /**
   * Explicit price band copy for the **detail page**. This should be authored
   * and is intentionally not derived from `valueProp` (policy).
   */
  priceBand?: {
    tagline?: string;                // marketing line for band
    baseNote?: "proposal" | "final"; // rendering hint
    finePrint?: string;              // e.g., "3-month minimum • + ad spend"
  };

  /** CTA policy (labels/links typically provided by mappers) */
  ctaPrimary?: CTAItem;
  ctaSecondary?: CTAItem;

  /** Phase 2 (Why) */
  purposeHtml?: string;              // compiled HTML narrative (short)
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

  /** Legacy fine print passthrough (left for back-compat; prefer priceBand.finePrint) */
  priceFinePrint?: string;

  className?: string;
  style?: React.CSSProperties;
};

/* =============================================================================
 * Component
 * ========================================================================== */

function PackageDetailOverview({
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

  /* Copy overrides */
  highlightsTitle = "Highlights",
  highlightsTagline = "This package includes these key features.",
  outcomesTitle = "Outcomes you can expect",
  outcomesTagline = "Projected results you can expect to achieve with this package.",
  includesTitle = "What’s included",
  includesCaption,

  /* Includes controls */
  includesVariant = "cards",
  includesMaxCols = 3,
  includesDense = false,
  includesShowIcons = true,
  includesFootnote,

  /* Rail + Details */
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

  // Prefer authored includes caption; otherwise provide a stable default.
  const includesTagline =
    typeof includesCaption === "string" && includesCaption.trim()
      ? includesCaption
      : "Everything that ships with this package.";

  const hasGroups = (includesGroups?.length ?? 0) > 0;
  const hasTable =
    !!includesTable && (Array.isArray(includesTable.rows) ? includesTable.rows.length > 0 : true);

  /**
   * Derive "Highlights" from the first N includes when `features` are absent.
   * This mirrors prior Overview behavior and ensures a compact, tidy list.
   */
  const derivedHighlights: Array<string | { label: string; icon?: React.ReactNode }> =
    React.useMemo(() => {
      if (features?.length) return features;
      if (!hasGroups) return [];
      const fromGroups = (includesGroups ?? [])
        .flatMap((g) =>
          (g.items ?? []).map((it: any) => (typeof it === "string" ? it : it?.label ?? ""))
        )
        .filter(Boolean);
      return fromGroups.slice(0, 6);
    }, [features, hasGroups, includesGroups]);

  /* ------------------------------------------------------------------------ *
   * Price band (canonical pricing area)
   * ------------------------------------------------------------------------ *
   * ❗️IMPORTANT: <PriceActionsBand> requires a valid `variant` that maps to
   * its PRESET keys. We **must not** handcraft `variant` here.
   * Instead, rely on `bandPropsFor("detail", price, copy)` to:
   *   - Compute a correct variant from the Money shape
   *   - Normalize baseNote text
   *   - Pass back a ready-to-spread props object
   *
   * Policy: do **not** fall back hero summary into band tagline. Band copy
   * must be explicitly authored via `priceBand`.
   */
  const bandProps = packagePrice
    ? {
        ...bandPropsFor("detail", packagePrice, {
          tagline: priceBand?.tagline,
          baseNote: priceBand?.baseNote,
          finePrint: priceBand?.finePrint ?? priceFinePrint,
        }),
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
            // The hero section renders the canonical pricing/CTA band
            band={bandProps as any /* computed above; type-compatible with Phase1 */}
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
          {/* Sticky compact card — source props from mappers; enforce compact flags */}
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

/**
 * memo
 * -----------------------------------------------------------------------------
 * The overview composes many pure child components. Memoization prevents
 * unnecessary re-renders on stable props in client transitions.
 */
export default React.memo(PackageDetailOverview);
