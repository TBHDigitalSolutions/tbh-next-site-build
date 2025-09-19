// ===================================================================
// /src/search/ui/Filters.tsx
// ===================================================================
// Search filters component with chips and dropdowns

"use client";

import React from 'react';
import type { SearchType, SearchFilters } from '../core/types';
import styles from './search.module.css';

export interface FiltersProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  availableTypes?: SearchType[];
  availableServiceKeys?: string[];
  availableCategories?: string[];
  showTypeFilter?: boolean;
  showServiceFilter?: boolean;
  showCategoryFilter?: boolean;
  showFeaturedFilter?: boolean;
  showDateFilter?: boolean;
  className?: string;
}

/**
 * Search filters component with chips and dropdowns
 */
export default function Filters({
  filters,
  onChange,
  availableTypes = ['hub', 'service', 'subservice', 'portfolio', 'package', 'case-study', 'content', 'tool'],
  availableServiceKeys = ['video', 'web', 'seo', 'marketing', 'content', 'leadgen'],
  availableCategories = [],
  showTypeFilter = true,
  showServiceFilter = true,
  showCategoryFilter = false,
  showFeaturedFilter = true,
  showDateFilter = false,
  className = ''
}: FiltersProps) {
  const handleTypeToggle = (type: SearchType) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onChange({ ...filters, types: newTypes.length > 0 ? newTypes : undefined });
  };

  const handleServiceKeyChange = (serviceKey: string) => {
    onChange({ ...filters, serviceKey: serviceKey || undefined });
  };

  const handleCategoryChange = (category: string) => {
    onChange({ ...filters, category: category || undefined });
  };

  const handleFeaturedToggle = () => {
    onChange({ 
      ...filters, 
      featured: filters.featured === true ? undefined : true 
    });
  };

  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    const dateRange = filters.dateRange || {};
    const newDateRange = { ...dateRange, [field]: value || undefined };
    
    // Remove dateRange if both from and to are empty
    if (!newDateRange.from && !newDateRange.to) {
      onChange({ ...filters, dateRange: undefined });
    } else {
      onChange({ ...filters, dateRange: newDateRange });
    }
  };

  const clearAllFilters = () => {
    onChange({ query: filters.query });
  };

  const getTypeLabel = (type: SearchType): string => {
    const labels: Record<SearchType, string> = {
      hub: 'Services',
      service: 'Categories',
      subservice: 'Specialties',
      portfolio: 'Portfolio',
      package: 'Packages',
      'case-study': 'Case Studies',
      content: 'Content',
      tool: 'Tools'
    };
    return labels[type] || type;
  };

  const getServiceKeyLabel = (serviceKey: string): string => {
    const labels: Record<string, string> = {
      video: 'Video Production',
      web: 'Web Development',
      seo: 'SEO Services',
      marketing: 'Marketing Automation',
      content: 'Content Production',
      leadgen: 'Lead Generation'
    };
    return labels[serviceKey] || serviceKey;
  };

  const hasActiveFilters = !!(
    (filters.types && filters.types.length > 0) ||
    filters.serviceKey ||
    filters.category ||
    filters.featured ||
    filters.dateRange
  );

  return (
    <div className={`${styles.filters} ${className}`} role="group" aria-label="Search filters">
      {/* Type Filter */}
      {showTypeFilter && (
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Content Type:</span>
          {availableTypes.map(type => (
            <button
              key={type}
              type="button"
              className={`${styles.filterChip} ${
                filters.types?.includes(type) ? styles.active : ''
              }`}
              onClick={() => handleTypeToggle(type)}
              aria-pressed={filters.types?.includes(type) || false}
              aria-label={`Filter by ${getTypeLabel(type)}`}
            >
              {getTypeLabel(type)}
            </button>
          ))}
        </div>
      )}

      {/* Service Key Filter */}
      {showServiceFilter && (
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="service-filter">
            Service Area:
          </label>
          <select
            id="service-filter"
            className={styles.filterSelect}
            value={filters.serviceKey || ''}
            onChange={(e) => handleServiceKeyChange(e.target.value)}
          >
            <option value="">All Services</option>
            {availableServiceKeys.map(serviceKey => (
              <option key={serviceKey} value={serviceKey}>
                {getServiceKeyLabel(serviceKey)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category Filter */}
      {showCategoryFilter && availableCategories.length > 0 && (
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="category-filter">
            Category:
          </label>
          <select
            id="category-filter"
            className={styles.filterSelect}
            value={filters.category || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Featured Filter */}
      {showFeaturedFilter && (
        <div className={styles.filterGroup}>
          <button
            type="button"
            className={`${styles.filterChip} ${filters.featured ? styles.active : ''}`}
            onClick={handleFeaturedToggle}
            aria-pressed={filters.featured || false}
            aria-label="Show only featured content"
          >
            Featured Only
          </button>
        </div>
      )}

      {/* Date Range Filter */}
      {showDateFilter && (
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Date Range:</span>
          <input
            type="date"
            className={styles.filterSelect}
            value={filters.dateRange?.from || ''}
            onChange={(e) => handleDateRangeChange('from', e.target.value)}
            aria-label="From date"
            style={{ marginRight: '0.5rem' }}
          />
          <input
            type="date"
            className={styles.filterSelect}
            value={filters.dateRange?.to || ''}
            onChange={(e) => handleDateRangeChange('to', e.target.value)}
            aria-label="To date"
          />
        </div>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className={styles.filterGroup}>
          <button
            type="button"
            className={styles.filterChip}
            onClick={clearAllFilters}
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}