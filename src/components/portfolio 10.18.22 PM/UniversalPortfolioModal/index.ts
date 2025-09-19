// ===================================================================
// /src/components/portfolio/UniversalPortfolioModal/index.ts
// ===================================================================
// Barrel exports for clean, cycle-free imports
// ===================================================================

export { default as UniversalPortfolioModal } from "./UniversalPortfolioModal";

export type {
  ModalMediaType,
  ModalMedia,
  ModalMetric,
  ModalProject,
  UniversalPortfolioModalProps,
} from "./UniversalPortfolioModal.types";

export { toModalProject, toModalProjects } from "./adapters";
export * as universalPortfolioModalValidator from "./utils/universalPortfolioModalValidator";
