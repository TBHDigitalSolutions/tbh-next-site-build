import * as React from "react";
import Link from "next/link";
import styles from "./AddOnCard.module.css";

export type AddOnCardProps = {
  id: string;
  title: string;
  description?: string;
  bullets?: string[];
  /** "$X,XXX one-time" | "$X,XXX/mo" | "from $X,XXX" | "Contact for pricing" */
  priceLabel: string;
  /** e.g., "Popular" */
  badge?: string;
  /** Optional deep link to learn more or to anchor on a service page */
  href?: string;
  /** Max bullets to render (default 4) */
  maxBullets?: number;
  /** Optional aria-label override for the link/card */
  ariaLabel?: string;
  /** data attribute to tag analytics (e.g., 'addon-card') */
  "data-track"?: string;
  /** data attribute for analytics metadata (e.g., addon id) */
  "data-id"?: string;
};

export const AddOnCard: React.FC<AddOnCardProps> = ({
  id,
  title,
  description,
  bullets,
  priceLabel,
  badge,
  href,
  maxBullets = 4,
  ariaLabel,
  "data-track": dataTrack,
  "data-id": dataId,
}) => {
  const bulletItems = (bullets ?? []).filter(Boolean).slice(0, maxBullets);

  const CardContent = (
    <div className={styles.inner}>
      <div className={styles.headerRow}>
        <h3 className={styles.title}>{title}</h3>
        {badge ? <span className={styles.badge} aria-label={badge}>{badge}</span> : null}
      </div>

      {description ? <p className={styles.description}>{description}</p> : null}

      {bulletItems.length > 0 ? (
        <>
          <hr className={styles.divider} />
          <ul className={styles.bullets} aria-label="Key highlights">
            {bulletItems.map((b, i) => (
              <li key={`${id}-b-${i}`}>{b}</li>
            ))}
          </ul>
        </>
      ) : null}

      <div className={styles.footer}>
        <span className={styles.priceChip} aria-label="Price">
          {priceLabel}
        </span>

        {href ? (
          <span className={styles.cta} aria-hidden>
            Learn more <span className={styles.arrow}>→</span>
          </span>
        ) : null}
      </div>
    </div>
  );

  // If href is provided, make the whole card clickable via an overlay link
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    href ? (
      <div
        className={`${styles.card} ${styles.clickable}`}
        data-track={dataTrack ?? "addon-card"}
        data-id={dataId ?? id}
      >
        <Link
          href={href}
          aria-label={ariaLabel ?? `${title} – learn more`}
          className={styles.linkOverlay}
        />
        {children}
      </div>
    ) : (
      <article
        className={styles.card}
        aria-labelledby={`${id}__title`}
        data-track={dataTrack ?? "addon-card"}
        data-id={dataId ?? id}
      >
        {children}
      </article>
    );

  return (
    <Wrapper>
      {/* Provide the heading id when not using the link wrapper for a11y label */}
      {!href ? <span id={`${id}__title`} hidden>{title}</span> : null}
      {CardContent}
    </Wrapper>
  );
};

export default AddOnCard;
