// ===================================================================
// /src/search/server/meiliClient.ts
// ===================================================================
// MeiliSearch client implementation

import { MeiliSearch, Index } from 'meilisearch';
import { SEARCH_CONFIG } from '../config/search.config';
import type { SearchDoc, SearchFilters, SearchResult } from '../core/types';

/**
 * MeiliSearch client configuration
 */
interface MeiliSearchConfig {
  host: string;
  apiKey?: string;
  indexName?: string;
}

/**
 * MeiliSearch client wrapper
 */
export class MeiliSearchClient {
  private client: MeiliSearch;
  private index: Index | null = null;
  private config: Required<MeiliSearchConfig>;

  constructor(config: MeiliSearchConfig) {
    this.config = {
      host: config.host,
      apiKey: config.apiKey || '',
      indexName: config.indexName || 'tbh-search'
    };

    this.client = new MeiliSearch({
      host: this.config.host,
      apiKey: this.config.apiKey || undefined
    });
  }

  /**
   * Initialize MeiliSearch index
   */
  async initialize(): Promise<void> {
    try {
      console.log('[MeiliSearch] Initializing index:', this.config.indexName);

      // Create or get index
      this.index = await this.client.getOrCreateIndex(this.config.indexName, {
        primaryKey: 'id'
      });

      // Configure index settings
      await this.configureIndex();

      console.log('[MeiliSearch] Index initialized successfully');
    } catch (error) {
      console.error('[MeiliSearch] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Configure index settings
   */
  private async configureIndex(): Promise<void> {
    if (!this.index) throw new Error('Index not initialized');

    // Set searchable attributes
    await this.index.updateSearchableAttributes([
      'title',
      'summary',
      'tags',
      'serviceKey',
      'category',
      'meta.keywords'
    ]);

    // Set filterable attributes
    await this.index.updateFilterableAttributes([
      'type',
      'serviceKey',
      'category',
      'featured',
      'date',
      'hub'
    ]);

    // Set sortable attributes
    await this.index.updateSortableAttributes([
      'weight',
      'date',
      'title'
    ]);

    // Set ranking rules
    await this.index.updateRankingRules([
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
      'weight:desc'
    ]);

    // Set synonyms
    await this.index.updateSynonyms({
      'web dev': ['web development', 'website'],
      'seo': ['search engine optimization'],
      'video': ['film', 'production']
    });

    // Set stop words
    await this.index.updateStopWords(['the', 'a', 'an', 'and', 'or', 'but']);
  }

  /**
   * Index documents
   */
  async indexDocuments(documents: SearchDoc[]): Promise<void> {
    if (!this.index) throw new Error('Index not initialized');

    try {
      console.log(`[MeiliSearch] Indexing ${documents.length} documents...`);

      // Prepare documents for MeiliSearch
      const meiliDocs = documents.map(doc => ({
        ...doc,
        // MeiliSearch expects flat structure for some features
        _searchableText: [
          doc.title,
          doc.summary || '',
          ...(doc.tags || [])
        ].join(' ')
      }));

      // Add documents to index
      const task = await this.index.addDocuments(meiliDocs);
      
      // Wait for indexing to complete
      await this.client.waitForTask(task.taskUid);

      console.log('[MeiliSearch] Documents indexed successfully');
    } catch (error) {
      console.error('[MeiliSearch] Document indexing failed:', error);
      throw error;
    }
  }

  /**
   * Search documents
   */
  async search(filters: SearchFilters): Promise<SearchResult[]> {
    if (!this.index) throw new Error('Index not initialized');

    try {
      const { query = '', types, serviceKey, category, featured, dateRange } = filters;

      // Build filter string
      const filterParts: string[] = [];
      
      if (types && types.length > 0) {
        filterParts.push(`type IN [${types.map(t => `"${t}"`).join(', ')}]`);
      }
      
      if (serviceKey) {
        filterParts.push(`serviceKey = "${serviceKey}"`);
      }
      
      if (category) {
        filterParts.push(`category = "${category}"`);
      }
      
      if (featured !== undefined) {
        filterParts.push(`featured = ${featured}`);
      }
      
      if (dateRange) {
        if (dateRange.from) {
          filterParts.push(`date >= ${new Date(dateRange.from).getTime()}`);
        }
        if (dateRange.to) {
          filterParts.push(`date <= ${new Date(dateRange.to).getTime()}`);
        }
      }

      // Perform search
      const searchResults = await this.index.search(query, {
        filter: filterParts.length > 0 ? filterParts.join(' AND ') : undefined,
        limit: SEARCH_CONFIG.limit,
        attributesToHighlight: ['title', 'summary'],
        attributesToCrop: ['summary'],
        cropLength: 150,
        sort: ['weight:desc']
      });

      // Convert to SearchResult format
      return searchResults.hits.map(hit => ({
        ...hit,
        score: hit._rankingScore || 0,
        highlights: {
          title: hit._formatted?.title,
          summary: hit._formatted?.summary,
          tags: hit._formatted?.tags
        }
      })) as SearchResult[];

    } catch (error) {
      console.error('[MeiliSearch] Search failed:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string): Promise<string[]> {
    if (!this.index) throw new Error('Index not initialized');

    try {
      const results = await this.index.search(query, {
        limit: 8,
        attributesToRetrieve: ['title', 'tags'],
        attributesToHighlight: []
      });

      const suggestions = new Set<string>();
      
      results.hits.forEach(hit => {
        const doc = hit as unknown as SearchDoc;
        if (doc.title.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(doc.title);
        }
        doc.tags?.forEach(tag => {
          if (tag.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(tag);
          }
        });
      });

      return Array.from(suggestions).slice(0, 8);
    } catch (error) {
      console.error('[MeiliSearch] Suggestions failed:', error);
      return [];
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.health();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get index stats
   */
  async getStats() {
    if (!this.index) throw new Error('Index not initialized');

    try {
      const stats = await this.index.getStats();
      return {
        numberOfDocuments: stats.numberOfDocuments,
        isIndexing: stats.isIndexing,
        fieldDistribution: stats.fieldDistribution
      };
    } catch (error) {
      console.error('[MeiliSearch] Stats failed:', error);
      return null;
    }
  }

  /**
   * Update documents
   */
  async updateDocuments(documents: SearchDoc[]): Promise<void> {
    if (!this.index) throw new Error('Index not initialized');

    try {
      const task = await this.index.updateDocuments(documents);
      await this.client.waitForTask(task.taskUid);
    } catch (error) {
      console.error('[MeiliSearch] Document update failed:', error);
      throw error;
    }
  }

  /**
   * Delete documents by filter
   */
  async deleteDocuments(filter: string): Promise<void> {
    if (!this.index) throw new Error('Index not initialized');

    try {
      const task = await this.index.deleteDocuments({ filter });
      await this.client.waitForTask(task.taskUid);
    } catch (error) {
      console.error('[MeiliSearch] Document deletion failed:', error);
      throw error;
    }
  }

  /**
   * Reset index
   */
  async resetIndex(): Promise<void> {
    if (!this.index) throw new Error('Index not initialized');

    try {
      const task = await this.index.deleteAllDocuments();
      await this.client.waitForTask(task.taskUid);
    } catch (error) {
      console.error('[MeiliSearch] Index reset failed:', error);
      throw error;
    }
  }
}