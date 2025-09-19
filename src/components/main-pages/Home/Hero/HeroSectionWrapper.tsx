// src/components/features/home/Hero/HeroSectionWrapper.tsx

import React from "react";
import Image from "next/image";
import clsx from "clsx";
import "./HeroSectionWrapper.css";

export interface HeroSectionWrapperProps {
  /** Required heading for accessibility and SEO */
  title: string;
  /** Optional supporting copy */
  subtitle?: string;
  /** Slot for inner hero variant content (CTAs, stats, etc.) */
  children?: React.ReactNode;

  /** Alignment of the hero content block */
  align?: "center" | "left" | "right";
  /** Additional class names to extend styling */
  className?: string;

  /** Optional full-bleed background image */
  backgroundImage?: string;
  /** Alt text for the background image (decorative; defaults appropriately) */
  imageAlt?: string;

  /** Enables the tinted overlay layer (works with/without bg image) */
  overlay?: boolean;
  /** Opacity for the overlay layer (0–1); passed to CSS var */
  overlayOpacity?: number;

  /** Height presets */
  height?: "hero-min-height" | "hero-full-height" | "hero-medium-height";
  /** Background surface variant when no image is used */
  backgroundVariant?: "gradient" | "solid";
  /** Max-width of inner content block */
  contentWidth?: "normal" | "wide" | "narrow";
  /** Outer padding scale */
  spacing?: "normal" | "large" | "small";

  /** Optional id (useful for in-page links); auto-generated if not provided */
  id?: string;
}

const HeroSectionWrapper: React.FC<HeroSectionWrapperProps> = ({
  title,
  subtitle,
  children,

  align = "center",
  className = "",

  backgroundImage,
  imageAlt = "Decorative hero background",

  overlay = true,
  overlayOpacity, // <= exposed to CSS via --hero-overlay-opacity

  height = "hero-min-height",
  backgroundVariant = "gradient",
  contentWidth = "normal",
  spacing = "normal",

  id,
}) => {
  const alignmentClass = `align-${align}`;
  const backgroundClass = `hero-bg-${backgroundVariant}`;
  const contentWidthClass = contentWidth !== "normal" ? `hero-content-${contentWidth}` : "";
  const spacingClass = spacing !== "normal" ? `hero-spacing-${spacing}` : "";

  // Label the section by its heading for accessibility
  const headingId = React.useId();
  const sectionId = id;

  // Inline CSS var to control overlay opacity
  const wrapperStyle: React.CSSProperties | undefined =
    typeof overlayOpacity === "number"
      ? ({ ["--hero-overlay-opacity" as any]: String(overlayOpacity) } as React.CSSProperties)
      : undefined;

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      className={clsx("hero-section-wrapper", height, backgroundClass, spacingClass, className)}
      style={wrapperStyle}
    >
      {/* Background layer (image optional) */}
      <div className="hero-background" aria-hidden="true">
        {backgroundImage ? (
          <Image
            src={backgroundImage}
            alt={imageAlt}
            fill
            className="hero-image"
            priority
            sizes="100vw"
          />
        ) : null}
      </div>

      {/* Brand overlay (works with/without image). Non-blocking for pointer events */}
      {overlay && <div className="hero-overlay" aria-hidden="true" />}

      {/* Foreground content */}
      <div className={clsx("hero-foreground", alignmentClass)}>
        <div className={clsx("hero-content", alignmentClass, contentWidthClass)}>
          <h1 id={headingId} className="hero-title">
            {title}
          </h1>

          {subtitle && <p className="hero-subtitle">{subtitle}</p>}

          {children && <div className="hero-children">{children}</div>}
        </div>
      </div>
    </section>
  );
};

export { HeroSectionWrapper };
export default HeroSectionWrapper;
