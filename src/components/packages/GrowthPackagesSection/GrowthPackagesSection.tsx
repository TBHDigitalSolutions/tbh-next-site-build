// src/components/packages/GrowthPackagesSection/GrowthPackagesSection.tsx
"use client";

import React, { useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/atoms/Button/Button';
import type { Package } from '@/data/packages/recommendations';
import styles from './GrowthPackagesSection.module.css';

/**
 * Props interface for the GrowthPackagesSection component
 */
interface GrowthPackagesSectionProps {
  /** Array of packages to display (should be exactly 3) */
  packages: Package[];
  /** Current category for analytics tracking */
  category?: string;
  /** Section title override */
  title?: string;
  /** Section subtitle override */
  subtitle?: string;
  /** Custom CSS class name */
  className?: string;
  /** Show "View all packages" CTA */
  showViewAllCTA?: boolean;
  /** Custom package click handler for analytics */
  onPackageClick?: (pkg: Package, category?: string) => void;
}

/**
 * Props for individual package card component
 */
interface GrowthPackageCardProps {
  package: Package;
  category?: string;
  onPackageClick?: (pkg: Package, category?: string) => void;
}

/**
 * Utility function to format prices consistently
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Individual package card component
 */
const GrowthPackageCard: React.FC<GrowthPackageCardProps> = ({
  package: pkg,
  category,
  onPackageClick,
}) => {
  const handleCardClick = useCallback(() => {
    onPackageClick?.(pkg, category);
  }, [pkg, category, onPackageClick]);

  const handleGetPackageClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'portfolio_package_click', {
        event_category: 'Package Interaction',
        event_label: `get_package:${pkg.id}`,
        package_id: pkg.id,
        package_title: pkg.title,
        category: category || 'unknown',
        setup_price: pkg.setupPrice,
        monthly_price: pkg.monthlyPrice
      });
    }
    
    onPackageClick?.(pkg, category);
  }, [pkg, category, onPackageClick]);

  const handleDetailsClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    // Analytics tracking for details view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'package_details_click', {
        event_category: 'Package Interaction',
        event_label: `view_details:${pkg.id}`,
        package_id: pkg.id,
        category: category || 'unknown'
      });
    }
  }, [pkg, category]);

  return (
    <article
      className={`${styles.packageCard} ${pkg.badge ? styles.featured : ''}`}
      onClick={handleCardClick}
      data-package-id={pkg.id}
    >
      {/* Badge */}
      {pkg.badge && (
        <div className={styles.badge} aria-label={`${pkg.badge} package`}>
          {pkg.badge}
        </div>
      )}

      {/* Header */}
      <header className={styles.cardHeader}>
        <h3 className={styles.packageTitle}>{pkg.title}</h3>
        <p className={styles.packageTagline}>{pkg.tagline}</p>
      </header>

      {/* Pricing */}
      <div className={styles.pricing}>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>One-time setup</span>
          <span className={styles.priceValue} aria-label={`Setup cost ${formatPrice(pkg.setupPrice)}`}>
            {formatPrice(pkg.setupPrice)}
          </span>
        </div>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>Monthly retainer</span>
          <span className={styles.priceValue} aria-label={`Monthly cost ${formatPrice(pkg.monthlyPrice)}`}>
            {formatPrice(pkg.monthlyPrice)}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className={styles.features}>
        <h4 className={styles.featuresTitle}>What's included:</h4>
        <ul className={styles.featuresList} role="list">
          {pkg.features.slice(0, 6).map((feature, index) => (
            <li key={index} className={styles.featureItem} role="listitem">
              <span className={styles.checkIcon} aria-hidden="true">✓</span>
              <span className={styles.featureText}>{feature}</span>
            </li>
          ))}
          {pkg.features.length > 6 && (
            <li className={styles.featureItem}>
              <span className={styles.checkIcon} aria-hidden="true">+</span>
              <span className={styles.featureText}>
                {pkg.features.length - 6} more features
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Actions */}
      <footer className={styles.cardActions}>
        <Button
          onClick={handleGetPackageClick}
          size="md"
          variant="primary"
          className={styles.primaryButton}
          aria-label={`Get ${pkg.title} package`}
        >
          Get Package
        </Button>
        <Link
          href={`/packages/${pkg.slug}`}
          className={styles.detailsLink}
          onClick={handleDetailsClick}
          aria-label={`View details for ${pkg.title} package`}
        >
          View details
        </Link>
      </footer>
    </article>
  );
};

