// src/packages/sections/PackageDetailOverview/parts/Phase3WhatSection/Phase3WhatSection.tsx
import * as React from "react";
import styles from "./Phase3WhatSection.module.css";

import { HighlightsBlock } from "@/packages/sections/PackageDetailOverview/parts/HighlightsBlock";
import { IncludesFromGroups } from "@/packages/sections/PackageDetailOverview/parts/IncludesFromGroups";
// If your repo exposes this via an index, this import will work.
// Otherwise, change to the direct component path.
import { PackageIncludesTable } from "@/packages/components/PackageIncludesTable";

export type HighlightsBlockProps = React.ComponentProps<typeof HighlightsBlock>;
export type IncludesFromGroupsProps = React.ComponentProps<typeof IncludesFromGroups>;
export type PackageIncludesTableProps = React.ComponentProps<typeof PackageIncludesTable>;

export interface Phase3WhatSectionProps {
  /** Section heading and optional subtitle */
  title?: string;                     // defaults to "What you get"
  subtitle?: string;

  /** Optional highlights/features chips (top row) */
  highlights?: HighlightsBlockProps;

  /**
   * Primary includes source (grouped bullets)
   * Reuses the existing IncludesFromGroups part to stay consistent with PDO.
   */
  includesFromGroups?: IncludesFromGroupsProps;

  /**
   * Fallback includes when data is tabular (columns/rows)
   * Only used if `includesFromGroups` is absent OR `preferTable` is true.
   */
  includesTable?: PackageIncludesTableProps;

  /**
   * Optional deliverables block rendered as a simple list (right column on desktop).
   * Example: { title: "Deliverables", items: ["Audit deck (PDF)", "Implementation plan", ...] }
   */
  deliverables?: { title?: string; items: string[]; caption?: string };

  /** Layout hooks */
  id?: string;
  className?: string;

  /**
   * If true, the lower grid (includes + deliverables) stacks in one column
   * even on desktop (for very dense content). Default: false (two columns).
   */
  stackOnDesktop?: boolean;

  /**
   * If true, prefer the tabular includes even when groups are present.
   * Default: false (groups win when provided).
   */
  preferTable?: boolean;
}

/**
 * Phase3WhatSection
 * Phase 3 of the Packages Detail: “What you get”
 * - Optional Highlights (chips)
 * - Includes (from groups OR table)
 * - Optional Deliverables (simple styled list)
 */
export function Phase3WhatSection({
  title = "What you get",
  subtitle,
  highlights,
  includesFromGroups,
  includesTable,
  deliverables,
  id,
  className,
  stackOnDesktop = false,
  preferTable = false,
}: Phase3WhatSectionProps) {
  const hasHighlights = !!highlights && (highlights.items?.length ?? 0) > 0;

  const shouldUseTable =
    !!includesTable &&
    (!includesFromGroups || preferTable);

  const hasIncludes =
    (!!includesFromGroups && !preferTable) || shouldUseTable;

  const hasDeliverables = !!deliverables && (deliverables.items?.length ?? 0) > 0;

  if (!hasHighlights && !hasIncludes && !hasDeliverables) return null;

  const headingId = React.useId();

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={[
        styles.wrap,
        stackOnDesktop ? styles.stackDesktop : styles.splitDesktop,
        className,
      ].filter(Boolean).join(" ")}
      data-section="Phase3WhatSection"
    >
      <header className={styles.header}>
        <h2 id={headingId} className={styles.h2}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      {hasHighlights ? (
        <div className={styles.row}>
          <HighlightsBlock {...highlights} />
        </div>
      ) : null}

      {(hasIncludes || hasDeliverables) ? (
        <div className={styles.grid}>
          <div className={styles.colMain}>
            {!shouldUseTable && includesFromGroups ? (
              <IncludesFromGroups {...includesFromGroups} />
            ) : null}

            {shouldUseTable && includesTable ? (
              <PackageIncludesTable {...includesTable} />
            ) : null}
          </div>

          {hasDeliverables ? (
            <aside className={styles.colAside} aria-label={deliverables?.title || "Deliverables"}>
              <div className={styles.deliverables}>
                <h3 className={styles.deliverablesTitle}>
                  {deliverables?.title ?? "Deliverables"}
                </h3>
                {deliverables?.caption ? (
                  <p className={styles.deliverablesCaption}>{deliverables.caption}</p>
                ) : null}
                <ul className={styles.deliverablesList} role="list">
                  {deliverables!.items.map((d, i) => (
                    <li className={styles.deliverable} key={`${i}-${d}`}>
                      <span className={styles.bullet} aria-hidden="true">•</span>
                      <span className={styles.label}>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

export default Phase3WhatSection;
