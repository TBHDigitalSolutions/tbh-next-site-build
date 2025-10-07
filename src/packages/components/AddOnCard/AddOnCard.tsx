// src/packages/components/AddOnCard/AddOnCard.tsx
"use client";

/**
 * AddOnCard — presentation-only add-on card.
 *
 * Pricing:
 *  - Accepts canonical `price: Money` (SSOT) or a `priceLabel` fallback string.
 *  - Currency formatting is delegated to the shared <PriceLabel /> atom,
 *    which should internally use helpers from @/packages/lib/pricing.
 *
 * Lib boundaries:
 *  - `Money` comes from @/packages/lib/types (canonical).
 *  - No local pricing predicates/formatters here.
 *
 * Accessibility:
 *  - Card gets an aria-label derived from the add-on name.
 *  - CTA includes the add-on name in its aria label.
 */

import * as React from "react";
import styles from "./AddOnCard.module.css";

import AddOnCardFrame from "@/packages/components/AddOnCardFrame";
import { PriceLabel } from "@/components/ui/molecules/PriceLabel";
import { FeatureList } from "@/components/ui/molecules/FeatureList";

// Atoms
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";

// Centralized CTAs & routes
import { ROUTES, CTA_LABEL } from "@/packages/lib/cta";

// Canonical pricing type
import type { Money } from "@/packages/lib/types";

export type AddOnCardProps = {
  id?: string;
  service?: string;
  name: string;
  description?: string;

  /** Optional bulleted details (3–6 max; first 5 are displayed) */
  bullets?: string[];

  /** Canonical pricing (preferred) */
  price?: Money;

  /** Fallback label if price is not provided */
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

const DEFAULT_PRICE_FALLBACK = "Contact for pricing";

function AddOnCardImpl({
  id,
  service, // reserved for future categorization; not rendered directly
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
  // Resolve destination & label using centralized policy defaults
  const linkHref =
    cta?.href ?? href ?? (seoSlug ? ROUTES.package(seoSlug) : undefined);
  const ctaLabel = cta?.label ?? CTA_LABEL.VIEW_DETAILS;

  // Curate up to 5 bullets for compact cards
  const items = React.useMemo(
    () => (bullets ?? []).slice(0, 5).map((b, i) => ({ id: `b-${i}`, label: b })),
    [bullets]
  );

  // Accessible label for the overall card
  const ariaLabel = `${name} add-on`;

  return (
    <AddOnCardFrame
      className={cx(styles.card, variant === "rail" && styles.cardRail, className)}
      padding="md"
      height="stretch"
      hoverLift
      ariaLabel={ariaLabel}
      data-testid={testId}
      data-id={id}
      role="article"
    >
      <div className={styles.inner}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{name}</h3>
          {badge ? <span className={styles.badge}>{badge}</span> : null}
        </div>

        <Divider />

        {description ? (
          <p className={styles.description}>{description}</p>
        ) : null}

        {items.length > 0 && (
          <>
            <Divider />
            <FeatureList items={items} size="sm" />
          </>
        )}

        <Divider />

        <div className={styles.footer}>
          <span className={styles.priceChip}>
            <PriceLabel
              price={price}
              fallbackLabel={priceLabel ?? DEFAULT_PRICE_FALLBACK}
            />
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

const AddOnCard = React.memo(AddOnCardImpl);
AddOnCard.displayName = "AddOnCard";

export default AddOnCard;
export { cx, DEFAULT_PRICE_FALLBACK };
