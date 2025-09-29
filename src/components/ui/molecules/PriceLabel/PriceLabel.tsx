// src/components/ui/molecules/PriceLabel/PriceLabel.tsx
"use client";

import * as React from "react";
import styles from "./PriceLabel.module.css";
import type { Money } from "@/packages/lib/pricing";
import { formatMoney } from "@/packages/lib/pricing";

export type PriceLabelProps = {
  price?: Money;
  currency?: string;
  locale?: string;
  /** Visual flow; cards use "inline". */
  variant?: "inline" | "block";
  /** Chips vs plain text; cards typically use "chip" for hybrids. */
  appearance?: "chip" | "plain";
  /** Order of parts when hybrid. */
  order?: "monthly-first" | "oneTime-first";
  /** Optional copy tweaks. */
  labels?: {
    monthlySuffix?: string;   // default "/mo"
    oneTimeSuffix?: string;   // default "setup" if hybrid; otherwise "" for one-time only
    plusSeparator?: string;   // default " + "
  };
  /** Shown when price is missing. */
  contactText?: string;
  className?: string;
  style?: React.CSSProperties;
};

const cx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");

function hasMonthly(p?: Money): p is Required<Pick<Money, "monthly">> & Money {
  return !!(p && typeof p.monthly === "number");
}
function hasOneTime(p?: Money): p is Required<Pick<Money, "oneTime">> & Money {
  return !!(p && typeof p.oneTime === "number");
}
function isHybrid(p?: Money) {
  return hasMonthly(p) && hasOneTime(p);
}

function buildAria(
  price: Money,
  currency: string,
  monthlySuffixText: string,
  oneTimeSuffixText: string
) {
  if (isHybrid(price)) {
    const monthly = `${formatMoney(price.monthly!, currency)} per ${monthlySuffixText.replace("/", "") || "month"}`;
    const setup = `${formatMoney(price.oneTime!, currency)} ${oneTimeSuffixText || "setup"}`;
    return `${monthly} plus ${setup}`;
  }
  if (hasMonthly(price)) {
    return `${formatMoney(price.monthly!, currency)} per ${monthlySuffixText.replace("/", "") || "month"}`;
  }
  return `${formatMoney(price.oneTime!, currency)}`;
}

const PriceLabel: React.FC<PriceLabelProps> = ({
  price,
  currency = price?.currency ?? "USD",
  locale = "en-US",
  variant = "inline",
  appearance = "chip",
  order = "monthly-first",
  labels,
  contactText = "Contact for pricing",
  className,
  style,
}) => {
  const cfg = React.useMemo(() => {
    const hybrid = isHybrid(price);
    return {
      monthlySuffix: labels?.monthlySuffix ?? "/mo",
      oneTimeSuffix: labels?.oneTimeSuffix ?? (hybrid ? "setup" : ""),
      plusSeparator: labels?.plusSeparator ?? " + ",
    };
  }, [labels, price]);

  // Missing price → contact text (no [object Object])
  if (!price || (!hasMonthly(price) && !hasOneTime(price))) {
    return (
      <span
        className={cx(styles.root, styles[variant], styles.appearancePlain, className)}
        style={style}
        role="text"
        aria-label={contactText}
        data-component="PriceLabel"
        data-appearance="plain"
      >
        <span className={styles.contact}>{contactText}</span>
      </span>
    );
  }

  const monthlyNode = hasMonthly(price) ? (
    <span key="mo" className={cx(styles.group, appearance === "chip" && styles.chip)} aria-hidden="true">
      <span className={styles.amount}>{formatMoney(price.monthly!, currency, locale)}</span>
      {cfg.monthlySuffix ? <span className={styles.suffix}>{cfg.monthlySuffix}</span> : null}
    </span>
  ) : null;

  const oneTimeNode = hasOneTime(price) ? (
    <span key="ot" className={cx(styles.group, appearance === "chip" && styles.chip)} aria-hidden="true">
      <span className={styles.amount}>{formatMoney(price.oneTime!, currency, locale)}</span>
      {cfg.oneTimeSuffix ? <span className={styles.suffix}>{cfg.oneTimeSuffix}</span> : null}
    </span>
  ) : null;

  const needsPlus = hasMonthly(price) && hasOneTime(price);
  const ordered = order === "oneTime-first"
    ? [oneTimeNode, needsPlus && <span key="sep" className={styles.separator} aria-hidden="true">{cfg.plusSeparator}</span>, monthlyNode]
    : [monthlyNode, needsPlus && <span key="sep" className={styles.separator} aria-hidden="true">{cfg.plusSeparator}</span>, oneTimeNode];

  const aria = buildAria(price, currency, cfg.monthlySuffix, cfg.oneTimeSuffix);

  return (
    <span
      className={cx(
        styles.root,
        styles[variant],
        appearance === "chip" ? styles.appearanceChip : styles.appearancePlain,
        className
      )}
      style={style}
      role="text"
      aria-label={aria}
      data-component="PriceLabel"
      data-appearance={appearance}
    >
      {ordered}
      {/* Intentionally do not render price.notes here when used inside band */}
    </span>
  );
};

export default React.memo(PriceLabel);
export type { Money, PriceLabelProps };