// ===================================================================
// /src/search/core/sources.packages.ts
// ===================================================================
// Growth packages to SearchDoc adapter

import { CONTENT_WEIGHTS } from '../config/search.config';
import type { SearchDoc } from './types';

// Import your existing packages data
// Adjust this import path to match your actual file structure
const packagesData = await import('@/data/packages').then(m => m.bundles || m.packages || m.default);

/**
 * Convert growth packages to search documents
 */
export function packagesToDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  try {
    for (const pkg of packagesData || []) {
      docs.push({
        id: `package:${pkg.slug}`,
        type: "package",
        title: pkg.name || pkg.title,
        summary: pkg.description || pkg.tagline || '',
        path: `/packages/${pkg.slug}`,
        serviceKey: getPrimaryServiceKey(pkg),
        category: pkg.category || 'growth',
        tags: [
          ...(pkg.useCases || []),
          ...(pkg.services || []),
          ...(pkg.features || []).slice(0, 3), // First 3 features as tags
          ...(pkg.tags || [])
        ],
        date: pkg.updatedDate || pkg.createdDate,
        weight: CONTENT_WEIGHTS.package,
        featured: pkg.popular || pkg.featured || false,
        meta: {
          setupPrice: pkg.setupPrice,
          monthlyPrice: pkg.monthlyPrice,
          features: pkg.features || [],
          services: pkg.services || [],
          useCases: pkg.useCases || [],
          badge: pkg.badge,
          priority: pkg.priority || 0
        }
      });
    }
  } catch (error) {
    console.warn('Error processing packages data:', error);
  }

  return docs;
}

/**
 * Get primary service key for a package
 */
function getPrimaryServiceKey(pkg: any): string {
  // Use the first service if multiple services
  if (pkg.services && pkg.services.length > 0) {
    return mapPackageServiceKey(pkg.services[0]);
  }

  // Fallback to category mapping
  if (pkg.category) {
    return mapPackageServiceKey(pkg.category);
  }

  return 'marketing'; // Default fallback
}

/**
 * Map package service to standardized service key
 */
function mapPackageServiceKey(service: string): string {
  const mapping: Record<string, string> = {
    'web-development': 'web',
    'website': 'web',
    'video-production': 'video',
    'video': 'video',
    'seo-services': 'seo',
    'seo': 'seo',
    'marketing-automation': 'marketing',
    'marketing': 'marketing',
    'content-production': 'content',
    'content': 'content',
    'lead-generation': 'leadgen',
    'leadgen': 'leadgen'
  };

  return mapping[service.toLowerCase()] || 'marketing';
}

/**
 * Get packages by service key
 */
export function getPackagesByService(serviceKey: string): SearchDoc[] {
  return packagesToDocs().filter(doc => doc.serviceKey === serviceKey);
}

/**
 * Get featured packages
 */
export function getFeaturedPackages(): SearchDoc[] {
  return packagesToDocs().filter(doc => doc.featured);
}

/**
 * Get packages by price range
 */
export function getPackagesByPriceRange(
  minSetup?: number, 
  maxSetup?: number,
  minMonthly?: number,
  maxMonthly?: number
): SearchDoc[] {
  return packagesToDocs().filter(doc => {
    const setupPrice = doc.meta?.setupPrice || 0;
    const monthlyPrice = doc.meta?.monthlyPrice || 0;

    if (minSetup !== undefined && setupPrice < minSetup) return false;
    if (maxSetup !== undefined && setupPrice > maxSetup) return false;
    if (minMonthly !== undefined && monthlyPrice < minMonthly) return false;
    if (maxMonthly !== undefined && monthlyPrice > maxMonthly) return false;

    return true;
  });
}