// ===================================================================
// /src/search/client/highlight.ts
// ===================================================================
// Text highlighting utilities for search results

import React from 'react';

/**
 * Highlight search terms in text with <mark> tags
 */
export function highlightText(
  text: string = '', 
  query: string = '',
  options: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
    className?: string;
    maxLength?: number;
  } = {}
): React.ReactNode {
  if (!text || !query.trim()) {
    return options.maxLength && text.length > options.maxLength 
      ? text.substring(0, options.maxLength) + '...'
      : text;
  }

  const {
    caseSensitive = false,
    wholeWord = false,
    className = '',
    maxLength
  } = options;

  // Truncate text if needed
  const processedText = maxLength && text.length > maxLength 
    ? text.substring(0, maxLength) + '...'
    : text;

  // Escape special regex characters in query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Build regex pattern
  const pattern = wholeWord 
    ? `\\b(${escapedQuery})\\b`
    : `(${escapedQuery})`;
  
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(pattern, flags);

  // Split text by matches
  const parts = processedText.split(regex);
  
  return React.createElement(
    React.Fragment,
    null,
    ...parts.map((part, index) => {
      // Check if this part matches the query
      const isMatch = regex.test(part);
      regex.lastIndex = 0; // Reset regex for next test
      
      if (isMatch) {
        return React.createElement(
          'mark',
          {
            key: index,
            className: className || undefined,
            'data-search-highlight': true
          },
          part
        );
      }
      
      return part;
    })
  );
}

/**
 * Highlight multiple terms with different styling
 */
export function highlightMultipleTerms(
  text: string = '',
  terms: Array<{ term: string; className?: string }>,
  options: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
    maxLength?: number;
  } = {}
): React.ReactNode {
  if (!text || !terms.length) {
    return options.maxLength && text.length > options.maxLength 
      ? text.substring(0, options.maxLength) + '...'
      : text;
  }

  const processedText = options.maxLength && text.length > options.maxLength 
    ? text.substring(0, options.maxLength) + '...'
    : text;

  let result: React.ReactNode[] = [processedText];

  terms.forEach(({ term, className }, termIndex) => {
    const newResult: React.ReactNode[] = [];
    
    result.forEach((part, partIndex) => {
      if (typeof part === 'string') {
        const highlighted = highlightText(part, term, {
          ...options,
          className: className || `highlight-${termIndex}`,
          maxLength: undefined // Already truncated
        });
        newResult.push(highlighted);
      } else {
        newResult.push(part);
      }
    });
    
    result = newResult;
  });

  return React.createElement(React.Fragment, null, ...result);
}

/**
 * Extract and highlight text snippets around matches
 */
export function highlightSnippet(
  text: string = '',
  query: string = '',
  options: {
    snippetLength?: number;
    contextLength?: number;
    className?: string;
    ellipsis?: string;
  } = {}
): React.ReactNode {
  const {
    snippetLength = 150,
    contextLength = 50,
    className = '',
    ellipsis = '...'
  } = options;

  if (!text || !query.trim()) {
    return text.length > snippetLength 
      ? text.substring(0, snippetLength) + ellipsis
      : text;
  }

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const matchIndex = textLower.indexOf(queryLower);

  if (matchIndex === -1) {
    // No match found, return truncated text
    return text.length > snippetLength 
      ? text.substring(0, snippetLength) + ellipsis
      : text;
  }

  // Calculate snippet boundaries
  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(text.length, matchIndex + query.length + contextLength);
  
  let snippet = text.substring(start, end);
  
  // Add ellipsis if truncated
  if (start > 0) snippet = ellipsis + snippet;
  if (end < text.length) snippet = snippet + ellipsis;

  return highlightText(snippet, query, { className });
}

/**
 * Utility to strip highlights from text (for accessibility)
 */
export function stripHighlights(text: string): string {
  return text.replace(/<mark[^>]*>(.*?)<\/mark>/gi, '$1');
}