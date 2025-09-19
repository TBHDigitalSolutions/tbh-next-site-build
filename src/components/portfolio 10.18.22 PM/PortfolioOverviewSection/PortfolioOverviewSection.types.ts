// ===================================================================
// /src/components/portfolio/PortfolioOverviewSection/PortfolioOverviewSection.types.ts
// ===================================================================
// Defines both the *input contract* (author-facing, for page data & adapters)
// and the *component props* (presentational, consumed by the TSX).
// ===================================================================

import type { PortfolioOverviewTextProps } from "../PortfolioOverviewText/PortfolioOverviewText";
import type { PortfolioStatsSectionProps } from "../PortfolioStatsSection/PortfolioStatsSection";

// ----------------------------
// Layout & CTA
// ----------------------------

export type OverviewLayout = "two-column" | "stacked" | "stats-first";

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
 * Raw input for PortfolioOverviewSection, used in page data & adapters.
 * Author-friendly, minimal, validated by Zod in utils/portfolioOverviewValidator.ts.
 */
export interface PortfolioOverviewSectionInput {
  // Section shell
  sectionTitle?: string;
  sectionId?: string;
  background?: string;
  layout?: OverviewLayout;
  reverse?: boolean;
  className?: string;

  // Content
  text?: OverviewTextContent;
  statistics?: OverviewStatistics;
}

// Convenience defaults (for adapters/validators)
export const DEFAULTS = {
  sectionTitle: "Driving Results Across Every Industry",
  background: "var(--color-neutral-50)",
  layout: "two-column" as OverviewLayout,
  reverse: false,
};

// ----------------------------
// Component-facing props
// ----------------------------

/**
 * Props consumed directly by PortfolioOverviewSection.tsx.
 * These are adapted from PortfolioOverviewSectionInput by adapters.ts.
 */
export interface PortfolioOverviewSectionProps {
  sectionTitle?: string;
  sectionId?: string;
  background?: string;

  textProps?: Partial<PortfolioOverviewTextProps>;
  statsProps?: Partial<PortfolioStatsSectionProps>;

  layout?: OverviewLayout;
  reverse?: boolean;

  className?: string;
}
