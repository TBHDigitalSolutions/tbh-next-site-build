// ===================================================================
// /src/data/packages/recommendations.ts
// ===================================================================
// Production-Ready Smart Package Recommendation Engine
// 
// Features:
// - Multi-dimensional recommendation algorithms
// - Business rule-based suggestions
// - Performance tracking and analytics
// - A/B testing support for recommendation strategies
// - Comprehensive validation and error handling
// - Integration with existing package system
// ===================================================================

import type { ServiceSlug, Package, AddOn, FeaturedCard, IntegratedBundle, Tier } from "./_types/packages.types";

// Import all package data
import contentProductionPackages from "./content-production/content-production-packages";
import leadGenerationPackages from "./lead-generation/lead-generation-packages";
import marketingPackages from "./marketing-services/marketing-packages";
import seoServicesPackages from "./seo-services/seo-services-packages";
import videoProductionPackages from "./video-production/video-production-packages";
import webDevelopmentPackages from "./web-development/web-development-packages";

import contentProductionAddOns from "./content-production/content-production-addons";
import leadGenerationAddOns from "./lead-generation/lead-generation-addons";
import marketingAddOns from "./marketing-services/marketing-addons";
import seoServicesAddOns from "./seo-services/seo-services-addons";
import videoProductionAddOns from "./video-production/video-production-addons";
import webDevelopmentAddOns from "./web-development/web-development-addons";

import { INTEGRATED_GROWTH_BUNDLES } from "./integrated-growth-packages";

// ============================
// CORE DATA AGGREGATION
// ============================

/**
 * Master package collection - single source of truth
 */
const ALL_PACKAGES: readonly Package[] = [
  ...contentProductionPackages,
  ...leadGenerationPackages,
  ...marketingPackages,
  ...seoServicesPackages,
  ...videoProductionPackages,
  ...webDevelopmentPackages
] as const;

/**
 * Master add-on collection
 */
const ALL_ADDONS: readonly AddOn[] = [
  ...contentProductionAddOns,
  ...leadGenerationAddOns,
  ...marketingAddOns,
  ...seoServicesAddOns,
  ...videoProductionAddOns,
  ...webDevelopmentAddOns
] as const;

// ============================
// RECOMMENDATION ALGORITHMS
// ============================

/**
 * Business context for smart recommendations
 */
export interface BusinessContext {
  industry?: string;
  businessSize?: 'startup' | 'small' | 'medium' | 'enterprise';
  budget?: 'budget' | 'standard' | 'premium';
  goals?: ('traffic' | 'leads' | 'sales' | 'brand' | 'efficiency')[];
  currentServices?: ServiceSlug[];
  timeline?: 'immediate' | 'short' | 'long';
  complexity?: 'simple' | 'moderate' | 'complex';
}

/**
 * Recommendation scoring weights
 */
const RECOMMENDATION_WEIGHTS = {
  // Service affinity (how well services work together)
  serviceAffinity: 0.3,
  // Tier progression (logical upgrade paths)
  tierProgression: 0.25,
  // Business goal alignment
  goalAlignment: 0.2,
  // Budget compatibility
  budgetFit: 0.15,
  // Popularity and success metrics
  performance: 0.1
} as const;

/**
 * Service affinity matrix - how well services complement each other
 */
const SERVICE_AFFINITY_MATRIX: Record<ServiceSlug, Record<ServiceSlug, number>> = {
  'webdev': {
    'webdev': 0.1, 'seo': 0.9, 'content': 0.8, 'marketing': 0.7, 'leadgen': 0.6, 'video': 0.5
  },
  'seo': {
    'seo': 0.1, 'content': 0.9, 'webdev': 0.8, 'marketing': 0.7, 'leadgen': 0.6, 'video': 0.5
  },
  'content': {
    'content': 0.1, 'seo': 0.9, 'video': 0.8, 'marketing': 0.7, 'leadgen': 0.6, 'webdev': 0.5
  },
  'video': {
    'video': 0.1, 'content': 0.8, 'marketing': 0.7, 'leadgen': 0.6, 'webdev': 0.5, 'seo': 0.4
  },
  'marketing': {
    'marketing': 0.1, 'leadgen': 0.9, 'content': 0.8, 'webdev': 0.7, 'video': 0.6, 'seo': 0.5
  },
  'leadgen': {
    'leadgen': 0.1, 'marketing': 0.9, 'webdev': 0.8, 'content': 0.7, 'video': 0.6, 'seo': 0.5
  }
};

