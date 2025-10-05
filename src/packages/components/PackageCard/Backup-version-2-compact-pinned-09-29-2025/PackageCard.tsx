"use client";

import * as React from "react";

import PackageCardFrame from "@/packages/components/PackageCardFrame";
import cls from "./PackageCard.module.css";

// Atoms
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";

// Molecules
import { type Money as PriceMoney } from "@/components/ui/molecules/PriceLabel";
import { FeatureList } from "@/components/ui/molecules/FeatureList";
import { ServiceChip } from "@/components/ui/molecules/ServiceChip";
import TagChips from "@/components/ui/molecules/TagChips";

// Centralized CTAs and pricing helpers
import { ROUTES, CTA_LABEL } from "@/packages/lib/cta";
import { startingAtLabel } from "@/packages/lib/types/pricing";

/* ---------------------------------- Types --------------------------------- */

export type ServiceSlug = React.ComponentProps<typeof ServiceChip>["service"];

/** @deprecated Prefer the canonical Money shape on `price` */
export type LegacyPrice = { setup?: number; monthly?: number; currency?: string };

type PackageCardVariant = "default" | "rail" | "pinned-compact";

export type PackageCardProps = {
  id?: string;
  slug?: string;
  href?: string;
  testId?: string;

  name?: string;
  title?: string;

  /** Short value prop (preferred on cards) */
  summary?: string;
  /** Longer description (rendered in its own section; not shown in pinned) */
  description?: string;

  /** Feature/highlight bullets (max 5 shown). */
  features?: string[];
  highlights?: string[];

  service?: ServiceSlug;
  tier?: "Essential" | "Professional" | "Enterprise";
  popular?: boolean;
  badge?: string;

  image?: { src: string; alt?: string } | null;

  /** Canonical price (SSOT) or legacy */
  price?: PriceMoney | LegacyPrice;

  tags?: string[];

  detailsHref?: string;
  primaryCta?: { label?: string; href?: string; onClick?: (slug?: string) => void };
  secondaryCta?: { label?: string; href?: string; onClick?: (slug?: string) => void };
  footnote?: string;

  className?: string;
  highlight?: boolean;

  /** Visual/content variants */
  variant?: PackageCardVariant;

  isLoading?: boolean;
  analyticsCategory?: string;

  /* ----------------------- Content controls (discipline) ------------------ */
  /** Explicitly enable tags; default is false (even if tags exist) */
  showTags?: boolean;
  /** Explicitly enable badge; default is false */
  showBadge?: boolean;
  /** Explicitly enable tier chip; default is false */
  showTier?: boolean;
  /** Show long description section in non-pinned variants (default true) */
  showDescription?: boolean;
  /** Show features list in non-pinned variants (default true) */
  showFeatures?: boolean;
  /** Show secondary button (default true in non-pinned) */
  showSecondaryCta?: boolean;

  /* ---------------------------- Compact helpers --------------------------- */
  /** Force-hide tags regardless of showTags */
  hideTags?: boolean;
  /** Reserved for future (kept for API parity) */
  hideOutcomes?: boolean;
  /** Reserved for future (kept for API parity) */
  hideIncludes?: boolean;

  /** Clamp summary lines (used in pinned-compact); defaults to 3 when pinned */
  descriptionMaxLines?: number;
};

/* --------------------------------- Utils ---------------------------------- */

