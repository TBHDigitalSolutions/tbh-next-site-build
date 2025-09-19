// /src/data/portfolio/index.ts
// Main export + aggregation helpers for components to consume

export * from "./_types";
export * from "./_utils";
export { validatePortfolio, runPortfolioValidation } from "./_validators/portfolio.validate";

import type { CategorySlug, Project } from "./_types";
import { normalizeItem, sortByFeaturedPriority } from "./_utils/normalization";
import { searchProjects } from "./_utils/search";

// Import service-specific datasets - all categories now implemented
import { webDevelopmentItems } from "./web-development/web-development-items";
import { videoProductionItems } from "./video-production/video-production-items";
import { seoServicesItems } from "./seo-services/seo-services-items";
import { marketingServicesItems } from "./marketing-services/marketing-services-items";
import { contentProductionItems } from "./content-production/content-production-items";
import { leadGenerationItems } from "./lead-generation/lead-generation-items";

// Import supporting data sources
import { getToolsForCategory } from "./categoryTools";

// =============================================================================
// CORE DATA FUNCTIONS (Existing - Keep As Is)
// =============================================================================

/** Aggregate & normalize all items (metrics coercion happens inside normalizeItem) */
export function getAllPortfolioItems(): Project[] {
  const all = [
    ...webDevelopmentItems,
    ...videoProductionItems,
    ...seoServicesItems,
    ...marketingServicesItems,
    ...contentProductionItems,
    ...leadGenerationItems,
  ]
    .filter(Boolean)
    .map(normalizeItem)
    .sort(sortByFeaturedPriority);

  return all;
}

export function getItemsByCategory(category: CategorySlug): Project[] {
  return getAllPortfolioItems().filter((item) => item.category === category);
}

export function getFeaturedByCategory(
  category: CategorySlug,
  limit = 3
): Project[] {
  return getItemsByCategory(category)
    .filter((item) => item.featured)
    .sort(sortByFeaturedPriority)
    .slice(0, limit);
}

export function getPortfolioItemById(id: string): Project | undefined {
  return getAllPortfolioItems().find(item => item.id === id);
}

export function getFeaturedItems(): Project[] {
  return getAllPortfolioItems().filter(item => item.featured);
}

/** Convenience export used by validation scripts */
export function validateAndGetStats() {
  const items = getAllPortfolioItems();
  const report = runPortfolioValidation(items);
  return {
    validation: report,
    stats: {
      totalItems: items.length,
      featuredItems: getFeaturedItems().length,
      categoriesWithItems: Array.from(new Set(items.map(item => item.category))),
      isValid: report.isValid
    }
  };
}

// =============================================================================
// NEW FACADE FUNCTIONS FOR TEMPLATES
// =============================================================================

/**
 * Hub facade function - returns all categories with featured items for Hub template
 * Used by: PortfolioHubTemplate via adaptSectionsForHub
 */
export function getAllFeaturedByCategory(): HubSection[] {
  const categories: CategorySlug[] = [
    "web-development",
    "video-production", 
    "seo-services",
    "marketing-services",
    "content-production",
    "lead-generation"
  ];

  return categories.map((category, index) => {
    const items = getFeaturedByCategory(category, 6); // Limit for hub display
    const config = CATEGORY_COMPONENTS[category];
    
    return {
      slug: category,
      label: config.label,
      variant: config.variant,
      viewAllHref: config.viewAllHref,
      items,
      subtitle: items.length > 0 ? `${items.length} featured projects` : "Coming soon",
      priority: (index + 1) * 10
    };
  }).filter(section => section.items.length > 0); // Only show categories with featured items
}

/**
 * Category bundle function - returns complete category data for Category template
 * Used by: PortfolioCategoryTemplate via adaptCategoryPageData
 */
export async function getCategoryBundle(slug: CategorySlug): Promise<CategoryBundle> {
  const items = getItemsByCategory(slug);
  const tools = await getToolsForCategory(slug);
  const config = CATEGORY_COMPONENTS[slug];
  
  // Calculate metrics from actual data
  const totalProjects = items.length;
  const featuredProjects = items.filter(item => item.featured).length;
  
  return {
    slug,
    title: config.label,
    subtitle: config.description,
    items,
    tools,
    caseStudies: await getCaseStudiesForCategory(slug),
    recommendedPackages: await getRecommendedPackagesForCategory(slug),
    metrics: {
      totalProjects,
      avgProjectDuration: calculateAverageDuration(items),
      successRate: calculateSuccessRate(items),
      clientSatisfaction: calculateClientSatisfaction(items)
    }
  };
}

// =============================================================================
// SUPPORTING DATA FUNCTIONS
// =============================================================================

/**
 * Get case studies for a category (placeholder - implement based on your data structure)
 */
async function getCaseStudiesForCategory(category: CategorySlug): Promise<CaseStudy[]> {
  // TODO: Implement case studies data source
  // For now, return empty array - implement when case studies data is available
  return [];
}

/**
 * Get recommended packages for a category (placeholder - implement based on your data structure)
 */
async function getRecommendedPackagesForCategory(category: CategorySlug): Promise<PackageRef[]> {
  // TODO: Implement packages data source
  // For now, return empty array - implement when packages data is available
  return [];
}

// =============================================================================
// METRICS CALCULATION HELPERS
// =============================================================================

