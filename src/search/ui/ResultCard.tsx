// ===================================================================
// /src/search/ui/ResultCard.tsx
// ===================================================================
// Individual search result card component

"use client";

import React from 'react';
import Link from 'next/link';
import { highlightText } from '../client/highlight';
import type { SearchResult } from '../core/types';
import styles from './search.module.css';

export interface ResultCardProps {
  result: SearchResult;
  query?: string;
  showMeta?: boolean;
  showSummary?: boolean;
  showTags?: boolean;
  maxTags?: number;
  className?: string;
  titleClassName?: string;
  summaryClassName?: string;
  metaClassName?: string;
  onClick?: (result: SearchResult) => void;
}

/**
 * Individual search result card component
 */
export default function ResultCard({
  result,
  query = '',
  showMeta = true,
  showSummary = true,
  showTags = true,
  maxTags = 3,
  className = '',
  titleClassName = '',
  summaryClassName = '',
  metaClassName = '',
  onClick
}: ResultCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(result);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const getBadgeClass = (type: string) => {
    return `${styles.resultBadge} ${styles[type] || ''}`;
  };

  const displayTags = showTags && result.tags 
    ? result.tags.slice(0, maxTags)
    : [];

  return (
    <article 
      className={`${styles.resultCard} ${className}`}
      onClick={handleClick}
    >
      <Link 
        href={result.path}
        className={`${styles.resultTitle} ${titleClassName}`}
        aria-describedby={`result-${result.id}-summary`}
      >
        {result.highlights?.title ? (
          <span dangerouslySetInnerHTML={{ __html: result.highlights.title }} />
        ) : (
          highlightText(result.title, query)
        )}
      </Link>

      {showSummary && result.summary && (
        <p 
          id={`result-${result.id}-summary`}
          className={`${styles.resultSummary} ${summaryClassName}`}
        >
          {result.highlights?.summary ? (
            <span dangerouslySetInnerHTML={{ __html: result.highlights.summary }} />
          ) : (
            highlightText(result.summary, query, { maxLength: 150 })
          )}
        </p>
      )}

      {showMeta && (
        <div className={`${styles.resultMeta} ${metaClassName}`}>
          {/* Content type badge */}
          <span className={getBadgeClass(result.type)}>
            {result.type === 'case-study' ? 'Case Study' : 
             result.type.charAt(0).toUpperCase() + result.type.slice(1)}
          </span>

          {/* Featured badge */}
          {result.featured && (
            <span className={getBadgeClass('featured')}>
              Featured
            </span>
          )}

          {/* Service key */}
          {result.serviceKey && (
            <span className={styles.resultBadge}>
              {result.serviceKey.charAt(0).toUpperCase() + result.serviceKey.slice(1)}
            </span>
          )}

          {/* Category */}
          {result.category && result.category !== result.serviceKey && (
            <span className={styles.resultBadge}>
              {result.category.charAt(0).toUpperCase() + result.category.slice(1)}
            </span>
          )}

          {/* Date */}
          {result.date && (
            <time 
              dateTime={result.date}
              className={styles.resultBadge}
            >
              {formatDate(result.date)}
            </time>
          )}

          {/* Score (for debugging) */}
          {process.env.NODE_ENV === 'development' && result.score && (
            <span className={styles.resultBadge}>
              Score: {result.score.toFixed(2)}
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {displayTags.length > 0 && (
        <div className={styles.resultMeta} style={{ marginTop: '0.5rem' }}>
          {displayTags.map((tag, index) => (
            <span key={index} className={styles.resultBadge}>
              {result.highlights?.tags?.[index] ? (
                <span dangerouslySetInnerHTML={{ __html: result.highlights.tags[index] }} />
              ) : (
                highlightText(tag, query)
              )}
            </span>
          ))}
          {result.tags && result.tags.length > maxTags && (
            <span className={styles.resultBadge}>
              +{result.tags.length - maxTags} more
            </span>
          )}
        </div>
      )}
    </article>
  );
}