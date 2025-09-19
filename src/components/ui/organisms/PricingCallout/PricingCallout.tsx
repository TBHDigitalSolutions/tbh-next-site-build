// src/components/ui/organisms/PricingCallout/PricingCallout.tsx
"use client";

import React from "react";
import clsx from "clsx";
import Button from "@/components/ui/atoms/Button/Button";
import styles from "./PricingCallout.module.css";

export type PricingCalloutVariant = "included" | "addon" | "custom";

export interface PricingCalloutCta {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "outline";
  target?: "_self" | "_blank";
}

export interface PricingCalloutProps {
  /** Visual and semantic variant */
  variant: PricingCalloutVariant;
  /** Custom label text (auto-generated if not provided) */
  label?: string;
  /** Price amount for addon variant */
  amount?: number | string;
  /** Additional context or bundling info */
  note?: string;
  /** Optional CTA button */
  cta?: PricingCalloutCta;
  /** Optional wrapper className */
  className?: string;
  /** Optional test id */
  "data-testid"?: string;
}

/**
 * PricingCallout - Lightweight pricing display for Level 3 (SubService) pages
 * 
 * Replaces heavy tier tables with simple callouts:
 * - "Included in [package]" 
 * - "Add-on: +$[amount]"
 * - "Custom quote required"
 */
export default function PricingCallout({
  variant,
  label,
  amount,
  note,
  cta,
  className,
  "data-testid": testId = "pricing-callout",
}: PricingCalloutProps) {
  
  const getVariantContent = () => {
    switch (variant) {
      case "included":
        return {
          icon: "✓",
          text: label || "Included in package",
          colorClass: "included",
          ariaLabel: "This service is included",
        };
      case "addon":
        return {
          icon: "+",
          text: label || `Add-on: ${amount ? formatAmount(amount) : "Custom pricing"}`,
          colorClass: "addon",
          ariaLabel: `Add-on service: ${amount ? formatAmount(amount) : "custom pricing"}`,
        };
      case "custom":
        return {
          icon: "💬",
          text: label || "Custom quote required",
          colorClass: "custom",
          ariaLabel: "Custom pricing - contact for quote",
        };
    }
  };

  const content = getVariantContent();

  return (
    <div 
      className={clsx(styles.pricingCallout, styles[content.colorClass], className)}
      role="region"
      aria-label={content.ariaLabel}
      data-testid={testId}
    >
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          {content.icon}
        </span>
        <div className={styles.text}>
          <span className={styles.label}>{content.text}</span>
          {note && (
            <span className={styles.note} data-testid="pricing-note">
              {note}
            </span>
          )}
        </div>
      </div>
      
      {cta && (
        <div className={styles.ctaWrapper}>
          <Button
            href={cta.href}
            variant={cta.variant || "primary"}
            size="sm"
            target={cta.target}
            className={styles.cta}
            data-testid="pricing-cta"
          >
            {cta.label}
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper to format price amounts consistently
function formatAmount(amount: number | string): string {
  if (typeof amount === "string") return amount;
  if (typeof amount === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return String(amount);
}

// Export types for external usage
export type { PricingCalloutVariant, PricingCalloutCta, PricingCalloutProps };