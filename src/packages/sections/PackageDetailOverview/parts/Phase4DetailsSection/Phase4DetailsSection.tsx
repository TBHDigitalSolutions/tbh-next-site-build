// src/packages/sections/PackageDetailOverview/parts/Phase4DetailsSection/Phase4DetailsSection.tsx
import * as React from "react";
import styles from "./Phase4DetailsSection.module.css";

import { PackageDetailExtras } from "@/packages/sections/PackageDetailExtras";
import { NotesBlock } from "@/packages/sections/PackageDetailOverview/parts/NotesBlock";

export type PackageDetailExtrasProps = React.ComponentProps<typeof PackageDetailExtras>;
export type NotesBlockProps = React.ComponentProps<typeof NotesBlock>;

export interface Phase4DetailsSectionProps {
  /** Section heading + optional subtitle */
  title?: string;     // defaults to "Details & Trust"
  subtitle?: string;

  /**
   * Extras payload (timeline, requirements, ethics, etc.)
   * This mirrors the existing PackageDetailExtras props so we stay aligned.
   */
  extras?: PackageDetailExtrasProps;

  /**
   * “Small print” / Notes block that typically renders under the includes table.
   * Reuses the existing NotesBlock so copy and a11y stay consistent.
   */
  notes?: NotesBlockProps;

  /** Layout hooks */
  id?: string;
  className?: string;

  /**
   * If true, stacks everything in a single column even on desktop.
   * Default: false (two columns on ≥1024px).
   */
  stackOnDesktop?: boolean;

  /**
   * Optional slot to render custom content at the bottom of the main column
   * (e.g., compliance badges, trust cards). Kept generic for future growth.
   */
  footerSlot?: React.ReactNode;
}

/**
 * Phase4DetailsSection
 * Phase 4 of the Packages Detail: “Details & Trust”
 * - Left (main): PackageDetailExtras (timeline, requirements, ethics…)
 * - Right (aside): NotesBlock (“small print”)
 *
 * Layout:
 * - Mobile: single column
 * - ≥1024px: two columns unless `stackOnDesktop` is true
 */
export function Phase4DetailsSection({
  title = "Details & Trust",
  subtitle,
  extras,
  notes,
  id,
  className,
  stackOnDesktop = false,
  footerSlot,
}: Phase4DetailsSectionProps) {
  const showExtras = !!extras;
  const showNotes = !!notes;

  if (!showExtras && !showNotes) return null;

  const headingId = React.useId();

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={[
        styles.wrap,
        stackOnDesktop ? styles.stackDesktop : styles.splitDesktop,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-section="Phase4DetailsSection"
    >
      <header className={styles.header}>
        <h2 id={headingId} className={styles.h2}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      <div className={styles.grid}>
        <div className={styles.colMain}>
          {showExtras ? <PackageDetailExtras {...extras!} /> : null}
          {footerSlot ? <div className={styles.footerSlot}>{footerSlot}</div> : null}
        </div>

        {showNotes ? (
          <aside className={styles.colAside} aria-label="Notes">
            <NotesBlock {...notes!} />
          </aside>
        ) : null}
      </div>
    </section>
  );
}

export default Phase4DetailsSection;
