// src/components/sections/section-layouts/PackageCarousel/PackageCarousel.tsx
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";
import PackageCard, { PackageCardProps } from "./PackageCard";
import styles from "./PackageCarousel.module.css";
import { SERVICE_LABELS } from "./helpers";
import { adaptFeaturedCardsToPackageCards, isFeaturedCardArray } from "./adapters/featuredDataAdapter";
import type { FeaturedCard } from "./adapters/featuredDataAdapter";

type PackageCarouselItem = Omit<PackageCardProps, "className">;

export interface PackageCarouselProps {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Package items to display */
  items?: PackageCarouselItem[];
  /** Alternative: Pass FeaturedCard data directly */
  featuredData?: FeaturedCard[];
  /** Layout variant */
  layout?: "carousel" | "grid";
  /** Service slug for generating footer links */
  serviceSlug: PackageCardProps["service"];
  /** Additional CSS class */
  className?: string;
  /** Custom "View All" link URL */
  viewAllHref?: string;
  /** Custom "Add-ons" link URL */
  addonsHref?: string;
  /** Whether to show footer action buttons */
  showFooterActions?: boolean;
  /** Force exactly 3 cards (defaults to true) */
  enforceThreeCards?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Test ID for testing */
  testId?: string;
  /** Optional error state */
  error?: string | null;
  /** Callback when retry is clicked (in error state) */
  onRetry?: () => void;
}

export default function PackageCarousel({
  title,
  subtitle,
  items = [],
  featuredData,
  layout = "carousel",
  serviceSlug,
  className,
  viewAllHref,
  addonsHref,
  showFooterActions = true,
  enforceThreeCards = true,
  isLoading = false,
  testId,
  error,
  onRetry,
}: PackageCarouselProps) {
  // Handle error state
  if (error) {
    return (
      <section 
        className={`${styles.packageCarousel} ${className || ""}`}
        data-testid={testId}
        aria-labelledby={title ? `${testId}-title` : undefined}
      >
        {(title || subtitle) && (
          <header className={styles.carouselHeader}>
            {title && (
              <h2 id={`${testId}-title`} className={styles.carouselTitle}>
                {title}
              </h2>
            )}
            {subtitle && <p className={styles.carouselSubtitle}>{subtitle}</p>}
            <Divider />
          </header>
        )}
        
        <div className={styles.errorState} role="alert">
          <h3 className={styles.errorTitle}>Unable to Load Packages</h3>
          <p className={styles.errorMessage}>{error}</p>
          {onRetry && (
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onRetry}
              className={styles.errorAction}
            >
              Try Again
            </Button>
          )}
        </div>
      </section>
    );
  }

  // Determine data source and normalize
  let cardItems: PackageCarouselItem[] = [];
  
  if (featuredData && isFeaturedCardArray(featuredData)) {
    // Use featured data if provided
    cardItems = adaptFeaturedCardsToPackageCards(featuredData);
  } else if (items.length > 0) {
    // Use items if provided
    cardItems = items;
  }

  // Enforce exactly 3 cards if enabled
  if (enforceThreeCards) {
    cardItems = cardItems.slice(0, 3);
  }

  // Don't render if no items and not loading
  if (!cardItems.length && !isLoading) {
    return null;
  }

  const serviceLabel = SERVICE_LABELS[serviceSlug] ?? "Packages";
  const defaultViewAllHref = viewAllHref || `/services/${serviceSlug}/packages`;
  const defaultAddonsHref = addonsHref || `/services/${serviceSlug}/packages#addons`;

  // Generate loading placeholder items if needed
  const displayItems = isLoading && !cardItems.length 
    ? Array.from({ length: 3 }, (_, i) => ({
        id: `loading-${i}`,
        service: serviceSlug,
        name: "Loading...",
        tier: "Essential" as const,
        href: "#",
        isLoading: true,
      }))
    : cardItems;

  return (
    <section 
      className={`${styles.packageCarousel} ${isLoading ? styles.loading : ""} ${className || ""}`}
      data-testid={testId}
      aria-labelledby={title ? `${testId}-title` : undefined}
      aria-busy={isLoading}
    >
      {(title || subtitle) && (
        <header className={styles.carouselHeader}>
          {title && (
            <h2 id={`${testId}-title`} className={styles.carouselTitle}>
              {title}
            </h2>
          )}
          {subtitle && <p className={styles.carouselSubtitle}>{subtitle}</p>}
          <Divider />
        </header>
      )}

      <div className={`${styles.carouselContainer} ${styles[layout]}`}>
        <div className={styles.carouselWrapper}>
          <div
            className={`${styles.carouselTrack} ${styles[`${layout}Track`]} ${layout === "carousel" ? styles.threeUp : ""}`}
            role={layout === "carousel" ? "region" : undefined}
            aria-label={layout === "carousel" ? `${serviceLabel} packages carousel` : undefined}
          >
            {displayItems.map((item, index) => (
              <PackageCard
                key={item.id}
                {...item}
                className={`${styles.carouselCard} ${styles[`${layout}Card`]}`}
                testId={`${testId}-card-${index}`}
                isLoading={isLoading || item.isLoading}
              />
            ))}
          </div>
        </div>
      </div>

      {showFooterActions && !isLoading && (
        <footer className={styles.carouselFooter}>
          <Divider />
          <div className={styles.footerActions}>
            <Button 
              href={defaultViewAllHref} 
              variant="secondary" 
              size="sm" 
              className={styles.footerButton}
              data-testid={`${testId}-view-all`}
            >
              View all {serviceLabel} packages
            </Button>
            <Button 
              href={defaultAddonsHref} 
              variant="secondary" 
              size="sm" 
              className={styles.footerButton}
              data-testid={`${testId}-view-addons`}
            >
              View add-ons
            </Button>
          </div>
        </footer>
      )}

      {/* Loading state announcement for screen readers */}
      {isLoading && (
        <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
          Loading {serviceLabel} packages...
        </div>
      )}
    </section>
  );
}