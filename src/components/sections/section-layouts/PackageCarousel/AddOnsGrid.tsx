"use client";

import React from "react";
import styles from "./PackageCarousel.module.css";

export interface AddOnItem {
  id: string;
  name: string;
  description?: string;
  startingAt?: string | number;
  href?: string;
  category?: string;
  popular?: boolean;
}

export interface AddOnsGridProps {
  /** Array of add-on items */
  items?: AddOnItem[];
  /** Grid title */
  title?: string;
  /** Grid subtitle */
  subtitle?: string;
  /** Additional CSS class */
  className?: string;
  /** Test ID for testing */
  testId?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

function formatStartingPrice(price?: string | number): string {
  if (!price) return "";
  
  if (typeof price === "string") {
    return price.startsWith("$") ? price : `$${price}`;
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function AddOnsGrid({ 
  items = [], 
  title = "Add-On Services",
  subtitle = "Enhance your package with targeted capabilities",
  className,
  testId = "addons-grid",
  isLoading = false,
  emptyMessage = "No add-ons available at this time."
}: AddOnsGridProps) {
  
  // Don't render if no items and not loading
  if (!items.length && !isLoading) {
    return null;
  }

  // Generate loading placeholder items if needed
  const displayItems = isLoading && !items.length 
    ? Array.from({ length: 3 }, (_, i) => ({
        id: `loading-${i}`,
        name: "Loading...",
        description: "Loading add-on information...",
        startingAt: "TBD",
      }))
    : items;

  return (
    <section 
      className={`${styles.addonsSection} ${className || ""}`} 
      aria-labelledby={`${testId}-heading`}
      data-testid={testId}
      aria-busy={isLoading}
    >
      <header className={styles.addonsHeader}>
        <h3 id={`${testId}-heading`} className={styles.addonsTitle}>
          {title}
        </h3>
        <p className={styles.addonsSubtitle}>{subtitle}</p>
      </header>

      {displayItems.length > 0 ? (
        <div 
          className={styles.addonsGrid}
          role="region"
          aria-label="Available add-on services"
        >
          {displayItems.map((addon, index) => (
            <article 
              key={addon.id} 
              className={styles.addonCard}
              data-testid={`${testId}-item-${index}`}
              data-popular={addon.popular}
            >
              <h4 className={styles.addonTitle}>
                {addon.name}
                {addon.popular && (
                  <span className={styles.popularBadge} aria-label="Popular add-on">
                    Popular
                  </span>
                )}
              </h4>
              
              {addon.description && (
                <p className={styles.addonDesc}>{addon.description}</p>
              )}
              
              <div className={styles.addonFooter}>
                {addon.startingAt && (
                  <span className={styles.addonPrice} aria-label="Starting price">
                    From {formatStartingPrice(addon.startingAt)}
                  </span>
                )}
                
                {addon.href && !isLoading && (
                  <a 
                    className={styles.addonLink} 
                    href={addon.href} 
                    aria-label={`Learn more about ${addon.name}`}
                    data-testid={`${testId}-link-${index}`}
                  >
                    Learn more →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState} role="status">
          <p>{emptyMessage}</p>
        </div>
      )}

      {/* Loading state announcement for screen readers */}
      {isLoading && (
        <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
          Loading add-on services...
        </div>
      )}
    </section>
  );
}