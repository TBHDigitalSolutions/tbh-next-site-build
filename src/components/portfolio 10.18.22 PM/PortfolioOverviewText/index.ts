// ===================================================================
// /src/components/portfolio/PortfolioOverviewText/index.ts
// ===================================================================
export { default as PortfolioOverviewText } from "./PortfolioOverviewText";
export type { PortfolioOverviewTextProps, OverviewTextVariant, OverviewTextInput } from "./PortfolioOverviewText.types";
export * from "./PortfolioOverviewText.types";

export { overviewTextFromInput, normalizeOverviewTextProps } from "./adapters";
export * as overviewTextValidator from "./utils/portfolioOverviewTextValidator";
