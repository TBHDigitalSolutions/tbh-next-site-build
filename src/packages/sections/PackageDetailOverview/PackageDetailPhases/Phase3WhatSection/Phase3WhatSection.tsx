// src/packages/sections/PackageDetailOverview/PackageDetailPhases/Phase3WhatSection/Phase3WhatSection.tsx
/**
 * Phase 3 — “What You Get”
 * =============================================================================
 * PURPOSE
 *  - Communicates the concrete value customers receive:
 *      1) Highlights / features (chip-style list)
 *      2) What’s included (grouped bullets OR tabular matrix)
 *      3) Deliverables (optional, free-form or structured node)
 *
 * COMPOSITION
 *  - Each *phase* begins with a consistent header (Title → Divider → Tagline)
 *    via <PhaseSectionHeader/>.
 *  - Each *block inside the phase* (Highlights, Includes, Deliverables) is
 *    wrapped by <SubSection/> which provides a smaller Title → Divider → Tagline
 *    header and sets predictable semantics/ARIA.
 *
 * SELECTION LOGIC (INCLUDES)
 *  - `preferTable` true + `includesTable` provided → render table.
 *  - Else if `includesFromGroups` provided → render grouped bullets.
 *  - Else if `includesTable` provided → render table (fallback).
 *  - Else → omit the Includes block entirely.
 *
 * ACCESSIBILITY
 *  - The outer <section> receives `data-section="Phase3WhatSection"` to help
 *    testing/analytics and is labeled by the PhaseSectionHeader heading.
 *  - Each inner block (<SubSection/>) sets its own `aria-labelledby` id to keep
 *    screen-reader navigation clear and consistent.
 *
 * PERFORMANCE
 *  - This file is a lightweight composition layer with simple, memoized
 *    selection logic. Heavy/expensive work (e.g. markdown → HTML) should be
 *    completed upstream.
 */

"use client";

import * as React from "react";
import styles from "./Phase3WhatSection.module.css";

/* ----------------------------- PDO parts (UI) ----------------------------- */
import HighlightsBlock from "@/packages/sections/PackageDetailOverview/parts/HighlightsBlock";
import IncludesFromGroups from "@/packages/sections/PackageDetailOverview/parts/IncludesFromGroups";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";
import PackageIncludesTable from "@/packages/components/PackageIncludesTable";

/* ----------- Headers / wrappers (use provided parts/* import paths) -------- */
import PhaseSectionHeader from "@/packages/sections/PackageDetailOverview/parts/PhaseSectionHeader/PhaseSectionHeader";
import SubSection from "@/packages/sections/PackageDetailOverview/parts/SubSection/SubSection";

/* --------------------------------- Types ---------------------------------- */
type HighlightItem = string | { label: string; icon?: React.ReactNode };

/**
 * Public props for the Phase 3 section.
 * - `highlights` mirrors HighlightsBlock with a minimal wrapper for title/tagline.
 * - `includesFromGroups` forwards through to IncludesFromGroups part.
 * - `includesTable` forwards through to PackageIncludesTable when used.
 * - `deliverables` is purposely open-ended (ReactNode) so authors can pass a
 *   simple list or a custom JSX composition without changing this API.
 */
export interface Phase3WhatSectionProps {
  /** DOM id for the outer phase section (used to derive stable child ids) */
  id?: string;
  className?: string;

  /** Phase header copy */
  phaseTitle?: string;   // default: "What you get"
  phaseTagline?: string; // default: "Highlights, inclusions, and deliverables"

  /** “What’s included” block header copy (within the phase) */
  title?: string;        // default: "What’s included"
  subtitle?: string;     // small tagline under the includes header

  /** Highlights block (chips) */
  highlights?: { items: HighlightItem[]; title?: string; tagline?: string };

  /** Inclusions (choose groups or table — see selection logic above) */
  includesFromGroups?: React.ComponentProps<typeof IncludesFromGroups>;
  includesTable?: PackageIncludesTableProps;
  preferTable?: boolean; // if true, render table even if groups exist

  /** Optional deliverables (free-form ReactNode) */
  deliverables?: React.ReactNode;

  /** Layout flag — force vertical stacking even on desktop (dense content) */
  stackOnDesktop?: boolean;
}

/* ----------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

function Phase3WhatSection({
  id,
  className,

  phaseTitle = "What you get",
  phaseTagline = "Highlights, inclusions, and deliverables",

  title = "What’s included",
  subtitle,

  highlights,
  includesFromGroups,
  includesTable,
  preferTable = false,

  deliverables,
  stackOnDesktop = false,
}: Phase3WhatSectionProps) {
  /* ------------------------------- Guards/flags ------------------------------ */
  const hasHighlights = !!highlights && (highlights.items?.length ?? 0) > 0;

  /**
   * Decide which includes renderer to use.
   * - preferTable wins if true (and a table exists)
   * - otherwise use groups if present
   * - otherwise fall back to table if present
   */
  const includesChoice: "groups" | "table" | null = React.useMemo(() => {
    if (preferTable && includesTable) return "table";
    if (includesFromGroups) return "groups";
    if (includesTable) return "table";
    return null;
  }, [preferTable, includesFromGroups, includesTable]);

  const hasIncludes = includesChoice !== null;
  const hasDeliverables = !!deliverables;

  // If nothing to show, don’t emit the section.
  if (!hasHighlights && !hasIncludes && !hasDeliverables) return null;

  const sectionClass = [
    styles.wrap,
    stackOnDesktop ? styles.stackDesktop : styles.splitDesktop,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={id} className={sectionClass} data-section="Phase3WhatSection">
      {/* ======================= Phase header (title/divider/tagline) ======================= */}
      <PhaseSectionHeader
        id={id ? `${id}__heading` : undefined}
        title={phaseTitle}
        tagline={phaseTagline}
        className={styles.phaseHeader}
      />

      {/* =================================== Highlights =================================== */}
      {hasHighlights ? (
        <SubSection
          id={id ? `${id}__highlights` : undefined}
          title={highlights?.title ?? "Highlights"}
          tagline={highlights?.tagline ?? "Top features at a glance"}
          className={styles.block}
          data-block="highlights"
        >
          <HighlightsBlock
            title={highlights?.title ?? "Highlights"}
            subtitle={highlights?.tagline ?? undefined}
            items={highlights!.items}
          />
        </SubSection>
      ) : null}

      {/* ==================================== Includes ==================================== */}
      {hasIncludes ? (
        <SubSection
          id={id ? `${id}__includes` : undefined}
          title={title}
          tagline={subtitle ?? "Everything that ships with this package."}
          className={styles.block}
          data-block="includes"
        >
          {includesChoice === "groups" && includesFromGroups ? (
            <IncludesFromGroups {...includesFromGroups} />
          ) : null}

          {includesChoice === "table" && includesTable ? (
            <PackageIncludesTable {...includesTable} />
          ) : null}
        </SubSection>
      ) : null}

      {/* ================================= Deliverables ================================== */}
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
