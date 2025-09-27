// src/packages/lib/pricing.ts

/**
 * Lightweight pricing utilities for UI surfaces (cards, detail pages).
 * - No UI imports (avoids circular deps)
 * - Uses your existing currency helpers
 */

import {
  formatCurrency as fmtCurrency,
  toNumber,
  type CurrencyCode,
} from "@/lib/pricing/currency";

/** Canonical money shape used by packages */
export type Money = {
  oneTime?: number | null;    // upfront / implementation fee
  monthly?: number | null;    // recurring fee
  currency?: CurrencyCode;    // default: "USD"
};

/** Legacy shape still seen in older data */
export type LegacyPrice = {
  setup?: number | null;      // same as oneTime
  monthly?: number | null;
  currency?: CurrencyCode;
};

/** Narrow helper: is a finite number */
function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/** Normalize any supported price shape to Money (or undefined if empty) */
export function normalizeMoney(
  price?: Money | LegacyPrice | null
): Money | undefined {
  if (!price || typeof price !== "object") return undefined;

  // Money-like
  if ("oneTime" in price || "monthly" in price) {
    const p = price as Money;
    const oneTime = isFiniteNumber(p.oneTime) ? p.oneTime : toNumber(p.oneTime ?? undefined);
    const monthly = isFiniteNumber(p.monthly) ? p.monthly : toNumber(p.monthly ?? undefined);
    if (!isFiniteNumber(oneTime) && !isFiniteNumber(monthly)) return undefined;
    return {
      oneTime: oneTime ?? undefined,
      monthly: monthly ?? undefined,
      currency: p.currency ?? "USD",
    };
  }

  // Legacy: { setup, monthly }
  const lp = price as LegacyPrice;
  const setup = isFiniteNumber(lp.setup) ? lp.setup : toNumber(lp.setup ?? undefined);
  const monthly = isFiniteNumber(lp.monthly) ? lp.monthly : toNumber(lp.monthly ?? undefined);
  if (!isFiniteNumber(setup) && !isFiniteNumber(monthly)) return undefined;
  return {
    oneTime: setup ?? undefined,
    monthly: monthly ?? undefined,
    currency: lp.currency ?? "USD",
  };
}

/** True when at least one amount exists */
export function hasPrice(p?: Money | null): p is Money {
  return !!p && (isFiniteNumber(p.oneTime) || isFiniteNumber(p.monthly));
}

/**
 * Format an amount with your currency helper, defaulting to:
 * - USD
 * - no cents (0 fraction digits)
 * - non-compact
 */
function formatAmount(
  amount: number,
  currency: CurrencyCode = "USD",
  locale?: string
): string {
  // fmtCurrency returns string | null; ensure we always return a string
  return (
    fmtCurrency(amount, {
      currency,
      locale,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      showSymbol: true,
      compact: false,
    }) ?? `${currency} ${amount.toLocaleString(locale ?? "en-US", { maximumFractionDigits: 0 })}`
  );
}

/**
 * Public-facing teaser string from canonical price.
 * Policy rules:
 * - monthly + oneTime → "Starting at $X/mo + $Y setup"
 * - monthly only      → "Starting at $X/mo"
 * - oneTime only      → "Starting at $Y one-time"
 * - neither           → "" (empty)
 *
 * Note: We only call the upfront fee "setup" when a monthly price is also present.
 */
export function startingAtLabel(
  priceInput?: Money | LegacyPrice | null,
  locale: string = "en-US"
): string {
  const price = normalizeMoney(priceInput);
  if (!price) return "";

  const currency = price.currency ?? "USD";
  const hasMonthly = isFiniteNumber(price.monthly);
  const hasOneTime = isFiniteNumber(price.oneTime);

  if (hasMonthly && hasOneTime) {
    return `Starting at ${formatAmount(price.monthly!, currency, locale)}/mo + ${formatAmount(price.oneTime!, currency, locale)} setup`;
  }
  if (hasMonthly) {
    return `Starting at ${formatAmount(price.monthly!, currency, locale)}/mo`;
  }
  if (hasOneTime) {
    return `Starting at ${formatAmount(price.oneTime!, currency, locale)} one-time`;
  }
  return "";
}

/* Optional convenience re-export (useful in some UIs) */
export { fmtCurrency as formatCurrency };
