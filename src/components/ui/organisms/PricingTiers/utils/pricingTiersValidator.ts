// src/components/ui/organisms/PricingTiers/utils/pricingTiersValidator.ts

/**
 * Production-Ready Validators + Normalizers for PricingTiers
 * ----------------------------------------------------------
 * Runtime validation with migration support, friendly errors, and zero dependencies.
 * - Accepts flexible inputs (arrays, objects, legacy formats)
 * - Provides migration warnings for legacy data
 * - Strict validation with graceful fallbacks
 * - Comprehensive error reporting with suggestions
 * - Performance optimized with caching
 */

import type {
  TierCard,
  TierFeature,
  TierPrice,
  TierCta,
  TierCardInput,
  LegacyTierData,
  LegacyPricingFeature,
  PricingTiersSection,
  PricingTiersDisplayOptions,
  ValidationResult,
  ValidationWarningResult,
  ValidationError,
  ValidationErrorType,
  ValidationContext,
  PricingTiersValidator,
  PricingTiersTransformer,
  ServiceTypeKey,
} from "../PricingTiers.types";

/* ============================================================
 * Enhanced type guards & helpers
 * ============================================================
 */

const isString = (x: unknown): x is string => typeof x === "string";
const isFiniteNumber = (x: unknown): x is number =>
  typeof x === "number" && Number.isFinite(x);
const isBool = (x: unknown): x is boolean => typeof x === "boolean";
const isObj = (x: unknown): x is Record<string, unknown> =>
  !!x && typeof x === "object" && !Array.isArray(x);

const nonEmpty = (s: unknown): s is string => isString(s) && s.trim().length > 0;

const uniqBy = <T, K extends string | number>(arr: T[], key: (v: T) => K): T[] => {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const v of arr) {
    const k = key(v);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(v);
    }
  }
  return out;
};

/** Parse price strings like "$8,500", "Custom", etc. */
const parsePrice = (input: unknown): number | undefined => {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string") {
    const cleaned = input.replace(/[^0-9.]/g, "");
    const num = parseFloat(cleaned);
    return Number.isFinite(num) && num >= 0 ? num : undefined;
  }
  return undefined;
};

/** Check if price indicates custom/variable pricing */
const isCustomPrice = (input: unknown): boolean => {
  if (typeof input === "string") {
    const lower = input.toLowerCase();
    return lower.includes("custom") || lower.includes("quote") || 
           lower.includes("contact") || lower.includes("call");
  }
  return false;
};

/* ============================================================
 * Enhanced validation with error details
 * ============================================================
 */

const createValidationError = (
  type: ValidationErrorType,
  message: string,
  field?: string,
  suggestion?: string
): ValidationError => ({
  type,
  message,
  field,
  suggestion,
});

const isTierPrice = (x: unknown, context?: ValidationContext): { valid: boolean; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  
  if (!isObj(x)) {
    return { 
      valid: false, 
      errors: [createValidationError("invalid_data_type", "Price must be an object", "price")]
    };
  }

  const price = x as TierPrice;
  
  // Amount validation - more flexible for migration
  if (price.amount !== undefined) {
    const parsedAmount = parsePrice(price.amount);
    if (parsedAmount === undefined && !isCustomPrice(String(price.amount))) {
      errors.push(createValidationError(
        "invalid_data_type", 
        `Invalid price amount: ${price.amount}`,
        "price.amount",
        "Use a number or 'Custom' for variable pricing"
      ));
    }
  }

  // Original amount validation
  if (price.originalAmount !== undefined) {
    const parsedOriginal = parsePrice(price.originalAmount);
    if (parsedOriginal === undefined) {
      errors.push(createValidationError(
        "invalid_data_type",
        `Invalid original amount: ${price.originalAmount}`,
        "price.originalAmount"
      ));
    }
  }

  // Currency validation
  if (price.currency !== undefined && (!isString(price.currency) || price.currency.trim().length === 0)) {
    errors.push(createValidationError(
      "invalid_data_type",
      "Currency must be a non-empty string",
      "price.currency",
      "Use ISO currency codes like 'USD', 'EUR'"
    ));
  }

  // Interval validation
  if (price.interval !== undefined && !isString(price.interval)) {
    errors.push(createValidationError(
      "invalid_data_type",
      "Interval must be a string",
      "price.interval",
      "Use values like '/mo', '/yr', '/project'"
    ));
  }

  return { valid: errors.length === 0, errors };
};

