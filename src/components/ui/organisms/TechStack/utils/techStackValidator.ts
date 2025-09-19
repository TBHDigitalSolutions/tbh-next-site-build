// src/components/ui/organisms/TechStack/utils/techStackValidator.ts

import { z } from "zod";
import type { 
  Tech, 
  TechCategory, 
  TechStackShowcaseProps 
} from "../TechStack.types";

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Tech category enum schema
 */
export const techCategorySchema = z.enum([
  "Frontend", 
  "Backend", 
  "Database", 
  "Cloud", 
  "DevOps", 
  "Tools"
]);

/**
 * Expertise level schema
 */
export const expertiseSchema = z.enum([
  "Expert", 
  "Advanced", 
  "Intermediate"
]).optional();

/**
 * Single technology item schema
 */
export const techSchema = z.object({
  id: z.string().min(1, "Tech ID is required"),
  name: z.string().min(1, "Tech name is required"),
  logo: z.string().optional(),
  category: techCategorySchema,
  expertise: expertiseSchema,
  experience: z.string().optional(),
  projects: z.number().nonnegative().optional(),
  featured: z.boolean().optional(),
  link: z.string().url().optional().or(z.literal("")),
});

/**
 * TechStack showcase props schema
 */
export const techStackShowcaseSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  technologies: z.array(techSchema).min(1, "At least one technology is required"),
  showCategories: z.boolean().optional(),
  showExperience: z.boolean().optional(),
  showProjectCounts: z.boolean().optional(),
  enableFiltering: z.boolean().optional(),
  enableSearch: z.boolean().optional(),
  className: z.string().optional(),
});

/**
 * Input validation schemas (what adapters accept)
 */
export const techInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tech name is required"),
  logo: z.string().optional(),
  icon: z.string().optional(), // Legacy alias
  category: z.string().optional(),
  expertise: z.string().optional(),
  level: z.string().optional(), // Legacy alias
  experience: z.string().optional(),
  years: z.string().optional(), // Legacy alias
  projects: z.number().nonnegative().optional(),
  featured: z.boolean().optional(),
  link: z.string().optional(),
  url: z.string().optional(), // Legacy alias
});

export const techStackInputSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  technologies: z.array(techInputSchema).optional(),
  categories: z.array(z.object({
    name: z.string(),
    technologies: z.array(techInputSchema)
  })).optional(),
  showCategories: z.boolean().optional(),
  showExperience: z.boolean().optional(),
  showProjectCounts: z.boolean().optional(),
  enableFiltering: z.boolean().optional(),
  enableSearch: z.boolean().optional(),
}).refine(
  data => data.technologies || data.categories,
  "Either technologies or categories must be provided"
);

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a single tech item
 */
export const validateTech = (tech: unknown): tech is Tech => {
  const result = techSchema.safeParse(tech);
  return result.success;
};

/**
 * Validates tech input with detailed error reporting
 */
