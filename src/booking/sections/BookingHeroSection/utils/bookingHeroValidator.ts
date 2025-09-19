// src/booking/sections/BookingHeroSection/utils/bookingHeroValidator.ts
// Validation utilities for BookingHeroSection component props and state

import { z } from "zod";
import type { 
  BookingHeroSectionProps,
  BookingHeroMedia,
  BookingHeroCta,
  BookingTrustBadge 
} from "../BookingHeroSection.types";

// ============================================================================
// Zod Schemas
// ============================================================================

// Media schema
const bookingHeroMediaSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("image"),
    src: z.string().min(1, "Image source is required"),
    alt: z.string().min(1, "Alt text is required for images"),
    priority: z.boolean().optional(),
    quality: z.number().min(1).max(100).optional(),
    fit: z.enum(["cover", "contain"]).optional(),
  }),
  z.object({
    type: z.literal("video"),
    src: z.string().min(1, "Video source is required"),
    poster: z.string().optional(),
    fallback: z.string().optional(),
    autoPlay: z.boolean().optional(),
    loop: z.boolean().optional(),
    controls: z.boolean().optional(),
    preload: z.enum(["none", "metadata", "auto"]).optional(),
  }),
]);

// CTA schema
const bookingHeroCtaSchema = z.object({
  text: z.string().min(1, "CTA text is required"),
  href: z.string().min(1, "CTA href is required"),
  ariaLabel: z.string().optional(),
  target: z.enum(["_self", "_blank", "_parent", "_top"]).optional(),
  rel: z.string().optional(),
  size: z.enum(["sm", "md", "lg"]).optional(),
  variant: z.enum(["primary", "secondary", "tertiary", "outline"]).optional(),
  onClick: z.function().optional(),
  "data-testid": z.string().optional(),
  analytics: z.record(z.unknown()).optional(),
});

// Trust badge schema
const bookingTrustBadgeSchema = z.object({
  label: z.string().min(1, "Trust badge label is required"),
  iconSrc: z.string().optional(),
  description: z.string().optional(),
});

// Layout schema
const bookingHeroLayoutSchema = z.object({
  align: z.enum(["center", "left", "right"]).optional(),
  height: z.enum(["auto", "small", "medium", "large"]).optional(),
  containerSize: z.enum(["narrow", "normal", "wide"]).optional(),
});

// Theme schema
const bookingHeroThemeSchema = z.object({
  accentColor: z.string().optional(),
  textOnMedia: z.string().optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
});

// Analytics schema
const bookingHeroAnalyticsSchema = z.object({
  onView: z.function().optional(),
  onCtaClick: z.function().optional(),
  context: z.string().optional(),
});

// Eyebrow schema
const bookingHeroEyebrowSchema = z.object({
  text: z.string().min(1, "Eyebrow text is required"),
  as: z.enum(["p", "span", "div"]).optional(),
});

