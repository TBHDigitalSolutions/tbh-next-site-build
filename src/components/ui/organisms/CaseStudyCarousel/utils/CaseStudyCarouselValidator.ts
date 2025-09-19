// src/components/ui/organisms/CaseStudyCarousel/utils/CaseStudyCarouselValidator.ts

import { z } from "zod";
import type {
  CaseStudy,
  CaseStudyMetric,
  CaseStudyCarouselProps,
  CaseStudyInput,
  CaseStudyCarouselSection
} from "../CaseStudyCarousel.types";

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Case study metric schema with validation
 */
export const caseStudyMetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.string().min(1, "Metric value is required"),
  change: z.string().optional(),
  trend: z.enum(["up", "down", "neutral"]).optional()
});

/**
 * Complete case study schema with all required and optional fields
 */
export const caseStudySchema = z.object({
  id: z.string().min(1, "Case study ID is required"),
  client: z.string().min(1, "Client name is required"),
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be under 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(500, "Description must be under 500 characters"),
  category: z.string().min(1, "Category is required"),
  image: z.string().url("Image must be a valid URL"),
  metrics: z.array(caseStudyMetricSchema).min(1, "At least one metric is required").max(6, "Maximum 6 metrics allowed"),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed"),
  date: z.string().min(1, "Date is required"),
  link: z.string().url("Link must be a valid URL"),
  featured: z.boolean().optional(),
  results: z.string().optional(),
  industry: z.string().optional(),
  duration: z.string().optional(),
  budgetRange: z.string().optional(),
  services: z.array(z.string()).optional()
});

/**
 * Case study carousel props schema
 */
export const caseStudyCarouselPropsSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  caseStudies: z.array(caseStudySchema).min(1, "At least one case study is required"),
  className: z.string().optional(),
  autoPlay: z.boolean().optional(),
  autoPlayInterval: z.number().min(1000, "Auto-play interval must be at least 1000ms").optional(),
  showProgress: z.boolean().optional(),
  showPagination: z.boolean().optional(),
  showNavigation: z.boolean().optional(),
  slidesToShow: z.number().min(1, "Must show at least 1 slide").max(4, "Maximum 4 slides at once").optional(),
  infinite: z.boolean().optional(),
  enableDrag: z.boolean().optional(),
  variant: z.enum(["default", "compact", "detailed", "grid"]).optional(),
  sortBy: z.enum(["date", "featured", "client", "category"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  filterByCategory: z.array(z.string()).optional()
});

/**
 * Case study section schema for service pages
 */
export const caseStudyCarouselSectionSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  data: z.union([
    z.array(caseStudySchema),
    z.object({ items: z.array(caseStudySchema).optional() }),
    z.object({ caseStudies: z.array(caseStudySchema).optional() }),
    z.object({ studies: z.array(caseStudySchema).optional() }),
    z.object({ projects: z.array(caseStudySchema).optional() }),
    z.null(),
    z.undefined()
  ]),
  config: z.object({}).passthrough().optional(),
  serviceFilter: z.string().optional(),
  limit: z.number().min(1).max(20).optional()
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a single case study
 */
export const validateCaseStudy = (data: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  caseStudy: CaseStudy | null 
} => {
  const errors: string[] = [];
  
  try {
    const result = caseStudySchema.parse(data);
    
    // Additional business logic validation
    const businessValidation = validateCaseStudyBusinessRules(result);
    if (!businessValidation.isValid) {
      errors.push(...businessValidation.warnings); // Non-blocking warnings
    }
    
    return {
      isValid: true,
      errors: errors,
      caseStudy: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(err => `${err.path.join('.')}: ${err.message}`));
    } else {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      isValid: false,
      errors,
      caseStudy: null
    };
  }
};

/**
 * Validates case study carousel props
 */
export const validateCaseStudyCarouselProps = (data: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  props: CaseStudyCarouselProps | null 
} => {
  const errors: string[] = [];
  
  try {
    const result = caseStudyCarouselPropsSchema.parse(data);
    
    // Validate each case study individually
    const invalidStudies = result.caseStudies
      .map((study, index) => ({ study, index }))
      .filter(({ study }) => !validateCaseStudy(study).isValid);
    
    if (invalidStudies.length > 0) {
      invalidStudies.forEach(({ index }) => {
        errors.push(`Case study at index ${index} is invalid`);
      });
    }
    
    // Additional carousel-specific validation
    const carouselValidation = validateCarouselConfiguration(result);
    if (!carouselValidation.isValid) {
      errors.push(...carouselValidation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      props: errors.length === 0 ? result : null
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(err => `${err.path.join('.')}: ${err.message}`));
    } else {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      isValid: false,
      errors,
      props: null
    };
  }
};