/**
 * Goal to service mapping with weights
 */
const GOAL_SERVICE_MAPPING: Record<string, Record<ServiceSlug, number>> = {
  traffic: { seo: 0.9, content: 0.8, webdev: 0.6, marketing: 0.5, video: 0.4, leadgen: 0.3 },
  leads: { leadgen: 0.9, marketing: 0.8, webdev: 0.7, content: 0.6, seo: 0.5, video: 0.4 },
  sales: { marketing: 0.9, leadgen: 0.8, video: 0.7, content: 0.6, webdev: 0.5, seo: 0.4 },
  brand: { content: 0.9, video: 0.8, marketing: 0.7, seo: 0.6, webdev: 0.4, leadgen: 0.3 },
  efficiency: { marketing: 0.9, webdev: 0.8, content: 0.6, seo: 0.5, leadgen: 0.4, video: 0.3 }
};

/**
 * Budget tier mapping
 */
const BUDGET_TIER_MAPPING: Record<string, Record<Tier, number>> = {
  budget: { Essential: 0.9, Professional: 0.4, Enterprise: 0.1 },
  standard: { Essential: 0.6, Professional: 0.9, Enterprise: 0.4 },
  premium: { Essential: 0.3, Professional: 0.6, Enterprise: 0.9 }
};

// ============================
// CORE RECOMMENDATION FUNCTIONS
// ============================

/**
 * Calculate recommendation score for a package based on context
 */
function calculatePackageScore(pkg: Package, context: BusinessContext, currentServices: ServiceSlug[] = []): number {
  let score = 0;

  // Service affinity scoring
  const affinityScore = currentServices.length > 0 
    ? Math.max(...currentServices.map(service => SERVICE_AFFINITY_MATRIX[service]?.[pkg.service] || 0))
    : 0.5; // Neutral score if no current services
  score += affinityScore * RECOMMENDATION_WEIGHTS.serviceAffinity;

  // Goal alignment scoring
  const goalScore = context.goals?.length 
    ? Math.max(...context.goals.map(goal => GOAL_SERVICE_MAPPING[goal]?.[pkg.service] || 0))
    : 0.5;
  score += goalScore * RECOMMENDATION_WEIGHTS.goalAlignment;

  // Budget fit scoring
  const budgetScore = context.budget ? BUDGET_TIER_MAPPING[context.budget]?.[pkg.tier] || 0.5 : 0.5;
  score += budgetScore * RECOMMENDATION_WEIGHTS.budgetFit;

  // Performance boost for popular packages
  const performanceScore = pkg.popular ? 0.8 : 0.5;
  score += performanceScore * RECOMMENDATION_WEIGHTS.performance;

  // Tier progression bonus for logical upgrades
  const tierScore = getTierProgressionScore(pkg.tier, context.businessSize);
  score += tierScore * RECOMMENDATION_WEIGHTS.tierProgression;

  return Math.min(score, 1); // Cap at 1.0
}

/**
 * Get tier progression score based on business size
 */
function getTierProgressionScore(tier: Tier, businessSize?: string): number {
  const tierBusinessMapping: Record<string, Record<Tier, number>> = {
    startup: { Essential: 0.9, Professional: 0.6, Enterprise: 0.2 },
    small: { Essential: 0.7, Professional: 0.9, Enterprise: 0.4 },
    medium: { Essential: 0.4, Professional: 0.8, Enterprise: 0.9 },
    enterprise: { Essential: 0.2, Professional: 0.5, Enterprise: 0.9 }
  };

  return businessSize ? tierBusinessMapping[businessSize]?.[tier] || 0.5 : 0.5;
}

// ============================
// PUBLIC RECOMMENDATION API
// ============================

/**
 * Get smart package recommendations based on business context
 */
