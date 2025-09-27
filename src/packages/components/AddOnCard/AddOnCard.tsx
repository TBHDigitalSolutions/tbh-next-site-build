// src/packages/components/AddOnCard/AddOnCard.tsx
"use client";

import * as React from "react";
import styles from "./AddOnCard.module.css";

import AddOnCardFrame from "@/packages/components/AddOnCardFrame";
import { PriceLabel, type Money } from "@/components/ui/molecules/PriceLabel";
import { FeatureList } from "@/components/ui/molecules/FeatureList";

// Atoms
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";

// Centralized CTAs & routes
import { ROUTES, CTA_LABEL } from "@/packages/lib/cta";

export type AddOnCardProps = {
  id?: string;
  service?: string;
  name: string;
  description?: string;

  /** Optional bulleted details (3–6 max; first 5 are displayed) */
  bullets?: string[];

  /** Canonical pricing (Money is preferred); OR use priceLabel fallback */
  price?: Money;
  priceLabel?: string;

  /** Small badge e.g. “Popular” */
  badge?: string;

  /** Routing */
  seoSlug?: string;
  href?: string;

  /** CTA override */
  cta?: { label?: string; href?: string };

  /** Presentation */
  className?: string;
  variant?: "default" | "rail";

  /** Testing hook */
  testId?: string;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AddOnCard({
  id,
  service,
  name,
  description,
  bullets,
  price,
  priceLabel,
  badge,
  seoSlug,
  href,
  cta,
  className,
  variant = "default",
  testId,
}: AddOnCardProps) {
  // Resolve destination & label with centralized policy defaults
  const linkHref = cta?.href ?? href ?? (seoSlug ? ROUTES.package(seoSlug) : undefined);
  const ctaLabel = cta?.label ?? CTA_LABEL.VIEW_DETAILS;

  // Curate up to 5 bullets for compact cards
  const items = (bullets ?? []).slice(0, 5).map((b, i) => ({ id: `b-${i}`, label: b }));

  return (
    <AddOnCardFrame
      className={cx(styles.card, variant === "rail" && styles.cardRail, className)}
      padding="md"
      height="stretch"
      hoverLift
      ariaLabel={`${name} add-on`}
      data-testid={testId}
    >
      <div className={styles.inner}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{name}</h3>
          {badge ? <span className={styles.badge}>{badge}</span> : null}
        </div>

        <Divider />

        {description ? <p className={styles.description}>{description}</p> : null}

        {items.length > 0 && (
          <>
            <Divider />
            <FeatureList items={items} size="sm" />
          </>
        )}

        <Divider />

        <div className={styles.footer}>
          <span className={styles.priceChip}>
            <PriceLabel price={price} fallbackLabel={priceLabel ?? "Contact for pricing"} />
          </span>

          {linkHref && (
            <Button
              href={linkHref}
              variant="primary"
              ariaLabel={`${ctaLabel} — ${name}`}
            >
              {ctaLabel}
            </Button>
          )}
        </div>
      </div>
    </AddOnCardFrame>
  );
}
