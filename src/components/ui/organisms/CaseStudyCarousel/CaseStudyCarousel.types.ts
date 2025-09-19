// src/components/ui/organisms/CaseStudyCarousel/CaseStudyCarousel.types.ts

/**
 * Case Study Carousel Component Types
 * Interactive showcase for client success stories and project results
 */

export interface CaseStudyMetric {
  /** Metric display label (e.g., "Revenue Increase") */
  label: string;
  /** Metric value with formatting (e.g., "+300%", "$2.5M") */
  value: string;
  /** Optional change indicator (e.g., "+15% vs last quarter") */
  change?: string;
  /** Optional trend direction for visual indicators */
  trend?: "up" | "down" | "neutral";
}

export interface CaseStudy {
  /** Unique identifier */
  id: string;
  /** Client company name */
  client: string;
  /** Case study title/headline */
  title: string;
  /** Detailed description of the project and outcomes */
  description: string;
  /** Service category (e.g., "Web Development", "SEO", "Video Production") */
  category: string;
  /** Hero image URL for the case study */
  image: string;
  /** Key performance metrics achieved */
  metrics: CaseStudyMetric[];
  /** Service/technology tags for filtering */
  tags: string[];
  /** Project completion date (display format) */
  date: string;
  /** Link to full case study page */
  link: string;
  /** Whether this case study should be highlighted */
  featured?: boolean;
  /** Quick results summary for overlay display */
  results?: string;
  /** Optional industry classification */
  industry?: string;
  /** Project duration (e.g., "3 months", "6 weeks") */
  duration?: string;
  /** Project budget range (e.g., "$10K-25K") */
  budgetRange?: string;
  /** Services provided (canonical field names) */
  services?: string[];
}

export interface CaseStudyCarouselProps {
  /** Section title */
  title?: string;
  /** Section subtitle/description */
  subtitle?: string;
  /** Array of case studies to display */
  caseStudies: CaseStudy[];
  /** Additional CSS classes */
  className?: string;
  /** Enable auto-rotation of slides */
  autoPlay?: boolean;
  /** Auto-play interval in milliseconds */
  autoPlayInterval?: number;
  /** Show progress bar */
  showProgress?: boolean;
  /** Show pagination dots */
  showPagination?: boolean;
  /** Show navigation arrows */
  showNavigation?: boolean;
  /** Number of slides to show simultaneously */
  slidesToShow?: number;
  /** Enable infinite loop */
  infinite?: boolean;
  /** Callback when case study card is clicked */
  onCaseStudyClick?: (caseStudy: CaseStudy) => void;
  /** Filter by service category */
  filterByCategory?: string[];
  /** Sort order for case studies */
  sortBy?: "date" | "featured" | "client" | "category";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
  /** Enable drag/swipe functionality */
  enableDrag?: boolean;
  /** Carousel variant */
  variant?: "default" | "compact" | "detailed" | "grid";
}

// ============================================================================
// Service-Specific Type Exports
// ============================================================================

export interface WebDevCaseStudyCarousel extends CaseStudyCarouselProps {
  caseStudies: CaseStudy[];
}

export interface VideoProductionCaseStudyCarousel extends CaseStudyCarouselProps {
  caseStudies: CaseStudy[];
}

export interface LeadGenerationCaseStudyCarousel extends CaseStudyCarouselProps {
  caseStudies: CaseStudy[];
}

export interface MarketingAutomationCaseStudyCarousel extends CaseStudyCarouselProps {
  caseStudies: CaseStudy[];
}

export interface SEOServicesCaseStudyCarousel extends CaseStudyCarouselProps {
  caseStudies: CaseStudy[];
}

export interface ContentProductionCaseStudyCarousel extends CaseStudyCarouselProps {
  caseStudies: CaseStudy[];
}

// ============================================================================
// Input Validation Types
// ============================================================================

/**
 * Flexible input format for case studies data
 * Supports various data source structures
 */
export type CaseStudyInput = 
  | CaseStudy[]
  | { items?: CaseStudy[] }
  | { caseStudies?: CaseStudy[] }
  | { studies?: CaseStudy[] }
  | { projects?: CaseStudy[] }
  | null
  | undefined;

/**
 * Section-level props for service pages
 */
export interface CaseStudyCarouselSection {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Case studies data in various formats */
  data: CaseStudyInput;
  /** Display configuration */
  config?: Partial<CaseStudyCarouselProps>;
  /** Service-specific filtering */
  serviceFilter?: string;
  /** Maximum number of case studies to display */
  limit?: number;
}

// ============================================================================
// Legacy Alias Support
// ============================================================================

/**
 * Legacy field mappings for backward compatibility
 */