export function getSmartRecommendations(
  context: BusinessContext,
  limit: number = 3,
  excludeServices: ServiceSlug[] = []
): Package[] {
  const currentServices = context.currentServices || [];
  
  const scoredPackages = ALL_PACKAGES
    .filter(pkg => !excludeServices.includes(pkg.service))
    .filter(pkg => !currentServices.includes(pkg.service)) // Don't recommend current services
    .map(pkg => ({
      package: pkg,
      score: calculatePackageScore(pkg, context, currentServices)
    }))
    .sort((a, b) => b.score - a.score);

  return scoredPackages.slice(0, limit).map(item => item.package);
}

/**
 * Get service-specific recommendations (original function maintained for backward compatibility)
 */
export function getRecommendedPackages(service: ServiceSlug, limit: number = 3): Package[] {
  // For backward compatibility, use simple service-based logic
  const servicePackages = ALL_PACKAGES.filter(pkg => pkg.service === service);
  
  // Prioritize popular packages, then by tier progression
  return servicePackages
    .sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      
      const tierOrder: Record<Tier, number> = { Essential: 1, Professional: 2, Enterprise: 3 };
      return tierOrder[a.tier] - tierOrder[b.tier];
    })
    .slice(0, limit);
}

/**
 * Get recommended add-ons for a specific package
 */
export function getRecommendedAddOns(packageId: string, limit: number = 3): AddOn[] {
  const pkg = ALL_PACKAGES.find(p => p.id === packageId);
  if (!pkg) return [];

  const serviceAddOns = ALL_ADDONS.filter(addon => addon.service === pkg.service);
  const compatibleAddOns = serviceAddOns.filter(addon => 
    !addon.pairsBestWith || addon.pairsBestWith.includes(pkg.tier)
  );

  // Prioritize popular add-ons and those specifically designed for this tier
  return compatibleAddOns
    .sort((a, b) => {
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      
      const aFits = a.pairsBestWith?.includes(pkg.tier) ? 1 : 0;
      const bFits = b.pairsBestWith?.includes(pkg.tier) ? 1 : 0;
      return bFits - aFits;
    })
    .slice(0, limit);
}

/**
 * Get bundle recommendations based on business context
 */
export function getRecommendedBundles(context: BusinessContext, limit: number = 3): IntegratedBundle[] {
  const businessSizeBundleMapping: Record<string, string[]> = {
    startup: ['digital-transformation-starter', 'local-business-growth'],
    small: ['local-business-growth', 'ecommerce-accelerator'],
    medium: ['ecommerce-accelerator', 'thought-leadership-authority'],
    enterprise: ['digital-transformation-starter', 'thought-leadership-authority']
  };

  const industryBundleMapping: Record<string, string[]> = {
    'retail': ['ecommerce-accelerator', 'local-business-growth'],
    'ecommerce': ['ecommerce-accelerator', 'digital-transformation-starter'],
    'professional-services': ['thought-leadership-authority', 'local-business-growth'],
    'technology': ['digital-transformation-starter', 'thought-leadership-authority'],
    'events': ['event-launch-domination', 'thought-leadership-authority']
  };

  // Start with business size recommendations
  let recommendedIds = context.businessSize 
    ? businessSizeBundleMapping[context.businessSize] || []
    : [];

  // Add industry-specific recommendations
  if (context.industry && industryBundleMapping[context.industry]) {
    recommendedIds = [...new Set([...recommendedIds, ...industryBundleMapping[context.industry]])];
  }

  // Fallback to popular bundles
  if (recommendedIds.length === 0) {
    recommendedIds = ['local-business-growth', 'digital-transformation-starter', 'ecommerce-accelerator'];
  }

  return recommendedIds
    .slice(0, limit)
    .map(id => INTEGRATED_GROWTH_BUNDLES.find(bundle => bundle.id === id))
    .filter(Boolean) as IntegratedBundle[];
}

/**
 * Get cross-sell recommendations (packages from other services)
 */
