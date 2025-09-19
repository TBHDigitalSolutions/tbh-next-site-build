// src/components/sections/section-layouts/PackageCarousel/PackageCard.tsx
import Link from "next/link";
import Button from "@/components/ui/atoms/Button/Button";
import styles from "./PackageCard.module.css";

type PackagePrice = { setup?: number; monthly?: number };
type ServiceSlug = "webdev" | "seo" | "marketing" | "leadgen" | "content" | "video";

export interface PackageCardProps {
  id: string;
  service: ServiceSlug;
  name: string;
  summary?: string;
  tier: "Essential" | "Professional" | "Enterprise";
  popular?: boolean;
  href: string;
  image?: { src: string; alt?: string } | null;
  price?: PackagePrice;
  ctaLabel?: string;
  className?: string;
  /** Enhanced value proposition props */
  highlights?: string[];      // Key features/benefits (3-4 items)
  startingAt?: number;        // Starting price for clear value display
  badge?: string;             // Custom badge text (e.g., "Most Popular", "Best ROI")
  savingsPct?: number;        // Optional savings percentage
  /** Optional loading state */
  isLoading?: boolean;
  /** Optional test ID for testing */
  testId?: string;
}

const SERVICE_ICONS: Record<ServiceSlug, string> = {
  webdev: "🌐",
  seo: "🔍", 
  marketing: "📈",
  leadgen: "🎯",
  content: "✏️",
  video: "🎬",
};

const SERVICE_NAMES: Record<ServiceSlug, string> = {
  webdev: "Web Development",
  seo: "SEO Services", 
  marketing: "Marketing",
  leadgen: "Lead Generation",
  content: "Content Production",
  video: "Video Production",
};

function formatMoney(n?: number): string | null {
  if (!n || n <= 0) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PackageCard({
  id,
  service,
  name,
  summary,
  tier,
  popular = false,
  href,
  image,
  price,
  ctaLabel = "View Details",
  className,
  highlights = [],
  startingAt,
  badge,
  savingsPct,
  isLoading = false,
  testId,
}: PackageCardProps) {
  const serviceIcon = SERVICE_ICONS[service];
  const serviceName = SERVICE_NAMES[service];

  // Determine badge display - prioritize custom badge, then popular, then tier
  const displayBadge = badge || (popular ? "Most Popular" : tier);
  const badgeVariant = badge 
    ? "custom" 
    : popular 
    ? "popular" 
    : "tier";

  const setupStr = formatMoney(price?.setup);
  const monthlyStr = formatMoney(price?.monthly);
  const startingPrice = formatMoney(startingAt);

  const cardClasses = [
    styles.packageCard,
    styles.carouselLayout,
    styles.threeUp,
    isLoading && styles.loading,
    className
  ].filter(Boolean).join(" ");

  return (
    <article 
      className={cardClasses}
      data-testid={testId}
      data-service={service}
      data-tier={tier.toLowerCase()}
      data-popular={popular}
    >
      <Link href={href} className={styles.cardLink} aria-describedby={`${id}-summary`}>
        {/* Media */}
        <div className={styles.mediaArea}>
          {image?.src ? (
            <img 
              src={image.src} 
              alt={image.alt || `${name} package preview`} 
              className={styles.cardImage} 
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className={styles.iconFallback} aria-hidden="true">
              <span className={styles.serviceIcon} role="img" aria-label={serviceName}>
                {serviceIcon}
              </span>
            </div>
          )}
          <div className={`${styles.badge} ${styles[badgeVariant]}`}>
            {displayBadge}
          </div>
        </div>

        {/* Content */}
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{name}</h3>

          {summary && (
            <p id={`${id}-summary`} className={styles.cardSummary}>
              {summary}
            </p>
          )}

          {/* Value indicators */}
          <div className={styles.valueSection}>
            {/* Starting price display */}
            {startingPrice && (
              <div className={styles.priceDisplay}>
                <span className={styles.priceLabel}>Starting at</span>
                <span className={styles.priceValue}>{startingPrice}</span>
                {savingsPct && savingsPct > 0 && (
                  <span className={styles.savingsBadge}>
                    Save {savingsPct}%
                  </span>
                )}
              </div>
            )}

            {/* Key highlights - why it's a great deal */}
            {highlights.length > 0 && (
              <ul className={styles.highlights} aria-label="Key package benefits">
                {highlights.slice(0, 4).map((highlight, i) => (
                  <li key={i} className={styles.highlight}>
                    <span className={styles.highlightIcon} aria-hidden="true">✓</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Detailed pricing if available */}
          {(setupStr || monthlyStr) && (
            <div className={styles.pricingDetails} aria-label="Pricing breakdown">
              {setupStr && (
                <div className={styles.priceBreakdown}>
                  <span className={styles.priceType}>Setup:</span>
                  <span className={styles.priceAmount}>{setupStr}</span>
                </div>
              )}
              {monthlyStr && (
                <div className={styles.priceBreakdown}>
                  <span className={styles.priceType}>Monthly:</span>
                  <span className={styles.priceAmount}>{monthlyStr}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className={styles.cardFooter}>
          <Button 
            variant="secondary" 
            size="sm" 
            className={styles.cardButton} 
            aria-label={`${name} — ${ctaLabel.toLowerCase()}`}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : ctaLabel}
          </Button>
        </div>
      </Link>
    </article>
  );
}