// src/components/ui/organisms/PricingTiers/PricingTiers.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./PricingTiers.module.css";

import type {
  TierCard,
  PricingTiersProps,
  BillingPeriod,
} from "./PricingTiers.types";

/**
 * PricingTiers — Production Presenter
 * - Pure UI; assumes display-ready data (normalized by adapters).
 * - A11y-first (labels, roles, keyboardable toggle).
 * - Defensive but silent on bad input (renders nothing when empty).
 * - Small, memoized subcomponents.
 */

/* ============================================================================
 * Utilities
 * ========================================================================== */

function formatMoney(
  amount?: number | null,
  currency = "USD",
  options: { showZero?: boolean; customLabel?: string } = {}
): string {
  if (amount === null || amount === undefined || (!options.showZero && amount === 0)) {
    return options.customLabel || "Custom";
  }
  if (!Number.isFinite(amount) || amount < 0) return options.customLabel || "Custom";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
    const rounded = Math.round((amount as number) * 100) / 100;
    return `${symbol}${rounded.toLocaleString()}`;
  }
}

function pctOff(original?: number, current?: number): number {
  if (
    typeof original === "number" &&
    typeof current === "number" &&
    Number.isFinite(original) &&
    Number.isFinite(current) &&
    original > current &&
    original > 0
  ) {
    return Math.round(((original - current) / original) * 100);
  }
  return 0;
}

/* ============================================================================
 * Feature Icon (✓ / • / ✗) — screen-reader friendly
 * ========================================================================== */

const FeatureIcon: React.FC<{ included?: boolean; className?: string }> = ({
  included,
  className,
}) => {
  const iconClass = clsx(
    styles.icon,
    included === true && styles.included,
    included === false && styles.notIncluded,
    included === undefined && styles.neutral,
    className
  );

  const ariaLabel = included === true ? "Included" : included === false ? "Not included" : "Feature";
  const glyph = included === true ? "✓" : included === false ? "✗" : "•";

  return (
    <span className={iconClass} aria-label={ariaLabel} role="img">
      {glyph}
    </span>
  );
};

/* ============================================================================
 * Pricing Card
 * ========================================================================== */

