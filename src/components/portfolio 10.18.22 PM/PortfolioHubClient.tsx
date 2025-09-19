// ===================================================================
// /src/components/portfolio/PortfolioHubClient.tsx
// ===================================================================
// Client-side portfolio hub: orchestrates search + category highlights,
// opens the PortfolioModal, and stays PRESENTATIONAL (no data imports).
// ===================================================================

"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/atoms/Button/Button";
import PortfolioModal from "@/components/portfolio/PortfolioModal/PortfolioModal";
import styles from "./PortfolioHub.module.css";

// Local, presentational types (barrel in ./types)
import type { Project, CategorySlug } from "./types";

// Orchestrator props + helpers (keeps components data-free)
import type {
  PortfolioHubClientProps,
  CategoryHighlight,
  HubSearchConfig,
  HubUIConfig,
} from "./PortfolioHubClient.types";
import { performGlobalSearch } from "./adapters";

// ============================
// SEARCH COMPONENT
// ============================

interface GlobalSearchProps {
  items: Project[];
  config?: HubSearchConfig;
  onResultsChange: (results: Project[]) => void;
  onSearchEvent?: (payload: { query: string; results: number }) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({
  items,
  config,
  onResultsChange,
  onSearchEvent,
}) => {
  const [query, setQuery] = useState("");

  const placeholder =
    config?.placeholder ?? "Try: ecommerce, product demo, local SEO, Shopify…";
  const hint = config?.hint ?? "Start typing to search across all projects.";

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const results = performGlobalSearch(items, searchQuery, config);
    onResultsChange(results);
    onSearchEvent?.({ query: searchQuery, results: results.length });
  };

  return (
    <div className={styles.searchBlock}>
      <label className={styles.searchLabel} htmlFor="portfolio-global-search">
        Search portfolio
      </label>

      <input
        id="portfolio-global-search"
        className={styles.searchInput}
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        aria-describedby="portfolio-global-hint"
      />

      <p id="portfolio-global-hint" className={styles.searchHint}>
        {hint}
      </p>
    </div>
  );
};

// ============================
// SEARCH RESULTS COMPONENT
// ============================

interface SearchResultsProps {
  results: Project[];
  onProjectClick: (project: Project, index: number) => void;
  gridColumns?: 2 | 3 | 4;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onProjectClick,
  gridColumns = 3,
}) => {
  if (!results || results.length === 0) {
    return (
      <div className={styles.noResults}>
        <p>No projects found. Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className={styles.searchResults}>
      <div className={styles.resultsInfo} role="status" aria-live="polite">
        Showing {results.length} result{results.length === 1 ? "" : "s"}
      </div>

      <div className={styles.grid} data-columns={gridColumns} role="list">
        {results.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onProjectClick(project, index)}
          />
        ))}
      </div>
    </div>
  );
};

// ============================
// PROJECT CARD (shared)
// ============================

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const thumbnailSrc =
    project.media.thumbnail || project.media.poster || project.media.src;

  return (
    <article
      role="listitem"
      className={styles.card}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
    >
      {thumbnailSrc && (
        <div className={styles.cardImage}>
          <img
            src={thumbnailSrc}
            alt={project.media.alt || project.title}
            loading="lazy"
          />
          <div className={styles.mediaTypeIndicator}>
            {getMediaTypeIcon(project.media.type)}
          </div>
        </div>
      )}

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{project.title}</h3>

        {project.description && (
          <p className={styles.cardDesc}>{project.description}</p>
        )}

        <div className={styles.cardMetaRow}>
          {project.client && (
            <span className={styles.metaChip}>{project.client}</span>
          )}
          {project.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className={styles.metaChipMuted}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

// ============================
// CATEGORY SECTION
// ============================

interface CategorySectionProps {
  categoryHighlight: CategoryHighlight;
  gridColumns?: 2 | 3 | 4;
  onProjectClick: (
    project: Project,
    index: number,
    categoryProjects: Project[]
  ) => void;
  onViewAllClick?: (category: CategorySlug) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categoryHighlight,
  gridColumns = 3,
  onProjectClick,
  onViewAllClick,
}) => {
  const { category, highlights } = categoryHighlight;

  if (!highlights || highlights.length === 0) return null;

  return (
    <section
      className={styles.categorySection}
      aria-labelledby={`cat-${category.slug}`}
    >
      <div className={styles.sectionHeader}>
        <div className={styles.sectionInfo}>
          <h2 id={`cat-${category.slug}`} className={styles.sectionTitle}>
            {category.title}
          </h2>

          {category.description && (
            <p className={styles.sectionSubtitle}>{category.description}</p>
          )}
        </div>

        <Button
          asChild
          size="md"
          variant="primary"
          className={styles.viewAllBtn}
          onClick={() => onViewAllClick?.(category.slug)}
        >
          <Link
            href={`/portfolio/${category.slug}`}
            aria-label={`View all ${category.title} work`}
          >
            View all
          </Link>
        </Button>
      </div>

      <div className={styles.grid} data-columns={gridColumns} role="list">
        {highlights.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => onProjectClick(project, index, highlights)}
          />
        ))}
      </div>
    </section>
  );
};

