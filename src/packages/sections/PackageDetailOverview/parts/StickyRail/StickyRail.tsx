// src/packages/sections/PackageDetailOverview/parts/StickyRail/StickyRail.tsx
"use client";

import * as React from "react";
import styles from "./StickyRail.module.css";
import PackageCard, {
  type PackageCardProps,
} from "@/packages/components/PackageCard";

export type StickyRailProps = {
  /** Card to render in the sticky right rail. Variant will be forced to "rail". */
  card: PackageCardProps;

  /** Sticky top offset (e.g., 72 or "72px"). Defaults to CSS var fallback. */
  offsetTop?: number | string;

  id?: string;
  ariaLabel?: string;
  "data-testid"?: string;

  className?: string;
  style?: React.CSSProperties;
};

export default function StickyRail({
  card,
  offsetTop,
  id,
  ariaLabel = "Selected package",
  "data-testid": testId = "sticky-rail",
  className,
  style,
}: StickyRailProps) {
  // No-op if we don't have a card (defensive)
  if (!card) return null;

  // Allow consumers to override the sticky offset via CSS var
  const mergedStyle: React.CSSProperties & Record<string, string> = {
    ...style,
  };
  if (offsetTop !== undefined) {
    mergedStyle["--sticky-top"] =
      typeof offsetTop === "number" ? `${offsetTop}px` : String(offsetTop);
  }

  return (
    <aside
      id={id}
      aria-label={ariaLabel}
      data-testid={testId}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      style={mergedStyle}
    >
      <div className={styles.shell}>
        {/* Force variant="rail" to ensure consistent compact card styling */}
        <PackageCard {...card} variant="rail" />
      </div>
    </aside>
  );
}