const isTierFeature = (x: unknown, index?: number): { valid: boolean; errors: ValidationError[]; feature?: TierFeature } => {
  const errors: ValidationError[] = [];
  const fieldPrefix = `features[${index ?? 0}]`;
  
  // Handle string features (legacy support)
  if (typeof x === "string" && x.trim().length > 0) {
    return {
      valid: true,
      errors: [],
      feature: {
        id: `feature-${index ?? 0}`,
        label: x.trim(),
        included: true,
      }
    };
  }

  if (!isObj(x)) {
    return {
      valid: false,
      errors: [createValidationError(
        "invalid_data_type",
        "Feature must be a string or object",
        fieldPrefix
      )]
    };
  }

  const feature = x as any;
  
  // ID validation - flexible for legacy data
  let id = feature.id || feature.key || feature.slug;
  if (!id) {
    id = `feature-${index ?? 0}`;
  } else if (!nonEmpty(String(id))) {
    errors.push(createValidationError(
      "invalid_data_type",
      "Feature ID must be non-empty",
      `${fieldPrefix}.id`
    ));
  }

  // Label validation - support multiple field names
  const label = feature.label || feature.name || feature.title || feature.text;
  if (!nonEmpty(label)) {
    errors.push(createValidationError(
      "missing_required_field",
      "Feature label is required",
      `${fieldPrefix}.label`,
      "Provide label, name, title, or text field"
    ));
  }

  // Included validation - support multiple field names
  let included: boolean | undefined;
  if (feature.included !== undefined) {
    included = !!feature.included;
  } else if (feature.available !== undefined) {
    included = !!feature.available;
  }

  // Note validation - support multiple field names
  const note = feature.note || feature.description || feature.hint || feature.tooltip || feature.highlight;

  return {
    valid: errors.length === 0,
    errors,
    feature: errors.length === 0 ? {
      id: String(id).trim(),
      label: label.trim(),
      included,
      note: note ? String(note).trim() : undefined,
    } : undefined
  };
};

const isTierCta = (x: unknown): { valid: boolean; errors: ValidationError[]; cta?: TierCta } => {
  const errors: ValidationError[] = [];
  
  if (!isObj(x)) {
    return {
      valid: false,
      errors: [createValidationError("invalid_data_type", "CTA must be an object", "cta")]
    };
  }

  const cta = x as any;
  
  // Label validation - support multiple field names
  const label = cta.label || cta.ctaText;
  if (!nonEmpty(label)) {
    errors.push(createValidationError(
      "missing_required_field",
      "CTA label is required",
      "cta.label",
      "Provide label or ctaText field"
    ));
  }

  // Href validation - support multiple field names  
  const href = cta.href || cta.ctaLink;
  if (!nonEmpty(href)) {
    errors.push(createValidationError(
      "missing_required_field",
      "CTA href is required",
      "cta.href",
      "Provide href or ctaLink field"
    ));
  }

  // Target validation
  const target = cta.target;
  if (target !== undefined && target !== "_self" && target !== "_blank") {
    errors.push(createValidationError(
      "invalid_data_type",
      `Invalid target: ${target}`,
      "cta.target",
      "Use '_self' or '_blank'"
    ));
  }

  // Variant validation - support ctaType mapping
  let variant = cta.variant;
  if (!variant && cta.ctaType) {
    variant = cta.ctaType === "secondary" ? "secondary" : "primary";
  }
  if (variant && !["primary", "secondary", "outline"].includes(variant)) {
    errors.push(createValidationError(
      "invalid_data_type",
      `Invalid variant: ${variant}`,
      "cta.variant",
      "Use 'primary', 'secondary', or 'outline'"
    ));
  }

  return {
    valid: errors.length === 0,
    errors,
    cta: errors.length === 0 ? {
      label: label.trim(),
      href: href.trim(),
      target: target || "_self",
      rel: cta.rel ? String(cta.rel).trim() : undefined,
      variant: variant || "primary",
    } : undefined
  };
};

/* ============================================================
 * Enhanced TierCard validation with legacy support
 * ============================================================
 */

