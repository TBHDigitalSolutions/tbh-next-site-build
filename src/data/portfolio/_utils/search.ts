// /src/data/portfolio/_utils/search.ts
// Advanced search and filtering utilities for portfolio items

import type { Project, CategorySlug } from "../_types";

export type SearchQuery = {
  text?: string;                 // matches title, description, tags, client
  category?: CategorySlug;       // optional category filter
  tags?: string[];               // AND filter by tags
  featuredOnly?: boolean;        // featured only
  limit?: number;                // cap result count
  mediaTypes?: string[];         // filter by media type
};

export function searchProjects(items: Project[], q: SearchQuery): Project[] {
  let results = items;

  // Filter by category
  if (q.category) {
    results = results.filter((item) => item.category === q.category);
  }

  // Filter by featured status
  if (q.featuredOnly) {
    results = results.filter((item) => item.featured);
  }

  // Filter by media types
  if (q.mediaTypes?.length) {
    const mediaTypeSet = new Set(q.mediaTypes);
    results = results.filter((item) => mediaTypeSet.has(item.media.type));
  }

  // Filter by tags (AND logic - all tags must be present)
  if (q.tags?.length) {
    const requiredTags = new Set(q.tags.map((t) => t.toLowerCase()));
    results = results.filter((item) => {
      const itemTags = new Set((item.tags || []).map((t) => t.toLowerCase()));
      return [...requiredTags].every((tag) => itemTags.has(tag));
    });
  }

  // Text search across multiple fields
  if (q.text?.trim()) {
    const searchTerms = q.text.toLowerCase().trim().split(/\s+/);
    results = results.filter((item) => {
      const searchableContent = [
        item.title,
        item.description,
        item.client,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      
      // All search terms must be found (AND logic)
      return searchTerms.every(term => searchableContent.includes(term));
    });
  }

  // Apply limit
  if (q.limit && q.limit > 0) {
    results = results.slice(0, q.limit);
  }

  return results;
}

// Specialized search functions
export function searchByClient(items: Project[], clientName: string): Project[] {
  return searchProjects(items, { text: clientName });
}

export function getProjectsByTag(items: Project[], tag: string): Project[] {
  return searchProjects(items, { tags: [tag] });
}

export function getFeaturedProjectsByCategory(items: Project[], category: CategorySlug, limit = 3): Project[] {
  return searchProjects(items, { 
    category, 
    featuredOnly: true, 
    limit 
  }).sort((a, b) => (a.priority || 999) - (b.priority || 999));
}

// Search suggestions and autocomplete
export function getSearchSuggestions(items: Project[]): {
  tags: string[];
  clients: string[];
  categories: CategorySlug[];
  mediaTypes: string[];
} {
  const tags = new Set<string>();
  const clients = new Set<string>();
  const categories = new Set<CategorySlug>();
  const mediaTypes = new Set<string>();

  items.forEach(item => {
    if (item.tags) {
      item.tags.forEach(tag => tags.add(tag));
    }
    if (item.client) {
      clients.add(item.client);
    }
    categories.add(item.category);
    mediaTypes.add(item.media.type);
  });

  return {
    tags: Array.from(tags).sort(),
    clients: Array.from(clients).sort(),
    categories: Array.from(categories),
    mediaTypes: Array.from(mediaTypes)
  };
}

// Advanced filtering utilities
export function filterProjectsByMetrics(items: Project[], hasMetrics = true): Project[] {
  return items.filter(item => 
    hasMetrics ? (item.metrics && item.metrics.length > 0) : !item.metrics?.length
  );
}

export function sortProjectsByRelevance(items: Project[], searchQuery: string): Project[] {
  if (!searchQuery.trim()) return items;

  const query = searchQuery.toLowerCase();
  
  return items.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    
    // Title matches get highest score
    if (a.title.toLowerCase().includes(query)) scoreA += 10;
    if (b.title.toLowerCase().includes(query)) scoreB += 10;
    
    // Featured items get bonus
    if (a.featured) scoreA += 5;
    if (b.featured) scoreB += 5;
    
    // Client matches
    if (a.client?.toLowerCase().includes(query)) scoreA += 3;
    if (b.client?.toLowerCase().includes(query)) scoreB += 3;
    
    // Tag matches
    const aTagMatch = a.tags?.some(tag => tag.toLowerCase().includes(query));
    const bTagMatch = b.tags?.some(tag => tag.toLowerCase().includes(query));
    if (aTagMatch) scoreA += 2;
    if (bTagMatch) scoreB += 2;
    
    // Description matches
    if (a.description?.toLowerCase().includes(query)) scoreA += 1;
    if (b.description?.toLowerCase().includes(query)) scoreB += 1;
    
    return scoreB - scoreA; // Higher score first
  });
}