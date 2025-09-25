"use client";

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

/**
 * TagChips — semantic chips for service/category/tags.
 * - Always renders "service" (if given) first, then "category", then "tags".
 * - Exposes searchable data attributes for analytics or client-side indexing.
 * - SSR/CSR-safe: renders nothing if nothing to render.
 */
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
  const services = React.useMemo(
    () =>
      (Array.isArray(service) ? service : [service])
        .filter(Boolean)
        .map((s) => String(s).trim())
        .filter(Boolean),
    [service],
  );

  const categories = React.useMemo(
    () =>
      (Array.isArray(category) ? category : [category])
        .filter(Boolean)
        .map((c) => String(c).trim())
        .filter(Boolean),
    [category],
  );

  const tagList = React.useMemo(
    () =>
      (tags ?? [])
        .map((t) => (t == null ? "" : String(t).trim()))
        .filter(Boolean),
    [tags],
  );

  const nothing = services.length === 0 && categories.length === 0 && tagList.length === 0;
  if (nothing) return null;

  return (
    <ul
      className={clsx(styles.chips, styles[size], wrap ? styles.wrap : styles.nowrap, className)}
      aria-label={ariaLabel ?? "Tags"}
      data-component="TagChips"
      data-testid={testId}
      data-service={services.join(",").toLowerCase()}
      data-category={categories.join(",").toLowerCase()}
      data-tags={tagList.map((t) => t.toLowerCase()).join(",")}
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