export const isTierCard = (x: unknown, context?: ValidationContext): x is TierCard => {
  if (!isObj(x)) return false;
  
  const result = validateTierCard(x, context);
  return result.valid;
};

const validateTierCard = (
  x: unknown, 
  context?: ValidationContext
): { valid: boolean; errors: ValidationError[]; warnings: string[]; tierCard?: TierCard } => {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  
  if (!isObj(x)) {
    return {
      valid: false,
      errors: [createValidationError("invalid_data_type", "Tier must be an object")],
      warnings: [],
    };
  }

  const tier = x as any;
  
  // ID validation
  const id = tier.id;
  if (!nonEmpty(String(id))) {
    errors.push(createValidationError(
      "missing_required_field",
      "Tier ID is required",
      "id"
    ));
  }

  // Name validation
  const name = tier.name;
  if (!nonEmpty(name)) {
    errors.push(createValidationError(
      "missing_required_field",
      "Tier name is required", 
      "name"
    ));
  }

  // Price validation - enhanced for legacy formats
  let normalizedPrice: TierPrice;
  if (tier.price && typeof tier.price === "object") {
    const priceResult = isTierPrice(tier.price, context);
    if (!priceResult.valid) {
      errors.push(...priceResult.errors);
    }
    normalizedPrice = tier.price;
  } else {
    // Handle legacy price formats
    const monthlyPrice = parsePrice(tier.monthlyPrice || tier.price);
    const yearlyPrice = parsePrice(tier.yearlyPrice);
    const originalMonthly = parsePrice(tier.originalMonthlyPrice);
    const originalYearly = parsePrice(tier.originalYearlyPrice);
    
    if (monthlyPrice === undefined && yearlyPrice === undefined && !isCustomPrice(String(tier.price))) {
      errors.push(createValidationError(
        "missing_required_field",
        "Valid price is required",
        "price",
        "Provide monthlyPrice, yearlyPrice, or price field"
      ));
    }

    normalizedPrice = {
      amount: monthlyPrice,
      currency: tier.currency || "USD",
      interval: tier.period ? `/${tier.period}` : "/mo",
      originalAmount: originalMonthly,
    };

    if (tier.monthlyPrice !== undefined || tier.yearlyPrice !== undefined) {
      warnings.push("Legacy price format detected - consider migrating to canonical TierPrice format");
    }
  }

  // Features validation - support multiple formats
  const normalizedFeatures: TierFeature[] = [];
  if (tier.features && Array.isArray(tier.features)) {
    tier.features.forEach((feature: any, index: number) => {
      const featureResult = isTierFeature(feature, index);
      if (!featureResult.valid) {
        errors.push(...featureResult.errors);
      } else if (featureResult.feature) {
        normalizedFeatures.push(featureResult.feature);
      }
    });
  }

  // CTA validation - support multiple formats
  let normalizedCta: TierCta | undefined;
  if (tier.cta) {
    const ctaResult = isTierCta(tier.cta);
    if (!ctaResult.valid) {
      errors.push(...ctaResult.errors);
    } else {
      normalizedCta = ctaResult.cta;
    }
  } else if (tier.ctaText || tier.ctaLink) {
    // Handle legacy CTA format
    const ctaResult = isTierCta({
      label: tier.ctaText,
      href: tier.ctaLink,
      variant: tier.ctaType,
    });
    if (ctaResult.valid && ctaResult.cta) {
      normalizedCta = ctaResult.cta;
      warnings.push("Legacy CTA format detected - consider migrating to canonical TierCta format");
    }
  }

  // Badge validation
  const badge = tier.badge;
  if (badge !== undefined && !isString(badge)) {
    errors.push(createValidationError(
      "invalid_data_type",
      "Badge must be a string",
      "badge"
    ));
  }

  // Description validation - support multiple field names
  const description = tier.description || tier.idealFor;
  if (description !== undefined && !isString(description)) {
    errors.push(createValidationError(
      "invalid_data_type",
      "Description must be a string",
      "description"
    ));
  }

  // Highlighted validation - support multiple field names
  const highlighted = tier.highlighted || tier.featured || tier.popular;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    tierCard: errors.length === 0 ? {
      id: String(id).trim(),
      name: name.trim(),
      badge: badge ? String(badge).trim() : undefined,
      description: description ? String(description).trim() : undefined,
      price: normalizedPrice,
      features: normalizedFeatures.length > 0 ? normalizedFeatures : undefined,
      cta: normalizedCta,
      highlighted: !!highlighted,
    } : undefined,
  };
};

