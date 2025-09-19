// ===================================================================
// /src/components/portfolio/PortfolioModal/index.ts
// ===================================================================
// Barrel exports (cycle-safe)
// ===================================================================

export { default as PortfolioModal } from "./PortfolioModal";

export type {
  PMediaType,
  PMedia,
  PMetric,
  PortfolioModalProject,
  PortfolioModalProps,
} from "./PortfolioModal.types";

export { toPortfolioModalProject, toPortfolioModalProjects } from "./adapters";
export * as portfolioModalValidator from "./utils/portfolioModalValidator";
