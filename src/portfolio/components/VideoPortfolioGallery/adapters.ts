// src/components/ui/organisms/VideoPortfolioGallery/adapters.ts

import type { 
  VideoPortfolioGalleryProps, 
  VideoItem, 
  ClickBehavior 
} from "./VideoPortfolioGallery.types";

/**
 * VideoPortfolioGallery Data Adapters for Service Templates
 * Maps raw service page data to VideoPortfolioGallery component props
 */

// ============================================================================
// Input Types (What Service Pages Provide)
// ============================================================================

export interface VideoPortfolioInput {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Array of video items */
  videos?: VideoInput[];
  /** Legacy field support */
  items?: VideoInput[];
  portfolio?: VideoInput[];
  gallery?: VideoInput[];
  /** Configuration options */
  columns?: VideoPortfolioGalleryProps['columns'];
  maxItems?: number;
  variant?: VideoPortfolioGalleryProps['variant'];
  clickBehavior?: ClickBehavior;
  lightbox?: boolean;
  showHeader?: boolean;
}

export interface VideoInput {
  id?: string;
  title: string;
  thumbnail: string;
  src: string;
  embedUrl?: string;
  duration?: string;
  tags?: string[];
  client?: string;
  description?: string;
  cta?: {
    label: string;
    href: string;
  };
  // Extended properties
  category?: string;
  metrics?: Record<string, string | number>;
  featured?: boolean;
  // Legacy field aliases
  name?: string;
  poster?: string;
  video?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  vimeoUrl?: string;
  project?: string;
  brand?: string;
  summary?: string;
  results?: Record<string, any>;
}

export type VideoPortfolioSection = {
  title?: string;
  subtitle?: string;
  data: VideoPortfolioInput | VideoInput[] | null | undefined;
}

// ============================================================================
// Core Transformation Functions
// ============================================================================

/**
 * Normalizes various video input formats into consistent VideoItem[]
 */
export const normalizeVideoInput = (input: VideoPortfolioInput | VideoInput[] | null | undefined): VideoItem[] => {
  if (!input) return [];
  
  // Handle direct array of videos
  if (Array.isArray(input)) {
    return input.map(normalizeVideoItem).filter(Boolean);
  }
  
  const videos: VideoItem[] = [];
  
  // Handle structured input with multiple possible arrays
  const possibleArrays = ['videos', 'items', 'portfolio', 'gallery'];
  
  for (const arrayKey of possibleArrays) {
    const array = (input as any)[arrayKey];
    if (Array.isArray(array)) {
      videos.push(...array.map(normalizeVideoItem).filter(Boolean));
    }
  }
  
  return videos;
};

/**
 * Normalizes a single video item with field mapping and validation
 */
export const normalizeVideoItem = (video: VideoInput): VideoItem | null => {
  if (!video) return null;
  
  // Extract title from various possible fields
  const title = video.title || video.name || 'Untitled Video';
  
  // Extract thumbnail from various possible fields
  const thumbnail = video.thumbnail || video.poster || '';
  if (!thumbnail) {
    console.warn(`Video "${title}" missing thumbnail/poster`);
  }
  
  // Extract video source from various possible fields
  const src = video.src || video.video || video.videoUrl || video.youtubeUrl || video.vimeoUrl || '';
  if (!src) {
    console.warn(`Video "${title}" missing src/video URL`);
    return null;
  }
  
  // Extract client from various possible fields
  const client = video.client || video.project || video.brand;
  
  // Extract description from various possible fields
  const description = video.description || video.summary;
  
  // Transform metrics/results
  const metrics = normalizeVideoMetrics(video.metrics || video.results);
  
  return {
    id: video.id || generateVideoId(title),
    title,
    thumbnail,
    src,
    embedUrl: video.embedUrl,
    duration: video.duration,
    tags: Array.isArray(video.tags) ? video.tags : [],
    client,
    description,
    cta: video.cta,
    category: video.category,
    metrics,
    featured: Boolean(video.featured)
  };
};

/**
 * Normalizes metrics/results data
 */
export const normalizeVideoMetrics = (metrics: any): Record<string, string | number> | undefined => {
  if (!metrics || typeof metrics !== 'object') return undefined;
  
  const normalized: Record<string, string | number> = {};
  
  // Common metric mappings
  const metricMappings: Record<string, string[]> = {
    'Views': ['views', 'view_count', 'total_views'],
    'Engagement': ['engagement', 'engagement_rate', 'engagement_percent'],
    'Shares': ['shares', 'share_count', 'total_shares'],
    'Leads': ['leads', 'lead_count', 'conversions'],
    'CTR': ['ctr', 'click_through_rate', 'clickthrough'],
    'Duration': ['avg_duration', 'watch_time', 'average_view_duration']
  };
  
  // Normalize known metrics
  for (const [displayName, possibleKeys] of Object.entries(metricMappings)) {
    for (const key of possibleKeys) {
      if (metrics[key] !== undefined) {
        normalized[displayName] = formatMetricValue(metrics[key]);
        break;
      }
    }
  }
  
  // Include other metrics as-is
  for (const [key, value] of Object.entries(metrics)) {
    const isAlreadyMapped = Object.values(metricMappings).flat().includes(key);
    if (!isAlreadyMapped && value !== undefined) {
      normalized[key] = formatMetricValue(value);
    }
  }
  
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

/**
 * Formats metric values for display
 */
export const formatMetricValue = (value: any): string | number => {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value;
  }
  
  if (typeof value === 'string') {
    // If it's already formatted or a percentage, return as-is
    if (value.includes('%') || value.includes('K') || value.includes('M')) {
      return value;
    }
    
    // Try to parse as number for formatting
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return formatMetricValue(numValue);
    }
  }
  
  return String(value);
};

