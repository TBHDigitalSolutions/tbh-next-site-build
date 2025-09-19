// /src/data/packages/integrated-growth-packages.ts
// Master export and composition of all cross-service bundles

import type { PackageBundle } from "./_types/packages.types";

// Import individual bundles
import DigitalTransformationStarter from "./bundles/digital-transformation-starter";
import EcommerceAccelerator from "./bundles/ecommerce-accelerator";  
import EventLaunchDomination from "./bundles/event-launch-domination";
import LocalBusinessGrowth from "./bundles/local-business-growth";
import ThoughtLeadershipAuthority from "./bundles/thought-leadership-authority";

// ============================
// MASTER BUNDLE COLLECTION
// ============================

export const INTEGRATED_GROWTH_BUNDLES: readonly PackageBundle[] = [
  LocalBusinessGrowth,           // Most accessible, local focus
  DigitalTransformationStarter,  // Comprehensive digital overhaul  
  EcommerceAccelerator,         // E-commerce specific
  ThoughtLeadershipAuthority,   // B2B authority building
  EventLaunchDomination,        // Event/launch specific
] as const;

// ============================
// BUNDLE CATEGORIES
// ============================

export const BUNDLE_CATEGORIES = {
  local: [LocalBusinessGrowth],
  startup: [DigitalTransformationStarter],
  ecommerce: [EcommerceAccelerator], 
  b2b: [ThoughtLeadershipAuthority],
  custom: [EventLaunchDomination]
} as const;

// ============================
// UTILITY FUNCTIONS
// ============================

/**
 * Get bundle by slug for routing
 */
export function getBundleBySlug(slug: string): PackageBundle | undefined {
  return INTEGRATED_GROWTH_BUNDLES.find(bundle => bundle.slug === slug);
}

/**
 * Get bundles by category
 */
export function getBundlesByCategory(category: string): PackageBundle[] {
  return INTEGRATED_GROWTH_BUNDLES.filter(bundle => bundle.category === category);
}

/**
 * Get featured/popular bundles (Local and Startup are featured by default)
 */
export function getFeaturedBundles(): PackageBundle[] {
  return INTEGRATED_GROWTH_BUNDLES.filter(bundle => 
    bundle.category === "local" || 
    bundle.category === "startup" ||
    bundle.category === "ecommerce"
  );
}

/**
 * Search bundles by query
 */
export function searchBundles(query: string): PackageBundle[] {
  const q = query.toLowerCase().trim();
  if (!q) return [...INTEGRATED_GROWTH_BUNDLES];
  
  return INTEGRATED_GROWTH_BUNDLES.filter(bundle => {
    const searchableText = [
      bundle.title,
      bundle.subtitle, 
      bundle.summary,
      ...bundle.includedServices,
      ...bundle.tags
    ].join(' ').toLowerCase();
    
    return searchableText.includes(q);
  });
}

/**
 * Get bundle statistics for analytics
 */
export function getBundleStats() {
  const categories = new Set(INTEGRATED_GROWTH_BUNDLES.map(b => b.category));
  const totalServices = new Set(
    INTEGRATED_GROWTH_BUNDLES.flatMap(b => 
      b.includedServices.map(s => s.split(':')[0].trim())
    )
  );
  
  return {
    totalBundles: INTEGRATED_GROWTH_BUNDLES.length,
    categories: categories.size,
    servicesIntegrated: totalServices.size,
    featuredCount: getFeaturedBundles().length
  };
}

/**
 * Get bundles by pricing range
 */
export function getBundlesByPriceRange(minSetup?: number, maxSetup?: number): PackageBundle[] {
  return INTEGRATED_GROWTH_BUNDLES.filter(bundle => {
    const setupTier = bundle.pricing.tiers.find(tier => tier.id === "setup");
    if (!setupTier) return false;
    
    const price = parseInt(setupTier.price.replace(/[$,]/g, ''));
    
    if (minSetup && price < minSetup) return false;
    if (maxSetup && price > maxSetup) return false;
    
    return true;
  });
}

// ============================
// BUNDLE ORDERING BY PRIORITY
// ============================

/**
 * Get bundles ordered by recommended priority
 * Local -> Startup -> E-commerce -> B2B -> Custom
 */
export function getBundlesByPriority(): PackageBundle[] {
  const priorityOrder = ['local', 'startup', 'ecommerce', 'b2b', 'custom'];
  
  return INTEGRATED_GROWTH_BUNDLES.slice().sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.category);
    const bIndex = priorityOrder.indexOf(b.category);
    return aIndex - bIndex;
  });
}

/**
 * Get recommended bundles for a specific business type
 */
export function getRecommendedBundles(businessType: string): PackageBundle[] {
  const recommendations: Record<string, string[]> = {
    'local-business': ['local-business-growth'],
    'ecommerce': ['ecommerce-accelerator', 'digital-transformation-starter'],
    'b2b-services': ['thought-leadership-authority', 'digital-transformation-starter'],
    'startup': ['digital-transformation-starter', 'local-business-growth'],
    'agency': ['thought-leadership-authority', 'event-launch-domination'],
    'enterprise': ['digital-transformation-starter', 'thought-leadership-authority']
  };

  const slugs = recommendations[businessType] || [];
  return slugs.map(slug => getBundleBySlug(slug)).filter(Boolean) as PackageBundle[];
}

/**
 * Get bundle pricing summary for comparison
 */
export function getBundlePricingSummary() {
  return INTEGRATED_GROWTH_BUNDLES.map(bundle => {
    const setupTier = bundle.pricing.tiers.find(tier => tier.id === "setup");
    const retainerTier = bundle.pricing.tiers.find(tier => tier.id === "retainer");
    
    return {
      slug: bundle.slug,
      title: bundle.title,
      category: bundle.category,
      setupPrice: setupTier?.price || "Contact for pricing",
      monthlyPrice: retainerTier?.price || "N/A",
      setupPriceNumeric: setupTier ? parseInt(setupTier.price.replace(/[$,]/g, '')) : 0,
      monthlyPriceNumeric: retainerTier ? parseInt(retainerTier.price.replace(/[$,]/g, '')) : 0
    };
  }).sort((a, b) => a.setupPriceNumeric - b.setupPriceNumeric);
}

// ============================
// EXPORTS
// ============================

// Individual bundle exports
export {
  DigitalTransformationStarter,
  EcommerceAccelerator,
  EventLaunchDomination, 
  LocalBusinessGrowth,
  ThoughtLeadershipAuthority
};

// Default export for convenience
export default INTEGRATED_GROWTH_BUNDLES;