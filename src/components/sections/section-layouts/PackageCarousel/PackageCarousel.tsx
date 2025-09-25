// src/components/sections/section-layouts/PackageCarousel/PackageCarousel.tsx
import * as React from "react";
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";
import { PackageCard } from "@/packages/components/PackageCard";
import type { PackageCardProps } from "@/packages/components/PackageCard";
import styles from "./PackageCarousel.module.css";
import { SERVICE_LABELS } from "./helpers";
import {
  adaptFeaturedCardsToPackageCards,
  isFeaturedCardArray,
} from "./adapters/featuredDataAdapter";
import type { FeaturedCard } from "./adapters/featuredDataAdapter";

/** Public props */
export type PackageCarouselProps = {
  /** Section title/subtitle */
  title?: string;
  subtitle?: string;

  /** Preferred: pass card-ready items (PackageCardProps[]) */
  items?: PackageCardProps[];

  /** Optional: raw featured data that will be adapted into card props */
  featuredData?: FeaturedCard[];

  /** Layout variant */
  layout?: "carousel" | "grid";

  /** Service slug for labels/links (used only for the section, not the cards) */
  serviceSlug?: keyof typeof SERVICE_LABELS;

  /** Additional CSS class */
  className?: string;

  /** Footer CTAs (defaults are derived from serviceSlug) */
  viewAllHref?: string;
  addonsHref?: string;

  /** UI controls */
  showFooterActions?: boolean;
  enforceThreeCards?: boolean;

  /** States */
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;

  /** Testing */
  testId?: string;
};

/* ----------------------------------------------------------------------------
 * Legacy → New card prop coerce (defensive)
 * ---------------------------------------------------------------------------- */

function coerceToPackageCardProps(input: any): PackageCardProps | null {
  if (!input) return null;

  // Already in the new shape
  if ("slug" in input && "name" in input && "description" in input) {
    return input as PackageCardProps;
  }

  // Legacy/featured adapter shapes (best-effort mapping)
  const slug =
    input.slug ??
    input.id ??
    (typeof input.href === "string"
      ? input.href.split("/").filter(Boolean).pop()
      : undefined) ??
    undefined;

  if (!slug) return null;

  const name = input.name ?? input.title ?? "Package";
  const description = input.description ?? input.summary ?? input.subtitle ?? "";

  // Price normalization
  const rawPrice = input.price ?? input.pricing ?? undefined;
  let price: PackageCardProps["price"] | undefined = undefined;
  if (rawPrice) {
    // Prefer canonical keys if present
    if (typeof rawPrice === "object" && ("oneTime" in rawPrice || "monthly" in rawPrice)) {
      price = {
        oneTime: rawPrice.oneTime,
        monthly: rawPrice.monthly,
        currency: rawPrice.currency ?? "USD",
      };
    } else if (typeof rawPrice === "object" && Array.isArray(rawPrice.tiers)) {
      // Try to derive from tiers with period
      let monthly: number | undefined;
      let oneTime: number | undefined;
      for (const t of rawPrice.tiers) {
        const n =
          typeof t?.price === "number"
            ? t.price
            : typeof t?.price === "string"
            ? Number(t.price.replace(/[^\d.]/g, ""))
            : undefined;
        const period = String(t?.period ?? "").toLowerCase();
        if (n) {
          if (period.includes("month")) monthly = monthly ?? n;
          if (period.includes("setup") || period.includes("one time") || period.includes("one-time")) {
            oneTime = oneTime ?? n;
          }
        }
      }
      if (monthly != null || oneTime != null) {
        price = { monthly, oneTime, currency: "USD" };
      }
    } else if (typeof rawPrice === "object") {
      // Legacy { setup, monthly }
      const oneTime =
        rawPrice.oneTime ??
        rawPrice.setup ??
        (typeof rawPrice?.setup === "string"
          ? Number(rawPrice.setup.replace(/[^\d.]/g, ""))
          : undefined);
      const monthly =
        rawPrice.monthly ??
        (typeof rawPrice?.monthly === "string"
          ? Number(rawPrice.monthly.replace(/[^\d.]/g, ""))
          : undefined);
      price =
        oneTime != null || monthly != null
          ? { oneTime, monthly, currency: rawPrice.currency ?? "USD" }
          : undefined;
    }
  }

  const features: string[] =
    input.features?.map((f: any) => (typeof f === "string" ? f : f?.label)).filter(Boolean) ??
    input.highlights ??
    [];

  const badge: string | undefined = input.badge ?? (input.popular ? "Most Popular" : undefined);

  const detailsHref: string | undefined =
    input.detailsHref ?? (typeof input.href === "string" ? input.href : `/packages/${slug}`);

  const primaryCta =
    input.primaryCta ??
    (detailsHref ? { label: "View details", href: detailsHref } : undefined);

  const secondaryCta =
    input.secondaryCta ??
    (input.withBookCall === false ? undefined : { label: "Book a call", href: "/book" });

  const footnote =
    input.footnote ??
    (input.timeline ? `Typical onboarding ${String(input.timeline)}` : undefined);

  return {
    slug,
    name,
    description,
    price,
    features,
    badge,
    detailsHref,
    primaryCta,
    secondaryCta,
    footnote,
  };
}

