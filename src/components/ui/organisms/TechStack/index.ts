// src/components/ui/organisms/TechStack/index.ts

// Main components
export { default as TechStackShowcase } from './TechStackShowcase';
export { default as StackCategory } from './StackCategory';
export { default as TechItem } from './TechItem';

// Types
export type {
  Tech,
  TechCategory,
  TechStackShowcaseProps
} from './TechStack.types';

// Adapters - main exports for template usage
export {
  toTechStackProps,
  toTechStackAdapter,
  createWebDevTechStackSection,
  createVideoTechStackSection,
  createSEOTechStackSection,
  createMarketingTechStackSection,
  createLeadGenTechStackSection,
  createContentTechStackSection,
  normalizeTechInput,
  normalizeTechItem,
  validateTechStackInput
} from './adapters';

// Validators
export {
  validateTech,
  parseTech,
  validateTechStackShowcase,
  parseTechStackShowcase,
  validateAndCleanTechStack,
  isValidTechCategory,
  getValidTechCategories
} from './utils/techStackValidator';

// Default export for convenience
export { default as TechStack } from './TechStackShowcase';