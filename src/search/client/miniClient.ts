// ===================================================================
// /src/search/client/miniClient.ts
// ===================================================================
// MiniSearch client for browser-based search functionality

"use client";

import MiniSearch from 'minisearch';
import { SEARCH_CONFIG, RESULT_LIMITS } from '../config/search.config';
import { SynonymProcessor } from '../config/synonyms';
import type { SearchDoc, SearchFilters, SearchResult, SearchResponse } from '../core/types';

interface SearchCache {
  query: string;
  filters: SearchFilters;
  results: SearchResult[];
  timestamp: number;
}

/**
 * Client-side search engine using MiniSearch
 */
class SearchClient {
  private miniSearch: MiniSearch<SearchDoc> | null = null;
  private documents: SearchDoc[] = [];
  private cache: Map<string, SearchCache> = new Map();
  private loading = false;
  private error: string | null = null;

  /**
   * Initialize the search client
   */
  async initialize(): Promise<void> {
    if (this.miniSearch) return; // Already initialized

    try {
      this.loading = true;
      this.error = null;

      // Fetch search index
      const response = await fetch('/search/index.json', {
        cache: 'force-cache'
      });

      if (!response.ok) {
        throw new Error(`Failed to load search index: ${response.status}`);
      }

      this.documents = await response.json();

      // Configure MiniSearch
      this.miniSearch = new MiniSearch<SearchDoc>({
        fields: SEARCH_CONFIG.indexFields,
        storeFields: SEARCH_CONFIG.storeFields,
        searchOptions: {
          boost: SEARCH_CONFIG.boost,
          fuzzy: SEARCH_CONFIG.fuzzy,
          prefix: SEARCH_CONFIG.prefix,
          combineWith: 'AND'
        },
        extractField: (document, fieldName) => {
          // Handle nested fields like 'meta.keywords'
          if (fieldName.includes('.')) {
            const [parent, child] = fieldName.split('.');
            const parentValue = (document as any)[parent];
            return parentValue?.[child] || '';
          }
          return (document as any)[fieldName] || '';
        }
      });

      // Add documents to search index
      this.miniSearch.addAll(this.documents);

      console.log(`[Search Client] Initialized with ${this.documents.length} documents`);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Failed to initialize search';
      console.error('[Search Client] Initialization failed:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Search documents with filters
   */
  async search(filters: SearchFilters): Promise<SearchResponse> {
    await this.initialize();

    if (!this.miniSearch) {
      throw new Error('Search client not initialized');
    }

    const cacheKey = this.getCacheKey(filters);
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return {
        results: cached.results,
        totalCount: cached.results.length,
        query: filters.query || '',
        filters,
        processingTime: 0
      };
    }

    const startTime = performance.now();
    const { query = '', ...otherFilters } = filters;

    let results: SearchResult[] = [];

    try {
      if (query.trim()) {
        // Process query with synonyms and spelling correction
        const processedQuery = this.processQuery(query);
        
        // Perform search
        const searchResults = this.miniSearch.search(processedQuery, {
          filter: (result) => this.applyFilters(result, otherFilters)
        });

        results = searchResults.map(result => ({
          ...result,
          score: result.score,
          highlights: this.generateHighlights(result, query),
          matchedTerms: this.extractMatchedTerms(result, query)
        }));
      } else {
        // No query - return filtered documents
        results = this.documents
          .filter(doc => this.applyFilters(doc, otherFilters))
          .map(doc => ({
            ...doc,
            score: doc.weight || 1
          }))
          .sort((a, b) => (b.score || 0) - (a.score || 0));
      }

      // Apply result limit
      const limitedResults = results.slice(0, RESULT_LIMITS.global);

      // Cache results
      this.setCache(cacheKey, {
        query,
        filters,
        results: limitedResults,
        timestamp: Date.now()
      });

      const processingTime = performance.now() - startTime;

      return {
        results: limitedResults,
        totalCount: results.length,
        query,
        filters,
        processingTime,
        suggestions: this.generateSuggestions(query, results.length === 0)
      };

    } catch (error) {
      console.error('[Search Client] Search failed:', error);
      throw new Error('Search operation failed');
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSuggestions(query: string): Promise<string[]> {
    await this.initialize();

    if (!query.trim() || query.length < 3) return [];

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Get suggestions from document titles and tags
    this.documents.forEach(doc => {
      // Title suggestions
      if (doc.title.toLowerCase().includes(queryLower)) {
        suggestions.add(doc.title);
      }

      // Tag suggestions
      doc.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag);
        }
      });

      // Service key suggestions
      if (doc.serviceKey?.toLowerCase().includes(queryLower)) {
        suggestions.add(doc.serviceKey);
      }
    });

    return Array.from(suggestions)
      .slice(0, RESULT_LIMITS.suggestions)
      .sort((a, b) => a.length - b.length); // Shorter suggestions first
  }

