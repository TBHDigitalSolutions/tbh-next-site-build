// /src/portfolio/sections/PortfolioSection/PortfolioSection.tsx
"use client";

import React, { useState, useCallback, useMemo, useId } from 'react';
import type { 
  PortfolioSectionProps,
  PortfolioSectionState,
  Project,
  PortfolioFilters 
} from './PortfolioSection.types';
import { DEFAULTS } from './PortfolioSection.types';
import styles from './PortfolioSection.module.css';

// Lazy load gallery components for code splitting
const StandardPortfolioGallery = React.lazy(() => 
  import('../../components/StandardPortfolioGallery').then(mod => ({
    default: mod.default || mod.StandardPortfolioGallery
  }))
);

const VideoPortfolioGallery = React.lazy(() => 
  import('../../components/VideoPortfolioGallery').then(mod => ({
    default: mod.default || mod.VideoPortfolioGallery
  }))
);

const PortfolioDemo = React.lazy(() => 
  import('../../components/PortfolioDemo/PortfolioDemoClient').then(mod => ({
    default: mod.default || mod.PortfolioDemo
  }))
);

// Error Boundary
class SectionErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PortfolioSection error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.error}>
          <div className={styles.errorTitle}>Section Unavailable</div>
          <p className={styles.errorMessage}>
            This portfolio section encountered an error. Please try refreshing the page.
          </p>
          <button 
            className={styles.errorAction}
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading fallback
const LoadingFallback = () => (
  <div className={styles.loading}>
    <div className={styles.loadingSpinner} aria-label="Loading portfolio content" />
  </div>
);

/**
 * Normalize metrics so every value is a primitive suitable for rendering.
 * Prevents "Objects are not valid as a React child" errors.
 */