/**
 * Validates case study section for service pages
 */
export const validateCaseStudySection = (data: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  section: CaseStudyCarouselSection | null 
} => {
  const errors: string[] = [];
  
  try {
    const result = caseStudyCarouselSectionSchema.parse(data);
    return {
      isValid: true,
      errors: [],
      section: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(err => `${err.path.join('.')}: ${err.message}`));
    } else {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      isValid: false,
      errors,
      section: null
    };
  }
};

// ============================================================================
// Business Rules Validation
// ============================================================================

/**
 * Validates business rules for case studies
 */
export const validateCaseStudyBusinessRules = (caseStudy: CaseStudy): { 
  isValid: boolean; 
  warnings: string[] 
} => {
  const warnings: string[] = [];
  
  // Title quality check
  if (caseStudy.title.length < 10) {
    warnings.push("Title should be more descriptive (at least 10 characters)");
  }
  
  // Description quality check
  if (caseStudy.description.length < 50) {
    warnings.push("Description should provide more detail (at least 50 characters)");
  }
  
  // Metrics validation
  if (caseStudy.metrics.length === 0) {
    warnings.push("Case study should include performance metrics");
  }
  
  if (caseStudy.metrics.length > 3) {
    warnings.push("Consider limiting to 3 key metrics for better readability");
  }
  
  // Check for meaningful metrics
  const hasPercentageMetric = caseStudy.metrics.some(metric => 
    metric.value.includes('%') || metric.value.includes('increase') || metric.value.includes('decrease')
  );
  
  if (!hasPercentageMetric) {
    warnings.push("Consider including percentage-based metrics to show impact");
  }
  
  // Tags validation
  if (caseStudy.tags.length === 0) {
    warnings.push("Add relevant tags for better categorization and filtering");
  }
  
  if (caseStudy.tags.length > 8) {
    warnings.push("Too many tags may dilute categorization (consider limiting to 8)");
  }
  
  // Image validation
  if (caseStudy.image.includes('placeholder') || caseStudy.image.includes('default')) {
    warnings.push("Use a custom case study image instead of placeholder");
  }
  
  // Link validation
  if (caseStudy.link === '#' || caseStudy.link.includes('example.com')) {
    warnings.push("Case study link should point to actual case study page");
  }
  
  // Featured case study validation
  if (caseStudy.featured && caseStudy.metrics.length < 2) {
    warnings.push("Featured case studies should have multiple compelling metrics");
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
};

/**
 * Validates carousel configuration
 */
export const validateCarouselConfiguration = (props: CaseStudyCarouselProps): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  // Slides to show vs available case studies
  const slidesToShow = props.slidesToShow || 1;
  if (slidesToShow > props.caseStudies.length) {
    errors.push(`Cannot show ${slidesToShow} slides when only ${props.caseStudies.length} case studies are available`);
  }
  
  // Auto-play interval validation
  if (props.autoPlay && props.autoPlayInterval && props.autoPlayInterval < 3000) {
    errors.push("Auto-play interval should be at least 3000ms for readability");
  }
  
  // Infinite scroll with limited case studies
  if (props.infinite && props.caseStudies.length < 3) {
    errors.push("Infinite scroll requires at least 3 case studies for smooth operation");
  }
  
  // Filter validation
  if (props.filterByCategory && props.filterByCategory.length > 0) {
    const filteredCount = props.caseStudies.filter(cs => 
      props.filterByCategory!.some(category => 
        cs.category.toLowerCase().includes(category.toLowerCase())
      )
    ).length;
    
    if (filteredCount === 0) {
      errors.push("No case studies match the specified category filter");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================================================
// Quality Assessment
// ============================================================================

/**
 * Assesses the overall quality of case studies for a carousel
 */
export const assessCaseStudyCarouselQuality = (caseStudies: CaseStudy[]): { 
  score: number; 
  recommendations: string[] 
} => {
  let score = 0;
  const recommendations: string[] = [];
  
  // Quantity assessment (20 points)
  if (caseStudies.length >= 5) {
    score += 20;
  } else if (caseStudies.length >= 3) {
    score += 15;
    recommendations.push("Consider adding more case studies for better variety (aim for 5+)");
  } else {
    score += 10;
    recommendations.push("Add more case studies - minimum 3 recommended, 5+ ideal");
  }
  
  // Featured case studies (15 points)
  const featuredCount = caseStudies.filter(cs => cs.featured).length;
  if (featuredCount >= 2) {
    score += 15;
  } else if (featuredCount === 1) {
    score += 10;
    recommendations.push("Mark additional high-impact case studies as featured");
  } else {
    recommendations.push("Mark your best case studies as featured for prioritization");
  }
  
  // Metrics quality (25 points)
  const studiesWithGoodMetrics = caseStudies.filter(cs => 
    cs.metrics.length >= 2 && 
    cs.metrics.some(m => m.value.includes('%'))
  ).length;
  
  const metricsScore = Math.round((studiesWithGoodMetrics / caseStudies.length) * 25);
  score += metricsScore;
  
  if (metricsScore < 20) {
    recommendations.push("Ensure each case study has 2-3 compelling metrics with percentage improvements");
  }
  
  // Content quality (20 points)
  const studiesWithQualityContent = caseStudies.filter(cs =>
    cs.title.length >= 15 &&
    cs.description.length >= 100 &&
    cs.tags.length >= 2
  ).length;
  
  const contentScore = Math.round((studiesWithQualityContent / caseStudies.length) * 20);
  score += contentScore;
  
  if (contentScore < 15) {
    recommendations.push("Improve case study content: detailed titles, comprehensive descriptions, relevant tags");
  }
  
  // Visual assets (10 points)
  const studiesWithCustomImages = caseStudies.filter(cs =>
    !cs.image.includes('placeholder') &&
    !cs.image.includes('default') &&
    !cs.image.includes('unsplash.com') // Assuming custom images are preferred
  ).length;
  
  const visualScore = Math.round((studiesWithCustomImages / caseStudies.length) * 10);
  score += visualScore;
  
  if (visualScore < 8) {
    recommendations.push("Use custom project images instead of stock photos for authenticity");
  }
  
  // Diversity (10 points)
  const uniqueCategories = new Set(caseStudies.map(cs => cs.category)).size;
  const uniqueIndustries = new Set(caseStudies.map(cs => cs.industry).filter(Boolean)).size;
  
  if (uniqueCategories >= 3 && uniqueIndustries >= 3) {
    score += 10;
  } else if (uniqueCategories >= 2) {
    score += 7;
    recommendations.push("Add case studies from different industries for broader appeal");
  } else {
    score += 3;
    recommendations.push("Diversify case studies across service categories and industries");
  }
  
  return { score, recommendations };
};

// ============================================================================
// Service-Specific Validators
// ============================================================================

/**
 * Creates service-specific validators
 */
const createServiceCaseStudyValidator = (serviceName: string) => ({
  validate: (data: CaseStudyInput): { 
    isValid: boolean; 
    errors: string[]; 
    caseStudies: CaseStudy[] 
  } => {
    const errors: string[] = [];
    let caseStudies: CaseStudy[] = [];
    
    try {
      // Normalize input first
      if (Array.isArray(data)) {
        caseStudies = data;
      } else if (data && typeof data === 'object') {
        const input = data as any;
        caseStudies = input.items || input.caseStudies || input.studies || input.projects || [];
      }
      
      if (!Array.isArray(caseStudies)) {
        errors.push(`${serviceName}: Invalid case studies data format`);
        return { isValid: false, errors, caseStudies: [] };
      }
      
      // Validate each case study
      caseStudies.forEach((study, index) => {
        const validation = validateCaseStudy(study);
        if (!validation.isValid) {
          errors.push(`${serviceName} Case Study ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });
      
      // Service-specific validation
      const serviceValidation = validateServiceSpecificRules(caseStudies, serviceName);
      if (!serviceValidation.isValid) {
        errors.push(...serviceValidation.errors);
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        caseStudies: errors.length === 0 ? caseStudies : []
      };
    } catch (error) {
      errors.push(`${serviceName}: Failed to validate case studies - ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, caseStudies: [] };
    }
  },
  
  createSection: (data: CaseStudyInput, options: Partial<CaseStudyCarouselSection> = {}): CaseStudyCarouselSection | null => {
    const validation = createServiceCaseStudyValidator(serviceName).validate(data);
    
    if (!validation.isValid) {
      console.warn(`${serviceName} case study validation failed:`, validation.errors);
      return null;
    }
    
    return {
      title: `${serviceName} Success Stories`,
      subtitle: `Discover how we've helped clients achieve exceptional results with our ${serviceName.toLowerCase()} services.`,
      data: validation.caseStudies,
      serviceFilter: serviceName,
      ...options
    };
  }
});

/**
 * Validates service-specific rules
 */
const validateServiceSpecificRules = (caseStudies: CaseStudy[], serviceName: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  // Service-specific metric expectations
  const serviceMetricExpectations: Record<string, string[]> = {
    'Web Development': ['conversion', 'traffic', 'performance', 'speed', 'accessibility'],
    'Video Production': ['engagement', 'views', 'completion', 'shares', 'brand awareness'],
    'Lead Generation': ['leads', 'cost per lead', 'conversion rate', 'roi', 'pipeline'],
    'Marketing Automation': ['efficiency', 'time saved', 'engagement rate', 'nurturing', 'conversion'],
    'SEO Services': ['traffic', 'rankings', 'organic growth', 'keywords', 'visibility'],
    'Content Production': ['engagement', 'shares', 'traffic', 'lead generation', 'brand awareness']
  };
  
  const expectedMetrics = serviceMetricExpectations[serviceName] || [];
  
  if (expectedMetrics.length > 0) {
    const studiesWithRelevantMetrics = caseStudies.filter(cs =>
      cs.metrics.some(metric =>
        expectedMetrics.some(expected =>
          metric.label.toLowerCase().includes(expected.toLowerCase())
        )
      )
    );
    
    if (studiesWithRelevantMetrics.length === 0) {
      errors.push(`${serviceName} case studies should include relevant metrics like: ${expectedMetrics.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================================================
// Pre-configured Service Validators
// ============================================================================

export const webDevCaseStudyValidator = createServiceCaseStudyValidator("Web Development");
export const videoProductionCaseStudyValidator = createServiceCaseStudyValidator("Video Production");
export const leadGenerationCaseStudyValidator = createServiceCaseStudyValidator("Lead Generation");
export const marketingAutomationCaseStudyValidator = createServiceCaseStudyValidator("Marketing Automation");
export const seoServicesCaseStudyValidator = createServiceCaseStudyValidator("SEO Services");
export const contentProductionCaseStudyValidator = createServiceCaseStudyValidator("Content Production");

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Creates mock case study data for development/testing
 */
export const createMockCaseStudies = (count: number, servicePrefix: string = "test"): CaseStudy[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${servicePrefix}-case-study-${i + 1}`,
    client: `Client ${i + 1}`,
    title: `${servicePrefix} Success Story ${i + 1}`,
    description: `A comprehensive ${servicePrefix} project that delivered exceptional results through strategic planning and expert execution.`,
    category: servicePrefix,
    image: `https://picsum.photos/400/250?random=${i + 1}`,
    metrics: [
      { label: "Improvement", value: `+${(i + 1) * 50}%`, trend: "up" as const },
      { label: "ROI", value: `${(i + 1) * 2}x`, trend: "up" as const },
      { label: "Time Saved", value: `${(i + 1) * 10}%`, trend: "up" as const }
    ],
    tags: [`${servicePrefix}`, "success", "results", i % 2 === 0 ? "featured" : "regular"],
    date: new Date(2024, i % 12, i + 1).toLocaleDateString(),
    link: `/case-studies/${servicePrefix}-case-study-${i + 1}`,
    featured: i === 0,
    results: `+${(i + 1) * 50}% improvement`,
    industry: i % 3 === 0 ? "Technology" : i % 3 === 1 ? "Healthcare" : "Finance",
    duration: `${i + 1} months`,
    services: [servicePrefix]
  }));
};

/**
 * Debug utility for case study validation issues
 */
export const debugCaseStudyValidation = (data: unknown, serviceName: string = "Unknown"): void => {
  console.group(`Case Study Validation Debug: ${serviceName}`);
  
  try {
    const validation = validateCaseStudyCarouselProps(data);
    
    if (validation.isValid && validation.props) {
      console.log("✅ Validation passed");
      
      const quality = assessCaseStudyCarouselQuality(validation.props.caseStudies);
      console.log(`Quality score: ${quality.score}/100`);
      
      if (quality.recommendations.length > 0) {
        console.log("Recommendations:", quality.recommendations);
      }
      
      // Individual case study analysis
      validation.props.caseStudies.forEach((study, index) => {
        const studyValidation = validateCaseStudyBusinessRules(study);
        if (studyValidation.warnings.length > 0) {
          console.log(`Case Study ${index + 1} warnings:`, studyValidation.warnings);
        }
      });
    } else {
      console.log("❌ Validation failed");
      console.log("Errors:", validation.errors);
    }
  } catch (error) {
    console.error("Debug validation failed:", error);
  }
  
  console.groupEnd();
};