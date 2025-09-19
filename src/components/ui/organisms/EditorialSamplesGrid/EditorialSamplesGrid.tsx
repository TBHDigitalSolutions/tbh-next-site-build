// ================================================================
// Path: src/components/ui/organisms/EditorialSamplesGrid/EditorialSamplesGrid.tsx
// Fixed EditorialSamplesGrid component with proper error handling
// ================================================================

"use client";

import React, { useState, useMemo } from "react";
import "./EditorialSamplesGrid.css";

// ============================
// TYPE DEFINITIONS
// ============================

export interface EditorialSample {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  featuredImage?: string;
  thumbnailImage?: string;
  category: string;
  tags?: string[];
  author?: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  publishedDate: string;
  readTime?: number; // in minutes
  featured?: boolean;
  priority?: 'high' | 'medium' | 'low';
  type: 'blog' | 'case-study' | 'white-paper' | 'guide' | 'article' | 'tutorial';
  status?: 'published' | 'draft' | 'featured';
  link?: string;
  externalLink?: boolean;
  metrics?: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  };
}

export interface EditorialSamplesGridProps {
  /** Array of editorial samples to display */
  samples?: EditorialSample[]; // Made optional with default
  /** Title for the grid section */
  title?: string;
  /** Subtitle/description for the grid */
  subtitle?: string;
  /** Number of columns in the grid */
  columns?: 2 | 3 | 4;
  /** Maximum number of items to display */
  maxItems?: number;
  /** Show featured items first */
  featuredFirst?: boolean;
  /** Filter by specific content types */
  filterByType?: EditorialSample['type'][];
  /** Filter by category */
  filterByCategory?: string[];
  /** Show filter controls */
  showFilters?: boolean;
  /** Show sort controls */
  showSort?: boolean;
  /** Show pagination */
  showPagination?: boolean;
  /** Items per page for pagination */
  itemsPerPage?: number;
  /** Show read time */
  showReadTime?: boolean;
  /** Show author information */
  showAuthor?: boolean;
  /** Show metrics (views, likes, etc.) */
  showMetrics?: boolean;
  /** Show tags */
  showTags?: boolean;
  /** Custom onClick handler for samples */
  onSampleClick?: (sample: EditorialSample) => void;
  /** Custom CSS class name */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Show "View All" CTA */
  showViewAllCTA?: boolean;
  /** View All CTA link */
  viewAllLink?: string;
  /** Masonry layout (different heights) */
  masonryLayout?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'popular' | 'featured' | 'alphabetical';

// ============================
// UTILITY FUNCTIONS
// ============================

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString; // Return original string if date parsing fails
  }
};

const formatReadTime = (minutes: number): string => {
  return `${minutes} min read`;
};

const formatMetrics = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

const getTypeDisplayName = (type: EditorialSample['type']): string => {
  const typeMap = {
    'blog': 'Blog Post',
    'case-study': 'Case Study',
    'white-paper': 'White Paper',
    'guide': 'Guide',
    'article': 'Article',
    'tutorial': 'Tutorial'
  };
  return typeMap[type] || type;
};

const getTypeIcon = (type: EditorialSample['type']): string => {
  const iconMap = {
    'blog': '📝',
    'case-study': '📊',
    'white-paper': '📄',
    'guide': '📖',
    'article': '📰',
    'tutorial': '🎓'
  };
  return iconMap[type] || '📄';
};

// ============================
// MAIN COMPONENT
// ============================

