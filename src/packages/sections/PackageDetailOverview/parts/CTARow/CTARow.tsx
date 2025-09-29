// src/packages/sections/PackageDetailOverview/parts/CTARow/CTARow.tsx
"use client";

import * as React from "react";
import styles from "./CTARow.module.css";
import Button from "@/components/ui/atoms/Button/Button";

export type CTA = { label: string; href: string; ariaLabel?: string };

export type CTARowProps = {
  /** Primary CTA — policy standard on detail: “Request proposal” */
  primary?: CTA;
  /** Back-compat with existing callers that use primaryCta */
  primaryCta?: CTA;

  /** Secondary CTA — policy standard: “Book a call” */
  secondary?: CTA;
  /** Back-compat with existing callers that use secondaryCta */
  secondaryCta?: CTA;

  /** Horizontal alignment for the row (defaults to "start"). */
  align?: "start" | "center" | "end";

  /** Visual density (spacing between CTAs). */
  size?: "sm" | "md";

  /** Optional entity/package title used to build default aria-labels when none provided. */
  entityTitle?: string;

  /** Optional test id for e2e testing. */
  "data-testid"?: string;

  className?: string;
  style?: React.CSSProperties;

  /** Optional analytics hook (adds data-* attributes on the container) */
  analytics?: {
    category?: string;
    action?: string;
    label?: string;
  };
};

/**
 * CTARow — standardized CTA pair using the shared Button atom.
 * - Visuals unchanged (delegated to Button.css)
 * - Adds per-button data-cta="primary|secondary"
 * - Builds default aria-labels when missing (uses entityTitle when provided)
 * - Keeps grid row that never stacks; equal-width columns on tight containers
 */
export default function CTARow({
  primary,
  primaryCta,
  secondary,
  secondaryCta,
  align = "start",
  size = "md",
  entityTitle,
  "data-testid": testId = "cta-row",
  className,
  style,
  analytics,
}: CTARowProps) {
  // Back-compat: prefer explicit props, fall back to *Cta variants
  const primaryFinal = primary ?? primaryCta;
  const secondaryFinal = secondary ?? secondaryCta;

  if (!primaryFinal && !secondaryFinal) return null;

  const alignClass =
    align === "center" ? styles.alignCenter : align === "end" ? styles.alignEnd : styles.alignStart;
  const sizeClass = size === "sm" ? styles.sizeSm : styles.sizeMd;

  const defaultPrimaryAria =
    entityTitle ? `Request proposal for ${entityTitle}` : "Request proposal";
  const defaultSecondaryAria =
    entityTitle ? `Book a call about ${entityTitle}` : "Book a call";

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
      {primaryFinal ? (
        <Button
          href={primaryFinal.href}
          variant="primary"
          ariaLabel={primaryFinal.ariaLabel ?? defaultPrimaryAria}
          data-cta="primary"
          data-testid={`${testId}__primary`}
        >
          {primaryFinal.label}
        </Button>
      ) : null}

      {secondaryFinal ? (
        <Button
          href={secondaryFinal.href}
          variant="secondary"
          ariaLabel={secondaryFinal.ariaLabel ?? defaultSecondaryAria}
          data-cta="secondary"
          data-testid={`${testId}__secondary`}
        >
          {secondaryFinal.label}
        </Button>
      ) : null}
    </div>
  );
}
