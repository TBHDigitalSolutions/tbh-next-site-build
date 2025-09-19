// src/components/ui/organisms/PricingTiers/index.ts

/**
 * PricingTiers — Barrel (Production Ready)
 * ---------------------------------------
 * One import surface for:
 *  - Presenter component <PricingTiers />
 *  - Type contracts (TierCard, PricingTiersProps, etc.)
 *  - Adapters (service mappers, Stripe-like, helpers)
 *  - Validator/transform utilities
 *
 * Example:
 *   import PricingTiers, {
 *     type PricingTiersProps,
 *     mapContentProdPricingToTiersProps,
 *     toProps,
 *     pricingTiersValidator,
 *   } from "@/components/ui/organisms/PricingTiers";
 */

export { default } from "./PricingTiers";

// Types (narrow, explicit exports to keep TS IntelliSense focused)
export type {
  // Domain
  TierCard,
  TierPrice,
  TierFeature,
  TierCta,
  // Component props & options
  PricingTiersProps,
  PricingLayout,
  BillingPeriod,
  // Sections & validation
  PricingTiersSection,
  PricingTiersDisplayOptions,
  ValidationResult,
  ValidationWarningResult,
  // Legacy/migration helpers (still used by some service pages)
  LegacyPricingFeature,
  LegacyTierData,
  LegacyPricingConfig,
  LegacyPricingSection,
  // Service keys & maps
  ServiceKey,
  ServiceTypeKey,
  PricingTiersMap,
  // Adapters/contracts
  ServiceAdapter,
  ServiceAdapterMap,
  ServiceAdapterResult,
  // Misc utilities
  NonEmptyArray,
  Primitive,
  PartialBy,
  RequiredBy,
  ServiceValidated,
  DebugInfo,
  DevToolsConfig,
  RenderOptions,
  CacheStrategy,
  ValidationError,
  ValidationErrorType,
  ValidationContext,
  BillingState,
  BillingConfiguration,
  // Comparison table integration (optional downstream usage)
  ComparisonFeature,
  ComparisonTableData,
} from "./PricingTiers.types";

// Adapters (service-specific + generic helpers)
export {
  // Generic → props/section builders
  toProps,
  toSection,
  toSectionFromCanonical,
  // Stripe-like mapper
  fromStripeLike,
  // Billing transforms (monthly/yearly synthesis)
  withBillingPeriod,
  // Format identification (dev aid)
  identifyDataFormat,
  // Raw/collection normalizers
  fromRawTier,
  fromRawCollection,
  // Service mappers → PricingTiersProps
  mapContentProdPricingToTiersProps,
  mapVideoProdPricingToTiersProps,
  mapLeadGenPricingToTiersProps,
  mapMarketingAutoPricingToTiersProps,
  mapSEOServicesPricingToTiersProps,
  mapWebDevPricingToTiersProps,
  mapServicePricingToTiersProps,
  // Legacy migration façade
  migrateLegacyPricingProps,
} from "./adapters";

// Validator + transformer utilities (kept as named exports)
export {
  pricingTiersValidator,
  pricingTiersTransformer,
  createSectionFromCanonical,
  createSectionFromFlexible,
} from "./utils/pricingTiersValidator";