// ============================
// UTIL
// ============================

function getMediaTypeIcon(type: string): string {
  switch (type) {
    case "video":
      return "▶";
    case "interactive":
      return "🔗";
    case "pdf":
      return "📄";
    case "image":
    default:
      return "🖼";
  }
}

// ============================
// MAIN HUB CLIENT
// ============================

const PortfolioHubClient: React.FC<PortfolioHubClientProps> = ({
  allItems,
  categoryHighlights,
  searchConfig,
  ui,
  className,
  onViewAllClick,
  onItemOpen,
  onSearch,
}) => {
  const gridColumns: 2 | 3 | 4 = ui?.gridColumns ?? 3;
  const showSearch = ui?.showSearch ?? true;

  const [searchResults, setSearchResults] = useState<Project[] | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    project: Project | null;
    index: number;
    projects: Project[];
  }>({
    isOpen: false,
    project: null,
    index: 0,
    projects: [],
  });

  const isSearching = searchResults !== null;

  // Derived counts (memo for free)
  const totalItems = useMemo(() => allItems.length, [allItems]);

  // Handle search results
  const handleSearchResults = (results: Project[]) => {
    // If user cleared query and adapter returned empty, we still show "no results"
    // (searchResults === null means no search yet)
    setSearchResults(results);
  };

  // Handle project click from search results
  const handleSearchProjectClick = (project: Project, index: number) => {
    onItemOpen?.({ projectId: project.id, category: project.category as CategorySlug });
    setModalState({
      isOpen: true,
      project,
      index,
      projects: searchResults || [],
    });
  };

  // Handle project click from category section
  const handleCategoryProjectClick = (
    project: Project,
    index: number,
    categoryProjects: Project[]
  ) => {
    onItemOpen?.({ projectId: project.id, category: project.category as CategorySlug });
    setModalState({
      isOpen: true,
      project,
      index,
      projects: categoryProjects,
    });
  };

  // Modal navigation
  const handleModalPrevious = () => {
    const newIndex = modalState.index - 1;
    if (newIndex >= 0) {
      setModalState((prev) => ({
        ...prev,
        index: newIndex,
        project: prev.projects[newIndex],
      }));
    }
  };

  const handleModalNext = () => {
    const newIndex = modalState.index + 1;
    if (newIndex < modalState.projects.length) {
      setModalState((prev) => ({
        ...prev,
        index: newIndex,
        project: prev.projects[newIndex],
      }));
    }
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      project: null,
      index: 0,
      projects: [],
    });
  };

  return (
    <div className={className}>
      {/* GLOBAL SEARCH */}
      {showSearch && (
        <GlobalSearch
          items={allItems}
          config={searchConfig}
          onResultsChange={handleSearchResults}
          onSearchEvent={onSearch}
        />
      )}

      {/* SEARCH RESULTS OR CATEGORY SECTIONS */}
      {isSearching ? (
        <SearchResults
          results={searchResults || []}
          onProjectClick={handleSearchProjectClick}
          gridColumns={gridColumns}
        />
      ) : (
        <div className={styles.categorySections}>
          {categoryHighlights.map((categoryHighlight) => (
            <CategorySection
              key={categoryHighlight.category.slug}
              categoryHighlight={categoryHighlight}
              gridColumns={gridColumns}
              onProjectClick={handleCategoryProjectClick}
              onViewAllClick={onViewAllClick}
            />
          ))}
        </div>
      )}

      {/* PORTFOLIO MODAL */}
      {modalState.project && (
        <PortfolioModal
          project={modalState.project}
          index={modalState.index}
          total={modalState.projects.length}
          isOpen={modalState.isOpen}
          onClose={handleModalClose}
          onPrevious={modalState.index > 0 ? handleModalPrevious : undefined}
          onNext={
            modalState.index < modalState.projects.length - 1
              ? handleModalNext
              : undefined
          }
        />
      )}

      {/* (Optional) invisible status line for SR: total items */}
      <span className="sr-only" aria-live="polite">
        Loaded {totalItems} portfolio items.
      </span>
    </div>
  );
};

export default PortfolioHubClient;