/**
 * Generates a safe ID from video title
 */
export const generateVideoId = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// ============================================================================
// Service-Specific Adapter Functions
// ============================================================================

/**
 * Creates VideoPortfolio section for Video Production services
 */
export const createVideoProductionPortfolioSection = (
  input: VideoPortfolioInput | VideoInput[],
  overrides: Partial<VideoPortfolioGalleryProps> = {}
): VideoPortfolioGalleryProps => ({
  title: "Video Production Portfolio",
  subtitle: "Professional video content that drives engagement and conversion",
  items: normalizeVideoInput(input),
  columns: 3,
  variant: "default",
  clickBehavior: "lightbox",
  lightbox: true,
  showHeader: true,
  ...overrides
});

/**
 * Creates VideoPortfolio section for Marketing Services
 */
export const createMarketingVideoPortfolioSection = (
  input: VideoPortfolioInput | VideoInput[],
  overrides: Partial<VideoPortfolioGalleryProps> = {}
): VideoPortfolioGalleryProps => ({
  title: "Video Marketing Results",
  subtitle: "Video campaigns that generate measurable business impact",
  items: normalizeVideoInput(input),
  columns: 2,
  variant: "grid",
  clickBehavior: "lightbox",
  lightbox: true,
  showHeader: true,
  ...overrides
});

/**
 * Creates VideoPortfolio section for Content Production
 */
export const createContentVideoPortfolioSection = (
  input: VideoPortfolioInput | VideoInput[],
  overrides: Partial<VideoPortfolioGalleryProps> = {}
): VideoPortfolioGalleryProps => ({
  title: "Video Content Library",
  subtitle: "Educational and promotional video content that informs and converts",
  items: normalizeVideoInput(input),
  columns: 3,
  variant: "grid",
  clickBehavior: "lightbox",
  lightbox: true,
  showHeader: true,
  ...overrides
});

/**
 * Creates VideoPortfolio highlights section (limited items)
 */
export const createVideoHighlightsSection = (
  input: VideoPortfolioInput | VideoInput[],
  overrides: Partial<VideoPortfolioGalleryProps> = {}
): VideoPortfolioGalleryProps => ({
  title: "Featured Video Work",
  subtitle: "Showcase of our best video production",
  items: normalizeVideoInput(input),
  columns: 3,
  maxItems: 3,
  variant: "highlights",
  clickBehavior: "lightbox",
  lightbox: true,
  showHeader: true,
  ...overrides
});

/**
 * Creates VideoPortfolio section for case studies
 */
export const createVideoCaseStudiesSection = (
  input: VideoPortfolioInput | VideoInput[],
  overrides: Partial<VideoPortfolioGalleryProps> = {}
): VideoPortfolioGalleryProps => ({
  title: "Video Case Studies",
  subtitle: "Behind-the-scenes look at successful video campaigns",
  items: normalizeVideoInput(input),
  columns: 2,
  variant: "grid",
  clickBehavior: "lightbox",
  lightbox: true,
  showHeader: true,
  ...overrides
});

// ============================================================================
// Template Integration Adapter
// ============================================================================

/**
 * Main adapter function for service templates
 * Auto-detects service type and applies appropriate defaults
 */
export const toVideoPortfolioProps = (
  section: VideoPortfolioSection,
  context?: { 
    hub?: string; 
    service?: string;
    serviceType?: 'video-production' | 'marketing' | 'content-production' | 'web-development' | 'seo' | 'lead-generation';
    level?: 'hub' | 'service' | 'subservice';
  }
): VideoPortfolioGalleryProps | null => {
  
  const input = section.data;
  if (!input) return null;
  
  const videos = normalizeVideoInput(input);
  if (videos.length === 0) return null;
  
  // Determine service type from context
  const serviceType = context?.serviceType || inferServiceType(context?.hub, context?.service);
  
  // Apply service-specific defaults
  const baseProps = {
    title: section.title,
    subtitle: section.subtitle,
    items: videos,
    // Allow section-level overrides
    columns: (input as VideoPortfolioInput)?.columns,
    maxItems: (input as VideoPortfolioInput)?.maxItems,
    variant: (input as VideoPortfolioInput)?.variant,
    clickBehavior: (input as VideoPortfolioInput)?.clickBehavior,
    lightbox: (input as VideoPortfolioInput)?.lightbox,
    showHeader: (input as VideoPortfolioInput)?.showHeader,
  };
  
  switch (serviceType) {
    case 'video-production':
      return createVideoProductionPortfolioSection(input, baseProps);
    case 'marketing':
      return createMarketingVideoPortfolioSection(input, baseProps);
    case 'content-production':
      return createContentVideoPortfolioSection(input, baseProps);
    default:
      // Generic fallback for other services
      return {
        title: section.title || "Video Portfolio",
        subtitle: section.subtitle,
        items: videos,
        columns: 3,
        variant: "default",
        clickBehavior: "lightbox",
        lightbox: true,
        showHeader: true,
        ...baseProps,
      };
  }
};

