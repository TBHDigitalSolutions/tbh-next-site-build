// src/components/ui/organisms/TechStack/adapters.ts

import type { 
  TechStackShowcaseProps, 
  Tech, 
  TechCategory 
} from "./TechStack.types";

/**
 * TechStack Data Adapters for Service Templates
 * Maps raw service page data to TechStack component props
 */

// ============================================================================
// Input Types (What Service Pages Provide)
// ============================================================================

export interface TechStackInput {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Array of technologies or categories */
  technologies?: TechInput[];
  /** Legacy format: organized by category */
  categories?: TechCategoryInput[];
  /** Configuration options */
  showCategories?: boolean;
  showExperience?: boolean;
  showProjectCounts?: boolean;
  enableFiltering?: boolean;
  enableSearch?: boolean;
}

export interface TechInput {
  id?: string;
  name: string;
  logo?: string;
  category?: string | TechCategory;
  expertise?: string;
  experience?: string;
  projects?: number;
  featured?: boolean;
  link?: string;
  // Legacy fields
  icon?: string;
  url?: string;
  years?: string;
  level?: string;
}

export interface TechCategoryInput {
  name: string;
  technologies: TechInput[];
}

export type TechStackSection = {
  title?: string;
  subtitle?: string;
  data: TechStackInput | TechInput[] | null | undefined;
}

// ============================================================================
// Core Transformation Functions
// ============================================================================

/**
 * Normalizes various tech input formats into consistent Tech[]
 */
export const normalizeTechInput = (input: TechStackInput | TechInput[] | null | undefined): Tech[] => {
  if (!input) return [];
  
  // Handle direct array of technologies
  if (Array.isArray(input)) {
    return input.map(normalizeTechItem).filter(Boolean);
  }
  
  const technologies: Tech[] = [];
  
  // Handle structured input with technologies array
  if (input.technologies && Array.isArray(input.technologies)) {
    technologies.push(...input.technologies.map(normalizeTechItem).filter(Boolean));
  }
  
  // Handle legacy categories format
  if (input.categories && Array.isArray(input.categories)) {
    for (const category of input.categories) {
      if (category.technologies && Array.isArray(category.technologies)) {
        const categoryTechs = category.technologies.map(tech => 
          normalizeTechItem({
            ...tech,
            category: tech.category || category.name
          })
        ).filter(Boolean);
        technologies.push(...categoryTechs);
      }
    }
  }
  
  return technologies;
};

/**
 * Normalizes a single tech item with field mapping and validation
 */
export const normalizeTechItem = (tech: TechInput): Tech | null => {
  if (!tech || !tech.name) return null;
  
  return {
    id: tech.id || generateTechId(tech.name),
    name: tech.name.trim(),
    logo: tech.logo || tech.icon,
    category: normalizeTechCategory(tech.category),
    expertise: normalizeExpertise(tech.expertise || tech.level),
    experience: normalizeExperience(tech.experience || tech.years),
    projects: typeof tech.projects === 'number' ? tech.projects : undefined,
    featured: Boolean(tech.featured),
    link: tech.link || tech.url
  };
};

/**
 * Normalizes category strings to standard TechCategory enum
 */
export const normalizeTechCategory = (category: string | TechCategory | undefined): TechCategory => {
  if (!category) return "Tools";
  
  const categoryMap: Record<string, TechCategory> = {
    // Frontend variations
    'frontend': 'Frontend',
    'front-end': 'Frontend',
    'client-side': 'Frontend',
    'ui': 'Frontend',
    'react': 'Frontend',
    'javascript': 'Frontend',
    'js': 'Frontend',
    
    // Backend variations
    'backend': 'Backend',
    'back-end': 'Backend',
    'server-side': 'Backend',
    'api': 'Backend',
    'node': 'Backend',
    'python': 'Backend',
    'php': 'Backend',
    
    // Database variations
    'database': 'Database',
    'db': 'Database',
    'data': 'Database',
    'sql': 'Database',
    'nosql': 'Database',
    'mongodb': 'Database',
    'postgres': 'Database',
    
    // Cloud variations
    'cloud': 'Cloud',
    'aws': 'Cloud',
    'azure': 'Cloud',
    'gcp': 'Cloud',
    'hosting': 'Cloud',
    'infrastructure': 'Cloud',
    
    // DevOps variations
    'devops': 'DevOps',
    'ci/cd': 'DevOps',
    'deployment': 'DevOps',
    'docker': 'DevOps',
    'kubernetes': 'DevOps',
    
    // Tools variations
    'tools': 'Tools',
    'utilities': 'Tools',
    'development': 'Tools',
    'productivity': 'Tools',
    'analytics': 'Tools',
    'design': 'Tools'
  };
  
  const normalized = category.toLowerCase().trim();
  return categoryMap[normalized] || 'Tools';
};

