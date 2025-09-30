// src/packages/sections/PackageDetailOverview/parts/HighlightsBlock/HighlightsBlock.tsx
import * as React from "react";
import styles from "./HighlightsBlock.module.css";
import { FeatureList } from "@/components/ui/molecules/FeatureList";

type HighlightItem = string | { label: string; icon?: React.ReactNode };

export interface HighlightsBlockProps {
  title?: string;                 // defaults to "Highlights"
  subtitle?: string;              // optional short subheading
  items: HighlightItem[];         // 3–8 is ideal; renders 2x3 on desktop
  className?: string;
  id?: string;
}

/**
 * HighlightsBlock
 * Responsive 2-column grid of chip-style feature bullets.
 * - Desktop: 2 columns (equal width)
 * - Mobile: stacks to 1 column
 * Reuses the FeatureList molecule for visual consistency.
 */
export function HighlightsBlock({
  title = "Highlights",
  subtitle,
  items,
  className,
  id,
}: HighlightsBlockProps) {
  if (!items || items.length === 0) return null;

  // Normalize into FeatureList-friendly items
  const normalized = items.map((it) =>
    typeof it === "string" ? { label: it } : it
  );

  return (
    <section className={[styles.wrap, className].filter(Boolean).join(" ")} id={id}>
      <header className={styles.header}>
        <h2 className={styles.h2}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      {/* FeatureList already handles checkmarks & spacing.
          We only apply the 2-col layout & chip variant here. */}
      <div className={styles.grid}>
        <FeatureList
          items={normalized}
          variant="chip"               // chip-like pills (uses your theme tokens)
          className={styles.list}     // gaps controlled by this module
        />
      </div>
    </section>
  );
}

export default HighlightsBlock;