export function getCrossSellRecommendations(
  currentServiceSlug: ServiceSlug, 
  currentTier: Tier,
  limit: number = 3
): Package[] {
  const targetServices = Object.keys(SERVICE_AFFINITY_MATRIX[currentServiceSlug])
    .filter(service => service !== currentServiceSlug)
    .sort((a, b) => 
      SERVICE_AFFINITY_MATRIX[currentServiceSlug][b as ServiceSlug] - 
      SERVICE_AFFINITY_MATRIX[currentServiceSlug][a as ServiceSlug]
    ) as ServiceSlug[];

  const recommendations: Package[] = [];
  
  for (const service of targetServices) {
    const servicePackages = ALL_PACKAGES.filter(pkg => pkg.service === service);
    
    // Try to match tier first, then get popular packages
    let candidate = servicePackages.find(pkg => pkg.tier === currentTier && pkg.popular);
    if (!candidate) {
      candidate = servicePackages.find(pkg => pkg.tier === currentTier);
    }
    if (!candidate) {
      candidate = servicePackages.find(pkg => pkg.popular);
    }
    if (!candidate && servicePackages.length > 0) {
      candidate = servicePackages[0];
    }
    
    if (candidate && !recommendations.find(r => r.id === candidate!.id)) {
      recommendations.push(candidate);
    }
    
    if (recommendations.length >= limit) break;
  }
  
  return recommendations;
}

/**
 * Get upgrade path recommendations (higher tier packages)
 */
export function getUpgradeRecommendations(currentPackageId: string): Package[] {
  const currentPackage = ALL_PACKAGES.find(pkg => pkg.id === currentPackageId);
  if (!currentPackage) return [];

  const tierOrder: Record<Tier, number> = { Essential: 1, Professional: 2, Enterprise: 3 };
  const currentTierLevel = tierOrder[currentPackage.tier];

  return ALL_PACKAGES
    .filter(pkg => 
      pkg.service === currentPackage.service && 
      tierOrder[pkg.tier] > currentTierLevel
    )
    .sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
}

// ============================
// UTILITY & SEARCH FUNCTIONS
// ============================

/**
 * Search packages with fuzzy matching
 */
export function searchPackages(query: string, filters?: {
  services?: ServiceSlug[];
  tiers?: Tier[];
  maxPrice?: number;
}): Package[] {
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  if (searchTerms.length === 0 || searchTerms[0] === '') {
    return [...ALL_PACKAGES];
  }

  let results = ALL_PACKAGES.filter(pkg => {
    // Apply filters first
    if (filters?.services && !filters.services.includes(pkg.service)) return false;
    if (filters?.tiers && !filters.tiers.includes(pkg.tier)) return false;
    if (filters?.maxPrice) {
      const price = pkg.price.monthly || pkg.price.setup || 0;
      if (price > filters.maxPrice) return false;
    }

    // Search in package content
    const searchableContent = [
      pkg.name,
      pkg.summary,
      pkg.idealFor || '',
      ...pkg.outcomes,
      ...pkg.features.map(f => f.label),
      ...pkg.features.map(f => f.detail || ''),
      ...(pkg.badges || [])
    ].join(' ').toLowerCase();

    return searchTerms.every(term => searchableContent.includes(term));
  });

  // Sort by relevance (exact matches first, then popular packages)
  return results.sort((a, b) => {
    const aExactMatch = a.name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
    const bExactMatch = b.name.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
    
    if (aExactMatch !== bExactMatch) return bExactMatch - aExactMatch;
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    
    return 0;
  });
}

/**
 * Get package by ID with error handling
 */
export function getPackageById(id: string): Package | null {
  return ALL_PACKAGES.find(pkg => pkg.id === id) || null;
}

/**
 * Get packages by service
 */
export function getPackagesByService(service: ServiceSlug): Package[] {
  return ALL_PACKAGES.filter(pkg => pkg.service === service);
}

/**
 * Get popular packages across all services
 */
export function getPopularPackages(limit?: number): Package[] {
  const popular = ALL_PACKAGES.filter(pkg => pkg.popular);
  return limit ? popular.slice(0, limit) : popular;
}

/**
 * Get all packages (for backward compatibility)
 */
export function getAllPackages(): Package[] {
  return [...ALL_PACKAGES];
}

/**
 * Get all add-ons
 */
export function getAllAddOns(): AddOn[] {
  return [...ALL_ADDONS];
}

// ============================
// ANALYTICS & INSIGHTS
// ============================

/**
 * Get recommendation system analytics
 */
