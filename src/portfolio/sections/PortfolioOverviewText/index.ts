// ===================================================================
// index.ts - Production Ready Barrel
// ===================================================================

export { default } from './PortfolioOverviewText';
export { default as PortfolioOverviewText } from './PortfolioOverviewText';

// Types
export type {
  PortfolioOverviewTextProps,
  PortfolioOverviewTextInput,
  TextVariant,
  TextSize,
  TextAlign,
  OverviewCTA,
} from './PortfolioOverviewText.types';

// Configuration
export {
  DEFAULTS,
  TEXT_VARIANTS,
  TEXT_SIZES,
  TEXT_ALIGNMENTS,
  CTA_VARIANTS,
} from './PortfolioOverviewText.types';

// Type guards
export {
  isTextVariant,
  isTextSize,
  isTextAlign,
  isCTAVariant,
} from './PortfolioOverviewText.types';

// Adapters
export {
  adaptPortfolioOverviewText,
  adaptSimpleText,
  adaptMarketingText,
  overviewTextFromInput,
  mapToPortfolioOverviewText,
  type AdapterOptions,
} from './adapters';

// Validators (optional - only if Zod is available)
export {
  validatePortfolioOverviewTextInput,
  validatePortfolioOverviewTextProps,
  validatePortfolioOverviewText,
  validateCTA,
  validateParagraphs,
  validateContentLength,
  validateCTAUrl,
  getValidationErrors,
  hasRequiredContent,
  type ValidatedInput,
  type ValidatedProps,
  type ValidatedCTA,
} from './utils/portfolioOverviewTextValidator';

// Schemas (for external use)
export {
  portfolioOverviewTextInputSchema,
  portfolioOverviewTextPropsSchema,
  overviewCTASchema,
  textVariantSchema,
  textSizeSchema,
  textAlignSchema,
  ctaVariantSchema,
} from './utils/portfolioOverviewTextValidator';