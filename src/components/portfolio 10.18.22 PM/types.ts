// src/components/portfolio/types.ts

// ============================
// RE-EXPORT FROM DATA LAYER (PRIMARY TYPES)
// ============================

// Import and re-export the canonical types from data layer
export type { 
  CategorySlug,
  MediaType,
  PortfolioMedia,
  Project,
  PortfolioCategory
} from '@/data/portfolio';

// Import constants
export { CANONICAL_CATEGORIES } from '@/data/portfolio';

// ============================
// COMPONENT-SPECIFIC TYPES
// ============================

// Category configuration for component rendering
export interface CategoryConfig {
  label: string;
  variant: "interactive" | "video" | "gallery";
  viewAllHref: `/portfolio/${CategorySlug}`;
  description?: string;
}

// Component configurations mapping
export const CATEGORY_COMPONENTS: Record<CategorySlug, CategoryConfig> = {
  "web-development": {
    label: "Web Development",
    variant: "interactive",
    viewAllHref: "/portfolio/web-development",
    description: "Interactive builds and scalable web applications."
  },
  "video-production": {
    label: "Video Production", 
    variant: "video",
    viewAllHref: "/portfolio/video-production",
    description: "Showreels, explainers, and brand stories that convert."
  },
  "seo-services": {
    label: "SEO Services",
    variant: "gallery",
    viewAllHref: "/portfolio/seo-services",
    description: "Rankings, visibility, and measurable organic growth."
  },
  "marketing-automation": {
    label: "Marketing Automation",
    variant: "gallery", 
    viewAllHref: "/portfolio/marketing-automation",
    description: "Journeys, workflows, and nurture campaigns that convert."
  },
  "content-production": {
    label: "Content Production",
    variant: "gallery",
    viewAllHref: "/portfolio/content-production",
    description: "Editorial content and design for acquisition and enablement."
  },
  "lead-generation": {
    label: "Lead Generation",
    variant: "gallery",
    viewAllHref: "/portfolio/lead-generation",
    description: "Funnels, creatives, and campaigns that generate pipeline."
  }
} as const;

// ============================
// UTILITY TYPES
// ============================

export type ProjectsByCategory = Record<CategorySlug, Project[]>;
export type CategoryVariant = CategoryConfig['variant'];

// ============================
// COMPONENT INTERACTION TYPES
// ============================

// Analytics event types for portfolio interactions
export interface PortfolioAnalyticsEvent {
  portfolio_modal_open: {
    category: CategorySlug;
    item_id: string;
    media_type: MediaType;
    source?: 'hub' | 'category' | 'search';
  };
  portfolio_view_all_click: {
    category: CategorySlug;
    source_page: 'hub' | 'search';
  };
  portfolio_search: {
    query: string;
    results_count: number;
    category?: CategorySlug;
    filter_type?: 'global' | 'category';
  };
  portfolio_item_click: {
    category: CategorySlug;
    item_id: string;
    click_type: 'modal' | 'external_link';
  };
}

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
// TYPE GUARDS
// ============================

/**
 * Type guard to check if a value is a valid CategorySlug
 */
export const isCategorySlug = (value: unknown): value is CategorySlug => {
  const validCategories = [
    "web-development",
    "video-production", 
    "seo-services",
    "marketing-automation",
    "content-production",
    "lead-generation"
  ] as const;
  
  return typeof value === 'string' && 
         validCategories.includes(value as CategorySlug);
};

/**
 * Type guard to check if a value is a valid MediaType
 */
export const isMediaType = (value: unknown): value is MediaType => {
  const validTypes: MediaType[] = ['image', 'video', 'interactive', 'pdf'];
  return typeof value === 'string' && validTypes.includes(value as MediaType);
};

/**
 * Type guard to check if a value is a valid Project
 */
export const isValidProject = (item: unknown): item is Project => {
  return typeof item === 'object' && 
         item !== null && 
         'id' in item && 
         'title' in item && 
         'category' in item &&
         'media' in item &&
         isCategorySlug((item as any).category);
};

