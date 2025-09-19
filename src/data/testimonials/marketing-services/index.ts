// ============================================================================
// FILE: src/data/testimonials/marketing-services/index.ts
// Marketing Services Testimonials Barrel Export (CORRECTED)
// ============================================================================

export { 
  default as marketingServicesTestimonials,
  marketingServicesTestimonialsSection 
} from "./marketing-services-testimonials";

export type { 
  MarketingAutomationTestimonialsSection 
} from "../types";

// Legacy aliases for backward compatibility
export { 
  default as marketingAutomationTestimonials,
  marketingServicesTestimonialsSection as marketingAutomationTestimonialsSection
} from "./marketing-services-testimonials";