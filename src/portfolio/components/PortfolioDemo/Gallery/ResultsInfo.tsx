"use client";

import * as React from "react";
import styles from "./ResultsInfo.module.css";

export type ResultsInfoProps = {
  /** Total number of items available (pre-filter) */
  total: number;
  /** Number of items currently visible after filters/search */
  visible: number;
  /** Current free-text query (optional) */
  query?: string;
  /** Current category filter (optional) */
  category?: string;
  /** Optional className passthrough */
  className?: string;
  /** Optional test id for integration tests */
  "data-testid"?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * ResultsInfo — Announce result counts and show active filters.
 * - A11y: uses aria-live="polite" inside role="status" to announce changes
 * - Defensive against undefined values
 * - Non-interactive; clear buttons deliberately omitted (parent controls state)
 */
const ResultsInfo: React.FC<ResultsInfoProps> = ({
  total,
  visible,
  query,
  category,
  className,
  "data-testid": dataTestId,
}) => {
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : 0;
  const safeVisible =
    Number.isFinite(visible) && visible >= 0 ? Math.min(visible, safeTotal) : 0;

  // Compose the human-friendly summary
  const summaryText =
    safeTotal === 0
      ? "No projects available."
      : safeVisible === safeTotal
      ? `Showing all ${safeTotal} project${safeTotal === 1 ? "" : "s"}.`
      : `Showing ${safeVisible} of ${safeTotal} projects.`;

  const hasFilters = Boolean((query && query.trim()) || (category && category.trim()));

  return (
    <div
      className={cx(styles.resultsBar, className)}
      data-testid={dataTestId || "results-info"}
    >
      {/* Visually prominent count */}
      <div className={styles.count} role="status" aria-live="polite">
        <span className={styles.countNumber}>
          {safeVisible}
        </span>
        <span className={styles.countLabel}>
          {safeTotal === 0
            ? "Available"
            : safeVisible === 1
            ? "Result"
            : "Results"}
        </span>

        <span className={styles.countSummary} aria-hidden="true">
          {summaryText}
        </span>

        {/* Screen-reader only full summary (avoids double-up for sighted users) */}
        <span className={styles.srOnly}>{summaryText}</span>
      </div>

      {/* Active filters (non-interactive chips) */}
      {hasFilters && (
        <div className={styles.filters} aria-label="Active filters">
          {category && category.trim() && (
            <span className={styles.chip} aria-label={`Category: ${category}`}>
              <span className={styles.chipLabel}>Category</span>
              <span className={styles.chipValue}>{category}</span>
            </span>
          )}
          {query && query.trim() && (
            <span className={styles.chip} aria-label={`Search query: ${query}`}>
              <span className={styles.chipLabel}>Search</span>
              <span className={styles.chipValue}>&ldquo;{query}&rdquo;</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsInfo;
