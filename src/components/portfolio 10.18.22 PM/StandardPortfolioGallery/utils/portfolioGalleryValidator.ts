// src/components/portfolio/StandardPortfolioGallery/utils/portfolioGalleryValidator.ts

import { z } from "zod";
import type { 
  PortfolioItem, 
  PortfolioSection, 
  PortfolioInput,
  StandardPortfolioGalleryProps,
  MediaType,
  FilterState
} from "../StandardPortfolioGallery.types";

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Media item schema
 */
const mediaItemSchema = z.object({
  type: z.enum(["image", "video", "interactive", "pdf"]),
  src: z.string().min(1, "Media source is required"),
  alt: z.string().optional(),
  thumbnail: z.string().optional(),
  poster: z.string().optional(),
  title: z.string().optional()
});

/**
 * Portfolio metrics schema
 */
const metricsSchema = z.record(
  z.union([z.string(), z.number()])
);

/**
 * Base portfolio item schema with validation rules
 */
export const portfolioItemSchema = z.object({
  id: z.string().min(1, "Portfolio item ID is required"),
  title: z.string().min(1, "Portfolio item title is required"),
  description: z.string().optional(),
  media: mediaItemSchema,
  category: z.string().min(1, "Portfolio item category is required"),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  client: z.string().optional(),
  metrics: metricsSchema.optional(),
  href: z.string().optional(),
  hub: z.string().optional(),
  service: z.string().optional()
});

/**
 * Filter state schema
 */
const filterStateSchema = z.object({
  mediaType: z.union([
    z.enum(["image", "video", "interactive", "pdf"]),
    z.literal("all")
  ]),
  featured: z.union([z.boolean(), z.literal("all")]),
  tags: z.array(z.string())
});

/**
 * Portfolio gallery props schema
 */
const portfolioGalleryPropsSchema = z.object({
  items: z.array(portfolioItemSchema).min(1, "At least one portfolio item is required"),
  maxItems: z.number().positive().optional(),
  showSearch: z.boolean().optional(),
  showFilters: z.boolean().optional(),
  columns: z.enum([1, 2, 3, 4]).optional(),
  variant: z.enum(["grid", "masonry", "list"]).optional(),
  onModalOpen: z.function().optional(),
  onItemClick: z.function().optional(),
  className: z.string().optional(),
  emptyStateText: z.string().optional(),
  searchPlaceholder: z.string().optional(),
  "aria-label": z.string().optional()
});

/**
 * Portfolio section schema for service pages
 */
export const portfolioSectionSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  data: z.union([
    z.array(portfolioItemSchema),
    z.object({ portfolio: z.array(portfolioItemSchema).optional() }),
    z.object({ projects: z.array(portfolioItemSchema).optional() }),
    z.object({ items: z.array(portfolioItemSchema).optional() }),
    z.null(),
    z.undefined()
  ]),
  maxItems: z.number().positive().optional(),
  showSearch: z.boolean().optional(),
  showFilters: z.boolean().optional(),
  columns: z.enum([1, 2, 3, 4]).optional(),
  variant: z.enum(["grid", "masonry", "list"]).optional(),
  featuredOnly: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional()
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a single portfolio item
 */
export const validatePortfolioItem = (item: unknown): item is PortfolioItem => {
  const result = portfolioItemSchema.safeParse(item);
  return result.success;
};

/**
 * Safely parses a portfolio item with detailed error reporting
 */
