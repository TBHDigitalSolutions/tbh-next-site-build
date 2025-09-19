// /src/data/portfolio/metrics.ts
// Metrics normalization and formatting utilities

import type { ProjectMetric } from "./_types";

/**
 * Normalize metrics to ensure safe React rendering
 * Accepts flexible input types and converts to string values
 */
export function normalizeMetrics<T extends { label: unknown; value: unknown }>(
  metrics?: T[]
): ProjectMetric[] {
  if (!metrics || !Array.isArray(metrics)) return [];
  
  return metrics
    .filter((metric) => metric && metric.label != null)
    .map((metric) => ({
      label: String(metric.label).trim(),
      value: formatMetricValue(metric.value),
    }))
    .filter((metric) => metric.label && metric.value);
}

/**
 * Format metric values consistently for display
 */
function formatMetricValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  
  const stringValue = String(value).trim();
  if (!stringValue) return "";
  
  // Handle common metric formats
  if (typeof value === "number") {
    return formatNumber(value);
  }
  
  return stringValue;
}

/**
 * Format numbers for metric display
 */
function formatNumber(value: number): string {
  // Handle percentages
  if (value >= 0 && value <= 1 && value % 1 !== 0) {
    return `${(value * 100).toFixed(1)}%`;
  }
  
  // Handle large numbers with K/M suffixes
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  
  // Handle decimals
  if (value % 1 !== 0) {
    return value.toFixed(2);
  }
  
  return value.toString();
}

/**
 * Validate metric structure for development
 */
export function validateMetrics(metrics: unknown[]): {
  valid: ProjectMetric[];
  invalid: Array<{ index: number; reason: string }>;
} {
  const valid: ProjectMetric[] = [];
  const invalid: Array<{ index: number; reason: string }> = [];
  
  metrics.forEach((metric, index) => {
    if (!metric || typeof metric !== "object") {
      invalid.push({ index, reason: "Not an object" });
      return;
    }
    
    const m = metric as any;
    
    if (!m.label || typeof m.label !== "string" || !m.label.trim()) {
      invalid.push({ index, reason: "Missing or empty label" });
      return;
    }
    
    if (m.value === null || m.value === undefined || String(m.value).trim() === "") {
      invalid.push({ index, reason: "Missing or empty value" });
      return;
    }
    
    valid.push({
      label: String(m.label).trim(),
      value: formatMetricValue(m.value),
    });
  });
  
  return { valid, invalid };
}

/**
 * Create commonly used metric objects
 */
export const createMetric = (label: string, value: string | number): ProjectMetric => ({
  label: label.trim(),
  value: formatMetricValue(value),
});

/**
 * Common metric formatters for specific types
 */
export const metricFormatters = {
  percentage: (value: number) => createMetric("Increase", `+${value}%`),
  money: (value: number, currency = "$") => createMetric("Revenue", `${currency}${formatNumber(value)}`),
  time: (value: number, unit: string) => createMetric("Duration", `${value} ${unit}`),
  count: (value: number, label: string) => createMetric(label, formatNumber(value)),
  ratio: (numerator: number, denominator: number, label: string) => 
    createMetric(label, `${formatNumber(numerator)}:${formatNumber(denominator)}`),
};

/**
 * Convert legacy metric formats to normalized format
 */
export function migrateLegacyMetrics(legacy: any): ProjectMetric[] {
  if (!legacy) return [];
  
  // Handle object format { metricName: value }
  if (typeof legacy === "object" && !Array.isArray(legacy)) {
    return Object.entries(legacy).map(([label, value]) => 
      createMetric(label, value as string | number)
    );
  }
  
  // Handle array format
  if (Array.isArray(legacy)) {
    return normalizeMetrics(legacy);
  }
  
  return [];
}