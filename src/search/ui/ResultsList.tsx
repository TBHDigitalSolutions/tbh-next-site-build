// ===================================================================
// /src/search/ui/ResultsList.tsx
// ===================================================================
// Accessible list wrapper for search results

"use client";

import React from 'react';
import ResultCard from './ResultCard';
import type { SearchResult } from '../core/types';
import styles from './search.module.css';

export interface ResultsListProps {
  results: SearchResult[];
  query?: string;
  loading?: boolean;
  totalCount?: number;
  showMeta?: boolean;
  showSummary?: boolean;
  showTags?: boolean;
  maxTags?: number;
  className?: string;
  itemClassName?: string;
  onResultClick?: (result: SearchResult) => void;
  'aria-label'?: string;
}

/**
 * Accessible list wrapper for search results
 */
export default function ResultsList({
  results,
  query = '',
  loading = false,
  totalCount,
  showMeta = true,
  showSummary = true,
  showTags = true,
  maxTags = 3,
  className = '',
  itemClassName = '',
  onResultClick,
  'aria-label': ariaLabel
}: ResultsListProps) {
  if (loading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        Searching...
      </div>
    );
  }

  if (results.length === 0) {
    return null; // Let parent handle empty state
  }

  const defaultAriaLabel = `Search results${totalCount ? ` (${totalCount} total)` : ''}`;

  return (
    <div className={`${styles.searchResults} ${className}`}>
      <ul 
        className={styles.resultsList}
        role="listbox"
        aria-label={ariaLabel || defaultAriaLabel}
        aria-live="polite"
      >
        {results.map((result, index) => (
          <li 
            key={result.id}
            role="option"
            aria-posinset={index + 1}
            aria-setsize={results.length}
            className={itemClassName}
          >
            <ResultCard
              result={result}
              query={query}
              showMeta={showMeta}
              showSummary={showSummary}
              showTags={showTags}
              maxTags={maxTags}
              onClick={onResultClick}
            />
          </li>
        ))}
      </ul>

      {/* Screen reader announcement for total results */}
      {totalCount && totalCount > results.length && (
        <div className="sr-only" aria-live="polite">
          Showing {results.length} of {totalCount} results
        </div>
      )}
    </div>
  );
}