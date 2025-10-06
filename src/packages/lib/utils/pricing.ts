/**
 * Pricing utilities (pure)
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Canonical, framework-agnostic helpers for dealing with package pricing:
 *   - normalize author/runtime shapes to a single `Money` model
 *   - predicates for shape (hybrid / monthly-only / one-time-only)
 *   - human-friendly formatting helpers
 *
 * Design rules
 * -----------------------------------------------------------------------------
 * - Pure TypeScript (safe for server/SSG/RSC).
 * - Consume UI types instead of redefining schemas where possible.
 * - Avoid any UI runtime imports to prevent circular dependencies.
 */

import type { Money, CurrencyCode } from "@/packages/lib/types";

/* =============================================================================
 * Legacy support (if old feeds authored { setup, monthly })
 * ============================================================================= */

export type LegacyPrice = {
  setup?: number | null;   // maps to Money.oneTime
  monthly?: number | null;
  currency?: CurrencyCode;
};

/* =============================================================================
 * Internals
 * ============================================================================= */

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function coerceNumber(n: unknown): number | undefined {
  if (isFiniteNumber(n)) return n;
  if (typeof n === "string" && n.trim() !== "" && !Number.isNaN(Number(n))) {
    return Number(n);
  }
  return undefined;
}

/* =============================================================================
 * Normalization
 * ============================================================================= */

/**
 * Normalize any supported price shape to `Money` (or `undefined` if empty).
 */
export function normalizeMoney(
  price?: Money | LegacyPrice | null
): Money | undefined {
  if (!price || typeof price !== "object") return undefined;

  // New-shape Money (preferred)
  if ("oneTime" in price || "monthly" in price) {
    const p = price as Money;
    const oneTime = coerceNumber((p as any).oneTime);
    const monthly = coerceNumber((p as any).monthly);
    if (!isFiniteNumber(oneTime) && !isFiniteNumber(monthly)) return undefined;
    return {
      oneTime,
      monthly,
      currency: p.currency ?? "USD",
      notes: (p as any).notes,
    } as Money;
  }

  // Legacy: { setup, monthly }
  const lp = price as LegacyPrice;
  const setup = coerceNumber(lp.setup);
  const monthly = coerceNumber(lp.monthly);
  if (!isFiniteNumber(setup) && !isFiniteNumber(monthly)) return undefined;
  return {
    oneTime: setup,
    monthly,
    currency: lp.currency ?? "USD",
  } as Money;
}

/* =============================================================================
 * Predicates
 * ============================================================================= */

export function hasPrice(p?: Money | null): p is Money {
  return !!p && (isFiniteNumber(p.oneTime) || isFiniteNumber(p.monthly));
}

export function hasMonthly(p?: Money | null): p is Money & Required<Pick<Money, "monthly">> {
  return !!p && isFiniteNumber(p.monthly);
}

export function hasOneTime(p?: Money | null): p is Money & Required<Pick<Money, "oneTime">> {
  return !!p && isFiniteNumber(p.oneTime);
}

export function isHybrid(p?: Money | null): p is Money {
  return !!p && isFiniteNumber(p.monthly) && isFiniteNumber(p.oneTime);
}

export function isOneTimeOnly(p?: Money | null): p is Money {
  return !!p && isFiniteNumber(p.oneTime) && !isFiniteNumber(p.monthly);
}

export function isMonthlyOnly(p?: Money | null): p is Money {
  return !!p && isFiniteNumber(p.monthly) && !isFiniteNumber(p.oneTime);
}

/* =============================================================================
 * Formatting
 * ============================================================================= */

/**
 * Format a currency amount with Intl.NumberFormat.
 * Defaults: USD / en-US / no cents (0 fraction digits).
 */
export function formatMoney(
  amount: number,
  currency: CurrencyCode = "USD",
  locale: string = "en-US",
  options: Intl.NumberFormatOptions = { minimumFractionDigits: 0, maximumFractionDigits: 0 }
): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, ...options }).format(amount);
  } catch {
    // Ultra-safe fallback if a nonstandard currency code reaches this runtime.
    const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
    return `${currency} ${rounded.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
  }
}

/**
 * Build the canonical screen-reader sentence:
 * - hybrid         → "Starting at $X per month plus $Y setup."
 * - monthly only   → "Starting at $X per month."
 * - one-time only  → "Starting at $Y."
 */
export function srPriceSentence(
  priceInput?: Money | LegacyPrice | null,
  {
    prefix = "Starting at",
    locale = "en-US",
  }: { prefix?: string; locale?: string } = {}
): string {
  const price = normalizeMoney(priceInput);
  if (!price) return "";

  const c = price.currency ?? "USD";
  if (isHybrid(price)) {
    return `${prefix} ${formatMoney(price.monthly!, c, locale)} per month plus ${formatMoney(
      price.oneTime!,
      c,
      locale
    )} setup.`;
  }
  if (isMonthlyOnly(price)) {
    return `${prefix} ${formatMoney(price.monthly!, c, locale)} per month.`;
  }
  if (isOneTimeOnly(price)) {
    return `${prefix} ${formatMoney(price.oneTime!, c, locale)}.`;
  }
  return "";
}

/**
 * Human-facing teaser:
 * - hybrid         → "Starting at $X/mo + $Y setup"
 * - monthly only   → "Starting at $X/mo"
 * - one-time only  → "Starting at $Y one-time"
 * - neither        → ""
 */
export function startingAtLabel(
  priceInput?: Money | LegacyPrice | null,
  locale: string = "en-US"
): string {
  const price = normalizeMoney(priceInput);
  if (!price) return "";

  const c = price.currency ?? "USD";

  if (isHybrid(price)) {
    return `Starting at ${formatMoney(price.monthly!, c, locale)}/mo + ${formatMoney(
      price.oneTime!,
      c,
      locale
    )} setup`;
  }
  if (isMonthlyOnly(price)) {
    return `Starting at ${formatMoney(price.monthly!, c, locale)}/mo`;
  }
  if (isOneTimeOnly(price)) {
    return `Starting at ${formatMoney(price.oneTime!, c, locale)} one-time`;
  }
  return "";
}

/* =============================================================================
 * Default export (back-compat convenience)
 * ============================================================================= */

const _default = {
  formatMoney,
  normalizeMoney,
  startingAtLabel,
  srPriceSentence,
  hasPrice,
  hasMonthly,
  hasOneTime,
  isHybrid,
  isMonthlyOnly,
  isOneTimeOnly,
};

export default _default;
