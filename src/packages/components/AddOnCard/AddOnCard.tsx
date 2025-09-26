"use client";

import * as React from "react";
import Link from "next/link";
import styles from "./AddOnCard.module.css";

import AddOnCardFrame from "@/packages/components/AddOnCardFrame";
import PriceLabel, { type Money } from "@/components/ui/molecules/PriceLabel";

export type AddOnCardProps = {
  id?: string;
  service?: string;
  name: string;
  description?: string;
  /** Optional bulleted details (3–6 max) */
  bullets?: string[];
  /** Pricing */
  price?: Money;
  priceLabel?: string; // fallback label (e.g., "Contact for pricing")
  /** Small badge e.g. “Popular” */
  badge?: string;
  /** Routing */
  seoSlug?: string;
  href?: string;
  /** CTA override */
  cta?: { label: string; href?: string };
  /** Presentation */
  className?: string;
  variant?: "default" | "rail";
};

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
}: AddOnCardProps) {
  const linkHref = cta?.href ?? href ?? (seoSlug ? `/packages/${seoSlug}` : undefined);
  const clickable = Boolean(linkHref);

  return (
    <AddOnCardFrame
      className={[styles.card, clickable ? styles.clickable : "", className].filter(Boolean).join(" ")}
      padding="md"
      height="stretch"
      hoverLift
      ariaLabel={`${name} add-on`}
    >
      {clickable && <Link className={styles.linkOverlay} href={linkHref!} aria-label={`${name} details`} />}

      <div className={styles.inner}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{name}</h3>
          {badge ? <span className={styles.badge}>{badge}</span> : null}
        </div>

        {description ? <p className={styles.description}>{description}</p> : null}

        {(bullets?.length ?? 0) > 0 && (
          <>
            <hr className={styles.divider} />
            <ul className={styles.bullets}>
              {bullets!.map((b, i) => (
                <li key={`b-${i}`}>{b}</li>
              ))}
            </ul>
          </>
        )}

        <div className={styles.footer}>
          <span className={styles.priceChip}>
            <PriceLabel price={price} fallbackLabel={priceLabel ?? "Contact for pricing"} />
          </span>

          {clickable && (
            <Link className={styles.cta} href={linkHref!}>
              {cta?.label ?? "Learn more"}
              <span className={styles.arrow} aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </AddOnCardFrame>
  );
}
