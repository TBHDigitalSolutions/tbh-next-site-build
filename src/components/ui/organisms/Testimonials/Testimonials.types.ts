// src/components/ui/organisms/Testimonials/Testimonials.types.ts

/**
 * Testimonials Component Types - Service Page Integration
 * Following Service Page Type Contracts implementation guide patterns
 */

/**
 * A single testimonial item as authored in data files.
 * Canonical field names with alias support for legacy data.
 */
export interface Testimonial {
  /** Optional stable identifier. If absent, a derived id is generated. */
  id?: string | number;

  // -------- content (canonical fields) --------
  /** Canonical testimonial text. */
  quote?: string;
  /** Legacy alias for testimonial text. */
  testimonial?: string;

  // -------- identity (canonical fields) --------
  /** Canonical author name. */
  author?: string;
  /** Legacy alias for author name. */
  name?: string;
  /** Canonical role/title (e.g., "VP Marketing"). */
  title?: string;
  /** Legacy alias for role/title. */
  role?: string;
  /** Optional company name (rendered alongside role). */
  company?: string;

  // -------- media / metadata --------
  /** Canonical avatar/image URL or path. */
  image?: string;
  /** Legacy alias for avatar/image URL or path. */
  avatarUrl?: string;
  /** Optional star rating (e.g., 4–5). */
  rating?: number;
  /** Optional display date string. */
  date?: string;
  
  // -------- service context --------
  /** Service category or type for filtering. */
  service?: string;
  /** Project or campaign context. */
  project?: string;
  /** Featured testimonial flag. */
  featured?: boolean;
}

/**
 * Flexible input accepted by <Testimonials/> and <TestimonialSlider/>.
 * Supports various data shapes for backward compatibility.
 */
export type TestimonialInput =
  | Testimonial[]
  | { items?: Testimonial[] }
  | { testimonials?: Testimonial[] }
  | null
  | undefined;

/**
 * Props for the top-level <Testimonials/> wrapper component.
 */
export interface TestimonialsProps {
  /** Testimonial data in various supported formats */
  data: TestimonialInput;
  /** Number of testimonials to show per rotation */
  count?: number;
  /** Auto-rotation interval in milliseconds; set <= 0 to disable */
  intervalMs?: number;
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Visual variant */
  variant?: "default" | "cards" | "minimal";
  /** Display layout */
  layout?: "grid" | "slider" | "carousel";
  /** Enable filtering by service/category */
  enableFiltering?: boolean;
  /** Show only featured testimonials */
  featuredOnly?: boolean;
}

// ============================================================================
// Service Page Integration Types
// ============================================================================

/**
 * Testimonials section contract for service pages
 */
export interface TestimonialsSection {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Testimonial data */
  data: TestimonialInput;
  /** Display configuration */
  count?: number;
  intervalMs?: number;
  variant?: TestimonialsProps['variant'];
  layout?: TestimonialsProps['layout'];
  enableFiltering?: boolean;
  featuredOnly?: boolean;
}

// ============================================================================
// Service-Specific Testimonials Section Types
// ============================================================================

export type WebDevTestimonialsSection = TestimonialsSection;
export type VideoTestimonialsSection = TestimonialsSection;
export type LeadGenTestimonialsSection = TestimonialsSection;
export type MarketingAutomationTestimonialsSection = TestimonialsSection;
export type SEOServicesTestimonialsSection = TestimonialsSection;
export type ContentProductionTestimonialsSection = TestimonialsSection;

// ============================================================================
// Legacy Support Types
// ============================================================================

/**
 * Legacy testimonial data formats
 */
export interface LegacyTestimonialData {
  /** Legacy: some components used testimonialData */
  testimonialData?: Testimonial[];
  /** Legacy: some used reviews */
  reviews?: Testimonial[];
  /** Legacy: section heading variations */
  sectionTitle?: string;
  heading?: string;
}

/**
 * Extended props with legacy support
 */
export interface TestimonialsPropsWithLegacy extends TestimonialsProps, LegacyTestimonialData {
  // All props combined for backward compatibility
}

// ============================================================================
// Validation & Transformation Types
// ============================================================================

/**
 * Testimonial transformer interface
 */
export interface TestimonialTransformer {
  /** Transform testimonial to normalized format */
  normalize: (testimonial: Testimonial) => Testimonial;
  /** Convert to GenericCard props */
  toCardProps: (testimonial: Testimonial) => any;
  /** Validate testimonial data */
  validate: (testimonial: unknown) => testimonial is Testimonial;
}

/**
 * Testimonials collection validator
 */
export interface TestimonialsValidator {
  /** Validate array of testimonials */
  validateCollection: (data: unknown) => { isValid: boolean; errors: string[]; testimonials: Testimonial[] };
  /** Create section with validation */
  createValidatedSection: (data: TestimonialInput, options?: Partial<TestimonialsSection>) => TestimonialsSection | null;
}