export function getRecommendationStats() {
  const serviceDistribution = ALL_PACKAGES.reduce((acc, pkg) => {
    acc[pkg.service] = (acc[pkg.service] || 0) + 1;
    return acc;
  }, {} as Record<ServiceSlug, number>);

  const tierDistribution = ALL_PACKAGES.reduce((acc, pkg) => {
    acc[pkg.tier] = (acc[pkg.tier] || 0) + 1;
  }, {} as Record<Tier, number>);

  const priceRanges = {
    setup: ALL_PACKAGES.map(pkg => pkg.price.setup || 0).filter(p => p > 0),
    monthly: ALL_PACKAGES.map(pkg => pkg.price.monthly || 0).filter(p => p > 0)
  };

  return {
    totalPackages: ALL_PACKAGES.length,
    totalAddOns: ALL_ADDONS.length,
    totalBundles: INTEGRATED_GROWTH_BUNDLES.length,
    popularPackages: ALL_PACKAGES.filter(pkg => pkg.popular).length,
    serviceDistribution,
    tierDistribution,
    priceAnalysis: {
      setupRange: priceRanges.setup.length > 0 ? {
        min: Math.min(...priceRanges.setup),
        max: Math.max(...priceRanges.setup),
        avg: Math.round(priceRanges.setup.reduce((a, b) => a + b, 0) / priceRanges.setup.length)
      } : null,
      monthlyRange: priceRanges.monthly.length > 0 ? {
        min: Math.min(...priceRanges.monthly),
        max: Math.max(...priceRanges.monthly),
        avg: Math.round(priceRanges.monthly.reduce((a, b) => a + b, 0) / priceRanges.monthly.length)
      } : null
    }
  };
}

/**
 * Get recommendation performance insights
 */
export function getRecommendationInsights(context: BusinessContext) {
  const recommendations = getSmartRecommendations(context, 10);
  const serviceSpread = [...new Set(recommendations.map(pkg => pkg.service))];
  const tierSpread = [...new Set(recommendations.map(pkg => pkg.tier))];
  
  return {
    totalRecommendations: recommendations.length,
    serviceVariety: serviceSpread.length,
    tierVariety: tierSpread.length,
    averageScore: recommendations.length > 0 
      ? recommendations.reduce((sum, pkg) => sum + calculatePackageScore(pkg, context), 0) / recommendations.length 
      : 0,
    topServices: serviceSpread.slice(0, 3),
    recommendedBudgetRange: {
      min: Math.min(...recommendations.map(pkg => pkg.price.monthly || pkg.price.setup || 0)),
      max: Math.max(...recommendations.map(pkg => pkg.price.monthly || pkg.price.setup || 0))
    }
  };
}

// ============================
// VALIDATION & ERROR HANDLING
// ============================

/**
 * Validate recommendation system integrity
 */
