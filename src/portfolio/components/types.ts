// src/portfolio/components/types.ts

// ============================
// IMPORT CANONICAL TYPES FROM LIB
// ============================

// Import canonical types from the portfolio lib layer
export type { 
  CategorySlug,
  MediaType,
  PortfolioVariant,
  Project,
  MediaItem,
  ProjectMetric,
  CategoryConfig,
  PortfolioSectionConfig,
  HubSectionData,
  CategoryPageData,
  PortfolioAnalyticsEvent
} from '../lib/types';

// Import constants and utilities
export {
  CATEGORY_COMPONENTS,
  CATEGORY_SLUGS,
  MEDIA_TYPES,
  PORTFOLIO_VARIANTS,
  isValidCategorySlug,
  isValidMediaType,
  isValidPortfolioVariant,
  isValidProject,
  getCategoryConfig,
  getCategoryVariant,
  getCategoryLabel,
  getCategoryViewAllHref,
  isInteractiveCategory,
  isVideoCategory,
  getCategoriesByVariant,
  LEGACY_SLUG_MAPPING,
  normalizeToCanonicalSlug
} from '../lib/types';

// ============================
// COMPONENT-SPECIFIC TYPES
// ============================

export type ProjectsByCategory = Record<CategorySlug, Project[]>;
export type CategoryVariant = CategoryConfig['variant'];

// ============================
// COMPONENT INTERACTION TYPES
// ============================

// Filter and search types for components
export interface PortfolioFilters {
  category?: CategorySlug;
  tags?: string[];
  mediaType?: MediaType;
  featured?: boolean;
  client?: string;
}

export interface SearchState {
  query: string;
  filters: PortfolioFilters;
  results: Project[];
  loading: boolean;
  totalResults: number;
}

// Modal state management
export interface ModalState {
  isOpen: boolean;
  currentProject: Project | null;
  projectIndex: number;
  projects: Project[];
  canNavigate: boolean;
}

// Gallery component props interface
export interface GalleryProps {
  items: Project[];
  variant?: CategoryVariant;
  showSearch?: boolean;
  showFilters?: boolean;
  onItemClick?: (project: Project, index: number) => void;
  onModalOpen?: (project: Project) => void;
  className?: string;
}

// ============================
// ADDITIONAL TYPE GUARDS
// ============================

/**
 * Type guard for PortfolioMedia
 */
export const isValidMedia = (media: unknown): media is MediaItem => {
  return typeof media === 'object' &&
         media !== null &&
         'type' in media &&
         'src' in media &&
         isValidMediaType((media as any).type) &&
         typeof (media as any).src === 'string';
};

// ============================
// COMPONENT HELPER FUNCTIONS
// ============================

/**
 * Validate project array for component consumption
 */
export const validateProjectsForComponent = (projects: unknown[]): Project[] => {
  if (!Array.isArray(projects)) {
    console.warn('Projects must be an array for component consumption');
    return [];
  }

  return projects.filter(isValidProject);
};

/**
 * Validate and normalize search filters
 */
export const normalizeFilters = (filters: Partial<PortfolioFilters>): PortfolioFilters => {
  return {
    category: filters.category && isValidCategorySlug(filters.category) ? filters.category : undefined,
    tags: Array.isArray(filters.tags) ? filters.tags.filter(tag => typeof tag === 'string') : undefined,
    mediaType: filters.mediaType && isValidMediaType(filters.mediaType) ? filters.mediaType : undefined,
    featured: typeof filters.featured === 'boolean' ? filters.featured : undefined,
    client: typeof filters.client === 'string' ? filters.client : undefined
  };
};

// ============================
// BACKWARDS COMPATIBILITY
// ============================

// Legacy type aliases for existing components
export type { CategorySlug as PortfolioCategorySlug };
export type { Project as PortfolioProject };
export type { MediaItem as ProjectMedia };

// Legacy constant for existing component imports
export { CATEGORY_COMPONENTS as PORTFOLIO_CATEGORIES };

// Legacy categories array for backward compatibility
export const CANONICAL_CATEGORIES = CATEGORY_SLUGS;

// ============================
// COMPONENT METADATA
// ============================

/**
 * Component metadata for development tools
 */
export const PORTFOLIO_COMPONENT_METADATA = {
  version: '3.0.0',
  lastUpdated: new Date().toISOString(),
  typeSource: '../lib/types',
  componentSource: '/src/portfolio/components',
  supportedVariants: PORTFOLIO_VARIANTS,
  supportedMediaTypes: MEDIA_TYPES,
  totalCategories: CATEGORY_SLUGS.length,
  interactiveCategories: getCategoriesByVariant('interactive').length,
  videoCategories: getCategoriesByVariant('video').length,
  galleryCategories: getCategoriesByVariant('gallery').length,
  canonicalSlugs: CATEGORY_SLUGS,
  legacyMappingAvailable: Object.keys(LEGACY_SLUG_MAPPING).length > 0
} as const;