function normalizeMetrics(
  metrics: Project["metrics"] | undefined | null
): Record<string, string | number> | undefined {
  if (!metrics || typeof metrics !== "object") return undefined;
  
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(metrics)) {
    if (v == null) continue;
    if (typeof v === "string" || typeof v === "number") {
      out[k] = v;
      continue;
    }
    // Handle shapes like { label, value }
    if (typeof v === "object" && "value" in (v as any)) {
      const val = (v as any).value;
      out[k] = typeof val === "string" || typeof val === "number" ? val : String(val);
      continue;
    }
    // Fallback: stringify the object for display
    try {
      out[k] = JSON.stringify(v);
    } catch {
      out[k] = String(v);
    }
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * Prepare items specifically for galleries that need normalized metrics
 */
function sanitizeItemsForGallery(items: Project[]): Project[] {
  return items.map((item) => {
    const nextMetrics = normalizeMetrics(item.metrics);
    return nextMetrics ? { ...item, metrics: nextMetrics } : item;
  });
}

// Main component
export default function PortfolioSection({
  // Content
  title,
  subtitle,
  description,
  items,
  
  // Configuration
  variant = DEFAULTS.variant,
  layout = DEFAULTS.layout,
  size = DEFAULTS.size,
  maxItems = DEFAULTS.maxItems,
  
  // Features
  showSearch = DEFAULTS.showSearch,
  showFilters = DEFAULTS.showFilters,
  showLoadMore = DEFAULTS.showLoadMore,
  showTitles = DEFAULTS.showTitles,
  showItemCount = DEFAULTS.showItemCount,
  
  // View All CTA
  viewAllHref,
  viewAllText = DEFAULTS.viewAllText,
  onViewAllClick,
  
  // Interaction callbacks
  onItemClick,
  onModalOpen,
  onSearch,
  onFilter,
  onLoadMore,
  onError,
  
  // Analytics
  analyticsContext = DEFAULTS.analyticsContext,
  
  // Accessibility
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  
  // Loading state
  loading = DEFAULTS.loading,
  
  // Background
  background,
  
  // HTML props
  className = '',
  id,
  ...htmlProps
}: PortfolioSectionProps) {
  const componentId = useId();
  const sectionId = id || `portfolio-section-${componentId}`;
  const headingId = `${sectionId}-heading`;
  
  // Component state
  const [state, setState] = useState<PortfolioSectionState>({
    searchQuery: '',
    filters: {},
    visibleItems: maxItems,
    selectedProject: null,
    modalOpen: false,
    loading: false,
    error: null,
  });

  // Memoized filtered and processed items
  const processedItems = useMemo(() => {
    let filtered = [...items];
    
    // Apply search filter
    if (state.searchQuery.trim()) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.client?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply filters
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        switch (key) {
          case 'category':
            filtered = filtered.filter(item => item.category === value);
            break;
          case 'mediaType':
            filtered = filtered.filter(item => item.media?.type === value);
            break;
          case 'featured':
            if (value === true) {
              filtered = filtered.filter(item => item.featured);
            }
            break;
        }
      }
    });
    
    return filtered.slice(0, state.visibleItems);
  }, [items, state.searchQuery, state.filters, state.visibleItems]);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
    const mediaTypes = [...new Set(items.map(item => item.media?.type).filter(Boolean))];
    
    return {
      categories: categories.map(cat => ({ value: cat!, label: cat! })),
      mediaTypes: mediaTypes.map(type => ({ value: type!, label: type! })),
    };
  }, [items]);

  // Event handlers
  const handleSearch = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    onSearch?.(query);
    
    // Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag('event', 'portfolio_search', {
        event_category: 'Portfolio Section',
        event_label: query,
        section_variant: variant,
        analytics_context: analyticsContext,
      });
    }
  }, [onSearch, variant, analyticsContext]);

  const handleFilter = useCallback((key: string, value: any) => {
    setState(prev => ({ 
      ...prev, 
      filters: { ...prev.filters, [key]: value }
    }));
    onFilter?.({ [key]: value });
  }, [onFilter]);

  const handleLoadMore = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      visibleItems: prev.visibleItems + maxItems 
    }));
    onLoadMore?.();
  }, [maxItems, onLoadMore]);

  const handleItemClick = useCallback((project: Project, index: number) => {
    onItemClick?.(project, index);
    
    // Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag('event', 'portfolio_item_click', {
        event_category: 'Portfolio Section',
        event_label: project.id,
        section_variant: variant,
        analytics_context: analyticsContext,
      });
    }
  }, [onItemClick, variant, analyticsContext]);

  const handleModalOpen = useCallback((project: Project, index: number) => {
    setState(prev => ({ 
      ...prev, 
      selectedProject: project, 
      modalOpen: true 
    }));
    onModalOpen?.(project, index);
  }, [onModalOpen]);

  const handleViewAllClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    onViewAllClick?.(event);
    
    // Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag('event', 'portfolio_view_all_click', {
        event_category: 'Portfolio Section',
        section_variant: variant,
        analytics_context: analyticsContext,
      });
    }
  }, [onViewAllClick, variant, analyticsContext]);

  // Gallery component selection with normalized data
  const renderGallery = useCallback(() => {
    const sanitizedItems = sanitizeItemsForGallery(processedItems);
    
    const commonProps = {
      items: sanitizedItems,
      layout,
      size,
      showTitles,
      onItemClick: handleItemClick,
      onModalOpen: handleModalOpen,
      'aria-label': ariaLabel || `${variant} portfolio gallery`,
    };

    switch (variant) {
      case 'video':
        return (
          <VideoPortfolioGallery 
            {...commonProps}
            variant="grid"
            maxItems={maxItems}
          />
        );
      case 'interactive':
        return (
          <PortfolioDemo 
            {...commonProps}
            variant="hub"
            max={maxItems}
          />
        );
      case 'gallery':
      default:
        return (
          <StandardPortfolioGallery 
            {...commonProps}
            variant="grid" 
            columns={3}
            showSearch={showSearch}
            showFilters={showFilters}
          />
        );
    }
  }, [
    processedItems, 
    layout, 
    size, 
    showTitles, 
    variant, 
    maxItems, 
    showSearch, 
    showFilters,
    handleItemClick, 
    handleModalOpen, 
    ariaLabel
  ]);

  // CSS classes
  const sectionClasses = [
    styles.section,
    className
  ].filter(Boolean).join(' ');

  // Empty state
  if (!items.length) {
    return (
      <section
        id={sectionId}
        className={sectionClasses}
        data-background={background}
        aria-labelledby={ariaLabelledBy || (title ? headingId : undefined)}
        aria-describedby={ariaDescribedBy}
        {...htmlProps}
      >
        {title && (
          <header className={styles.header}>
            <div className={styles.headerContent}>
              <h2 id={headingId} className={styles.title}>{title}</h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
              {description && <p className={styles.description}>{description}</p>}
            </div>
          </header>
        )}
        
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>No Portfolio Items</div>
          <p className={styles.emptyDescription}>
            There are currently no portfolio items to display in this section.
          </p>
          {viewAllHref && (
            <a href={viewAllHref} className={styles.emptyAction}>
              Browse All Work
            </a>
          )}
        </div>
      </section>
    );
  }

  // Filtered empty state
  if (processedItems.length === 0 && (state.searchQuery || Object.keys(state.filters).length)) {
    return (
      <section
        id={sectionId}
        className={sectionClasses}
        data-background={background}
        aria-labelledby={ariaLabelledBy || (title ? headingId : undefined)}
        aria-describedby={ariaDescribedBy}
        {...htmlProps}
      >
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>No Results Found</div>
          <p className={styles.emptyDescription}>
            Try adjusting your search or filter criteria.
          </p>
          <button 
            className={styles.emptyAction}
            onClick={() => setState(prev => ({ ...prev, searchQuery: '', filters: {} }))}
          >
            Clear Filters
          </button>
        </div>
      </section>
    );
  }

  return (
    <SectionErrorBoundary onError={onError}>
      <section
        id={sectionId}
        className={sectionClasses}
        data-background={background}
        data-variant={variant}
        aria-labelledby={ariaLabelledBy || (title ? headingId : undefined)}
        aria-describedby={ariaDescribedBy}
        {...htmlProps}
      >
        {/* Header */}
        {(title || subtitle || description) && (
          <header className={styles.header}>
            <div className={styles.headerContent}>
              {title && <h2 id={headingId} className={styles.title}>{title}</h2>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
              {description && <p className={styles.description}>{description}</p>}
            </div>
          </header>
        )}

        {/* Controls */}
        {(showSearch || showFilters || showItemCount || viewAllHref) && (
          <div className={styles.controls}>
            <div className={styles.topControls}>
              {showItemCount && (
                <div className={styles.itemCount}>
                  {processedItems.length} of {items.length} item{items.length !== 1 ? 's' : ''}
                </div>
              )}
              
              {viewAllHref && (
                <a
                  href={viewAllHref}
                  className={styles.viewAllLink}
                  onClick={handleViewAllClick}
                  aria-label={`${viewAllText} ${title || 'portfolio items'}`}
                >
                  {viewAllText}
                  <svg 
                    className={styles.viewAllIcon}
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </a>
              )}
            </div>

            {(showSearch || showFilters) && (
              <div className={styles.searchFilters}>
                {showSearch && (
                  <input
                    type="search"
                    className={styles.searchInput}
                    placeholder="Search portfolio..."
                    value={state.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    aria-label="Search portfolio items"
                  />
                )}
                
                {showFilters && (
                  <div className={styles.filters}>
                    {filterOptions.categories.length > 0 && (
                      <select
                        className={styles.filterButton}
                        value={state.filters.category || 'all'}
                        onChange={(e) => handleFilter('category', e.target.value === 'all' ? null : e.target.value)}
                        aria-label="Filter by category"
                      >
                        <option value="all">All Categories</option>
                        {filterOptions.categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {filterOptions.mediaTypes.length > 0 && (
                      <select
                        className={styles.filterButton}
                        value={state.filters.mediaType || 'all'}
                        onChange={(e) => handleFilter('mediaType', e.target.value === 'all' ? null : e.target.value)}
                        aria-label="Filter by media type"
                      >
                        <option value="all">All Types</option>
                        {filterOptions.mediaTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    <button
                      className={styles.filterButton}
                      data-active={state.filters.featured === true}
                      onClick={() => handleFilter('featured', state.filters.featured ? null : true)}
                      aria-label="Filter featured items"
                      type="button"
                    >
                      Featured Only
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={styles.content}>
          <div 
            className={styles.galleryWrapper}
            data-loading={loading}
          >
            {loading ? (
              <LoadingFallback />
            ) : (
              <React.Suspense fallback={<LoadingFallback />}>
                {renderGallery()}
              </React.Suspense>
            )}
          </div>
        </div>

        {/* Load More */}
        {showLoadMore && processedItems.length < items.length && (
          <div className={styles.loadMore}>
            <button
              className={styles.loadMoreButton}
              onClick={handleLoadMore}
              disabled={loading}
              aria-label={`Load more portfolio items (${items.length - processedItems.length} remaining)`}
              type="button"
            >
              {loading ? 'Loading...' : `Load More (${items.length - processedItems.length} remaining)`}
            </button>
          </div>
        )}
      </section>
    </SectionErrorBoundary>
  );
}