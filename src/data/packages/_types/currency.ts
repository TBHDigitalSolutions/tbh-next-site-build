// ============================================================================
// /src/data/packages/_types/currency.ts
// ----------------------------------------------------------------------------
// UI-friendly currency helpers for Money.
// - Robust Intl-based formatting with safe fallbacks
// - Consistent "Starting at …" labels (public price policy)
// - Hybrid display prefers monthly first: "$M/month + $S setup"
// - No framework/runtime coupling; pure TS utilities
// ============================================================================

import type { Money } from "./primitives";

/** Label used when a price is missing/invalid. */
export const MISSING_PRICE_LABEL = "Contact for pricing";

/** Prefix used for public price chips and hero blocks. */
export const STARTING_PREFIX = "Starting at";

/** Normalize to ISO-4217 3-letter code (defaults to USD). */
export function normalizeCurrencyCode(code?: string): string {
  const c = (code ?? "USD").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(c) ? c : "USD";
}

/** True when the value is a finite number. */
export function isValidAmount(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Format a numeric amount as currency.
 * Defaults to 0 fraction digits (prices are author-recorded in whole dollars).
 * If Intl fails, falls back to a very safe "$<rounded>" string.
 */
export function formatCurrency(
  amount: number,
  currency?: string,
  locale?: string,
  fractionDigits = 0
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: normalizeCurrencyCode(currency),
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    const fallback = isValidAmount(amount) ? Math.round(amount) : 0;
    return `$${fallback}`;
  }
}

/** "$X,XXX/month" or the missing label. */
export function toMonthlyPrice(
  amount?: number | null,
  currency?: string,
  locale?: string
): string {
  if (!isValidAmount(amount ?? NaN)) return MISSING_PRICE_LABEL;
  return `${formatCurrency(amount as number, currency, locale)}/month`;
}

/** "$Y,YYY one-time" or the missing label. */
export function toOneTimePrice(
  amount?: number | null,
  currency?: string,
  locale?: string
): string {
  if (!isValidAmount(amount ?? NaN)) return MISSING_PRICE_LABEL;
  return `${formatCurrency(amount as number, currency, locale)} one-time`;
}

/**
 * Hybrid label (monthly first) or single component fallback.
 * Examples:
 *   • "$2,500/month + $5,000 setup"
 *   • "$5,000 one-time"
 *   • "$2,500/month"
 *   • "Contact for pricing"
 */
export function toCombinedPrice(m?: Money, locale?: string): string {
  if (!m || (m.oneTime == null && m.monthly == null)) return MISSING_PRICE_LABEL;

  const { oneTime, monthly, currency } = m;
  const hasMonthly = isValidAmount(monthly ?? NaN);
  const hasOneTime = isValidAmount(oneTime ?? NaN);

  if (hasMonthly && hasOneTime) {
    return `${formatCurrency(monthly as number, currency, locale)}/month + ${formatCurrency(
      oneTime as number,
      currency,
      locale
    )} setup`;
  }
  if (hasMonthly) return toMonthlyPrice(monthly as number, currency, locale);
  if (hasOneTime) return toOneTimePrice(oneTime as number, currency, locale);

  return MISSING_PRICE_LABEL;
}

/**
 * Choose the “starting amount” for chips:
 *   • Prefer monthly when present, else one-time.
 * Returns { amount, kind } or null when neither is present.
 */
export function pickStartingAmount(
  m?: Money
): { amount: number; kind: "monthly" | "oneTime"; currency: string } | null {
  if (!m) return null;
  const currency = normalizeCurrencyCode(m.currency);
  if (isValidAmount(m.monthly)) return { amount: m.monthly!, kind: "monthly", currency };
  if (isValidAmount(m.oneTime)) return { amount: m.oneTime!, kind: "oneTime", currency };
  return null;
}

/**
 * Public chip/hero label per policy:
 *   • "Starting at $X/month"
 *   • "Starting at $Y one-time"
 *   • For hybrid, still prefer the monthly surface: "Starting at $X/month + $Y setup"
 *   • Falls back to "Contact for pricing"
 */
export function toStartingLabel(m?: Money, locale?: string): string {
  const pick = pickStartingAmount(m);
  if (!pick) return MISSING_PRICE_LABEL;

  const { amount, kind, currency } = pick;

  // If hybrid, show both with monthly first.
  const hasBoth =
    isValidAmount(m?.monthly ?? NaN) && isValidAmount(m?.oneTime ?? NaN);

  if (hasBoth) {
    return `${STARTING_PREFIX} ${formatCurrency(m!.monthly!, currency, locale)}/month + ${formatCurrency(
      m!.oneTime!,
      currency,
      locale
    )} setup`;
  }

  if (kind === "monthly") {
    return `${STARTING_PREFIX} ${formatCurrency(amount, currency, locale)}/month`;
  }
  // kind === "oneTime"
  return `${STARTING_PREFIX} ${formatCurrency(amount, currency, locale)} one-time`;
}

/**
 * Back-compat helper used by some cards:
 *   Previously returned "from $X,XXX". We standardize on "Starting at $X,XXX".
 *   Prefer to call toStartingLabel(Money) when possible.
 */
export function toStartingPrice(
  amount?: number | null,
  currency?: string,
  locale?: string
): string {
  if (!isValidAmount(amount ?? NaN)) return MISSING_PRICE_LABEL;
  return `${STARTING_PREFIX} ${formatCurrency(amount as number, currency, locale)}`;
}

/**
 * Split a money label into parts for micro-typography:
 *   -> { prefix, amount, suffix }
 * Examples:
 *   • "Starting at $2,500/month"  => { "Starting at", "$2,500", "/month" }
 *   • "Starting at $5,000 one-time" => { "Starting at", "$5,000", "one-time" }
 *   • Missing -> { "", "Contact for pricing", "" }
 */
export function toStartingLabelParts(m?: Money, locale?: string): {
  prefix: string;
  amount: string;
  suffix: string;
} {
  const label = toStartingLabel(m, locale);
  if (label === MISSING_PRICE_LABEL) {
    return { prefix: "", amount: MISSING_PRICE_LABEL, suffix: "" };
  }
  // Try to isolate the currency chunk and trailing suffix
  // This is heuristic but works well for our formats.
  const m1 = label.replace(`${STARTING_PREFIX} `, "");
  const monthlyIdx = m1.indexOf("/month");
  const oneTimeIdx = m1.indexOf(" one-time");

  if (monthlyIdx > -1) {
    return {
      prefix: STARTING_PREFIX,
      amount: m1.slice(0, monthlyIdx),
      suffix: "/month",
    };
  }
  if (oneTimeIdx > -1) {
    return {
      prefix: STARTING_PREFIX,
      amount: m1.slice(0, oneTimeIdx),
      suffix: "one-time",
    };
  }
  return { prefix: STARTING_PREFIX, amount: m1, suffix: "" };
}

/** Convenience: plain combined label for detail “Price” section. */
export function toDetailPrice(m?: Money, locale?: string): string {
  return toCombinedPrice(m, locale);
}
