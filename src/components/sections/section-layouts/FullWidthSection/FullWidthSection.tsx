// src/components/sections/templates/FullWidthSection/FullWidthSection.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";
import "./FullWidthSection.css";
 
export interface FullWidthSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Inner content */
  children: React.ReactNode;
  /** Constrain inner content with Container (default: true) */
  constrained?: boolean;
  /** Optional container size (if constrained) */
  containerSize?: "narrow" | "normal" | "wide" | "full";
  /** Optional horizontal padding control via Container spacing */
  containerSpacing?: "none" | "sm" | "md" | "lg" | "xl";
  /** Add consistent vertical padding for the band (default: true) */
  padded?: boolean;
  /** Render a divider at the bottom of this band (default: false) */
  showDivider?: boolean;
  /** Divider style: "constrained" (default) or "full" */
  dividerVariant?: "constrained" | "full";
  /** Divider tone (pass through to Divider component if it supports it) */
  dividerTone?: "default" | "subtle" | "strong" | string;
  /** Section tag name */
  as?: keyof JSX.IntrinsicElements;
  /** Extra className */
  className?: string;
  /** Mark the section as visually full-bleed */
  fullBleed?: boolean; // default true; allows opt-out if you need constrained bands here
}

const FullWidthSection: React.FC<FullWidthSectionProps> = ({
  children,
  constrained = true,
  containerSize = "normal",
  containerSpacing = "md",
  padded = true,
  showDivider = false,
  dividerVariant = "constrained",
  dividerTone = "subtle",
  as: Tag = "section",
  className,
  fullBleed = true,
  ...rest
}) => {
  const sectionClasses = clsx(
    "full-width-section",
    fullBleed && "full-width-breakout",
    padded && "full-width-padded",
    className
  );

  const dividerNode = showDivider ? (
    dividerVariant === "full" ? (
      <div className="full-width-divider breakout">
        <Divider tone={dividerTone} />
      </div>
    ) : (
      <div className="full-width-divider">
        <Container size={containerSize} spacing={containerSpacing}>
          <Divider tone={dividerTone} />
        </Container>
      </div>
    )
  ) : null;

  return (
    <Tag
      {...rest}
      className={sectionClasses}
      data-full-width={fullBleed ? "true" : "false"}
      // Optional: data attributes for debugging/QA
      data-divider={showDivider ? dividerVariant : "none"}
    >
      {constrained ? (
        <Container size={containerSize} spacing={containerSpacing}>
          {children}
        </Container>
      ) : (
        children
      )}

      {/* Bottom divider (optional) */}
      {dividerNode}
    </Tag>
  );
};

export default FullWidthSection;
