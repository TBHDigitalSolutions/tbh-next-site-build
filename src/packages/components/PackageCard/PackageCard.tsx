// src/packages/components/PackageCard/PackageCard.tsx
// src/packages/components/PackageCard/PackageCard.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import cls from "./PackageCard.module.css";
import {
  formatCurrency,
  toMonthlyPrice,
  toOneTimePrice,
  toStartingPrice,
} from "@/data/packages/_types/currency";

/* ---------------------------------- Types --------------------------------- */

// Service universe used by cards & filters
export type ServiceSlug = "webdev" | "seo" | "marketing" | "leadgen" | "content" | "video";

// Money (domain-preferred) — UI accepts this OR the legacy {setup, monthly}
export type Money = { oneTime?: number; monthly?: number; currency?: string };

// Legacy shape accepted by carousel callers
export type LegacyPrice = { setup?: number; monthly?: number; currency?: string };

// Shared card props (merged, superset of both implementations)
export type PackageCardProps = {
  // identity / routing
  id?: string;               // optional DOM/test id
  slug?: string;             // used to construct default href
  href?: string;             // explicit link target
  testId?: string;

  // naming/content
  name?: string;             // preferred (domain)
  title?: string;            // alt name (carousel)
  description?: string;      // preferred (domain)
  summary?: string;          // alt description (carousel)
  features?: string[];       // domain highlights list
  highlights?: string[];     // alt highlights (carousel)

  // service + tier context
  service?: ServiceSlug;
  tier?: "Essential" | "Professional" | "Enterprise";
  popular?: boolean;
  badge?: string;            // custom badge text

  // art
  image?: { src: string; alt?: string } | null;

  // pricing (either shape is fine)
  price?: Money | LegacyPrice;
  startingAt?: number;       // optional “from $X” chip
  savingsPct?: number;       // optional “Save N%” badge

  // CTA (optional overrides)
  detailsHref?: string;      // legacy alias for href
  primaryCta?: { label: string; href?: string; onClick?: (slug?: string) => void };
  secondaryCta?: { label: string; href?: string; onClick?: (slug?: string) => void };
  footnote?: string;

  // presentation
  className?: string;
  highlight?: boolean;       // accent border
  variant?: "default" | "rail"; // layout hint for CSS

  // ux
  isLoading?: boolean;

  // analytics
  analyticsCategory?: string; // gtag category
};

/* ---------------------------- Local dictionaries -------------------------- */

const SERVICE_ICONS: Partial<Record<ServiceSlug, string>> = {
  webdev: "🌐",
  seo: "🔍",
  marketing: "📈",
  leadgen: "🎯",
  content: "✏️",
  video: "🎬",
};

const SERVICE_NAMES: Partial<Record<ServiceSlug, string>> = {
  webdev: "Web Development",
  seo: "SEO Services",
  marketing: "Marketing",
  leadgen: "Lead Generation",
  content: "Content Production",
  video: "Video Production",
};

/* --------------------------------- Utils ---------------------------------- */

// Normalize any price shape → Money
function normalizeMoney(price?: Money | LegacyPrice): Money | undefined {
  if (!price) return undefined;
  // If it already looks like Money, keep as-is
  if ("oneTime" in price || "monthly" in price) {
    return { oneTime: (price as Money).oneTime, monthly: price.monthly, currency: price.currency ?? "USD" };
  }
  // Legacy -> Money mapping
  const legacy = price as LegacyPrice;
  return { oneTime: legacy.setup, monthly: legacy.monthly, currency: legacy.currency ?? "USD" };
}

// Render price chips (setup, monthly, or custom)
function PriceChips({ money }: { money?: Money }) {
  const one = money?.oneTime;
  const mon = money?.monthly;
  const cur = money?.currency ?? "USD";

  if (one == null && mon == null) {
    return <div className={cls.priceChip}>Contact for pricing</div>;
  }

  return (
    <>
      {one != null && <div className={cls.priceChip}>Setup {formatCurrency(one, cur)}</div>}
      {mon != null && <div className={cls.priceChip}>{toMonthlyPrice(mon, cur)}</div>}
    </>
  );
}

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/* --------------------------------- Card ----------------------------------- */

