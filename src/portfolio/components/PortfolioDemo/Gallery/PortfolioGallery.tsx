// src/components/sections/Web-Dev/PortfolioDemo/Gallery/PortfolioGallery.tsx
"use client";

import * as React from "react";
import styles from "./PortfolioGallery.module.css";

// Sibling components (already in this folder per your structure)
import GalleryControls from "./GalleryControls";
import PortfolioCard from "./PortfolioCard";
import ResultsInfo from "./ResultsInfo";

// Typed data (aligns with your /data/portfolio/portfolio-types.ts)
import type { Project } from "@/data/page/services-pages/web-development/portfolio-demo/portfolio-types";

/* -------------------------------------------------------------------------------------------------
 * PortfolioGallery — client-side, accessible, filterable portfolio grid
 * -------------------------------------------------------------------------------------------------
 * Responsibilities:
 * - Render a responsive card grid of Projects
 * - Optional search + category filters (controlled internally)
 * - Optional results info
 * - Surface card clicks via `onOpenItem(item, index)` so the parent can open DemoModal
 *
 * A11y:
 * - Section landmark + labelled heading
 * - Keyboard support: Enter/Space on a focused card triggers onOpenItem
 * - Preserves tab order; focus outline remains visible (leave to CSS)
 *
 * Performance:
 * - useMemo for derived collections (categories, filteredItems)
 * - Small, pure component boundaries; `PortfolioCard` handles image/overlay specifics
 * ------------------------------------------------------------------------------------------------- */

export type PortfolioGalleryProps = {
  /** The list of projects to display */
  items: Project[];
  /** Optional section title rendered above controls/grid */
  title?: string;
  /** Optional subtitle, kept brief (1–2 lines) */
  subtitle?: string;
  /** Grid column density; matches CSS `[data-columns]` rules */
  columns?: 2 | 3 | 4;
  /** Enable the search box (default: true) */
  enableSearch?: boolean;
  /** Enable category chips/filters (default: true) */
  enableFilters?: boolean;
  /** Show the "X results" line (default: true) */
  showResultsInfo?: boolean;
  /** Optional fixed category order; otherwise derived from items */
  categories?: string[];
  /** Initial hydrated query value */
  initialQuery?: string;
  /** Initial selected category */
  initialCategory?: string;
  /**
   * Called when a card is activated (click/Enter/Space). Parent should open DemoModal.
   * If not provided, the card will be non-interactive (display-only).
   */
  onOpenItem?: (item: Project, index: number) => void;
  /** Optional React node to render when no results match current filters */
  emptyState?: React.ReactNode;
  /** Optional aria-label override for the section landmark */
  ariaLabel?: string;
  /** Optional data-testid for integration tests */
  "data-testid"?: string;
};

const DEFAULT_EMPTY = (
  <div className={styles.emptyState} role="status" aria-live="polite">
    <p>No projects match your filters.</p>
  </div>
);

function normalize(str?: string) {
  return (str ?? "").toLowerCase();
}

function uniqueOrdered<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({
  items = [],
  title,
  subtitle,
  columns = 3,
  enableSearch = true,
  enableFilters = true,
  showResultsInfo = true,
  categories,
  initialQuery = "",
  initialCategory = "",
  onOpenItem,
  emptyState,
  ariaLabel,
  "data-testid": dataTestId,
}) => {
  // Guard: keep the component stable even if items prop is undefined/null
  const safeItems = React.useMemo(() => (Array.isArray(items) ? items : []), [items]);

  // Derive category list if not provided
  const derivedCategories = React.useMemo(() => {
    if (categories && categories.length) return categories;
    const found = safeItems
      .map((p) => p.category)
      .filter((c): c is string => Boolean(c && c.trim().length > 0));
    return uniqueOrdered(found);
  }, [categories, safeItems]);

  // Local UI state for search + category selection
  const [query, setQuery] = React.useState(initialQuery);
  const [activeCategory, setActiveCategory] = React.useState(initialCategory);

  // Compute filtered items
  const filteredItems = React.useMemo(() => {
    if (!safeItems.length) return [];

    const q = normalize(query);
    const cat = normalize(activeCategory);

    return safeItems.filter((item) => {
      // Category filter (if active)
      if (cat && normalize(item.category) !== cat) return false;

      // Query filter (title, description, technologies)
      if (!q) return true;

      const haystack = [
        item.title,
        item.description,
        (item.technologies || []).join(" "),
        item.timeline,
      ]
        .filter(Boolean)
        .join(" ");

      return normalize(haystack).includes(q);
    });
  }, [safeItems, query, activeCategory]);

  // Accessible IDs
  const headingId = React.useId();
  const sectionLabel = ariaLabel || (title ? `${title} – Portfolio` : "Portfolio");

  // Card activation handlers
  const handleOpen = React.useCallback(
    (item: Project, index: number) => {
      if (typeof onOpenItem === "function") onOpenItem(item, index);
    },
    [onOpenItem]
  );

  const onCardKeyDown = React.useCallback(
    (e: React.KeyboardEvent, item: Project, index: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleOpen(item, index);
      }
    },
    [handleOpen]
  );

  return (
    <section
      className={styles.gallerySection}
      aria-labelledby={title ? headingId : undefined}
      aria-label={!title ? sectionLabel : undefined}
      data-testid={dataTestId || "portfolio-gallery"}
    >
      {title && (
        <header className={styles.header}>
          <h2 id={headingId} className={styles.title}>
            {title}
          </h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
      )}

      {(enableSearch || enableFilters) && (
        <div className={styles.controlsRow}>
          <GalleryControls
            enableSearch={enableSearch}
            enableFilters={enableFilters}
            categories={derivedCategories}
            query={query}
            activeCategory={activeCategory}
            onQueryChange={setQuery}
            onCategoryChange={setActiveCategory}
          />
        </div>
      )}

      {showResultsInfo && (
        <ResultsInfo
          total={safeItems.length}
          visible={filteredItems.length}
          query={query}
          category={activeCategory}
        />
      )}

      <div
        className={styles.grid}
        data-columns={columns}
        role="list"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {filteredItems.map((item, index) => {
          const safeTitle = item.title || `Project ${index + 1}`;
          const isInteractive = typeof onOpenItem === "function";

          return (
            <article
              key={item.id || `${safeTitle}-${index}`}
              role="listitem"
              className={styles.cardWrapper}
            >
              <div
                className={isInteractive ? styles.cardInteractive : styles.cardStatic}
                tabIndex={isInteractive ? 0 : -1}
                aria-label={
                  isInteractive
                    ? `Open interactive demo for ${safeTitle}`
                    : safeTitle
                }
                onClick={isInteractive ? () => handleOpen(item, index) : undefined}
                onKeyDown={isInteractive ? (e) => onCardKeyDown(e, item, index) : undefined}
              >
                <PortfolioCard item={item} />
              </div>
            </article>
          );
        })}
      </div>

      {filteredItems.length === 0 && (emptyState ?? DEFAULT_EMPTY)}
    </section>
  );
};

export default PortfolioGallery;
