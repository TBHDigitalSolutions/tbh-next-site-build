// src/packages/sections/PackageDetailOverview/parts/PriceTeaser/PriceTeaser.tsx
"use client";

import * as React from "react";
import styles from "./PriceTeaser.module.css";
import type { Money } from "@/components/ui/molecules/PriceLabel";
import { startingAtLabel } from "@/packages/lib/pricing";

/**
 * PriceTeaser — "Starting at …" text derived from canonical Money
 * - Single source of truth via startingAtLabel(price)
 * - Single line (no wrapping), alignment controlled via props
 * - Optional small-print notes remain supported
 *
 * NOTE: We intentionally DO NOT render <PriceLabel/> here to avoid
 *       double-rendering different formats of the same price.
 */
export type PriceTeaserProps = {
  /** Canonical package price (Money). Renders null if absent/empty. */
  price?: Money;

  /** (Optional) small-print notes, e.g., “Month-to-month available”. */
  notes?: string;

  /** Visual density. */
  size?: "sm" | "md";

  /** Emphasize the teaser chip with a subtle brand tint. */
  emphasis?: boolean;

  /** Horizontal alignment for the row. */
  align?: "start" | "center" | "end";

  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;

  /** @deprecated — label text is computed from Money and ignored */
  label?: string;
};

export default function PriceTeaser({
  price,
  notes,
  size = "md",
  emphasis = false,
  align = "start",
  className,
  style,
  "data-testid": testId,
}: PriceTeaserProps) {
  // Ensure we actually have a price to derive from
  const hasPrice =
    !!price && (typeof price.monthly === "number" || typeof price.oneTime === "number");
  if (!hasPrice) return null;

  // Compute the single punchline from the canonical Money object
  const teaser = startingAtLabel(price as Money);
  if (!teaser) return null;

  const alignClass =
    align === "center" ? styles.alignCenter : align === "end" ? styles.alignEnd : styles.alignStart;
  const sizeClass = size === "sm" ? styles.sizeSm : styles.sizeMd;

  return (
    <div
      className={[styles.wrap, alignClass, sizeClass, emphasis ? styles.emphasis : undefined, className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="group"
      aria-label="Price teaser"
      data-testid={testId ?? "price-teaser"}
    >
      {/* Single-line teaser derived from Money */}
      <span className={styles.label}>{teaser}</span>

      {/* Optional small-print notes (kept for flexibility) */}
      {notes ? <span className={styles.notes}>{notes}</span> : null}
    </div>
  );
}
