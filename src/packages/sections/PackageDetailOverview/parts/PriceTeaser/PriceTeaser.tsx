// src/packages/sections/PackageDetailOverview/parts/PriceTeaser/PriceTeaser.tsx
"use client";

import * as React from "react";
import styles from "./PriceTeaser.module.css";
import { PriceLabel, type Money } from "@/components/ui/molecules/PriceLabel";

export type PriceTeaserProps = {
  /** Canonical package price (Money). If missing/empty, component renders null. */
  price?: Money;

  /** Leading text shown before the price (defaults to “Starting at”). */
  label?: string;

  /** Optional small-print notes (e.g., “Month-to-month available”). */
  notes?: string;

  /** Visual density. */
  size?: "sm" | "md";

  /** Emphasize the label with a subtle brand tint. */
  emphasis?: boolean;

  /** Horizontal alignment helper. */
  align?: "start" | "center" | "end";

  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
};

export default function PriceTeaser({
  price,
  label = "Starting at",
  notes,
  size = "md",
  emphasis = false,
  align = "start",
  className,
  style,
  "data-testid": testId,
}: PriceTeaserProps) {
  const hasPrice = !!price && (typeof price.monthly === "number" || typeof price.oneTime === "number");
  if (!hasPrice) return null;

  const alignClass =
    align === "center" ? styles.alignCenter : align === "end" ? styles.alignEnd : styles.alignStart;
  const sizeClass = size === "sm" ? styles.sizeSm : styles.sizeMd;

  return (
    <div
      className={[
        styles.wrap,
        alignClass,
        sizeClass,
        emphasis ? styles.emphasis : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="group"
      aria-label="Price teaser"
      data-testid={testId ?? "price-teaser"}
    >
      {/* Leading label */}
      {label ? <span className={styles.label}>{label}</span> : null}

      {/* Canonical price display (delegates formatting to PriceLabel) */}
      <PriceLabel price={price as Money} />

      {/* Optional notes */}
      {notes ? <span className={styles.notes}>{notes}</span> : null}
    </div>
  );
}