export default function PackageCard(props: PackageCardProps) {
  const {
    id,
    slug,
    href,
    testId,

    name,
    title,
    description,
    summary,
    features,
    highlights,

    service,
    tier,
    popular,
    badge,

    image,

    price,
    startingAt,
    savingsPct,

    detailsHref,
    primaryCta,
    secondaryCta,
    footnote,

    className,
    highlight,
    variant = "default",

    isLoading = false,

    analyticsCategory = "packages",
  } = props;

  // Resolve display strings
  const displayTitle = name ?? title ?? "Untitled package";
  const displayDesc = description ?? summary ?? "";
  const displayFeatures = (features && features.length ? features : highlights) ?? [];
  const shown = displayFeatures.slice(0, 5);
  const remaining = Math.max(0, displayFeatures.length - shown.length);

  // Resolve hrefs
  const defaultHref = href ?? detailsHref ?? (slug ? `/packages/${slug}` : "#");
  const primaryHref = primaryCta?.href ?? defaultHref;
  const secondaryHref = secondaryCta?.href ?? "/book";

  // Normalize money
  const money = normalizeMoney(price);
  const currency = money?.currency ?? "USD";
  const startingLabel = startingAt != null ? toStartingPrice(startingAt, currency) : null;

  // Badge logic: custom > popular > tier
  const displayBadge = badge ?? (popular ? "Most Popular" : tier ?? undefined);

  // Analytics
  const fire = React.useCallback(
    (action: string) => {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", action, {
          category: analyticsCategory,
          package_slug: slug,
          package_name: displayTitle,
        });
      }
    },
    [analyticsCategory, slug, displayTitle],
  );

  const onPrimary = React.useCallback(() => {
    fire("package_primary_cta_click");
    primaryCta?.onClick?.(slug);
  }, [fire, primaryCta, slug]);

  const onSecondary = React.useCallback(() => {
    fire("package_secondary_cta_click");
    secondaryCta?.onClick?.(slug);
  }, [fire, secondaryCta, slug]);

  const serviceIcon = service ? SERVICE_ICONS[service] : undefined;
  const serviceName = service ? SERVICE_NAMES[service] : undefined;

  // Microdata (only include Offer price fields when we actually have numeric price)
  const monthlyRaw = money?.monthly;

  return (
    <article
      id={id}
      data-testid={testId}
      className={cx(
        cls.card,
        highlight && cls.cardHighlight,
        variant === "rail" && cls.cardRail,
        className,
      )}
      data-service={service ?? ""}
      data-tier={tier ?? ""}
      data-popular={popular ? "true" : "false"}
      itemScope
      itemType="https://schema.org/Service"
      aria-labelledby={`${(slug ?? displayTitle).replace(/\s+/g, "-")}-title`}
    >
      {/* Media/Header */}
      <header className={cls.header}>
        <div className={cls.media}>
          {image?.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.src}
              alt={image.alt || `${displayTitle} preview`}
              className={cls.cardImage}
              loading="lazy"
              decoding="async"
            />
          ) : serviceIcon ? (
            <div className={cls.iconFallback} aria-hidden="true" title={serviceName}>
              <span className={cls.serviceIcon} role="img" aria-label={serviceName}>
                {serviceIcon}
              </span>
            </div>
          ) : null}
          {displayBadge && <span className={cls.badge}>{displayBadge}</span>}
          {savingsPct != null && savingsPct > 0 && (
            <span className={cls.savingsBadge}>Save {savingsPct}%</span>
          )}
        </div>

        <h3
          className={cls.title}
          id={`${(slug ?? displayTitle).replace(/\s+/g, "-")}-title`}
          itemProp="name"
        >
          {displayTitle}
        </h3>
      </header>

      {/* Description */}
      {displayDesc && (
        <p className={cls.description} itemProp="description">
          {displayDesc}
        </p>
      )}

      {/* Value section (starting price + quick highlights) */}
      <div className={cls.value}>
        {startingLabel && (
          <div className={cls.priceDisplay}>
            <span className={cls.priceLabel}>Starting at</span>
            <span className={cls.priceValue}>{startingLabel.replace(/^from\s*/i, "")}</span>
          </div>
        )}

        {shown.length > 0 && (
          <div className={cls.features}>
            <ul className={cls.featureList}>
              {shown.map((f, i) => (
                <li key={i} className={cls.featureItem} itemProp="feature">
                  <span className={cls.check} aria-hidden="true">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {remaining > 0 && (
              <div className={cls.more} aria-live="polite">
                +{remaining} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed price chips */}
      <div className={cls.prices}>
        <PriceChips money={money} />
        <meta itemProp="areaServed" content="US" />
        <div itemProp="offers" itemScope itemType="https://schema.org/Offer" hidden>
          {typeof monthlyRaw === "number" && !Number.isNaN(monthlyRaw) && (
            <>
              <meta itemProp="price" content={String(monthlyRaw)} />
              <meta itemProp="priceCurrency" content={currency} />
              <meta itemProp="availability" content="https://schema.org/InStock" />
            </>
          )}
        </div>
      </div>

      {/* Actions (Next.js Link for prefetch) */}
      <div className={cls.actions}>
        <Link
          href={primaryHref}
          onClick={onPrimary}
          aria-label={primaryCta?.label ? `${primaryCta.label} — ${displayTitle}` : `View details — ${displayTitle}`}
          className={cx(cls.btn, cls.btnPrimary)}
          prefetch
          aria-disabled={isLoading}
        >
          {isLoading ? "Loading..." : primaryCta?.label ?? "View details"}
        </Link>

        {secondaryCta && (
          <Link
            href={secondaryHref}
            onClick={onSecondary}
            aria-label={`${secondaryCta.label} — ${displayTitle}`}
            className={cx(cls.btn, cls.btnSecondary)}
            prefetch
            aria-disabled={isLoading}
          >
            {secondaryCta.label}
          </Link>
        )}
      </div>

      {/* Optional footnote */}
      {footnote && <div className={cls.footerNote}>{footnote}</div>}
    </article>
  );
}
