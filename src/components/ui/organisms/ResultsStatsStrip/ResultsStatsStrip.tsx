// src/components/ui/organisms/ResultsStatsStrip/ResultsStatsStrip.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import "./ResultsStatsStrip.css";

// ============================
// TYPE DEFINITIONS
// ============================

export interface StatItem {
  id: string;
  label: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  icon?: string;
  description?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value?: number;
    period?: string;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'custom';
  customColor?: string;
  animationType?: 'counter' | 'none';
  highlight?: boolean;
}

export interface ResultsStatsStripProps {
  /** Array of statistics to display */
  stats: StatItem[];
  /** Title for the stats section */
  title?: string;
  /** Subtitle/description for the stats */
  subtitle?: string;
  /** Layout orientation */
  layout?: 'horizontal' | 'grid';
  /** Animation trigger */
  animateOnScroll?: boolean;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Show dividers between stats */
  showDividers?: boolean;
  /** Show icons */
  showIcons?: boolean;
  /** Show trends */
  showTrends?: boolean;
  /** Show descriptions */
  showDescriptions?: boolean;
  /** Background style */
  background?: 'dark' | 'darker' | 'gradient' | 'transparent';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Center align content */
  centered?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Custom click handler for stats */
  onStatClick?: (stat: StatItem) => void;
}

// ============================
// UTILITY FUNCTIONS
// ============================

const formatNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString();
};

const getStatIcon = (icon: string): string => {
  const iconMap: { [key: string]: string } = {
    'users': '👥',
    'projects': '🚀',
    'years': '📅',
    'clients': '🤝',
    'revenue': '💰',
    'growth': '📈',
    'satisfaction': '⭐',
    'uptime': '⚡',
    'speed': '⚡',
    'security': '🔒',
    'support': '🛟',
    'awards': '🏆',
    'downloads': '⬇️',
    'views': '👁️',
    'likes': '❤️',
    'shares': '🔗',
    'rating': '⭐',
    'countries': '🌍',
    'cities': '🏙️',
    'offices': '🏢',
    'team': '👨‍💼',
    'servers': '🖥️',
    'api': '🔗',
    'integrations': '🔌',
    'automation': '🤖',
    'ai': '🧠',
    'cloud': '☁️',
    'mobile': '📱',
    'web': '🌐',
    'ecommerce': '🛒',
    'analytics': '📊',
    'conversion': '💹',
    'performance': '⚡',
    'roi': '💎',
    'ctr': '🎯',
    'bounce': '↩️',
    'retention': '🔄',
    'nps': '📋',
    'cost': '💵',
    'time': '⏱️',
    'quality': '✨',
    'innovation': '💡',
    'efficiency': '⚙️',
    'scalability': '📏',
    'reliability': '🔧',
    'accessibility': '♿',
    'seo': '🔍',
    'ssl': '🛡️',
    'backup': '💾'
  };
  return iconMap[icon] || '📊';
};

const getTrendIcon = (direction: 'up' | 'down' | 'neutral'): string => {
  const trendMap = {
    'up': '📈',
    'down': '📉',
    'neutral': '➡️'
  };
  return trendMap[direction];
};

const getTrendColor = (direction: 'up' | 'down' | 'neutral'): string => {
  const colorMap = {
    'up': 'var(--color-success, #28A745)',
    'down': 'var(--color-danger, #D7263D)',
    'neutral': 'var(--light-grey, #c9ced1)'
  };
  return colorMap[direction];
};

// ============================
// COUNTER ANIMATION HOOK
// ============================

const useCounterAnimation = (
  endValue: number,
  duration: number = 2000,
  trigger: boolean = false
): number => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!trigger || typeof endValue !== 'number') return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newValue = Math.floor(easeOut * endValue);
      
      setCurrentValue(newValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [endValue, duration, trigger]);

  return currentValue;
};

// ============================
// INTERSECTION OBSERVER HOOK
// ============================

const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
      ...options
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
};

// ============================
// MAIN COMPONENT
// ============================

