// ===================================================================
// /src/search/client/useSearch.ts
// ===================================================================
// React hook for search state management

"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from './debounce';
import { searchDocuments, getSuggestions } from './miniClient';
import type { SearchDoc, SearchFilters, SearchResult, SearchResponse } from '../core/types';
import { SEARCH_CONFIG } from '../config/search.config';

export interface UseSearchOptions {
  initialFilters?: SearchFilters;
  debounceMs?: number;
  autoSearch?: boolean;
  enableSuggestions?: boolean;
  onSearch?: (query: string, results: SearchResult[]) => void;
  onError?: (error: Error) => void;
}

export interface UseSearchReturn {
  // State
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  processingTime: number | null;
  suggestions: string[];
  
  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  search: (overrideFilters?: SearchFilters) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
  
  // Current state
  filters: SearchFilters;
  hasResults: boolean;
  hasQuery: boolean;
  isEmpty: boolean;
}

/**
 * React hook for search functionality
 */
export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    initialFilters = {},
    debounceMs = SEARCH_CONFIG.performance.debounceMs,
    autoSearch = true,
    enableSuggestions = SEARCH_CONFIG.features.AUTO_COMPLETE,
    onSearch,
    onError
  } = options;

  // State
  const [query, setQueryState] = useState(initialFilters.query || '');
  const [filters, setFiltersState] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Perform search with current query and filters
   */
  const performSearch = useCallback(async (overrideFilters?: SearchFilters) => {
    const searchFilters = overrideFilters || { ...filters, query };
    
    // Skip search if query is too short
    if (searchFilters.query && searchFilters.query.length < SEARCH_CONFIG.minQueryLength) {
      setResults([]);
      setTotalCount(0);
      setSuggestions([]);
      return;
    }

    // Abort previous search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);

      const response: SearchResponse = await searchDocuments(searchFilters);
      
      // Check if search was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setResults(response.results);
      setTotalCount(response.totalCount);
      setProcessingTime(response.processingTime || null);
      setSuggestions(response.suggestions || []);

      // Call success callback
      onSearch?.(searchFilters.query || '', response.results);

    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return; // Ignore aborted requests
      }

      const error = err instanceof Error ? err : new Error('Search failed');
      setError(error.message);
      setResults([]);
      setTotalCount(0);
      setSuggestions([]);
      
      // Call error callback
      onError?.(error);
      
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [filters, query, onSearch, onError]);

  /**
   * Debounced search function
   */
  const debouncedSearch = useCallback(
    debounce(performSearch, debounceMs),
    [performSearch, debounceMs]
  );

  /**
   * Set query and trigger search
   */
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    
    if (autoSearch) {
      debouncedSearch();
    }
  }, [autoSearch, debouncedSearch]);

  /**
   * Update filters and trigger search
   */
  const setFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    
    if (autoSearch) {
      // Don't debounce filter changes - search immediately
      performSearch({ ...filters, ...newFilters, query });
    }
  }, [autoSearch, performSearch, filters, query]);

  /**
   * Manual search trigger
   */
  const search = useCallback((overrideFilters?: SearchFilters) => {
    return performSearch(overrideFilters);
  }, [performSearch]);

  /**
   * Clear results
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setTotalCount(0);
    setProcessingTime(null);
    setSuggestions([]);
    setError(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Load suggestions when query changes
   */
  useEffect(() => {
    if (!enableSuggestions || !query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const loadSuggestions = async () => {
      try {
        const suggestionResults = await getSuggestions(query);
        setSuggestions(suggestionResults);
      } catch (err) {
        console.warn('Failed to load suggestions:', err);
      }
    };

    const timeoutId = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query, enableSuggestions]);

  /**
   * Initial search on mount if auto-search is enabled
   */
  useEffect(() => {
    if (autoSearch && (query || Object.keys(filters).length > 1)) {
      performSearch();
    }
  }, []); // Only run on mount

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Computed properties
  const hasResults = results.length > 0;
  const hasQuery = query.trim().length > 0;
  const isEmpty = !hasResults && !loading && !error;

  return {
    // State
    query,
    results,
    loading,
    error,
    totalCount,
    processingTime,
    suggestions,
    
    // Actions
    setQuery,
    setFilters,
    search,
    clearResults,
    clearError,
    
    // Current state
    filters: { ...filters, query },
    hasResults,
    hasQuery,
    isEmpty
  };
}

/**
 * Simplified hook for basic search functionality
 */
export function useSimpleSearch(
  initialQuery: string = '',
  initialFilters: SearchFilters = {}
) {
  const { query, results, loading, setQuery, search } = useSearch({
    initialFilters: { ...initialFilters, query: initialQuery },
    autoSearch: true
  });

  return {
    query,
    results,
    loading,
    setQuery,
    search
  };
}

/**
 * Hook for search suggestions only
 */
export function useSearchSuggestions(query: string, enabled: boolean = true) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    const loadSuggestions = async () => {
      setLoading(true);
      try {
        const results = await getSuggestions(query);
        setSuggestions(results);
      } catch (err) {
        console.warn('Failed to load suggestions:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [query, enabled]);

  return { suggestions, loading };
}