// ===================================================================
// /src/search/ui/EmptyState.tsx
// ===================================================================
// Empty state component for when no search results are found

"use client";

import React from 'react';
import styles from './search.module.css';

export interface EmptyStateProps {
  query?: string;
  title?: string;
  message?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Empty state component for no search results
 */
export default function EmptyState({
  query = '',
  title,
  message,
  suggestions = [],
  onSuggestionClick,
  icon,
  className = ''
}: EmptyStateProps) {
  const defaultTitle = query 
    ? `No results found for "${query}"`
    : 'No results found';

  const defaultMessage = query
    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
    : 'Enter a search term to find content.';

  const defaultIcon = (
    <svg 
      className={styles.emptyStateIcon}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
      />
    </svg>
  );

  const handleSuggestionClick = (suggestion: string) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  return (
    <div className={`${styles.emptyState} ${className}`} role="status">
      {icon || defaultIcon}
      
      <h3 className={styles.emptyStateTitle}>
        {title || defaultTitle}
      </h3>
      
      <p className={styles.emptyStateMessage}>
        {message || defaultMessage}
      </p>

      {suggestions.length > 0 && (
        <div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Try searching for:
          </p>
          <ul className={styles.emptyStateSuggestions}>
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  aria-label={`Search for ${suggestion}`}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}