// Main props schema
const bookingHeroSectionPropsSchema = z.object({
  title: z.string().min(1, "Hero title is required"),
  subtitle: z.string().optional(),
  eyebrow: bookingHeroEyebrowSchema.optional(),
  media: bookingHeroMediaSchema.optional(),
  primaryCta: bookingHeroCtaSchema.optional(),
  secondaryCta: bookingHeroCtaSchema.optional(),
  trustBadges: z.array(bookingTrustBadgeSchema).optional(),
  layout: bookingHeroLayoutSchema.optional(),
  theme: bookingHeroThemeSchema.optional(),
  analytics: bookingHeroAnalyticsSchema.optional(),
  variant: z.string().optional(),
  className: z.string().optional(),
  ariaLabel: z.string().optional(),
  forceReducedMotion: z.boolean().optional(),
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates BookingHeroSection props
 */
export function validateBookingHeroSectionProps(
  props: unknown
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    bookingHeroSectionPropsSchema.parse(props);
    
    // Additional business logic validation
    const typedProps = props as BookingHeroSectionProps;
    
    // CTA validation
    if (!typedProps.primaryCta && !typedProps.secondaryCta) {
      warnings.push("No CTAs provided - consider adding at least one call-to-action");
    }
    
    if (typedProps.primaryCta && typedProps.secondaryCta) {
      if (typedProps.primaryCta.text === typedProps.secondaryCta.text) {
        warnings.push("Primary and secondary CTA have identical text");
      }
      if (typedProps.primaryCta.href === typedProps.secondaryCta.href) {
        warnings.push("Primary and secondary CTA have identical href");
      }
    }
    
    // Media validation
    if (typedProps.media?.type === "video") {
      if (typedProps.media.autoPlay && !typedProps.media.poster) {
        warnings.push("Autoplaying video should have a poster image for accessibility");
      }
      if (typedProps.media.controls && typedProps.media.autoPlay) {
        warnings.push("Autoplaying video with controls may provide poor UX");
      }
    }
    
    // Accessibility validation
    if (typedProps.media && !typedProps.ariaLabel) {
      warnings.push("Hero with media should have an explicit aria-label");
    }
    
    // Title length validation
    if (typedProps.title.length > 100) {
      warnings.push("Hero title is quite long - consider shortening for better readability");
    }
    
    if (typedProps.subtitle && typedProps.subtitle.length > 200) {
      warnings.push("Hero subtitle is quite long - consider shortening for better readability");
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        warnings,
      };
    }
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : "Unknown validation error"],
      warnings,
    };
  }
}

/**
 * Validates booking hero media configuration
 */
export function validateBookingHeroMedia(
  media: unknown
): { isValid: boolean; errors: string[] } {
  if (!media) return { isValid: true, errors: [] };
  
  try {
    bookingHeroMediaSchema.parse(media);
    
    const typedMedia = media as BookingHeroMedia;
    const errors: string[] = [];
    
    // Additional validation based on media type
    if (typedMedia.type === "image") {
      // Check if src looks like a valid image path
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
      const hasValidExtension = validExtensions.some(ext => 
        typedMedia.src.toLowerCase().endsWith(ext)
      );
      
      if (!typedMedia.src.startsWith('http') && !typedMedia.src.startsWith('/') && !hasValidExtension) {
        errors.push("Image source should be a URL or path with valid image extension");
      }
      
      if (typedMedia.quality && (typedMedia.quality < 1 || typedMedia.quality > 100)) {
        errors.push("Image quality must be between 1 and 100");
      }
    }
    
    if (typedMedia.type === "video") {
      // Check if src looks like a valid video path
      const validExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
      const hasValidExtension = validExtensions.some(ext => 
        typedMedia.src.toLowerCase().endsWith(ext)
      );
      
      if (!typedMedia.src.startsWith('http') && !typedMedia.src.startsWith('/') && !hasValidExtension) {
        errors.push("Video source should be a URL or path with valid video extension");
      }
    }
    
    return { isValid: errors.length === 0, errors };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : "Unknown validation error"],
    };
  }
}

/**
 * Validates booking hero CTA configuration
 */
export function validateBookingHeroCta(
  cta: unknown
): { isValid: boolean; errors: string[]; warnings: string[] } {
  if (!cta) return { isValid: true, errors: [], warnings: [] };
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    bookingHeroCtaSchema.parse(cta);
    
    const typedCta = cta as BookingHeroCta;
    
    // URL validation
    if (typedCta.href) {
      const isAbsoluteUrl = /^https?:\/\//.test(typedCta.href);
      const isRelativeUrl = typedCta.href.startsWith('/');
      const isHashLink = typedCta.href.startsWith('#');
      
      if (!isAbsoluteUrl && !isRelativeUrl && !isHashLink) {
        warnings.push("CTA href should be an absolute URL, relative path, or hash link");
      }
      
      // Target validation
      if (typedCta.target === '_blank' && !typedCta.rel?.includes('noopener')) {
        warnings.push("External links should include 'noopener' in rel attribute for security");
      }
    }
    
    // Analytics validation
    if (typedCta.analytics && typeof typedCta.analytics !== 'object') {
      errors.push("CTA analytics should be an object");
    }
    
    // Text length validation
    if (typedCta.text.length > 50) {
      warnings.push("CTA text is quite long - consider shortening for better UX");
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        warnings,
      };
    }
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : "Unknown validation error"],
      warnings,
    };
  }
}

