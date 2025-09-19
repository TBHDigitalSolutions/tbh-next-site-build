"use client";

import React from "react";
import styles from "./PackageCarousel.module.css";

export interface PackageComparisonCardProps {
  id: string;
  tier: string;
  name: string;
  popular?: boolean;
  price?: { setup?: number; monthly?: number } | null;
  highlights: string[];
  href: string;
  ctaLabel?: string;
  className?: string;
  testId?: string;
  isLoading?: boolean;
  description?: string;
}

function formatPrice(n?: number | null): string | null {
  if (n == null || n <= 0) return null;
  return new Intl.NumberFormat("en-US", { 
    style: "currency", 
    currency: "USD", 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PackageComparisonCard({
  id,
  tier,
  name,
  popular = false,
  price,
  highlights,
  href,
  ctaLabel = "Select Package",
  className,
  testId,
  isLoading = false,
  description,
}: PackageComparisonCardProps) {
  
  const setupPrice = formatPrice(price?.setup);
  const monthlyPrice = formatPrice(price?.monthly);
  
  // Display price logic: prefer setup, fallback to monthly, then "Contact us"
  const displayPrice = setupPrice || monthlyPrice || "Contact us";
  
  const cardClasses = [
    styles.compCard,
    popular && styles.popular,
    isLoading && styles.loading,
    className
  ].filter(Boolean).join(" ");

  return (
    <article 
      className={cardClasses}
      data-popular={popular ? "true" : "false"}
      data-testid={testId}
      data-tier={tier.toLowerCase()}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
    >
      <header className={styles.compHeader}>
        <span className={styles.compTier}>{tier}</span>
        <h3 id={`${id}-title`} className={styles.compTitle}>
          {name}
        </h3>
        {popular && (
          <span className={styles.compBadge} aria-label="Most popular package">
            Most Popular
          </span>
        )}
      </header>

      <div className={styles.compPrice}>
        <span className={styles.compPriceValue} aria-label="Package price">
          {isLoading ? "Loading..." : displayPrice}
        </span>
        {setupPrice && monthlyPrice && (
          <span className={styles.compPriceNote}>
            + {monthlyPrice}/month
          </span>
        )}
      </div>

      {description && (
        <div className={styles.compDescription}>
          <p id={`${id}-description`}>{description}</p>
        </div>
      )}

      <section className={styles.compBody}>
        <h4 className={styles.compBodyTitle}>What's Included</h4>
        {highlights.length > 0 ? (
          <ul className={styles.compList} aria-label="Package features">
            {highlights.map((highlight, index) => (
              <li key={index}>✓ {highlight}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.compEmptyFeatures}>
            Feature details coming soon
          </p>
        )}
      </section>

      <footer className={styles.compFooter}>
        <a 
          href={href} 
          className={styles.compCta}
          aria-label={`${name} — ${ctaLabel.toLowerCase()}`}
          data-testid={`${testId}-cta`}
          tabIndex={isLoading ? -1 : 0}
        >
          {isLoading ? "Loading..." : ctaLabel}
        </a>
      </footer>
    </article>
  );
}