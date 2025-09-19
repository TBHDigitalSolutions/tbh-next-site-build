// ===================================================================
// /src/search/server/searchService.ts
// ===================================================================
// Centralized search service that switches between different engines

import MiniSearch from 'minisearch';
import { buildSearchIndex } from '../core/indexer';
import { scoreResults, deduplicateResults } from '../core/rank';
import { SynonymProcessor } from '../config/synonyms';
import { SEARCH_CONFIG, RESULT_LIMITS } from '../config/search.config';
import type { 
  SearchDoc, 
  SearchFilters, 
  SearchResult, 
  SearchResponse 
} from '../core/types';

// Import external search clients
import { MeiliSearchClient } from './meiliClient';

/**
 * Search engine types
 */
export type SearchEngine = 'minisearch' | 'meilisearch' | 'typesense';

/**
 * Search service configuration
 */
interface SearchServiceConfig {
  engine: SearchEngine;
  enableCache: boolean;
  enableAnalytics: boolean;
  maxResults: number;
}

/**
 * Search analytics data
 */
interface SearchAnalytics {
  query: string;
  filters: SearchFilters;
  resultCount: number;
  processingTime: number;
  timestamp: Date;
  engine: SearchEngine;
  userAgent?: string;
  sessionId?: string;
}

/**
 * Main search service class
 */
class SearchService {
  private config: SearchServiceConfig;
  private miniSearch: MiniSearch<SearchDoc> | null = null;
  private meiliClient: MeiliSearchClient | null = null;
  private documents: SearchDoc[] = [];
  private cache: Map<string, { results: SearchResult[]; timestamp: number }> = new Map();
  private analytics: SearchAnalytics[] = [];

  constructor(config: Partial<SearchServiceConfig> = {}) {
    this.config = {
      engine: (process.env.SEARCH_ENGINE as SearchEngine) || 'minisearch',
      enableCache: process.env.SEARCH_CACHE === 'true',
      enableAnalytics: process.env.SEARCH_ANALYTICS === 'true',
      maxResults: parseInt(process.env.SEARCH_MAX_RESULTS || '50'),
      ...config
    };

    this.initialize();
  }

  /**
   * Initialize the search service
   */
  private async initialize(): Promise<void> {
    try {
      console.log(`[Search Service] Initializing with engine: ${this.config.engine}`);
      
      // Load documents
      this.documents = buildSearchIndex();
      
      // Initialize search engine
      switch (this.config.engine) {
        case 'minisearch':
          await this.initializeMiniSearch();
          break;
        case 'meilisearch':
          await this.initializeMeiliSearch();
          break;
        case 'typesense':
          await this.initializeTypesense();
          break;
        default:
          throw new Error(`Unsupported search engine: ${this.config.engine}`);
      }

      console.log(`[Search Service] Successfully initialized with ${this.documents.length} documents`);
    } catch (error) {
      console.error('[Search Service] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize MiniSearch engine
   */
  private async initializeMiniSearch(): Promise<void> {
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
        if (fieldName.includes('.')) {
          const [parent, child] = fieldName.split('.');
          const parentValue = (document as any)[parent];
          return parentValue?.[child] || '';
        }
        return (document as any)[fieldName] || '';
      }
    });

    this.miniSearch.addAll(this.documents);
  }

  /**
   * Initialize MeiliSearch engine
   */
  private async initializeMeiliSearch(): Promise<void> {
    if (!process.env.MEILISEARCH_HOST) {
      throw new Error('MEILISEARCH_HOST environment variable is required');
    }

    this.meiliClient = new MeiliSearchClient({
      host: process.env.MEILISEARCH_HOST,
      apiKey: process.env.MEILISEARCH_API_KEY
    });

    await this.meiliClient.initialize();
    await this.meiliClient.indexDocuments(this.documents);
  }

  /**
   * Initialize Typesense engine
   */
  private async initializeTypesense(): Promise<void> {
    // Typesense implementation would go here
    throw new Error('Typesense implementation not yet available');
  }

  /**
   * Main search method
   */
  async search(
    filters: SearchFilters,
    options: {
      userAgent?: string;
      sessionId?: string;
      skipCache?: boolean;
    } = {}
  ): Promise<SearchResponse> {
    const startTime = performance.now();
    const cacheKey = this.getCacheKey(filters);

    // Check cache first
    if (this.config.enableCache && !options.skipCache) {
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
    }

    let results: SearchResult[] = [];

    try {
      // Route to appropriate search engine
      switch (this.config.engine) {
        case 'minisearch':
          results = await this.searchWithMiniSearch(filters);
          break;
        case 'meilisearch':
          results = await this.searchWithMeiliSearch(filters);
          break;
        case 'typesense':
          results = await this.searchWithTypesense(filters);
          break;
      }

      // Post-process results
      results = this.postProcessResults(results, filters);

      // Cache results
      if (this.config.enableCache) {
        this.setCache(cacheKey, results);
      }

      const processingTime = performance.now() - startTime;

      // Record analytics
      if (this.config.enableAnalytics) {
        this.recordAnalytics({
          query: filters.query || '',
          filters,
          resultCount: results.length,
          processingTime,
          timestamp: new Date(),
          engine: this.config.engine,
          userAgent: options.userAgent,
          sessionId: options.sessionId
        });
      }

      return {
        results,
        totalCount: results.length,
        query: filters.query || '',
        filters,
        processingTime,
        suggestions: await this.generateSuggestions(filters.query || '', results.length === 0)
      };

    } catch (error) {
      console.error('[Search Service] Search failed:', error);
      throw new Error('Search operation failed');
    }
  }

