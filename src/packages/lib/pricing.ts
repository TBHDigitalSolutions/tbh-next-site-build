// src/packages/lib/pricing.ts
/**
 * Lightweight pricing utilities for UI surfaces (cards, detail pages).
 * - No UI imports (avoids circular deps)
 * - Token-agnostic; pure formatting + shape helpers
 */

/* --------------------------------- Types --------------------------------- */

export type CurrencyCode = "USD" | (string & {}); // keep open for other ISO codes

/** Canonical money shape used across packages */
export type Money = {
  /** Upfront / implementation fee */
  oneTime?: number | null;
  /** Recurring fee */
  monthly?: number | null;
  /** ISO code; defaults to "USD" when omitted */
  currency?: CurrencyCode;
  /** Optional author note; UI decides whether to show */
  notes?: string;
};

/** Legacy shape still seen in older data (maps to Money) */
export type LegacyPrice = {
  setup?: number | null;
  monthly?: number | null;
  currency?: CurrencyCode;
};

/* ------------------------------- Internals -------------------------------- */

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

/* ----------------------------- Normalization ------------------------------ */

/**
 * Normalize any supported price shape to Money (or undefined if empty).
 */
export function normalizeMoney(
  price?: Money | LegacyPrice | null
): Money | undefined {
  if (!price || typeof price !== "object") return undefined;

  // New-shape Money
  if ("oneTime" in price || "monthly" in price) {
    const p = price as Money;
    const oneTime = coerceNumber(p.oneTime);
    const monthly = coerceNumber(p.monthly);
    if (!isFiniteNumber(oneTime) && !isFiniteNumber(monthly)) return undefined;
    return {
      oneTime,
      monthly,
      currency: p.currency ?? "USD",
      notes: p.notes,
    };
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
  };
}

/* -------------------------------- Predicates ------------------------------ */

export function hasPrice(p?: Money | null): p is Money {
  return !!p && (isFiniteNumber(p.oneTime) || isFiniteNumber(p.monthly));
}
export function hasMonthly(p?: Money | null): p is Money {
  return !!p && isFiniteNumber(p.monthly);
}
export function hasOneTime(p?: Money | null): p is Money {
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

/* ------------------------------ Formatting ------------------------------- */

/**
 * Format an amount with Intl.NumberFormat.
 * Defaults:
 *  - currency: "USD"
 *  - locale: "en-US"
 *  - no cents (0 fraction digits)
 */
export function formatMoney(
  amount: number,
  currency: CurrencyCode = "USD",
  locale: string = "en-US",
  options: Intl.NumberFormatOptions = { minimumFractionDigits: 0, maximumFractionDigits: 0 }
): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, ...options }).format(
      amount
    );
  } catch {
    // ultra-safe fallback
    const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
    return `${currency} ${rounded.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
  }
}

/**
 * Build the canonical "Starting at …" sentence for screen readers.
 * Example:
 *  - monthly + oneTime → "Starting at $X per month plus $Y setup."
 *  - monthly only      → "Starting at $X per month."
 *  - oneTime only      → "Starting at $Y."
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
 * Public-facing teaser string from canonical price.
 * Policy:
 *  - monthly + oneTime → "Starting at $X/mo + $Y setup"
 *  - monthly only      → "Starting at $X/mo"
 *  - oneTime only      → "Starting at $Y one-time"
 *  - neither           → ""
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

/* ---------------------------- Compat / Defaults --------------------------- */

/**
 * Default export contains formatMoney for historical imports that do:
 *   import pricing from "@/packages/lib/pricing";
 *   pricing.formatMoney(...)
 */
const _default = { formatMoney, normalizeMoney, startingAtLabel, srPriceSentence };
export default _default;

/* ------------------------------- Re-exports ------------------------------- */
// Helpful named re-exports if you prefer a “utils barrel” in future.
// export * from "./more-pricing-utils";