export const parseTech = (tech: unknown): { 
  success: boolean; 
  data?: Tech; 
  error?: string 
} => {
  const result = techSchema.safeParse(tech);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

/**
 * Validates TechStack showcase props
 */
export const validateTechStackShowcase = (props: unknown): props is TechStackShowcaseProps => {
  const result = techStackShowcaseSchema.safeParse(props);
  return result.success;
};

/**
 * Validates TechStack showcase with detailed error reporting
 */
export const parseTechStackShowcase = (props: unknown): { 
  success: boolean; 
  data?: TechStackShowcaseProps; 
  error?: string 
} => {
  const result = techStackShowcaseSchema.safeParse(props);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

/**
 * Validates raw TechStack input data
 */
export const validateTechStackInput = (input: unknown): { 
  success: boolean; 
  data?: any; 
  error?: string 
} => {
  const result = techStackInputSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a string is a valid tech category
 */
export const isValidTechCategory = (category: string): category is TechCategory => {
  return techCategorySchema.safeParse(category).success;
};

/**
 * Get all valid tech categories
 */
export const getValidTechCategories = (): TechCategory[] => {
  return ["Frontend", "Backend", "Database", "Cloud", "DevOps", "Tools"];
};

/**
 * Sanitize tech name for ID generation
 */
export const sanitizeTechName = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate unique tech ID from name
 */
export const generateUniqueTechId = (name: string, existingIds: string[] = []): string => {
  let baseId = sanitizeTechName(name);
  if (!baseId) baseId = 'tech-item';
  
  let uniqueId = baseId;
  let counter = 1;
  
  while (existingIds.includes(uniqueId)) {
    uniqueId = `${baseId}-${counter}`;
    counter++;
  }
  
  return uniqueId;
};

/**
 * Validate and clean tech stack data for service templates
 */
export const validateAndCleanTechStack = (
  input: unknown,
  context?: { serviceName?: string; hub?: string }
): {
  isValid: boolean;
  technologies: Tech[];
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const technologies: Tech[] = [];
  
  // Validate input structure
  const inputValidation = validateTechStackInput(input);
  if (!inputValidation.success) {
    return {
      isValid: false,
      technologies: [],
      errors: [inputValidation.error || 'Invalid tech stack input'],
      warnings: []
    };
  }
  
  const data = inputValidation.data;
  const existingIds: string[] = [];
  
  // Process technologies array
  if (data.technologies) {
    data.technologies.forEach((tech: any, index: number) => {
      if (!tech.name) {
        errors.push(`Technology at index ${index} missing required name`);
        return;
      }
      
      // Generate ID if missing
      const id = tech.id || generateUniqueTechId(tech.name, existingIds);
      existingIds.push(id);
      
      // Validate required fields
      if (!tech.category && !isValidTechCategory(tech.category)) {
        warnings.push(`Technology "${tech.name}" has invalid category "${tech.category}", defaulting to "Tools"`);
      }
      
      // Build validated tech object
      const validatedTech: Tech = {
        id,
        name: tech.name.trim(),
        logo: tech.logo || tech.icon,
        category: isValidTechCategory(tech.category) ? tech.category : 'Tools',
        expertise: tech.expertise || tech.level,
        experience: tech.experience || tech.years,
        projects: typeof tech.projects === 'number' ? tech.projects : undefined,
        featured: Boolean(tech.featured),
        link: tech.link || tech.url
      };
      
      technologies.push(validatedTech);
    });
  }
  
  // Process categories format
  if (data.categories) {
    data.categories.forEach((category: any) => {
      if (!category.name || !Array.isArray(category.technologies)) {
        errors.push(`Invalid category structure: ${category.name || 'unnamed'}`);
        return;
      }
      
      category.technologies.forEach((tech: any) => {
        if (!tech.name) return;
        
        const id = tech.id || generateUniqueTechId(tech.name, existingIds);
        existingIds.push(id);
        
        const validatedTech: Tech = {
          id,
          name: tech.name.trim(),
          logo: tech.logo || tech.icon,
          category: isValidTechCategory(category.name) ? category.name : 'Tools',
          expertise: tech.expertise || tech.level,
          experience: tech.experience || tech.years,
          projects: typeof tech.projects === 'number' ? tech.projects : undefined,
          featured: Boolean(tech.featured),
          link: tech.link || tech.url
        };
        
        technologies.push(validatedTech);
      });
    });
  }
  
  // Final validation
  if (technologies.length === 0) {
    errors.push('No valid technologies found');
  }
  
  // Service-specific warnings
  if (context?.serviceName) {
    const serviceWarnings = validateServiceSpecificTechStack(technologies, context.serviceName);
    warnings.push(...serviceWarnings);
  }
  
  return {
    isValid: errors.length === 0,
    technologies,
    errors,
    warnings
  };
};

/**
 * Service-specific validation warnings
 */
export const validateServiceSpecificTechStack = (
  technologies: Tech[], 
  serviceName: string
): string[] => {
  const warnings: string[] = [];
  const categories = technologies.map(t => t.category);
  
  switch (serviceName.toLowerCase()) {
    case 'web-development':
      if (!categories.includes('Frontend')) {
        warnings.push('Web development service should include Frontend technologies');
      }
      if (!categories.includes('Backend')) {
        warnings.push('Web development service should include Backend technologies');
      }
      break;
      
    case 'video-production':
      if (!technologies.some(t => t.name.toLowerCase().includes('premiere') || 
                                  t.name.toLowerCase().includes('after') ||
                                  t.name.toLowerCase().includes('davinci'))) {
        warnings.push('Video production service should include video editing software');
      }
      break;
      
    case 'seo':
      if (!technologies.some(t => t.name.toLowerCase().includes('analytics') ||
                                  t.name.toLowerCase().includes('console') ||
                                  t.name.toLowerCase().includes('seo'))) {
        warnings.push('SEO service should include analytics and SEO tools');
      }
      break;
  }
  
  return warnings;
};