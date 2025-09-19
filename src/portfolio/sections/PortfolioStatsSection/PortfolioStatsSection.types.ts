// ===================================================================
// PortfolioStatsSection.types.ts - Production Ready Types
// ===================================================================

import type { ComponentPropsWithoutRef } from 'react';

// ----------------------------
// Configuration Types
// ----------------------------

export type StatsVariant = "portfolio" | "company" | "services" | "performance";
export type StatsLayout = "horizontal" | "grid" | "vertical";
export type StatsSize = "small" | "medium" | "large";
export type AnimationType = "fade" | "slide" | "count" | "none";

// ----------------------------
// Stat Item Types
// ----------------------------

export interface StatTrend {
  direction: "up" | "down" | "neutral";
  value: string | number;
  period?: string;
  label?: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  suffix?: string;
  prefix?: string;
  icon?: string;
  color?: string;
  highlight?: boolean;
  trend?: StatTrend;
  helpText?: string;
  animationType?: AnimationType;
}

// ----------------------------
// Input Types (Authoring)
// ----------------------------

export interface SimpleStatInput {
  label: string;
  value: string | number;
  helpText?: string;
}

export interface PortfolioStatsSectionInput {
  // Content
  title?: string;
  subtitle?: string;
  description?: string;
  stats?: Array<StatItem | SimpleStatInput>;
  
  // Configuration
  variant?: StatsVariant;
  layout?: StatsLayout;
  size?: StatsSize;
  
  // Display options
  showTrends?: boolean;
  showIcons?: boolean;
  animated?: boolean;
  showHelp?: boolean;
  
  // Styling
  className?: string;
  background?: string;
  compact?: boolean;
}

// ----------------------------
// Component Props (Presentational)
// ----------------------------

export interface PortfolioStatsSectionProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  // Content
  title?: string;
  subtitle?: string;
  description?: string;
  
  // Stats data
  customStats?: StatItem[];
  
  // Configuration
  variant?: StatsVariant;
  layout?: StatsLayout;
  size?: StatsSize;
  
  // Display features
  showTrends?: boolean;
  showIcons?: boolean;
  animated?: boolean;
  showHelp?: boolean;
  compact?: boolean;
  
  // Behavior
  onStatClick?: (stat: StatItem, index: number) => void;
  onTrendClick?: (trend: StatTrend, stat: StatItem) => void;
  
  // Analytics
  analyticsContext?: string;
  
  // Accessibility
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  
  // Loading state
  loading?: boolean;
  
  // Background
  background?: string;
}

// ----------------------------
// Preset Stats Types
// ----------------------------

export interface PortfolioStats {
  projectsCompleted: number;
  clientsSatisfied: number;
  averageRating: number;
  yearsExperience: number;
  technologiesUsed?: number;
  awardswon?: number;
}

export interface CompanyStats {
  revenue: string | number;
  employees: number;
  clients: number;
  marketShare?: string;
  growth?: string;
  satisfaction?: string;
}

export interface PerformanceStats {
  conversionRate: string;
  trafficIncrease: string;
  revenueGrowth: string;
  loadTime: string;
  seoRanking?: number;
  engagement?: string;
}

// ----------------------------
// Constants & Defaults
// ----------------------------

export const STATS_VARIANTS = ["portfolio", "company", "services", "performance"] as const;
export const STATS_LAYOUTS = ["horizontal", "grid", "vertical"] as const;
export const STATS_SIZES = ["small", "medium", "large"] as const;
export const ANIMATION_TYPES = ["fade", "slide", "count", "none"] as const;

export const DEFAULTS = {
  variant: "portfolio" as StatsVariant,
  layout: "horizontal" as StatsLayout,
  size: "medium" as StatsSize,
  showTrends: false,
  showIcons: true,
  animated: true,
  showHelp: false,
  compact: false,
  analyticsContext: "portfolio_stats",
  loading: false,
} as const;

// Default icon mappings for different stat types
export const DEFAULT_ICONS = {
  projects: "📁",
  clients: "👥",
  rating: "⭐",
  experience: "🕐",
  revenue: "💰",
  growth: "📈",
  satisfaction: "😊",
  conversion: "🎯",
  traffic: "📊",
  performance: "⚡",
} as const;

// Default colors for different variants
export const VARIANT_COLORS = {
  portfolio: "var(--accent-primary)",
  company: "var(--success-primary)",
  services: "var(--info-primary)",
  performance: "var(--warning-primary)",
} as const;

// ----------------------------
// Type Guards
// ----------------------------

export function isStatsVariant(value: unknown): value is StatsVariant {
  return typeof value === 'string' && STATS_VARIANTS.includes(value as StatsVariant);
}

export function isStatsLayout(value: unknown): value is StatsLayout {
  return typeof value === 'string' && STATS_LAYOUTS.includes(value as StatsLayout);
}

export function isStatsSize(value: unknown): value is StatsSize {
  return typeof value === 'string' && STATS_SIZES.includes(value as StatsSize);
}

export function isAnimationType(value: unknown): value is AnimationType {
  return typeof value === 'string' && ANIMATION_TYPES.includes(value as AnimationType);
}

export function isValidStatItem(item: unknown): item is StatItem {
  return typeof item === 'object' && 
         item !== null && 
         'id' in item && 
         'label' in item && 
         'value' in item &&
         typeof (item as any).id === 'string' &&
         typeof (item as any).label === 'string' &&
         ((item as any).value !== null && (item as any).value !== undefined);
}

export function isSimpleStatInput(item: unknown): item is SimpleStatInput {
  return typeof item === 'object' && 
         item !== null && 
         'label' in item && 
         'value' in item &&
         typeof (item as any).label === 'string' &&
         ((item as any).value !== null && (item as any).value !== undefined);
}

// ----------------------------
// Utility Types
// ----------------------------

export type StatValue = string | number;
export type StatColor = string;
export type StatIcon = string;

export interface StatDisplayOptions {
  showValue: boolean;
  showLabel: boolean;
  showTrend: boolean;
  showIcon: boolean;
  showHelp: boolean;
}

export interface StatAnimation {
  type: AnimationType;
  duration?: number;
  delay?: number;
  easing?: string;
}