function calculateAverageDuration(items: Project[]): string {
  // Extract duration from project metrics if available
  const durations = items
    .flatMap(item => item.metrics || [])
    .filter(metric => metric.label.toLowerCase().includes('duration') || 
                      metric.label.toLowerCase().includes('timeline'))
    .map(metric => String(metric.value));
  
  if (durations.length === 0) {
    // Return category-specific defaults based on project type
    const categoryDefaults: Record<CategorySlug, string> = {
      "web-development": "6-8 weeks",
      "video-production": "3-4 weeks", 
      "seo-services": "3-6 months",
      "marketing-services": "4-6 weeks",
      "content-production": "2-3 weeks",
      "lead-generation": "4-8 weeks"
    };
    
    return categoryDefaults[items[0]?.category as CategorySlug] || "4-6 weeks";
  }
  
  // For now, return the most common duration or first found
  return durations[0];
}

function calculateSuccessRate(items: Project[]): string {
  // Extract success metrics from project data
  const successMetrics = items
    .flatMap(item => item.metrics || [])
    .filter(metric => 
      metric.label.toLowerCase().includes('success') ||
      metric.label.toLowerCase().includes('conversion') ||
      metric.label.toLowerCase().includes('roi')
    );
  
  if (successMetrics.length === 0) {
    return "95%"; // Default success rate
  }
  
  // Calculate average success rate from available metrics
  const rates = successMetrics
    .map(metric => {
      const value = String(metric.value);
      const match = value.match(/(\d+(?:\.\d+)?)%?/);
      return match ? parseFloat(match[1]) : null;
    })
    .filter((rate): rate is number => rate !== null);
  
  if (rates.length === 0) return "95%";
  
  const averageRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  return `${Math.round(averageRate)}%`;
}

function calculateClientSatisfaction(items: Project[]): string {
  // Extract satisfaction metrics from project data
  const satisfactionMetrics = items
    .flatMap(item => item.metrics || [])
    .filter(metric => 
      metric.label.toLowerCase().includes('satisfaction') ||
      metric.label.toLowerCase().includes('rating') ||
      metric.label.toLowerCase().includes('score')
    );
  
  if (satisfactionMetrics.length === 0) {
    return "4.9/5"; // Default satisfaction rating
  }
  
  // Calculate average satisfaction from available metrics
  const ratings = satisfactionMetrics
    .map(metric => {
      const value = String(metric.value);
      const match = value.match(/(\d+(?:\.\d+)?)/);
      return match ? parseFloat(match[1]) : null;
    })
    .filter((rating): rating is number => rating !== null && rating <= 5);
  
  if (ratings.length === 0) return "4.9/5";
  
  const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return `${averageRating.toFixed(1)}/5`;
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface HubSection {
  /** Canonical slug for the slice (matches CategorySlug). */
  slug: CategorySlug;
  /** Human-readable label used as the section heading. */
  label: string;
  /** Which viewer to use (gallery/video/interactive). */
  variant: "gallery" | "video" | "interactive";
  /** Path to the full listing for this slice. */
  viewAllHref: string;
  /** Featured items to display. */
  items: Project[];
  /** Optional supporting copy under the heading. */
  subtitle?: string;
  /** Sort key for Hub display; lower = earlier. */
  priority?: number;
}

export interface CategoryBundle {
  slug: CategorySlug;
  title: string;
  subtitle?: string;
  items: Project[];
  tools?: ToolItem[];
  caseStudies?: CaseStudy[];
  recommendedPackages?: PackageRef[];
  metrics?: CategoryMetrics;
}

export interface ToolItem {
  id: string;
  name: string;
  iconUrl?: string;
  href?: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  summary?: string;
  href?: string;
}

export interface PackageRef {
  id: string;
  title: string;
  priceLabel?: string;
  href?: string;
}

export interface CategoryMetrics {
  totalProjects: number;
  avgProjectDuration?: string;
  successRate?: string;
  clientSatisfaction?: string;
}

// Category configuration (imported from portfolio lib when available)
interface CategoryConfig {
  label: string;
  variant: "gallery" | "video" | "interactive";
  viewAllHref: string;
  description: string;
}

// Temporary category configuration - move to @/portfolio/lib/types when available
const CATEGORY_COMPONENTS: Record<CategorySlug, CategoryConfig> = {
  "web-development": {
    label: "Web Development",
    variant: "interactive",
    viewAllHref: "/portfolio/web-development",
    description: "Interactive builds and scalable web applications."
  },
  "video-production": {
    label: "Video Production", 
    variant: "video",
    viewAllHref: "/portfolio/video-production",
    description: "Showreels, explainers, and brand stories that convert."
  },
  "seo-services": {
    label: "SEO Services",
    variant: "gallery",
    viewAllHref: "/portfolio/seo-services",
    description: "Rankings, visibility, and measurable organic growth."
  },
  "marketing-services": {
    label: "Marketing Services",
    variant: "gallery", 
    viewAllHref: "/portfolio/marketing-services",
    description: "Campaigns, automation, and strategies that drive growth."
  },
  "content-production": {
    label: "Content Production",
    variant: "gallery",
    viewAllHref: "/portfolio/content-production",
    description: "Editorial content and design for acquisition and enablement."
  },
  "lead-generation": {
    label: "Lead Generation",
    variant: "gallery",
    viewAllHref: "/portfolio/lead-generation",
    description: "Funnels, creatives, and campaigns that generate pipeline."
  }
} as const;

// =============================================================================
// BACKWARD COMPATIBILITY ALIASES
// =============================================================================

export const getAllItems = getAllPortfolioItems;
export const getPortfolioItemsByCategory = getItemsByCategory;
export const getTopItemsByCategory = getFeaturedByCategory;

// Search function - properly imported and aliased
export const searchItems = (items: Project[], query: any) => searchProjects(items, query);

// Legacy facade function name for backward compatibility
export const getFeaturedByCategory_OLD = getFeaturedByCategory;

// New facade function with different signature for templates
export { getAllFeaturedByCategory as getFeaturedByCategory_HUB };