export const ResultsStatsStrip: React.FC<ResultsStatsStripProps> = ({
  stats,
  title,
  subtitle,
  layout = 'horizontal',
  animateOnScroll = true,
  animationDuration = 2000,
  showDividers = true,
  showIcons = true,
  showTrends = true,
  showDescriptions = false,
  background = 'dark',
  size = 'medium',
  centered = true,
  className = "",
  onStatClick,
}) => {
  // ============================
  // STATE & REFS
  // ============================
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(containerRef);
  const shouldAnimate = animateOnScroll ? isVisible : true;

  // ============================
  // EVENT HANDLERS
  // ============================
  
  const handleStatClick = (stat: StatItem) => {
    if (onStatClick) {
      onStatClick(stat);
    }
  };

  // ============================
  // RENDER HELPERS
  // ============================
  
  const renderStatValue = (stat: StatItem) => {
    const numericValue = typeof stat.value === 'number' ? stat.value : 0;
    const animatedValue = useCounterAnimation(numericValue, animationDuration, shouldAnimate);
    
    if (stat.animationType === 'none' || typeof stat.value === 'string') {
      return stat.value;
    }

    return shouldAnimate ? formatNumber(animatedValue) : formatNumber(numericValue);
  };

  const renderStat = (stat: StatItem, index: number) => {
    const isClickable = !!onStatClick;
    const statColorClass = stat.color === 'custom' ? '' : `stat-${stat.color || 'primary'}`;
    
    return (
      <div
        key={stat.id}
        className={`
          stat-item
          ${statColorClass}
          ${stat.highlight ? 'highlighted' : ''}
          ${isClickable ? 'clickable' : ''}
          ${shouldAnimate ? 'animate-in' : ''}
        `}
        onClick={() => handleStatClick(stat)}
        style={{
          ...(stat.customColor && {
            '--stat-custom-color': stat.customColor
          }),
          animationDelay: shouldAnimate ? `${index * 0.2}s` : '0s'
        }}
      >
        {/* Icon */}
        {showIcons && stat.icon && (
          <div className="stat-icon">
            {getStatIcon(stat.icon)}
          </div>
        )}

        {/* Value */}
        <div className="stat-value-container">
          <div className="stat-value">
            {stat.prefix && <span className="stat-prefix">{stat.prefix}</span>}
            <span className="stat-number">{renderStatValue(stat)}</span>
            {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
          </div>

          {/* Trend */}
          {showTrends && stat.trend && (
            <div 
              className="stat-trend"
              style={{ color: getTrendColor(stat.trend.direction) }}
            >
              <span className="trend-icon">{getTrendIcon(stat.trend.direction)}</span>
              {stat.trend.value && (
                <span className="trend-value">
                  {stat.trend.direction === 'up' ? '+' : stat.trend.direction === 'down' ? '-' : ''}
                  {stat.trend.value}%
                </span>
              )}
              {stat.trend.period && (
                <span className="trend-period">{stat.trend.period}</span>
              )}
            </div>
          )}
        </div>

        {/* Label */}
        <div className="stat-label">{stat.label}</div>

        {/* Description */}
        {showDescriptions && stat.description && (
          <div className="stat-description">{stat.description}</div>
        )}

        {/* Divider */}
        {showDividers && index < stats.length - 1 && layout === 'horizontal' && (
          <div className="stat-divider"></div>
        )}
      </div>
    );
  };

  // ============================
  // MAIN RENDER
  // ============================
  
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <section
      ref={containerRef}
      className={`
        results-stats-strip
        layout-${layout}
        background-${background}
        size-${size}
        ${centered ? 'centered' : ''}
        ${className}
      `}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="stats-header">
          {title && (
            <h2 className="stats-title">{title}</h2>
          )}
          {subtitle && (
            <p className="stats-subtitle">{subtitle}</p>
          )}
        </div>
      )}

      {/* Stats Container */}
      <div className="stats-container">
        <div className="stats-grid">
          {stats.map((stat, index) => renderStat(stat, index))}
        </div>
      </div>

      {/* Background Decorations */}
      <div className="stats-bg-decoration"></div>
    </section>
  );
};

export default ResultsStatsStrip;