// src/components/features/home/Hero/MinimalHero.tsx

import React from "react";
import Image from "next/image";
import clsx from "clsx";
import "./MinimalHero.css";

interface MinimalHeroProps {
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
  backgroundImage?: string;
  className?: string;
  layout?: "centered" | "left-aligned" | "split";
  contentWidth?: "narrow" | "normal" | "wide";
  spacing?: "compact" | "normal" | "spacious";
  variant?: "clean" | "gradient" | "bordered";
  showScrollIndicator?: boolean;
}

export const MinimalHero: React.FC<MinimalHeroProps> = ({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  backgroundImage,
  className = "",
  layout = "centered",
  contentWidth = "normal",
  spacing = "normal",
  variant = "clean",
  showScrollIndicator = false,
}) => {
  const handleScrollDown = () => {
    const nextSection = document.querySelector('section:nth-of-type(2)');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className={clsx(
        "minimal-hero",
        `layout-${layout}`,
        `content-${contentWidth}`,
        `spacing-${spacing}`,
        `variant-${variant}`,
        className
      )}
    >
      {/* Background */}
      <div className="minimal-hero-background">
        {backgroundImage && (
          <Image
            src={backgroundImage}
            alt="Hero background"
            fill
            className="hero-background-image"
            priority
            sizes="100vw"
          />
        )}
        <div className="hero-background-overlay" />
      </div>

      {/* Content Container */}
      <div className="minimal-hero-container">
        <div className="minimal-hero-content">
          
          {/* Main Text Content */}
          <div className="hero-text-section">
            <h1 className="minimal-hero-title">
              {title}
            </h1>

            {subtitle && (
              <h2 className="minimal-hero-subtitle">
                {subtitle}
              </h2>
            )}

            {description && (
              <p className="minimal-hero-description">
                {description}
              </p>
            )}

            {/* CTA Section */}
            {(primaryCTA || secondaryCTA) && (
              <div className="minimal-hero-actions">
                {primaryCTA && (
                  <a
                    href={primaryCTA.href}
                    className="minimal-btn primary"
                    onClick={primaryCTA.onClick}
                  >
                    {primaryCTA.text}
                  </a>
                )}

                {secondaryCTA && (
                  <a
                    href={secondaryCTA.href}
                    className="minimal-btn secondary"
                    onClick={secondaryCTA.onClick}
                  >
                    {secondaryCTA.text}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Visual Element for Split Layout */}
          {layout === "split" && (
            <div className="hero-visual-section">
              <div className="visual-placeholder">
                <div className="visual-accent-shape"></div>
                <div className="visual-content-frame">
                  <div className="frame-line frame-line-1"></div>
                  <div className="frame-line frame-line-2"></div>
                  <div className="frame-line frame-line-3"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        {showScrollIndicator && (
          <button 
            className="scroll-indicator"
            onClick={handleScrollDown}
            aria-label="Scroll to next section"
          >
            <div className="scroll-arrow">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="scroll-text">Scroll</span>
          </button>
        )}
      </div>

      {/* Minimal Decorative Elements */}
      <div className="hero-decorative-elements">
        <div className="deco-circle deco-circle-1"></div>
        <div className="deco-circle deco-circle-2"></div>
        <div className="deco-line deco-line-1"></div>
        <div className="deco-line deco-line-2"></div>
      </div>
    </section>
  );
};

export default MinimalHero;