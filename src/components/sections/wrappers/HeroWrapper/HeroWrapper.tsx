/**
 * HeroWrapper.tsx - Production Ready Hero Section Wrapper
 * =======================================================
 * 
 * A comprehensive hero section wrapper that provides full-bleed layouts
 * with support for video, image, and gradient backgrounds while maintaining
 * accessibility and performance standards.
 * 
 * Features:
 * - Full-bleed edge-to-edge hero sections
 * - Video background support with controls and fallbacks
 * - Image background support with optimization
 * - Gradient and solid color backgrounds
 * - Accessibility compliant with proper ARIA attributes
 * - Performance optimized with lazy loading and preloading
 * - Responsive height variants and content positioning
 * - Theme-aware styling integration
 * - Development debug utilities
 * - Server-side rendering support
 * 
 * Integration:
 * - Works seamlessly with MainContent full-width canvas
 * - Integrates with Container component for content width
 * - Supports TBH Digital Solutions design tokens
 * 
 * @author TBH Digital Solutions
 * @version 2.0.0
 */

"use client";

import * as React from "react";
import clsx from "clsx";
import Image from "next/image";

// ===================================================================
// Types & Interfaces
// ===================================================================

/**
 * Hero height variants
 */
export type HeroHeight = 
  | "auto"      // Auto height based on content
  | "small"     // 50vh minimum
  | "medium"    // 70vh minimum  
  | "large"     // 85vh minimum
  | "full"      // 100vh minimum
  | "custom";   // Use minHeight prop

/**
 * Hero background types
 */
export type HeroBackgroundType = 
  | "none"      // No background
  | "gradient"  // CSS gradient background
  | "solid"     // Solid color background
  | "image"     // Static image background
  | "video";    // Video background

/**
 * Content positioning within hero
 */
export type HeroContentPosition = 
  | "center"    // Centered vertically and horizontally
  | "top"       // Top of hero section
  | "bottom"    // Bottom of hero section
  | "left"      // Left side
  | "right"     // Right side
  | "custom";   // Custom positioning via CSS

/**
 * Hero overlay configuration
 */
export interface HeroOverlay {
  /** Enable overlay */
  enabled: boolean;
  /** Overlay color (CSS color value) */
  color?: string;
  /** Overlay opacity (0-1) */
  opacity?: number;
  /** Blend mode for overlay */
  blendMode?: "normal" | "multiply" | "overlay" | "screen" | "darken" | "lighten";
}

/**
 * Video background configuration
 */
export interface HeroVideoConfig {
  /** Video source URL */
  src: string;
  /** Poster image for video */
  poster?: string;
  /** Fallback image if video fails */
  fallback?: string;
  /** Auto-play video */
  autoPlay?: boolean;
  /** Mute video */
  muted?: boolean;
  /** Loop video */
  loop?: boolean;
  /** Show video controls */
  controls?: boolean;
  /** Preload strategy */
  preload?: "none" | "metadata" | "auto";
}

/**
 * Image background configuration
 */
export interface HeroImageConfig {
  /** Image source URL */
  src: string;
  /** Alt text for image */
  alt?: string;
  /** Image priority for loading */
  priority?: boolean;
  /** Image quality (1-100) */
  quality?: number;
  /** Object fit behavior */
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  /** Object position */
  position?: string;
}

export interface HeroWrapperProps extends React.HTMLAttributes<HTMLElement> {
  /** Content to display in hero */
  children: React.ReactNode;
  
  /** HTML element to render */
  as?: keyof JSX.IntrinsicElements;
  
  /** Hero height variant */
  height?: HeroHeight;
  
  /** Custom minimum height (requires height="custom") */
  minHeight?: string;
  
  /** Background configuration */
  backgroundType?: HeroBackgroundType;
  
  /** Video background configuration */
  videoConfig?: HeroVideoConfig;
  
  /** Image background configuration */
  imageConfig?: HeroImageConfig;
  
  /** Background gradient (CSS gradient) */
  backgroundGradient?: string;
  
  /** Background color (CSS color) */
  backgroundColor?: string;
  
  /** Overlay configuration */
  overlay?: HeroOverlay;
  
  /** Content positioning */
  contentPosition?: HeroContentPosition;
  
  /** Enable parallax effect for background */
  parallax?: boolean;
  
  /** Enable entrance animations */
  animated?: boolean;
  
  /** Accessibility label for hero section */
  ariaLabel?: string;
  
  /** Landmark role override */
  role?: string;
  
