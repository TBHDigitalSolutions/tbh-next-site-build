// /src/data/caseStudies/index.ts
// Main aggregation and export file for all case study data

// Re-export types and utilities
export type { 
  CaseStudy, 
  CaseStudyMetric, 
  LegacyCaseStudy,
  CaseStudyInput,
  CaseStudyCategory
} from './_types';

export { 
  isValidCaseStudy,
  isValidCaseStudyMetric,
  CASE_STUDY_CATEGORIES,
  generateCaseStudyId,
  normalizeCaseStudyMetrics
} from './_types';

// Re-export utilities
export * from './_utils';
export * from './_validators';

import type { CategorySlug } from '@/data/portfolio/_types';
import type { CaseStudy } from './_types';

// Import service-specific case studies (stub imports for missing categories)
// TODO: Update these imports as you create the actual data files

// Existing case studies (update paths as needed)
// import { webDevelopmentCases } from './web-development/web-development-cases';

// Stub imports for missing categories - replace with actual imports
const webDevelopmentCases: CaseStudy[] = [];
const videoProductionCases: CaseStudy[] = [];
const seoServicesCases: CaseStudy[] = [];
const marketingServicesCases: CaseStudy[] = [];
const contentProductionCases: CaseStudy[] = [];
const leadGenerationCases: CaseStudy[] = [];

// Master data aggregation
export const ALL_CASE_STUDIES = [
  ...webDevelopmentCases,
  ...videoProductionCases,
  ...seoServicesCases,
  ...marketingServicesCases,
  ...contentProductionCases,
  ...leadGenerationCases
];

// Service-specific exports for direct access
export {
  webDevelopmentCases,
  videoProductionCases,
  seoServicesCases,
  marketingServicesCases,
  contentProductionCases,
  leadGenerationCases
};

// Primary API functions
export const getAllCaseStudies = (): CaseStudy[] => ALL_CASE_STUDIES;

export const getCaseStudiesByCategory = (
  category: CategorySlug,
  limit?: number
): CaseStudy[] => {
  const categoryStudies = ALL_CASE_STUDIES.filter(
    study => study.category === category
  );

  // Sort by featured first, then by priority
  const sorted = categoryStudies.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return (a.priority || 999) - (b.priority || 999);
  });

  return limit ? sorted.slice(0, limit) : sorted;
};

export const getFeaturedCaseStudies = (): CaseStudy[] => {
  return ALL_CASE_STUDIES.filter(study => study.featured);
};

export const getCaseStudyById = (id: string): CaseStudy | undefined => {
  return ALL_CASE_STUDIES.find(study => study.id === id);
};

export const getCaseStudiesByClient = (client: string): CaseStudy[] => {
  const q = client.toLowerCase();
  return ALL_CASE_STUDIES.filter(study => 
    study.client.toLowerCase().includes(q)
  );
};

export const getCaseStudiesByIndustry = (industry: string): CaseStudy[] => {
  const q = industry.toLowerCase();
  return ALL_CASE_STUDIES.filter(study => 
    study.industry?.toLowerCase().includes(q)
  );
};

export const searchCaseStudies = (query: string): CaseStudy[] => {
  const q = query.toLowerCase();
  return ALL_CASE_STUDIES.filter(study => 
    study.title.toLowerCase().includes(q) ||
    study.summary.toLowerCase().includes(q) ||
    study.client.toLowerCase().includes(q) ||
    study.challenge?.toLowerCase().includes(q) ||
    study.solution?.toLowerCase().includes(q) ||
    study.tags?.some(tag => tag.toLowerCase().includes(q))
  );
};

// Analytics and stats
export const getCategoryStats = (): Record<CategorySlug, number> => {
  const stats = {} as Record<CategorySlug, number>;
  ALL_CASE_STUDIES.forEach(study => {
    stats[study.category] = (stats[study.category] || 0) + 1;
  });
  return stats;
};

export const getAvailableIndustries = (): string[] => {
  const industries = Array.from(new Set(
    ALL_CASE_STUDIES
      .map(study => study.industry)
      .filter(industry => industry !== undefined)
  )) as string[];
  
  return industries.sort();
};

export const getCaseStudyStats = () => {
  const totalStudies = ALL_CASE_STUDIES.length;
  const featuredCount = ALL_CASE_STUDIES.filter(study => study.featured).length;
  const categoryStats = getCategoryStats();
  const industries = getAvailableIndustries();
  
  return {
    totalStudies,
    featuredCount,
    categoryCount: Object.keys(categoryStats).length,
    categoryStats,
    industryCount: industries.length,
    industries,
    averageStudiesPerCategory: totalStudies / Math.max(1, Object.keys(categoryStats).length),
    summary: {
      totalStudies,
      featuredStudies: featuredCount,
      categoriesWithStudies: Object.entries(categoryStats).filter(([, count]) => count > 0),
      availableIndustries: industries.length
    }
  };
};

// Featured case studies by category (exactly 2-3 each recommended)
export const getAllFeaturedByCategory = () => {
  const result = {} as Record<CategorySlug, CaseStudy[]>;
  
  const categories: CategorySlug[] = [
    'web-development',
    'video-production', 
    'seo-services',
    'marketing-services',
    'content-production',
    'lead-generation'
  ];
  
  categories.forEach(category => {
    result[category] = getCaseStudiesByCategory(category).filter(study => study.featured);
  });
  
  return result;
};

// Development validation and stats
export const validateAndGetStats = () => {
  const validation = runCaseStudyValidation(ALL_CASE_STUDIES);
  const stats = getCaseStudyStats();
  
  return {
    validation,
    stats,
    summary: {
      totalStudies: ALL_CASE_STUDIES.length,
      featuredStudies: getFeaturedCaseStudies().length,
      categoriesWithStudies: Object.entries(stats.categoryStats).filter(([, count]) => count > 0),
      isValid: validation.isValid
    }
  };
};

// Backward compatibility aliases
export const getAllStudies = getAllCaseStudies;
export const getStudiesByCategory = getCaseStudiesByCategory;
export const getFeaturedByCategory = (category: CategorySlug, limit = 3) => 
  getCaseStudiesByCategory(category).filter(study => study.featured).slice(0, limit);

// Raw data export for direct access
export { ALL_CASE_STUDIES as RAW_CASE_STUDIES };