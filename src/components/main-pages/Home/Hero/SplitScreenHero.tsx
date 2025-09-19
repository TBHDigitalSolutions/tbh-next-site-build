// src/components/features/home/Hero/SplitScreenHero.tsx

import React from "react";
import Image from "next/image";
import clsx from "clsx";
import "./SplitScreenHero.css";

interface TrustBadge {
  id: string;
  name: string;
  logo: string;
  alt: string;
}

interface StatItem {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface SplitScreenHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  leftContent?: {
    backgroundImage?: string;
    backgroundVideo?: string;
    overlayColor?: string;
    overlayOpacity?: number;
  };
  rightContent?: {
    backgroundImage?: string;
    stats?: StatItem[];
    trustBadges?: TrustBadge[];
    features?: string[];
  };
  className?: string;
  contentSide?: "left" | "right";
  splitRatio?: "50-50" | "60-40" | "40-60";
  mobileLayout?: "stack" | "content-only";
  animationDelay?: number;
}

export const SplitScreenHero: React.FC<SplitScreenHeroProps> = ({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  leftContent,
  rightContent,
  className = "",
  contentSide = "left",
  splitRatio = "50-50",
  mobileLayout = "stack",
  animationDelay = 0,
}) => {
  const renderContent = () => (
    <div className="split-content-section">
      <div className="split-hero-text-content">
        <h1 className="split-hero-title">
          {title}
        </h1>

        {subtitle && (
          <h2 className="split-hero-subtitle">
            {subtitle}
          </h2>
        )}

        {description && (
          <p className="split-hero-description">
            {description}
          </p>
        )}

        {/* Action Buttons */}
        {(primaryCTA || secondaryCTA) && (
          <div className="split-hero-actions">
            {primaryCTA && (
              <a
                href={primaryCTA.href}
                className="split-btn primary"
                onClick={primaryCTA.onClick}
              >
                {primaryCTA.text}
                <span className="btn-arrow">→</span>
              </a>
            )}

            {secondaryCTA && (
              <a
                href={secondaryCTA.href}
                className="split-btn secondary"
                onClick={secondaryCTA.onClick}
              >
                {secondaryCTA.text}
              </a>
            )}
          </div>
        )}

        {/* Statistics */}
        {rightContent?.stats && contentSide === "left" && (
          <div className="split-stats-container">
            {rightContent.stats.map((stat, index) => (
              <div 
                key={index}
                className="split-stat-item"
                style={{ animationDelay: `${animationDelay + index * 0.2}s` }}
              >
                <div className="stat-value">
                  {stat.prefix}{stat.value}{stat.suffix}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Trust Badges */}
        {rightContent?.trustBadges && contentSide === "left" && (
          <div className="split-trust-badges">
            <p className="trust-text">Trusted by</p>
            <div className="trust-badges-grid">
              {rightContent.trustBadges.map((badge, index) => (
                <div 
                  key={badge.id}
                  className="trust-badge"
                  style={{ animationDelay: `${animationDelay + index * 0.1}s` }}
                >
                  <Image
                    src={badge.logo}
                    alt={badge.alt}
                    width={100}
                    height={50}
                    className="trust-logo"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature List */}
        {rightContent?.features && contentSide === "left" && (
          <div className="split-features-list">
            {rightContent.features.map((feature, index) => (
              <div 
                key={index}
                className="feature-item"
                style={{ animationDelay: `${animationDelay + index * 0.15}s` }}
              >
                <span className="feature-checkmark">✓</span>
                <span className="feature-text">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderVisual = (content: typeof leftContent | typeof rightContent) => (
    <div className="split-visual-section">
      <div className="visual-background">
        {content?.backgroundVideo ? (
          <video
            className="visual-video"
            autoPlay
            muted
            loop
            playsInline
            poster={content.backgroundImage}
          >
            <source src={content.backgroundVideo} type="video/mp4" />
          </video>
        ) : content?.backgroundImage ? (
          <Image
            src={content.backgroundImage}
            alt="Split screen visual"
            fill
            className="visual-image"
            sizes="50vw"
          />
        ) : (
          <div className="visual-placeholder">
            <div className="placeholder-shape"></div>
            <div className="placeholder-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="grid-dot"></div>
              ))}
            </div>
          </div>
        )}
        
        {content?.overlayColor && (
          <div 
            className="visual-overlay"
            style={{
              backgroundColor: content.overlayColor,
              opacity: content.overlayOpacity || 0.3,
            }}
          />
        )}
      </div>
    </div>
  );

  return (
    <section 
      className={clsx(
        "split-screen-hero",
        `split-${splitRatio}`,
        `content-${contentSide}`,
        `mobile-${mobileLayout}`,
        className
      )}
    >
      <div className="split-hero-container">
        {/* Left Side */}
        <div className="split-left">
          {contentSide === "left" ? renderContent() : renderVisual(leftContent)}
        </div>

        {/* Right Side */}
        <div className="split-right">
          {contentSide === "right" ? renderContent() : renderVisual(rightContent)}
        </div>
      </div>

      {/* Connecting Line */}
      <div className="split-divider">
        <div className="divider-line"></div>
        <div className="divider-accent"></div>
      </div>

      {/* Background Pattern */}
      <div className="split-background-pattern">
        <div className="pattern-grid">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="pattern-dot"></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SplitScreenHero;