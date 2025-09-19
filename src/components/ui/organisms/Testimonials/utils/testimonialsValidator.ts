// src/components/ui/organisms/Testimonials/utils/testimonialsValidator.ts

import { z } from "zod";
import type { 
  Testimonial, 
  TestimonialInput, 
  TestimonialsSection,
  TestimonialTransformer
} from "../Testimonials.types";

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Base testimonial schema with validation rules
 */
export const testimonialSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  // Content fields with aliases
  quote: z.string().optional(),
  testimonial: z.string().optional(),
  // Identity fields with aliases
  author: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  // Media and metadata
  image: z.string().optional(),
  avatarUrl: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  date: z.string().optional(),
  service: z.string().optional(),
  project: z.string().optional(),
  featured: z.boolean().optional()
});

/**
 * Testimonials section schema for service pages
 */
export const testimonialsSectionSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  data: z.union([
    z.array(testimonialSchema),
    z.object({ items: z.array(testimonialSchema).optional() }),
    z.object({ testimonials: z.array(testimonialSchema).optional() }),
    z.null(),
    z.undefined()
  ]),
  count: z.number().positive().optional(),
  intervalMs: z.number().nonnegative().optional(),
  variant: z.enum(["default", "cards", "minimal"]).optional(),
  layout: z.enum(["grid", "slider", "carousel"]).optional(),
  enableFiltering: z.boolean().optional(),
  featuredOnly: z.boolean().optional()
});

/**
 * Enhanced testimonial schema with required content validation
 */
export const validTestimonialSchema = testimonialSchema.refine(
  (data) => {
    // At least quote or testimonial must be present
    const hasContent = data.quote || data.testimonial;
    // At least author or name must be present
    const hasAuthor = data.author || data.name;
    return hasContent && hasAuthor;
  },
  {
    message: "Testimonial must have content (quote/testimonial) and author (author/name)",
  }
);

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a single testimonial
 */
export const validateTestimonial = (testimonial: unknown): testimonial is Testimonial => {
  const result = testimonialSchema.safeParse(testimonial);
  return result.success;
};

/**
 * Validates an array of testimonials
 */
export const validateTestimonials = (testimonials: unknown): testimonials is Testimonial[] => {
  if (!Array.isArray(testimonials)) return false;
  return testimonials.every(validateTestimonial);
};

/**
 * Validates testimonials section data structure
 */
export const validateTestimonialsSection = (section: unknown): section is TestimonialsSection => {
  const result = testimonialsSectionSchema.safeParse(section);
  return result.success;
};

/**
 * Validates testimonial with strict content requirements
 */
export const validateCompleteTestimonial = (testimonial: unknown): testimonial is Testimonial => {
  const result = validTestimonialSchema.safeParse(testimonial);
  return result.success;
};

// ============================================================================
// Parsing Functions with Error Handling
// ============================================================================

/**
 * Safely parse testimonial with detailed error reporting
 */
export const parseTestimonial = (testimonial: unknown): { 
  success: boolean; 
  data?: Testimonial; 
  error?: string 
} => {
  const result = testimonialSchema.safeParse(testimonial);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
  };
};

/**
 * Safely parse testimonials section with detailed error reporting
 */
export const parseTestimonialsSection = (section: unknown): { 
  success: boolean; 
  data?: TestimonialsSection; 
  error?: string 
} => {
  const result = testimonialsSectionSchema.safeParse(section);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
  };
};

// ============================================================================
// Normalization & Transformation Utilities
// ============================================================================

/**
 * Normalizes testimonial input into a consistent Testimonial[] format
 */
export const normalizeTestimonialInput = (input: TestimonialInput): Testimonial[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  
  // Handle object formats
  if (typeof input === 'object') {
    if ('items' in input && Array.isArray(input.items)) return input.items.filter(Boolean);
    if ('testimonials' in input && Array.isArray(input.testimonials)) return input.testimonials.filter(Boolean);
  }
  
  return [];
};

/**
 * Normalizes a single testimonial with canonical field mapping
 */
export const normalizeTestimonial = (testimonial: Testimonial): Testimonial => {
  return {
    id: testimonial.id,
    // Content: prefer canonical fields
    quote: testimonial.quote || testimonial.testimonial,
    // Identity: prefer canonical fields
    author: testimonial.author || testimonial.name,
    title: testimonial.title || testimonial.role,
    company: testimonial.company,
    // Media: prefer canonical fields
    image: testimonial.image || testimonial.avatarUrl,
    rating: testimonial.rating,
    date: testimonial.date,
    service: testimonial.service,
    project: testimonial.project,
    featured: testimonial.featured
  };
};

