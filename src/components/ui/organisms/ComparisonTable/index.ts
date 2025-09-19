// Public barrel for ComparisonTable
// Keeps a clean import surface and stable API for pages & adapters.

export { default as ComparisonTable } from "./ComparisonTable";

// Component-level contract (the TSX imports from here too)
export type {
  ComparisonColumn,
  ComparisonCell,
  ComparisonRow,
  ComparisonTableProps,
  // Service-page integration shapes
  ComparisonTier,
  FlatComparisonRow,
  GroupedComparisonFeature,
  AnyComparisonInput,
  ComparisonInput,
  ComparisonSection,
  WebDevComparisonSection,
  VideoComparisonSection,
  LeadGenComparisonSection,
  MarketingAutomationComparisonSection,
  SEOServicesComparisonSection,
  ContentProductionComparisonSection,
  // Legacy & advanced
  LegacyComparisonData,
  ComparisonTablePropsWithLegacy,
  ComparisonTransformer,
  ComparisonValidator,
  ComparisonThemeConfig,
  ComparisonBehaviorConfig,
  AdvancedComparisonSection,
  FeatureMatrix,
  TierConfig,
  FeatureConfig,
} from "./ComparisonTable.types";

// Optional: re-export adapters/helpers so pages can normalize data
export * from "./adapters";

// Optional: validation utilities (Zod or custom)
export * from "./utils/comparisonTableValidator";