export const EditorialSamplesGrid: React.FC<EditorialSamplesGridProps> = ({
  samples = [], // Default to empty array
  title = "Latest Editorial Content",
  subtitle,
  columns = 3,
  maxItems,
  featuredFirst = true,
  filterByType,
  filterByCategory,
  showFilters = false,
  showSort = false,
  showPagination = false,
  itemsPerPage = 9,
  showReadTime = true,
  showAuthor = true,
  showMetrics = false,
  showTags = true,
  onSampleClick,
  className = "",
  loading = false,
  emptyMessage = "No editorial content available at the moment.",
  showViewAllCTA = true,
  viewAllLink = "/blog",
  masonryLayout = false,
}) => {
  // ============================
  // SAFETY CHECKS
  // ============================
  
  // Ensure samples is always an array
  const safeSamples = Array.isArray(samples) ? samples : [];

  // ============================
  // STATE MANAGEMENT
  // ============================
  
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // ============================
  // COMPUTED VALUES WITH SAFETY CHECKS
  // ============================
  
  const allTypes = useMemo(() => {
    if (!safeSamples || safeSamples.length === 0) {
      return [];
    }
    
    try {
      const types = Array.from(new Set(
        safeSamples
          .filter(sample => sample && sample.type) // Filter out invalid samples
          .map(sample => sample.type)
      ));
      return types.sort();
    } catch (error) {
      console.warn('EditorialSamplesGrid: Error processing types:', error);
      return [];
    }
  }, [safeSamples]);

  const allCategories = useMemo(() => {
    if (!safeSamples || safeSamples.length === 0) {
      return [];
    }
    
    try {
      const categories = Array.from(new Set(
        safeSamples
          .filter(sample => sample && sample.category) // Filter out invalid samples
          .map(sample => sample.category)
      ));
      return categories.sort();
    } catch (error) {
      console.warn('EditorialSamplesGrid: Error processing categories:', error);
      return [];
    }
  }, [safeSamples]);

  const filteredAndSortedSamples = useMemo(() => {
    if (!safeSamples || safeSamples.length === 0) {
      return [];
    }

    try {
      // Filter out invalid samples first
      let filtered = safeSamples.filter(sample => 
        sample && 
        sample.id && 
        sample.title && 
        sample.category && 
        sample.type &&
        sample.publishedDate
      );

      // Apply type filter
      if (filterByType && filterByType.length > 0) {
        filtered = filtered.filter(sample => filterByType.includes(sample.type));
      }
      if (activeFilter !== 'all') {
        filtered = filtered.filter(sample => sample.type === activeFilter);
      }

      // Apply category filter
      if (filterByCategory && filterByCategory.length > 0) {
        filtered = filtered.filter(sample => filterByCategory.includes(sample.category));
      }
      if (activeCategoryFilter !== 'all') {
        filtered = filtered.filter(sample => sample.category === activeCategoryFilter);
      }

      // Apply sorting
      filtered.sort((a, b) => {
        try {
          switch (sortBy) {
            case 'newest':
              return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
            case 'oldest':
              return new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime();
            case 'popular':
              return (b.metrics?.views || 0) - (a.metrics?.views || 0);
            case 'featured':
              if (a.featured && !b.featured) return -1;
              if (!a.featured && b.featured) return 1;
              return 0;
            case 'alphabetical':
              return a.title.localeCompare(b.title);
            default:
              return 0;
          }
        } catch (error) {
          console.warn('EditorialSamplesGrid: Error sorting samples:', error);
          return 0;
        }
      });

      // Featured first if enabled
      if (featuredFirst && sortBy !== 'featured') {
        const featured = filtered.filter(sample => sample.featured);
        const regular = filtered.filter(sample => !sample.featured);
        filtered = [...featured, ...regular];
      }

      // Apply max items limit
      if (maxItems && maxItems > 0) {
        filtered = filtered.slice(0, maxItems);
      }

      return filtered;
    } catch (error) {
      console.error('EditorialSamplesGrid: Error filtering and sorting samples:', error);
      return [];
    }
  }, [safeSamples, activeFilter, activeCategoryFilter, sortBy, featuredFirst, filterByType, filterByCategory, maxItems]);

  const paginatedSamples = useMemo(() => {
    if (!showPagination) return filteredAndSortedSamples;
    
    try {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredAndSortedSamples.slice(startIndex, endIndex);
    } catch (error) {
      console.warn('EditorialSamplesGrid: Error paginating samples:', error);
      return filteredAndSortedSamples;
    }
  }, [filteredAndSortedSamples, currentPage, itemsPerPage, showPagination]);

  const totalPages = Math.ceil(filteredAndSortedSamples.length / itemsPerPage);

  // ============================
  // EVENT HANDLERS
  // ============================
  
  const handleSampleClick = (sample: EditorialSample) => {
    try {
      if (onSampleClick) {
        onSampleClick(sample);
      } else if (sample.link) {
        if (sample.externalLink) {
          window.open(sample.link, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = sample.link;
        }
      }
    } catch (error) {
      console.error('EditorialSamplesGrid: Error handling sample click:', error);
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (category: string) => {
    setActiveCategoryFilter(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of grid
    try {
      const gridElement = document.querySelector('.editorial-samples-grid');
      if (gridElement) {
        gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (error) {
      console.warn('EditorialSamplesGrid: Error scrolling to grid:', error);
    }
  };

  // ============================
  // RENDER HELPERS
  // ============================
  
  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="editorial-filters">
        <div className="filter-group">
          <label className="filter-label">Type:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            {allTypes.map(type => (
              <button
                key={type}
                className={`filter-btn ${activeFilter === type ? 'active' : ''}`}
                onClick={() => handleFilterChange(type)}
              >
                {getTypeIcon(type)} {getTypeDisplayName(type)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Category:</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeCategoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryFilterChange('all')}
            >
              All
            </button>
            {allCategories.map(category => (
              <button
                key={category}
                className={`filter-btn ${activeCategoryFilter === category ? 'active' : ''}`}
                onClick={() => handleCategoryFilterChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSort = () => {
    if (!showSort) return null;

    return (
      <div className="editorial-sort">
        <label className="sort-label">Sort by:</label>
        <select 
          value={sortBy} 
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="sort-select"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
          <option value="featured">Featured First</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>
    );
  };

  const renderSampleCard = (sample: EditorialSample) => {
    // Additional safety check for individual sample
    if (!sample || !sample.id || !sample.title) {
      console.warn('EditorialSamplesGrid: Invalid sample object:', sample);
      return null;
    }

    return (
      <article
        key={sample.id}
        className={`
          editorial-sample-card
          ${sample.featured ? 'featured' : ''}
          ${masonryLayout ? 'masonry-item' : ''}
        `}
        onClick={() => handleSampleClick(sample)}
      >
        {/* Featured Badge */}
        {sample.featured && (
          <div className="featured-badge">
            ⭐ Featured
          </div>
        )}

        {/* Image */}
        {(sample.featuredImage || sample.thumbnailImage) && (
          <div className="sample-image">
            <img
              src={sample.thumbnailImage || sample.featuredImage}
              alt={sample.title}
              loading="lazy"
              onError={(e) => {
                // Hide image if it fails to load
                const target = e.target as HTMLElement;
                if (target.parentElement) {
                  target.parentElement.style.display = 'none';
                }
              }}
            />
            <div className="image-overlay">
              <span className="type-badge">
                {getTypeIcon(sample.type)} {getTypeDisplayName(sample.type)}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="sample-content">
          {/* Meta Information */}
          <div className="sample-meta">
            <span className="category">{sample.category}</span>
            {showReadTime && sample.readTime && (
              <span className="read-time">{formatReadTime(sample.readTime)}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="sample-title">{sample.title}</h3>

          {/* Excerpt */}
          {sample.excerpt && (
            <p className="sample-excerpt">{sample.excerpt}</p>
          )}

          {/* Tags */}
          {showTags && sample.tags && Array.isArray(sample.tags) && sample.tags.length > 0 && (
            <div className="sample-tags">
              {sample.tags.slice(0, 3).map(tag => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
              {sample.tags.length > 3 && (
                <span className="tag-more">+{sample.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="sample-footer">
            {/* Author */}
            {showAuthor && sample.author && (
              <div className="sample-author">
                {sample.author.avatar && (
                  <img
                    src={sample.author.avatar}
                    alt={sample.author.name}
                    className="author-avatar"
                    onError={(e) => {
                      // Hide avatar if it fails to load
                      const target = e.target as HTMLElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <span className="author-name">{sample.author.name}</span>
              </div>
            )}

            {/* Date */}
            <div className="sample-date">
              {formatDate(sample.publishedDate)}
            </div>
          </div>

          {/* Metrics */}
          {showMetrics && sample.metrics && (
            <div className="sample-metrics">
              {sample.metrics.views && (
                <span className="metric">
                  👁️ {formatMetrics(sample.metrics.views)}
                </span>
              )}
              {sample.metrics.likes && (
                <span className="metric">
                  ❤️ {formatMetrics(sample.metrics.likes)}
                </span>
              )}
              {sample.metrics.shares && (
                <span className="metric">
                  🔗 {formatMetrics(sample.metrics.shares)}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    );
  };

  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    return (
      <div className="editorial-pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Previous
        </button>

        <div className="pagination-numbers">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`pagination-number ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>
    );
  };

  const renderViewAllCTA = () => {
    if (!showViewAllCTA || maxItems || showPagination) return null;

    return (
      <div className="editorial-cta">
        <a href={viewAllLink} className="view-all-btn">
          View All Editorial Content
          <span className="btn-arrow">→</span>
        </a>
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className="editorial-empty-state">
        <div className="empty-icon">📄</div>
        <h3>No Content Found</h3>
        <p>{emptyMessage}</p>
        {safeSamples.length === 0 && (
          <p className="empty-help">
            Editorial content will appear here when it becomes available.
          </p>
        )}
      </div>
    );
  };

  const renderLoadingState = () => {
    return (
      <div className="editorial-loading">
        {Array.from({ length: columns * 2 }, (_, i) => (
          <div key={i} className="loading-card">
            <div className="loading-image"></div>
            <div className="loading-content">
              <div className="loading-line short"></div>
              <div className="loading-line"></div>
              <div className="loading-line"></div>
              <div className="loading-line medium"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ============================
  // MAIN RENDER
  // ============================
  
  if (loading) {
    return (
      <section className={`editorial-samples-grid-container ${className}`}>
        <div className="editorial-header">
          <h2 className="editorial-title">{title}</h2>
          {subtitle && <p className="editorial-subtitle">{subtitle}</p>}
        </div>
        {renderLoadingState()}
      </section>
    );
  }

  if (filteredAndSortedSamples.length === 0 && !loading) {
    return (
      <section className={`editorial-samples-grid-container ${className}`}>
        <div className="editorial-header">
          <h2 className="editorial-title">{title}</h2>
          {subtitle && <p className="editorial-subtitle">{subtitle}</p>}
        </div>
        {renderFilters()}
        {renderSort()}
        {renderEmptyState()}
      </section>
    );
  }

  return (
    <section className={`editorial-samples-grid-container ${className}`}>
      {/* Header */}
      <div className="editorial-header">
        <h2 className="editorial-title">{title}</h2>
        {subtitle && <p className="editorial-subtitle">{subtitle}</p>}
      </div>

      {/* Controls */}
      <div className="editorial-controls">
        {renderFilters()}
        {renderSort()}
      </div>

      {/* Grid */}
      <div
        className={`
          editorial-samples-grid
          grid-columns-${columns}
          ${masonryLayout ? 'masonry-layout' : ''}
        `}
      >
        {paginatedSamples.map(renderSampleCard)}
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* View All CTA */}
      {renderViewAllCTA()}
    </section>
  );
};

export default EditorialSamplesGrid;