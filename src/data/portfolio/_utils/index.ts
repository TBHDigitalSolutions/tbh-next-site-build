// /src/data/portfolio/_utils/index.ts
// Portfolio utility functions for search, filtering, and data manipulation

import type { Project, CategorySlug } from '../_types';

// Search functionality
export const searchPortfolioItems = (items: Project[], query: string): Project[] => {
  const q = query.toLowerCase().trim();
  if (!q) return items;
  
  return items.filter((item) => {
    const searchableText = [
      item.title,
      item.description ?? "",
      item.client ?? "",
      ...(item.tags ?? [])
    ].join(" ").toLowerCase();
    
    return searchableText.includes(q);
  });
};

// Tag filtering
export const filterItemsByTags = (items: Project[], tags: string[]): Project[] => {
  if (!tags.length) return items;
  return items.filter((item) => 
    tags.some((tag) => item.tags?.includes(tag))
  );
};

// Get available tags from items
export const getAvailableTags = (items: Project[]): string[] => {
  const allTags = items.flatMap((item) => item.tags ?? []);
  return Array.from(new Set(allTags)).sort();
};

// Category-specific utilities
export const getItemsByCategory = (items: Project[], category: CategorySlug): Project[] => {
  return items.filter(item => item.category === category);
};

export const getFeaturedItems = (items: Project[]): Project[] => {
  return items.filter(item => item.featured);
};

export const getFeaturedByCategory = (items: Project[], category: CategorySlug, limit?: number): Project[] => {
  const categoryItems = items
    .filter(item => item.category === category && item.featured)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
    
  return limit ? categoryItems.slice(0, limit) : categoryItems;
};

// Data normalization
export const normalizeMetrics = (
  metrics: Project["metrics"] | undefined | null
): Record<string, string | number> | undefined => {
  if (!metrics || !Array.isArray(metrics)) return undefined;
  
  const normalized: Record<string, string | number> = {};
  metrics.forEach(metric => {
    if (metric.label && metric.value) {
      normalized[metric.label] = metric.value;
    }
  });
  
  return Object.keys(normalized).length ? normalized : undefined;
};

// Asset validation
export const checkAssets = (items: Project[]): string[] => {
  const issues: string[] = [];
  
  items.forEach(item => {
    if (!item.media.thumbnail) {
      issues.push(`${item.id}: missing thumbnail`);
    }
    
    if (item.media.type === 'video' && !item.media.poster) {
      issues.push(`${item.id}: video missing poster`);
    }
    
    if (!item.media.src) {
      issues.push(`${item.id}: missing media src`);
    }
  });
  
  return issues;
};

// Statistics and analytics
export const getCategoryStats = (items: Project[], category: CategorySlug) => {
  const categoryItems = getItemsByCategory(items, category);
  const featured = getFeaturedItems(categoryItems);
  const tags = getAvailableTags(categoryItems);
  
  return {
    total: categoryItems.length,
    featured: featured.length,
    tags: tags.length,
    mediaTypes: Array.from(new Set(categoryItems.map(item => item.media.type))),
  };
};

export const getGlobalStats = (items: Project[]) => {
  const byCategory = {} as Record<CategorySlug, number>;
  
  // Count items per category
  items.forEach(item => {
    byCategory[item.category] = (byCategory[item.category] || 0) + 1;
  });
  
  return {
    total: items.length,
    featured: getFeaturedItems(items).length,
    categories: byCategory,
    tags: getAvailableTags(items).length,
    integrity: {
      missingAssets: checkAssets(items),
    },
  };
};

// Development helpers
export const getPortfolioStats = (items: Project[]) => {
  const stats = getGlobalStats(items);
  
  if (process.env.NODE_ENV === 'development') {
    console.log("[portfolio] Portfolio Statistics:", {
      totalItems: stats.total,
      featuredItems: stats.featured,
      categoriesWithItems: Object.entries(stats.categories).filter(([, count]) => count > 0),
      totalTags: stats.tags,
      missingAssets: stats.integrity.missingAssets.length,
    });
  }
  
  return stats;
};

// Sanitization for video components
export const sanitizeVideoItems = (items: Project[]): Project[] => {
  return items.map((item) => {
    const safeMetrics = normalizeMetrics(item.metrics);
    return safeMetrics ? { ...item, metrics: safeMetrics } : item;
  });
};