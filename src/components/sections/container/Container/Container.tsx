// src/components/sections/templates/Container/Container.tsx

/**
 * Container.tsx - Production Ready Layout Container
 * =================================================
 *
 * A flexible, responsive container component that constrains content width
 * while providing design system integration and accessibility features.
 *
 * Features:
 * - Responsive width constraints with CSS custom properties
 * - Predefined container size variants (narrow, normal, wide, full, custom)
 * - Flexible padding and spacing control
 * - Theme-aware styling integration (tone + padded via data attributes)
 * - Performance optimized with React.memo
 * - Comprehensive TypeScript typing
 * - Accessibility considerations
 * - Development debug utilities
 * - Server-side rendering support
 *
 * Usage:
 * - Works seamlessly with MainContent full-width canvas / FullWidthSection
 * - Integrates with TBH Digital Solutions design tokens
 * - Supports responsive breakpoint customization
 *
 * @author TBH
 * @version 2.1.0
 */

"use client";

import * as React from "react";
import clsx from "clsx";
import "./Container.css";

// ===================================================================
// Types & Interfaces
// ===================================================================

/** Predefined container size variants */
export type ContainerSize =
  | "narrow" // ~800px - reading content, FAQs
  | "normal" // ~1200px - standard container width
  | "wide"   // ~1320px - wider layouts / galleries
  | "full"   // 100% - full width within parent
  | "custom"; // use maxWidth prop

/** Container spacing variants (horizontal padding presets) */
export type ContainerSpacing =
  | "none"
  | "sm"
  | "md" // default
  | "lg"
  | "xl"
  | "custom"; // use paddingX prop

/** Theme tone variants resolved by CSS tokens */
export type ContainerTone = "gradient" | "primary" | "surface" | "transparent";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Container size variant or custom width */
  size?: ContainerSize;

  /** Custom max-width (applies when size="custom") */
  maxWidth?: string;

  /** Horizontal padding preset */
  spacing?: ContainerSpacing;

  /** Custom horizontal padding (applies when spacing="custom") */
  paddingX?: string;

  /** Center content horizontally (default: true) */
  centered?: boolean;

  /** Enable responsive behavior (applies preset padding; default: true) */
  responsive?: boolean;

  /** HTML element to render (default: "div") */
  as?: keyof JSX.IntrinsicElements;

  /** Enable development debug mode (dev‑only overlay + console logs) */
  debug?: boolean;

  /** Disable default container classes (use only your custom classes) */
  unstyled?: boolean;

  /** CSS Containment hint for perf */
  contain?: "layout" | "style" | "paint" | "strict" | "content";

  /** Theme tone for background (drives background via CSS tokens; default: "gradient") */
  tone?: ContainerTone;

  /** Apply vertical section rhythm padding (handled in CSS via data attribute) */
  padded?: boolean;
}

// ===================================================================
// Constants
// ===================================================================

const CONTAINER_SIZES: Record<Exclude<ContainerSize, "custom">, string> = {
  narrow: "var(--container-narrow-max-width, 800px)",
  normal: "var(--container-max, 1200px)",
  wide: "var(--container-wide-max-width, 1320px)",
  full: "100%",
};

const CONTAINER_SPACING: Record<Exclude<ContainerSpacing, "custom">, string> = {
  none: "0",
  sm: "var(--spacing-sm, 0.5rem)",
  md: "var(--spacing-md, 0.75rem)",
  lg: "var(--spacing-lg, 1.5rem)",
  xl: "var(--spacing-xl, 2rem)",
};

const DEBUG_BORDER_STYLE = "2px dashed #22c55e";

// ===================================================================
// Utility Functions
// ===================================================================

/** Get container width for a given size */
const getContainerWidth = (size: ContainerSize, customWidth?: string): string => {
  if (size === "custom" && customWidth) return customWidth;
  return CONTAINER_SIZES[size as Exclude<ContainerSize, "custom">] || CONTAINER_SIZES.normal;
};

