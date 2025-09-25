// ============================================================================
// /src/data/packages/_types/currency.ts
// ----------------------------------------------------------------------------
// UI-friendly currency formatting for Money. Minimal, framework-agnostic,
// and tolerant of missing/invalid data (falls back to "Contact for pricing").
// ============================================================================

import type { Money } from "./primitives";

const MISSING_LABEL = "Contact for pricing";

/** Normalize to ISO-4217 3-letter code (defaults to USD). */
function norm(code?: string): string {
  const c = (code ?? "USD").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(c) ? c : "USD";
}

function isValidAmount(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && !Number.isNaN(v);
}

/**
 * Format a numeric amount as currency (0 fraction digits).
 * If Intl or the currency code fails, falls back to a very safe `$<rounded>`.
 */
export function formatCurrency(amount: number, currency?: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: norm(currency),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    const fallback = isValidAmount(amount) ? Math.round(amount) : 0;
    return `$${fallback}`;
  }
}

/** Returns `"$X,XXX/month"` or `"Contact for pricing"` when missing/invalid. */
export function toMonthlyPrice(amount?: number | null, currency?: string, locale?: string): string {
  if (!isValidAmount(amount ?? NaN)) return MISSING_LABEL;
  return `${formatCurrency(amount as number, currency, locale)}/month`;
}

/** Returns `"$Y,YYY one-time"` or `"Contact for pricing"` when missing/invalid. */
export function toOneTimePrice(amount?: number | null, currency?: string, locale?: string): string {
  if (!isValidAmount(amount ?? NaN)) return MISSING_LABEL;
  return `${formatCurrency(amount as number, currency, locale)} one-time`;
}

/**
 * Combined label from a Money object:
 * - "$5,000 setup + $2,500/month"
 * - "$5,000 one-time"
 * - "$2,500/month"
 * - "Contact for pricing"
 */
export function toCombinedPrice(m?: Money, locale?: string): string {
  if (!m || (m.oneTime == null && m.monthly == null)) return MISSING_LABEL;

  const { oneTime, monthly, currency } = m;

  const hasOneTime = isValidAmount(oneTime ?? NaN);
  const hasMonthly = isValidAmount(monthly ?? NaN);

  if (hasOneTime && hasMonthly) {
    return `${formatCurrency(oneTime as number, currency, locale)} setup + ${toMonthlyPrice(
      monthly as number,
      currency,
      locale,
    )}`;
  }
  if (hasOneTime) return toOneTimePrice(oneTime as number, currency, locale);
  if (hasMonthly) return toMonthlyPrice(monthly as number, currency, locale);

  return MISSING_LABEL;
}

/** For “from $X,XXX” chips on cards; falls back to “Contact for pricing”. */
export function toStartingPrice(amount?: number | null, currency?: string, locale?: string): string {
  if (!isValidAmount(amount ?? NaN)) return MISSING_LABEL;
  return `from ${formatCurrency(amount as number, currency, locale)}`;
}