/* ============================================================
 * Enhanced normalization functions
 * ============================================================
 */

export const normalizePrice = (p: TierPrice): TierPrice => {
  const amount = parsePrice(p.amount);
  const originalAmount = parsePrice(p.originalAmount);
  
  return {
    amount: amount !== undefined ? amount : undefined,
    interval: p.interval?.trim(),
    currency: p.currency?.trim() || "USD",
    originalAmount: originalAmount !== undefined ? originalAmount : undefined,
  };
};

export const normalizeFeature = (f: TierFeature): TierFeature => ({
  id: f.id.trim(),
  label: f.label.trim(),
  included: f.included === undefined ? undefined : !!f.included,
  note: f.note?.trim(),
});

export const normalizeCta = (c: TierCta): TierCta => ({
  label: c.label.trim(),
  href: c.href.trim(),
  target: c.target ?? "_self",
  rel: c.rel?.trim(),
  variant: c.variant ?? "primary",
});

export const normalizeTier = (t: TierCard): TierCard => ({
  id: t.id.trim(),
  name: t.name.trim(),
  badge: t.badge?.trim(),
  description: t.description?.trim(),
  price: normalizePrice(t.price),
  features: t.features?.map(normalizeFeature),
  cta: t.cta ? normalizeCta(t.cta) : undefined,
  highlighted: !!t.highlighted,
});

/* ============================================================
 * Enhanced input extraction with legacy support
 * ============================================================ */

const extractTiers = (input: TierCardInput): any[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (isObj(input)) {
    const obj = input as any;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.tiers)) return obj.tiers;
    if (Array.isArray(obj.data)) return obj.data;
  }
  return [];
};

/* ============================================================
 * Enhanced transformer with migration support
 * ============================================================ */

export const pricingTiersTransformer: PricingTiersTransformer = {
  normalizeTier,
  toComparableKey: (t) => t.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
};

/* ============================================================
 * Production-ready validator with comprehensive error handling
 * ============================================================ */

export const pricingTiersValidator: PricingTiersValidator = {
  isTierCard,

  validateTiers: (data: unknown, context?: ValidationContext): ValidationResult<TierCard[]> => {
    const result = pricingTiersValidator.validateTiersWithWarnings(data, context);
    return {
      ok: result.ok,
      errors: result.errors || [],
    } as ValidationResult<TierCard[]>;
  },

  validateTiersWithWarnings: (data: unknown, context?: ValidationContext): ValidationWarningResult<TierCard[]> => {
    try {
      const list = extractTiers(data as TierCardInput);
      const errors: string[] = [];
      const warnings: string[] = [];
      const validTiers: TierCard[] = [];

      if (!Array.isArray(list) || list.length === 0) {
        return { 
          ok: false, 
          errors: ["No valid tiers found - input must be an array or object with 'tiers'/'items' property"],
          warnings: []
        };
      }

      // Validate each tier
      list.forEach((item, index) => {
        const tierResult = validateTierCard(item, context);
        
        if (tierResult.valid && tierResult.tierCard) {
          validTiers.push(tierResult.tierCard);
          warnings.push(...tierResult.warnings);
        } else {
          const tierErrors = tierResult.errors.map(e => 
            `Tier ${index}: ${e.message}${e.suggestion ? ` (${e.suggestion})` : ''}`
          );
          errors.push(...tierErrors);
        }
      });

      if (validTiers.length === 0) {
        return { 
          ok: false, 
          errors: ["No valid tiers found after validation", ...errors],
          warnings 
        };
      }

      // Normalize and deduplicate
      const normalized = validTiers.map(normalizeTier);
      const unique = uniqBy(normalized, (t) => t.id);

      if (unique.length < normalized.length) {
        warnings.push(`Removed ${normalized.length - unique.length} duplicate tier(s)`);
      }

      // Additional business logic validation
      unique.forEach((tier) => {
        const { amount, originalAmount } = tier.price || {};
        if (
          typeof originalAmount === "number" &&
          typeof amount === "number" &&
          originalAmount <= amount
        ) {
          delete (tier.price as TierPrice).originalAmount;
          warnings.push(`Removed invalid original price for tier '${tier.name}' (original <= current)`);
        }
      });

      return { 
        ok: true, 
        data: unique, 
        warnings: warnings.length > 0 ? warnings : undefined 
      };

    } catch (error) {
      return { 
        ok: false, 
        errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
        warnings: []
      };
    }
  },

  createValidatedSection: (
    tiersInput: TierCardInput,
    options?: Partial<Omit<PricingTiersSection, "data">>,
    context?: ValidationContext
  ): ValidationResult<PricingTiersSection> => {
    const res = pricingTiersValidator.validateTiersWithWarnings(tiersInput, context);
    if (!res.ok) return { ok: false, errors: res.errors };

    const section: PricingTiersSection = {
      title: options?.title,
      subtitle: options?.subtitle,
      data: { tiers: res.data },
      display: options?.display as PricingTiersDisplayOptions | undefined,
    };

    return { ok: true, data: section };
  },
};

