// /src/portfolio/lib/types.ts

// ============================
// CANONICAL TYPE DEFINITIONS
// ============================

export type PortfolioVariant = "gallery" | "video" | "interactive";
export type MediaType = "image" | "video" | "interactive" | "pdf";

// Canonical category slugs aligned with routing (services-based)
export type CategorySlug = 
  | "web-development-services"
  | "video-production-services" 
  | "seo-services"
  | "marketing-services"
  | "content-production-services"
  | "lead-generation-services";

// Core interfaces
export interface MediaItem {
  type: MediaType;
  src: string;
  alt?: string;
  thumbnail?: string;
  poster?: string;
}

export interface ProjectMetric {
  label: string;
  value: string | number;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  client?: string;
  category?: CategorySlug;
  tags?: string[];
  featured?: boolean;
  href?: string;
  media?: MediaItem;
  metrics?: ProjectMetric[];
}

// Component configuration
export interface CategoryConfig {
  label: string;
  variant: PortfolioVariant;
  viewAllHref: `/portfolio/${CategorySlug}`;
  description?: string;
}

export const CATEGORY_COMPONENTS: Record<CategorySlug, CategoryConfig> = {
  "web-development-services": {
    label: "Web Development",
    variant: "interactive",
    viewAllHref: "/portfolio/web-development-services",
    description: "Interactive builds and scalable web applications."
  },
  "video-production-services": {
    label: "Video Production", 
    variant: "video",
    viewAllHref: "/portfolio/video-production-services",
    description: "Showreels, explainers, and brand stories that convert."
  },
  "seo-services": {
    label: "SEO Services",
    variant: "gallery",
    viewAllHref: "/portfolio/seo-services",
    description: "Rankings, visibility, and measurable organic growth."
  },
  "marketing-services": {
    label: "Marketing Services",
    variant: "gallery", 
    viewAllHref: "/portfolio/marketing-services",
    description: "Journeys, workflows, and nurture campaigns that convert."
  },
  "content-production-services": {
    label: "Content Production",
    variant: "gallery",
    viewAllHref: "/portfolio/content-production-services",
    description: "Editorial content and design for acquisition and enablement."
  },
  "lead-generation-services": {
    label: "Lead Generation",
    variant: "gallery",
    viewAllHref: "/portfolio/lead-generation-services",
    description: "Funnels, creatives, and campaigns that generate pipeline."
  }
} as const;

// Portfolio section configuration for templates
export interface PortfolioSectionConfig {
  slug: CategorySlug;
  label: string;
  subtitle?: string;
  items: Project[];
  variant: PortfolioVariant;
  priority?: number;
  viewAllHref: string;
  maxDisplayItems?: number;
}

// Hub template props
export interface HubSectionData {
  sections: PortfolioSectionConfig[];
  meta?: {
    title?: string;
    subtitle?: string;
    heroButton?: {
      text: string;
      href: string;
    };
  };
  features?: {
    showSearch?: boolean;
    showOverview?: boolean;
    showCTA?: boolean;
  };
  analytics?: {
    context?: string;
    trackSectionViews?: boolean;
  };
}

// Category template props data structure
export interface CategoryPageData {
  items: Project[];
  tools?: Array<{ id: string; name: string }>;
  caseStudies?: Array<{ id: string; title: string }>;
  recommendedPackages?: Array<{ id: string; title: string }>;
  metrics?: {
    totalProjects?: number;
    avgProjectDuration?: string;
    successRate?: string;
    clientSatisfaction?: string;
  };
}

// Analytics event types
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

// ============================
// CONSTANTS & ARRAYS
// ============================

export const CATEGORY_SLUGS: CategorySlug[] = [
  "web-development-services",
  "video-production-services",
  "seo-services", 
  "marketing-services",
  "content-production-services",
  "lead-generation-services"
];

export const MEDIA_TYPES: MediaType[] = [
  'image',
  'video', 
  'interactive',
  'pdf'
];

export const PORTFOLIO_VARIANTS: PortfolioVariant[] = [
  'gallery',
  'video',
  'interactive'
];

// ============================
// TYPE GUARDS
// ============================

export const isValidCategorySlug = (value: unknown): value is CategorySlug => {
  return typeof value === 'string' && CATEGORY_SLUGS.includes(value as CategorySlug);
};

export const isValidMediaType = (value: unknown): value is MediaType => {
  return typeof value === 'string' && MEDIA_TYPES.includes(value as MediaType);
};

export const isValidPortfolioVariant = (value: unknown): value is PortfolioVariant => {
  return typeof value === 'string' && PORTFOLIO_VARIANTS.includes(value as PortfolioVariant);
};

export const isValidProject = (item: unknown): item is Project => {
  return typeof item === 'object' && 
         item !== null && 
         'id' in item && 
         'title' in item;
};

// ============================
// UTILITY FUNCTIONS
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
export const getCategoryVariant = (slug: CategorySlug): PortfolioVariant => {
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
export const getCategoriesByVariant = (variant: PortfolioVariant): CategorySlug[] => {
  return Object.entries(CATEGORY_COMPONENTS)
    .filter(([, config]) => config.variant === variant)
    .map(([slug]) => slug as CategorySlug);
};

// ============================
// LEGACY SUPPORT
// ============================

// Legacy aliases for backward compatibility
export type { CategorySlug as PortfolioCategorySlug };
export type { PortfolioVariant as GalleryVariant };

// Legacy mapping for existing components that may use old slugs
export const LEGACY_SLUG_MAPPING: Record<string, CategorySlug> = {
  "web-development": "web-development-services",
  "video-production": "video-production-services",
  "marketing-automation": "marketing-services",
  "content-production": "content-production-services",
  "lead-generation": "lead-generation-services",
  // seo-services remains the same
  "seo-services": "seo-services"
};

/**
 * Convert legacy slug to canonical slug
 */
export const normalizeToCanonicalSlug = (slug: string): CategorySlug | null => {
  // Check if it's already canonical
  if (isValidCategorySlug(slug)) {
    return slug;
  }
  
  // Check legacy mapping
  const canonical = LEGACY_SLUG_MAPPING[slug];
  return canonical || null;
};