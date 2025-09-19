// ===================================================================
// index.ts - Production Ready Barrel
// ===================================================================

export { default } from './PortfolioSection';
export { default as PortfolioSection } from './PortfolioSection';

// Types
export type {
  PortfolioSectionProps,
  PortfolioSectionInput,
  PortfolioSectionState,
  PortfolioVariant,
  PortfolioLayout,
  PortfolioSize,
  Project,
  PortfolioFilter,
  PortfolioFilters,
  GalleryComponentProps,
} from './PortfolioSection.types';

// Configuration
export {
  DEFAULTS,
  PORTFOLIO_VARIANTS,
  PORTFOLIO_LAYOUTS,
  PORTFOLIO_SIZES,
} from './PortfolioSection.types';

// Type guards
export {
  isPortfolioVariant,
  isPortfolioLayout,
  isPortfolioSize,
  isValidProject,
} from './PortfolioSection.types';

// Adapters
export {
  adaptPortfolioSection,
  adaptSimpleGallery,
  adaptVideoSection,
  adaptInteractiveSection,
  portfolioSectionFromInput,
  mapToPortfolioSection,
  toPortfolioSectionProps,
  type AdapterOptions,
} from './adapters';

// Validators (optional - only if Zod is available)
export {
  validatePortfolioSectionInput,
  validatePortfolioSectionProps,
  validatePortfolioSection,
  validateProject,
  validateProjects,
  validateVariant,
  validateLayout,
  hasValidItems,
  validateContentQuality,
  getValidationErrors,
  type ValidatedInput,
  type ValidatedProps,
  type ValidatedProject,
} from './utils/portfolioSectionValidator';

// Schemas (for external use)
export {
  portfolioSectionInputSchema,
  portfolioSectionPropsSchema,
  projectSchema,
  portfolioVariantSchema,
  portfolioLayoutSchema,
  portfolioSizeSchema,
} from './utils/portfolioSectionValidator';