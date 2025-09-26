// src/packages/components/PackageCard/PackageCard.tsx
"use client";

import * as React from "react";
import Link from "next/link";

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

const PriceLabel = (PriceLabelNS as any).default ?? (PriceLabelNS as any).PriceLabel;
const formatMoney = (PriceLabelNS as any).formatMoney as (n?: number, currency?: string) => string;
type PriceMoney = PriceLabelNS.Money;

const FeatureList = (FeatureListNS as any).default ?? (FeatureListNS as any).FeatureList;
const ServiceChip = (ServiceChipNS as any).default ?? (ServiceChipNS as any).ServiceChip;
const TagChips = (TagChipsNS as any).default ?? (TagChipsNS as any).TagChips;

/* ---------------------------------- Types --------------------------------- */

export type ServiceSlug = React.ComponentProps<typeof ServiceChip>["service"];

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

  // pricing (either shape is fine)
  price?: PriceMoney | LegacyPrice;
  startingAt?: number;
  savingsPct?: number;

  // taxonomy
  tags?: string[];

  // CTA (optional overrides)
  detailsHref?: string;
  primaryCta?: { label: string; href?: string; onClick?: (slug?: string) => void };
  secondaryCta?: { label: string; href?: string; onClick?: (slug?: string) => void };
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
    return { oneTime: p.oneTime, monthly: p.monthly, currency: p.currency ?? "USD" };
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
    startingAt,
    savingsPct,

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

  // Resolve hrefs
  const defaultHref = href ?? detailsHref ?? (slug ? `/packages/${slug}` : "#");
  const primaryHref = primaryCta?.href ?? defaultHref;
  const secondaryHref = secondaryCta?.href ?? "/book";

  // Normalize money & labels
  const money = normalizeMoney(price);
  const currency = money?.currency ?? "USD";
  const startingLabel =
    typeof startingAt === "number" ? `From ${formatMoney(startingAt, currency)}` : null;

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
          {savingsPct != null && savingsPct > 0 && (
            <span className={cls.savingsBadge}>Save {savingsPct}%</span>
          )}
        </div>

        <h3 className={cls.title} id={`${(slug ?? displayTitle).replace(/\s+/g, "-")}-title`}>
          {displayTitle}
        </h3>
      </header>

      {/* Description */}
      {displayDesc && <p className={cls.description}>{displayDesc}</p>}

      {/* Value section (starting price + quick highlights) */}
      <div className={cls.value}>
        {startingLabel && (
          <div className={cls.priceDisplay}>
            <span className={cls.priceLabel}>Starting at</span>
            <span className={cls.priceValue}>{startingLabel.replace(/^From\s+/i, "")}</span>
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

      {/* Detailed price */}
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

      {/* Actions */}
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
    </PackageCardFrame>
  );
}
