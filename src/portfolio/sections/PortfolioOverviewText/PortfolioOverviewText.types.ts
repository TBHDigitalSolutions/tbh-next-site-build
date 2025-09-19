// ===================================================================
// PortfolioOverviewText.types.ts - Production Ready Types
// ===================================================================

import type { ComponentPropsWithoutRef } from 'react';

// ----------------------------
// Configuration Types
// ----------------------------

export type TextVariant = "default" | "services" | "about" | "marketing";
export type TextSize = "small" | "medium" | "large";
export type TextAlign = "left" | "center" | "right";

export interface OverviewCTA {
  label: string;
  href: string;
  target?: "_self" | "_blank";
  rel?: string;
  ariaLabel?: string;
  variant?: "primary" | "secondary" | "outline";
}

// ----------------------------
// Input Types (Authoring)
// ----------------------------

export interface PortfolioOverviewTextInput {
  // Content
  headline?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  paragraphs?: string[];
  highlights?: string[];
  
  // CTA
  cta?: OverviewCTA;
  
  // Configuration
  variant?: TextVariant;
  size?: TextSize;
  align?: TextAlign;
  className?: string;
  maxWidth?: string;
  
  // Behavior
  showReadMore?: boolean;
  readMoreText?: string;
  readLessText?: string;
  truncateAt?: number;
}

// ----------------------------
// Component Props (Presentational)
// ----------------------------

export interface PortfolioOverviewTextProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  // Primary content
  title?: string;
  subtitle?: string;
  paragraphs?: string[];
  
  // Configuration
  variant?: TextVariant;
  size?: TextSize;
  align?: TextAlign;
  maxWidth?: string;
  
  // CTA
  showCTA?: boolean;
  ctaText?: string;
  ctaHref?: string;
  ctaTarget?: "_self" | "_blank";
  ctaRel?: string;
  ctaAriaLabel?: string;
  ctaVariant?: "primary" | "secondary" | "outline";
  
  // Interactive features
  showReadMore?: boolean;
  readMoreText?: string;
  readLessText?: string;
  truncateAt?: number;
  
  // Behavior
  onCTAClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onReadMoreToggle?: (expanded: boolean) => void;
  
  // Accessibility
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// ----------------------------
// Constants & Defaults
// ----------------------------

export const TEXT_VARIANTS = ["default", "services", "about", "marketing"] as const;
export const TEXT_SIZES = ["small", "medium", "large"] as const;
export const TEXT_ALIGNMENTS = ["left", "center", "right"] as const;
export const CTA_VARIANTS = ["primary", "secondary", "outline"] as const;

export const DEFAULTS = {
  variant: "default" as TextVariant,
  size: "medium" as TextSize,
  align: "left" as TextAlign,
  headingLevel: 2 as const,
  showReadMore: false,
  truncateAt: 200,
  readMoreText: "Read more",
  readLessText: "Read less",
  ctaVariant: "primary" as const,
  ctaTarget: "_self" as const,
} as const;

// ----------------------------
// Type Guards
// ----------------------------

export function isTextVariant(value: unknown): value is TextVariant {
  return typeof value === 'string' && TEXT_VARIANTS.includes(value as TextVariant);
}

export function isTextSize(value: unknown): value is TextSize {
  return typeof value === 'string' && TEXT_SIZES.includes(value as TextSize);
}

export function isTextAlign(value: unknown): value is TextAlign {
  return typeof value === 'string' && TEXT_ALIGNMENTS.includes(value as TextAlign);
}

export function isCTAVariant(value: unknown): value is OverviewCTA['variant'] {
  return typeof value === 'string' && CTA_VARIANTS.includes(value as any);
}