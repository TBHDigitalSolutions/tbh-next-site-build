// ===================================================================
// /src/search/ui/SearchBanner.tsx
// ===================================================================
// Large search section with input, filters, and results

"use client";

import React, { useState, useCallback } from 'react';
import { useSearch } from '../client/useSearch';
import type { SearchType } from '../core/types';
import SearchBar from './SearchBar';
import Filters from './Filters';
import ResultsList from './ResultsList';
import EmptyState from './EmptyState';
import styles from './search.module.css';

// Global analytics declaration
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      action: string,
      parameters: Record<string, any>
    ) => void;
  }
}

export interface SearchBannerProps {
  // Scoping options
  types?: SearchType[];
  serviceKey?: string;
  category?: string;
  featuredOnly?: boolean;
  
  // UI options
  title?: string;
  subtitle?: string;
  placeholder?: string;
  showFilters?: boolean;
  showTypeFilter?: boolean;
  showServiceFilter?: boolean;
  showCategoryFilter?: boolean;
  showFeaturedFilter?: boolean;
  showDateFilter?: boolean;
  
  // Display options
  limit?: number;
  showMeta?: boolean;
  showSummary?: boolean;
  showTags?: boolean;
  maxTags?: number;
  
  // Styling
  className?: string;
  headerClassName?: string;
  filtersClassName?: string;
  resultsClassName?: string;
  
  // Analytics configuration
  analyticsEnabled?: boolean;
  analyticsContext?: string; // e.g., 'portfolio_hub', 'services_page', etc.
  
  // Event handlers (optional external handlers)
  onResultClick?: (result: any) => void;
}

/**
 * Large search banner with input, filters, and results
 * Includes built-in analytics tracking for search events
 */
