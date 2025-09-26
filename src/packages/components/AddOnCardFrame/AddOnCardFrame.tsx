import * as React from "react";
import styles from "./AddOnCardFrame.module.css";

export type AddOnCardFrameVariant = "elevated" | "outlined" | "ghost";
export type AddOnCardFramePadding = "none" | "sm" | "md" | "lg";
export type AddOnCardFrameHeight = "auto" | "stretch";

export type AddOnCardFrameProps = {
  /** Visual style */
  variant?: AddOnCardFrameVariant;        // default: "elevated"
  /** Internal padding scale */
  padding?: AddOnCardFramePadding;        // default: "md"
  /** Height lock behavior */
  height?: AddOnCardFrameHeight;          // default: "auto"
  /** Slight lift/shadow on hover (for interactive cards) */
  hoverLift?: boolean;                    // default: true
  /** Emphasis state (e.g., “Popular add-on”) */
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
 * AddOnCardFrame
 * - Consistent padding, elevation, equal-height option
 * - Renders as <a>, <button>, or <article> depending on props
 * - Tuned tokens for add-on cards (slightly denser than package cards)
 */
const AddOnCardFrame: React.FC<AddOnCardFrameProps> = ({
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

  const classes = [
    styles.root,
    styles[variant],
    styles[`pad-${padding}`],
    height === "stretch" ? styles.stretch : "",
    hoverLift ? styles.hoverLift : "",
    selected ? styles.selected : "",
    disabled ? styles.disabled : "",
    className,
  ].filter(Boolean).join(" ");

  const commonProps: any = {
    className: classes,
    style,
    "aria-label": ariaLabel,
    "aria-disabled": disabled || undefined,
    ...rest,
  };

  if (isAnchor) {
    return (
      <a
        {...commonProps}
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
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

  return <article {...commonProps}>{children}</article>;
};

export default AddOnCardFrame;
export { AddOnCardFrame };
