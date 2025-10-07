// src/packages/components/AddOnCardFrame/AddOnCardFrame.tsx
"use client";

/**
 * AddOnCardFrame — lightweight presentational wrapper used by AddOnCard.
 * Provides padding, elevation-on-hover, and consistent layout hooks.
 */

import * as React from "react";
import styles from "./AddOnCardFrame.module.css";

export type AddOnCardFrameProps = {
  children: React.ReactNode;
  className?: string;
  /** Card padding preset */
  padding?: "none" | "sm" | "md" | "lg";
  /** Height behavior */
  height?: "auto" | "stretch";
  /** Hover elevation/lift */
  hoverLift?: boolean;
  /** Accessible label for the card container */
  ariaLabel?: string;
  /** Forwarded props */
  role?: React.AriaRole;
  tabIndex?: number;
  [dataAttr: `data-${string}`]: unknown;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AddOnCardFrame({
  children,
  className,
  padding = "md",
  height = "auto",
  hoverLift = false,
  ariaLabel,
  role = "group",
  tabIndex,
  ...rest
}: AddOnCardFrameProps) {
  return (
    <div
      className={cx(
        styles.frame,
        styles[`pad_${padding}`],
        styles[`height_${height}`],
        hoverLift && styles.hoverLift,
        className
      )}
      aria-label={ariaLabel}
      role={role}
      tabIndex={tabIndex}
      {...rest}
    >
      {children}
    </div>
  );
}