  /**
   * Search with MiniSearch
   */
  private async searchWithMiniSearch(filters: SearchFilters): Promise<SearchResult[]> {
    if (!this.miniSearch) {
      throw new Error('MiniSearch not initialized');
    }

    const { query = '', ...otherFilters } = filters;
    let results: SearchResult[] = [];

    if (query.trim()) {
      // Process query
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

    return results.slice(0, this.config.maxResults);
  }

  /**
   * Search with MeiliSearch
   */
  private async searchWithMeiliSearch(filters: SearchFilters): Promise<SearchResult[]> {
    if (!this.meiliClient) {
      throw new Error('MeiliSearch not initialized');
    }

    return this.meiliClient.search(filters);
  }

  /**
   * Search with Typesense
   */
  private async searchWithTypesense(filters: SearchFilters): Promise<SearchResult[]> {
    // Typesense implementation would go here
    throw new Error('Typesense search not implemented');
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string): Promise<string[]> {
    if (!query.trim() || query.length < 3) return [];

    switch (this.config.engine) {
      case 'minisearch':
        return this.getMiniSearchSuggestions(query);
      case 'meilisearch':
        return this.meiliClient?.getSuggestions(query) || [];
      default:
        return [];
    }
  }

  /**
   * Get analytics data
   */
  getAnalytics(): SearchAnalytics[] {
    return [...this.analytics];
  }

  /**
   * Clear analytics data
   */
  clearAnalytics(): void {
    this.analytics = [];
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; engine: SearchEngine; documentCount: number }> {
    try {
      switch (this.config.engine) {
        case 'minisearch':
          return {
            status: this.miniSearch ? 'healthy' : 'unhealthy',
            engine: this.config.engine,
            documentCount: this.documents.length
          };
        case 'meilisearch':
          const meiliStatus = await this.meiliClient?.healthCheck();
          return {
            status: meiliStatus ? 'healthy' : 'unhealthy',
            engine: this.config.engine,
            documentCount: this.documents.length
          };
        default:
          return {
            status: 'unknown',
            engine: this.config.engine,
            documentCount: this.documents.length
          };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        engine: this.config.engine,
        documentCount: this.documents.length
      };
    }
  }

  // Private helper methods

  private processQuery(query: string): string {
    let processed = SynonymProcessor.correctSpelling(query);
    if (SEARCH_CONFIG.features.AUTO_COMPLETE) {
      processed = SynonymProcessor.expandQuery(processed);
    }
    return processed;
  }

  private applyFilters(document: SearchDoc, filters: Omit<SearchFilters, 'query'>): boolean {
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(document.type)) return false;
    }

    if (filters.serviceKey && document.serviceKey !== filters.serviceKey) return false;
    if (filters.category && document.category !== filters.category) return false;
    if (filters.featured !== undefined && document.featured !== filters.featured) return false;

    if (filters.dateRange && document.date) {
      const docDate = new Date(document.date);
      if (filters.dateRange.from && docDate < new Date(filters.dateRange.from)) return false;
      if (filters.dateRange.to && docDate > new Date(filters.dateRange.to)) return false;
    }

    return true;
  }

  private postProcessResults(results: SearchResult[], filters: SearchFilters): SearchResult[] {
    // Score and deduplicate
    let processed = scoreResults(results, filters.query || '');
    processed = deduplicateResults(processed);

    // Apply final limit
    return processed.slice(0, this.config.maxResults);
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

    return [...new Set(matchedTerms)];
  }

  private async generateSuggestions(query: string, noResults: boolean): Promise<string[]> {
    if (!query.trim() || !noResults) return [];
    return this.getSuggestions(query);
  }

  private getMiniSearchSuggestions(query: string): string[] {
    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    this.documents.forEach(doc => {
      if (doc.title.toLowerCase().includes(queryLower)) {
        suggestions.add(doc.title);
      }
      doc.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, RESULT_LIMITS.suggestions);
  }

  private getCacheKey(filters: SearchFilters): string {
    return JSON.stringify(filters);
  }

  private getFromCache(key: string): { results: SearchResult[]; timestamp: number } | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isValid = Date.now() - cached.timestamp < SEARCH_CONFIG.performance.cacheTtlMs;
    if (!isValid) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  private setCache(key: string, results: SearchResult[]): void {
    if (this.cache.size >= SEARCH_CONFIG.performance.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      results,
      timestamp: Date.now()
    });
  }

  private recordAnalytics(analytics: SearchAnalytics): void {
    this.analytics.push(analytics);
    
    // Keep only recent analytics (last 1000 entries)
    if (this.analytics.length > 1000) {
      this.analytics = this.analytics.slice(-1000);
    }
  }
}

// Singleton instance
let searchService: SearchService | null = null;

/**
 * Get search service instance
 */
export function getSearchService(): SearchService {
  if (!searchService) {
    searchService = new SearchService();
  }
  return searchService;
}

/**
 * Main search function for API routes
 */
export async function search(
  filters: SearchFilters,
  options?: {
    userAgent?: string;
    sessionId?: string;
    skipCache?: boolean;
  }
): Promise<SearchResponse> {
  const service = getSearchService();
  return service.search(filters, options);
}

/**
 * Get search suggestions for API routes
 */
export async function getSuggestions(query: string): Promise<string[]> {
  const service = getSearchService();
  return service.getSuggestions(query);
}

/**
 * Health check for API routes
 */
export async function healthCheck() {
  const service = getSearchService();
  return service.healthCheck();
}

/**
 * Get analytics data
 */
export function getAnalytics() {
  const service = getSearchService();
  return service.getAnalytics();
}