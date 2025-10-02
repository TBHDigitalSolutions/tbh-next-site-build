/**
 * Phase 3 — "What You Get"
 * =============================================================================
 * PURPOSE
 *  - Communicate the concrete scope: highlights (top-line features),
 *    "what’s included" (grouped or tabular), and optional deliverables.
 *
 * ACCESSIBILITY & STRUCTURE
 *  - Phase heading via <PhaseSectionHeader/> (title + divider + tagline).
 *  - Each block wrapped with <SubSection/> to standardize sub-headings and
 *    provide `aria-labelledby` targets for assistive tech.
 *
 * DATA CONTRACT
 *  - Prefers `includesFromGroups` (aligned with SSOT groups). As a fallback,
 *    can render `includesTable` when `preferTable` is true or groups are absent.
 *
 * PERFORMANCE
 *  - Pure composition. Avoid heavy data operations here; normalize upstream.
 */

"use client";

import * as React from "react";
import styles from "./Phase3WhatSection.module.css";

import HighlightsBlock from "@/packages/sections/PackageDetailOverview/parts/HighlightsBlock";
import IncludesFromGroups from "@/packages/sections/PackageDetailOverview/parts/IncludesFromGroups";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";
import PackageIncludesTable from "@/packages/components/PackageIncludesTable";

/* ---- Correct wrapper paths ---- */
import PhaseSectionHeader from "@/packages/sections/PackageDetailOverview/parts/PhaseSectionHeader/PhaseSectionHeader";
import SubSection from "@/packages/sections/PackageDetailOverview/parts/SubSection/SubSection";

type HighlightItem = string | { label: string; icon?: React.ReactNode };

export interface Phase3WhatSectionProps {
  id?: string;
  className?: string;

  /** Phase header copy */
  phaseTitle?: string;    // default: "What you get"
  phaseTagline?: string;  // default: "Highlights, inclusions, and deliverables"

  /** Top-of-phase caption shown inside the "Includes" SubSection */
  includesTitle?: string;      // default: "What’s included"
  includesSubtitle?: string;   // default: "Everything that ships with this package."

  /** Highlights block */
  highlights?: { items: HighlightItem[]; title?: string; tagline?: string };

  /** Inclusions */
  includesFromGroups?: React.ComponentProps<typeof IncludesFromGroups>;
  includesTable?: PackageIncludesTableProps;
  preferTable?: boolean;

  /** Optional aside deliverables (ReactNode list or JSX) */
  deliverables?: React.ReactNode;

  /** Layout flag for narrow stacking (affects CSS only) */
  stackOnDesktop?: boolean;
}

function Phase3WhatSection({
  id,
  className,

  phaseTitle = "What you get",
  phaseTagline = "Highlights, inclusions, and deliverables",

  includesTitle = "What’s included",
  includesSubtitle = "Everything that ships with this package.",

  highlights,
  includesFromGroups,
  includesTable,
  preferTable = false,

  deliverables,
  stackOnDesktop = false,
}: Phase3WhatSectionProps) {
  const sectionClass = [
    styles.wrap,
    stackOnDesktop ? styles.stackDesktop : styles.splitDesktop,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const hasHighlights = !!highlights && (highlights.items?.length ?? 0) > 0;
  const hasGroups = !!includesFromGroups && (includesFromGroups.groups?.length ?? 0) > 0;
  const canUseTable = !!includesTable && (!hasGroups || preferTable);
  const hasIncludes = hasGroups || canUseTable;
  const hasDeliverables = !!deliverables;

  if (!hasHighlights && !hasIncludes && !hasDeliverables) return null;

  return (
    <section id={id} className={sectionClass} data-section="Phase3WhatSection" aria-labelledby={id ? `${id}__heading` : undefined}>
      <PhaseSectionHeader
        id={id ? `${id}__heading` : undefined}
        title={phaseTitle}
        tagline={phaseTagline}
        className={styles.phaseHeader}
      />

      {/* ------------------------ Highlights ------------------------ */}
      {hasHighlights ? (
        <SubSection
          id={id ? `${id}__highlights` : undefined}
          title={highlights.title ?? "Highlights"}
          tagline={highlights.tagline ?? "Top features at a glance"}
          className={styles.block}
          data-block="highlights"
        >
          <HighlightsBlock
            title={highlights.title ?? "Highlights"}
            subtitle={highlights.tagline ?? undefined}
            items={highlights.items}
          />
        </SubSection>
      ) : null}

      {/* ------------------------ Includes -------------------------- */}
      {hasIncludes ? (
        <SubSection
          id={id ? `${id}__includes` : undefined}
          title={includesTitle}
          tagline={includesSubtitle}
          className={styles.block}
          data-block="includes"
        >
          {hasGroups && !preferTable && includesFromGroups ? (
            <IncludesFromGroups {...includesFromGroups} />
          ) : canUseTable && includesTable ? (
            <PackageIncludesTable {...includesTable} />
          ) : null}
        </SubSection>
      ) : null}

      {/* ----------------------- Deliverables ----------------------- */}
      {hasDeliverables ? (
        <SubSection
          id={id ? `${id}__deliverables` : undefined}
          title="Deliverables"
          tagline="Artifacts you’ll receive"
          className={styles.block}
          data-block="deliverables"
        >
          {deliverables}
        </SubSection>
      ) : null}
    </section>
  );
}

export default React.memo(Phase3WhatSection);
