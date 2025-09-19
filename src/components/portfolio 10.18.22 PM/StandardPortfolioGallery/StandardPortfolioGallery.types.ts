// src/components/portfolio/StandardPortfolioGallery/StandardPortfolioGallery.types.ts

/**
 * Type definitions for StandardPortfolioGallery component
 * Production-ready types for portfolio gallery with service-specific adapters
 */

// Re-export shared portfolio types
export type { Project, MediaType, MediaItem } from "../types";

/**
 * Portfolio item interface - normalized from Project type
 * Used by adapters to ensure consistent data structure
 */
export interface PortfolioItem {
  /** Unique identifier */
  id: string;
  /** Project title */
  title: string;
  /** Project description */
  description?: string;
  /** Media content */
  media: {
    type: MediaType;
    src: string;
    alt?: string;
    thumbnail?: string;
    poster?: string;
    title?: string;
  };
  /** Project category */
  category: string;
  /** Project tags */
  tags?: string[];
  /** Whether this is a featured project */
  featured?: boolean;
  /** Client name */
  client?: string;
  /** Project metrics/results */
  metrics?: Record<string, string | number>;
  /** External project URL */
  href?: string;
  /** Service hub this project belongs to */
  hub?: string;
  /** Service type within hub */
  service?: string;
}

/**
 * Filter state interface
 */
export interface FilterState {
  /** Filter by media type */
  mediaType: MediaType | 'all';
  /** Filter by featured status */
  featured: boolean | 'all';
  /** Filter by tags */
  tags: string[];
}

/**
 * Modal state interface
 */
export interface ModalState {
  /** Whether modal is open */
  isOpen: boolean;
  /** Current project index */
  currentIndex: number;
  /** Projects in current view */
  items: PortfolioItem[];
}

/**
 * Main component props interface
 */
export interface StandardPortfolioGalleryProps {
  /** Portfolio items to display */
  items: PortfolioItem[];
  /** Maximum number of items to show */
  maxItems?: number;
  /** Show search functionality */
  showSearch?: boolean;
  /** Show filter controls */
  showFilters?: boolean;
  /** Number of grid columns */
  columns?: 1 | 2 | 3 | 4;
  /** Display variant */
  variant?: 'grid' | 'masonry' | 'list';
  /** Modal open handler */
  onModalOpen?: (project: PortfolioItem, index: number) => void;
  /** Item click handler */
  onItemClick?: (project: PortfolioItem, index: number) => void;
  /** Additional CSS classes */
  className?: string;
  /** Empty state text */
  emptyStateText?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
}

// Service page integration types
export type PortfolioInput = 
  | PortfolioItem[]
  | { portfolio?: PortfolioItem[] }
  | { projects?: PortfolioItem[] }
  | { items?: PortfolioItem[] }
  | null
  | undefined;

/**
 * Portfolio section configuration for service pages
 */
export interface PortfolioSection {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Portfolio data */
  data: PortfolioInput;
  /** Display configuration */
  maxItems?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  columns?: StandardPortfolioGalleryProps['columns'];
  variant?: StandardPortfolioGalleryProps['variant'];
  /** Featured items only */
  featuredOnly?: boolean;
  /** Filter by specific categories */
  categories?: string[];
  /** Filter by specific tags */
  tags?: string[];
}

// Service-specific portfolio section types
export type WebDevPortfolioSection = PortfolioSection;
export type VideoPortfolioSection = PortfolioSection;
export type SEOPortfolioSection = PortfolioSection;
export type MarketingPortfolioSection = PortfolioSection;
export type LeadGenPortfolioSection = PortfolioSection;
export type ContentPortfolioSection = PortfolioSection;

/**
 * Analytics tracking interface
 */
export interface PortfolioAnalytics {
  /** Track portfolio view */
  onPortfolioView?: (items: PortfolioItem[]) => void;
  /** Track item click */
  onItemClick?: (item: PortfolioItem, position: number) => void;
  /** Track modal open */
  onModalOpen?: (item: PortfolioItem) => void;
  /** Track filter usage */
  onFilterApplied?: (filterType: string, filterValue: string) => void;
  /** Track search usage */
  onSearchPerformed?: (query: string, resultCount: number) => void;
}

/**
 * Advanced filtering options
 */
export interface AdvancedFilters {
  /** Date range filters */
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  /** Service filters */
  services?: string[];
  /** Client filters */
  clients?: string[];
  /** Custom filter functions */
  customFilters?: Array<{
    id: string;
    label: string;
    filter: (item: PortfolioItem) => boolean;
  }>;
}

/**
 * Extended props for advanced use cases
 */
export interface StandardPortfolioGalleryExtendedProps extends StandardPortfolioGalleryProps {
  /** Analytics tracking */
  analytics?: PortfolioAnalytics;
  /** Advanced filtering */
  advancedFilters?: AdvancedFilters;
  /** Custom card renderer */
  customCardRenderer?: (item: PortfolioItem, index: number) => React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string | null;
}