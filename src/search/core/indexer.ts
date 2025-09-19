// ===================================================================
// /src/search/core/indexer.ts
// ===================================================================
// Main indexer that combines all sources

import type { SearchDoc } from './types';
import { applyContentRanking } from './rank';
import { servicesToDocs } from './sources.services';
import { portfolioToDocs } from './sources.portfolio';
import { packagesToDocs } from './sources.packages';

/**
 * Build complete search index from all sources
 */
export function buildSearchIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  try {
    // Combine all sources
    docs.push(...servicesToDocs());
    docs.push(...portfolioToDocs());
    docs.push(...packagesToDocs());

    // Apply ranking and deduplicate
    const rankedDocs = applyContentRanking(docs);
    
    // Remove duplicates by ID
    const uniqueDocs = Array.from(
      new Map(rankedDocs.map(doc => [doc.id, doc])).values()
    );

    console.log(`[Search Index] Built ${uniqueDocs.length} documents:`, {
      services: uniqueDocs.filter(d => ['hub', 'service', 'subservice'].includes(d.type)).length,
      portfolio: uniqueDocs.filter(d => d.type === 'portfolio').length,
      packages: uniqueDocs.filter(d => d.type === 'package').length
    });

    return uniqueDocs;
  } catch (error) {
    console.error('Error building search index:', error);
    return [];
  }
}

/**
 * Get documents by type
 */
export function getDocumentsByType(type: SearchDoc['type']): SearchDoc[] {
  return buildSearchIndex().filter(doc => doc.type === type);
}

/**
 * Get documents by service key
 */
export function getDocumentsByServiceKey(serviceKey: string): SearchDoc[] {
  return buildSearchIndex().filter(doc => doc.serviceKey === serviceKey);
}

/**
 * Get featured documents
 */
export function getFeaturedDocuments(): SearchDoc[] {
  return buildSearchIndex().filter(doc => doc.featured);
}

/**
 * Search documents by query
 */
export function searchDocuments(
  query: string, 
  filters?: Partial<SearchDoc>
): SearchDoc[] {
  const allDocs = buildSearchIndex();
  const queryLower = query.toLowerCase();

  let filteredDocs = allDocs;

  // Apply filters
  if (filters?.type) {
    filteredDocs = filteredDocs.filter(doc => doc.type === filters.type);
  }
  if (filters?.serviceKey) {
    filteredDocs = filteredDocs.filter(doc => doc.serviceKey === filters.serviceKey);
  }
  if (filters?.category) {
    filteredDocs = filteredDocs.filter(doc => doc.category === filters.category);
  }
  if (filters?.featured !== undefined) {
    filteredDocs = filteredDocs.filter(doc => doc.featured === filters.featured);
  }

  // Text search
  if (query.trim()) {
    filteredDocs = filteredDocs.filter(doc => {
      const searchText = [
        doc.title,
        doc.summary || '',
        ...(doc.tags || []),
        doc.serviceKey || '',
        doc.category || ''
      ].join(' ').toLowerCase();

      return searchText.includes(queryLower);
    });
  }

  return filteredDocs.sort((a, b) => (b.weight || 0) - (a.weight || 0));
}
