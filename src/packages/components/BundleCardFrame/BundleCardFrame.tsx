import * as React from "react";
import styles from "./BundleCardFrame.module.css";

export type BundleCardFrameVariant = "elevated" | "outlined" | "ghost";
export type BundleCardFramePadding = "none" | "sm" | "md" | "lg";
export type BundleCardFrameHeight = "auto" | "stretch";

export type BundleCardFrameProps = {
  /** Visual style (shadowed by default for rail friendliness) */
  variant?: BundleCardFrameVariant;      // default: "elevated"
  /** Internal padding scale */
  padding?: BundleCardFramePadding;      // default: "lg"
  /** Height lock behavior */
  height?: BundleCardFrameHeight;        // default: "auto"
  /** Slight lift/shadow on hover for interactive cards */
  hoverLift?: boolean;                    // default: true
  /** Emphasis state (e.g., “Best value”) */
  selected?: boolean;
  /** Muted, non-interactive */
  disabled?: boolean;

  /** Optional aria-label for interactive wrapper */
  ariaLabel?: string;

  /** Render as link if provided */
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;

  /** Render as button if provided (and no href) */
  onClick?: React.MouseEventHandler<HTMLElement>;

  /** Extra hooks */
  className?: string;
  style?: React.CSSProperties;

  /** Content */
  children: React.ReactNode;

  /** Opt-in testing hook */
  "data-testid"?: string;
};

/**
 * BundleCardFrame
 * - Consistent padding, elevation, equal-height option for Bundle cards
 * - Renders as <a>, <button>, or <article> depending on props
 * - Indigo/violet accent tokens to distinguish “bundles” from other card families
 */
export const BundleCardFrame: React.FC<BundleCardFrameProps> = ({
  variant = "elevated",
  padding = "lg",
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

  const classes = [
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
    className: classes,
    style,
    "aria-label": ariaLabel,
    "aria-disabled": disabled || undefined,
    ...rest,
  };

  if (isAnchor) {
    const safeRel = rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);
    return (
      <a {...commonProps} href={href} target={target} rel={safeRel} role="group">
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

  return <article {...commonProps}>{children}</article>;
};

export default BundleCardFrame;
