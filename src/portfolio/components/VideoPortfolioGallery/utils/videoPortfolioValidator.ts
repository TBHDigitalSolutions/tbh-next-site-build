// src/components/ui/organisms/VideoPortfolioGallery/utils/videoPortfolioValidator.ts

import { z } from "zod";
import type { VideoItem, VideoPortfolioGalleryProps } from "../VideoPortfolioGallery.types";

// ============================================================================
// Enhanced Zod Schemas for Better Validation
// ============================================================================

/**
 * Video CTA schema
 */
export const videoCTASchema = z.object({
  label: z.string().min(1, "CTA label is required"),
  href: z.string().url("CTA href must be a valid URL").or(z.string().regex(/^\//, "Internal links must start with /"))
});

/**
 * Enhanced VideoItem schema with comprehensive validation
 */
export const videoItemSchema = z.object({
  id: z.string().min(1, "Video ID is required"),
  title: z.string().min(1, "Video title is required"),
  thumbnail: z.string().min(1, "Video thumbnail is required"),
  src: z.string().min(1, "Video src is required"),
  embedUrl: z.string().optional(),
  duration: z.string().optional(),
  tags: z.array(z.string()).optional(),
  client: z.string().optional(),
  description: z.string().optional(),
  cta: videoCTASchema.optional(),
  category: z.string().optional(),
  metrics: z.record(z.union([z.string(), z.number()])).optional(),
  featured: z.boolean().optional()
});

/**
 * VideoPortfolioGallery props schema
 */
export const videoPortfolioPropsSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(videoItemSchema).min(1, "At least one video item is required"),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  maxItems: z.number().positive().optional(),
  lightbox: z.boolean().optional(),
  clickBehavior: z.enum(["lightbox", "inline", "newtab"]).optional(),
  externalTarget: z.enum(["_blank", "_self"]).optional(),
  className: z.string().optional(),
  variant: z.enum(["default", "grid", "highlights"]).optional(),
  showHeader: z.boolean().optional(),
  loading: z.boolean().optional(),
  emptyMessage: z.string().optional()
});

/**
 * Input validation schemas (what adapters accept)
 */
export const videoInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  thumbnail: z.string().optional(),
  src: z.string().optional(),
  embedUrl: z.string().optional(),
  duration: z.string().optional(),
  tags: z.array(z.string()).optional(),
  client: z.string().optional(),
  description: z.string().optional(),
  cta: videoCTASchema.optional(),
  category: z.string().optional(),
  metrics: z.record(z.union([z.string(), z.number()])).optional(),
  featured: z.boolean().optional(),
  // Legacy field aliases
  name: z.string().optional(),
  poster: z.string().optional(),
  video: z.string().optional(),
  videoUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),
  vimeoUrl: z.string().optional(),
  project: z.string().optional(),
  brand: z.string().optional(),
  summary: z.string().optional(),
  results: z.record(z.any()).optional()
}).refine(
  data => data.title || data.name,
  "Video must have a title or name"
).refine(
  data => data.src || data.video || data.videoUrl || data.youtubeUrl || data.vimeoUrl,
  "Video must have a source URL"
);

export const videoPortfolioInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  videos: z.array(videoInputSchema).optional(),
  items: z.array(videoInputSchema).optional(),
  portfolio: z.array(videoInputSchema).optional(),
  gallery: z.array(videoInputSchema).optional(),
  columns: z.number().optional(),
  maxItems: z.number().optional(),
  variant: z.string().optional(),
  clickBehavior: z.string().optional(),
  lightbox: z.boolean().optional(),
  showHeader: z.boolean().optional()
}).refine(
  data => data.videos || data.items || data.portfolio || data.gallery,
  "At least one video array must be provided"
);

// ============================================================================
// Enhanced Validation Functions
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ItemValidationResult extends ValidationResult {
  item: VideoItem;
  index: number;
}

/**
 * Validates video item with enhanced checks
 */
export const validateVideoItem = (video: unknown): video is VideoItem => {
  const result = videoItemSchema.safeParse(video);
  return result.success;
};

/**
 * Validates video input with detailed error reporting
 */