  /**
   * Get documents by type
   */
  getDocumentsByType(type: SearchDoc['type']): SearchDoc[] {
    return this.documents.filter(doc => doc.type === type);
  }

  /**
   * Get featured documents
   */
  getFeaturedDocuments(): SearchDoc[] {
    return this.documents.filter(doc => doc.featured);
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // Private methods

  private processQuery(query: string): string {
    // Apply spelling corrections
    let processed = SynonymProcessor.correctSpelling(query);
    
    // Expand with synonyms if configured
    if (SEARCH_CONFIG.features.AUTO_COMPLETE) {
      processed = SynonymProcessor.expandQuery(processed);
    }

    return processed;
  }

  private applyFilters(document: SearchDoc, filters: Omit<SearchFilters, 'query'>): boolean {
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(document.type)) return false;
    }

    if (filters.serviceKey) {
      if (document.serviceKey !== filters.serviceKey) return false;
    }

    if (filters.category) {
      if (document.category !== filters.category) return false;
    }

    if (filters.featured !== undefined) {
      if (document.featured !== filters.featured) return false;
    }

    if (filters.dateRange) {
      if (!document.date) return false;
      
      const docDate = new Date(document.date);
      if (filters.dateRange.from && docDate < new Date(filters.dateRange.from)) return false;
      if (filters.dateRange.to && docDate > new Date(filters.dateRange.to)) return false;
    }

    return true;
  }

  private generateHighlights(result: SearchDoc, query: string): SearchResult['highlights'] {
    if (!SEARCH_CONFIG.features.HIGHLIGHT_TERMS || !query.trim()) return undefined;

    return {
      title: this.highlightField(result.title, query),
      summary: result.summary ? this.highlightField(result.summary, query) : undefined,
      tags: result.tags?.map(tag => this.highlightField(tag, query))
    };
  }

  private highlightField(text: string, query: string): string {
    const queryTerms = query.toLowerCase().split(/\s+/);
    let highlighted = text;

    queryTerms.forEach(term => {
      if (term.length > 1) {
        const regex = new RegExp(`(${term})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
      }
    });

    return highlighted;
  }

  private extractMatchedTerms(result: SearchDoc, query: string): string[] {
    const queryTerms = query.toLowerCase().split(/\s+/);
    const matchedTerms: string[] = [];
    const searchText = [
      result.title,
      result.summary || '',
      ...(result.tags || [])
    ].join(' ').toLowerCase();

    queryTerms.forEach(term => {
      if (term.length > 1 && searchText.includes(term)) {
        matchedTerms.push(term);
      }
    });

    return [...new Set(matchedTerms)]; // Remove duplicates
  }

  private generateSuggestions(query: string, noResults: boolean): string[] {
    if (!query.trim() || !noResults) return [];

    const suggestions: string[] = [];
    
    // Get service-specific suggestions
    SEARCH_CONFIG.indexFields.forEach(field => {
      if (field === 'serviceKey') {
        const serviceKeys = [...new Set(this.documents.map(d => d.serviceKey).filter(Boolean))];
        suggestions.push(...serviceKeys);
      }
    });

    return suggestions.slice(0, RESULT_LIMITS.suggestions);
  }

  private getCacheKey(filters: SearchFilters): string {
    return JSON.stringify(filters);
  }

  private getFromCache(key: string): SearchCache | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is still valid (5 minutes)
    const isValid = Date.now() - cached.timestamp < SEARCH_CONFIG.performance.cacheTtlMs;
    if (!isValid) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  private setCache(key: string, value: SearchCache): void {
    // Limit cache size
    if (this.cache.size >= SEARCH_CONFIG.performance.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, value);
  }
}

// Singleton instance
const searchClient = new SearchClient();

// Export main search functions
export async function runClientSearch(filters: SearchFilters): Promise<SearchResult[]> {
  const response = await searchClient.search(filters);
  return response.results;
}

export async function searchDocuments(filters: SearchFilters): Promise<SearchResponse> {
  return searchClient.search(filters);
}

export async function getSuggestions(query: string): Promise<string[]> {
  return searchClient.getSuggestions(query);
}

export function clearSearchCache(): void {
  searchClient.clearCache();
}

export default searchClient;