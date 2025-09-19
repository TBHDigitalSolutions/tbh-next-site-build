// src/components/ui/organisms/StatsStrip/StatsStrip.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./StatsStrip.module.css";
import type { StatsStripProps, StatItem } from "./StatsStrip.types";

export const StatsStrip: React.FC<StatsStripProps> = ({
  stats,
  variant = "default",
  layout = "horizontal",
  animated = true,
  showIcons = true,
  showDescriptions = false,
  backgroundColor,
  textColor,
  spacing = "normal",
  alignment = "center",
  className = "",
  onStatClick,
  loading = false,
  error,
  maxItems,
  showCarouselControls = false,
  autoPlay = false,
  autoPlayInterval = 3000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});
  const stripRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (!animated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          animateNumbers();
        }
      },
      { threshold: 0.1 }
    );

    if (stripRef.current) {
      observer.observe(stripRef.current);
    }

    return () => observer.disconnect();
  }, [animated]);

  // Number animation function
  const animateNumbers = () => {
    stats.forEach((stat) => {
      if (stat.animate !== false && typeof stat.value === "number") {
        let start = 0;
        const end = stat.value;
        const duration = 2000; // 2 seconds
        const increment = end / (duration / 16); // 60fps

        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            start = end;
            clearInterval(timer);
          }
          setAnimatedValues((prev) => ({ ...prev, [stat.id]: Math.floor(start) }));
        }, 16);
      }
    });
  };

  // Format stat value for display
  const formatStatValue = (stat: StatItem): string => {
    const value = animated && typeof stat.value === "number" 
      ? animatedValues[stat.id] || 0 
      : stat.value;
    
    return `${stat.prefix || ""}${value}${stat.suffix || ""}`;
  };

  // Get icon element
  const renderIcon = (stat: StatItem) => {
    if (!showIcons || !stat.icon) return null;

    return (
      <div className={styles.statIcon}>
        <ion-icon name={stat.icon}></ion-icon>
      </div>
    );
  };

  // Handle stat click
  const handleStatClick = (stat: StatItem) => {
    if (stat.href) {
      window.open(stat.href, stat.target || "_self");
    }
    if (onStatClick) {
      onStatClick(stat);
    }
  };

  // Limit stats if maxItems is specified
  const displayStats = maxItems ? stats.slice(0, maxItems) : stats;

  // Loading state
  if (loading) {
    return (
      <div className={`${styles.statsStrip} ${styles.loading} ${className}`}>
        <div className={styles.statsContainer}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonStat}>
              <div className={styles.skeletonValue}></div>
              <div className={styles.skeletonLabel}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${styles.statsStrip} ${styles.error} ${className}`}>
        <div className={styles.errorMessage}>
          <ion-icon name="alert-circle-outline"></ion-icon>
          <span>Error loading stats: {error}</span>
        </div>
      </div>
    );
  }

  // Custom styles
  const customStyles = {
    backgroundColor,
    color: textColor,
  };

  return (
    <div
      ref={stripRef}
      className={`
        ${styles.statsStrip}
        ${styles[variant]}
        ${styles[layout]}
        ${styles[spacing]}
        ${styles[alignment]}
        ${isVisible ? styles.visible : ""}
        ${className}
      `}
      style={customStyles}
    >
      <div className={styles.statsContainer}>
        {displayStats.map((stat, index) => (
          <div
            key={stat.id}
            className={`
              ${styles.statItem}
              ${stat.color ? styles[stat.color] : ""}
              ${stat.href || onStatClick ? styles.clickable : ""}
            `}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleStatClick(stat)}
            role={stat.href || onStatClick ? "button" : undefined}
            tabIndex={stat.href || onStatClick ? 0 : undefined}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && (stat.href || onStatClick)) {
                e.preventDefault();
                handleStatClick(stat);
              }
            }}
          >
            {renderIcon(stat)}
            
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {formatStatValue(stat)}
              </div>
              
              <div className={styles.statLabel}>
                {stat.label}
              </div>
              
              {showDescriptions && stat.description && (
                <div className={styles.statDescription}>
                  {stat.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};