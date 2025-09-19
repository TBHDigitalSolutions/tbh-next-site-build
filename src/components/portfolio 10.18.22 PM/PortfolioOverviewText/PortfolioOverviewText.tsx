// ===================================================================
// /src/components/portfolio/PortfolioOverviewText/PortfolioOverviewText.tsx
// ===================================================================
// Reusable portfolio overview text component

"use client";

import React from 'react';
import styles from './PortfolioOverviewText.module.css';

export interface PortfolioOverviewTextProps {
  title?: string;
  subtitle?: string;
  paragraphs?: string[];
  variant?: 'default' | 'services' | 'about' | 'marketing';
  className?: string;
  showCTA?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

/**
 * Reusable portfolio overview text component
 * Provides configurable content for different contexts
 */
export default function PortfolioOverviewText({
  title = "Driving Results Across Every Industry",
  subtitle,
  paragraphs,
  variant = 'default',
  className = '',
  showCTA = false,
  ctaText = "View Our Services",
  ctaHref = "/services"
}: PortfolioOverviewTextProps) {
  
  // Default content based on variant
  const getDefaultContent = () => {
    switch (variant) {
      case 'services':
        return [
          "Our comprehensive service portfolio spans web development, video production, SEO, marketing automation, content creation, and lead generation. Each service is designed to drive measurable business growth.",
          "From technical implementation to strategic consulting, we deliver solutions that scale with your business needs and market demands."
        ];
      
      case 'about':
        return [
          "We partner with businesses of all sizes to solve complex digital challenges through strategic thinking and expert execution. Our proven methodologies ensure consistent, measurable outcomes.",
          "Every project reflects our commitment to quality, innovation, and long-term client success across multiple service verticals."
        ];
      
      case 'marketing':
        return [
          "Transform your digital presence with proven strategies that drive engagement, conversions, and growth. Our integrated approach ensures every touchpoint works toward your business goals.",
          "From brand awareness to lead generation, we create cohesive campaigns that deliver results across all channels and customer journey stages."
        ];
      
      default: // 'default' - original portfolio content
        return [
          "Every project in our portfolio represents a unique business challenge solved through strategic thinking and expert execution. From startups to enterprise companies, we've delivered measurable results across web development, video production, SEO, marketing automation, content creation, and lead generation.",
          "Browse by service area or search for specific technologies, industries, or project types to see how we can help your business grow."
        ];
    }
  };

  const content = paragraphs || getDefaultContent();

  return (
    <div className={`${styles.portfolioOverview} ${styles[variant]} ${className}`}>
      {title && (
        <h2 className={styles.title}>{title}</h2>
      )}
      
      {subtitle && (
        <p className={styles.subtitle}>{subtitle}</p>
      )}

      <div className={styles.content}>
        {content.map((paragraph, index) => (
          <p key={index} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>

      {showCTA && (
        <div className={styles.ctaContainer}>
          <a href={ctaHref} className={styles.ctaLink}>
            {ctaText}
          </a>
        </div>
      )}
    </div>
  );
}