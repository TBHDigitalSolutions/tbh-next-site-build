// src/components/portfolio/StandardPortfolioGallery/adapters.ts

import type { 
  StandardPortfolioGalleryProps, 
  PortfolioItem, 
  PortfolioInput,
  PortfolioSection,
  MediaType
} from "./StandardPortfolioGallery.types";
import type { Project } from "../types";

/**
 * StandardPortfolioGallery Data Adapters for Service Templates
 * Maps raw service page data to portfolio gallery component props
 */

// ============================================================================
// Input Normalization
// ============================================================================

/**
 * Normalizes various portfolio input formats into PortfolioItem[]
 */
export const normalizePortfolioInput = (input: PortfolioInput): PortfolioItem[] => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.filter(Boolean).map(normalizePortfolioItem).filter(Boolean) as PortfolioItem[];
  }
  
  // Handle object formats
  if (typeof input === 'object') {
    let items: any[] = [];
    
    if ('portfolio' in input && Array.isArray(input.portfolio)) {
      items = input.portfolio;
    } else if ('projects' in input && Array.isArray(input.projects)) {
      items = input.projects;
    } else if ('items' in input && Array.isArray(input.items)) {
      items = input.items;
    }
    
    return items.filter(Boolean).map(normalizePortfolioItem).filter(Boolean) as PortfolioItem[];
  }
  
  return [];
};

/**
 * Normalizes a single portfolio item (from Project type to PortfolioItem)
 */
export const normalizePortfolioItem = (item: any): PortfolioItem | null => {
  if (!item || typeof item !== 'object') return null;
  
  const id = item.id || generatePortfolioId(item.title || 'untitled');
  const title = item.title || item.name || 'Untitled Project';
  
  // Normalize media object
  const media = normalizeMediaItem(item.media);
  if (!media) return null;
  
  return {
    id,
    title,
    description: item.description || item.summary || item.excerpt,
    media,
    category: item.category || item.type || 'General',
    tags: normalizeTagsArray(item.tags),
    featured: Boolean(item.featured || item.highlight || item.priority),
    client: item.client || item.clientName,
    metrics: normalizeMetricsObject(item.metrics || item.stats || item.results),
    href: item.href || item.url || item.link,
    hub: item.hub || item.service || extractHubFromCategory(item.category),
    service: item.service || item.subCategory || item.serviceType
  };
};

/**
 * Generates a safe ID from project title
 */
const generatePortfolioId = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'portfolio-item';
};

/**
 * Normalizes media item
 */
const normalizeMediaItem = (media: any): PortfolioItem['media'] | null => {
  if (!media || typeof media !== 'object') return null;
  
  const type = validateMediaType(media.type);
  const src = media.src || media.url;
  
  if (!type || !src) return null;
  
  return {
    type,
    src,
    alt: media.alt || media.altText,
    thumbnail: media.thumbnail || media.thumb,
    poster: media.poster || media.preview,
    title: media.title || media.caption
  };
};

/**
 * Validates media type
 */
const validateMediaType = (type: any): MediaType | null => {
  if (typeof type !== 'string') return null;
  
  const validTypes: MediaType[] = ['image', 'video', 'interactive', 'pdf'];
  return validTypes.includes(type as MediaType) ? (type as MediaType) : null;
};

/**
 * Normalizes tags array
 */
const normalizeTagsArray = (tags: any): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim());
  if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean);
  return [];
};

/**
 * Normalizes metrics object
 */
