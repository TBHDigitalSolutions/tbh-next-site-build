// src/packages/components/PackageCard/PackageCard.tsx
"use client";

import * as React from "react";

import PackageCardFrame from "@/packages/components/PackageCardFrame";
import cls from "./PackageCard.module.css";

// Atoms
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";

// Molecules — use named/default imports directly
import { PriceLabel, type Money as PriceMoney } from "@/components/ui/molecules/PriceLabel";
import { FeatureList } from "@/components/ui/molecules/FeatureList";
import { ServiceChip } from "@/components/ui/molecules/ServiceChip";
import TagChips from "@/components/ui/molecules/TagChips";

// Centralized CTAs and pricing helpers
import { ROUTES, CTA_LABEL } from "@/packages/lib/cta";
import { startingAtLabel } from "@/packages/lib/pricing";

/* ---------------------------------- Types --------------------------------- */

export type ServiceSlug = React.ComponentProps<typeof ServiceChip>["service"];

/** @deprecated Prefer the canonical Money shape on `price` */
export type LegacyPrice = { setup?: number; monthly?: number; currency?: string };

export type PackageCardProps = {
  id?: string;
  slug?: string;
  href?: string;
  testId?: string;

  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  features?: string[];
  highlights?: string[];

  service?: ServiceSlug;
  tier?: "Essential" | "Professional" | "Enterprise";
  popular?: boolean;
  badge?: string;

  image?: { src: string; alt?: string } | null;

  price?: PriceMoney | LegacyPrice;

  tags?: string[];

  detailsHref?: string;
  primaryCta?: { label?: string; href?: string; onClick?: (slug?: string) => void };
  secondaryCta?: { label?: string; href?: string; onClick?: (slug?: string) => void };
  footnote?: string;

  className?: string;
  highlight?: boolean;
  variant?: "default" | "rail";

  isLoading?: boolean;

  analyticsCategory?: string;
};

/* --------------------------------- Utils ---------------------------------- */

function normalizeMoney(price?: PriceMoney | LegacyPrice): PriceMoney | undefined {
  if (!price) return undefined;
  if ("oneTime" in price || "monthly" in price) {
    const p = price as PriceMoney;
    return { oneTime: p.oneTime ?? undefined, monthly: p.monthly ?? undefined, currency: p.currency ?? "USD" };
  }
  const legacy = price as LegacyPrice;
  return { oneTime: legacy.setup, monthly: legacy.monthly, currency: legacy.currency ?? "USD" };
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
    tags,

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

  // Display strings
  const displayTitle = name ?? title ?? "Untitled package";
  // ↓↓↓ Reverse precedence so cards favor the short summary
  const displayDesc = (summary && summary.trim()) ? summary : (description ?? "");
  const displayFeatures = (features && features.length ? features : highlights) ?? [];
  const shown = displayFeatures.slice(0, 5);
  const remaining = Math.max(0, displayFeatures.length - shown.length);

  // Hrefs
  const defaultHref = href ?? detailsHref ?? (slug ? ROUTES.package(slug) : "#");
  const primaryHref = primaryCta?.href ?? defaultHref;
  const secondaryHref = secondaryCta?.href ?? ROUTES.book;

  // Money & teaser
  const money = normalizeMoney(price);
  const startingTeaser = money ? startingAtLabel(money) : "";

  // Badge
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

  return (
    <PackageCardFrame
      className={cx(
        cls.card,
        highlight && cls.cardHighlight,
        variant === "rail" && cls.cardRail,
        className,
      )}
      height="stretch"
      padding="lg"
      hoverLift
      ariaLabel={`${displayTitle} package`}
      data-testid={testId}
      data-service={service ?? ""}
      data-tier={tier ?? ""}
      data-popular={popular ? "true" : "false"}
    >
      {/* Header / Media */}
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
          ) : service ? (
            <div className={cls.iconFallback} aria-hidden="true">
              <ServiceChip service={service} variant="solid" size="sm" />
            </div>
          ) : null}

          {displayBadge && <span className={cls.badge}>{displayBadge}</span>}
        </div>

        {/* Title + underline as a single unit */}
        <div className={cls.titleBar}>
          <h3 className={cls.title} id={`${(slug ?? displayTitle).replace(/\s+/g, "-")}-title`}>
            {displayTitle}
          </h3>
          <Divider />
        </div>
      </header>

      {/* Description */}
      {displayDesc && <p className={cls.description}>{displayDesc}</p>}

      {/* Value (teaser + quick highlights) */}
      <div className={cls.value}>
        {startingTeaser && (
          <div className={cls.priceDisplay} aria-label={startingTeaser}>
            {startingTeaser}
          </div>
        )}

        {shown.length > 0 && (
          <div className={cls.features}>
            <FeatureList items={shown.map((f, i) => ({ id: `f-${i}`, label: f }))} size="sm" />
            {remaining > 0 && (
              <div className={cls.more} aria-live="polite">
                +{remaining} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detailed price chip */}
      {money && (
        <div className={cls.prices}>
          <div className={cls.priceChip}>
            <PriceLabel price={money} />
          </div>
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 ? (
        <div className={cls.tagsWrap}>
          <TagChips tags={tags} />
        </div>
      ) : null}

      <Divider />

      {/* Actions */}
      <div className={cls.actions}>
        <Button
          href={primaryHref}
          variant="primary"
          ariaLabel={`${primaryCta?.label ?? CTA_LABEL.VIEW_DETAILS} — ${displayTitle}`}
          disabled={isLoading}
          onClick={onPrimary as any}
        >
          {isLoading ? "Loading..." : (primaryCta?.label ?? CTA_LABEL.VIEW_DETAILS)}
        </Button>

        <Button
          href={secondaryHref}
          variant="secondary"
          ariaLabel={`${secondaryCta?.label ?? CTA_LABEL.BOOK_A_CALL} — ${displayTitle}`}
          onClick={onSecondary as any}
        >
          {secondaryCta?.label ?? CTA_LABEL.BOOK_A_CALL}
        </Button>
      </div>

      {footnote && <div className={cls.footerNote}>{footnote}</div>}
    </PackageCardFrame>
  );
}