/**
 * Main GrowthPackagesSection component
 */
export const GrowthPackagesSection: React.FC<GrowthPackagesSectionProps> = ({
  packages,
  category,
  title = "Recommended Growth Packages",
  subtitle = "Complete solutions curated for your business needs and goals.",
  className = "",
  showViewAllCTA = true,
  onPackageClick,
}) => {
  // Ensure we have exactly 3 packages for consistent layout
  const displayPackages = packages.slice(0, 3);

  // Analytics for view all packages click
  const handleViewAllClick = useCallback(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_all_packages_click', {
        event_category: 'Package Navigation',
        event_label: 'view_all_from_portfolio',
        source_category: category || 'unknown',
        source_page: 'portfolio_category'
      });
    }
  }, [category]);

  // Don't render if no packages available
  if (displayPackages.length === 0) {
    return null;
  }

  return (
    <section
      className={`${styles.growthPackagesSection} ${className}`}
      aria-labelledby="growth-packages-title"
      data-testid="growth-packages-section"
    >
      {/* Header */}
      <header className={styles.sectionHeader}>
        <h2 id="growth-packages-title" className={styles.sectionTitle}>
          {title}
        </h2>
        {subtitle && (
          <p className={styles.sectionSubtitle}>{subtitle}</p>
        )}
        {category && (
          <p className={styles.categoryContext}>
            Recommended for {category.replace('-', ' ')} projects
          </p>
        )}
      </header>

      {/* Packages Grid */}
      <div
        className={styles.packagesGrid}
        role="list"
        aria-label="Recommended packages"
      >
        {displayPackages.map((pkg) => (
          <GrowthPackageCard
            key={pkg.id}
            package={pkg}
            category={category}
            onPackageClick={onPackageClick}
          />
        ))}
      </div>

      {/* View All CTA */}
      {showViewAllCTA && (
        <footer className={styles.viewAllCTA}>
          <Button
            asChild
            size="lg"
            variant="outline"
            className={styles.viewAllButton}
          >
            <Link href="/packages" onClick={handleViewAllClick}>
              <span>View all packages</span>
              <svg 
                className={styles.arrowIcon} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </Link>
          </Button>
          
          <p className={styles.ctaSubtext}>
            Explore our complete range of growth solutions
          </p>
        </footer>
      )}

      {/* Schema.org structured data for packages */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": title,
            "description": subtitle,
            "numberOfItems": displayPackages.length,
            "itemListElement": displayPackages.map((pkg, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Service",
                "name": pkg.title,
                "description": pkg.tagline,
                "offers": {
                  "@type": "Offer",
                  "priceSpecification": [
                    {
                      "@type": "PriceSpecification",
                      "name": "Setup Fee",
                      "price": pkg.setupPrice,
                      "priceCurrency": "USD"
                    },
                    {
                      "@type": "PriceSpecification", 
                      "name": "Monthly Retainer",
                      "price": pkg.monthlyPrice,
                      "priceCurrency": "USD",
                      "billingIncrement": "Month"
                    }
                  ]
                },
                "url": `/packages/${pkg.slug}`
              }
            }))
          })
        }}
      />
    </section>
  );
};

// Export types for external use
export type { GrowthPackagesSectionProps, GrowthPackageCardProps };

export default GrowthPackagesSection;