export interface LegacyCaseStudy {
  id?: string;
  // Content fields (canonical: title, description)
  title?: string;
  name?: string;          // alias
  headline?: string;      // alias
  description?: string;
  summary?: string;       // alias
  content?: string;       // alias
  
  // Client fields (canonical: client)
  client?: string;
  company?: string;       // alias
  clientName?: string;    // alias
  
  // Category fields (canonical: category)
  category?: string;
  service?: string;       // alias
  type?: string;          // alias
  
  // Visual fields (canonical: image)
  image?: string;
  imageUrl?: string;      // alias
  thumbnail?: string;     // alias
  heroImage?: string;     // alias
  
  // Link fields (canonical: link)
  link?: string;
  url?: string;           // alias
  href?: string;          // alias
  caseStudyUrl?: string;  // alias
  
  // Metrics (canonical: metrics)
  metrics?: CaseStudyMetric[];
  results?: CaseStudyMetric[]; // alias
  kpis?: CaseStudyMetric[];    // alias
  
  // Other fields
  tags?: string[];
  date?: string;
  featured?: boolean;
  industry?: string;
  duration?: string;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Carousel behavior configuration
 */
export interface CarouselConfig {
  autoPlay: boolean;
  autoPlayInterval: number;
  showProgress: boolean;
  showPagination: boolean;
  showNavigation: boolean;
  slidesToShow: number;
  infinite: boolean;
  enableDrag: boolean;
  pauseOnHover: boolean;
  swipeThreshold: number;
}

/**
 * Visual styling configuration
 */
export interface CarouselStyling {
  variant: "default" | "compact" | "detailed" | "grid";
  cardAspectRatio: "16:9" | "4:3" | "1:1" | "3:2";
  showMetrics: boolean;
  showTags: boolean;
  showResults: boolean;
  maxDescriptionLength: number;
  imageLoadingStrategy: "lazy" | "eager" | "auto";
}

/**
 * Complete carousel configuration combining behavior and styling
 */
export interface CaseStudyCarouselConfiguration {
  behavior: Partial<CarouselConfig>;
  styling: Partial<CarouselStyling>;
  accessibility: {
    enableKeyboardNavigation: boolean;
    announceSlideChanges: boolean;
    reducedMotion: boolean;
  };
}

// ============================================================================
// Event Handler Types
// ============================================================================

export type CaseStudyClickHandler = (caseStudy: CaseStudy, index: number) => void;
export type CarouselNavigationHandler = (direction: "next" | "prev" | number) => void;
export type CarouselStateChangeHandler = (state: {
  currentIndex: number;
  isPlaying: boolean;
  isDragging: boolean;
}) => void;

// ============================================================================
// Filter and Sort Types
// ============================================================================

export interface CaseStudyFilter {
  categories?: string[];
  industries?: string[];
  services?: string[];
  featured?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
}

export interface CaseStudySortOptions {
  field: "date" | "client" | "category" | "featured" | "title";
  direction: "asc" | "desc";
  featured?: "first" | "last" | "mixed";
}

// ============================================================================
// Analytics and Tracking Types
// ============================================================================

export interface CaseStudyAnalytics {
  trackSlideViews: boolean;
  trackCaseStudyClicks: boolean;
  trackCarouselInteractions: boolean;
  customEvents?: {
    slideView?: string;
    caseStudyClick?: string;
    carouselPlay?: string;
    carouselPause?: string;
  };
}

// ============================================================================
// Responsive Configuration
// ============================================================================

export interface ResponsiveCarouselConfig {
  mobile: {
    slidesToShow: number;
    showNavigation: boolean;
    showPagination: boolean;
    enableDrag: boolean;
  };
  tablet: {
    slidesToShow: number;
    showNavigation: boolean;
    showPagination: boolean;
    enableDrag: boolean;
  };
  desktop: {
    slidesToShow: number;
    showNavigation: boolean;
    showPagination: boolean;
    enableDrag: boolean;
  };
}

// ============================================================================
// Export Union Types for Validation
// ============================================================================

export type CarouselVariant = NonNullable<CaseStudyCarouselProps['variant']>;
export type SortField = NonNullable<CaseStudySortOptions['field']>;
export type SortDirection = NonNullable<CaseStudySortOptions['direction']>;

// ============================================================================
// Component Ref Types
// ============================================================================

export interface CaseStudyCarouselRef {
  /** Navigate to specific slide */
  goToSlide: (index: number) => void;
  /** Navigate to next slide */
  nextSlide: () => void;
  /** Navigate to previous slide */
  prevSlide: () => void;
  /** Start/stop auto-play */
  setAutoPlay: (playing: boolean) => void;
  /** Get current slide index */
  getCurrentIndex: () => number;
  /** Get total number of slides */
  getTotalSlides: () => number;
  /** Refresh carousel (useful after data updates) */
  refresh: () => void;
}