/**
 * Type guard for PortfolioMedia
 */
export const isValidMedia = (media: unknown): media is PortfolioMedia => {
  return typeof media === 'object' &&
         media !== null &&
         'type' in media &&
         'src' in media &&
         isMediaType((media as any).type) &&
         typeof (media as any).src === 'string';
};

// ============================
// COMPONENT HELPER FUNCTIONS
// ============================

/**
 * Get category configuration by slug
 */
export const getCategoryConfig = (slug: CategorySlug): CategoryConfig => {
  return CATEGORY_COMPONENTS[slug];
};

/**
 * Get category variant for gallery selection
 */
export const getCategoryVariant = (slug: CategorySlug): CategoryVariant => {
  return CATEGORY_COMPONENTS[slug].variant;
};

/**
 * Get category label for display
 */
export const getCategoryLabel = (slug: CategorySlug): string => {
  return CATEGORY_COMPONENTS[slug].label;
};

/**
 * Get "View All" link for category
 */
export const getCategoryViewAllHref = (slug: CategorySlug): string => {
  return CATEGORY_COMPONENTS[slug].viewAllHref;
};

/**
 * Check if category uses interactive gallery
 */
export const isInteractiveCategory = (slug: CategorySlug): boolean => {
  return CATEGORY_COMPONENTS[slug].variant === 'interactive';
};

/**
 * Check if category uses video gallery
 */
export const isVideoCategory = (slug: CategorySlug): boolean => {
  return CATEGORY_COMPONENTS[slug].variant === 'video';
};

/**
 * Get all categories with specific variant
 */
export const getCategoriesByVariant = (variant: CategoryVariant): CategorySlug[] => {
  return Object.entries(CATEGORY_COMPONENTS)
    .filter(([, config]) => config.variant === variant)
    .map(([slug]) => slug as CategorySlug);
};

// ============================
// VALIDATION HELPERS
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
    category: filters.category && isCategorySlug(filters.category) ? filters.category : undefined,
    tags: Array.isArray(filters.tags) ? filters.tags.filter(tag => typeof tag === 'string') : undefined,
    mediaType: filters.mediaType && isMediaType(filters.mediaType) ? filters.mediaType : undefined,
    featured: typeof filters.featured === 'boolean' ? filters.featured : undefined,
    client: typeof filters.client === 'string' ? filters.client : undefined
  };
};

// ============================
// BACKWARDS COMPATIBILITY
// ============================

// Define categories locally to avoid import issues
const LOCAL_CATEGORIES = [
  "web-development",
  "video-production", 
  "seo-services",
  "marketing-automation",
  "content-production",
  "lead-generation"
] as const;

// Legacy exports for existing components
export const CATEGORY_SLUGS = LOCAL_CATEGORIES;

// Legacy type aliases
export type { CategorySlug as PortfolioCategorySlug };
export type { Project as PortfolioProject };
export type { PortfolioMedia as ProjectMedia };

// Legacy constant for existing component imports
export { CATEGORY_COMPONENTS as PORTFOLIO_CATEGORIES };

// ============================
// COMPONENT METADATA
// ============================

/**
 * Component metadata for development tools
 */
export const PORTFOLIO_COMPONENT_METADATA = {
  version: '2.0.0',
  lastUpdated: new Date().toISOString(),
  typeSource: '@/data/portfolio',
  componentSource: '@/components/portfolio',
  supportedVariants: ['interactive', 'video', 'gallery'] as const,
  supportedMediaTypes: ['image', 'video', 'interactive', 'pdf'] as const,
  totalCategories: LOCAL_CATEGORIES.length,
  interactiveCategories: getCategoriesByVariant('interactive').length,
  videoCategories: getCategoriesByVariant('video').length,
  galleryCategories: getCategoriesByVariant('gallery').length
} as const;