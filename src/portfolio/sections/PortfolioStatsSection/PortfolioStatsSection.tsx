// ===================================================================
// PortfolioStatsSection.tsx - Production Ready Component
// ===================================================================

"use client";

import React, { useState, useCallback, useMemo, useEffect, useRef, useId } from 'react';
import type { 
  PortfolioStatsSectionProps,
  StatItem,
  StatTrend 
} from './PortfolioStatsSection.types';
import { DEFAULTS } from './PortfolioStatsSection.types';
import styles from './PortfolioStatsSection.module.css';

// Counter animation hook
function useCountAnimation(endValue: number, duration = 2000, startDelay = 0): number {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const animate = useCallback(() => {
    if (endValue === 0) return;
    
    setIsAnimating(true);
    const startTime = Date.now() + startDelay;
    const startValue = 0;
    
    const updateCounter = () => {
      const now = Date.now();
      const elapsed = Math.max(0, now - startTime);
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(startValue + (endValue - startValue) * easedProgress);
      
      setCurrentValue(currentVal);
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }, [endValue, duration, startDelay]);
  
  return currentValue;
}

// Intersection Observer hook for triggering animations
function useIntersectionObserver(callback: () => void, options = {}) {
  const targetRef = useRef<HTMLElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  
  useEffect(() => {
    const target = targetRef.current;
    if (!target || hasTriggered) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTriggered) {
          callback();
          setHasTriggered(true);
        }
      },
      { threshold: 0.3, ...options }
    );
    
    observer.observe(target);
    return () => observer.disconnect();
  }, [callback, hasTriggered, options]);
  
  return { targetRef, hasTriggered };
}

// Individual stat item component
interface StatItemComponentProps {
  stat: StatItem;
  index: number;
  variant: string;
  size: string;
  showTrends: boolean;
  showIcons: boolean;
  showHelp: boolean;
  compact: boolean;
  animated: boolean;
  onClick?: (stat: StatItem, index: number) => void;
  onTrendClick?: (trend: StatTrend, stat: StatItem) => void;
}

