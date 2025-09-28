// src/packages/sections/PackageDetailOverview/parts/CTARow/CTARow.tsx
"use client";

import * as React from "react";
import styles from "./CTARow.module.css";
import Button from "@/components/ui/atoms/Button/Button";

export type CTA = { label: string; href: string; ariaLabel?: string };

export type CTARowProps = {
  /** Primary CTA — policy-standard: “Request proposal” */
  primary?: CTA;

  /** Secondary CTA — policy-standard: “Book a call” */
  secondary?: CTA;

  /** Horizontal alignment for the row (defaults to "start"). */
  align?: "start" | "center" | "end";

  /** Visual density (spacing between CTAs). */
  size?: "sm" | "md";

  /** Optional test id for e2e testing. */
  "data-testid"?: string;

  className?: string;
  style?: React.CSSProperties;

  /** Optional analytics hook (spread on the wrapper) */
  analytics?: {
    category?: string;
    action?: string;
    label?: string;
  };
};

/**
 * CTARow — standardized CTA pair using the shared Button atom.
 * - Never renders raw <a>/<button>; always uses Button (asChild).
 * - Mobile-first: CTAs stack to full width <560px.
 * - Accessibility: grouped with aria-label; each link gets a descriptive aria-label.
 */
export default function CTARow({
  primary,
  secondary,
  align = "start",
  size = "md",
  "data-testid": testId = "cta-row",
  className,
  style,
  analytics,
}: CTARowProps) {
  if (!primary && !secondary) return null;

  const alignClass =
    align === "center" ? styles.alignCenter : align === "end" ? styles.alignEnd : styles.alignStart;
  const sizeClass = size === "sm" ? styles.sizeSm : styles.sizeMd;

  return (
    <div
      className={[styles.row, alignClass, sizeClass, className].filter(Boolean).join(" ")}
      style={style}
      role="group"
      aria-label="Primary actions"
      data-testid={testId}
      {...(analytics
        ? {
            "data-analytics-category": analytics.category ?? "packages",
            "data-analytics-action": analytics.action ?? "cta_click",
            "data-analytics-label": analytics.label,
          }
        : {})}
    >
      {primary ? (
        <Button asChild variant="primary" data-testid={`${testId}__primary`}>
          <a href={primary.href} aria-label={primary.ariaLabel ?? primary.label}>
            {primary.label}
          </a>
        </Button>
      ) : null}

      {secondary ? (
        <Button asChild variant="secondary" data-testid={`${testId}__secondary`}>
          <a href={secondary.href} aria-label={secondary.ariaLabel ?? secondary.label}>
            {secondary.label}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
