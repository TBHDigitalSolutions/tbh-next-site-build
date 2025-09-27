// src/packages/components/PackageCard/PackageCard.tsx
// src/packages/components/PackageCard/PackageCard.tsx
"use client";

import * as React from "react";

import PackageCardFrame from "@/packages/components/PackageCardFrame";
import cls from "./PackageCard.module.css";

/**
 * Defensive imports for molecules:
 * - Works whether modules export `default` or `{ Named }`
 * - Avoids "Element type is invalid (got undefined)" at runtime
 */
import * as PriceLabelNS from "@/components/ui/molecules/PriceLabel";
import * as FeatureListNS from "@/components/ui/molecules/FeatureList";
import * as ServiceChipNS from "@/components/ui/molecules/ServiceChip";
import * as TagChipsNS from "@/components/ui/molecules/TagChips";

// Atoms
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";

// Centralized CTAs and pricing helpers
import { ROUTES, CTA_LABEL } from "@/packages/lib/cta";
import { startingAtLabel } from "@/packages/lib/pricing";

const PriceLabel = (PriceLabelNS as any).default ?? (PriceLabelNS as any).PriceLabel;
type PriceMoney = PriceLabelNS.Money;

const FeatureList = (FeatureListNS as any).default ?? (FeatureListNS as any).FeatureList;
const ServiceChip = (ServiceChipNS as any).default ?? (ServiceChipNS as any).ServiceChip;
const TagChips = (TagChipsNS as any).default ?? (TagChipsNS as any).TagChips;

/* ---------------------------------- Types --------------------------------- */

export type ServiceSlug = React.ComponentProps<typeof ServiceChip>["service"];

/** @deprecated Prefer the canonical Money shape on `price` */
export type LegacyPrice = { setup?: number; monthly?: number; currency?: string };

export type PackageCardProps = {
  // identity / routing
  id?: string;
  slug?: string;
  href?: string;
  testId?: string;

  // naming/content
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  features?: string[];
  highlights?: string[];

  // service + tier context
  service?: ServiceSlug;
  tier?: "Essential" | "Professional" | "Enterprise";
  popular?: boolean;
  badge?: string;

  // art
  image?: { src: string; alt?: string } | null;

  // pricing (Money is preferred; LegacyPrice still accepted but normalized)
  price?: PriceMoney | LegacyPrice;

  // taxonomy
  tags?: string[];

  // CTA (optional overrides)
  detailsHref?: string;
  primaryCta?: { label?: string; href?: string; onClick?: (slug?: string) => void };
  secondaryCta?: { label?: string; href?: string; onClick?: (slug?: string) => void };
  footnote?: string;

  // presentation
  className?: string;
  highlight?: boolean;                // emphasize card
  variant?: "default" | "rail";       // compact style for carousels

  // ux
  isLoading?: boolean;

  // analytics
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

  // Resolve display strings
  const displayTitle = name ?? title ?? "Untitled package";
  const displayDesc = description ?? summary ?? "";
  const displayFeatures = (features && features.length ? features : highlights) ?? [];
  const shown = displayFeatures.slice(0, 5);
  const remaining = Math.max(0, displayFeatures.length - shown.length);

  // Resolve hrefs (centralized routes)
  const defaultHref = href ?? detailsHref ?? (slug ? ROUTES.package(slug) : "#");
  const primaryHref = primaryCta?.href ?? defaultHref;
  const secondaryHref = secondaryCta?.href ?? ROUTES.book;

  // Normalize money & teaser label
  const money = normalizeMoney(price);
  const startingTeaser = money ? startingAtLabel(money) : "";

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
          ) : service ? (
            <div className={cls.iconFallback} aria-hidden="true">
              <ServiceChip service={service} variant="solid" size="sm" />
            </div>
          ) : null}

          {displayBadge && <span className={cls.badge}>{displayBadge}</span>}
        </div>

        <h3 className={cls.title} id={`${(slug ?? displayTitle).replace(/\s+/g, "-")}-title`}>
          {displayTitle}
        </h3>

        {/* Visual separator under the title */}
        <Divider />
      </header>

      {/* Description */}
      {displayDesc && <p className={cls.description}>{displayDesc}</p>}

      {/* Value section (derived starting price + quick highlights) */}
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

      {/* Tags (optional) */}
      {tags && tags.length > 0 ? (
        <div className={cls.tagsWrap}>
          <TagChips tags={tags} />
        </div>
      ) : null}

      {/* Divider before CTAs */}
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

      {/* Optional footnote */}
      {footnote && <div className={cls.footerNote}>{footnote}</div>}
    </PackageCardFrame>
  );
}
