/**
 * MainContent.tsx - Production Ready Full-Width Canvas Layout
 * ===========================================================
 * 
 * A production-ready layout component that provides a full-width canvas
 * for pages while allowing per-section container width management.
 * 
 * Features:
 * - Full-width canvas (replaces constrained main wrapper)
 * - Per-page container width overrides via CSS custom properties
 * - Flexible HTML element customization
 * - Theme-aware styling integration
 * - Performance optimized with React.memo
 * - Comprehensive TypeScript typing
 * - Accessibility considerations
 * - Development debug utilities
 * 
 * Migration Notes:
 * - Replaces the old auto-sectioning MainContent
 * - Removes automatic <section> wrapping behavior
 * - Provides clean canvas for manual section management
 * 
 * @author TBH Digital Solutions
 * @version 2.0.0
 */

"use client";

import * as React from "react";
import clsx from "clsx";

// ===================================================================
// Types & Interfaces
// ===================================================================

export interface MainContentProps {
  /** Page content - typically sections and components */
  children: React.ReactNode;
  
  /** Override the global container max-width for this page */
  containerMaxWidth?: string; // e.g. "1200px" | "1320px" | "72rem"
  
  /** Additional CSS classes */
  className?: string;
  
  /** HTML element to render (defaults to "main") */
  as?: keyof JSX.IntrinsicElements;
  
  /** Additional HTML attributes for the main element */
  mainProps?: React.HTMLAttributes<HTMLElement>;
  
  /** Development debug mode - adds visual indicators */
  debug?: boolean;
  
  /** Accessibility role override */
  role?: string;
  
  /** Unique ID for the main content area */
  id?: string;
}

// ===================================================================
// Constants
// ===================================================================

const DEFAULT_CONTAINER_WIDTH = "1200px";
const DEBUG_BORDER_STYLE = "2px dashed #ff6b6b";

// ===================================================================
// MainContent Component
// ===================================================================

/**
 * MainContent provides a full-width canvas for page content.
 * Sections within can use Container components to constrain their width.
 */
const MainContent = React.memo<MainContentProps>(({
  children,
  containerMaxWidth,
  className,
  as: Tag = "main",
  mainProps = {},
  debug = false,
  role = "main",
  id = "main-content",
  ...rest
}) => {
  // ===================================================================
  // Computed Styles
  // ===================================================================
  
  const computedStyle = React.useMemo(() => {
    const style: React.CSSProperties = {};
    
    // Apply container width override if provided
    if (containerMaxWidth) {
      style["--container-max-width" as any] = containerMaxWidth;
    }
    
    // Debug mode styling
    if (debug && process.env.NODE_ENV === "development") {
      style.border = DEBUG_BORDER_STYLE;
      style.position = "relative";
    }
    
    // Merge with any existing styles from mainProps
    return { ...mainProps.style, ...style };
  }, [containerMaxWidth, debug, mainProps.style]);

  // ===================================================================
  // Debug Overlay (Development Only)
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
          background: "rgba(255, 107, 107, 0.1)",
          color: "#ff6b6b",
          fontSize: "12px",
          padding: "4px 8px",
          fontFamily: "monospace",
          zIndex: 9999,
          borderBottom: "1px solid #ff6b6b",
          pointerEvents: "none",
        }}
      >
        MainContent [Full-Width Canvas] {containerMaxWidth && `| Override: ${containerMaxWidth}`}
      </div>
    );
  }, [debug, containerMaxWidth]);

  // ===================================================================
  // Error Boundary Logging (Development)
  // ===================================================================
  
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development" && debug) {
      console.log("MainContent initialized:", {
        containerMaxWidth: containerMaxWidth || DEFAULT_CONTAINER_WIDTH,
        elementType: Tag,
        role,
        id,
      });
    }
  }, [containerMaxWidth, Tag, role, id, debug]);

  // ===================================================================
  // Render
  // ===================================================================
  
  return (
    <Tag
      {...mainProps}
      {...rest}
      id={id}
      role={role}
      className={clsx(
        // Core layout class (defined in layout.css)
        "main-content-section",
        // Debug mode class
        debug && process.env.NODE_ENV === "development" && "main-content-debug",
        // Custom classes
        className
      )}
      style={computedStyle}
      // Accessibility attributes
      aria-label={mainProps["aria-label"] || "Main page content"}
      // Performance hint for large content areas
      data-testid="main-content"
    >
      {debugOverlay}
      {children}
    </Tag>
  );
});

// ===================================================================
// Display Name & Exports
// ===================================================================

MainContent.displayName = "MainContent";

export default MainContent;

// ===================================================================
// Type Exports for External Use
// ===================================================================

export type { MainContentProps };

// ===================================================================
// Utility Functions (Optional Exports)
// ===================================================================

/**
 * Utility to validate container width values
 */
export const validateContainerWidth = (width: string): boolean => {
  const validUnits = ["px", "rem", "em", "%", "vw", "vh"];
  return validUnits.some(unit => width.endsWith(unit)) || width === "auto" || width === "none";
};

/**
 * Utility to get default container width from CSS custom properties
 */
export const getDefaultContainerWidth = (): string => {
  if (typeof window !== "undefined") {
    const computed = getComputedStyle(document.documentElement);
    return computed.getPropertyValue("--container-max-width").trim() || DEFAULT_CONTAINER_WIDTH;
  }
  return DEFAULT_CONTAINER_WIDTH;
};

/**
 * Hook for container width management (optional utility)
 */
export const useContainerWidth = (override?: string) => {
  const [containerWidth, setContainerWidth] = React.useState<string>(
    override || DEFAULT_CONTAINER_WIDTH
  );
  
  React.useEffect(() => {
    if (override) {
      setContainerWidth(override);
    } else {
      setContainerWidth(getDefaultContainerWidth());
    }
  }, [override]);
  
  return [containerWidth, setContainerWidth] as const;
};

// ===================================================================
// Development Utilities
// ===================================================================

if (process.env.NODE_ENV === "development") {
  // Add development-only utilities here
  (MainContent as any).__docgenInfo = {
    description: "Full-width canvas layout component for TBH Digital Solutions",
    props: {
      children: { description: "Page content", required: true },
      containerMaxWidth: { description: "Override global container width", required: false },
      className: { description: "Additional CSS classes", required: false },
      as: { description: "HTML element type", required: false, defaultValue: "main" },
      debug: { description: "Enable development debug mode", required: false, defaultValue: false },
    },
  };
}