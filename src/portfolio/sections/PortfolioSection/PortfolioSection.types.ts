// ===================================================================
// PortfolioSection.types.ts - Production Ready Types
// ===================================================================

import type { ComponentPropsWithoutRef } from 'react';

// ----------------------------
// Core Types
// ----------------------------

export type PortfolioVariant = "gallery" | "video" | "interactive";
export type PortfolioLayout = "grid" | "masonry" | "list";
export type PortfolioSize = "small" | "medium" | "large";

// Project interface (should match your lib/types.ts)
export interface Project {
  id: string;
  title: string;
  description?: string;
  client?: string;
  category?: string;
  tags?: string[];
  featured?: boolean;
  href?: string;
  media?: {
    type: 'image' | 'video' | 'interactive' | 'pdf';
    src: string;
    alt?: string;
    thumbnail?: string;
    poster?: string;
  };
  metrics?: Array<{
    label: string;
    value: string | number;
  }>;
}

// ----------------------------
// Input Types (Authoring)
// ----------------------------

export interface PortfolioSectionInput {
  // Content
  title?: string;
  subtitle?: string;
  description?: string;
  items?: Project[];
  
  // Display configuration
  variant?: PortfolioVariant;
  layout?: PortfolioLayout;
  size?: PortfolioSize;
  
  // Behavior
  maxItems?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showLoadMore?: boolean;
  showTitles?: boolean;
  
  // CTA
  viewAllHref?: string;
  viewAllText?: string;
  
  // Analytics
  analyticsContext?: string;
  
  // Styling
  className?: string;
  background?: string;
}

// ----------------------------
// Component Props (Presentational)  
// ----------------------------

export interface PortfolioSectionProps extends Omit<ComponentPropsWithoutRef<'section'>, 'title'> {
  // Content
  title?: string;
  subtitle?: string;
  description?: string;
  items: Project[];
  
  // Configuration
  variant?: PortfolioVariant;
  layout?: PortfolioLayout;
  size?: PortfolioSize;
  maxItems?: number;
  
  // Features
  showSearch?: boolean;
  showFilters?: boolean;
  showLoadMore?: boolean;
  showTitles?: boolean;
  showItemCount?: boolean;
  
  // View All CTA
  viewAllHref?: string;
  viewAllText?: string;
  onViewAllClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  
  // Interaction callbacks
  onItemClick?: (project: Project, index: number) => void;
  onModalOpen?: (project: Project, index: number) => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, any>) => void;
  onLoadMore?: () => void;
  
  // Error handling
  onError?: (error: Error) => void;
  
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
// Component State Types
// ----------------------------

export interface PortfolioSectionState {
  searchQuery: string;
  filters: Record<string, any>;
  visibleItems: number;
  selectedProject: Project | null;
  modalOpen: boolean;
  loading: boolean;
  error: Error | null;
}

// ----------------------------
// Filter Types
// ----------------------------

export interface PortfolioFilter {
  key: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
    count?: number;
  }>;
  type: 'select' | 'multiselect' | 'toggle' | 'range';
}

export interface PortfolioFilters {
  category?: string[];
  tags?: string[];
  mediaType?: string[];
  featured?: boolean;
  client?: string[];
}

// ----------------------------
// Gallery Component Props
// ----------------------------

export interface GalleryComponentProps {
  items: Project[];
  layout?: PortfolioLayout;
  size?: PortfolioSize;
  showTitles?: boolean;
  onItemClick?: (project: Project, index: number) => void;
  onModalOpen?: (project: Project, index: number) => void;
  className?: string;
  'aria-label'?: string;
}

// ----------------------------
// Constants & Defaults
// ----------------------------

export const PORTFOLIO_VARIANTS = ["gallery", "video", "interactive"] as const;
export const PORTFOLIO_LAYOUTS = ["grid", "masonry", "list"] as const;
export const PORTFOLIO_SIZES = ["small", "medium", "large"] as const;

export const DEFAULTS = {
  variant: "gallery" as PortfolioVariant,
  layout: "grid" as PortfolioLayout,
  size: "medium" as PortfolioSize,
  maxItems: 12,
  showSearch: false,
  showFilters: false,
  showLoadMore: false,
  showTitles: true,
  showItemCount: true,
  viewAllText: "View All",
  analyticsContext: "portfolio_section",
  loading: false,
} as const;

// ----------------------------
// Type Guards
// ----------------------------

export function isPortfolioVariant(value: unknown): value is PortfolioVariant {
  return typeof value === 'string' && PORTFOLIO_VARIANTS.includes(value as PortfolioVariant);
}

export function isPortfolioLayout(value: unknown): value is PortfolioLayout {
  return typeof value === 'string' && PORTFOLIO_LAYOUTS.includes(value as PortfolioLayout);
}

export function isPortfolioSize(value: unknown): value is PortfolioSize {
  return typeof value === 'string' && PORTFOLIO_SIZES.includes(value as PortfolioSize);
}

export function isValidProject(item: unknown): item is Project {
  return typeof item === 'object' && 
         item !== null && 
         'id' in item && 
         'title' in item &&
         typeof (item as any).id === 'string' &&
         typeof (item as any).title === 'string';
}