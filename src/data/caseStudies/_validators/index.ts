// /src/data/caseStudies/_validators/index.ts
// Case studies validation with business rules and quality scoring

import { z } from 'zod';
import type { CaseStudy, CaseStudyMetric } from '../_types';
import type { CategorySlug } from '@/data/portfolio/_types';
import { CANONICAL_CATEGORIES } from '@/data/portfolio/_types';

// Zod schemas
const CaseStudyMetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.string().min(1, "Metric value is required")
});

const CaseStudySchema = z.object({
  id: z.string().min(1, "Case study ID is required").max(50, "ID too long"),
  client: z.string().min(1, "Client name is required").max(100, "Client name too long"),
  title: z.string().min(1, "Title is required").max(150, "Title too long"),
  summary: z.string().min(50, "Summary too short (minimum 50 characters)").max(500, "Summary too long"),
  category: z.enum(CANONICAL_CATEGORIES, {
    errorMap: () => ({ 
      message: `Category must be one of: ${CANONICAL_CATEGORIES.join(', ')}` 
    })
  }),
  logo: z.string().optional(),
  primaryMetric: CaseStudyMetricSchema,
  secondaryMetrics: z.array(CaseStudyMetricSchema).max(5, "Too many secondary metrics").optional(),
  link: z.string().url("Link must be a valid URL").optional(),
  featured: z.boolean(),
  priority: z.number().int().min(1).max(999).optional(),
  industry: z.string().max(50, "Industry name too long").optional(),
  timeline: z.string().max(50, "Timeline too long").optional(),
  challenge: z.string().max(1000, "Challenge description too long").optional(),
  solution: z.string().max(1000, "Solution description too long").optional(),
  results: z.array(z.string()).max(10, "Too many result items").optional(),
  tags: z.array(z.string().min(1)).max(20, "Too many tags").optional(),
  publishedDate: z.string().optional()
});

export type ValidationReport = {
  isValid: boolean;
  schemaErrors: string[];
  businessRuleErrors: string[];
  stats: {
    total: number;
    byCategory: Record<CategorySlug, number>;
    featuredByCategory: Record<CategorySlug, number>;
    missingAssets: string[];
    qualityScore: number;
  };
};

// Validation functions
export const validateCaseStudy = (study: unknown) => {
  return CaseStudySchema.safeParse(study);
};

export const validateCaseStudies = (studies: unknown[]) => {
  const results = studies.map((study, index) => ({
    index,
    result: validateCaseStudy(study)
  }));
  
  const errors = results.filter(r => !r.result.success);
  const validStudies = results.filter(r => r.result.success).map(r => r.result.data!);
  
  return {
    isValid: errors.length === 0,
    totalStudies: studies.length,
    validStudies: validStudies.length,
    errors: errors.map(e => ({
      index: e.index,
      issues: e.result.error?.issues || []
    })),
    data: validStudies
  };
};