export const parseVideoItem = (video: unknown): { 
  success: boolean; 
  data?: VideoItem; 
  error?: string 
} => {
  const result = videoItemSchema.safeParse(video);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

/**
 * Enhanced video portfolio validation with comprehensive checks
 */
export function validateVideoPortfolioData(items: VideoItem[]): ValidationResult {
  const results: ItemValidationResult[] = [];
  const globalErrors: string[] = [];
  const globalWarnings: string[] = [];

  // Check for empty dataset
  if (items.length === 0) {
    globalWarnings.push("No video items provided - this will render an empty state");
  }

  // Check for duplicate IDs
  const ids = items.map(item => item.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    globalErrors.push(`Duplicate IDs found: ${duplicateIds.join(", ")}`);
  }

  // Check for performance considerations
  if (items.length > 20) {
    globalWarnings.push("Large number of videos (>20) may impact performance. Consider pagination or lazy loading.");
  }

  // Validate each item
  items.forEach((item, index) => {
    const result = validateVideoItemDetailed(item, index);
    results.push(result);
  });

  // Aggregate results
  const allErrors = [
    ...globalErrors,
    ...results.flatMap(r => r.errors)
  ];
  const allWarnings = [
    ...globalWarnings,
    ...results.flatMap(r => r.warnings)
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Enhanced individual video item validation
 */
function validateVideoItemDetailed(item: VideoItem, index: number): ItemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Enhanced URL validation
  if (item.src) {
    const srcResult = validateVideoUrlEnhanced(item.src, `Item ${index} src`);
    errors.push(...srcResult.errors);
    warnings.push(...srcResult.warnings);
  }

  if (item.embedUrl) {
    const embedResult = validateVideoUrlEnhanced(item.embedUrl, `Item ${index} embedUrl`);
    errors.push(...embedResult.errors);
    warnings.push(...embedResult.warnings);
  }

  if (item.thumbnail) {
    const thumbResult = validateImageUrlEnhanced(item.thumbnail, `Item ${index} thumbnail`);
    errors.push(...thumbResult.errors);
    warnings.push(...thumbResult.warnings);
  }

  // Enhanced duration validation
  if (item.duration && !isValidDurationFormat(item.duration)) {
    warnings.push(`Item ${index}: Duration format "${item.duration}" may not be standard (expected: "MM:SS" or "H:MM:SS")`);
  }

  // Tag validation
  if (item.tags && item.tags.length > 10) {
    warnings.push(`Item ${index}: Large number of tags (${item.tags.length}) may impact UI performance`);
  }

  // Metrics validation
  if (item.metrics) {
    const metricsResult = validateVideoMetrics(item.metrics, index);
    warnings.push(...metricsResult.warnings);
  }

  // Accessibility warnings
  if (!item.description && item.featured) {
    warnings.push(`Item ${index}: Featured video should have a description for accessibility`);
  }

  if (item.title.length > 100) {
    warnings.push(`Item ${index}: Long title (${item.title.length} chars) may be truncated in UI`);
  }

  // SEO and performance warnings
  if (!item.category) {
    warnings.push(`Item ${index}: Missing category may impact organization and filtering`);
  }

  return {
    item,
    index,
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Enhanced video URL validation
 */
function validateVideoUrlEnhanced(url: string, context: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic URL format check
  if (!isValidUrl(url)) {
    errors.push(`${context}: Invalid URL format`);
    return { isValid: false, errors, warnings };
  }

  const lowerUrl = url.toLowerCase();
  
  // Platform-specific validation with enhanced checks
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    validateYouTubeUrl(url, context, warnings);
  } else if (lowerUrl.includes('vimeo.com')) {
    validateVimeoUrl(url, context, warnings);
  } else if (isLocalFile(url)) {
    validateLocalVideoFile(url, context, warnings);
  } else {
    // External video file
    const hasVideoExtension = /\.(mp4|webm|ogg|mov|avi|mkv|m4v)(\?|$)/i.test(url);
    if (!hasVideoExtension) {
      warnings.push(`${context}: External URL doesn't have a recognized video extension`);
    }
  }

  // Check for common issues
  if (url.includes('localhost')) {
    warnings.push(`${context}: Localhost URLs will not work in production`);
  }

  if (url.startsWith('http://')) {
    warnings.push(`${context}: HTTP URLs may cause mixed content issues on HTTPS sites`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * YouTube-specific validation
 */
function validateYouTubeUrl(url: string, context: string, warnings: string[]) {
  const youtubeIdRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeIdRegex);
  
  if (!match) {
    warnings.push(`${context}: YouTube URL may not contain a valid video ID`);
  }

  if (url.includes('watch?v=') && !url.includes('embed')) {
    warnings.push(`${context}: YouTube watch URLs work but embed URLs are more reliable for iframe playback`);
  }

  // Check for privacy-enhanced embedding
  if (url.includes('youtube.com') && !url.includes('youtube-nocookie.com')) {
    warnings.push(`${context}: Consider using youtube-nocookie.com for privacy-enhanced embedding`);
  }
}

/**
 * Vimeo-specific validation
 */
function validateVimeoUrl(url: string, context: string, warnings: string[]) {
  const vimeoIdRegex = /vimeo\.com\/(\d+)/;
  const match = url.match(vimeoIdRegex);
  
  if (!match) {
    warnings.push(`${context}: Vimeo URL may not contain a valid video ID`);
  }

  if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
    warnings.push(`${context}: Vimeo page URLs work but player.vimeo.com URLs are optimized for embedding`);
  }
}

/**
 * Local video file validation
 */
function validateLocalVideoFile(url: string, context: string, warnings: string[]) {
  const hasVideoExtension = /\.(mp4|webm|ogg|mov|avi|mkv|m4v)(\?|$)/i.test(url);
  if (!hasVideoExtension) {
    warnings.push(`${context}: Local file doesn't have a recognized video extension`);
  }

  // Web-optimized format recommendations
  if (!url.includes('.mp4') && !url.includes('.webm')) {
    warnings.push(`${context}: Consider MP4 or WebM formats for best browser compatibility`);
  }
}

/**
 * Enhanced image URL validation
 */
function validateImageUrlEnhanced(url: string, context: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isValidUrl(url)) {
    errors.push(`${context}: Invalid URL format`);
    return { isValid: false, errors, warnings };
  }

  const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?|$)/i.test(url);
  if (!hasImageExtension) {
    warnings.push(`${context}: URL doesn't have a recognized image extension`);
  }

  // Performance recommendations
  if (url.includes('.gif') && !url.includes('optimize')) {
    warnings.push(`${context}: Large GIF files may impact performance - consider WebP or optimized formats`);
  }

  // Next.js Image optimization compatibility
  if (url.startsWith('http') && !url.includes('/_next/image')) {
    warnings.push(`${context}: External images should be optimized through Next.js Image component`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Video metrics validation
 */
function validateVideoMetrics(metrics: Record<string, string | number>, index: number): { warnings: string[] } {
  const warnings: string[] = [];

  // Check for common metric formatting issues
  Object.entries(metrics).forEach(([key, value]) => {
    if (typeof value === 'string') {
      if (value.includes('undefined') || value.includes('null')) {
        warnings.push(`Item ${index}: Metric "${key}" contains invalid value: ${value}`);
      }
    }
    
    if (typeof value === 'number' && value < 0) {
      warnings.push(`Item ${index}: Metric "${key}" has negative value, which may be incorrect`);
    }
  });

  return { warnings };
}

/**
 * Enhanced duration format validation
 */
function isValidDurationFormat(duration: string): boolean {
  // Matches MM:SS, H:MM:SS, HH:MM:SS, or M:SS
  const standardFormats = /^\d{1,2}:\d{2}(:\d{2})?$/;
  const descriptiveFormats = /^\d+\s*(min|minutes?|sec|seconds?|hrs?|hours?)$/i;
  
  return standardFormats.test(duration) || descriptiveFormats.test(duration);
}

/**
 * Check if URL is a local file
 */
function isLocalFile(url: string): boolean {
  return url.startsWith('/') || 
         url.includes('localhost') || 
         url.startsWith('./') || 
         url.startsWith('../') ||
         (typeof window !== 'undefined' && url.includes(window.location.host));
}

/**
 * Enhanced URL validation
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Service-Specific Validation
// ============================================================================

/**
 * Video production service-specific validation
 */
export function validateVideoProductionPortfolio(items: VideoItem[]): ValidationResult {
  const baseResult = validateVideoPortfolioData(items);
  const warnings = [...baseResult.warnings];

  // Video production specific checks
  const hasClientWork = items.some(item => item.client);
  if (!hasClientWork) {
    warnings.push("Video production portfolio should showcase client work");
  }

  const hasCaseStudies = items.some(item => item.description && item.metrics);
  if (!hasCaseStudies) {
    warnings.push("Consider including case studies with metrics for video production showcase");
  }

  const hasVariety = new Set(items.map(item => item.category)).size >= 3;
  if (!hasVariety) {
    warnings.push("Video portfolio should demonstrate range with different types of video content");
  }

  return {
    ...baseResult,
    warnings
  };
}

/**
 * Marketing service video validation
 */
export function validateMarketingVideoPortfolio(items: VideoItem[]): ValidationResult {
  const baseResult = validateVideoPortfolioData(items);
  const warnings = [...baseResult.warnings];

  // Marketing specific checks
  const hasMetrics = items.some(item => item.metrics);
  if (!hasMetrics) {
    warnings.push("Marketing videos should include performance metrics");
  }

  const hasCTAs = items.some(item => item.cta);
  if (!hasCTAs) {
    warnings.push("Marketing videos should include CTAs for conversion tracking");
  }

  return {
    ...baseResult,
    warnings
  };
}

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Enhanced development logging
 */
export function logValidationResults(items: VideoItem[], label = "Video Portfolio"): void {
  if (process.env.NODE_ENV !== 'development') return;

  const result = validateVideoPortfolioData(items);
  
  console.group(`🎬 ${label} Validation Results`);
  
  if (result.isValid) {
    console.log("✅ All items are valid!");
  } else {
    console.error(`❌ Found ${result.errors.length} error(s):`);
    result.errors.forEach(error => console.error(`  • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn(`⚠️ Found ${result.warnings.length} warning(s):`);
    result.warnings.forEach(warning => console.warn(`  • ${warning}`));
  }

  // Additional stats for development
  console.log(`📊 Portfolio Stats:`, {
    totalVideos: items.length,
    featuredCount: items.filter(i => i.featured).length,
    withMetrics: items.filter(i => i.metrics).length,
    categories: new Set(items.map(i => i.category).filter(Boolean)).size,
    averageTagsPerVideo: items.reduce((sum, i) => sum + (i.tags?.length || 0), 0) / items.length
  });

  console.groupEnd();
}

/**
 * Quick validation helper with enhanced feedback
 */
export function validateAndLog(items: VideoItem[], label?: string): boolean {
  const result = validateVideoPortfolioData(items);
  logValidationResults(items, label);
  return result.isValid;
}