export default function SearchBanner({
  // Scoping
  types,
  serviceKey,
  category,
  featuredOnly = false,
  
  // UI options
  title = 'Search',
  subtitle,
  placeholder = 'Search services, portfolio, packages...',
  showFilters = true,
  showTypeFilter = true,
  showServiceFilter = true,
  showCategoryFilter = false,
  showFeaturedFilter = true,
  showDateFilter = false,
  
  // Display options
  limit,
  showMeta = true,
  showSummary = true,
  showTags = true,
  maxTags = 3,
  
  // Styling
  className = '',
  headerClassName = '',
  filtersClassName = '',
  resultsClassName = '',
  
  // Analytics
  analyticsEnabled = true,
  analyticsContext = 'search_banner',
  
  // Event handlers
  onResultClick
}: SearchBannerProps) {
  const [manualFilters, setManualFilters] = useState({});

  const initialFilters = {
    types,
    serviceKey,
    category,
    featured: featuredOnly || undefined,
    ...manualFilters
  };

  // Analytics tracking functions
  const trackSearchEvent = useCallback((query: string, results: any[]) => {
    if (!analyticsEnabled || typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'search_query', {
      event_category: 'Search',
      event_label: `${analyticsContext}:${query}`,
      search_term: query,
      results_count: results.length,
      context: analyticsContext,
      has_filters: Object.keys(manualFilters).length > 0,
      content_types: types ? types.join(',') : 'all',
      service_key: serviceKey || 'all'
    });

    // Track no results specifically
    if (results.length === 0 && query.trim()) {
      window.gtag('event', 'search_no_results', {
        event_category: 'Search',
        event_label: `no_results:${query}`,
        search_term: query,
        context: analyticsContext
      });
    }
  }, [analyticsEnabled, analyticsContext, manualFilters, types, serviceKey]);

  const trackResultClick = useCallback((result: any, position: number) => {
    if (!analyticsEnabled || typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'search_result_click', {
      event_category: 'Search',
      event_label: `${analyticsContext}:${result.type}:${result.id}`,
      result_id: result.id,
      result_type: result.type,
      result_title: result.title,
      click_position: position + 1,
      context: analyticsContext,
      search_term: query || 'browse'
    });
  }, [analyticsEnabled, analyticsContext]);

  const trackFilterChange = useCallback((filterType: string, filterValue: any) => {
    if (!analyticsEnabled || typeof window === 'undefined' || !window.gtag) return;

    window.gtag('event', 'search_filter_applied', {
      event_category: 'Search',
      event_label: `${analyticsContext}:${filterType}`,
      filter_type: filterType,
      filter_value: Array.isArray(filterValue) ? filterValue.join(',') : String(filterValue),
      context: analyticsContext
    });
  }, [analyticsEnabled, analyticsContext]);

  // Initialize search with analytics
  const { 
    query, 
    results, 
    loading, 
    error, 
    totalCount, 
    isEmpty,
    setQuery, 
    setFilters,
    search 
  } = useSearch({
    initialFilters,
    onSearch: trackSearchEvent // Built-in analytics tracking
  });

  // Calculate display results (moved before callbacks that use it)
  const displayResults = limit ? results.slice(0, limit) : results;

  const handleFiltersChange = useCallback((newFilters: any) => {
    // Track filter changes
    Object.entries(newFilters).forEach(([key, value]) => {
      if (JSON.stringify(manualFilters[key as keyof typeof manualFilters]) !== JSON.stringify(value)) {
        trackFilterChange(key, value);
      }
    });

    setManualFilters(newFilters);
    setFilters(newFilters);
  }, [manualFilters, setFilters, trackFilterChange]);

  const handleSearch = useCallback(() => {
    search();
  }, [search]);

  const handleResultClick = useCallback((result: any) => {
    // Find the position of the clicked result
    const position = displayResults.findIndex(r => r.id === result.id);
    
    // Track the click
    trackResultClick(result, position);
    
    // Call external handler if provided
    onResultClick?.(result);
  }, [displayResults, trackResultClick, onResultClick]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    if (analyticsEnabled && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search_suggestion_click', {
        event_category: 'Search',
        event_label: `${analyticsContext}:${suggestion}`,
        suggestion_text: suggestion,
        context: analyticsContext
      });
    }
    
    setQuery(suggestion);
  }, [analyticsEnabled, analyticsContext, setQuery]);

  const handleViewAll = useCallback(() => {
    if (analyticsEnabled && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search_view_all_click', {
        event_category: 'Search',
        event_label: `${analyticsContext}:view_all`,
        total_results: totalCount,
        displayed_results: displayResults.length,
        context: analyticsContext,
        search_term: query || 'browse'
      });
    }
    
    // Remove limit to show all results
    setFilters({ ...initialFilters, ...manualFilters });
  }, [analyticsEnabled, analyticsContext, totalCount, displayResults.length, query, initialFilters, manualFilters, setFilters]);

  return (
    <section className={`${styles.searchBanner} ${className}`}>
      {/* Header */}
      <div className={`${styles.searchBannerHeader} ${headerClassName}`}>
        <h2 className={styles.searchBannerTitle}>{title}</h2>
        {subtitle && (
          <p className={styles.searchBannerSubtitle}>{subtitle}</p>
        )}
        
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
          placeholder={placeholder}
          loading={loading}
          aria-label="Search input"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`${styles.searchFilters} ${filtersClassName}`}>
          <Filters
            filters={{ ...initialFilters, ...manualFilters, query }}
            onChange={handleFiltersChange}
            availableTypes={types}
            showTypeFilter={showTypeFilter && !types}
            showServiceFilter={showServiceFilter && !serviceKey}
            showCategoryFilter={showCategoryFilter && !category}
            showFeaturedFilter={showFeaturedFilter && !featuredOnly}
            showDateFilter={showDateFilter}
          />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.error} role="alert">
          <p>Search failed: {error}</p>
          <button onClick={handleSearch} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      {/* Results or Empty State */}
      <div className={`${styles.searchResults} ${resultsClassName}`}>
        {isEmpty && query ? (
          <EmptyState
            query={query}
            suggestions={['web development', 'video production', 'seo services', 'marketing automation']}
            onSuggestionClick={handleSuggestionClick}
          />
        ) : (
          <ResultsList
            results={displayResults}
            query={query}
            loading={loading}
            totalCount={totalCount}
            showMeta={showMeta}
            showSummary={showSummary}
            showTags={showTags}
            maxTags={maxTags}
            onResultClick={handleResultClick}
            aria-label="Search results"
          />
        )}
      </div>

      {/* Results Meta */}
      {results.length > 0 && (
        <div className={styles.resultsMeta} role="status" aria-live="polite">
          Showing {displayResults.length} of {totalCount} result{totalCount !== 1 ? 's' : ''}
          {query && <span> for "{query}"</span>}
          {limit && results.length > limit && (
            <span>
              {' • '}
              <button 
                onClick={handleViewAll}
                className={styles.viewAllButton}
                aria-label={`View all ${totalCount} results`}
              >
                View all
              </button>
            </span>
          )}
        </div>
      )}

      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {loading && "Searching..."}
        {!loading && results.length > 0 && `Found ${totalCount} results`}
        {!loading && isEmpty && query && "No results found"}
      </div>
    </section>
  );
}