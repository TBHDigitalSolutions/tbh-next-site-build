// /src/portfolio/lib/metrics.ts

/**
 * Normalize numeric values for display
 */
export function formatMetricValue(value: string | number): string {
  if (typeof value === 'string') {
    // Return if already formatted
    if (value.includes('%') || value.includes('K') || value.includes('M')) {
      return value;
    }
    
    // Try to parse as number
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    value = num;
  }

  if (typeof value === 'number') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  return String(value);
}

/**
 * Coerce metrics to safe display format
 */
export function normalizeMetrics(metrics: any[]): { label: string; value: string }[] {
  if (!Array.isArray(metrics)) return [];
  
  return metrics
    .filter(m => m && typeof m === 'object')
    .map(m => ({
      label: String(m.label || m.name || ''),
      value: formatMetricValue(m.value || '')
    }))
    .filter(m => m.label && m.value);
}

/**
 * Sanitize video items for safe rendering
 */
export function sanitizeVideoItems(items: any[]): any[] {
  if (!Array.isArray(items)) return [];
  
  return items.map(item => ({
    ...item,
    metrics: normalizeMetrics(item.metrics || [])
  }));
}

---

// /src/portfolio/lib/metrics.ts
import type { Project } from './types';

/**
 * Format metric values for display
 */
export function formatMetricValue(value: string | number): string {
  if (typeof value === 'string') {
    if (value.includes('%') || value.includes('K') || value.includes('M')) {
      return value;
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    value = num;
  }

  if (typeof value === 'number') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }

  return String(value);
}

/**
 * Sanitize video items for safe rendering in VideoPortfolioGallery
 */
export function sanitizeVideoItems(items: Project[]): Project[] {
  return items.map(item => {
    if (!item.metrics) return item;
    
    const normalizedMetrics: Record<string, string | number> = {};
    
    if (Array.isArray(item.metrics)) {
      item.metrics.forEach(metric => {
        if (metric.label && metric.value != null) {
          normalizedMetrics[metric.label] = formatMetricValue(metric.value);
        }
      });
    } else if (typeof item.metrics === 'object') {
      Object.entries(item.metrics).forEach(([key, value]) => {
        if (value != null) {
          normalizedMetrics[key] = formatMetricValue(value);
        }
      });
    }
    
    return {
      ...item,
      metrics: normalizedMetrics
    };
  });
}

/**
 * Normalize metrics for consistent display
 */
export function normalizeMetrics(metrics: any[]): { label: string; value: string }[] {
  if (!Array.isArray(metrics)) return [];
  
  return metrics
    .filter(m => m && typeof m === 'object')
    .map(m => ({
      label: String(m.label || m.name || ''),
      value: formatMetricValue(m.value || '')
    }))
    .filter(m => m.label && m.value);
}