/**
 * Transforms testimonial to GenericCard props format
 */
export const transformTestimonialToCardProps = (testimonial: Testimonial, index: number) => {
  const normalized = normalizeTestimonial(testimonial);
  
  return {
    id: normalized.id || `testimonial-${index}`,
    image: normalized.image || '/images/default-avatar.jpg',
    nameReview: normalized.author || 'Anonymous',
    quote: normalized.quote || 'No testimonial provided',
    company: normalized.company,
    service: normalized.title, // Map title to service for GenericCard
    rating: normalized.rating,
    date: normalized.date,
    variant: 'testimonial' as const
  };
};

/**
 * Extracts unique services from testimonials
 */
export const extractServices = (testimonials: Testimonial[]): string[] => {
  const services = new Set<string>();
  
  testimonials.forEach(testimonial => {
    if (testimonial.service) services.add(testimonial.service);
    if (testimonial.project) services.add(testimonial.project);
  });
  
  return Array.from(services).sort();
};

/**
 * Generates a safe ID from testimonial content
 */
export const generateTestimonialId = (testimonial: Testimonial, index: number): string => {
  if (testimonial.id) return String(testimonial.id);
  
  const author = testimonial.author || testimonial.name || 'anonymous';
  const slug = author
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
    
  return `${slug}-${index}`;
};

// ============================================================================
// Testimonial Transformer Implementation
// ============================================================================

export const testimonialTransformer: TestimonialTransformer = {
  normalize: normalizeTestimonial,
  toCardProps: transformTestimonialToCardProps,
  validate: validateTestimonial
};

// ============================================================================
// Validation Utilities for Service Pages
// ============================================================================

/**
 * Creates a validator for specific service testimonials sections
 */
