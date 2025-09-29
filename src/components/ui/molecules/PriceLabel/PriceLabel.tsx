// src/components/ui/molecules/PriceLabel/PriceLabel.tsx
"use client";

import * as React from "react";
import styles from "./PriceLabel.module.css";

export type Money = {
  oneTime?: number | null;
  monthly?: number | null;
  currency?: string;
  notes?: string;
};

export type PriceLabelProps = {
  price?: Money;
  currency?: string;
  locale?: string;
  contactText?: string;
  variant?: "inline" | "block";
  appearance?: "chip" | "plain";
  order?: "monthly-first" | "oneTime-first";
  className?: string;
  style?: React.CSSProperties;
  labels?: {
    monthlySuffix?: string;
    oneTimeSuffix?: string;
    plusSeparator?: string;
    setupPrefix?: string;
  };
};

function cx(...parts: Array<string | undefined | null | false>) {
  return parts.filter(Boolean).join(" ");
}

export function formatMoney(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
  options: Intl.NumberFormatOptions = { minimumFractionDigits: 0, maximumFractionDigits: 0 }
): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, ...options }).format(amount);
  } catch {
    const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
    return `${currency} ${rounded.toLocaleString()}`;
  }
}

function buildAriaLabel(
  oneTime: number | null | undefined,
  monthly: number | null | undefined,
  currency: string,
  locale: string,
  monthlySuffixWord: string
): string {
  const parts: string[] = [];
  if (typeof monthly === "number") {
    parts.push(`${formatMoney(monthly, currency, locale)} per ${monthlySuffixWord.replace("/", "")}`);
  }
  if (typeof oneTime === "number") {
    parts.push(`${formatMoney(oneTime, currency, locale)} setup`);
  }
  return parts.join(" plus ");
}

const PriceLabel: React.FC<PriceLabelProps> = ({
  price,
  currency = "USD",
  locale = "en-US",
  contactText = "Contact for pricing",
  variant = "inline",
  appearance = "chip",
  order = "monthly-first",
  className,
  style,
  labels,
}) => {
  const cfg = React.useMemo(
    () => ({
      monthlySuffix: labels?.monthlySuffix ?? "/mo",
      oneTimeSuffix: labels?.oneTimeSuffix ?? "setup",
      plusSeparator: labels?.plusSeparator ?? " + ",
      setupPrefix: labels?.setupPrefix ?? "",
    }),
    [labels]
  );

  const hasMonthly = typeof price?.monthly === "number";
  const hasOneTime = typeof price?.oneTime === "number";

  if (!price || (!hasMonthly && !hasOneTime)) {
    return (
      <span
        className={cx(styles.root, styles[variant], className)}
        style={style}
        role="text"
        aria-label={contactText}
      >
        <span className={styles.contact}>{contactText}</span>
        {price?.notes ? <span className={styles.notes}> {price.notes}</span> : null}
      </span>
    );
  }

  const monthlyNode = hasMonthly ? (
    <span key="mo" className={cx(styles.group, appearance === "chip" && styles.chip)}>
      <span className={styles.amount} aria-hidden="true">
        {formatMoney(price.monthly as number, price.currency ?? currency, locale)}
      </span>
      <span className={styles.suffix} aria-hidden="true">{cfg.monthlySuffix}</span>
    </span>
  ) : null;

  const oneTimeNode = hasOneTime ? (
    <span key="ot" className={cx(styles.group, appearance === "chip" && styles.chip)}>
      <span className={styles.amount} aria-hidden="true">
        {formatMoney(price.oneTime as number, price.currency ?? currency, locale)}
      </span>
      <span className={styles.suffix} aria-hidden="true">{cfg.oneTimeSuffix}</span>
    </span>
  ) : null;

  const renderOrder =
    order === "oneTime-first"
      ? [
          oneTimeNode,
          hasOneTime && hasMonthly ? (
            <span key="sep" className={styles.separator} aria-hidden="true">
              {cfg.plusSeparator}
            </span>
          ) : null,
          monthlyNode,
        ]
      : [
          monthlyNode,
          hasOneTime && hasMonthly ? (
            <span key="sep" className={styles.separator} aria-hidden="true">
              {cfg.plusSeparator}
            </span>
          ) : null,
          oneTimeNode,
        ];

  const ariaLabel = buildAriaLabel(
    price.oneTime,
    price.monthly,
    price.currency ?? currency,
    locale,
    cfg.monthlySuffix
  );

  const rootClass = cx(
    styles.root,
    styles[variant],
    appearance === "chip" ? styles.appearanceChip : styles.appearancePlain,
    className
  );

  return (
    <span
      className={rootClass}
      style={style}
      role="text"
      aria-label={ariaLabel}
      data-component="PriceLabel"
      data-appearance={appearance}
    >
      {renderOrder}
      {price.notes ? <span className={styles.notes}> {price.notes}</span> : null}
    </span>
  );
};

export default React.memo(PriceLabel);
export type { Money, PriceLabelProps };
