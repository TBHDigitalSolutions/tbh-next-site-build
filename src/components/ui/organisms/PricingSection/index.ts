// /website/src/components/ui/organisms/PricingSection/index.ts

// Component (thin orchestrator)
export { default as PricingSection } from "./PricingSection";

// Public types (keep the surface small and intentional)
export type {
  PricingSectionProps,
  PricingSectionNotes,
  MapToTiersProps,
} from "./PricingSection.types";

// Adapters: map raw service data → <PricingTiers /> props
export {
  mapContentProdPricingToTiersProps,
  mapLeadGenPricingToTiersProps,
  mapVideoProdPricingToTiersProps,
  mapServicePricingToTiersProps,
  // Exporting helpers can be handy for testing or edge cases:
  parsePriceString,
  normalizeFeatures,
  normalizeCta,
  toHighlightedFlag,
} from "./adapters";

// Validator: runtime guardrails for presentational props (and optional raw checks)
export {
  validatePricingTiersProps,
  assertPricingTiersProps,
  validateRawServicePricingData,
  assertRawServicePricingData,
} from "./utils/pricingSectionValidator";
