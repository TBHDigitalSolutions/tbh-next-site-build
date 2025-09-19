// ===================================================================
// /src/search/core/sources.portfolio.ts
// ===================================================================
// Portfolio items to SearchDoc adapter

import { CONTENT_WEIGHTS } from '../config/search.config';
import type { SearchDoc } from './types';

// Import your existing portfolio data
// Adjust this import path to match your actual file structure
const portfolioData = await import('@/data/portfolio').then(m => m.default || m.portfolioItems);

/**
 * Convert portfolio items to search documents
 */
export function portfolioToDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  try {
    for (const item of portfolioData || []) {
      docs.push({
        id: `portfolio:${item.id}`,
        type: "portfolio",
        title: item.title,
        summary: item.description || item.summary || '',
        path: item.service ? `/portfolio/${item.service}` : `/portfolio`,
        serviceKey: mapPortfolioServiceKey(item.service),
        category: item.category,
        tags: [...(item.tags || []), ...(item.technologies || [])],
        date: item.date || item.publishDate,
        weight: CONTENT_WEIGHTS.portfolio,
        featured: item.featured || false,
        meta: {
          client: item.client,
          mediaType: item.mediaType || 'image',
          technologies: item.technologies || [],
          industry: item.industry,
          projectType: item.projectType,
          results: item.results || {}
        }
      });
    }
  } catch (error) {
    console.warn('Error processing portfolio data:', error);
  }

  return docs;
}

/**
 * Map portfolio service to standardized service key
 */
function mapPortfolioServiceKey(service?: string): string {
  if (!service) return 'web'; // Default fallback

  const mapping: Record<string, string> = {
    'web-development': 'web',
    'video-production': 'video',
    'seo-services': 'seo',
    'marketing-automation': 'marketing',
    'content-production': 'content',
    'lead-generation': 'leadgen'
  };

  return mapping[service] || service;
}

/**
 * Get portfolio items by category
 */
export function getPortfolioByCategory(category: string): SearchDoc[] {
  return portfolioToDocs().filter(doc => doc.category === category);
}

/**
 * Get featured portfolio items
 */
export function getFeaturedPortfolio(): SearchDoc[] {
  return portfolioToDocs().filter(doc => doc.featured);
}

/**
 * Get portfolio items by service key
 */
export function getPortfolioByService(serviceKey: string): SearchDoc[] {
  return portfolioToDocs().filter(doc => doc.serviceKey === serviceKey);
}