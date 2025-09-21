"use client";

import * as React from "react";
import cls from "./PackageCard.module.css";

export type Price = { oneTime?: number; monthly?: number; currency?: "USD" };

export type PackageCardProps = {
  slug: string;
  name: string;
  description: string;
  price: Price;
  /** One-line highlights; keep concise */
  features?: string[];
  /** Small badge, e.g., "Most Popular" */
  badge?: string;
  /** Emphasize card with accent border */
  highlight?: boolean;

  /** Where the details button should link (defaults to `/packages/${slug}`) */
  detailsHref?: string;
  /** Optional primary CTA (defaults to View details) */
  primaryCta?: { label: string; href?: string; onClick?: (slug: string) => void };
  /** Optional secondary CTA (e.g., "Book a call") */
  secondaryCta?: { label: string; href?: string; onClick?: (slug: string) => void };
  /** Small legal or delivery note under CTAs */
  footnote?: string;

  /** ClassName passthrough */
  className?: string;
  id?: string;
  /** Analytics category for gtag events */
  analyticsCategory?: string; // e.g., "packages"
};

function formatMoney(v?: number, currency: string = "USD") {
  if (v === undefined) return undefined;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
  } catch {
    return `$${v}`;
  }
}

function PriceChips({ price }: { price: Price }) {
  const setup = formatMoney(price.oneTime, price.currency);
  const monthly = formatMoney(price.monthly, price.currency);
  if (!setup && !monthly) {
    return <div className={cls.priceChip}>Custom pricing</div>;
  }
  return (
    <>
      {setup && <div className={cls.priceChip}>Setup {setup}</div>}
      {monthly && <div className={cls.priceChip}>{monthly}/mo</div>}
    </>
  );
}

export default function PackageCard({
  slug,
  name,
  description,
  price,
  features = [],
  badge,
  highlight,
  detailsHref,
  primaryCta,
  secondaryCta,
  footnote,
  className,
  id,
  analyticsCategory = "packages",
}: PackageCardProps) {
  const safeDetails = detailsHref ?? `/packages/${slug}`;

  const fire = React.useCallback((action: string) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", action, { category: analyticsCategory, package_slug: slug, package_name: name });
    }
  }, [analyticsCategory, slug, name]);

  const onPrimary = React.useCallback(() => {
    fire("package_primary_cta_click");
    primaryCta?.onClick?.(slug);
  }, [fire, primaryCta, slug]);

  const onSecondary = React.useCallback(() => {
    fire("package_secondary_cta_click");
    secondaryCta?.onClick?.(slug);
  }, [fire, secondaryCta, slug]);

  const shown = features.slice(0, 5);
  const remaining = Math.max(0, features.length - shown.length);

  return (
    <article
      className={[cls.card, className].filter(Boolean).join(" ")}
      data-highlight={highlight ? "true" : "false"}
      id={id}
      itemScope
      itemType="https://schema.org/Service"
      aria-labelledby={`${slug}-title`}
    >
      <header className={cls.header}>
        <h3 id={`${slug}-title`} className={cls.title} itemProp="name">{name}</h3>
        {badge && <span className={cls.badge} aria-label={badge}>{badge}</span>}
      </header>

      <p className={cls.description} itemProp="description">{description}</p>

      <div className={cls.prices}>
        <PriceChips price={price} />
        {/* Microdata for offers */}
        <meta itemProp="areaServed" content="US" />
        <div itemProp="offers" itemScope itemType="https://schema.org/Offer" hidden>
          {price.monthly != null && (
            <>
              <meta itemProp="price" content={String(price.monthly)} />
              <meta itemProp="priceCurrency" content={price.currency ?? "USD"} />
              <meta itemProp="availability" content="https://schema.org/InStock" />
            </>
          )}
        </div>
      </div>

      {shown.length > 0 && (
        <div className={cls.features}>
          <ul className={cls.featureList}>
            {shown.map((f, i) => (
              <li key={i} className={cls.featureItem} itemProp="feature">{f}</li>
            ))}
          </ul>
          {remaining > 0 && (
            <div className={cls.more} aria-live="polite">+{remaining} more</div>
          )}
        </div>
      )}

      <div className={cls.actions}>
        <a
          className={cls.btn}
          href={primaryCta?.href ?? safeDetails}
          onClick={onPrimary}
          aria-label={primaryCta?.label ? `${primaryCta.label} — ${name}` : `View details — ${name}`}
        >
          {primaryCta?.label ?? "View details"}
        </a>

        {secondaryCta && (
          <a
            className={[cls.btn, cls.btnSecondary].join(" ")}
            href={secondaryCta.href ?? "/book"}
            onClick={onSecondary}
            aria-label={`${secondaryCta.label} — ${name}`}
          >
            {secondaryCta.label}
          </a>
        )}
      </div>

      {footnote && <div className={cls.footerNote}>{footnote}</div>}
    </article>
  );
}