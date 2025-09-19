// /src/data/packages/_types/currency.ts
// UI-friendly formatting helper; keeps currency logic out of data

/**
 * Format a numeric amount as currency string
 * @param amount - Dollar amount as number
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function toMoney(
  amount: number | undefined,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  if (amount === undefined || amount === null) return "Contact for pricing";
  
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format starting price with "from" prefix
 * @param amount - Dollar amount as number
 * @param currency - Currency code (default: USD)
 * @returns Formatted string like "from $2,500"
 */
export function toStartingPrice(
  amount: number | undefined,
  currency: string = "USD"
): string {
  if (amount === undefined || amount === null) return "Contact for pricing";
  return `from ${toMoney(amount, currency)}`;
}

/**
 * Format monthly pricing
 * @param amount - Dollar amount as number
 * @param currency - Currency code (default: USD)
 * @returns Formatted string like "$2,500/month"
 */
export function toMonthlyPrice(
  amount: number | undefined,
  currency: string = "USD"
): string {
  if (amount === undefined || amount === null) return "Contact for pricing";
  return `${toMoney(amount, currency)}/month`;
}

/**
 * Format setup + monthly pricing combination
 * @param setup - One-time setup cost
 * @param monthly - Monthly recurring cost
 * @param currency - Currency code (default: USD)
 * @returns Formatted string like "$5,000 setup + $2,500/month"
 */
export function toCombinedPrice(
  setup: number | undefined,
  monthly: number | undefined,
  currency: string = "USD"
): string {
  if (setup && monthly) {
    return `${toMoney(setup, currency)} setup + ${toMonthlyPrice(monthly, currency)}`;
  }
  if (setup) {
    return `${toMoney(setup, currency)} one-time`;
  }
  if (monthly) {
    return toMonthlyPrice(monthly, currency);
  }
  return "Contact for pricing";
}