/* ----------------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------------------- */

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
  error,
  onRetry,
  testId = "package-carousel",
}: PackageCarouselProps) {
  // Error UI
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
          <h3 className={styles.errorTitle}>Unable to load packages</h3>
          <p className={styles.errorMessage}>{error}</p>
          {onRetry && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}
              className={styles.errorAction}
            >
              Try again
            </Button>
          )}
        </div>
      </section>
    );
  }

  // Normalize data source
  let source: any[] = [];
  if (items.length > 0) {
    source = items;
  } else if (featuredData && isFeaturedCardArray(featuredData)) {
    // Adapt featured → legacy card props (repo adapter), then coerce → new props
    source = adaptFeaturedCardsToPackageCards(featuredData);
  }

  // Coerce all inputs into PackageCardProps
  let cardItems: PackageCardProps[] = source
    .map(coerceToPackageCardProps)
    .filter(Boolean) as PackageCardProps[];

  // Optionally enforce exactly 3 cards (marketing rails)
  if (enforceThreeCards) {
    cardItems = cardItems.slice(0, 3);
  }

  // Nothing to render
  if (!cardItems.length && !isLoading) {
    return null;
  }

  // Footer CTAs (derived from service)
  const serviceLabel = serviceSlug ? SERVICE_LABELS[serviceSlug] : "Packages";
  const defaultViewAllHref = viewAllHref ?? (serviceSlug ? `/services/${serviceSlug}/packages` : "/packages");
  const defaultAddonsHref = addonsHref ?? (serviceSlug ? `/services/${serviceSlug}/packages#addons` : "/packages#addons");

  // Loading placeholders if needed
  const displayItems: PackageCardProps[] =
    isLoading && !cardItems.length
      ? Array.from({ length: 3 }, (_, i) => ({
          slug: `loading-${i}`,
          name: "Loading…",
          description: "Loading package information…",
          // show skeleton state via highlight + no CTAs/prices
          highlight: false,
        }))
      : cardItems;

  return (
    <section
      className={[
        styles.packageCarousel,
        isLoading ? styles.loading : "",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
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
            className={[
              styles.carouselTrack,
              styles[`${layout}Track`],
              layout === "carousel" ? styles.threeUp : "",
            ]
              .filter(Boolean)
              .join(" ")}
            role={layout === "carousel" ? "region" : undefined}
            aria-label={
              layout === "carousel" ? `${serviceLabel} packages carousel` : undefined
            }
          >
            {displayItems.map((item, index) => (
              <PackageCard
                key={item.slug ?? `pkg-${index}`}
                {...item}
                className={[styles.carouselCard, styles[`${layout}Card`]]
                  .filter(Boolean)
                  .join(" ")}
                id={item.slug ? `pkg-${item.slug}` : undefined}
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

      {/* SR-only loading announcer */}
      {isLoading && (
        <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
          Loading {serviceLabel} packages…
        </div>
      )}
    </section>
  );
}
