// src/packages/components/AddOnCard/AddOnCard.tsx
import * as React from "react";
import Link from "next/link";

import AddOnCardFrame from "@/packages/components/AddOnCardFrame";
import styles from "./AddOnCard.module.css";

import PriceLabel, { type Money } from "@/components/ui/molecules/PriceLabel";
import { FeatureList } from "@/components/ui/molecules/FeatureList";

export type AddOnCardProps = {
  id: string;
  title: string;
  description?: string;
  bullets?: string[];

  /** Either pass Money or a ready-made label; Money takes precedence. */
  price?: Money;
  priceLabel?: string;

  /** e.g., "Popular" */
  badge?: string;

  /** Deep link to detail */
  href?: string;

  /** Max bullets to render (default 4) */
  maxBullets?: number;

  /** a11y/analytics */
  ariaLabel?: string;
  "data-track"?: string;
  "data-id"?: string;
};

const toFeatureItems = (bullets?: string[]) =>
  (bullets ?? []).filter(Boolean).map((b, i) => ({ id: `fe-${i}`, label: b as string }));

export const AddOnCard: React.FC<AddOnCardProps> = ({
  id,
  title,
  description,
  bullets,
  price,
  priceLabel,
  badge,
  href,
  maxBullets = 4,
  ariaLabel,
  "data-track": dataTrack,
  "data-id": dataId,
}) => {
  const featureItems = toFeatureItems(bullets).slice(0, maxBullets);

  return (
    <AddOnCardFrame
      href={href}
      ariaLabel={ariaLabel ?? (href ? `${title} – learn more` : undefined)}
      data-track={dataTrack ?? "addon-card"}
      data-id={dataId ?? id}
      padding="md"
      height="stretch"
      hoverLift
    >
      <div className={styles.inner}>
        <div className={styles.headerRow}>
          <h3 className={styles.title}>{title}</h3>
          {badge ? <span className={styles.badge} aria-label={badge}>{badge}</span> : null}
        </div>

        {description ? <p className={styles.description}>{description}</p> : null}

        {featureItems.length > 0 && (
          <>
            <hr className={styles.divider} />
            <div aria-label="Key highlights">
              <FeatureList items={featureItems} size="sm" />
            </div>
          </>
        )}

        <div className={styles.footer}>
          <span className={styles.priceChip} aria-label="Price">
            {price ? <PriceLabel price={price} /> : (priceLabel ?? "Contact for pricing")}
          </span>

          {href ? (
            <Link className={styles.cta} href={href} aria-label={`${title} – learn more`}>
              Learn more <span className={styles.arrow}>→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </AddOnCardFrame>
  );
};

export default AddOnCard;