  /** Enable development debug mode */
  debug?: boolean;
  
  /** Performance optimization hints */
  contain?: "layout" | "style" | "paint" | "strict" | "content";
  
  /** Disable intersection observer optimizations */
  disableOptimizations?: boolean;
}

// ===================================================================
// Constants
// ===================================================================

const HERO_HEIGHTS: Record<Exclude<HeroHeight, "custom">, string> = {
  auto: "auto",
  small: "50vh",
  medium: "70vh", 
  large: "85vh",
  full: "100vh",
};

const CONTENT_POSITIONS: Record<Exclude<HeroContentPosition, "custom">, string> = {
  center: "center",
  top: "flex-start",
  bottom: "flex-end",
  left: "flex-start",
  right: "flex-end",
};

const DEFAULT_OVERLAY: HeroOverlay = {
  enabled: false,
  color: "rgba(6, 5, 18, 0.4)",
  opacity: 0.4,
  blendMode: "normal",
};

const DEBUG_BORDER_STYLE = "2px dashed #8b5cf6";

// ===================================================================
// Utility Functions
// ===================================================================

/**
 * Get height value for hero variant
 */
const getHeroHeight = (height: HeroHeight, customHeight?: string): string => {
  if (height === "custom" && customHeight) {
    return customHeight;
  }
  return HERO_HEIGHTS[height as Exclude<HeroHeight, "custom">] || HERO_HEIGHTS.medium;
};

/**
 * Get content positioning styles
 */
const getContentPositionStyle = (position: HeroContentPosition): React.CSSProperties => {
  if (position === "custom") return {};
  
  const justifyContent = CONTENT_POSITIONS[position as Exclude<HeroContentPosition, "custom">];
  
  switch (position) {
    case "center":
      return { justifyContent: "center", alignItems: "center" };
    case "top":
      return { justifyContent: "center", alignItems: "flex-start" };
    case "bottom":
      return { justifyContent: "center", alignItems: "flex-end" };
    case "left":
      return { justifyContent: "flex-start", alignItems: "center" };
    case "right":
      return { justifyContent: "flex-end", alignItems: "center" };
    default:
      return { justifyContent: "center", alignItems: "center" };
  }
};

// ===================================================================
// Video Background Component
// ===================================================================

