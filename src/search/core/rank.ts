// ===================================================================
// /src/search/core/rank.ts
// ===================================================================
// Ranking and scoring utilities

import { CONTENT_WEIGHTS, SERVICE_WEIGHTS } from '../config/search.config';
import type { SearchDoc, SearchResult } from './types';

/**
 * Apply content-based ranking weights to search documents
 */
export function applyContentRanking(docs: SearchDoc[]): SearchDoc[] {
  return docs.map(doc => ({
    ...doc,
    weight: calculateContentWeight(doc)
  }));
}

/**
 * Calculate weight for a document based on content type and metadata
 */
export function calculateContentWeight(doc: SearchDoc): number {
  let weight = CONTENT_WEIGHTS[doc.type] || 1;

  // Apply service area boost
  if (doc.serviceKey && SERVICE_WEIGHTS[doc.serviceKey]) {
    weight *= SERVICE_WEIGHTS[doc.serviceKey];
  }

  // Featured content boost
  if (doc.featured) {
    weight += CONTENT_WEIGHTS.featured;
  }

  // Recency boost
  if (doc.date) {
    weight += calculateRecencyBoost(doc.date);
  }

  // Manual weight boost
  if (doc.weight) {
    weight += doc.weight;
  }

  return Math.round(weight * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate recency boost based on publish date
 */
export function calculateRecencyBoost(dateString: string): number {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff < 7) return CONTENT_WEIGHTS.fresh;
    if (daysDiff < 30) return CONTENT_WEIGHTS.current;
    if (daysDiff < 90) return CONTENT_WEIGHTS.relevant;
    return CONTENT_WEIGHTS.archived;
  } catch {
    return 0; // Invalid date
  }
}

/**
 * Score search results based on query relevance and content weights
 */
export function scoreResults(
  results: SearchResult[], 
  query: string
): SearchResult[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);

  return results.map(result => {
    let score = result.weight || 1;

    // Title matching boost
    if (queryTerms.some(term => result.title.toLowerCase().includes(term))) {
      score *= 3;
    }

    // Exact title match
    if (result.title.toLowerCase().includes(query.toLowerCase())) {
      score *= 2;
    }

    // Tag matching
    if (result.tags) {
      const tagMatches = queryTerms.filter(term => 
        result.tags!.some(tag => tag.toLowerCase().includes(term))
      ).length;
      score += tagMatches * 0.5;
    }

    // Service key exact match
    if (queryTerms.includes(result.serviceKey?.toLowerCase() || '')) {
      score *= 1.5;
    }

    return {
      ...result,
      score: Math.round(score * 100) / 100
    };
  }).sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Deduplicate results by ID while preserving highest scored version
 */
export function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Map<string, SearchResult>();
  
  for (const result of results) {
    const existing = seen.get(result.id);
    if (!existing || (result.score || 0) > (existing.score || 0)) {
      seen.set(result.id, result);
    }
  }
  
  return Array.from(seen.values());
}