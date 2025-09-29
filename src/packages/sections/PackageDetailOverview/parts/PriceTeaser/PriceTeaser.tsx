// src/packages/sections/PackageDetailOverview/parts/PriceTeaser/PriceTeaser.tsx
"use client";

import * as React from "react";
import styles from "./PriceTeaser.module.css";

export type Money = {
  monthly?: number | null;
  oneTime?: number | null;
  currency?: string;
};

export type PriceTeaserProps = {
  /** Canonical price. Renders null if neither monthly nor oneTime provided. */
  price?: Money;

  /** Layout mode: "band" = stacked amounts; "inline" = label + amount on one line. */
  mode?: "band" | "inline"; // default "band"

  /** Show visible “Starting at” label (kept off by default for band mode, on for inline). */
  showLabel?: boolean;

  /** Visual density. */
  size?: "sm" | "md"; // default "md"

  /** Align the block horizontally. */
  align?: "start" | "center" | "end"; // default "start"

  /** Subtle background/emphasis chip treatment. */
  emphasis?: boolean;

  /** @deprecated — fine print now lives in PriceActionsBand; kept for extreme back-compat (not rendered). */
  notes?: string;

  /** @deprecated — label text is computed; not used. */
  label?: string;

  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
};

function hasMonthly(p?: Money) {
  return typeof p?.monthly === "number";
}

function hasOneTime(p?: Money) {
  return typeof p?.oneTime === "number";
}

function isHybrid(p?: Money) {
  return hasMonthly(p) && hasOneTime(p);
}

function fmt(n: number | null | undefined, currency = "USD", locale = "en-US") {
  if (typeof n !== "number") return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
}

export default function PriceTeaser({
  price,
  mode = "band",
  showLabel,
  size = "md",
  align = "start",
  emphasis = false,
  // deprecated props intentionally accepted but unused:
  notes: _notes,
  label: _label,
  className,
  style,
  "data-testid": testId,
}: PriceTeaserProps) {
  const hasPrice = hasMonthly(price) || hasOneTime(price);
  if (!hasPrice) return null;

  const currency = price?.currency ?? "USD";
  const monthly = hasMonthly(price) ? fmt(price?.monthly, currency) : "";
  const oneTime = hasOneTime(price) ? fmt(price?.oneTime, currency) : "";

  const alignClass =
    align === "center" ? styles.alignCenter : align === "end" ? styles.alignEnd : styles.alignStart;
  const sizeClass = size === "sm" ? styles.sizeSm : styles.sizeMd;

  // default visible label behavior per mode
  const labelVisible = typeof showLabel === "boolean" ? showLabel : mode === "inline";

  // a11y sentence always present
  const srSentence = isHybrid(price)
    ? `Starting at ${monthly} per month plus ${oneTime} setup.`
    : hasMonthly(price)
    ? `Starting at ${monthly} per month.`
    : `Starting at ${oneTime} one-time.`;

  if (mode === "inline") {
    // Inline: used by one-time detail variant (also works for monthly-only)
    const amount = hasMonthly(price) ? `${monthly}` : `${oneTime}`;
    const suffix = hasMonthly(price) ? "/mo" : hasOneTime(price) ? " one-time" : "";
    return (
      <div
        className={[
          styles.wrap,
          styles.inline,
          alignClass,
          sizeClass,
          emphasis ? styles.emphasis : undefined,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        role="group"
        aria-label="Price teaser"
        data-testid={testId ?? "price-teaser"}
      >
        {labelVisible && <span className={styles.label}>Starting at:</span>}
        <span className={styles.amount} aria-hidden="true">
          {amount}
        </span>
        {suffix && (
          <span className={styles.suffix} aria-hidden="true">
            {suffix}
          </span>
        )}
        <span className={styles.srOnly}>{srSentence}</span>
      </div>
    );
  }

  // BAND MODE (default) — stacked lines for hybrid, single line for monthly-only or one-time.
  return (
    <div
      className={[
        styles.wrap,
        styles.band,
        alignClass,
        sizeClass,
        emphasis ? styles.emphasis : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role="group"
      aria-label="Price teaser"
      data-testid={testId ?? "price-teaser"}
    >
      {labelVisible && <span className={styles.label}>Starting at</span>}

      {/* Primary line(s) */}
      {hasMonthly(price) && (
        <div className={styles.monthlyLine} aria-hidden="true">
          <span className={styles.amount}>{monthly}</span>
          <span className={styles.suffix}>/mo</span>
        </div>
      )}

      {isHybrid(price) && (
        <div className={styles.setupLine} aria-hidden="true">
          + {oneTime} <span className={styles.setupWord}>setup</span>
        </div>
      )}

      {!hasMonthly(price) && hasOneTime(price) && (
        <div className={styles.oneTimeLine} aria-hidden="true">
          <span className={styles.amount}>{oneTime}</span>
          <span className={styles.suffix}> one-time</span>
        </div>
      )}

      <span className={styles.srOnly}>{srSentence}</span>
    </div>
  );
}
