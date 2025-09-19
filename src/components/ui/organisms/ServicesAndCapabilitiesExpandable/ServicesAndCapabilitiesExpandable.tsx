"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./ServicesAndCapabilitiesExpandable.module.css";

import type { ServicesAndCapabilitiesExpandableProps } from "./types";
import { normalizeProps } from "./adapters";

import PillarsGrid from "./parts/PillarsGrid";
import InlineBullets from "./parts/InlineBullets";
import ExpandableBullets from "./parts/ExpandableBullets";

export type SectionProps =
  | ServicesAndCapabilitiesExpandableProps
  // Allow passing a raw block (page data) the adapter can normalize
  | { block: unknown; className?: string; analyticsId?: string };

/**
 * One super-section for Services & Capabilities + Expandable Bullets.
 * - Pillars grid (deliverables)
 * - Optional quick inline bullets (links)
 * - Expandable bullets (accordion rows with scope/workflow/cta)
 *
 * Nothing renders if no content passed (defensive).
 */
export default function ServicesAndCapabilitiesExpandable(raw: SectionProps) {
  const props = normalizeProps(raw as any);

  const {
    title,
    intro,
    pillars,
    bullets,
    expandable,
    defaultOpen,
    analyticsId,
    className,
  } = props;

  const hasPillars = Boolean(pillars?.length);
  const hasBullets = Boolean(bullets?.length);
  const hasExpandable = Boolean(expandable?.length);

  if (!hasPillars && !hasBullets && !hasExpandable) return null;

  return (
    <section
      className={clsx(styles.section, className)}
      data-component="ServicesAndCapabilitiesExpandable"
      data-analytics-id={analyticsId}
    >
      {(title || intro) && (
        <header className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {intro && <p className={styles.intro}>{intro}</p>}
          <hr className={styles.divider} />
        </header>
      )}

      {hasPillars && (
        <div className={styles.block}>
          <PillarsGrid items={pillars!} />
        </div>
      )}

      {hasBullets && (
        <div className={styles.block}>
          <InlineBullets items={bullets!} ariaLabel="Quick links" />
        </div>
      )}

      {hasExpandable && (
        <div className={clsx(styles.block, styles.expandables)}>
          <ExpandableBullets
            items={expandable!}
            defaultOpen={typeof defaultOpen === "number" ? defaultOpen : 0}
            allowMultiple
            dense={false}
            itemHeadingAs="h3"
            analyticsId={analyticsId ? `${analyticsId}:expandable` : undefined}
          />
        </div>
      )}
    </section>
  );
}
