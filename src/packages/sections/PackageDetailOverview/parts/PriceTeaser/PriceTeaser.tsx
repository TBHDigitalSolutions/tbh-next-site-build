// src/packages/sections/PackageDetailOverview/parts/PriceTeaser/PriceTeaser.tsx
"use client";

import * as React from "react";
import styles from "./PriceTeaser.module.css";
import type { Money } from "@/packages/lib/types/pricing";
import { formatMoney } from "@/packages/lib/types/pricing";

export type PriceTeaserProps = {
  price?: Money;
  /** Stacked ‘band’ (detail) vs single-line ‘inline’ (cards/rails). */
  mode?: "band" | "inline";
  /** Chip styling for inline mode; hybrids render as two chips when "chip". */
  appearance?: "chip" | "plain";
  /** Show visible “Starting at” label; keep false in band (badge handles it). */
  showLabel?: boolean;
  /** Screen-reader prefix, default "Starting at". */
  ariaLabelPrefix?: string;
  /** Align text block. */
  align?: "start" | "center";
  className?: string;
  style?: React.CSSProperties;
  /** @deprecated — use PriceActionsBand.finePrint instead */
  notes?: string;
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

const PriceTeaser: React.FC<PriceTeaserProps> = ({
  price,
  mode = "band",
  appearance = "plain",
  showLabel = false,
  ariaLabelPrefix = "Starting at",
  align = "center",
  className,
  style,
  // notes deprecated intentionally not rendered (fine print lives in band)
}) => {
  const currency = price?.currency ?? "USD";

  if (!price || (!hasMonthly(price) && !hasOneTime(price))) {
    return null;
  }

  // SR-only sentence (always present for accessibility).
  const sr = isHybrid(price)
    ? `${ariaLabelPrefix} ${formatMoney(price.monthly, currency)} per month plus ${formatMoney(price.oneTime, currency)} setup.`
    : hasMonthly(price)
    ? `${ariaLabelPrefix} ${formatMoney(price.monthly, currency)} per month.`
    : `${ariaLabelPrefix} ${formatMoney(price.oneTime!, currency)}.`;

  // ----- BAND MODE (stacked) -----
  if (mode === "band") {
    return (
      <div
        className={cx(
          styles.root,
          styles.band,
          align === "center" ? styles.alignCenter : styles.alignStart,
          className
        )}
        style={style}
        data-component="PriceTeaser"
        data-mode="band"
      >
        {showLabel ? <div className={styles.labelVis}>Starting at</div> : null}

        {/* Line 1: monthly OR one-time amount */}
        {hasMonthly(price) ? (
          <div className={styles.lineMonthly} aria-hidden="true">
            <span className={styles.amount}>{formatMoney(price.monthly, currency)}</span>
            <span className={styles.suffix}>/mo</span>
          </div>
        ) : (
          <div className={styles.lineMonthly} aria-hidden="true">
            <span className={styles.amount}>{formatMoney(price.oneTime!, currency)}</span>
          </div>
        )}

        {/* Line 2: setup, only when hybrid */}
        {isHybrid(price) ? (
          <div className={styles.lineSetup} aria-hidden="true">
            <span className={styles.plus}>+</span>
            <span className={styles.amount}>{formatMoney(price.oneTime!, currency)}</span>
            <span className={styles.suffix}>setup</span>
          </div>
        ) : null}

        <span className={styles.srOnly}>{sr}</span>
      </div>
    );
  }

  // ----- INLINE MODE (single row; cards/rails) -----
  const inlineChips = appearance === "chip" && isHybrid(price);

  return (
    <div
      className={cx(
        styles.root,
        styles.inline,
        align === "center" ? styles.alignCenter : styles.alignStart,
        className
      )}
      style={style}
      role="text"
      aria-label={sr}
      data-component="PriceTeaser"
      data-mode="inline"
      data-appearance={appearance}
    >
      {showLabel ? <span className={styles.labelInline}>Starting at</span> : null}

      {inlineChips ? (
        <span className={styles.inlineChips} aria-hidden="true">
          <span className={cx(styles.group, styles.chip)}>
            <span className={styles.amount}>{formatMoney(price.monthly, currency)}</span>
            <span className={styles.suffix}>/mo</span>
          </span>
          <span className={styles.gap} />
          <span className={cx(styles.group, styles.chip)}>
            <span className={styles.amount}>{formatMoney(price.oneTime!, currency)}</span>
            <span className={styles.suffix}>setup</span>
          </span>
        </span>
      ) : (
        <span className={styles.inlineText} aria-hidden="true">
          {hasMonthly(price) ? (
            <>
              <span className={styles.amount}>{formatMoney(price.monthly, currency)}</span>
              <span className={styles.suffix}>/mo</span>
              {hasOneTime(price) ? (
                <>
                  <span className={styles.separator}> + </span>
                  <span className={styles.amount}>{formatMoney(price.oneTime, currency)}</span>
                  <span className={styles.suffix}>setup</span>
                </>
              ) : null}
            </>
          ) : (
            <span className={styles.amount}>{formatMoney(price.oneTime!, currency)}</span>
          )}
        </span>
      )}
    </div>
  );
};

export default React.memo(PriceTeaser);