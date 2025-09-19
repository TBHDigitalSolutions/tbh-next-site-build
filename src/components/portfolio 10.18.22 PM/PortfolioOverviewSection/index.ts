// ===================================================================
// /src/components/portfolio/PortfolioOverviewSection/index.ts
// ===================================================================
// Barrel: clean exports without creating dependency cycles
// ===================================================================

export { default as PortfolioOverviewSection } from "./PortfolioOverviewSection";

// Types
export type { PortfolioOverviewSectionProps } from "./PortfolioOverviewSection.types";
export * from "./PortfolioOverviewSection.types";

// Adapters (both aliases for convenience)
export {
  overviewFromInput,
  adaptPortfolioOverview,
  mapToPortfolioOverviewSection,
} from "./adapters";

// Validator namespace (optional at call sites)
export * as portfolioOverviewValidator from "./utils/portfolioOverviewValidator";
