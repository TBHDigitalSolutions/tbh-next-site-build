// src/packages/sections/GrowthPackagesSection/GrowthPackagesSection.tsx

"use client";

import * as React from "react";
import Link from "next/link";
import styles from "./GrowthPackagesSection.module.css";
import type { GrowthPackage } from "../../lib/bridge-growth";
import type { ServiceSlug } from "../../lib/registry";

/* ----------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------------- */

export interface GrowthPackagesSectionProps {
  /** Up to 3 recommended packages (extra entries will be ignored). */
  packages: GrowthPackage[];
  /** Optional service category for display/analytics context. */
  category?: ServiceSlug | string;
  /** Title and subtitle copy (defaults provided). */
  title?: string;
  subtitle?: string;
  /** Custom class name / id passthrough. */
  className?: string;
  id?: string;
  /** Show the View All CTA and control its href/label. */
  showViewAllCTA?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Customize the primary CTA label used on each card. */
  primaryCtaLabel?: string;
  /** Optional analytics callbacks. */
  onPackageClick?: (pkg: GrowthPackage, category?: string) => void;
  onViewAllClick?: (category?: string) => void;
}

/* ----------------------------------------------------------------------------
 * Utils
 * ---------------------------------------------------------------------------- */

function formatUSD(v?: number) {
  if (v == null) return "Custom";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
  } catch {
    return `$${v}`;
  }
}

function gtagSafe(event: string, params: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", event, params);
  }
}

/* ----------------------------------------------------------------------------
 * Card
 * ---------------------------------------------------------------------------- */

type CardProps = {
  pkg: GrowthPackage;
  category?: string;
  primaryCtaLabel: string;
  onClick?: (pkg: GrowthPackage, category?: string) => void;
};

function Card({ pkg, category, primaryCtaLabel, onClick }: CardProps) {
  const onCard = React.useCallback(() => {
    gtagSafe("growth_package_card_click", {
      package_id: pkg.id,
      package_slug: pkg.slug,
      source_category: category ?? "unknown",
    });
    onClick?.(pkg, category);
  }, [pkg, category, onClick]);

  const onPrimary = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    gtagSafe("growth_package_primary_click", {
      package_id: pkg.id,
      package_slug: pkg.slug,
      setup_price: pkg.setupPrice,
      monthly_price: pkg.monthlyPrice,
      source_category: category ?? "unknown",
    });
    onClick?.(pkg, category);
  }, [pkg, category, onClick]);

  const onDetails = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    gtagSafe("growth_package_details_click", {
      package_id: pkg.id,
      package_slug: pkg.slug,
      source_category: category ?? "unknown",
    });
  }, [pkg, category]);

  return (
    <article className={styles.card} data-featured={pkg.badge ? "true" : "false"} onClick={onCard} data-package-id={pkg.id}>
      {pkg.badge && <div className={styles.badge} aria-label={`${pkg.badge} package`}>{pkg.badge}</div>}

      <header className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{pkg.title}</h3>
        <p className={styles.cardTagline}>{pkg.tagline}</p>
      </header>

      <div className={styles.pricing}>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>One‑time setup</span>
          <span className={styles.priceValue} aria-label={`Setup cost ${formatUSD(pkg.setupPrice)}`}>{formatUSD(pkg.setupPrice)}</span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>Monthly retainer</span>
          <span className={styles.priceValue} aria-label={`Monthly cost ${formatUSD(pkg.monthlyPrice)}`}>{formatUSD(pkg.monthlyPrice)}</span>
        </div>
      </div>

      <div className={styles.features}>
        <h4 className={styles.featuresTitle}>What's included</h4>
        <ul className={styles.featuresList} role="list">
          {pkg.features.slice(0, 6).map((f, i) => (
            <li key={i} className={styles.featureItem} role="listitem">
              <span className={styles.glyph} aria-hidden="true" />
              <span>{f}</span>
            </li>
          ))}
          {pkg.features.length > 6 && (
            <li className={styles.featureItem} role="listitem">
              <span className={styles.glyph} aria-hidden="true" />
              <span>{pkg.features.length - 6} more feature{pkg.features.length - 6 === 1 ? "" : "s"}</span>
            </li>
          )}
        </ul>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={onPrimary} aria-label={`Get ${pkg.title} package`}>
          {primaryCtaLabel}
        </button>
        <Link href={`/packages/${pkg.slug}`} className={[styles.btn, styles.btnSecondary].join(" ")} onClick={onDetails} aria-label={`View details for ${pkg.title} package`}>
          View details
        </Link>
      </div>
    </article>
  );
}

/* ----------------------------------------------------------------------------
 * Section
 * ---------------------------------------------------------------------------- */

export default function GrowthPackagesSection({
  packages,
  category,
  title = "Recommended Growth Packages",
  subtitle = "Complete solutions curated for your goals.",
  className,
  id,
  showViewAllCTA = true,
  viewAllHref = "/packages",
  viewAllLabel = "View all packages",
  primaryCtaLabel = "Get Package",
  onPackageClick,
  onViewAllClick,
}: GrowthPackagesSectionProps) {
  const list = packages.slice(0, 3);
  if (list.length === 0) return null;

  const onViewAll = React.useCallback(() => {
    gtagSafe("growth_view_all_click", { source_category: String(category ?? "unknown") });
    onViewAllClick?.(String(category ?? "unknown"));
  }, [category, onViewAllClick]);

  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")} aria-labelledby="growth-section-title" data-service-category={category} id={id}>
      <header className={styles.header}>
        <h2 id="growth-section-title" className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {category && <p className={styles.category}>Recommended for {String(category).replace(/-/g, " ")}</p>}
      </header>

      <div className={styles.grid} role="list" aria-label="Recommended packages">
        {list.map((pkg) => (
          <Card key={pkg.id} pkg={pkg} category={String(category ?? "")} primaryCtaLabel={primaryCtaLabel} onClick={onPackageClick} />
        ))}
      </div>

      {showViewAllCTA && (
        <div className={styles.viewAll}>
          <Link href={viewAllHref} className={[styles.btn, styles.btnSecondary, styles.viewAllBtn].join(" ")} onClick={onViewAll}>
            <span>{viewAllLabel}</span>
            <svg className={styles.arrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="9,18 15,12 9,6" /></svg>
          </Link>
          <p className={styles.subtitle}>Explore our complete range of growth solutions</p>
        </div>
      )}

      {/* ItemList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: title,
            description: subtitle,
            numberOfItems: list.length,
            itemListElement: list.map((pkg, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Service",
                name: pkg.title,
                description: pkg.tagline,
                offers: {
                  "@type": "Offer",
                  priceSpecification: [
                    pkg.setupPrice != null ? { "@type": "PriceSpecification", name: "Setup Fee", price: pkg.setupPrice, priceCurrency: "USD" } : undefined,
                    pkg.monthlyPrice != null ? { "@type": "PriceSpecification", name: "Monthly Retainer", price: pkg.monthlyPrice, priceCurrency: "USD", billingIncrement: "Month" } : undefined,
                  ].filter(Boolean),
                },
                url: `/packages/${pkg.slug}`,
              },
            })),
          }),
        }}
      />
    </section>
  );
}

export type { GrowthPackage };
export type { GrowthPackagesSectionProps };