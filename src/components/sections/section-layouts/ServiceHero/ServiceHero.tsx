// src/components/sections/section-layouts/ServiceHero/ServiceHero.tsx
"use client";

import React from "react";
import clsx from "clsx";
import HeroWrapper from "@/components/sections/wrappers/HeroWrapper/HeroWrapper";
import Container from "@/components/sections/container/Container/Container";
import { Button } from "@/components/ui/atoms/Button";

// Import the CSS styles
import "./ServiceHero.css";

// ===================================================================
// Types & Interfaces
// ===================================================================

export interface ServiceHeroProps {
  /** Hero title (required) */
  title: string;
  
  /** Optional subtitle */
  subtitle?: string;
   
  /** Optional background media */
  media?: {
    /** Media type */
    type: "image" | "video";
    /** Media source URL */
    src: string;
    /** Alt text for images */
    alt?: string;
    /** Poster image for videos */
    poster?: string;
    /** Fallback image for videos or if video fails */
    fallback?: string;
  };
  
  /** Optional CTA button - only displays if provided */
  button?: {
    /** Button text */
    text: string;
    /** Button link */
    href: string;
  };
  
  /** Additional CSS classes */
  className?: string;
}

// ===================================================================
// ServiceHero Component
// ===================================================================

/**
 * ServiceHero - Minimal hero component for service pages
 * Features:
 * - Clean title + optional subtitle
 * - Optional video/image background with autoplay loop
 * - Optional CTA button (only displays if provided)
 * - Perfect centering with proper z-index stacking
 * - Respects reduced motion preferences
 */
const ServiceHero: React.FC<ServiceHeroProps> = ({
  title,
  subtitle,
  media,
  button,
  className,
}) => {
  // ===================================================================
  // Reduced Motion Detection
  // ===================================================================
  
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    
    return window.matchMedia && 
           window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // ===================================================================
  // Background Configuration
  // ===================================================================

  const backgroundConfig = React.useMemo(() => {
    if (!media) {
      return {
        backgroundType: "gradient" as const,
      };
    }

    if (media.type === "video") {
      return {
        backgroundType: "video" as const,
        videoConfig: {
          src: media.src,
          poster: media.poster,
          fallback: media.fallback,
          autoPlay: !prefersReducedMotion, // Respect user preferences
          muted: true,
          loop: true,
          controls: false,
          preload: "metadata" as const,
        },
      };
    }

    if (media.type === "image") {
      return {
        backgroundType: "image" as const,
        imageConfig: {
          src: media.src,
          alt: media.alt || "Service hero background",
          priority: true,
          quality: 90,
          fit: "cover" as const,
        },
      };
    }

    return {
      backgroundType: "gradient" as const,
    };
  }, [media, prefersReducedMotion]);

  // ===================================================================
  // Render
  // ===================================================================

  return (
    <HeroWrapper
      height="small"
      contentPosition="center"
      overlay={{ 
        enabled: true, 
        opacity: 0.45, 
        color: "rgba(6, 5, 18, 0.55)" 
      }}
      animated={true}
      className={clsx("service-hero", className)}
      ariaLabel={`${title} hero section`}
      {...backgroundConfig}
    >
      <Container size="normal">
        <div className="service-hero-content">
          {/* Title */}
          <h1 className="service-hero-title">
            {title}
          </h1>

          {/* Subtitle - only displays if provided */}
          {subtitle && (
            <p className="service-hero-subtitle">
              {subtitle}
            </p>
          )}

          {/* CTA Button - only displays if provided */}
          {button && (
            <div className="service-hero-actions">
              <Button
                variant="primary"
                size="md"
                href={button.href}
                className="service-hero-button"
                aria-label={`${button.text} - ${title}`}
              >
                {button.text}
              </Button>
            </div>
          )}
        </div>
      </Container>
    </HeroWrapper>
  );
};

// ===================================================================
// Display Name & Export
// ===================================================================

ServiceHero.displayName = "ServiceHero";

export default ServiceHero; 