const StatItemComponent = React.memo(({
  stat,
  index,
  variant,
  size,
  showTrends,
  showIcons,
  showHelp,
  compact,
  animated,
  onClick,
  onTrendClick
}: StatItemComponentProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Handle count animation for numeric values
  const numericValue = typeof stat.value === 'number' ? stat.value : parseFloat(String(stat.value)) || 0;
  const shouldAnimate = animated && stat.animationType !== 'none' && typeof stat.value === 'number';
  const animatedValue = useCountAnimation(numericValue, 2000, index * 200);
  
  const { targetRef, hasTriggered } = useIntersectionObserver(() => {
    // Trigger any additional animations here
  });
  
  const displayValue = shouldAnimate && hasTriggered ? animatedValue : stat.value;
  
  const handleClick = useCallback(() => {
    onClick?.(stat, index);
  }, [stat, index, onClick]);
  
  const handleTrendClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (stat.trend) {
      onTrendClick?.(stat.trend, stat);
    }
  }, [stat, onTrendClick]);
  
  const statItemClasses = [
    styles.statItem,
    stat.className || ''
  ].filter(Boolean).join(' ');
  
  return (
    <div
      ref={targetRef}
      className={statItemClasses}
      data-variant={variant}
      data-size={size}
      data-highlight={stat.highlight}
      data-compact={compact}
      data-animated={animated}
      data-clickable={Boolean(onClick)}
      data-color={stat.color ? 'true' : undefined}
      onClick={onClick ? handleClick : undefined}
      style={{
        '--stat-accent': stat.color,
        animationDelay: animated ? `${index * 0.1}s` : undefined,
      } as React.CSSProperties}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      } : undefined}
      aria-label={`${stat.label}: ${stat.prefix || ''}${displayValue}${stat.suffix || ''}`}
    >
      {/* Help text */}
      {showHelp && stat.helpText && (
        <div 
          className={styles.helpText}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label="Additional information"
        >
          ?
          {showTooltip && (
            <div className={styles.helpTooltip} role="tooltip">
              {stat.helpText}
            </div>
          )}
        </div>
      )}
      
      <div className={styles.statContent}>
        {/* Icon */}
        {showIcons && stat.icon && (
          <div className={styles.statIcon} aria-hidden="true">
            {stat.icon}
          </div>
        )}
        
        {/* Value */}
        <div 
          className={styles.statValue}
          data-size={size}
          data-animation={stat.animationType}
          data-counting={shouldAnimate && hasTriggered && animatedValue < numericValue}
        >
          {stat.prefix}
          {displayValue}
          {stat.suffix}
        </div>
        
        {/* Label */}
        <div className={styles.statLabel} data-size={size}>
          {stat.label}
        </div>
        
        {/* Trend */}
        {showTrends && stat.trend && (
          <div 
            className={styles.statTrend}
            data-direction={stat.trend.direction}
            onClick={onTrendClick ? handleTrendClick : undefined}
            role={onTrendClick ? 'button' : undefined}
            tabIndex={onTrendClick ? 0 : undefined}
          >
            <span className={styles.trendIcon} aria-hidden="true">
              {stat.trend.direction === 'up' ? '↗' : 
               stat.trend.direction === 'down' ? '↘' : '→'}
            </span>
            <span className={styles.trendValue}>
              {stat.trend.value}
            </span>
            {stat.trend.period && (
              <span className={styles.trendPeriod}>
                {stat.trend.period}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

StatItemComponent.displayName = 'StatItemComponent';

// Main component
export default function PortfolioStatsSection({
  // Content
  title,
  subtitle,
  description,
  customStats = [],
  
  // Configuration
  variant = DEFAULTS.variant,
  layout = DEFAULTS.layout,
  size = DEFAULTS.size,
  
  // Display features
  showTrends = DEFAULTS.showTrends,
  showIcons = DEFAULTS.showIcons,
  animated = DEFAULTS.animated,
  showHelp = DEFAULTS.showHelp,
  compact = DEFAULTS.compact,
  
  // Behavior
  onStatClick,
  onTrendClick,
  
  // Analytics
  analyticsContext = DEFAULTS.analyticsContext,
  
  // Accessibility
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  
  // Loading state
  loading = DEFAULTS.loading,
  
  // Background
  background,
  
  // HTML props
  className = '',
  id,
  ...htmlProps
}: PortfolioStatsSectionProps) {
  const componentId = useId();
  const sectionId = id || `portfolio-stats-${componentId}`;
  const headingId = `${sectionId}-heading`;
  
  // Memoized stats processing
  const processedStats = useMemo(() => {
    return customStats.filter(stat => 
      stat && 
      typeof stat.label === 'string' && 
      stat.value !== null && 
      stat.value !== undefined
    );
  }, [customStats]);
  
  // Analytics tracking
  const handleStatClick = useCallback((stat: StatItem, index: number) => {
    onStatClick?.(stat, index);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'stat_click', {
        event_category: 'Portfolio Stats',
        event_label: stat.label,
        stat_variant: variant,
        analytics_context: analyticsContext,
      });
    }
  }, [onStatClick, variant, analyticsContext]);
  
  const handleTrendClick = useCallback((trend: StatTrend, stat: StatItem) => {
    onTrendClick?.(trend, stat);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'trend_click', {
        event_category: 'Portfolio Stats',
        event_label: `${stat.label} trend`,
        trend_direction: trend.direction,
        analytics_context: analyticsContext,
      });
    }
  }, [onTrendClick, analyticsContext]);
  
  // CSS classes
  const sectionClasses = [
    styles.section,
    className
  ].filter(Boolean).join(' ');
  
  // Empty state
  if (!processedStats.length) {
    return (
      <section
        id={sectionId}
        className={sectionClasses}
        data-background={background}
        aria-labelledby={ariaLabelledBy || (title ? headingId : undefined)}
        aria-describedby={ariaDescribedBy}
        {...htmlProps}
      >
        {title && (
          <header className={styles.header}>
            <h2 id={headingId} className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {description && <p className={styles.description}>{description}</p>}
          </header>
        )}
        
        <div className={styles.empty}>
          No statistics available to display.
        </div>
      </section>
    );
  }
  
  return (
    <section
      id={sectionId}
      className={sectionClasses}
      data-background={background}
      data-variant={variant}
      data-compact={compact}
      aria-labelledby={ariaLabelledBy || (title ? headingId : undefined)}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      {...htmlProps}
    >
      {/* Header */}
      {(title || subtitle || description) && (
        <header className={styles.header}>
          {title && <h2 id={headingId} className={styles.title}>{title}</h2>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {description && <p className={styles.description}>{description}</p>}
        </header>
      )}
      
      {/* Stats Grid */}
      <div 
        className={styles.statsContainer}
        data-layout={layout}
        data-compact={compact}
        data-loading={loading}
      >
        {processedStats.map((stat, index) => (
          <StatItemComponent
            key={stat.id}
            stat={stat}
            index={index}
            variant={variant}
            size={size}
            showTrends={showTrends}
            showIcons={showIcons}
            showHelp={showHelp}
            compact={compact}
            animated={animated && !loading}
            onClick={onStatClick ? handleStatClick : undefined}
            onTrendClick={onTrendClick ? handleTrendClick : undefined}
          />
        ))}
      </div>
      
      {/* Screen reader summary */}
      <div className="sr-only" aria-live="polite">
        {processedStats.length} statistics displayed
      </div>
    </section>
  );
}