// src/packages/sections/PackageDetailOverview/parts/PhaseSectionHeader/PhaseSectionHeader.tsx
"use client";

/**
 * PhaseSectionHeader
 * =============================================================================
 * A small, accessibility-first header used at the top of each Phase section
 * (Phases 1–5) inside the Package Detail Overview.
 *
 * DESIGN / UX
 * -----------------------------------------------------------------------------
 * - Renders a semantic heading (defaults to <h2>) with:
 *    1) A visual underline element (separate from the Divider so theming can
 *       style both independently).
 *    2) A Divider component (shared atom) placed directly under the heading.
 *    3) An optional tagline paragraph beneath the Divider.
 *
 * ACCESSIBILITY
 * -----------------------------------------------------------------------------
 * - Exposes the heading id so parent sections can reference it via
 *   `aria-labelledby`. If no `id` prop is provided, a stable React `useId`
 *   is generated at runtime (SSR-safe).
 * - When a tagline is present, the heading sets `aria-describedby` to the
 *   tagline paragraph id so screen readers read context in one sequence.
 *
 * PERFORMANCE / API STABILITY
 * -----------------------------------------------------------------------------
 * - Pure presentational component; wrapped in React.memo to avoid re-rendering
 *   when props are unchanged.
 * - Narrow, well-documented prop surface; avoid passing arbitrary extra props.
 *
 * STYLING
 * -----------------------------------------------------------------------------
 * - Depends on local CSS module for spacing & underline treatment.
 * - Divider receives a local class for consistent spacing with the title.
 */

import * as React from "react";
import Divider from "@/components/ui/atoms/Divider/Divider";
import cls from "./PhaseSectionHeader.module.css";

/** Limit `as` to heading tags to preserve document outline semantics. */
type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type PhaseSectionHeaderProps = {
  /**
   * Semantic heading element to render. Defaults to "h2" because phases are
   * top-level subsections inside the Package Detail Overview.
   */
  as?: HeadingTag;

  /**
   * Optional id applied to the HEADING element (NOT the <header> wrapper).
   * Useful for parent sections that set `aria-labelledby={headingId}`.
   * If omitted, a stable SSR-safe id is auto-generated via `useId()`.
   */
  id?: string;

  /** Visible heading text. Must be a non-empty string for a11y. */
  title: string;

  /** Optional one-line context shown beneath the Divider. */
  tagline?: string;

  /** Optional class for the outer <header> wrapper. */
  className?: string;

  /** Inline style hook for the outer <header> wrapper. */
  style?: React.CSSProperties;

  /**
   * Optional test id for e2e/unit tests.
   * (Kept explicit to prevent arbitrary data-* prop sprawl.)
   */
  "data-testid"?: string;
};

/**
 * Internal component (un-memoized) to enable React.memo on export.
 * Keeping a named function helps with React devtools and error stacks.
 */
function PhaseSectionHeaderImpl({
  as = "h2",
  id,
  title,
  tagline,
  className,
  style,
  "data-testid": dataTestId,
}: PhaseSectionHeaderProps) {
  // Guard against accidental empty headings (better to render nothing than
  // produce an inaccessible blank heading in the outline).
  if (!title || !title.trim()) return null;

  // Generate stable, SSR-safe ids for heading & optional tagline when not provided.
  const fallbackHeadingId = React.useId();
  const headingId = id ?? fallbackHeadingId;
  const taglineId = React.useId(); // Only used if tagline is present.

  const HeadingEl = as;

  return (
    <header
      className={[cls.wrap, className].filter(Boolean).join(" ")}
      style={style}
      data-el="phase-header"
      data-testid={dataTestId}
    >
      {/* Semantic heading with a visual underline nested for flexible theming */}
      <HeadingEl
        id={headingId}
        className={cls.title}
        aria-describedby={tagline ? taglineId : undefined}
      >
        <span className={cls.text}>{title}</span>
        <span className={cls.underline} aria-hidden="true" />
      </HeadingEl>

      {/* Shared UI atom for consistent separation between title and content */}
      <Divider className={cls.divider} />

      {/* Optional tagline; exposed with an id so the heading can describe it */}
      {tagline ? (
        <p id={taglineId} className={cls.tagline}>
          {tagline}
        </p>
      ) : null}
    </header>
  );
}

/**
 * Memoized export: avoids unnecessary re-renders when the parent updates
 * unrelated state. Suitable because this component is purely presentational.
 */
const PhaseSectionHeader = React.memo(PhaseSectionHeaderImpl);

PhaseSectionHeader.displayName = "PhaseSectionHeader";

export default PhaseSectionHeader;
