// /components/sections/wrappers/SectionWrapper/SectionWrapper.tsx
import * as React from "react";
import clsx from "clsx";
import { useSectionTheme, SectionContainer, SectionPad, SectionVariant } from "../SectionProvider/SectionProvider";

export interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  /** HTML tag to render for the outer section */
  as?: keyof JSX.IntrinsicElements;
  /** Override theme values locally */
  variant?: SectionVariant;
  padY?: SectionPad;
  padX?: SectionPad;
  container?: SectionContainer;
  bleed?: boolean;
  divider?: "none" | "top" | "bottom" | "both";
  /** Optional anchor id (stable for deep-links from carousels/cards) */
  id?: string;
  /** Semantic role + ARIA */
  role?: string;
  ariaLabel?: string;
  /** Toggle-off rendering for conditional blocks */
  renderIf?: boolean;
  /** Debug visual outline (dev only) */
  debug?: boolean;
  /** Children (your section layout/component) */
  children: React.ReactNode;
}

/**
 * SectionWrapper
 * - Applies background/spacing/containers consistently across pages.
 * - Reads defaults from SectionProvider, allows local overrides per section.
 * - Adds stable ids for deep-linking (e.g., #workflow, #pricing).
 */
export default function SectionWrapper({
  as: Tag = "section",
  variant,
  padY,
  padX,
  container,
  bleed,
  divider,
  id,
  role,
  ariaLabel,
  renderIf = true,
  debug = false,
  className,
  style,
  children,
  ...rest
}: SectionWrapperProps) {
  const theme = useSectionTheme();

  if (!renderIf) return null;

  // Merge local overrides with provider theme
  const _variant = variant ?? theme.variant ?? "default";
  const _padY = padY ?? theme.padY ?? "lg";
  const _padX = padX ?? theme.padX ?? "md";
  const _container = container ?? theme.container ?? "lg";
  const _bleed = bleed ?? theme.bleed ?? false;
  const _divider = divider ?? theme.divider ?? "none";

  // Classes (use your design tokens / utilities here)
  const outerClass = clsx(
    "section",
    `section-variant-${_variant}`,
    `section-padY-${_padY}`,
    `section-padX-${_padX}`,
    _bleed && "section-bleed",
    _divider !== "none" && `section-divider-${_divider}`,
    debug && process.env.NODE_ENV === "development" && "section-debug",
    className
  );

  // Inline style for dev debug
  const computedStyle: React.CSSProperties = {
    ...(style || {}),
    ...(debug && process.env.NODE_ENV === "development"
      ? { outline: "2px dashed #8b5cf6", outlineOffset: "2px" }
      : null),
  };

  // Container wrapper: adjust to your grid system / Container component if preferred
  const Inner = ({ children }: { children: React.ReactNode }) => {
    if (_container === "none") return <>{children}</>;
    return (
      <div
        className={clsx(
          "section-inner",
          "container",
          `container-${_container}` // e.g., container-sm/md/lg/xl
        )}
        data-container-size={_container}
      >
        {children}
      </div>
    );
  };

  return (
    <Tag
      id={id}
      role={role ?? theme.role ?? "region"}
      aria-label={ariaLabel ?? theme.ariaLabel}
      data-variant={_variant}
      data-pad-y={_padY}
      data-pad-x={_padX}
      data-container={_container}
      data-bleed={_bleed ? "true" : "false"}
      data-divider={_divider}
      className={outerClass}
      style={computedStyle}
      {...rest}
    >
      <Inner>{children}</Inner>
    </Tag>
  );
}
