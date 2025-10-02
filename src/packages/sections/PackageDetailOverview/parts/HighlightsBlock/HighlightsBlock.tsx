// src/packages/sections/PackageDetailOverview/parts/HighlightsBlock/HighlightsBlock.tsx
/**
 * HighlightsBlock
 * =============================================================================
 * Purpose
 * - Render a compact, consistent list of "highlights" (aka top features) using
 *   the shared <FeatureList> molecule for visuals and a11y.
 *
 * Key Points
 * - ✅ Correctly imports FeatureList as a **default** export
 *   (importing as `{ FeatureList }` will be undefined).
 * - ✅ Normalizes author-friendly input (string | { label, icon? }) into
 *   FeatureList's `FeatureItem` shape.
 * - ✅ Provides **stable `id`s** for each item so React keys are deterministic.
 * - ✅ Keeps presentation concerns (2-column grid) here; uses FeatureList to
 *   handle icons, states, spacing, and ARIA semantics.
 *
 * When used inside a Phase SubSection:
 * - Typically the SubSection will show the title/tagline. The optional local
 *   header here is kept for standalone usages or when SubSection title is
 *   intentionally omitted. It’s safe to hide this header by not passing `title`.
 */

"use client";

import * as React from "react";
import styles from "./HighlightsBlock.module.css";

// IMPORTANT: FeatureList is a DEFAULT export.
// Also re-use the public `FeatureItem` type from the same module.
import { FeatureList, type FeatureItem } from "@/components/ui/molecules/FeatureList";

/* ----------------------------------------------------------------------------
 * Types
 * ---------------------------------------------------------------------------- */

type HighlightItem = string | { label: string; icon?: React.ReactNode };

export interface HighlightsBlockProps {
  /** Section title (visually prominent when used standalone). */
  title?: string; // default: "Highlights"
  /** Optional short subtitle under the title. */
  subtitle?: string;
  /** List of simple strings or { label, icon } items. 3–8 is ideal. */
  items: HighlightItem[];
  /** Optional container className hook. */
  className?: string;
  /** Optional DOM id for the section. */
  id?: string;
}

/* ----------------------------------------------------------------------------
 * Utilities
 * ---------------------------------------------------------------------------- */

/**
 * Best-effort slug generator to create stable ids, even when labels contain
 * spaces or punctuation. This improves React key stability and analytics hooks.
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/* ----------------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------------------- */

export function HighlightsBlock({
  title = "Highlights",
  subtitle,
  items,
  className,
  id,
}: HighlightsBlockProps) {
  if (!items || items.length === 0) return null;

  /**
   * Normalize incoming items to FeatureList’s expected shape:
   *   { id?: string, label: ReactNode, icon?: ReactNode, included?: FeatureState }
   *
   * Notes:
   * - We mark all highlights as "included" by default so FeatureList will render
   *   a checkmark unless an explicit `icon` is provided.
   * - We generate **stable ids**:
   *     - If label is a string → `${slug(label)}-${idx}`
   *     - Otherwise → `highlight-${idx}`
   */
  const normalized: FeatureItem[] = React.useMemo(() => {
    return items.map((it, idx) => {
      const asObj = typeof it === "string" ? { label: it } : it;

      const labelText =
        typeof asObj.label === "string" ? asObj.label : undefined;
      const fallback = `highlight-${idx}`;
      const id = labelText ? `${slugify(labelText)}-${idx}` : fallback;

      return {
        id,
        label: asObj.label,
        icon: asObj.icon,
        included: true, // highlights are positive by definition
      };
    });
  }, [items]);

  return (
    <section
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      id={id}
      data-block="highlights"
    >
      {/* Optional local header for standalone use (safe to omit in SubSection) */}
      {(title || subtitle) && (
        <header className={styles.header}>
          {title ? <h2 className={styles.h2}>{title}</h2> : null}
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </header>
      )}

      {/* FeatureList handles semantics and spacing; this wrapper applies the
          responsive grid specific to the Highlights section. */}
      <div className={styles.grid}>
        <FeatureList
          items={normalized}
          className={styles.list}
          ariaLabel="Key highlights"
          align="start"
          textAlign="left"
          size="md"
        />
      </div>
    </section>
  );
}

export default HighlightsBlock;