function normalizeMoney(price?: PriceMoney | LegacyPrice): PriceMoney | undefined {
  if (!price) return undefined;
  if ("oneTime" in price || "monthly" in price) {
    const p = price as PriceMoney;
    return {
      oneTime: p.oneTime ?? undefined,
      monthly: p.monthly ?? undefined,
      currency: p.currency ?? "USD",
    };
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
    summary,
    description,
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

    // Content controls (default-off for tags/badge/tier; default-on for others)
    showTags,
    showBadge,
    showTier,
    showDescription,
    showFeatures,
    showSecondaryCta,

    // Compact helpers
    hideTags,
    hideOutcomes, // eslint-disable-line @typescript-eslint/no-unused-vars
    hideIncludes, // eslint-disable-line @typescript-eslint/no-unused-vars

    descriptionMaxLines,
  } = props;

  const isPinned = variant === "pinned-compact";

  // Title/summary/description
  const displayTitle = name ?? title ?? "Untitled package";
  const displaySummary = (summary && summary.trim()) || "";
  const displayDescription = (description && description.trim()) || "";

  // Feature list (top 5 only)
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

  // Badge/tier discipline
  const computedBadge = badge ?? (popular ? "Most Popular" : tier ?? undefined);

  // Variant-driven guards
  const canShowDescription = !isPinned && (showDescription ?? true) && !!displayDescription;
  const canShowFeatures = !isPinned && (showFeatures ?? true) && shown.length > 0;
  const canShowSecondary = !isPinned && (showSecondaryCta ?? true);

  const canShowTags =
    !isPinned &&
    !hideTags &&
    (showTags ?? false) &&
    Array.isArray(tags) &&
    tags.length > 0;

  const canShowBadge = !isPinned && (showBadge ?? false) && !!computedBadge;
  const canShowTier = !isPinned && (showTier ?? false) && !!tier;

  // Summary clamp (pinned defaults to 3 lines if not provided)
  const clampLines = isPinned ? descriptionMaxLines ?? 3 : descriptionMaxLines;

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
        isPinned && cls.cardPinned,
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
      {/* ============================ HEADER ============================ */}
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

          {canShowBadge && <span className={cls.badge}>{computedBadge}</span>}
          {canShowTier && !canShowBadge && tier ? <span className={cls.badge}>{tier}</span> : null}
        </div>

        {/* Title + divider + summary in a single container */}
        <div className={cls.titleWrap}>
          <h3
            className={cls.title}
            title={displayTitle}
            id={`${(slug ?? displayTitle).replace(/\s+/g, "-")}-title`}
          >
            {displayTitle}
          </h3>
          <Divider />

          {displaySummary ? (
            <p
              className={cx(
                cls.summary,
                clampLines ? cls.summaryClamp : null,
              )}
              style={clampLines ? ({ ["--summary-lines" as any]: String(clampLines) } as React.CSSProperties) : undefined}
            >
              {displaySummary}
            </p>
          ) : null}
        </div>
      </header>

      {/* ========================== DESCRIPTION ========================== */}
      {canShowDescription && (
        <section className={cls.descriptionSection} aria-label="Description">
          <p className={cls.description}>{displayDescription}</p>
        </section>
      )}

      {/* ============================ FEATURES =========================== */}
      {canShowFeatures && (
        <section className={cls.featuresSection} aria-label="Highlights">
          <div className={cls.features}>
            <FeatureList items={shown.map((f, i) => ({ id: `f-${i}`, label: f }))} size="sm" />
            {remaining > 0 && (
              <div className={cls.more} aria-live="polite">
                +{remaining} more
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============================== TAGS ============================= */}
      {canShowTags ? (
        <div className={cls.tagsWrap} role="list" aria-label="Tags">
          {/* enforce single row, no wrap via CSS */}
          <TagChips tags={tags!} />
        </div>
      ) : null}

      {/* ============================== PRICE ============================ */}
      {money && (
        <div className={cls.priceRow} aria-label={startingTeaser} title={startingTeaser}>
          {startingTeaser}
        </div>
      )}

      {/* Divider must be directly above the CTA section */}
      <Divider className={cls.actionsDivider} />

      {/* ============================== CTAS ============================= */}
      <div className={cx(cls.actions, canShowSecondary ? cls.actionsTwo : cls.actionsOne)}>
        <Button
          href={primaryHref}
          variant="primary"
          ariaLabel={`${primaryCta?.label ?? CTA_LABEL.VIEW_DETAILS} — ${displayTitle}`}
          disabled={isLoading}
          onClick={onPrimary as any}
        >
          {isLoading ? "Loading..." : (primaryCta?.label ?? CTA_LABEL.VIEW_DETAILS)}
        </Button>

        {canShowSecondary ? (
          <Button
            href={secondaryHref}
            variant="secondary"
            ariaLabel={`${secondaryCta?.label ?? CTA_LABEL.BOOK_A_CALL} — ${displayTitle}`}
            onClick={onSecondary as any}
          >
            {secondaryCta?.label ?? CTA_LABEL.BOOK_A_CALL}
          </Button>
        ) : null}
      </div>

      {/* ============================== FOOTNOTE ========================== */}
      {footnote && <div className={cls.footerNote}>{footnote}</div>}
    </PackageCardFrame>
  );
}