const VideoBackground: React.FC<{
  config: HeroVideoConfig;
  overlay: HeroOverlay;
  debug?: boolean;
}> = ({ config, overlay, debug }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoad = () => setIsLoaded(true);
    const handleError = () => setHasError(true);

    video.addEventListener("loadeddata", handleLoad);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadeddata", handleLoad);
      video.removeEventListener("error", handleError);
    };
  }, []);

  // Show fallback if video fails or hasn't loaded
  if (hasError || (!isLoaded && config.fallback)) {
    return (
      <div className="hero-media-container">
        <Image
          src={config.fallback!}
          alt="Hero background"
          fill
          className="hero-fallback-image"
          style={{ objectFit: "cover" }}
          priority
          sizes="100vw"
        />
        {overlay.enabled && (
          <div 
            className="hero-overlay"
            style={{
              backgroundColor: overlay.color,
              opacity: overlay.opacity,
              mixBlendMode: overlay.blendMode,
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="hero-media-container">
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay={config.autoPlay}
        muted={config.muted}
        loop={config.loop}
        playsInline
        controls={config.controls}
        poster={config.poster}
        preload={config.preload || "metadata"}
        style={{ objectFit: "cover" }}
        aria-hidden="true"
      >
        <source src={config.src} type="video/mp4" />
        {debug && <p>Your browser does not support the video tag.</p>}
      </video>
      
      {overlay.enabled && (
        <div 
          className="hero-overlay"
          style={{
            backgroundColor: overlay.color,
            opacity: overlay.opacity,
            mixBlendMode: overlay.blendMode,
          }}
        />
      )}
    </div>
  );
};

// ===================================================================
// Image Background Component
// ===================================================================

const ImageBackground: React.FC<{
  config: HeroImageConfig;
  overlay: HeroOverlay;
  parallax?: boolean;
}> = ({ config, overlay, parallax }) => {
  return (
    <div className={clsx("hero-media-container", parallax && "hero-parallax")}>
      <Image
        src={config.src}
        alt={config.alt || "Hero background"}
        fill
        className="hero-image"
        style={{ 
          objectFit: config.fit || "cover",
          objectPosition: config.position || "center",
        }}
        priority={config.priority}
        quality={config.quality || 90}
        sizes="100vw"
      />
      
      {overlay.enabled && (
        <div 
          className="hero-overlay"
          style={{
            backgroundColor: overlay.color,
            opacity: overlay.opacity,
            mixBlendMode: overlay.blendMode,
          }}
        />
      )}
    </div>
  );
};

// ===================================================================
// HeroWrapper Component
// ===================================================================

/**
 * HeroWrapper provides a full-bleed hero section with flexible background options
 */
const HeroWrapper = React.memo<HeroWrapperProps>(({
  children,
  as: Tag = "section",
  height = "medium",
  minHeight,
  backgroundType = "gradient",
  videoConfig,
  imageConfig,
  backgroundGradient,
  backgroundColor,
  overlay = DEFAULT_OVERLAY,
  contentPosition = "center",
  parallax = false,
  animated = true,
  ariaLabel,
  role = "banner",
  debug = false,
  contain,
  disableOptimizations = false,
  className,
  style,
  ...rest
}) => {
  // ===================================================================
  // State & Refs
  // ===================================================================
  
  const heroRef = React.useRef<HTMLElement>(null);
  const [isInView, setIsInView] = React.useState(disableOptimizations);

  // ===================================================================
  // Intersection Observer for Performance
  // ===================================================================
  
  React.useEffect(() => {
    if (disableOptimizations) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [disableOptimizations]);

  // ===================================================================
  // Computed Values
  // ===================================================================

  const heroHeight = React.useMemo(() => {
    return getHeroHeight(height, minHeight);
  }, [height, minHeight]);

  const contentPositionStyle = React.useMemo(() => {
    return getContentPositionStyle(contentPosition);
  }, [contentPosition]);

  const mergedOverlay = React.useMemo(() => {
    return { ...DEFAULT_OVERLAY, ...overlay };
  }, [overlay]);

  // ===================================================================
  // Computed Styles
  // ===================================================================

  const computedStyle = React.useMemo(() => {
    const styles: React.CSSProperties = {
      ...style,
      minHeight: heroHeight,
    };

    // Background styles
    if (backgroundType === "gradient" && backgroundGradient) {
      styles.background = backgroundGradient;
    } else if (backgroundType === "solid" && backgroundColor) {
      styles.backgroundColor = backgroundColor;
    }

    // Content positioning
    Object.assign(styles, contentPositionStyle);

    // Performance optimizations
    if (contain) {
      styles.contain = contain;
    }

    // Debug mode styling
    if (debug && process.env.NODE_ENV === "development") {
      styles.border = DEBUG_BORDER_STYLE;
      styles.position = "relative";
    }

    return styles;
  }, [
    style,
    heroHeight,
    backgroundType,
    backgroundGradient,
    backgroundColor,
    contentPositionStyle,
    contain,
    debug,
  ]);

  // ===================================================================
  // Background Rendering
  // ===================================================================

  const renderBackground = React.useMemo(() => {
    // Only render background if in view (performance optimization)
    if (!isInView && !disableOptimizations) {
      return null;
    }

    switch (backgroundType) {
      case "video":
        return videoConfig ? (
          <VideoBackground 
            config={videoConfig} 
            overlay={mergedOverlay}
            debug={debug}
          />
        ) : null;
        
      case "image":
        return imageConfig ? (
          <ImageBackground 
            config={imageConfig} 
            overlay={mergedOverlay}
            parallax={parallax}
          />
        ) : null;
        
      case "gradient":
      case "solid":
        return mergedOverlay.enabled ? (
          <div 
            className="hero-overlay"
            style={{
              backgroundColor: mergedOverlay.color,
              opacity: mergedOverlay.opacity,
              mixBlendMode: mergedOverlay.blendMode,
            }}
          />
        ) : null;
        
      default:
        return null;
    }
  }, [
    isInView,
    disableOptimizations,
    backgroundType,
    videoConfig,
    imageConfig,
    mergedOverlay,
    parallax,
    debug,
  ]);

  // ===================================================================
  // Debug Overlay
  // ===================================================================

  const debugOverlay = React.useMemo(() => {
    if (!debug || process.env.NODE_ENV !== "development") {
      return null;
    }

    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "30px",
          background: "rgba(139, 92, 246, 0.1)",
          color: "#8b5cf6",
          fontSize: "11px",
          padding: "4px 8px",
          fontFamily: "monospace",
          zIndex: 9999,
          borderBottom: "1px solid #8b5cf6",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        HeroWrapper [{height}] {backgroundType} | position: {contentPosition} | overlay: {mergedOverlay.enabled ? "on" : "off"}
      </div>
    );
  }, [debug, height, backgroundType, contentPosition, mergedOverlay.enabled]);

  // ===================================================================
  // Development Logging
  // ===================================================================

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development" && debug) {
      console.log("HeroWrapper initialized:", {
        height: heroHeight,
        backgroundType,
        contentPosition,
        overlay: mergedOverlay,
        element: Tag,
        optimizations: !disableOptimizations,
      });
    }
  }, [heroHeight, backgroundType, contentPosition, mergedOverlay, Tag, disableOptimizations, debug]);

  // ===================================================================
  // Render
  // ===================================================================

  return (
    <Tag
      {...rest}
      ref={heroRef}
      role={role}
      data-hero="true"
      data-background-type={backgroundType}
      data-height={height}
      className={clsx(
        // Core hero classes
        "hero-section",
        // Height variant class
        height !== "custom" && `hero-${height}`,
        // Background type class
        `hero-bg-${backgroundType}`,
        // Content position class
        contentPosition !== "custom" && `hero-content-${contentPosition}`,
        // Animation class
        animated && "hero-animated",
        // Parallax class
        parallax && "hero-parallax",
        // Debug mode class
        debug && process.env.NODE_ENV === "development" && "hero-debug",
        // Custom classes
        className
      )}
      style={computedStyle}
      aria-label={ariaLabel || "Hero section"}
      data-testid="hero-wrapper"
    >
      {debugOverlay}
      
      {/* Background Layer */}
      {renderBackground}
      
      {/* Content Layer */}
      <div className="hero-content-container">
        {children}
      </div>
    </Tag>
  );
});

// ===================================================================
// Display Name & Exports
// ===================================================================

HeroWrapper.displayName = "HeroWrapper";

export default HeroWrapper;

// ===================================================================
// Type Exports
// ===================================================================

export type {
  HeroWrapperProps,
  HeroHeight,
  HeroBackgroundType,
  HeroContentPosition,
  HeroOverlay,
  HeroVideoConfig,
  HeroImageConfig,
};

// ===================================================================
// Utility Exports
// ===================================================================

/**
 * Create hero background configuration
 */
export const createHeroBackground = {
  video: (config: Partial<HeroVideoConfig>): { backgroundType: "video"; videoConfig: HeroVideoConfig } => ({
    backgroundType: "video",
    videoConfig: {
      src: "",
      autoPlay: true,
      muted: true,
      loop: true,
      preload: "metadata",
      ...config,
    },
  }),
  
  image: (config: Partial<HeroImageConfig>): { backgroundType: "image"; imageConfig: HeroImageConfig } => ({
    backgroundType: "image", 
    imageConfig: {
      src: "",
      alt: "Hero background",
      priority: true,
      quality: 90,
      fit: "cover",
      ...config,
    },
  }),
  
  gradient: (gradient: string): { backgroundType: "gradient"; backgroundGradient: string } => ({
    backgroundType: "gradient",
    backgroundGradient: gradient,
  }),
  
  solid: (color: string): { backgroundType: "solid"; backgroundColor: string } => ({
    backgroundType: "solid",
    backgroundColor: color,
  }),
};

/**
 * Create hero overlay configuration
 */
export const createHeroOverlay = (config: Partial<HeroOverlay>): HeroOverlay => ({
  ...DEFAULT_OVERLAY,
  ...config,
});

/**
 * Hook for hero viewport detection
 */
export const useHeroInView = (threshold = 0.5) => {
  const [isInView, setIsInView] = React.useState(false);
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView] as const;
};

// ===================================================================
// Development Utilities
// ===================================================================

if (process.env.NODE_ENV === "development") {
  // Add development-only utilities
  (HeroWrapper as any).__docgenInfo = {
    description: "Full-bleed hero section wrapper with video, image, and gradient support",
    props: {
      children: { description: "Hero content", required: true },
      height: { 
        description: "Hero height variant", 
        type: "auto | small | medium | large | full | custom",
        defaultValue: "medium"
      },
      backgroundType: { 
        description: "Background type", 
        type: "none | gradient | solid | image | video",
        defaultValue: "gradient"
      },
      contentPosition: { 
        description: "Content positioning", 
        type: "center | top | bottom | left | right | custom",
        defaultValue: "center"
      },
      overlay: { 
        description: "Overlay configuration", 
        type: "HeroOverlay"
      },
      debug: { 
        description: "Enable development debug mode", 
        type: "boolean",
        defaultValue: false
      },
    },
  };
}