// Business rule validation
function validateBusinessRules(studies: CaseStudy[]): string[] {
  const errors: string[] = [];
  
  // Check for duplicate IDs
  const ids = studies.map(study => study.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate IDs found: ${Array.from(new Set(duplicateIds)).join(', ')}`);
  }
  
  // Check featured distribution (should have at least 1 per category, ideally 2-3)
  const categoriesWithTooFewFeatured: string[] = [];
  CANONICAL_CATEGORIES.forEach(category => {
    const featuredCount = studies.filter(study => 
      study.category === category && study.featured
    ).length;
    
    if (featuredCount === 0) {
      categoriesWithTooFewFeatured.push(`${category} (${featuredCount})`);
    }
  });
  
  if (categoriesWithTooFewFeatured.length > 0) {
    errors.push(`Categories with no featured case studies: ${categoriesWithTooFewFeatured.join(', ')}`);
  }
  
  // Check for missing assets
  const assetIssues: string[] = [];
  studies.forEach(study => {
    if (!study.logo) {
      assetIssues.push(`${study.id}: missing logo`);
    }
    
    if (!study.primaryMetric.value || study.primaryMetric.value === '') {
      assetIssues.push(`${study.id}: primary metric missing value`);
    }
  });
  
  if (assetIssues.length > 0) {
    errors.push(`Asset issues: ${assetIssues.join(', ')}`);
  }
  
  return errors;
}

// Quality scoring
function calculateQualityScore(studies: CaseStudy[]): number {
  let score = 100;
  
  // Deduct for missing logos
  const missingLogos = studies.filter(study => !study.logo).length;
  score -= Math.min(20, missingLogos * 5);
  
  // Deduct for short summaries
  const shortSummaries = studies.filter(study => study.summary.length < 100).length;
  score -= Math.min(15, shortSummaries * 3);
  
  // Deduct for missing secondary metrics
  const missingSecondaryMetrics = studies.filter(study => 
    !study.secondaryMetrics || study.secondaryMetrics.length === 0
  ).length;
  score -= Math.min(10, missingSecondaryMetrics * 2);
  
  // Deduct for missing challenges/solutions
  const missingDetails = studies.filter(study => 
    !study.challenge || !study.solution
  ).length;
  score -= Math.min(15, missingDetails * 3);
  
  // Bonus for comprehensive case studies
  const comprehensiveStudies = studies.filter(study => 
    study.challenge && study.solution && study.results && study.results.length > 0
  ).length;
  score += Math.min(10, comprehensiveStudies * 2);
  
  return Math.max(0, Math.min(100, score));
}

// Get statistics
function getStats(studies: CaseStudy[]): ValidationReport["stats"] {
  const byCategory: Record<CategorySlug, number> = {} as Record<CategorySlug, number>;
  const featuredByCategory: Record<CategorySlug, number> = {} as Record<CategorySlug, number>;
  const missingAssets: string[] = [];

  // Initialize all categories to 0
  CANONICAL_CATEGORIES.forEach(cat => {
    byCategory[cat] = 0;
    featuredByCategory[cat] = 0;
  });

  // Count studies and check assets
  for (const study of studies) {
    byCategory[study.category] += 1;
    if (study.featured) {
      featuredByCategory[study.category] += 1;
    }

    // Check for missing assets
    if (!study.logo) {
      missingAssets.push(`${study.id}: missing logo`);
    }
    if (!study.primaryMetric.value) {
      missingAssets.push(`${study.id}: missing primary metric value`);
    }
  }

  const qualityScore = calculateQualityScore(studies);

  return { 
    total: studies.length, 
    byCategory, 
    featuredByCategory, 
    missingAssets,
    qualityScore
  };
}

// Main validation function
export function validateCaseStudyData(studies: CaseStudy[]): ValidationReport {
  // Schema validation
  const schemaValidation = validateCaseStudies(studies);
  
  if (!schemaValidation.isValid) {
    return {
      isValid: false,
      schemaErrors: schemaValidation.errors.map(e => 
        `Study ${e.index + 1}: ${e.issues.map(i => i.message).join(', ')}`
      ),
      businessRuleErrors: [],
      stats: {
        total: studies.length,
        byCategory: {} as Record<CategorySlug, number>,
        featuredByCategory: {} as Record<CategorySlug, number>,
        missingAssets: [],
        qualityScore: 0
      }
    };
  }
  
  // Business rule validation
  const businessRuleErrors = validateBusinessRules(schemaValidation.data);
  
  // Generate stats
  const stats = getStats(schemaValidation.data);
  
  return {
    isValid: schemaValidation.isValid && businessRuleErrors.length === 0,
    schemaErrors: [],
    businessRuleErrors,
    stats,
  };
}

// Development helper
export function runCaseStudyValidation(studies: CaseStudy[]): ValidationReport {
  const report = validateCaseStudyData(studies);
  
  if (process.env.NODE_ENV === 'development') {
    if (report.isValid) {
      console.log('✅ Case Studies validation passed', {
        total: report.stats.total,
        qualityScore: report.stats.qualityScore,
        categories: Object.keys(report.stats.byCategory).length
      });
    } else {
      console.error('❌ Case Studies validation failed:');
      if (report.schemaErrors.length > 0) {
        console.error('Schema errors:', report.schemaErrors);
      }
      if (report.businessRuleErrors.length > 0) {
        console.error('Business rule errors:', report.businessRuleErrors);
      }
    }
  }
  
  return report;
}

// Service-specific validators
export const createServiceValidator = (serviceName: string) => ({
  validate: (studies: CaseStudy[]) => {
    const report = validateCaseStudyData(studies);
    
    // Add service-specific validation
    const serviceErrors: string[] = [];
    
    // Check minimum case studies per service (at least 2)
    if (studies.length < 2) {
      serviceErrors.push(`${serviceName} should have at least 2 case studies (has ${studies.length})`);
    }
    
    // Check for at least 1 featured
    const featuredCount = studies.filter(study => study.featured).length;
    if (featuredCount === 0) {
      serviceErrors.push(`${serviceName} should have at least 1 featured case study`);
    }
    
    return {
      ...report,
      businessRuleErrors: [...report.businessRuleErrors, ...serviceErrors],
      isValid: report.isValid && serviceErrors.length === 0
    };
  }
});

// Export schemas for external use
export { CaseStudySchema, CaseStudyMetricSchema };