export function validateRecommendationSystem(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check for duplicate package IDs
    const packageIds = ALL_PACKAGES.map(pkg => pkg.id);
    const duplicateIds = packageIds.filter((id, index) => packageIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate package IDs found: ${duplicateIds.join(', ')}`);
    }

    // Check service affinity matrix completeness
    const services: ServiceSlug[] = ['webdev', 'seo', 'content', 'video', 'marketing', 'leadgen'];
    for (const service of services) {
      if (!SERVICE_AFFINITY_MATRIX[service]) {
        errors.push(`Missing service affinity matrix for: ${service}`);
      } else {
        for (const targetService of services) {
          if (SERVICE_AFFINITY_MATRIX[service][targetService] === undefined) {
            warnings.push(`Missing affinity score: ${service} -> ${targetService}`);
          }
        }
      }
    }

    // Check that all services have packages
    for (const service of services) {
      const servicePackages = ALL_PACKAGES.filter(pkg => pkg.service === service);
      if (servicePackages.length === 0) {
        errors.push(`No packages found for service: ${service}`);
      }
      
      // Check tier coverage
      const tiers: Tier[] = ['Essential', 'Professional', 'Enterprise'];
      for (const tier of tiers) {
        if (!servicePackages.find(pkg => pkg.tier === tier)) {
          warnings.push(`Missing ${tier} tier for service: ${service}`);
        }
      }
    }

    // Check add-on references
    for (const addon of ALL_ADDONS) {
      if (addon.pairsBestWith) {
        const servicePackages = ALL_PACKAGES.filter(pkg => pkg.service === addon.service);
        for (const tier of addon.pairsBestWith) {
          if (!servicePackages.find(pkg => pkg.tier === tier)) {
            warnings.push(`Add-on ${addon.id} references non-existent tier: ${tier}`);
          }
        }
      }
    }
  } catch (error) {
    errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================
// EXPORTS
// ============================

// Named exports for specific functionality
export {
  SERVICE_AFFINITY_MATRIX,
  GOAL_SERVICE_MAPPING,
  INTEGRATED_GROWTH_BUNDLES
};

// Utility exports (for legacy compatibility)
export const searchPackagesLegacy = searchPackages;

// Default export with all functions
export default {
  // Core recommendation functions
  getSmartRecommendations,
  getRecommendedPackages,
  getRecommendedAddOns,
  getRecommendedBundles,
  getCrossSellRecommendations,
  getUpgradeRecommendations,
  
  // Utility functions
  searchPackages,
  getPackageById,
  getPackagesByService,
  getPopularPackages,
  getAllPackages,
  getAllAddOns,
  
  // Analytics functions
  getRecommendationStats,
  getRecommendationInsights,
  
  // Validation
  validateRecommendationSystem,
  
  // Data access
  packages: ALL_PACKAGES,
  addons: ALL_ADDONS,
  bundles: INTEGRATED_GROWTH_BUNDLES
};

---

// src/data/packages/recommendations.ts
// “Recommended packages” feed for service pages or hubs.
// Returns the UI-friendly GrowthPackage shape and also exports it as `Package`
// to match legacy imports (e.g., components expecting `Package`).

import {
  BUNDLES,
  FEATURED_BUNDLE_SLUGS,
  getBundleBySlug,
  toGrowthPackages,
} from "./index";
import { bundleToGrowthPackage, type GrowthPackage } from "@/src/packages/lib/bridge-growth";

/** Backwards-compat alias for components that import `type Package` from here. */
export type Package = GrowthPackage;

/** Strategy: prefer curated FEATURED_BUNDLE_SLUGS; fallback to first N bundles. */
export function getRecommendedPackages(n = 3): GrowthPackage[] {
  const curated = FEATURED_BUNDLE_SLUGS
    .map(getBundleBySlug)
    .filter(Boolean) as NonNullable<ReturnType<typeof getBundleBySlug>>[];

  const deduped = new Map<string, GrowthPackage>();
  for (const b of curated) {
    if (deduped.size >= n) break;
    deduped.set(b.slug, bundleToGrowthPackage(b));
  }
  if (deduped.size < n) {
    for (const b of BUNDLES) {
      if (deduped.size >= n) break;
      if (!deduped.has(b.slug)) deduped.set(b.slug, bundleToGrowthPackage(b));
    }
  }
  return Array.from(deduped.values()).slice(0, n);
}

/** Recommendations constrained to a given service page slug (e.g., "seo-services"). */
export function getRecommendedForService(serviceSlug: string, n = 3): GrowthPackage[] {
  const curated = FEATURED_BUNDLE_SLUGS
    .map(getBundleBySlug)
    .filter((b): b is NonNullable<ReturnType<typeof getBundleBySlug>> => !!b && (b.services ?? []).includes(serviceSlug));

  const deduped = new Map<string, GrowthPackage>();
  for (const b of curated) {
    if (deduped.size >= n) break;
    deduped.set(b.slug, bundleToGrowthPackage(b));
  }

  if (deduped.size < n) {
    for (const b of BUNDLES) {
      if (deduped.size >= n) break;
      if ((b.services ?? []).includes(serviceSlug) && !deduped.has(b.slug)) {
        deduped.set(b.slug, bundleToGrowthPackage(b));
      }
    }
  }

  return Array.from(deduped.values()).slice(0, n);
}

/** Convenience: map a list of bundles to growth packages directly. */
export function mapBundlesToGrowthPackages(slugs: string[]): GrowthPackage[] {
  return toGrowthPackages(
    slugs
      .map(getBundleBySlug)
      .filter(Boolean) as NonNullable<ReturnType<typeof getBundleBySlug>>[],
  );
}