/**
 * Development-only validation helper
 */
export function validateInDevelopment<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  componentName = "BookingHeroSection"
): T {
  if (process.env.NODE_ENV === "development") {
    try {
      return schema.parse(data);
    } catch (error) {
      console.warn(`${componentName} validation failed:`, error);
      throw error;
    }
  }
  return data as T;
}

/**
 * Debug utility for development
 */
export function debugBookingHeroProps(
  props: BookingHeroSectionProps, 
  label = "BookingHeroSection"
): void {
  if (process.env.NODE_ENV !== "development") return;

  console.group(`🔍 ${label} Props Debug`);
  console.log("Title:", props.title);
  console.log("Has Subtitle:", !!props.subtitle);
  console.log("Has Media:", !!props.media);
  console.log("Has Primary CTA:", !!props.primaryCta);
  console.log("Has Secondary CTA:", !!props.secondaryCta);
  console.log("Trust Badges Count:", props.trustBadges?.length || 0);
  
  const validation = validateBookingHeroSectionProps(props);
  if (!validation.isValid) {
    console.warn("❌ Validation Errors:", validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn("⚠️ Warnings:", validation.warnings);
  }

  // Validate media if present
  if (props.media) {
    const mediaValidation = validateBookingHeroMedia(props.media);
    if (!mediaValidation.isValid) {
      console.warn("❌ Media Validation Errors:", mediaValidation.errors);
    }
  }

  // Validate CTAs if present
  if (props.primaryCta) {
    const ctaValidation = validateBookingHeroCta(props.primaryCta);
    if (!ctaValidation.isValid) {
      console.warn("❌ Primary CTA Validation Errors:", ctaValidation.errors);
    }
    if (ctaValidation.warnings.length > 0) {
      console.warn("⚠️ Primary CTA Warnings:", ctaValidation.warnings);
    }
  }

  if (props.secondaryCta) {
    const ctaValidation = validateBookingHeroCta(props.secondaryCta);
    if (!ctaValidation.isValid) {
      console.warn("❌ Secondary CTA Validation Errors:", ctaValidation.errors);
    }
    if (ctaValidation.warnings.length > 0) {
      console.warn("⚠️ Secondary CTA Warnings:", ctaValidation.warnings);
    }
  }

  console.groupEnd();
}

/**
 * Create mock hero props for testing
 */
export function createMockBookingHeroProps(
  overrides: Partial<BookingHeroSectionProps> = {}
): BookingHeroSectionProps {
  return {
    title: "Schedule Your Consultation",
    subtitle: "Get expert guidance tailored to your business needs.",
    eyebrow: {
      text: "Free Consultation",
      as: "p",
    },
    media: {
      type: "image",
      src: "/images/hero-booking.jpg",
      alt: "Professional consultation meeting",
      priority: true,
    },
    primaryCta: {
      text: "Book Now",
      href: "#schedule",
      variant: "primary",
      size: "lg",
    },
    secondaryCta: {
      text: "Learn More",
      href: "/services",
      variant: "secondary",
      size: "md",
    },
    trustBadges: [
      {
        label: "100% Secure",
        description: "Your data is protected",
      },
      {
        label: "Free Consultation",
        description: "No cost for initial meeting",
      },
    ],
    layout: {
      align: "center",
      height: "medium",
      containerSize: "normal",
    },
    analytics: {
      context: "booking-hero-mock",
    },
    ...overrides,
  };
}