/**
 * Infers service type from hub/service context
 */
export const inferServiceType = (
  hub?: string, 
  service?: string
): 'video-production' | 'marketing' | 'content-production' | 'web-development' | 'seo' | 'lead-generation' | 'generic' => {
  
  const contextStr = `${hub || ''} ${service || ''}`.toLowerCase();
  
  if (contextStr.includes('video') || contextStr.includes('production')) return 'video-production';
  if (contextStr.includes('marketing') || contextStr.includes('advertising')) return 'marketing';
  if (contextStr.includes('content') || contextStr.includes('editorial')) return 'content-production';
  if (contextStr.includes('web') || contextStr.includes('development')) return 'web-development';
  if (contextStr.includes('seo') || contextStr.includes('search')) return 'seo';
  if (contextStr.includes('lead') || contextStr.includes('generation')) return 'lead-generation';
  
  return 'generic';
};

// ============================================================================
// Specialized Use Case Adapters
// ============================================================================

/**
 * Portfolio hub highlights (3-4 featured videos)
 */
export const createPortfolioHubVideoSection = (
  featuredVideos: VideoInput[]
): VideoPortfolioGalleryProps => ({
  title: "Video Production",
  subtitle: "Professional video content that drives engagement and conversion",
  items: normalizeVideoInput(featuredVideos).slice(0, 3),
  columns: 3,
  variant: "highlights",
  clickBehavior: "lightbox",
  lightbox: true,
  showHeader: true,
  maxItems: 3
});

/**
 * Service page video examples
 */
export const createServicePageVideoSection = (
  videos: VideoInput[],
  serviceContext: string
): VideoPortfolioGalleryProps => {
  const contextTitles: Record<string, string> = {
    'brand-films': 'Brand Film Portfolio',
    'testimonials': 'Customer Testimonial Videos',
    'explainers': 'Explainer Video Library',
    'product-demos': 'Product Demo Videos',
    'training': 'Training Video Content',
    'events': 'Event Video Coverage',
    'social-content': 'Social Media Video Content'
  };
  
  return {
    title: contextTitles[serviceContext] || "Video Examples",
    subtitle: `Professional ${serviceContext.replace('-', ' ')} video content`,
    items: normalizeVideoInput(videos),
    columns: 3,
    variant: "grid",
    clickBehavior: "lightbox",
    lightbox: true,
    showHeader: true
  };
};

/**
 * Client success stories with video testimonials
 */
export const createVideoTestimonialsSection = (
  testimonialVideos: VideoInput[]
): VideoPortfolioGalleryProps => ({
  title: "Client Success Stories",
  subtitle: "Hear directly from our clients about their video marketing results",
  items: normalizeVideoInput(testimonialVideos),
  columns: 2,
  variant: "grid",
  clickBehavior: "lightbox",
  lightbox: true,
  showHeader: true
});

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates VideoPortfolio input data
 */
export const validateVideoPortfolioInput = (input: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  data?: VideoPortfolioInput 
} => {
  const errors: string[] = [];
  
  if (!input) {
    return { isValid: false, errors: ['VideoPortfolio input is required'] };
  }
  
  if (Array.isArray(input)) {
    if (input.length === 0) {
      errors.push('Videos array cannot be empty');
    }
    
    input.forEach((video, index) => {
      if (!video || typeof video !== 'object') {
        errors.push(`Video at index ${index} must be an object`);
      } else if (!video.title && !video.name) {
        errors.push(`Video at index ${index} must have a title or name`);
      } else if (!video.src && !video.video && !video.videoUrl && !video.youtubeUrl && !video.vimeoUrl) {
        errors.push(`Video at index ${index} must have a video source URL`);
      } else if (!video.thumbnail && !video.poster) {
        errors.push(`Video at index ${index} must have a thumbnail/poster image`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? { videos: input } : undefined
    };
  }
  
  if (typeof input === 'object') {
    const videoInput = input as VideoPortfolioInput;
    const hasAnyVideos = ['videos', 'items', 'portfolio', 'gallery']
      .some(key => Array.isArray((videoInput as any)[key]) && (videoInput as any)[key].length > 0);
    
    if (!hasAnyVideos) {
      errors.push('VideoPortfolio must have at least one video in any supported array field');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? videoInput : undefined
    };
  }
  
  return { isValid: false, errors: ['Invalid VideoPortfolio input format'] };
};

// Export main adapter function for template usage
export { toVideoPortfolioProps as toVideoPortfolioAdapter };