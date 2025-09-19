// ===================================================================
// /src/search/core/sources.services.ts
// ===================================================================
// Services taxonomy to SearchDoc adapter

import { CONTENT_WEIGHTS } from '../config/search.config';
import type { SearchDoc } from './types';

// Import your existing services taxonomy
// Adjust this import path to match your actual file structure
const servicesTaxonomy = await import('@/data/taxonomy/servicesTaxonomy').then(m => m.default);

/**
 * Convert services taxonomy to search documents
 */
export function servicesToDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  try {
    for (const hub of servicesTaxonomy) {
      // L1: Hub level (e.g., "Video Production", "Web Development")
      docs.push({
        id: `hub:${hub.slug}`,
        type: "hub",
        title: hub.title || hub.name || hub.slug,
        summary: hub.description || hub.summary || '',
        path: `/services/${hub.slug}`,
        serviceKey: mapHubToServiceKey(hub.slug),
        hub: hub.slug,
        tags: [...(hub.tags || []), ...(hub.keywords || [])],
        weight: CONTENT_WEIGHTS.hub,
        featured: hub.featured || false,
        meta: {
          keywords: hub.keywords || [],
          excerpt: hub.excerpt || '',
          totalServices: hub.services?.length || 0
        }
      });

      // L2: Service level (e.g., "Applications", "Ecommerce", "Website")
      for (const service of hub.services || []) {
        docs.push({
          id: `service:${hub.slug}/${service.slug}`,
          type: "service",
          title: service.title || service.name || service.slug,
          summary: service.description || service.summary || '',
          path: `/services/${hub.slug}/${service.slug}`,
          serviceKey: mapHubToServiceKey(hub.slug),
          hub: hub.slug,
          category: service.slug,
          tags: [...(service.tags || []), ...(service.keywords || [])],
          weight: CONTENT_WEIGHTS.service,
          featured: service.featured || false,
          meta: {
            keywords: service.keywords || [],
            excerpt: service.excerpt || '',
            totalSubservices: service.subservices?.length || 0,
            parentHub: hub.title || hub.name
          }
        });

        // L3: Subservice level (e.g., "API", "Auth", "Dashboards")
        for (const subservice of service.subservices || []) {
          docs.push({
            id: `subservice:${hub.slug}/${service.slug}/${subservice.slug}`,
            type: "subservice",
            title: subservice.title || subservice.name || subservice.slug,
            summary: subservice.description || subservice.summary || '',
            path: `/services/${hub.slug}/${service.slug}/${subservice.slug}`,
            serviceKey: mapHubToServiceKey(hub.slug),
            hub: hub.slug,
            category: service.slug,
            tags: [...(subservice.tags || []), ...(subservice.keywords || [])],
            weight: CONTENT_WEIGHTS.subservice,
            featured: subservice.featured || false,
            meta: {
              keywords: subservice.keywords || [],
              excerpt: subservice.excerpt || '',
              parentService: service.title || service.name,
              parentHub: hub.title || hub.name
            }
          });
        }
      }
    }
  } catch (error) {
    console.warn('Error processing services taxonomy:', error);
  }

  return docs;
}

/**
 * Map hub slug to standardized service key
 */
function mapHubToServiceKey(hubSlug: string): string {
  const mapping: Record<string, string> = {
    'video-production': 'video',
    'web-development': 'web',
    'web-development-services': 'web',
    'seo-services': 'seo',
    'marketing-automation': 'marketing',
    'content-production': 'content',
    'lead-generation': 'leadgen',
    'design-services': 'design'
  };

  return mapping[hubSlug] || hubSlug;
}

/**
 * Get all service hubs
 */
export function getServiceHubs(): SearchDoc[] {
  return servicesToDocs().filter(doc => doc.type === 'hub');
}

/**
 * Get services for a specific hub
 */
export function getHubServices(hubSlug: string): SearchDoc[] {
  return servicesToDocs().filter(doc => 
    doc.type === 'service' && doc.hub === hubSlug
  );
}

/**
 * Get subservices for a specific service
 */
export function getServiceSubservices(hubSlug: string, serviceSlug: string): SearchDoc[] {
  return servicesToDocs().filter(doc => 
    doc.type === 'subservice' && 
    doc.hub === hubSlug && 
    doc.category === serviceSlug
  );
}