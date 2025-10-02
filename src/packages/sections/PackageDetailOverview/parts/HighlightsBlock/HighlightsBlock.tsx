// src/packages/sections/PackageDetailOverview/parts/HighlightsBlock/HighlightsBlock.tsx
/**
 * HighlightsBlock
 * -----------------------------------------------------------------------------
 * Renders a responsive 2-column grid of highlight bullets using the shared
 * <FeatureList> molecule for consistent visuals and a11y.
 *
 * ✅ Fix: Each list item now has a stable `id` so FeatureList can use it as the
 * React `key`. Previously we passed only label/icon, which triggered:
 *   "Each child in a list should have a unique 'key' prop."
 *
 * Notes:
 * - We generate `id` by slugifying the text label (when it's a string) and
 *   suffixing with an index for uniqueness. For non-string labels, we fall back
 *   to a deterministic "highlight-<index>" id.
 * - We import FeatureList as a **default export** (matches its implementation).
 * - We do not pass unsupported props (e.g., `variant`) to FeatureList.
 */

import * as React from "react";
import styles from "./HighlightsBlock.module.css";
import FeatureList, {
  type FeatureItem,
} from "@/components/ui/molecules/FeatureList/FeatureList";

type HighlightItem = string | { label: string; icon?: React.ReactNode };

export interface HighlightsBlockProps {
  /** Section title (visually prominent). */
  title?: string; // default: "Highlights"
  /** Optional short subtitle under the title. */
  subtitle?: string;
  /** List of simple strings or {label, icon} items. 3–8 is ideal. */
  items: HighlightItem[];
  /** Optional container className hook. */
  className?: string;
  /** Optional DOM id for the section. */
  id?: string;
}

/** Best-effort slug generator for stable ids (labels may be short phrases). */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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
   *   { id: string, label: ReactNode, icon?: ReactNode, included?: FeatureState }
   * We mark highlights as "included" by default; FeatureList will render the
   * proper iconography (checkmarks) unless an explicit icon is provided.
   */
  const normalized: FeatureItem[] = React.useMemo(() => {
    return items.map((it, idx) => {
      const asObj = typeof it === "string" ? { label: it } : it;

      // Derive a stable id from the label when possible, otherwise fall back.
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
      <header className={styles.header}>
        <h2 className={styles.h2}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      {/* FeatureList handles semantics and spacing; this wrapper applies the
          2-column responsive grid specific to the Highlights section. */}
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
