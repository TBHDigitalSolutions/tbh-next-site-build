// src/lib/pricing/currency.ts

/**
 * Supported currency codes
 */
export type CurrencyCode = "USD" | "EUR" | "GBP" | "CAD" | "AUD";

/**
 * Currency configuration
 */
export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

/**
 * Default currency configurations
 */
export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", decimals: 2 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "en-EU", decimals: 2 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", decimals: 2 },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", locale: "en-CA", decimals: 2 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU", decimals: 2 },
};

/**
 * Conversion result interface
 */
export interface CurrencyConversionResult {
  value: number;
  formatted: string;
  currency: CurrencyCode;
  original?: {
    value: number;
    currency: CurrencyCode;
  };
}

/**
 * Parsing result interface
 */
export interface CurrencyParsingResult {
  value: number | null;
  currency?: CurrencyCode;
  isValid: boolean;
  errors: string[];
}

/**
 * Converts string or number input to a numeric value
 * Removes all non-numeric characters except decimal points
 */
export function toNumber(v?: string | number | null): number | undefined {
  if (v === null || v === undefined) return undefined;
  
  if (typeof v === "number") {
    return isNaN(v) || !isFinite(v) ? undefined : v;
  }
  
  if (typeof v === "string") {
    // Remove all non-numeric characters except decimal points and minus signs
    const cleaned = v.replace(/[^0-9.-]/g, "");
    
    // Handle multiple decimal points (keep only the first one)
    const parts = cleaned.split(".");
    const normalizedValue = parts.length > 1 
      ? `${parts[0]}.${parts.slice(1).join("")}`
      : cleaned;
    
    const parsed = Number(normalizedValue);
    return isNaN(parsed) || !isFinite(parsed) ? undefined : parsed;
  }
  
  return undefined;
}

/**
 * Enhanced currency parser that extracts both value and currency code
 */
export function parseCurrency(input: string | number): CurrencyParsingResult {
  const errors: string[] = [];
  
  if (typeof input === "number") {
    return {
      value: isNaN(input) || !isFinite(input) ? null : input,
      isValid: !isNaN(input) && isFinite(input),
      errors: isNaN(input) || !isFinite(input) ? ["Invalid number"] : [],
    };
  }
  
  if (typeof input !== "string") {
    return {
      value: null,
      isValid: false,
      errors: ["Input must be a string or number"],
    };
  }
  
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      value: null,
      isValid: false,
      errors: ["Empty input"],
    };
  }
  
  // Detect currency from symbols or codes
  let detectedCurrency: CurrencyCode | undefined;
  let cleanValue = trimmed;
  
  // Check for currency symbols
  for (const [code, config] of Object.entries(CURRENCY_CONFIGS)) {
    if (trimmed.includes(config.symbol)) {
      detectedCurrency = code as CurrencyCode;
      cleanValue = trimmed.replace(new RegExp(`\\${config.symbol}`, "g"), "");
      break;
    }
  }
  
  // Check for currency codes if no symbol found
  if (!detectedCurrency) {
    for (const code of Object.keys(CURRENCY_CONFIGS)) {
      const regex = new RegExp(`\\b${code}\\b`, "i");
      if (regex.test(trimmed)) {
        detectedCurrency = code as CurrencyCode;
        cleanValue = trimmed.replace(regex, "");
        break;
      }
    }
  }
  
  // Parse the numeric value
  const numericValue = toNumber(cleanValue);
  
  if (numericValue === undefined) {
    errors.push("Could not extract numeric value");
    return {
      value: null,
      currency: detectedCurrency,
      isValid: false,
      errors,
    };
  }
  
  if (numericValue < 0) {
    errors.push("Negative currency values are not supported");
  }
  
  return {
    value: numericValue,
    currency: detectedCurrency,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formats a number as currency with proper localization
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options: {
    currency?: CurrencyCode;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSymbol?: boolean;
    compact?: boolean;
  } = {}
): string | null {
  const numericValue = toNumber(value);
  
  if (numericValue === undefined || numericValue === null) {
    return null;
  }
  
  const {
    currency = "USD",
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
    showSymbol = true,
    compact = false,
  } = options;
  
  const config = CURRENCY_CONFIGS[currency];
  const finalLocale = locale || config.locale;
  
  try {
    const formatter = new Intl.NumberFormat(finalLocale, {
      style: showSymbol ? "currency" : "decimal",
      currency: showSymbol ? currency : undefined,
      minimumFractionDigits: minimumFractionDigits ?? (compact ? 0 : config.decimals),
      maximumFractionDigits: maximumFractionDigits ?? (compact ? 0 : config.decimals),
      notation: compact ? "compact" : "standard",
    });
    
    return formatter.format(numericValue);
  } catch (error) {
    // Fallback formatting
    const symbol = showSymbol ? config.symbol : "";
    const decimals = compact ? 0 : (minimumFractionDigits ?? config.decimals);
    return `${symbol}${numericValue.toFixed(decimals)}`;
  }
}

/**
 * Formats currency with sensible defaults for different contexts
 */
