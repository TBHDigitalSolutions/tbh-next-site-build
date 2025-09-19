// ===================================================================
// PortfolioOverviewText.tsx - Production Ready Component
// ===================================================================

import React, { useState, useCallback, useId } from 'react';
import type { PortfolioOverviewTextProps } from './PortfolioOverviewText.types';
import { DEFAULTS } from './PortfolioOverviewText.types';
import styles from './PortfolioOverviewText.module.css';

export default function PortfolioOverviewText({
  // Content
  title,
  subtitle,
  paragraphs = [],
  
  // Configuration
  variant = DEFAULTS.variant,
  size = DEFAULTS.size,
  align = DEFAULTS.align,
  maxWidth,
  
  // CTA
  showCTA = false,
  ctaText,
  ctaHref,
  ctaTarget = DEFAULTS.ctaTarget,
  ctaRel,
  ctaAriaLabel,
  ctaVariant = DEFAULTS.ctaVariant,
  
  // Interactive features
  showReadMore = DEFAULTS.showReadMore,
  readMoreText = DEFAULTS.readMoreText,
  readLessText = DEFAULTS.readLessText,
  truncateAt = DEFAULTS.truncateAt,
  
  // Behavior callbacks
  onCTAClick,
  onReadMoreToggle,
  
  // Accessibility
  headingLevel = DEFAULTS.headingLevel,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  
  // HTML props
  className = '',
  style,
  ...htmlProps
}: PortfolioOverviewTextProps) {
  const componentId = useId();
  const [isExpanded, setIsExpanded] = useState(false);

  // Content processing
  const validParagraphs = paragraphs.filter(p => typeof p === 'string' && p.trim());
  const hasContent = title || subtitle || validParagraphs.length > 0;
  
  // Read more functionality
  const fullText = validParagraphs.join(' ');
  const shouldTruncate = showReadMore && fullText.length > truncateAt;
  const displayText = shouldTruncate && !isExpanded 
    ? fullText.substring(0, truncateAt).trim()
    : fullText;

  // Event handlers
  const handleCTAClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    onCTAClick?.(event);
    
    // Analytics tracking could go here
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'cta_click', {
        event_category: 'Portfolio Overview Text',
        event_label: ctaText || ctaHref,
        text_variant: variant,
      });
    }
  }, [onCTAClick, ctaText, ctaHref, variant]);

  const handleReadMoreToggle = useCallback(() => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onReadMoreToggle?.(newExpanded);
  }, [isExpanded, onReadMoreToggle]);

  // Dynamic heading component
  const HeadingComponent = `h${headingLevel}` as keyof JSX.IntrinsicElements;

  // CSS classes
  const containerClasses = [
    styles.container,
    maxWidth ? styles.constrainedWidth : '',
    className
  ].filter(Boolean).join(' ');

  // Inline styles
  const containerStyle = {
    ...style,
    ...(maxWidth && { '--max-content-width': maxWidth })
  } as React.CSSProperties;

  // Empty state
  if (!hasContent && !showCTA) {
    return (
      <div 
        className={styles.empty}
        aria-label="No content available"
      >
        No content to display
      </div>
    );
  }

  return (
    <div
      className={containerClasses}
      style={containerStyle}
      data-variant={variant}
      data-size={size}
      data-align={align}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
      {...htmlProps}
    >
      {/* Header Section */}
      {(title || subtitle) && (
        <header className={styles.header}>
          {title && (
            <HeadingComponent 
              className={styles.title}
              data-size={size}
            >
              {title}
            </HeadingComponent>
          )}
          {subtitle && (
            <p 
              className={styles.subtitle}
              data-size={size}
            >
              {subtitle}
            </p>
          )}
        </header>
      )}

      {/* Content Section */}
      {validParagraphs.length > 0 && (
        <div className={styles.content}>
          {shouldTruncate ? (
            <div>
              <div 
                className={isExpanded ? '' : styles.truncated}
                aria-expanded={isExpanded}
                aria-describedby={`${componentId}-readmore`}
              >
                {isExpanded ? (
                  validParagraphs.map((paragraph, index) => (
                    <p 
                      key={index}
                      className={styles.paragraph}
                      data-size={size}
                    >
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p 
                    className={styles.paragraph}
                    data-size={size}
                  >
                    {displayText}
                  </p>
                )}
              </div>
              
              <button
                id={`${componentId}-readmore`}
                className={styles.readMoreButton}
                onClick={handleReadMoreToggle}
                aria-label={isExpanded ? readLessText : readMoreText}
                type="button"
              >
                {isExpanded ? readLessText : readMoreText}
              </button>
            </div>
          ) : (
            validParagraphs.map((paragraph, index) => (
              <p 
                key={index}
                className={styles.paragraph}
                data-size={size}
              >
                {paragraph}
              </p>
            ))
          )}
        </div>
      )}

      {/* CTA Section */}
      {showCTA && ctaText && ctaHref && (
        <div className={styles.ctaSection}>
          <a
            href={ctaHref}
            target={ctaTarget}
            rel={ctaRel}
            className={styles.cta}
            data-variant={ctaVariant}
            onClick={handleCTAClick}
            aria-label={ctaAriaLabel || `${ctaText} (${ctaTarget === '_blank' ? 'opens in new tab' : 'current tab'})`}
          >
            {ctaText}
            <svg 
              className={styles.ctaIcon}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              aria-hidden="true"
              focusable="false"
            >
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}