/* ============================================================
 * Enhanced convenience creators with migration support
 * ============================================================ */

/** Validate already-canonical arrays. */
export const createSectionFromCanonical = (
  tiers: TierCard[],
  display?: PricingTiersDisplayOptions,
  title?: string,
  subtitle?: string,
  context?: ValidationContext
): ValidationResult<PricingTiersSection> => {
  return pricingTiersValidator.createValidatedSection(
    { tiers }, 
    { title, subtitle, display },
    context
  );
};

/** Validate from flexible shapes with full migration support. */
export const createSectionFromFlexible = (
  input: TierCardInput | { tiers?: TierCardInput; items?: TierCardInput },
  display?: PricingTiersDisplayOptions,
  title?: string,
  subtitle?: string,
  context?: ValidationContext
): ValidationResult<PricingTiersSection> => {
  const tiers =
    Array.isArray(input)
      ? input
      : (input as any)?.tiers ?? (input as any)?.items ?? input;

  return pricingTiersValidator.createValidatedSection(
    tiers as TierCardInput,
    { title, subtitle, display },
    context
  );
};

/* ============================================================
 * Migration utilities for service-specific validation
 * ============================================================ */

/** Create validation context for specific service */
export const createServiceValidationContext = (
  serviceName: ServiceTypeKey,
  options: { strictMode?: boolean; migrationMode?: boolean } = {}
): ValidationContext => ({
  serviceName,
  strictMode: options.strictMode ?? false,
  migrationMode: options.migrationMode ?? true,
});

/** Validate legacy service data with detailed reporting */
export const validateLegacyServiceData = (
  data: any,
  serviceName: ServiceTypeKey
): ValidationWarningResult<TierCard[]> => {
  const context = createServiceValidationContext(serviceName, { migrationMode: true });
  return pricingTiersValidator.validateTiersWithWarnings(data, context);
};

/* ============================================================
 * Development utilities
 * ============================================================ */

/** Development helper to analyze data format */
export const analyzeDataFormat = (data: any): {
  format: string;
  detectedFeatures: string[];
  migrationNeeded: boolean;
  issues: string[];
} => {
  const features: string[] = [];
  const issues: string[] = [];
  let migrationNeeded = false;

  if (!Array.isArray(data) && !isObj(data)) {
    return {
      format: "invalid",
      detectedFeatures: [],
      migrationNeeded: false,
      issues: ["Data is not an array or object"],
    };
  }

  const items = extractTiers(data);
  if (items.length === 0) {
    return {
      format: "empty",
      detectedFeatures: [],
      migrationNeeded: false,
      issues: ["No items found"],
    };
  }

  const first = items[0];
  if (first.monthlyPrice !== undefined) {
    features.push("monthly-price-format");
    migrationNeeded = true;
  }
  if (first.price && typeof first.price === "string") {
    features.push("string-price-format");
    migrationNeeded = true;
  }
  if (first.idealFor !== undefined) {
    features.push("video-production-format");
  }
  if (first.ctaText !== undefined) {
    features.push("legacy-cta-format");
    migrationNeeded = true;
  }
  if (first.features?.[0]?.text !== undefined) {
    features.push("text-features-format");
    migrationNeeded = true;
  }

  return {
    format: features.length > 0 ? features.join("+") : "canonical",
    detectedFeatures: features,
    migrationNeeded,
    issues,
  };
};