/**
 * Normalizes expertise levels to standard format
 */
export const normalizeExpertise = (expertise: string | undefined): "Expert" | "Advanced" | "Intermediate" | undefined => {
  if (!expertise) return undefined;
  
  const level = expertise.toLowerCase().trim();
  
  if (level.includes('expert') || level.includes('senior') || level === '5' || level === 'advanced+') {
    return 'Expert';
  }
  if (level.includes('advanced') || level === '4' || level.includes('proficient')) {
    return 'Advanced';
  }
  if (level.includes('intermediate') || level === '3' || level.includes('competent')) {
    return 'Intermediate';
  }
  
  return undefined;
};

/**
 * Normalizes experience strings to consistent format
 */
export const normalizeExperience = (experience: string | undefined): string | undefined => {
  if (!experience) return undefined;
  
  const exp = experience.toLowerCase().trim();
  
  // Extract numbers and convert to consistent format
  const yearMatch = exp.match(/(\d+)/);
  if (yearMatch) {
    const years = parseInt(yearMatch[1]);
    if (years >= 5) return '5+ years';
    if (years >= 3) return '3+ years';
    if (years >= 1) return '1+ years';
  }
  
  return experience; // Return as-is if no pattern matches
};

/**
 * Generates a safe ID from tech name
 */
export const generateTechId = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// ============================================================================
// Service-Specific Adapter Functions
// ============================================================================

/**
 * Creates TechStack section for Web Development services
 */
export const createWebDevTechStackSection = (
  input: TechStackInput | TechInput[],
  overrides: Partial<TechStackShowcaseProps> = {}
): TechStackShowcaseProps => ({
  title: "Technology Stack",
  subtitle: "Modern tools and frameworks we use to build exceptional web experiences",
  technologies: normalizeTechInput(input),
  showCategories: true,
  showExperience: true,
  showProjectCounts: true,
  enableFiltering: true,
  enableSearch: true,
  ...overrides
});

/**
 * Creates TechStack section for Video Production services
 */
export const createVideoTechStackSection = (
  input: TechStackInput | TechInput[],
  overrides: Partial<TechStackShowcaseProps> = {}
): TechStackShowcaseProps => ({
  title: "Production Tools",
  subtitle: "Professional-grade equipment and software for cinematic results",
  technologies: normalizeTechInput(input),
  showCategories: true,
  showExperience: false, // Focus on tools rather than experience
  showProjectCounts: true,
  enableFiltering: true,
  enableSearch: true,
  ...overrides
});

/**
 * Creates TechStack section for SEO Services
 */
export const createSEOTechStackSection = (
  input: TechStackInput | TechInput[],
  overrides: Partial<TechStackShowcaseProps> = {}
): TechStackShowcaseProps => ({
  title: "SEO Tools & Analytics",
  subtitle: "Data-driven tools for research, optimization, and performance tracking",
  technologies: normalizeTechInput(input),
  showCategories: true,
  showExperience: true,
  showProjectCounts: false, // Less relevant for SEO tools
  enableFiltering: true,
  enableSearch: true,
  ...overrides
});

/**
 * Creates TechStack section for Marketing Services
 */
export const createMarketingTechStackSection = (
  input: TechStackInput | TechInput[],
  overrides: Partial<TechStackShowcaseProps> = {}
): TechStackShowcaseProps => ({
  title: "Marketing Technology",
  subtitle: "Integrated tools for campaigns, automation, and performance measurement",
  technologies: normalizeTechInput(input),
  showCategories: true,
  showExperience: true,
  showProjectCounts: true,
  enableFiltering: true,
  enableSearch: true,
  ...overrides
});

/**
 * Creates TechStack section for Lead Generation
 */
export const createLeadGenTechStackSection = (
  input: TechStackInput | TechInput[],
  overrides: Partial<TechStackShowcaseProps> = {}
): TechStackShowcaseProps => ({
  title: "Lead Gen Stack",
  subtitle: "Prospecting, outreach, and CRM tools for systematic lead generation",
  technologies: normalizeTechInput(input),
  showCategories: true,
  showExperience: true,
  showProjectCounts: true,
  enableFiltering: true,
  enableSearch: true,
  ...overrides
});

