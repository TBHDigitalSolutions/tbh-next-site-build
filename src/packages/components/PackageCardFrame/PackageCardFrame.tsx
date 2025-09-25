import * as React from "react";
import styles from "./PackageCardFrame.module.css";

export type PackageCardFrameVariant = "elevated" | "outlined" | "ghost";
export type PackageCardFramePadding = "none" | "sm" | "md" | "lg";
export type PackageCardFrameHeight = "auto" | "stretch";

export type PackageCardFrameProps = {
  /** Visual style */
  variant?: PackageCardFrameVariant;        // default: "elevated"
  /** Internal padding scale */
  padding?: PackageCardFramePadding;        // default: "md"
  /** Height lock behavior */
  height?: PackageCardFrameHeight;          // default: "auto"
  /** Slight lift/shadow on hover (for interactive cards) */
  hoverLift?: boolean;                      // default: true
  /** Selected state (e.g., highlighted tier) */
  selected?: boolean;
  /** Disabled (no interactions, muted) */
  disabled?: boolean;
  /** Optional aria-label for interactive card wrapper */
  ariaLabel?: string;
  /** Link behavior: if provided, renders <a> */
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  /** Button behavior: if provided (and no href), renders <button> */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Extra className / style */
  className?: string;
  style?: React.CSSProperties;
  /** Children content of the card */
  children: React.ReactNode;
  /** Data attributes (opt-in) */
  "data-testid"?: string;
};

/**
 * PackageCardFrame
 * - Consistent padding, elevation, equal-height option
 * - Renders as <a>, <button>, or <article> depending on props
 */
export const PackageCardFrame: React.FC<PackageCardFrameProps> = ({
  variant = "elevated",
  padding = "md",
  height = "auto",
  hoverLift = true,
  selected = false,
  disabled = false,
  ariaLabel,
  href,
  target,
  rel,
  onClick,
  className,
  style,
  children,
  ...rest
}) => {
  const isAnchor = !!href;
  const isButton = !href && !!onClick;
  const Tag: any = isAnchor ? "a" : isButton ? "button" : "article";

  const cls = [
    styles.root,
    styles[variant],
    styles[`pad-${padding}`],
    height === "stretch" ? styles.stretch : "",
    hoverLift ? styles.hoverLift : "",
    selected ? styles.selected : "",
    disabled ? styles.disabled : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const commonProps = {
    className: cls,
    style,
    "aria-label": ariaLabel,
    "aria-disabled": disabled || undefined,
    ...rest,
  };

  if (isAnchor) {
    const safeRel = rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);
    return (
      <a
        {...commonProps}
        href={href}
        target={target}
        rel={safeRel}
        role="group"
      >
        {children}
      </a>
    );
  }

  if (isButton) {
    return (
      <button
        {...commonProps}
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }

  // Non-interactive
  return <article {...commonProps}>{children}</article>;
};

export default PackageCardFrame;
