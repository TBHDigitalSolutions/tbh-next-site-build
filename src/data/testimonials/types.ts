// ============================================================================
// FILE: src/data/testimonials/types.ts
// Central Testimonials Type Definitions - Production Ready (CORRECTED)
// ============================================================================

/**
 * Base testimonial item following canonical field structure
 * Supports both canonical and legacy field names for backward compatibility
 */
export interface Testimonial {
  /** Stable unique identifier */
  id?: string | number;

  // -------- Content (canonical fields) --------
  /** Testimonial text (canonical) */
  quote?: string;
  /** Legacy alias for testimonial text */
  testimonial?: string;

  // -------- Identity (canonical fields) --------
  /** Author name (canonical) */
  author?: string;
  /** Legacy alias for author name */
  name?: string;
  /** Role/title (canonical) */
  title?: string;
  /** Legacy alias for role/title */
  role?: string;
  /** Company name */
  company?: string;

  // -------- Media & Metadata --------
  /** Avatar/image URL (canonical) */
  image?: string;
  /** Legacy alias for avatar/image URL */
  avatarUrl?: string;
  /** Star rating (1-5) */
  rating?: number;
  /** Display date string */
  date?: string;

  // -------- Service Context --------
  /** Service category for filtering */
  service?: string;
  /** Project context */
  project?: string;
  /** Featured testimonial flag */
  featured?: boolean;
  /** Additional metrics or achievements */
  metrics?: string;
}

/**
 * Testimonials section configuration
 */
export interface TestimonialsSection {
  /** Section title */
  title?: string;
  /** Section subtitle/description */
  subtitle?: string;
  /** Testimonials data array */
  data: Testimonial[];
  /** Number to display per rotation (default: 3) */
  count?: number;
  /** Auto-rotation interval in milliseconds (default: 6000) */
  intervalMs?: number;
  /** Visual variant */
  variant?: "default" | "cards" | "minimal";
  /** Display layout */
  layout?: "grid" | "slider" | "carousel";
  /** Enable filtering by service */
  enableFiltering?: boolean;
  /** Show only featured testimonials */
  featuredOnly?: boolean;
}

/**
 * Service-specific testimonial section types
 */
export type WebDevelopmentTestimonialsSection = TestimonialsSection;
export type VideoProductionTestimonialsSection = TestimonialsSection;
export type LeadGenerationTestimonialsSection = TestimonialsSection;
export type MarketingAutomationTestimonialsSection = TestimonialsSection;
export type SEOServicesTestimonialsSection = TestimonialsSection;
export type ContentProductionTestimonialsSection = TestimonialsSection;

/**
 * Flexible input types for component compatibility
 */
export type TestimonialInput =
  | Testimonial[]
  | { items?: Testimonial[] }
  | { testimonials?: Testimonial[] }
  | null
  | undefined;

/**
 * Service type enum for consistent service identification (CANONICAL NAMES)
 * These match the routing URLs: /services/{canonical-slug}
 */
export enum ServiceType {
  WEB_DEVELOPMENT_SERVICES = "web-development-services",
  VIDEO_PRODUCTION_SERVICES = "video-production-services",
  LEAD_GENERATION_SERVICES = "lead-generation-services",
  MARKETING_SERVICES = "marketing-services",
  SEO_SERVICES = "seo-services",
  CONTENT_PRODUCTION_SERVICES = "content-production-services"
}

/**
 * Testimonial rating enum
 */
export enum TestimonialRating {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5
}