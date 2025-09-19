"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./PillarsGrid.module.css";
import type { Pillar } from "../types";

// ⬇️ Adjust this import if your PillarCard lives elsewhere.
import PillarCard from "@/components/ui/organisms/ServicesAndCapabilitiesExpandable/parts/PillarCard";

export type PillarsGridProps = {
  /** Normalized pillar items (title, description, deliverables, icon) */
  items: Pillar[];
  /** Preferred column count on desktop (auto-resizes down on smaller breakpoints). */
  columns?: 2 | 3 | 4;
  /** Use a denser layout with tighter spacing. */
  dense?: boolean;
  /** Extra className passthrough. */
  className?: string;
  /** Optional ARIA label for the list container. */
  ariaLabel?: string;
};

export default function PillarsGrid({
  items,
  columns = 3,
  dense = false,
  className,
  ariaLabel,
}: PillarsGridProps) {
  if (!items?.length) return null;

  // Clamp columns for safety
  const clampedCols = Math.min(4, Math.max(2, columns));

  return (
    <div
      className={clsx(
        styles.wrapper,
        styles[`cols${clampedCols}`],
        dense && styles.dense,
        className
      )}
      data-component="PillarsGrid"
    >
      <ul className={styles.grid} role="list" aria-label={ariaLabel}>
        {items.map((p) => {
          const key = p.id || `${p.title}-${Math.random().toString(36).slice(2)}`;

          return (
            <li key={key} className={styles.item} role="listitem">
              <PillarCard
                /** PillarCard commonly expects these props; adjust if your API differs */
                title={p.title}
                description={p.description}
                deliverables={p.deliverables}
                icon={p.icon}
                /** Helpful data attributes for analytics or QA */
                data-pillar-id={p.id}
                data-pillar-title={p.title}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
