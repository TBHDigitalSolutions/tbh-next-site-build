// /src/data/portfolio/_validators/portfolio.validate.ts
// Portfolio data validation with comprehensive business rules

import { ProjectArraySchema } from "./schema";
import type { Project, CategorySlug } from "../_types";
import { CANONICAL_CATEGORIES } from "../_types";

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

export function getStats(items: Project[]): ValidationReport["stats"] {
  const byCategory: Record<CategorySlug, number> = {} as Record<CategorySlug, number>;
  const featuredByCategory: Record<CategorySlug, number> = {} as Record<CategorySlug, number>;
  const missingAssets: string[] = [];

  // Initialize all categories to 0
  CANONICAL_CATEGORIES.forEach(cat => {
    byCategory[cat] = 0;
    featuredByCategory[cat] = 0;
  });

  // Count items and check assets
  for (const item of items) {
    byCategory[item.category] += 1;
    if (item.featured) {
      featuredByCategory[item.category] += 1;
    }

    // Check for missing assets
    if (!item.media?.thumbnail) {
      missingAssets.push(`${item.id}: missing thumbnail`);
    }
    if (item.media?.type === "video" && !item.media?.poster) {
      missingAssets.push(`${item.id}: video missing poster`);
    }
    if (!item.media?.src) {
      missingAssets.push(`${item.id}: missing media source`);
    }
  }

  // Calculate quality score
  let qualityScore = 100;
  
  // Deduct for missing assets
  qualityScore -= Math.min(30, missingAssets.length * 5);
  
  // Deduct for empty categories
  const emptyCategories = Object.values(byCategory).filter(count => count === 0).length;
  qualityScore -= emptyCategories * 10;
  
  // Deduct for categories with no featured items
  const categoriesWithoutFeatured = Object.values(featuredByCategory).filter(count => count === 0).length;
  qualityScore -= categoriesWithoutFeatured * 5;

  return { 
    total: items.length, 
    byCategory, 
    featuredByCategory, 
    missingAssets,
    qualityScore: Math.max(0, qualityScore)
  };
}

function validateBusinessRules(items: Project[]): string[] {
  const errors: string[] = [];

  // Check for unique IDs
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) {
      errors.push(`Duplicate project ID: ${item.id}`);
    }
    ids.add(item.id);
  }

  // Check for required thumbnails
  for (const item of items) {
    if (!item.media?.thumbnail) {
      errors.push(`Missing thumbnail for project: ${item.id}`);
    }
  }

  // Check featured item distribution (recommend 3 per category)
  const featuredPerCategory: Record<string, number> = {};
  for (const item of items) {
    if (item.featured) {
      featuredPerCategory[item.category] = (featuredPerCategory[item.category] || 0) + 1;
    }
  }

  // Warn about categories with too few or too many featured items
  for (const category of CANONICAL_CATEGORIES) {
    const count = featuredPerCategory[category] || 0;
    if (count === 0) {
      errors.push(`Category "${category}" has no featured items (recommend 3)`);
    } else if (count > 5) {
      errors.push(`Category "${category}" has too many featured items: ${count} (recommend 3-5)`);
    }
  }

  return errors;
}

export function validatePortfolio(items: Project[]): ValidationReport {
  // Schema validation
  const schema = ProjectArraySchema.safeParse(items);
  const schemaErrors = schema.success
    ? []
    : schema.error.issues.map((issue) => 
        `${issue.path.join(".")}: ${issue.message}`
      );

  // Business rule validation
  const businessRuleErrors = validateBusinessRules(items);
  
  // Generate stats
  const stats = getStats(items);

  return {
    isValid: schemaErrors.length === 0 && businessRuleErrors.length === 0,
    schemaErrors,
    businessRuleErrors,
    stats,
  };
}

// Development helper for logging validation results
export function runPortfolioValidation(items: Project[]): ValidationReport {
  const report = validatePortfolio(items);
  
  if (process.env.NODE_ENV === 'development') {
    if (report.isValid) {
      console.log('✅ Portfolio validation passed', {
        total: report.stats.total,
        qualityScore: report.stats.qualityScore,
        categories: Object.keys(report.stats.byCategory).length
      });
    } else {
      console.error('❌ Portfolio validation failed:');
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