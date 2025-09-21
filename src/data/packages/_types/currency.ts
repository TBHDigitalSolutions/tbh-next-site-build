// /src/data/packages/_types/currency.ts
// UI-friendly currency formatting helpers for data presentation.
// Keep runtime logic minimal and framework-agnostic.

/** Uppercase a currency code and fall back to "USD" when invalid. */
function normalizeCurrencyCode(code?: string): string {
  const c = (code ?? "USD").trim().toUpperCase();
  return /^[A-Z]{3,}$/.test(c) ? c : "USD";
}

/**
 * Format a numeric amount as a localized currency string (0 fraction digits).
 * Returns "Contact for pricing" when amount is nullish.
 */
export function toMoney(
  amount: number | null | undefined,
  currency: string = "USD",
  locale?: string
): string {
  if (amount == null || Number.isNaN(amount)) return "Contact for pricing";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: normalizeCurrencyCode(currency),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Very safe fallback
    return `$${Math.round(amount)}`;
  }
}

/**
 * Format starting price with "from" prefix (e.g., "from $2,500").
 */
export function toStartingPrice(
  amount: number | null | undefined,
  currency: string = "USD",
  locale?: string
): string {
  if (amount == null || Number.isNaN(amount)) return "Contact for pricing";
  return `from ${toMoney(amount, currency, locale)}`;
}

/**
 * Format monthly pricing (e.g., "$2,500/month").
 */
export function toMonthlyPrice(
  amount: number | null | undefined,
  currency: string = "USD",
  locale?: string
): string {
  if (amount == null || Number.isNaN(amount)) return "Contact for pricing";
  return `${toMoney(amount, currency, locale)}/month`;
}

/**
 * Format setup + monthly combination:
 * - "$5,000 setup + $2,500/month"
 * - "$5,000 one-time"
 * - "$2,500/month"
 * - "Contact for pricing"
 */
export function toCombinedPrice(
  setup: number | null | undefined,
  monthly: number | null | undefined,
  currency: string = "USD",
  locale?: string
): string {
  const hasSetup = setup != null && !Number.isNaN(setup);
  const hasMonthly = monthly != null && !Number.isNaN(monthly);

  if (hasSetup && hasMonthly) {
    return `${toMoney(setup!, currency, locale)} setup + ${toMonthlyPrice(monthly!, currency, locale)}`;
  }
  if (hasSetup) return `${toMoney(setup!, currency, locale)} one-time`;
  if (hasMonthly) return toMonthlyPrice(monthly!, currency, locale);
  return "Contact for pricing";
}