export const parsePortfolioItem = (item: unknown): { 
  success: boolean; 
  data?: PortfolioItem; 
  error?: string 
} => {
  const result = portfolioItemSchema.safeParse(item);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

/**
 * Validates portfolio gallery props
 */
export const validatePortfolioGalleryProps = (props: unknown): props is StandardPortfolioGalleryProps => {
  const result = portfolioGalleryPropsSchema.safeParse(props);
  return result.success;
};

/**
 * Safely parses portfolio gallery props
 */
export const parsePortfolioGalleryProps = (props: unknown): { 
  success: boolean; 
  data?: StandardPortfolioGalleryProps; 
  error?: string 
} => {
  const result = portfolioGalleryPropsSchema.safeParse(props);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

/**
 * Safely parse portfolio section with detailed error reporting
 */
export const parsePortfolioSection = (section: unknown): { 
  success: boolean; 
  data?: PortfolioSection; 
  error?: string 
} => {
  const result = portfolioSectionSchema.safeParse(section);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

// ============================================================================
// Advanced Validation Functions
// ============================================================================

/**
 * Validates and cleans a portfolio gallery input
 */
export const validateAndCleanPortfolioGallery = (input: unknown): {
  isValid: boolean;
  errors: string[];
  cleanedData?: PortfolioItem[];
} => {
  const errors: string[] = [];
  const cleanedData: PortfolioItem[] = [];
  
  if (!input) {
    return { isValid: false, errors: ['Input is required'] };
  }
  
  let items: unknown[] = [];
  
  if (Array.isArray(input)) {
    items = input;
  } else if (typeof input === 'object') {
    const obj = input as any;
    if (Array.isArray(obj.portfolio)) items = obj.portfolio;
    else if (Array.isArray(obj.projects)) items = obj.projects;
    else if (Array.isArray(obj.items)) items = obj.items;
    else {
      return { isValid: false, errors: ['No valid portfolio array found'] };
    }
  } else {
    return { isValid: false, errors: ['Input must be array or object'] };
  }
  
  items.forEach((item, index) => {
    const parseResult = parsePortfolioItem(item);
    if (parseResult.success && parseResult.data) {
      cleanedData.push(parseResult.data);
    } else {
      errors.push(`Item ${index}: ${parseResult.error || 'Invalid item'}`);
    }
  });
  
  return {
    isValid: errors.length === 0 && cleanedData.length > 0,
    errors,
    cleanedData: cleanedData.length > 0 ? cleanedData : undefined
  };
};

/**
 * Validates if a media type is valid
 */
export const isValidMediaType = (mediaType: unknown): mediaType is MediaType => {
  return typeof mediaType === 'string' && 
         ['image', 'video', 'interactive', 'pdf'].includes(mediaType);
};

/**
 * Gets all valid media types
 */
export const getValidMediaTypes = (): MediaType[] => {
  return ['image', 'video', 'interactive', 'pdf'];
};

/**
 * Validates filter state
 */
export const validateFilterState = (filterState: unknown): filterState is FilterState => {
  const result = filterStateSchema.safeParse(filterState);
  return result.success;
};

/**
 * Normalizes portfolio categories from an array of items
 */
export const extractPortfolioCategories = (portfolioItems: PortfolioItem[]): string[] => {
  const categories = new Set<string>();
  portfolioItems.forEach(item => {
    if (item.category && item.category.trim()) {
      categories.add(item.category.trim());
    }
  });
  return Array.from(categories).sort();
};

/**
 * Normalizes tags from an array of portfolio items
 */
export const extractPortfolioTags = (portfolioItems: PortfolioItem[]): string[] => {
  const tags = new Set<string>();
  portfolioItems.forEach(item => {
    if (item.tags) {
      item.tags.forEach(tag => {
        if (tag && tag.trim()) {
          tags.add(tag.trim());
        }
      });
    }
  });
  return Array.from(tags).sort();
};

/**
 * Validates portfolio item media requirements
 */
export const validatePortfolioMedia = (media: unknown): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!media || typeof media !== 'object') {
    errors.push('Media object is required');
    return { isValid: false, errors, warnings };
  }
  
  const mediaObj = media as any;
  
  // Required fields
  if (!mediaObj.type) {
    errors.push('Media type is required');
  } else if (!isValidMediaType(mediaObj.type)) {
    errors.push(`Invalid media type: ${mediaObj.type}. Must be one of: ${getValidMediaTypes().join(', ')}`);
  }
  
  if (!mediaObj.src) {
    errors.push('Media source (src) is required');
  } else if (typeof mediaObj.src !== 'string' || !mediaObj.src.trim()) {
    errors.push('Media source must be a non-empty string');
  }
  
  // Recommended fields
  if (!mediaObj.alt && mediaObj.type === 'image') {
    warnings.push('Alt text is recommended for image media');
  }
  
  if (!mediaObj.thumbnail && ['video', 'interactive', 'pdf'].includes(mediaObj.type)) {
    warnings.push(`Thumbnail is recommended for ${mediaObj.type} media`);
  }
  
  if (!mediaObj.poster && mediaObj.type === 'video') {
    warnings.push('Poster image is recommended for video media');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates portfolio gallery configuration
 */
export const validatePortfolioGalleryConfig = (config: {
  items: unknown[];
  maxItems?: number;
  columns?: number;
  showSearch?: boolean;
  showFilters?: boolean;
}): {
  isValid: boolean;
  errors: string[];
  recommendations: string[];
} => {
  const errors: string[] = [];
  const recommendations: string[] = [];
  
  // Items validation
  if (!Array.isArray(config.items)) {
    errors.push('Items must be an array');
  } else if (config.items.length === 0) {
    errors.push('At least one portfolio item is required');
  }
  
  // Max items validation
  if (config.maxItems !== undefined) {
    if (typeof config.maxItems !== 'number' || config.maxItems <= 0) {
      errors.push('maxItems must be a positive number');
    } else if (config.maxItems > 50) {
      recommendations.push('Consider pagination for large portfolios (>50 items)');
    }
  }
  
  // Columns validation
  if (config.columns !== undefined) {
    if (![1, 2, 3, 4].includes(config.columns)) {
      errors.push('Columns must be 1, 2, 3, or 4');
    }
  }
  
  // Performance recommendations
  if (config.items.length > 20 && config.showSearch === false) {
    recommendations.push('Enable search for large portfolios to improve usability');
  }
  
  if (config.items.length > 15 && config.showFilters === false) {
    recommendations.push('Enable filters for large portfolios to improve navigation');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    recommendations
  };
};

/**
 * Validates service-specific portfolio requirements
 */
export const validateServicePortfolioRequirements = (
  items: PortfolioItem[],
  serviceType: 'web-dev' | 'video' | 'seo' | 'marketing' | 'lead-gen' | 'content'
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const serviceRequirements = {
    'web-dev': {
      recommendedMediaTypes: ['image', 'interactive'],
      requiredFields: ['href'],
      minItems: 3
    },
    'video': {
      recommendedMediaTypes: ['video'],
      requiredFields: ['media.poster'],
      minItems: 2
    },
    'seo': {
      recommendedMediaTypes: ['image'],
      requiredFields: ['metrics'],
      minItems: 4
    },
    'marketing': {
      recommendedMediaTypes: ['image', 'video'],
      requiredFields: ['metrics', 'client'],
      minItems: 5
    },
    'lead-gen': {
      recommendedMediaTypes: ['image', 'interactive'],
      requiredFields: ['metrics'],
      minItems: 3
    },
    'content': {
      recommendedMediaTypes: ['image', 'pdf'],
      requiredFields: ['client'],
      minItems: 4
    }
  };
  
  const requirements = serviceRequirements[serviceType];
  
  // Check minimum items
  if (items.length < requirements.minItems) {
    warnings.push(`Consider having at least ${requirements.minItems} portfolio items for ${serviceType} services`);
  }
  
  // Check media types
  const mediaTypes = items.map(item => item.media.type);
  const hasRecommendedType = requirements.recommendedMediaTypes.some(type => mediaTypes.includes(type as MediaType));
  
  if (!hasRecommendedType) {
    warnings.push(`Consider including ${requirements.recommendedMediaTypes.join(' or ')} media for ${serviceType} services`);
  }
  
  // Check required fields
  requirements.requiredFields.forEach(field => {
    const hasField = items.some(item => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return (item as any)[parent] && (item as any)[parent][child];
      }
      return (item as any)[field];
    });
    
    if (!hasField) {
      warnings.push(`Consider adding ${field} to portfolio items for better ${serviceType} presentation`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};