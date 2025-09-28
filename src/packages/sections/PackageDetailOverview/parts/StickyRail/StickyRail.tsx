// src/packages/sections/PackageDetailOverview/parts/StickyRail/StickyRail.tsx
"use client";

import * as React from "react";
import styles from "./StickyRail.module.css";
import PackageCard, { type PackageCardProps } from "@/packages/components/PackageCard";

export type StickyRailProps = {
  /** Card to render in the sticky right rail. */
  card: PackageCardProps;

  /** Sticky top offset (e.g., 72 or "72px"). Defaults to CSS var fallback. */
  offsetTop?: number | string;

  /** Hide actions completely (optional, default false). */
  hideActions?: boolean;

  id?: string;
  ariaLabel?: string;
  "data-testid"?: string;

  className?: string;
  style?: React.CSSProperties;
};

export default function StickyRail({
  card,
  offsetTop,
  hideActions = false,
  id,
  ariaLabel = "Selected package",
  "data-testid": testId = "sticky-rail",
  className,
  style,
}: StickyRailProps) {
  if (!card) return null;

  // Allow consumers to override the sticky offset via CSS var
  const mergedStyle: React.CSSProperties & Record<string, string> = { ...style };
  if (offsetTop !== undefined) {
    mergedStyle["--sticky-top"] = typeof offsetTop === "number" ? `${offsetTop}px` : String(offsetTop);
  }

  // Enforce compact content for the pinned rail. We keep visuals “rail-like” but,
  // per requirement, we hide tags, outcomes, and includes/lists and clamp summary.
  const compactCard: PackageCardProps = {
    ...card,
    variant: card.variant ?? "pinned-compact",
    hideTags: true,
    hideOutcomes: true,
    hideIncludes: true,
    descriptionMaxLines: 3,
    ...(hideActions ? { hideActions: true } : null),
  } as PackageCardProps;

  return (
    <aside
      id={id}
      aria-label={ariaLabel}
      data-testid={testId}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      style={mergedStyle}
    >
      <div className={styles.shell}>
        <div className={styles.cardFrame}>
          <PackageCard {...compactCard} />
        </div>
      </div>
    </aside>
  );
}
