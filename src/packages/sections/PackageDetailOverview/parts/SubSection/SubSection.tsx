// src/packages/sections/PackageDetailOverview/parts/SubSection/SubSection.tsx
"use client";

/**
 * SubSection
 * =============================================================================
 * A reusable, accessibility-first wrapper for **blocks inside a Phase** (e.g.,
 * "Purpose", "Pain points", "Outcomes", "Highlights"). Each SubSection renders:
 *
 *   1) A semantic heading (h3 by default) with a visual underline
 *   2) A shared Divider atom directly below the heading
 *   3) An optional tagline paragraph under the Divider
 *   4) A content body region that renders the provided children
 *
 * WHY THIS EXISTS
 * -----------------------------------------------------------------------------
 * All Phases (1–5) require a consistent “mini-section” pattern: a local title,
 * a standard underline/divider, and an optional short tagline. Centralizing the
 * pattern here ensures visual + a11y consistency and reduces duplicate code.
 *
 * ACCESSIBILITY
 * -----------------------------------------------------------------------------
 * - The outer wrapper is a <section> with `aria-labelledby` pointing at the
 *   internal heading id. Screen readers then announce the heading as the name
 *   of the region.
 * - If a tagline is provided, the HEADING will get `aria-describedby` pointing
 *   at the tagline paragraph so the short context is read with the title.
 * - If `id` is provided, the heading id becomes `${id}__title`; otherwise we
 *   generate stable SSR-safe ids via `useId`.
 *
 * API SHAPE
 * -----------------------------------------------------------------------------
 * - `as`: choose the heading level. Defaults to `"h3"` because Phases typically
 *   render `"h2"` as their top-level title; sub-sections should descend one level.
 * - `title`: required, visible heading copy. If it’s empty, the component
 *   will render **children only** with no header block (guarding outline).
 * - `tagline`: optional, one concise line of context below the Divider.
 * - `data-*` attributes are accepted and forwarded to the outer <section>
 *   (handy for analytics and testing hooks) without allowing arbitrary props.
 *
 * PERFORMANCE
 * -----------------------------------------------------------------------------
 * - Pure presentational; memoized to prevent unnecessary re-renders when props
 *   are unchanged.
 *
 * STYLING
 * -----------------------------------------------------------------------------
 * - Uses a local CSS module for spacing, underline, and layout tokens.
 * - The underline is a distinct element under the heading text to allow
 *   theme-specific treatments without affecting the Divider.
 */

import * as React from "react";
import Divider from "@/components/ui/atoms/Divider/Divider";
import cls from "./SubSection.module.css";

/** Limit heading options to preserve a clean document outline. */
type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

/**
 * Narrow prop surface on purpose:
 * - Avoid extending `HTMLAttributes` to prevent collisions with the HTML `title`
 *   attribute (we use `title` for heading copy).
 * - Allow any `data-*` attributes to pass-through for analytics/testing.
 */
export type SubSectionProps = {
  /** Semantic heading element for the local section title. Default: "h3". */
  as?: HeadingTag;

  /**
   * Optional id for the OUTER <section>.
   * If provided, the heading id is derived as `${id}__title`.
   */
  id?: string;

  /** Visible heading text. If falsy/empty, the header block is omitted. */
  title?: string;

  /** One-line context under the Divider (e.g., “What good looks like”). */
  tagline?: string;

  /** Content body for this block. */
  children: React.ReactNode;

  /** Optional class for the outer <section>. */
  className?: string;

  /** Optional inline style for the outer <section>. */
  style?: React.CSSProperties;

  /** Optional testing hook. */
  "data-testid"?: string;

  /** Optional analytics hook (free-form). */
  "data-block"?: string;

  /** Allow any additional data-* attributes without broadening the API. */
  [dataAttr: `data-${string}`]: unknown;
};

/** Internal (un-memoized) implementation so we can wrap with React.memo below. */
function SubSectionImpl({
  as = "h3",
  id,
  title,
  tagline,
  children,
  className,
  style,
  "data-testid": dataTestId,
  ...dataAttrs
}: SubSectionProps) {
  // Generate stable SSR-safe ids.
  const autoHeadingId = React.useId();
  const autoTaglineId = React.useId();

  // Derive final heading id. If the caller provided a section id,
  // use a deterministic variant for the heading so aria-labelledby
  // can be constructed predictably for deep links and tests.
  const headingId = title ? (id ? `${id}__title` : autoHeadingId) : undefined;
  const taglineId = tagline ? autoTaglineId : undefined;

  // Only add aria-labelledby when a heading exists.
  const ariaLabelledBy = headingId ? headingId : undefined;

  const HeadingEl = as;

  return (
    <section
      id={id}
      className={[cls.wrap, className].filter(Boolean).join(" ")}
      style={style}
      aria-labelledby={ariaLabelledBy}
      data-el="sub-section"
      data-testid={dataTestId}
      {...dataAttrs}
    >
      {title ? (
        <header className={cls.header}>
          <HeadingEl
            id={headingId}
            className={cls.title}
            aria-describedby={taglineId}
          >
            <span className={cls.text}>{title}</span>
            <span className={cls.underline} aria-hidden="true" />
          </HeadingEl>
          <Divider className={cls.divider} />
          {tagline ? (
            <p id={taglineId} className={cls.tagline}>
              {tagline}
            </p>
          ) : null}
        </header>
      ) : null}

      {/* Body is visually separated from header by spacing in the CSS module */}
      <div className={cls.body}>{children}</div>
    </section>
  );
}

/** Memoized export to minimize rerenders in rich layouts. */
const SubSection = React.memo(SubSectionImpl);
SubSection.displayName = "SubSection";

export default SubSection;
