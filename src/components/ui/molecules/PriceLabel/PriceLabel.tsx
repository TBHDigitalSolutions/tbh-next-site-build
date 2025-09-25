import * as React from "react";
import styles from "./PriceLabel.module.css";

export type Money = {
  oneTime?: number | null;
  monthly?: number | null;
  currency?: string; // e.g. "USD"
  notes?: string;    // e.g. "Billed annually", "From …"
};

export type PriceLabelProps = {
  /** Preferred source of truth for currency/notes. If undefined or empty, we'll show `contactText`. */
  price?: Money;
  /** Fallbacks if price.currency is absent */
  currency?: string;              // default "USD"
  locale?: string;                // default "en-US"
  /** Text used when no numeric price is provided */
  contactText?: string;           // default "Contact for pricing"
  /** Visual arrangement */
  variant?: "inline" | "block";   // default "inline"
  className?: string;
  style?: React.CSSProperties;
  /** Label customization */
  labels?: {
    monthlySuffix?: string;       // default "/mo"
    oneTimeSuffix?: string;       // default "setup"
    plusSeparator?: string;       // default " + "
  };
};

/**
 * Format a numeric amount into a localized currency string.
 * Defaults to 0 fraction digits (e.g., $1,500) to match most pricing UIs.
 * Override with `options` if needed.
 */
export function formatMoney(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
  options: Intl.NumberFormatOptions = { minimumFractionDigits: 0, maximumFractionDigits: 0 }
): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, ...options }).format(amount);
  } catch {
    // Fallback: naive string if Intl fails or currency invalid.
    const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
    return `${currency} ${rounded.toLocaleString()}`;
  }
}

function buildAriaLabel(
  oneTime: number | null | undefined,
  monthly: number | null | undefined,
  currency: string,
  locale: string,
  labels: Required<NonNullable<PriceLabelProps["labels"]>>
): string {
  const parts: string[] = [];
  if (typeof oneTime === "number") {
    parts.push(`${formatMoney(oneTime, currency, locale)} ${labels.oneTimeSuffix}`);
  }
  if (typeof monthly === "number") {
    parts.push(`${formatMoney(monthly, currency, locale)} per month`);
  }
  return parts.join(" plus ");
}

export const PriceLabel: React.FC<PriceLabelProps> = ({
  price,
  currency = "USD",
  locale = "en-US",
  contactText = "Contact for pricing",
  variant = "inline",
  className,
  style,
  labels
}) => {
  const cfg = {
    monthlySuffix: labels?.monthlySuffix ?? "/mo",
    oneTimeSuffix: labels?.oneTimeSuffix ?? "setup",
    plusSeparator: labels?.plusSeparator ?? " + "
  };

  const hasMonthly = typeof price?.monthly === "number";
  const hasOneTime = typeof price?.oneTime === "number";

  if (!price || (!hasMonthly && !hasOneTime)) {
    return (
      <span className={[styles.root, styles[variant], className].filter(Boolean).join(" ")} style={style}>
        <span className={styles.contact} aria-label={contactText}>{contactText}</span>
        {price?.notes ? <span className={styles.notes}> {price.notes}</span> : null}
      </span>
    );
  }

  const parts: React.ReactNode[] = [];
  const ariaLabel = buildAriaLabel(price.oneTime, price.monthly, price.currency ?? currency, locale, cfg);

  if (hasOneTime) {
    parts.push(
      <span key="ot" className={styles.group}>
        <span className={styles.amount} aria-hidden="true">
          {formatMoney(price!.oneTime as number, price!.currency ?? currency, locale)}
        </span>
        <span className={styles.suffix} aria-hidden="true"> {cfg.oneTimeSuffix}</span>
      </span>
    );
  }

  if (hasOneTime && hasMonthly) {
    parts.push(
      <span key="sep" className={styles.separator} aria-hidden="true">
        {cfg.plusSeparator}
      </span>
    );
  }

  if (hasMonthly) {
    parts.push(
      <span key="mo" className={styles.group}>
        <span className={styles.amount} aria-hidden="true">
          {formatMoney(price!.monthly as number, price!.currency ?? currency, locale)}
        </span>
        <span className={styles.suffix} aria-hidden="true"> {cfg.monthlySuffix}</span>
      </span>
    );
  }

  return (
    <span
      className={[styles.root, styles[variant], className].filter(Boolean).join(" ")}
      style={style}
      aria-label={ariaLabel}
    >
      {parts}
      {price.notes ? <span className={styles.notes}> {price.notes}</span> : null}
    </span>
  );
};

export default PriceLabel;
