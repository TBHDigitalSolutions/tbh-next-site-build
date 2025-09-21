"use client";

import * as React from "react";
import cls from "./PriceBlock.module.css";

export type Price = { oneTime?: number; monthly?: number; yearly?: number; currency?: "USD" };

export type PriceBlockProps = {
  price: Price;
  /** Show the monthly/yearly toggle */
  enableBillingToggle?: boolean;
  /** If yearly is not provided, compute from monthly with this discount percent */
  annualDiscountPercent?: number; // e.g., 15
  /** Display the setup one-time fee chip */
  showSetup?: boolean;
  /** Unit label, e.g., "per site" or "per seat" */
  unitLabel?: string;
  /** Small caption under the main price row */
  caption?: string;
  /** Badge next to title row (e.g., "Save 15% annually") */
  badge?: string;
  /** Emphasize block */
  highlight?: boolean;
  /** Optional title (e.g., plan name). If absent, block renders price only. */
  title?: string;
  /** CTA buttons */
  primaryCta?: { label: string; href?: string; onClick?: () => void };
  secondaryCta?: { label: string; href?: string; onClick?: () => void };
  /** Fine‑print note (e.g., taxes, terms) */
  note?: string;
  /** Include JSON‑LD Offer */
  jsonLd?: boolean;
  /** Analytics category for gtag */
  analyticsCategory?: string;
  /** className/id passthrough */
  className?: string;
  id?: string;
};

function fmt(v?: number, currency = "USD") {
  if (v == null) return undefined;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
  } catch {
    return `$${v}`;
  }
}

function computeYearly(price: Price, annualDiscountPercent?: number) {
  if (price.yearly != null) return price.yearly;
  if (price.monthly == null) return undefined;
  if (!annualDiscountPercent || annualDiscountPercent <= 0) return Math.round(price.monthly * 12);
  const gross = price.monthly * 12;
  const net = Math.round(gross * (1 - annualDiscountPercent / 100));
  return net;
}

function OfferJsonLd({ price, mode }: { price: Price; mode: "monthly" | "yearly" }) {
  const value = mode === "monthly" ? price.monthly : computeYearly(price);
  if (value == null) return null;
  const data = {
    "@context": "https://schema.org",
    "@type": "Offer",
    price: String(value),
    priceCurrency: price.currency ?? "USD",
    availability: "https://schema.org/InStock",
  } as const;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function PriceBlock({
  price,
  enableBillingToggle = true,
  annualDiscountPercent,
  showSetup = true,
  unitLabel,
  caption,
  badge,
  highlight,
  title,
  primaryCta,
  secondaryCta,
  note,
  jsonLd = false,
  analyticsCategory = "packages",
  className,
  id,
}: PriceBlockProps) {
  const currency = price.currency ?? "USD";
  const hasMonthly = price.monthly != null;
  const computedYearly = computeYearly(price, annualDiscountPercent);
  const hasYearly = computedYearly != null;
  const canToggle = enableBillingToggle && (hasMonthly || hasYearly);

  const [mode, setMode] = React.useState<"monthly" | "yearly">(
    hasMonthly ? "monthly" : "yearly"
  );

  React.useEffect(() => {
    setMode(hasMonthly ? "monthly" : "yearly");
  }, [hasMonthly]);

  const mainValue = mode === "monthly" ? price.monthly : computedYearly;
  const mainLabel = mode === "monthly" ? "/mo" : "/yr";

  const savings = React.useMemo(() => {
    if (mode !== "yearly" || price.monthly == null || computedYearly == null) return undefined;
    const gross = price.monthly * 12;
    const saved = Math.max(0, gross - computedYearly);
    if (saved <= 0) return undefined;
    const pct = Math.round((saved / gross) * 100);
    return { saved, pct };
  }, [mode, price.monthly, computedYearly]);

  const fire = React.useCallback((action: string) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", action, { category: analyticsCategory });
    }
  }, [analyticsCategory]);

  const onToggle = (next: "monthly" | "yearly") => {
    setMode(next);
    fire("price_toggle");
  };

  return (
    <section className={[cls.root, className].filter(Boolean).join(" ")} data-highlight={highlight ? "true" : "false"} id={id}>
      <div className={cls.header}>
        {title && <h3 className={cls.title}>{title}</h3>}
        {badge && <span className={cls.badge}>{badge}</span>}
      </div>

      <div className={cls.priceRow}>
        <div className={cls.amount}>{fmt(mainValue, currency)}</div>
        <div className={cls.freq}>{mainLabel}</div>
        {unitLabel && <div className={cls.unit}>{unitLabel}</div>}
        {canToggle && (
          <div className={cls.toggle} role="tablist" aria-label="Billing period">
            {hasMonthly && (
              <button type="button" role="tab" className={cls.toggleBtn} aria-pressed={mode === "monthly"} aria-selected={mode === "monthly"} onClick={() => onToggle("monthly")}>Monthly</button>
            )}
            {hasYearly && (
              <button type="button" role="tab" className={cls.toggleBtn} aria-pressed={mode === "yearly"} aria-selected={mode === "yearly"} onClick={() => onToggle("yearly")}>Yearly</button>
            )}
          </div>
        )}
      </div>

      {caption && <div className={cls.caption}>{caption}</div>}

      {showSetup && price.oneTime != null && (
        <div className={cls.setupRow}>
          <span className={cls.chip}>Setup {fmt(price.oneTime, currency)}</span>
          {mode === "yearly" && savings && (
            <span className={cls.savings}>Save {fmt(savings.saved, currency)} ({savings.pct}%) vs monthly</span>
          )}
        </div>
      )}

      <div className={cls.separator} />

      {(primaryCta || secondaryCta) && (
        <div className={cls.actions}>
          {primaryCta && (
            <a className={cls.btn} href={primaryCta.href ?? "#"} onClick={() => { fire("price_primary_cta_click"); primaryCta.onClick?.(); }}>{primaryCta.label}</a>
          )}
          {secondaryCta && (
            <a className={[cls.btn, cls.btnSecondary].join(" ")} href={secondaryCta.href ?? "#"} onClick={() => { fire("price_secondary_cta_click"); secondaryCta.onClick?.(); }}>{secondaryCta.label}</a>
          )}
        </div>
      )}

      {note && <div className={cls.note}>{note}</div>}

      {jsonLd && <OfferJsonLd price={{ ...price, yearly: computedYearly ?? price.yearly }} mode={mode} />}
    </section>
  );
}