const normalizeMetricsObject = (metrics: any): Record<string, string | number> | undefined => {
  if (!metrics || typeof metrics !== 'object') return undefined;
  
  const normalized: Record<string, string | number> = {};
  Object.keys(metrics).forEach(key => {
    const value = metrics[key];
    if (value != null && (typeof value === 'string' || typeof value === 'number')) {
      normalized[key] = value;
    }
  });
  
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

/**
 * Extracts hub from category string
 */
const extractHubFromCategory = (category: string): string | undefined => {
  if (typeof category !== 'string') return undefined;
  
  const categoryLower = category.toLowerCase();
  const hubMap: Record<string, string> = {
    'web': 'web-development-services',
    'website': 'web-development-services',
    'development': 'web-development-services',
    'video': 'video-production-services',
    'production': 'video-production-services',
    'seo': 'seo-services',
    'search': 'seo-services',
    'marketing': 'marketing-services',
    'advertising': 'marketing-services',
    'lead': 'lead-generation-services',
    'leads': 'lead-generation-services',
    'content': 'content-production-services',
    'copywriting': 'content-production-services'
  };
  
  for (const [key, hub] of Object.entries(hubMap)) {
    if (categoryLower.includes(key)) return hub;
  }
  
  return undefined;
};

// ============================================================================
// Main Adapter Functions
// ============================================================================

/**
 * Primary adapter: transforms portfolio data to component props
 */
export const toStandardPortfolioGalleryProps = (
  input: PortfolioInput,
  overrides: Partial<StandardPortfolioGalleryProps> = {}
): StandardPortfolioGalleryProps => {
  const normalizedItems = normalizePortfolioInput(input);
  
  return {
    items: normalizedItems,
    maxItems: undefined,
    showSearch: true,
    showFilters: true,
    columns: 3,
    variant: 'grid',
    emptyStateText: 'No portfolio items found.',
    searchPlaceholder: 'Search portfolio...',
    'aria-label': 'Portfolio gallery',
    ...overrides
  };
};

// ============================================================================
// Service-Specific Adapters
// ============================================================================

/**
 * Creates StandardPortfolioGallery section for Web Development services
 */
export const createWebDevPortfolioSection = (
  input: PortfolioInput,
  overrides: Partial<StandardPortfolioGalleryProps> = {}
): StandardPortfolioGalleryProps => {
  const items = normalizePortfolioInput(input);
  
  return {
    items: filterByHub(items, 'web-development-services'),
    maxItems: 12,
    showSearch: true,
    showFilters: true,
    columns: 3,
    variant: 'grid',
    emptyStateText: 'No web development projects found.',
    searchPlaceholder: 'Search web projects...',
    'aria-label': 'Web development portfolio',
    ...overrides
  };
};

/**
 * Creates StandardPortfolioGallery section for Video Production services
 */
export const createVideoPortfolioSection = (
  input: PortfolioInput,
  overrides: Partial<StandardPortfolioGalleryProps> = {}
): StandardPortfolioGalleryProps => {
  const items = normalizePortfolioInput(input);
  
  return {
    items: filterByHub(items, 'video-production-services'),
    maxItems: 9,
    showSearch: true,
    showFilters: true,
    columns: 3,
    variant: 'grid',
    emptyStateText: 'No video projects found.',
    searchPlaceholder: 'Search video projects...',
    'aria-label': 'Video production portfolio',
    ...overrides
  };
};

/**
 * Creates StandardPortfolioGallery section for SEO services
 */
export const createSEOPortfolioSection = (
  input: PortfolioInput,
  overrides: Partial<StandardPortfolioGalleryProps> = {}
): StandardPortfolioGalleryProps => {
  const items = normalizePortfolioInput(input);
  
  return {
    items: filterByHub(items, 'seo-services'),
    maxItems: 8,
    showSearch: true,
    showFilters: true,
    columns: 4,
    variant: 'grid',
    emptyStateText: 'No SEO case studies found.',
    searchPlaceholder: 'Search SEO projects...',
    'aria-label': 'SEO services portfolio',
    ...overrides
  };
};

/**
 * Creates StandardPortfolioGallery section for Marketing services
 */
export const createMarketingPortfolioSection = (
  input: PortfolioInput,
  overrides: Partial<StandardPortfolioGalleryProps> = {}
): StandardPortfolioGalleryProps => {
  const items = normalizePortfolioInput(input);
  
  return {
    items: filterByHub(items, 'marketing-services'),
    maxItems: 15,
    showSearch: true,
    showFilters: true,
    columns: 3,
    variant: 'grid',
    emptyStateText: 'No marketing campaigns found.',
    searchPlaceholder: 'Search marketing projects...',
    'aria-label': 'Marketing services portfolio',
    ...overrides
  };
};

/**
 * Creates StandardPortfolioGallery section for Lead Generation services
 */
export const createLeadGenPortfolioSection = (
  input: PortfolioInput,
  overrides: Partial<StandardPortfolioGalleryProps> = {}
): StandardPortfolioGalleryProps => {
  const items = normalizePortfolioInput(input);
  
  return {
    items: filterByHub(items, 'lead-generation-services'),
    maxItems: 10,
    showSearch: true,
    showFilters: true,
    columns: 3,
    variant: 'grid',
    emptyStateText: 'No lead generation projects found.',
    searchPlaceholder: 'Search lead gen projects...',
    'aria-label': 'Lead generation portfolio',
    ...overrides
  };
};

/**
 * Creates StandardPortfolioGallery section for Content Production services
 */
export const createContentPortfolioSection = (
  input: PortfolioInput,
  overrides: Partial<StandardPortfolioGalleryProps> = {}
): StandardPortfolioGalleryProps => {
  const items = normalizePortfolioInput(input);
  
  return {
    items: filterByHub(items, 'content-production-services'),
    maxItems: 12,
    showSearch: true,
    showFilters: true,
    columns: 3,
    variant: 'grid',
    emptyStateText: 'No content projects found.',
    searchPlaceholder: 'Search content projects...',
    'aria-label': 'Content production portfolio',
    ...overrides
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Filters portfolio items by hub
 */
const filterByHub = (items: PortfolioItem[], hub: string): PortfolioItem[] => {
  return items.filter(item => 
    item.hub === hub || 
    item.category?.toLowerCase().includes(hub.split('-')[0]) ||
    item.tags?.some(tag => tag.toLowerCase().includes(hub.split('-')[0]))
  );
};

/**
 * Filters portfolio items to featured only
 */
export const filterFeaturedOnly = (items: PortfolioItem[]): PortfolioItem[] => {
  return items.filter(item => item.featured);
};

/**
 * Sorts portfolio items by featured status then by title
 */
export const sortPortfolioItems = (items: PortfolioItem[]): PortfolioItem[] => {
  return items.slice().sort((a, b) => {
    // Featured items first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // Then alphabetical by title
    return a.title.localeCompare(b.title);
  });
};

/**
 * Groups portfolio items by category
 */
export const groupByCategory = (items: PortfolioItem[]): Record<string, PortfolioItem[]> => {
  return items.reduce((groups, item) => {
    const category = item.category || 'Uncategorized';
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {} as Record<string, PortfolioItem[]>);
};

// ============================================================================
// Section Factory
// ============================================================================

/**
 * Creates a complete StandardPortfolioGallery section for service pages
 */
export const createPortfolioGallerySection = (
  section: PortfolioSection,
  serviceType: 'web-dev' | 'video' | 'seo' | 'marketing' | 'lead-gen' | 'content' = 'web-dev'
): StandardPortfolioGalleryProps => {
  const baseProps = {
    maxItems: section.maxItems,
    showSearch: section.showSearch,
    showFilters: section.showFilters,
    columns: section.columns,
    variant: section.variant
  };

  const adapterMap = {
    'web-dev': createWebDevPortfolioSection,
    'video': createVideoPortfolioSection,
    'seo': createSEOPortfolioSection,
    'marketing': createMarketingPortfolioSection,
    'lead-gen': createLeadGenPortfolioSection,
    'content': createContentPortfolioSection
  };

  const adapter = adapterMap[serviceType];
  let items = normalizePortfolioInput(section.data);
  
  // Apply section-level filters
  if (section.featuredOnly) {
    items = filterFeaturedOnly(items);
  }
  
  if (section.categories && section.categories.length > 0) {
    items = items.filter(item => section.categories!.includes(item.category));
  }
  
  if (section.tags && section.tags.length > 0) {
    items = items.filter(item => 
      item.tags?.some(tag => section.tags!.includes(tag))
    );
  }
  
  return adapter(items, baseProps);
};

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates StandardPortfolioGallery input data
 */
export const validatePortfolioGalleryInput = (input: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  data?: PortfolioInput 
} => {
  const errors: string[] = [];
  
  if (!input) {
    return { isValid: false, errors: ['Portfolio input is required'] };
  }
  
  if (Array.isArray(input)) {
    if (input.length === 0) {
      errors.push('Portfolio array cannot be empty');
    }
    
    input.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Portfolio item at index ${index} must be an object`);
      } else {
        if (!item.title && !item.name) {
          errors.push(`Portfolio item at index ${index} must have a title or name`);
        }
        if (!item.media || typeof item.media !== 'object') {
          errors.push(`Portfolio item at index ${index} must have media object`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? input : undefined
    };
  }
  
  if (typeof input === 'object') {
    const portfolioInput = input as any;
    const hasAnyPortfolio = ['portfolio', 'projects', 'items']
      .some(key => Array.isArray(portfolioInput[key]) && portfolioInput[key].length > 0);
    
    if (!hasAnyPortfolio) {
      errors.push('Portfolio must have at least one item in portfolio, projects, or items array');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? portfolioInput : undefined
    };
  }
  
  return { isValid: false, errors: ['Invalid portfolio input format'] };
};

// Export main adapter for template usage
export { toStandardPortfolioGalleryProps as toPortfolioGalleryAdapter };