/**
 * Creates TechStack section for Content Production
 */
export const createContentTechStackSection = (
  input: TechStackInput | TechInput[],
  overrides: Partial<TechStackShowcaseProps> = {}
): TechStackShowcaseProps => ({
  title: "Content Creation Tools",
  subtitle: "Writing, design, and publishing tools for high-quality content at scale",
  technologies: normalizeTechInput(input),
  showCategories: true,
  showExperience: true,
  showProjectCounts: false, // Focus on capabilities over project counts
  enableFiltering: true,
  enableSearch: true,
  ...overrides
});

// ============================================================================
// Template Integration Adapter
// ============================================================================

/**
 * Main adapter function for service templates
 * Auto-detects service type and applies appropriate defaults
 */
export const toTechStackProps = (
  section: TechStackSection,
  context?: { 
    hub?: string; 
    service?: string;
    serviceType?: 'web-development' | 'video-production' | 'seo' | 'marketing' | 'lead-generation' | 'content-production';
  }
): TechStackShowcaseProps | null => {
  
  const input = section.data;
  if (!input) return null;
  
  const technologies = normalizeTechInput(input);
  if (technologies.length === 0) return null;
  
  // Determine service type from context
  const serviceType = context?.serviceType || inferServiceType(context?.hub, context?.service);
  
  // Apply service-specific defaults
  const baseProps = {
    title: section.title || "Technology Stack",
    subtitle: section.subtitle,
    technologies,
  };
  
  switch (serviceType) {
    case 'web-development':
      return createWebDevTechStackSection(input, baseProps);
    case 'video-production':
      return createVideoTechStackSection(input, baseProps);
    case 'seo':
      return createSEOTechStackSection(input, baseProps);
    case 'marketing':
      return createMarketingTechStackSection(input, baseProps);
    case 'lead-generation':
      return createLeadGenTechStackSection(input, baseProps);
    case 'content-production':
      return createContentTechStackSection(input, baseProps);
    default:
      // Generic fallback
      return {
        ...baseProps,
        showCategories: true,
        showExperience: true,
        showProjectCounts: true,
        enableFiltering: true,
        enableSearch: true,
      };
  }
};

/**
 * Infers service type from hub/service context
 */
export const inferServiceType = (
  hub?: string, 
  service?: string
): 'web-development' | 'video-production' | 'seo' | 'marketing' | 'lead-generation' | 'content-production' | 'generic' => {
  
  const contextStr = `${hub || ''} ${service || ''}`.toLowerCase();
  
  if (contextStr.includes('web') || contextStr.includes('development')) return 'web-development';
  if (contextStr.includes('video') || contextStr.includes('production')) return 'video-production';
  if (contextStr.includes('seo') || contextStr.includes('search')) return 'seo';
  if (contextStr.includes('marketing') || contextStr.includes('advertising')) return 'marketing';
  if (contextStr.includes('lead') || contextStr.includes('generation')) return 'lead-generation';
  if (contextStr.includes('content') || contextStr.includes('editorial')) return 'content-production';
  
  return 'generic';
};

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates TechStack input data
 */
export const validateTechStackInput = (input: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  data?: TechStackInput 
} => {
  const errors: string[] = [];
  
  if (!input) {
    return { isValid: false, errors: ['TechStack input is required'] };
  }
  
  if (Array.isArray(input)) {
    if (input.length === 0) {
      errors.push('Technologies array cannot be empty');
    }
    
    input.forEach((tech, index) => {
      if (!tech || typeof tech !== 'object') {
        errors.push(`Technology at index ${index} must be an object`);
      } else if (!tech.name) {
        errors.push(`Technology at index ${index} must have a name`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? { technologies: input } : undefined
    };
  }
  
  if (typeof input === 'object') {
    const techStackInput = input as TechStackInput;
    
    if (!techStackInput.technologies && !techStackInput.categories) {
      errors.push('TechStack must have either technologies or categories');
    }
    
    if (techStackInput.technologies && !Array.isArray(techStackInput.technologies)) {
      errors.push('Technologies must be an array');
    }
    
    if (techStackInput.categories && !Array.isArray(techStackInput.categories)) {
      errors.push('Categories must be an array');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? techStackInput : undefined
    };
  }
  
  return { isValid: false, errors: ['Invalid TechStack input format'] };
};

// Export main adapter function for template usage
export { toTechStackProps as toTechStackAdapter };