export const createServiceTestimonialsValidator = (serviceName: string) => ({
  /**
   * Validates testimonials data for the service
   */
  validate: (data: unknown): { 
    isValid: boolean; 
    errors: string[]; 
    testimonials: Testimonial[] 
  } => {
    const errors: string[] = [];
    let testimonials: Testimonial[] = [];

    try {
      testimonials = normalizeTestimonialInput(data as TestimonialInput);
      
      if (testimonials.length === 0) {
        errors.push(`${serviceName}: No testimonial items found`);
      }

      testimonials.forEach((testimonial, index) => {
        const result = parseTestimonial(testimonial);
        if (!result.success) {
          errors.push(`${serviceName} Testimonial ${index + 1}: ${result.error}`);
        }
        
        // Additional content validation
        const hasContent = testimonial.quote || testimonial.testimonial;
        const hasAuthor = testimonial.author || testimonial.name;
        
        if (!hasContent) {
          errors.push(`${serviceName} Testimonial ${index + 1}: Missing testimonial content`);
        }
        if (!hasAuthor) {
          errors.push(`${serviceName} Testimonial ${index + 1}: Missing author information`);
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        testimonials
      };
    } catch (error) {
      errors.push(`${serviceName}: Failed to parse testimonials data - ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, testimonials: [] };
    }
  },

  /**
   * Creates a validated testimonials section for the service
   */
  createSection: (
    data: TestimonialInput, 
    options: Partial<TestimonialsSection> = {}
  ): TestimonialsSection | null => {
    const validation = createServiceTestimonialsValidator(serviceName).validate(data);
    
    if (!validation.isValid) {
      console.warn(`${serviceName} Testimonials validation failed:`, validation.errors);
      return null;
    }

    return {
      title: `${serviceName} Results`,
      subtitle: `See what our ${serviceName.toLowerCase()} clients have to say`,
      data: validation.testimonials,
      count: 3,
      intervalMs: 6000,
      variant: "cards",
      layout: "grid",
      enableFiltering: validation.testimonials.some(t => t.service),
      featuredOnly: false,
      ...options
    };
  }
});

// ============================================================================
// Pre-configured Service Validators
// ============================================================================

export const webDevTestimonialsValidator = createServiceTestimonialsValidator("Web Development");
export const videoTestimonialsValidator = createServiceTestimonialsValidator("Video Production");
export const leadGenTestimonialsValidator = createServiceTestimonialsValidator("Lead Generation");
export const marketingAutomationTestimonialsValidator = createServiceTestimonialsValidator("Marketing Automation");
export const seoServicesTestimonialsValidator = createServiceTestimonialsValidator("SEO Services");
export const contentProductionTestimonialsValidator = createServiceTestimonialsValidator("Content Production");

// ============================================================================
// Collection Validator
// ============================================================================

/**
 * Comprehensive testimonials collection validator
 */
export const testimonialsValidator = {
  /**
   * Validates collection of testimonials with comprehensive error reporting
   */
  validateCollection: (data: unknown): { 
    isValid: boolean; 
    errors: string[]; 
    testimonials: Testimonial[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let testimonials: Testimonial[] = [];

    try {
      testimonials = normalizeTestimonialInput(data as TestimonialInput);
      
      if (testimonials.length === 0) {
        errors.push("No testimonials found in provided data");
        return { isValid: false, errors, testimonials: [], warnings };
      }

      testimonials.forEach((testimonial, index) => {
        const result = parseTestimonial(testimonial);
        if (!result.success) {
          errors.push(`Testimonial ${index + 1}: ${result.error}`);
        }
        
        // Content validation
        const hasContent = testimonial.quote || testimonial.testimonial;
        const hasAuthor = testimonial.author || testimonial.name;
        
        if (!hasContent) {
          errors.push(`Testimonial ${index + 1}: Missing testimonial content (quote or testimonial field required)`);
        }
        if (!hasAuthor) {
          errors.push(`Testimonial ${index + 1}: Missing author information (author or name field required)`);
        }

        // Quality warnings
        if (hasContent) {
          const content = testimonial.quote || testimonial.testimonial || '';
          if (content.length < 20) {
            warnings.push(`Testimonial ${index + 1}: Very short testimonial (${content.length} chars)`);
          }
          if (content.length > 300) {
            warnings.push(`Testimonial ${index + 1}: Long testimonial (${content.length} chars) - consider shortening`);
          }
        }
        
        if (!testimonial.image && !testimonial.avatarUrl) {
          warnings.push(`Testimonial ${index + 1}: No avatar image provided`);
        }
        
        if (!testimonial.rating) {
          warnings.push(`Testimonial ${index + 1}: No rating provided`);
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        testimonials,
        warnings
      };
    } catch (error) {
      errors.push(`Failed to validate testimonials: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, testimonials: [], warnings };
    }
  },

  /**
   * Creates a validated testimonials section
   */
  createValidatedSection: (
    data: TestimonialInput, 
    options: Partial<TestimonialsSection> = {}
  ): TestimonialsSection | null => {
    const validation = testimonialsValidator.validateCollection(data);
    
    if (!validation.isValid) {
      console.warn('Testimonials validation failed:', validation.errors);
      if (validation.warnings.length > 0) {
        console.warn('Testimonials warnings:', validation.warnings);
      }
      return null;
    }

    // Log warnings even on successful validation
    if (validation.warnings.length > 0) {
      console.warn('Testimonials validation warnings:', validation.warnings);
    }

    return {
      title: "Client Testimonials",
      subtitle: "See what our clients have to say",
      data: validation.testimonials,
      count: 3,
      intervalMs: 6000,
      variant: "cards",
      layout: "grid",
      enableFiltering: validation.testimonials.some(t => t.service),
      featuredOnly: false,
      ...options
    };
  }
};

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Creates mock testimonial data for development/testing
 */
export const createMockTestimonials = (count: number, servicePrefix = "test"): Testimonial[] => {
  const companies = ['TechCorp', 'Innovation Labs', 'Digital Solutions Inc', 'Growth Partners', 'StartupXYZ'];
  const titles = ['CEO', 'Marketing Director', 'CTO', 'VP of Sales', 'Founder', 'Head of Growth'];
  const services = ['Web Development', 'SEO', 'Marketing', 'Video Production', 'Lead Generation'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `mock-${servicePrefix}-${i + 1}`,
    quote: `This is a sample testimonial ${i + 1} about our excellent ${servicePrefix} services. The results exceeded our expectations and we're very satisfied with the quality of work.`,
    author: `Client ${i + 1}`,
    title: titles[i % titles.length],
    company: companies[i % companies.length],
    image: `/images/testimonials/mock-${i + 1}.jpg`,
    rating: 4 + (i % 2), // Alternates between 4 and 5
    service: services[i % services.length],
    featured: i % 3 === 0, // Every third testimonial is featured
    date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString() // Recent dates
  }));
};

/**
 * Debug utility for testimonials validation issues
 */
export const debugTestimonialsValidation = (data: unknown, serviceName = "Unknown"): void => {
  console.group(`Testimonials Validation Debug: ${serviceName}`);
  
  const normalizedTestimonials = normalizeTestimonialInput(data as TestimonialInput);
  console.log("Normalized testimonials:", normalizedTestimonials);
  
  const validation = testimonialsValidator.validateCollection(data);
  
  if (validation.isValid) {
    console.log("✅ Validation passed");
  } else {
    console.error("❌ Validation failed");
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.warn("⚠️ Validation warnings:");
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log(`📊 Statistics:
  - Total testimonials: ${validation.testimonials.length}
  - With images: ${validation.testimonials.filter(t => t.image || t.avatarUrl).length}
  - With ratings: ${validation.testimonials.filter(t => t.rating).length}
  - Featured: ${validation.testimonials.filter(t => t.featured).length}
  - Services: ${extractServices(validation.testimonials).join(', ')}`);
  
  console.groupEnd();
};

/**
 * Quality checker for testimonials content
 */
export const checkTestimonialsQuality = (testimonials: Testimonial[]): {
  score: number;
  issues: string[];
  recommendations: string[];
} => {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  testimonials.forEach((testimonial, index) => {
    const num = index + 1;
    
    // Check content quality
    const content = testimonial.quote || testimonial.testimonial || '';
    if (content.length < 30) {
      score -= 10;
      issues.push(`Testimonial ${num}: Very short content`);
      recommendations.push(`Testimonial ${num}: Add more specific details about results/benefits`);
    }
    
    // Check for generic content
    if (content.toLowerCase().includes('great work') && content.length < 50) {
      score -= 15;
      issues.push(`Testimonial ${num}: Generic/vague content`);
      recommendations.push(`Testimonial ${num}: Include specific outcomes or metrics`);
    }
    
    // Check author info completeness
    if (!testimonial.title && !testimonial.company) {
      score -= 8;
      issues.push(`Testimonial ${num}: Missing professional context`);
      recommendations.push(`Testimonial ${num}: Add job title and/or company name for credibility`);
    }
    
    // Check for image
    if (!testimonial.image && !testimonial.avatarUrl) {
      score -= 5;
      issues.push(`Testimonial ${num}: No profile image`);
      recommendations.push(`Testimonial ${num}: Add client photo for authenticity`);
    }
    
    // Check for rating
    if (!testimonial.rating) {
      score -= 3;
      issues.push(`Testimonial ${num}: No rating provided`);
      recommendations.push(`Testimonial ${num}: Include star rating if available`);
    }
  });
  
  // Check overall collection
  const featuredCount = testimonials.filter(t => t.featured).length;
  if (featuredCount === 0 && testimonials.length > 3) {
    score -= 10;
    issues.push("No testimonials marked as featured");
    recommendations.push("Mark 2-3 best testimonials as featured for highlighting");
  }
  
  const withImages = testimonials.filter(t => t.image || t.avatarUrl).length;
  if (withImages < testimonials.length * 0.7) {
    score -= 15;
    issues.push("Less than 70% of testimonials have images");
    recommendations.push("Add profile images to more testimonials for better visual appeal");
  }
  
  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
};

// ============================================================================
// Export All Utilities
// ============================================================================

export default {
  // Schemas
  testimonialSchema,
  testimonialsSectionSchema,
  validTestimonialSchema,
  
  // Validation functions
  validateTestimonial,
  validateTestimonials,
  validateTestimonialsSection,
  validateCompleteTestimonial,
  
  // Parsing functions
  parseTestimonial,
  parseTestimonialsSection,
  
  // Transformation utilities
  normalizeTestimonialInput,
  normalizeTestimonial,
  transformTestimonialToCardProps,
  generateTestimonialId,
  extractServices,
  
  // Main validator
  testimonialsValidator,
  testimonialTransformer,
  
  // Service validators
  webDevTestimonialsValidator,
  videoTestimonialsValidator,
  leadGenTestimonialsValidator,
  marketingAutomationTestimonialsValidator,
  seoServicesTestimonialsValidator,
  contentProductionTestimonialsValidator,
  
  // Development helpers
  createMockTestimonials,
  debugTestimonialsValidation,
  checkTestimonialsQuality,
  createServiceTestimonialsValidator
};