const PricingCard: React.FC<{ tier: TierCard; className?: string }> = React.memo(
  ({ tier, className }) => {
    const {
      id,
      name,
      badge,
      description,
      price,
      features = [],
      cta,
      highlighted = false,
    } = tier;

    // Defensive: adapters should always provide price; guard just in case
    const amount = price?.amount ?? 0;
    const currency = price?.currency ?? "USD";
    const interval = price?.interval;
    const originalAmount = price?.originalAmount;

    const hasOriginal = typeof originalAmount === "number" && originalAmount > amount;
    const discount = pctOff(originalAmount, amount);
    const priceNowLabel = formatMoney(amount, currency);

    const cardId = `pricing-card-${id}`;
    const featuresId = `features-${id}`;

    return (
      <article
        id={cardId}
        className={clsx(styles.card, highlighted && styles.highlighted, className)}
        aria-labelledby={`${cardId}-title`}
        aria-describedby={description ? `${cardId}-description` : undefined}
        data-testid={`pricing-card-${id}`}
      >
        {badge && (
          <div className={styles.badge} aria-label={`${badge} plan`}>
            {badge}
          </div>
        )}

        <header className={styles.header}>
          <h3 id={`${cardId}-title`} className={styles.name}>
            {name}
          </h3>
          {description && (
            <p id={`${cardId}-description`} className={styles.description}>
              {description}
            </p>
          )}
        </header>

        <div className={styles.priceBlock}>
          {hasOriginal && (
            <div className={styles.priceOriginal} aria-label="Original price">
              {formatMoney(originalAmount, currency)}
            </div>
          )}

          <div className={styles.priceNow} aria-label="Current price">
            <span className={styles.priceValue}>{priceNowLabel}</span>
            {interval && (
              <span
                className={styles.priceInterval}
                aria-label={`per ${interval.replace("/", "")}`}
              >
                {interval}
              </span>
            )}
          </div>

          {discount > 0 && (
            <div className={styles.discount} aria-label={`Discount: Save ${discount}%`}>
              Save {discount}%
            </div>
          )}
        </div>

        {features.length > 0 && (
          <div className={styles.featuresSection}>
            <ul id={featuresId} className={styles.features} aria-label={`Features in ${name}`}>
              {features.map((f) => (
                <li
                  key={f.id}
                  className={clsx(styles.feature, f.included === false && styles.notIncludedFeature)}
                >
                  <FeatureIcon included={f.included} />
                  <span className={styles.featureText}>{f.label}</span>
                  {f.note && (
                    <span className={styles.featureNote} aria-label={`Note: ${f.note}`}>
                      {f.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {cta?.href && cta?.label && (
          <div className={styles.ctaRow}>
            <a
              className={clsx(
                styles.cta,
                cta.variant === "secondary" && styles.ctaSecondary,
                cta.variant === "outline" && styles.ctaOutline
              )}
              href={cta.href}
              target={cta.target ?? "_self"}
              rel={cta.target === "_blank" ? cta.rel ?? "noopener noreferrer" : cta.rel ?? undefined}
              aria-label={`Select ${name} plan — ${cta.label}`}
            >
              {cta.label}
            </a>
          </div>
        )}
      </article>
    );
  }
);
PricingCard.displayName = "PricingCard";

/* ============================================================================
 * Billing Toggle (optional)
 * ========================================================================== */

const BillingToggle: React.FC<{
  currentPeriod: BillingPeriod;
  onPeriodChange: (p: BillingPeriod) => void;
  className?: string;
  disabled?: boolean;
}> = React.memo(({ currentPeriod, onPeriodChange, className, disabled = false }) => {
  const handleKeyDown = (e: React.KeyboardEvent, period: BillingPeriod) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPeriodChange(period);
    }
  };

  return (
    <div
      className={clsx(styles.billingToggle, className)}
      role="radiogroup"
      aria-label="Select billing period"
    >
      <button
        type="button"
        className={clsx(styles.toggleBtn, currentPeriod === "monthly" && styles.active)}
        onClick={() => onPeriodChange("monthly")}
        onKeyDown={(e) => handleKeyDown(e, "monthly")}
        aria-pressed={currentPeriod === "monthly"}
        role="radio"
        aria-checked={currentPeriod === "monthly"}
        disabled={disabled}
      >
        Monthly
      </button>
      <button
        type="button"
        className={clsx(styles.toggleBtn, currentPeriod === "yearly" && styles.active)}
        onClick={() => onPeriodChange("yearly")}
        onKeyDown={(e) => handleKeyDown(e, "yearly")}
        aria-pressed={currentPeriod === "yearly"}
        role="radio"
        aria-checked={currentPeriod === "yearly"}
        disabled={disabled}
      >
        Yearly
      </button>
    </div>
  );
});
BillingToggle.displayName = "BillingToggle";

/* ============================================================================
 * Main Component
 * ========================================================================== */

const PricingTiers: React.FC<PricingTiersProps> = React.memo(
  ({ tiers, layout = "grid", showBillingToggle = false, className, onBillingChange }) => {
    // Early exits (silent/defensive)
    if (!Array.isArray(tiers) || tiers.length === 0) return null;

    // Minimal validation: require id & name
    const validTiers = React.useMemo(
      () => tiers.filter((t) => t && typeof t === "object" && t.id && t.name),
      [tiers]
    );
    if (validTiers.length === 0) return null;

    const [billingPeriod, setBillingPeriod] = React.useState<BillingPeriod>("monthly");

    const handleBillingChange = React.useCallback(
      (period: BillingPeriod) => {
        setBillingPeriod(period);
        onBillingChange?.(period);
      },
      [onBillingChange]
    );

    const sectionId = React.useId();

    return (
      <section
        id={`pricing-tiers-${sectionId}`}
        className={clsx(styles.pricingTiers, className)}
        data-layout={layout}
        aria-label="Pricing plans"
        role="region"
        data-testid="pricing-tiers"
      >
        {/* Live region for SR users */}
        <div className="sr-only" aria-live="polite">
          {validTiers.length} pricing {validTiers.length === 1 ? "plan" : "plans"} available
        </div>

        {showBillingToggle && (
          <BillingToggle
            currentPeriod={billingPeriod}
            onPeriodChange={handleBillingChange}
            className={styles.billingToggleSection}
          />
        )}

        <div className={styles.grid} role="list" aria-label="Pricing options">
          {validTiers.map((tier) => (
            <div key={tier.id} role="listitem" className={styles.gridItem}>
              <PricingCard tier={tier} />
            </div>
          ))}
        </div>

        {/* Keyboard skip target */}
        <a href={`#pricing-tiers-end-${sectionId}`} className={styles.skipLink} aria-label="Skip pricing section">
          Skip to next section
        </a>
        <div id={`pricing-tiers-end-${sectionId}`} />
      </section>
    );
  }
);
PricingTiers.displayName = "PricingTiers";

export default PricingTiers;
export type { PricingTiersProps, BillingPeriod, TierCard };
