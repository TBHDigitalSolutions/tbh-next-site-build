// ============================================================================
// FILE: src/data/testimonials/index.ts
// Testimonials Data Barrel Export - Production Ready (CORRECTED FOR CANONICAL NAMING)
// ============================================================================

// Core types
export type {
  Testimonial,
  TestimonialsSection,
  TestimonialInput,
  WebDevelopmentTestimonialsSection,
  VideoProductionTestimonialsSection,
  LeadGenerationTestimonialsSection,
  MarketingAutomationTestimonialsSection,
  SEOServicesTestimonialsSection,
  ContentProductionTestimonialsSection,
  ServiceType,
  TestimonialRating
} from "./types";

// ============================================================================
// CANONICAL EXPORTS (PRIMARY - USE THESE)
// ============================================================================
// Service-specific exports using canonical "*-services" names aligned with routing

export {
  webDevelopmentServicesTestimonials,
  webDevelopmentServicesTestimonialsSection
} from "./web-development-services";

export {
  videoProductionServicesTestimonials,
  videoProductionServicesTestimonialsSection
} from "./video-production-services";

export {
  leadGenerationServicesTestimonials,
  leadGenerationServicesTestimonialsSection
} from "./lead-generation-services";

export {
  marketingServicesTestimonials,
  marketingServicesTestimonialsSection
} from "./marketing-services";

export {
  seoServicesTestimonials,
  seoServicesTestimonialsSection
} from "./seo-services";

export {
  contentProductionServicesTestimonials,
  contentProductionServicesTestimonialsSection
} from "./content-production-services";

// ============================================================================
// LEGACY ALIASES (DEPRECATED - FOR BACKWARD COMPATIBILITY ONLY)
// ============================================================================
// Use canonical exports above instead of these legacy aliases

export {
  webDevelopmentServicesTestimonials as webDevelopmentTestimonials,
  webDevelopmentServicesTestimonialsSection as webDevelopmentTestimonialsSection
} from "./web-development-services";

export {
  videoProductionServicesTestimonials as videoProductionTestimonials,
  videoProductionServicesTestimonialsSection as videoProductionTestimonialsSection
} from "./video-production-services";

export {
  leadGenerationServicesTestimonials as leadGenerationTestimonials,
  leadGenerationServicesTestimonialsSection as leadGenerationTestimonialsSection
} from "./lead-generation-services";

export {
  marketingServicesTestimonials as marketingAutomationTestimonials,
  marketingServicesTestimonialsSection as marketingAutomationTestimonialsSection
} from "./marketing-services";

export {
  contentProductionServicesTestimonials as contentProductionTestimonials,
  contentProductionServicesTestimonialsSection as contentProductionTestimonialsSection
} from "./content-production-services";

// ============================================================================
// DYNAMIC IMPORTS & AGGREGATIONS
// ============================================================================

// Dynamic imports with error handling
import { webDevelopmentServicesTestimonials } from "./web-development-services";
import { videoProductionServicesTestimonials } from "./video-production-services";
import { leadGenerationServicesTestimonials } from "./lead-generation-services";
import { marketingServicesTestimonials } from "./marketing-services";
import { seoServicesTestimonials } from "./seo-services";
import { contentProductionServicesTestimonials } from "./content-production-services";

/**
 * All testimonials combined for cross-service filtering or general use
 */
export const allTestimonials = [
  ...webDevelopmentServicesTestimonials,
  ...videoProductionServicesTestimonials,
  ...leadGenerationServicesTestimonials,
  ...marketingServicesTestimonials,
  ...seoServicesTestimonials,
  ...contentProductionServicesTestimonials
].filter(Boolean);

/**
 * Featured testimonials across all services
 */
export const featuredTestimonials = allTestimonials.filter(
  (testimonial) => testimonial?.featured === true
);

/**
 * Testimonials grouped by service type (CANONICAL service names first)
 */
export const testimonialsByService = {
  // CANONICAL NAMES (primary - use these)
  "web-development-services": webDevelopmentServicesTestimonials,
  "video-production-services": videoProductionServicesTestimonials,
  "lead-generation-services": leadGenerationServicesTestimonials,
  "marketing-services": marketingServicesTestimonials,
  "seo-services": seoServicesTestimonials,
  "content-production-services": contentProductionServicesTestimonials,
  
  // LEGACY ALIASES (deprecated - use canonical names above)
  "web-development": webDevelopmentServicesTestimonials,
  "video-production": videoProductionServicesTestimonials,
  "lead-generation": leadGenerationServicesTestimonials,
  "marketing-automation": marketingServicesTestimonials,
  "content-production": contentProductionServicesTestimonials
};

/**
 * Service testimonials sections for easy page integration (CANONICAL names first)
 */
export const testimonialSections = {
  // CANONICAL NAMES (primary - use these)
  "web-development-services": () => 
    import("./web-development-services")
      .then((m) => m.webDevelopmentServicesTestimonialsSection)
      .catch(() => null),
  "video-production-services": () => 
    import("./video-production-services")
      .then((m) => m.videoProductionServicesTestimonialsSection)
      .catch(() => null),
  "lead-generation-services": () => 
    import("./lead-generation-services")
      .then((m) => m.leadGenerationServicesTestimonialsSection)
      .catch(() => null),
  "marketing-services": () => 
    import("./marketing-services")
      .then((m) => m.marketingServicesTestimonialsSection)
      .catch(() => null),
  "seo-services": () => 
    import("./seo-services")
      .then((m) => m.seoServicesTestimonialsSection)
      .catch(() => null),
  "content-production-services": () => 
    import("./content-production-services")
      .then((m) => m.contentProductionServicesTestimonialsSection)
      .catch(() => null),
      
  // LEGACY ALIASES (deprecated - use canonical names above)
  "web-development": () => 
    import("./web-development-services")
      .then((m) => m.webDevelopmentServicesTestimonialsSection)
      .catch(() => null),
  "video-production": () => 
    import("./video-production-services")
      .then((m) => m.videoProductionServicesTestimonialsSection)
      .catch(() => null),
  "lead-generation": () => 
    import("./lead-generation-services")
      .then((m) => m.leadGenerationServicesTestimonialsSection)
      .catch(() => null),
  "marketing-automation": () => 
    import("./marketing-services")
      .then((m) => m.marketingServicesTestimonialsSection)
      .catch(() => null),
  "content-production": () => 
    import("./content-production-services")
      .then((m) => m.contentProductionServicesTestimonialsSection)
      .catch(() => null)
};

/**
 * Utility function to get testimonials by service (supports both canonical and legacy names)
 */
export function getTestimonialsByService(service: string) {
  return testimonialsByService[service as keyof typeof testimonialsByService] || [];
}

/**
 * Utility function to get random testimonials
 */
export function getRandomTestimonials(count: number = 3, excludeService?: string) {
  let pool = excludeService 
    ? allTestimonials.filter((t) => t.service !== excludeService)
    : allTestimonials;
  
  return pool
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}