/** Get container horizontal padding for a given spacing */
const getContainerPadding = (spacing: ContainerSpacing, customPadding?: string): string => {
  if (spacing === "custom" && customPadding) return customPadding;
  return CONTAINER_SPACING[spacing as Exclude<ContainerSpacing, "custom">] || CONTAINER_SPACING.md;
};

/** Validate width value in dev (basic heuristic) */
const validateWidth = (width: string): boolean => {
  const validUnits = ["px", "rem", "em", "%", "vw", "vh"];
  return (
    validUnits.some((u) => width.endsWith(u)) ||
    width === "auto" ||
    width === "none" ||
    width.startsWith("var(") ||
    width.startsWith("min(") ||
    width.startsWith("max(") ||
    width.startsWith("clamp(")
  );
};

// ===================================================================
// Component
// ===================================================================

const Container = React.memo<ContainerProps>(({
  children,
  size = "normal",
  maxWidth,
  spacing = "md",
  paddingX,
  centered = true,
  responsive = true,
  as: Tag = "div",
  debug = false,
  unstyled = false,
  contain,
  className,
  style,
  // NEW
  tone = "gradient",
  padded = false,
  ...rest
}) => {
  // ===================================================================
  // Computed Values
  // ===================================================================

  const containerWidth = React.useMemo(() => {
    const width = getContainerWidth(size, maxWidth);
    if (process.env.NODE_ENV === "development" && !validateWidth(width)) {
      console.warn(`Container: Invalid width value "${width}"`);
    }
    return width;
  }, [size, maxWidth]);

  const containerPadding = React.useMemo(
    () => getContainerPadding(spacing, paddingX),
    [spacing, paddingX]
  );

  // ===================================================================
  // Computed Styles
  // ===================================================================

  const computedStyle = React.useMemo<React.CSSProperties>(() => {
    const computed: React.CSSProperties = {};

    // Base width/centering/padding
    if (!unstyled) {
      computed.maxWidth = containerWidth;
      computed.width = "100%";

      if (centered) computed.marginInline = "auto";
      if (responsive) computed.paddingInline = containerPadding;
    }

    // Performance containment hint
    if (contain) computed.contain = contain;

    // Debug adornments (dev only)
    if (debug && process.env.NODE_ENV === "development") {
      computed.border = DEBUG_BORDER_STYLE;
      computed.position = "relative";
    }

    // Allow overriding --container-max-width for legacy styles if needed
    if (size === "custom" && maxWidth) {
      (computed as any)["--container-max-width"] = maxWidth;
    }

    // Merge user styles last
    return { ...style, ...computed };
  }, [
    unstyled,
    containerWidth,
    centered,
    responsive,
    containerPadding,
    contain,
    debug,
    size,
    maxWidth,
    style,
  ]);

  // ===================================================================
  // Debug Overlay (Development Only)
  // ===================================================================

  const debugOverlay = React.useMemo(() => {
    if (!debug || process.env.NODE_ENV !== "development") return null;
    return (
      <div
        style={{
          position: "absolute",
          top: "-20px",
          left: 0,
          right: 0,
          height: "18px",
          background: "rgba(34, 197, 94, 0.1)",
          color: "#22c55e",
          fontSize: "10px",
          padding: "2px 4px",
          fontFamily: "monospace",
          zIndex: 9999,
          borderTop: "1px solid #22c55e",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        Container [{size}] {containerWidth} | spacing: {spacing} | padding: {containerPadding} | tone: {tone} | padded: {String(padded)}
      </div>
    );
  }, [debug, size, containerWidth, spacing, containerPadding, tone, padded]);

  // ===================================================================
  // Dev Logging (Development Only)
// ===================================================================

  React.useEffect(() => {
    if (process.env.NODE_ENV === "development" && debug) {
      // eslint-disable-next-line no-console
      console.log("Container init", {
        size,
        maxWidth: containerWidth,
        spacing,
        paddingX: containerPadding,
        centered,
        responsive,
        element: Tag,
        tone,
        padded,
      });
    }
  }, [
    size,
    containerWidth,
    spacing,
    containerPadding,
    centered,
    responsive,
    Tag,
    debug,
    tone,
    padded,
  ]);

  // ===================================================================
  // Render
  // ===================================================================

  return (
    <Tag
      {...rest}
      className={clsx(
        !unstyled && "container",
        !unstyled && size !== "custom" && `container-${size}`,
        !unstyled && spacing !== "custom" && `container-spacing-${spacing}`,
        responsive && "container-responsive",
        debug && process.env.NODE_ENV === "development" && "container-debug",
        className,
      )}
      style={computedStyle}
      // Theme data attributes (read by Container.css)
      data-tone={tone}
      data-padded={padded ? "true" : "false"}
      // Diagnostics/accessibility
      data-container-size={size}
      data-container-spacing={spacing}
      data-testid="container"
      // Box sizing hint for CSS hooks
      {...(!unstyled && { "data-container": "true" })}
    >
      {debugOverlay}
      {children}
    </Tag>
  );
});

Container.displayName = "Container";

export default Container;

// ===================================================================
// Type Exports
// ===================================================================

export type { ContainerProps, ContainerSize, ContainerSpacing, ContainerTone };

// ===================================================================
// Utility Exports
// ===================================================================

/** Hook for responsive container behavior */
export const useResponsiveContainer = (baseSize: ContainerSize = "normal") => {
  const [containerSize, setContainerSize] = React.useState<ContainerSize>(baseSize);

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setContainerSize("full");
      else if (width < 1024) setContainerSize("normal");
      else setContainerSize(baseSize);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [baseSize]);

  return containerSize;
};

/** Get current container breakpoint info (SSR safe) */
export const getContainerBreakpoint = (): {
  size: ContainerSize;
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} => {
  if (typeof window === "undefined") {
    return { size: "normal", width: 1200, isMobile: false, isTablet: false, isDesktop: true };
  }
  const width = window.innerWidth;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  let size: ContainerSize = "normal";
  if (isMobile) size = "full";
  else if (isTablet) size = "normal";
  else size = "normal";

  return { size, width, isMobile, isTablet, isDesktop };
};

/** Create inline style object (for CSS‑in‑JS interop) */
export const createContainerStyles = (props: Partial<ContainerProps> = {}) => {
  const {
    size = "normal",
    maxWidth,
    spacing = "md",
    paddingX,
    centered = true,
  } = props;

  const resolvedWidth = getContainerWidth(size, maxWidth);
  const resolvedPadding = getContainerPadding(spacing, paddingX);

  return {
    width: "100%",
    maxWidth: resolvedWidth,
    ...(centered && { marginInline: "auto" }),
    paddingInline: resolvedPadding,
    boxSizing: "border-box" as const,
  };
};

// ===================================================================
// Dev Docgen (Development Only)
// ===================================================================

if (process.env.NODE_ENV === "development") {
  (Container as any).__docgenInfo = {
    description:
      "Flexible container component for constraining content width; theme-aware via data attributes.",
    props: {
      size: {
        description: "Container size preset",
        type: "narrow | normal | wide | full | custom",
        defaultValue: "normal",
      },
      maxWidth: {
        description: "Custom max-width (requires size='custom')",
        type: "string",
      },
      spacing: {
        description: "Horizontal padding preset",
        type: "none | sm | md | lg | xl | custom",
        defaultValue: "md",
      },
      paddingX: {
        description: "Custom horizontal padding (requires spacing='custom')",
        type: "string",
      },
      centered: {
        description: "Center content horizontally",
        type: "boolean",
        defaultValue: true,
      },
      responsive: {
        description: "Apply preset horizontal padding",
        type: "boolean",
        defaultValue: true,
      },
      tone: {
        description: "Theme tone (background via tokens)",
        type: "gradient | primary | surface | transparent",
        defaultValue: "gradient",
      },
      padded: {
        description: "Apply vertical section rhythm padding",
        type: "boolean",
        defaultValue: false,
      },
      debug: {
        description: "Development debug overlay + console logs",
        type: "boolean",
        defaultValue: false,
      },
    },
  };
}
