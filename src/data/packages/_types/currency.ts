// ============================================================================
// /src/data/packages/_types/currency.ts  (formatters)
// UI-friendly currency formatting for Money. Minimal, framework-agnostic.
// ============================================================================

import type { Money } from "./primitives";

/** Normalize to ISO-4217 3-letter code (defaults to USD). */
function norm(code?: string): string {
  const c = (code ?? "USD").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(c) ? c : "USD";
}

/** Format a numeric amount as currency (0 fraction digits). Safe fallback on Intl errors. */
export function formatCurrency(amount: number, currency?: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: norm(currency),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Very safe fallback if Intl or currency code fails
    return `$${Math.round(amount)}`;
  }
}

/** "$X,XXX/month" or "Contact for pricing" when missing. */
export function toMonthlyPrice(amount?: number | null, currency?: string, locale?: string): string {
  if (amount == null || Number.isNaN(amount)) return "Contact for pricing";
  return `${formatCurrency(amount, currency, locale)}/month`;
}

/** "$Y,YYY one-time" or "Contact for pricing" when missing. */
export function toOneTimePrice(amount?: number | null, currency?: string, locale?: string): string {
  if (amount == null || Number.isNaN(amount)) return "Contact for pricing";
  return `${formatCurrency(amount, currency, locale)} one-time`;
}

/**
 * Combined label from a Money object:
 * - "$5,000 setup + $2,500/month"
 * - "$5,000 one-time"
 * - "$2,500/month"
 * - "Contact for pricing"
 */
export function toCombinedPrice(m?: Money, locale?: string): string {
  if (!m || (m.oneTime == null && m.monthly == null)) return "Contact for pricing";
  const { oneTime, monthly, currency } = m;
  if (oneTime != null && monthly != null) {
    return `${formatCurrency(oneTime, currency, locale)} setup + ${toMonthlyPrice(monthly, currency, locale)}`;
  }
  if (oneTime != null) return toOneTimePrice(oneTime, currency, locale);
  return toMonthlyPrice(monthly!, currency, locale);
}

/** “from $X,XXX” card chip or “Contact for pricing” when amount missing. */
export function toStartingPrice(amount?: number | null, currency?: string, locale?: string): string {
  if (amount == null || Number.isNaN(amount)) return "Contact for pricing";
  return `from ${formatCurrency(amount, currency, locale)}`;
}
