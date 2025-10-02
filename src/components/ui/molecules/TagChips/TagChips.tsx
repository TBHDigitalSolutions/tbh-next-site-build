// src/components/ui/molecules/TagChips/TagChips.tsx
"use client";

/**
 * TagChips
 * =============================================================================
 * Purpose
 * -------
 * Render a compact, accessible chip row for service/category/tags. The order is:
 *   1) service chips (always first when provided)
 *   2) category chips
 *   3) free-form tags
 *
 * Design goals
 * ------------
 * - SSR/CSR safe (renders nothing when empty)
 * - Stable keys derived from the chip text (index-suffixed for uniqueness)
 * - Data-attributes for analytics/search (“service”, “category”, “tags”)
 *
 * Notes
 * -----
 * - `service` and `category` can be string or string[]; we normalize to arrays.
 * - `tags` accepts string/number/nullish; we normalize & trim.
 */

import * as React from "react";
import clsx from "clsx";
import styles from "./TagChips.module.css";

export type TagChipsProps = {
  /** Primary owning service or array when cross-service (e.g., ["seo","webdev"]) */
  service?: string | string[];
  /** Optional category/vertical (e.g., "Local", "B2B", "Ecommerce") */
  category?: string | string[];
  /** Free-form tags (ICPs, methods, tech, outcomes, etc.) */
  tags?: Array<string | number | null | undefined>;

  /** Visuals */
  className?: string;
  size?: "sm" | "md";
  wrap?: boolean;

  /** A11y / analytics */
  ariaLabel?: string;
  testId?: string;
};

export default function TagChips({
  service,
  category,
  tags,
  className,
  size = "md",
  wrap = true,
  ariaLabel,
  testId,
}: TagChipsProps) {
  const services = React.useMemo(() => {
    const arr = Array.isArray(service) ? service : [service];
    // normalize, trim, dedupe (case-insensitive)
    const normalized = arr.filter(Boolean).map((s) => String(s).trim()).filter(Boolean);
    return Array.from(new Set(normalized.map((s) => s.toLowerCase()))).map((s) => s);
  }, [service]);

  const categories = React.useMemo(() => {
    const arr = Array.isArray(category) ? category : [category];
    const normalized = arr.filter(Boolean).map((c) => String(c).trim()).filter(Boolean);
    return Array.from(new Set(normalized.map((c) => c.toLowerCase()))).map((c) => c);
  }, [category]);

  const tagList = React.useMemo(() => {
    const normalized = (tags ?? [])
      .map((t) => (t == null ? "" : String(t).trim()))
      .filter(Boolean);
    return Array.from(new Set(normalized.map((t) => t.toLowerCase()))).map((t) => t);
  }, [tags]);

  const nothing = services.length === 0 && categories.length === 0 && tagList.length === 0;
  if (nothing) return null;

  return (
    <ul
      className={clsx(styles.chips, styles[size], wrap ? styles.wrap : styles.nowrap, className)}
      aria-label={ariaLabel ?? "Tags"}
      data-component="TagChips"
      data-testid={testId}
      data-service={services.join(",")}
      data-category={categories.join(",")}
      data-tags={tagList.join(",")}
    >
      {services.map((s, i) => (
        <li key={`svc-${i}-${s}`} className={clsx(styles.chip, styles.serviceChip)} title={`Service: ${s}`}>
          <span className={styles.text}>{s}</span>
        </li>
      ))}

      {categories.map((c, i) => (
        <li key={`cat-${i}-${c}`} className={clsx(styles.chip, styles.categoryChip)} title={`Category: ${c}`}>
          <span className={styles.text}>{c}</span>
        </li>
      ))}

      {tagList.map((t, i) => (
        <li key={`tag-${i}-${t}`} className={styles.chip} title={t}>
          <span className={styles.text}>{t}</span>
        </li>
      ))}
    </ul>
  );
}
