// src/packages/lib/pricing.ts
/**
 * Canonical pricing utilities used by cards, detail bands, and labels.
 * - Pure TypeScript (no UI deps)
 * - Token-agnostic (Intl-based formatting)
 * - Exposes named exports + a default object (legacy-safe)
 */

/* --------------------------------- Types ---------------------------------- */

export type CurrencyCode = "USD" | (string & {}); // allow other ISO codes

/** Canonical money shape (SSOT-compatible). */
export type Money = {
  /** Upfront / implementation fee (called "setup" when monthly also exists) */
  oneTime?: number | null;
  /** Recurring fee */
  monthly?: number | null;
  /** ISO 4217 currency code (defaults to "USD" if omitted) */
  currency?: CurrencyCode;
  /** Optional author note; UI layer decides whether to show */
  notes?: string;
};

/** Legacy authoring shape — supported for migration/back-compat safety. */
export type LegacyPrice = {
  /** Maps to Money.oneTime */
  setup?: number | null;
  monthly?: number | null;
  currency?: CurrencyCode;
};

/* -------------------------------- Internals -------------------------------- */

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

/* ----------------------------- Normalization ------------------------------- */

/**
 * Normalize any supported price shape to Money (or undefined if empty).
 * Accepts numbers or numeric strings (coerced).
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

/* -------------------------------- Predicates ------------------------------- */

export function hasPrice(p?: Money | null): p is Money {
  return !!p && (isFiniteNumber(p.oneTime) || isFiniteNumber(p.monthly));
}

export function hasMonthly(
  p?: Money | null
): p is Money & Required<Pick<Money, "monthly">> {
  return !!p && isFiniteNumber(p.monthly);
}

export function hasOneTime(
  p?: Money | null
): p is Money & Required<Pick<Money, "oneTime">> {
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

/* -------------------------------- Formatting ------------------------------- */

/**
 * Format an amount with Intl.NumberFormat.
 * Defaults: USD / en-US / no cents (0 fraction digits).
 */
export function formatMoney(
  amount: number,
  currency: CurrencyCode = "USD",
  locale: string = "en-US",
  options: Intl.NumberFormatOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }
): string {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, ...options }).format(
      amount
    );
  } catch {
    // Fallback if the currency code isn't supported by this runtime.
    const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
    return `${currency} ${rounded.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
  }
}

/**
 * Screen-reader friendly sentence.
 * - hybrid:  "Starting at $X per month plus $Y setup."
 * - monthly: "Starting at $X per month."
 * - oneTime: "Starting at $Y."
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
 * Human-facing teaser string (for compact card rows / legacy one-liners).
 * Policy:
 *  - hybrid   → "Starting at $X/mo + $Y setup"
 *  - monthly  → "Starting at $X/mo"
 *  - one-time → "Starting at $Y one-time"
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

/* ---------------------------- Default export ------------------------------- */
/**
 * Convenience default export so existing code can do:
 *   import pricing from "@/packages/lib/pricing";
 * and call pricing.* helpers while you migrate to named imports.
 */
const pricing = {
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

export default pricing;