export function formatPrice(value: number | string | null | undefined): string | null {
  return formatCurrency(value, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * Formats currency in compact notation (e.g., $1.2K, $1.5M)
 */
export function formatCompactPrice(value: number | string | null | undefined): string | null {
  return formatCurrency(value, {
    compact: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

/**
 * Formats monthly pricing with "/month" suffix
 */
export function formatMonthlyPrice(value: number | string | null | undefined): string | null {
  const formatted = formatPrice(value);
  return formatted ? `${formatted}/month` : null;
}

/**
 * Formats starting price with "Starting at" prefix
 */
export function formatStartingPrice(value: number | string | null | undefined): string | null {
  const formatted = formatPrice(value);
  return formatted ? `Starting at ${formatted}` : null;
}

/**
 * Formats price range (e.g., "$500 - $2,000")
 */
export function formatPriceRange(
  minValue: number | string | null | undefined,
  maxValue: number | string | null | undefined,
  options: { currency?: CurrencyCode; separator?: string } = {}
): string | null {
  const { separator = " - " } = options;
  
  const minFormatted = formatCurrency(minValue, options);
  const maxFormatted = formatCurrency(maxValue, options);
  
  if (minFormatted && maxFormatted) {
    return `${minFormatted}${separator}${maxFormatted}`;
  }
  
  return minFormatted || maxFormatted || null;
}

/**
 * Calculates and formats savings percentage
 */
export function formatSavingsPercentage(
  originalPrice: number | string | null | undefined,
  salePrice: number | string | null | undefined
): string | null {
  const original = toNumber(originalPrice);
  const sale = toNumber(salePrice);
  
  if (!original || !sale || original <= sale) {
    return null;
  }
  
  const savings = ((original - sale) / original) * 100;
  return `${Math.round(savings)}% off`;
}

/**
 * Validates if a value represents a valid monetary amount
 */
export function isValidPrice(value: any): boolean {
  const parsed = toNumber(value);
  return parsed !== undefined && parsed >= 0 && parsed < Number.MAX_SAFE_INTEGER;
}

/**
 * Converts between currencies (requires exchange rates)
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  exchangeRates: Record<string, number>
): CurrencyConversionResult | null {
  if (fromCurrency === toCurrency) {
    return {
      value: amount,
      formatted: formatCurrency(amount, { currency: toCurrency }) || "",
      currency: toCurrency,
    };
  }
  
  const rateKey = `${fromCurrency}_${toCurrency}`;
  const rate = exchangeRates[rateKey];
  
  if (!rate || rate <= 0) {
    return null;
  }
  
  const convertedValue = amount * rate;
  const formatted = formatCurrency(convertedValue, { currency: toCurrency });
  
  return {
    value: convertedValue,
    formatted: formatted || "",
    currency: toCurrency,
    original: {
      value: amount,
      currency: fromCurrency,
    },
  };
}

/**
 * Utility to normalize price objects with setup and monthly values
 */
export interface PriceObject {
  setup?: number | string | null;
  monthly?: number | string | null;
  currency?: CurrencyCode;
}

export function normalizePriceObject(price: PriceObject | null | undefined): {
  setup: number | null;
  monthly: number | null;
  currency: CurrencyCode;
} {
  if (!price || typeof price !== "object") {
    return { setup: null, monthly: null, currency: "USD" };
  }
  
  return {
    setup: toNumber(price.setup) ?? null,
    monthly: toNumber(price.monthly) ?? null,
    currency: price.currency ?? "USD",
  };
}

/**
 * Formats a price object with both setup and monthly values
 */
export function formatPriceObject(
  price: PriceObject | null | undefined,
  options: { showLabels?: boolean; separator?: string } = {}
): string | null {
  const { showLabels = true, separator = " + " } = options;
  const normalized = normalizePriceObject(price);
  
  const parts: string[] = [];
  
  if (normalized.setup) {
    const setupFormatted = formatCurrency(normalized.setup, { currency: normalized.currency });
    if (setupFormatted) {
      parts.push(showLabels ? `${setupFormatted} setup` : setupFormatted);
    }
  }
  
  if (normalized.monthly) {
    const monthlyFormatted = formatMonthlyPrice(normalized.monthly);
    if (monthlyFormatted) {
      parts.push(monthlyFormatted);
    }
  }
  
  return parts.length > 0 ? parts.join(separator) : null;
}

/**
 * Development helper to log currency parsing results
 */
export function devLogCurrencyParsing(input: any, context: string = "unknown"): void {
  if (process.env.NODE_ENV !== "development") return;
  
  const result = parseCurrency(input);
  
  if (!result.isValid) {
    console.group(`🚨 Currency Parsing Error in ${context}`);
    console.error("Input:", input);
    console.error("Errors:", result.errors);
    console.groupEnd();
  } else if (result.value !== null) {
    console.log(`💰 ${context}: Parsed "${input}" as ${formatCurrency(result.value, { currency: result.currency })}`);
  }
}

/**
 * Type guard for PriceObject
 */
export function isPriceObject(obj: any): obj is PriceObject {
  return obj && typeof obj === "object" && 
    (obj.setup !== undefined || obj.monthly !== undefined);
}

/**
 * Default export for backwards compatibility
 */
export default toNumber;