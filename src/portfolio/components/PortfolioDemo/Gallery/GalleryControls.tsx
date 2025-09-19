"use client";

import * as React from "react";
import styles from "./GalleryControls.module.css";

export type GalleryControlsProps = {
  /** Toggle search input */
  enableSearch?: boolean;
  /** Toggle category chips */
  enableFilters?: boolean;
  /** Ordered list of categories (may be empty) */
  categories?: string[];
  /** Current search query */
  query: string;
  /** Currently active category (exact match) */
  activeCategory: string;
  /** Change handlers supplied by parent (PortfolioGallery) */
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  /** Optional: placeholder for the search input */
  searchPlaceholder?: string;
  /** Optional: show a clear-all button (clears query + category) */
  showClear?: boolean;
  /** Optional: className pass-through */
  className?: string;
  /** Optional: test id */
  "data-testid"?: string;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * GalleryControls
 * - Presents a search box and category chips.
 * - Emits changes via callbacks; no internal debouncing (leave to parent if needed).
 * - A11y: input has label, chips are buttons with aria-pressed.
 */
const GalleryControls: React.FC<GalleryControlsProps> = ({
  enableSearch = true,
  enableFilters = true,
  categories = [],
  query,
  activeCategory,
  onQueryChange,
  onCategoryChange,
  searchPlaceholder = "Search projects…",
  showClear = true,
  className,
  "data-testid": dataTestId,
}) => {
  const inputId = React.useId();
  const hasFilters = enableFilters && categories.length > 0;

  const clearAll = React.useCallback(() => {
    if (query) onQueryChange("");
    if (activeCategory) onCategoryChange("");
  }, [query, activeCategory, onQueryChange, onCategoryChange]);

  const onChipClick = (cat: string) => {
    onCategoryChange(cat === activeCategory ? "" : cat);
  };

  const onKeyDownChip: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
    // Space should toggle chips in addition to Enter (native button handles Enter)
    if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      (e.currentTarget as HTMLButtonElement).click();
    }
  };

  return (
    <div className={cx(styles.container, className)} data-testid={dataTestId || "gallery-controls"}>
      {/* Search */}
      {enableSearch && (
        <div className={styles.searchGroup}>
          <label htmlFor={inputId} className={styles.searchLabel}>
            Search
          </label>
          <input
            id={inputId}
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder={searchPlaceholder}
            className={styles.searchInput}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search projects"
          />
        </div>
      )}

      {/* Category filters */}
      {hasFilters && (
        <div className={styles.filtersGroup} role="group" aria-label="Filter by category">
          <div className={styles.chips}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={cx(styles.chip, isActive && styles.chipActive)}
                  aria-pressed={isActive}
                  aria-label={isActive ? `Category: ${cat} (active)` : `Category: ${cat}`}
                  onClick={() => onChipClick(cat)}
                  onKeyDown={onKeyDownChip}
                >
                  <span className={styles.chipDot} aria-hidden="true" />
                  <span className={styles.chipText}>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear button (visible only if something is active) */}
      {showClear && (query || activeCategory) && (
        <div className={styles.actions}>
          <button
            type="button"
            onClick={clearAll}
            className={styles.clearBtn}
            aria-label="Clear search and filters"
          >
            <svg className={styles.clearIcon} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19
                   12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryControls;
