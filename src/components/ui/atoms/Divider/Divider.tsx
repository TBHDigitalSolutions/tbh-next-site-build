"use client";

import React from "react";
import clsx from "clsx";
import "./Divider.css";

/**
 * Divider — container-aware and brand-aligned
 *
 * Usage patterns:
 * 1) Match the title width
 *    Wrap your <h2/> and <Divider/> in a container that shrinks to content:
 *      <div className="heading-pair"><h2>Title</h2><Divider /></div>
 *    .heading-pair { display:inline-grid; justify-items:center; inline-size:max-content; }
 *
 * 2) Constrain to a fixed length
 *    <Divider width="32ch" />
 *
 * 3) Full container width (default)
 *    <Divider />
 */
export type DividerProps = {
  className?: string;
  /** Visual alignment within the row (uses margins so it plays nicely in CSS Grid). */
  align?: "start" | "center" | "end";
  /** CSS length to clamp the line (e.g., "32ch", "280px", "60%"). Defaults to 100% of the wrapper. */
  width?: string | number;
  /** Line thickness (e.g., 2, "4px"). Defaults to theme token via CSS var. */
  thickness?: string | number;
  /** Tone of the gradient (maps to theme vars). */
  tone?: "accent" | "muted" | "inverse";
  /** If true, soft glow under the line. */
  glow?: boolean;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean;
};

const Divider: React.FC<DividerProps> = ({
  className,
  align = "center",
  width,
  thickness,
  tone = "accent",
  glow = false,
  style,
  "aria-hidden": ariaHidden = true,
}) => {
  const styleVars: React.CSSProperties = {
    ...(typeof width === "number"
      ? { ["--divider-width" as any]: `${width}px` }
      : width
      ? { ["--divider-width" as any]: width }
      : null),
    ...(typeof thickness === "number"
      ? { ["--divider-thickness" as any]: `${thickness}px` }
      : thickness
      ? { ["--divider-thickness" as any]: thickness }
      : null),
    ...style,
  };

  return (
    <div
      aria-hidden={ariaHidden}
      className={clsx(
        "divider",
        // keep legacy class for backward compatibility with any global styles
        "section-divider",
        `divider--${align}`,
        `divider--${tone}`,
        glow && "divider--glow",
        className,
      )}
      style={styleVars}
    />
  );
};

export default Divider;
