// src/components/portfolio/StandardPortfolioGallery/StandardPortfolioGallery.tsx

"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { UniversalPortfolioModal } from '../UniversalPortfolioModal/UniversalPortfolioModal';
import type { Project, MediaType } from '../types';
import styles from './StandardPortfolioGallery.module.css';

interface StandardPortfolioGalleryProps {
  items: Project[];
  max?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  columns?: 1 | 2 | 3 | 4;
  variant?: 'grid' | 'masonry' | 'list';
  onModalOpen?: (project: Project) => void;
  onItemClick?: (project: Project, index: number) => void;
  className?: string;
  emptyStateText?: string;
  searchPlaceholder?: string;
  'aria-label'?: string;
}

interface FilterState {
  mediaType: MediaType | 'all';
  featured: boolean | 'all';
  tags: string[];
}

export const StandardPortfolioGallery: React.FC<StandardPortfolioGalleryProps> = ({
  items,
  max,
  showSearch = false,
  showFilters = false,
  columns = 3,
  variant = 'grid',
  onModalOpen,
  onItemClick,
  className = '',
  emptyStateText = 'No portfolio items found.',
  searchPlaceholder = 'Search portfolio...',
  'aria-label': ariaLabel = 'Portfolio gallery'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    mediaType: 'all',
    featured: 'all',
    tags: []
  });
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    currentIndex: number;
    items: Project[];
  }>({
    isOpen: false,
    currentIndex: 0,
    items: []
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Memoized filtering and search logic
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.client?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply media type filter
    if (filters.mediaType !== 'all') {
      filtered = filtered.filter(item => item.media.type === filters.mediaType);
    }

    // Apply featured filter
    if (filters.featured !== 'all') {
      filtered = filtered.filter(item => !!item.featured === filters.featured);
    }

    // Apply tag filters
    if (filters.tags.length > 0) {
      filtered = filtered.filter(item =>
        filters.tags.some(filterTag =>
          item.tags?.some(itemTag => itemTag.toLowerCase() === filterTag.toLowerCase())
        )
      );
    }

    return filtered;
  }, [items, searchQuery, filters]);

  // Apply max limit after filtering
  const displayItems = useMemo(() => {
    return max ? filteredItems.slice(0, max) : filteredItems;
  }, [filteredItems, max]);

  // Get all available tags for filter options
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [items]);

  // Modal handlers
  const openModal = useCallback((project: Project) => {
    const index = displayItems.findIndex(item => item.id === project.id);
    if (index === -1) return;

    setModalState({
      isOpen: true,
      currentIndex: index,
      items: displayItems
    });
    onModalOpen?.(project);
    onItemClick?.(project, index);
  }, [displayItems, onModalOpen, onItemClick]);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const navigateModal = useCallback((direction: 'prev' | 'next') => {
    setModalState(prev => {
      const newIndex = direction === 'prev' 
        ? Math.max(0, prev.currentIndex - 1)
        : Math.min(prev.items.length - 1, prev.currentIndex + 1);
      return { ...prev, currentIndex: newIndex };
    });
  }, []);

  // Filter handlers
  const handleMediaTypeFilter = useCallback((mediaType: MediaType | 'all') => {
    setFilters(prev => ({ ...prev, mediaType }));
  }, []);

  const handleFeaturedFilter = useCallback((featured: boolean | 'all') => {
    setFilters(prev => ({ ...prev, featured }));
  }, []);

  const handleTagFilter = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      mediaType: 'all',
      featured: 'all',
      tags: []
    });
    setSearchQuery('');
  }, []);

  // Keyboard navigation for search
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      searchInputRef.current?.blur();
    }
  }, []);

  // Card interaction handlers
  const handleCardClick = useCallback((project: Project) => {
    openModal(project);
  }, [openModal]);

  const handleCardKeyDown = useCallback((e: React.KeyboardEvent, project: Project) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal(project);
    }
  }, [openModal]);

  const currentProject = modalState.items[modalState.currentIndex];
  const hasFiltersApplied = searchQuery || filters.mediaType !== 'all' || 
    filters.featured !== 'all' || filters.tags.length > 0;

  return (
    <section 
      className={`${styles.gallery} ${styles[variant]} ${styles[`columns-${columns}`]} ${className}`}
      aria-label={ariaLabel}
      ref={galleryRef}
    >
      {/* Search and Filter Controls */}
      {(showSearch || showFilters) && (
        <div className={styles.controls}>
          {showSearch && (
            <div className={styles.searchSection}>
              <div className={styles.searchInputWrapper}>
                <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <polyline points="21,21 16.65,16.65"></polyline>
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className={styles.searchInput}
                  aria-label="Search portfolio items"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={styles.clearSearch}
                    aria-label="Clear search"
                    type="button"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {showFilters && (
            <div className={styles.filtersSection}>
              {/* Media Type Filter */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Type:</label>
                <div className={styles.filterButtons}>
                  {(['all', 'image', 'video', 'interactive', 'pdf'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => handleMediaTypeFilter(type)}
                      className={`${styles.filterButton} ${filters.mediaType === type ? styles.active : ''}`}
                      type="button"
                    >
                      {type === 'all' ? 'All' : getMediaTypeBadge(type)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured Filter */}
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Show:</label>
                <div className={styles.filterButtons}>
                  {([
                    { value: 'all' as const, label: 'All' },
                    { value: true as const, label: 'Featured' },
                    { value: false as const, label: 'Regular' }
                  ]).map(({ value, label }) => (
                    <button
                      key={String(value)}
                      onClick={() => handleFeaturedFilter(value)}
                      className={`${styles.filterButton} ${filters.featured === value ? styles.active : ''}`}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Filters */}
              {availableTags.length > 0 && (
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Tags:</label>
                  <div className={styles.tagFilters}>
                    {availableTags.slice(0, 8).map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagFilter(tag)}
                        className={`${styles.tagFilter} ${filters.tags.includes(tag) ? styles.active : ''}`}
                        type="button"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {hasFiltersApplied && (
                <button
                  onClick={clearFilters}
                  className={styles.clearFilters}
                  type="button"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      {(showSearch || showFilters) && (
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            {displayItems.length} of {items.length} items
            {hasFiltersApplied && ' (filtered)'}
          </span>
        </div>
      )}

      {/* Gallery Grid */}
      {displayItems.length > 0 ? (
        <div className={styles.grid} role="grid">
          {displayItems.map((project, index) => (
            <PortfolioCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => handleCardClick(project)}
              onKeyDown={(e) => handleCardKeyDown(e, project)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <svg className={styles.emptyStateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21,15 16,10 5,21"></polyline>
            </svg>
            <p className={styles.emptyStateText}>{emptyStateText}</p>
            {hasFiltersApplied && (
              <button
                onClick={clearFilters}
                className={styles.clearFiltersButton}
                type="button"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {modalState.isOpen && currentProject && (
        <UniversalPortfolioModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          project={currentProject}
          index={modalState.currentIndex}
          total={modalState.items.length}
          onPrevious={modalState.currentIndex > 0 ? () => navigateModal('prev') : undefined}
          onNext={modalState.currentIndex < modalState.items.length - 1 ? () => navigateModal('next') : undefined}
        />
      )}
    </section>
  );
};

// Portfolio Card Component
interface PortfolioCardProps {
  project: Project;
  index: number;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  project,
  index,
  onClick,
  onKeyDown
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const thumbnailSrc = project.media.thumbnail || 
    project.media.poster || 
    (project.media.type === 'image' ? project.media.src : '/placeholder-image.jpg');

  return (
    <article
      className={`${styles.card} ${project.featured ? styles.featured : ''}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="gridcell"
      aria-label={`View ${project.title} portfolio item`}
      data-media-type={project.media.type}
    >
      <div className={styles.cardImage}>
        {!imageLoaded && !imageError && (
          <div className={styles.imagePlaceholder}>
            <div className={styles.placeholderSpinner}></div>
          </div>
        )}
        
        {!imageError && (
          <img
            src={thumbnailSrc}
            alt={project.media.alt || project.title}
            loading="lazy"
            className={`${styles.image} ${imageLoaded ? styles.loaded : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {imageError && (
          <div className={styles.imageError}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21,15 16,10 5,21"></polyline>
            </svg>
          </div>
        )}

        <div className={styles.cardOverlay}>
          <div className={styles.mediaTypeIndicator}>
            <span className={styles.badge} data-type={project.media.type}>
              {getMediaTypeBadge(project.media.type)}
            </span>
          </div>
          
          {project.featured && (
            <div className={styles.featuredBadge}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
              </svg>
              <span>Featured</span>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        
        {project.client && (
          <p className={styles.cardClient}>{project.client}</p>
        )}
        
        {project.description && (
          <p className={styles.cardDescription}>
            {project.description.length > 120 
              ? `${project.description.substring(0, 120)}...`
              : project.description
            }
          </p>
        )}
        
        {project.metrics && project.metrics.length > 0 && (
          <div className={styles.metrics}>
            {project.metrics.slice(0, 2).map((metric, idx) => (
              <div key={idx} className={styles.metric}>
                <span className={styles.metricValue}>{metric.value}</span>
                <span className={styles.metricLabel}>{metric.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.cardMeta}>
          {project.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
};

// Utility function for media type badges
function getMediaTypeBadge(type: MediaType): string {
  switch (type) {
    case "video": return "Video";
    case "interactive": return "Demo";
    case "pdf": return "PDF";
    case "image":
    default: return "Image";
  }
}

export default StandardPortfolioGallery;