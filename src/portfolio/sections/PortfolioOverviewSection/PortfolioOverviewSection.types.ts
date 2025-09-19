// ===================================================================
// PortfolioOverviewSection.types.ts - Production Ready
// ===================================================================

import type { ComponentPropsWithoutRef } from 'react';

// ----------------------------
// Layout & Background Options
// ----------------------------

export type OverviewLayout = "two-column" | "stacked" | "stats-first";
export type OverviewBackground = "surface" | "muted" | "elevated" | "accent";

export interface OverviewCTA {
  label: string;
  href: string;
  target?: "_self" | "_blank";
  rel?: string;
  ariaLabel?: string;
}

// ----------------------------
// Authoring-friendly shapes
// ----------------------------

export interface OverviewTextContent {
  headline: string;
  description: string;
  highlights?: string[];
  cta?: OverviewCTA;
}

export interface StatItem {
  label: string;
  value: string | number;
  helpText?: string;
}

export interface OverviewStatistics {
  title?: string;
  stats: StatItem[];
  variant?: "compact" | "detailed";
}

/**
 * Raw input for PortfolioOverviewSection - author-friendly format
 */
export interface PortfolioOverviewSectionInput {
  // Section shell
  sectionTitle?: string;
  sectionId?: string;
  background?: OverviewBackground;
  layout?: OverviewLayout;
  reverse?: boolean;
  className?: string;

  // Content
  text?: OverviewTextContent;
  statistics?: OverviewStatistics;
}

// ----------------------------
// Child component props interfaces
// ----------------------------

export interface PortfolioOverviewTextProps {
  title?: string;
  subtitle?: string;
  paragraphs?: string[];
  variant?: "default" | "services" | "about" | "marketing";
  className?: string;
  showCTA?: boolean;
  ctaText?: string;
  ctaHref?: string;
  ctaTarget?: "_self" | "_blank";
  ctaRel?: string;
  ctaAriaLabel?: string;
}

export interface PortfolioStatsSectionProps {
  variant?: "portfolio" | "company" | "services" | "performance";
  layout?: "horizontal" | "grid";
  showTrends?: boolean;
  showIcons?: boolean;
  animated?: boolean;
  className?: string;
  customStats?: Array<{
    id?: string;
    label: string;
    value: string | number;
    suffix?: string;
    icon?: string;
    color?: string;
    animationType?: string;
    highlight?: boolean;
    trend?: {
      direction?: "up" | "down";
      value?: string | number;
      period?: string;
    };
  }>;
}

// ----------------------------
// Component props (presentational)
// ----------------------------

/**
 * Props consumed directly by PortfolioOverviewSection component
 */
export interface PortfolioOverviewSectionProps extends ComponentPropsWithoutRef<'section'> {
  // Section configuration
  sectionTitle?: string;
  sectionId?: string;
  background?: OverviewBackground;
  layout?: OverviewLayout;
  reverse?: boolean;

  // Child component props (pre-adapted)
  textProps?: PortfolioOverviewTextProps;
  statsProps?: PortfolioStatsSectionProps;

  // Behavior
  onError?: (error: Error) => void;

  // Styling (className inherited from ComponentPropsWithoutRef)
}

// ----------------------------
// Configuration constants
// ----------------------------

export const DEFAULTS = {
  sectionTitle: "Driving Results Across Every Industry",
  background: "surface" as OverviewBackground,
  layout: "two-column" as OverviewLayout,
  reverse: false,
} as const;

export const OVERVIEW_LAYOUTS = ["two-column", "stacked", "stats-first"] as const;
export const OVERVIEW_BACKGROUNDS = ["surface", "muted", "elevated", "accent"] as const;