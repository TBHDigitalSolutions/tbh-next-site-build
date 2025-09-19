// ===================================================================
// /src/components/portfolio/PortfolioOverviewText/PortfolioOverviewText.types.ts
// ===================================================================

export type OverviewTextVariant = "default" | "services" | "about" | "marketing";

/** Author-facing input (page data) */
export interface OverviewTextInput {
  headline?: string;            // maps → title
  subtitle?: string;
  description?: string;         // maps → first paragraph
  highlights?: string[];        // appended after description
  cta?: { label: string; href: string }; // maps → showCTA + ctaText + ctaHref
  variant?: OverviewTextVariant;
  className?: string;
}

/** Presentational props (consumed by the TSX) */
export interface PortfolioOverviewTextProps {
  title?: string;
  subtitle?: string;
  paragraphs?: string[];
  variant?: OverviewTextVariant;
  className?: string;
  showCTA?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

/** Safe defaults used by adapters */
export const TEXT_DEFAULTS = {
  title: "Driving Results Across Every Industry",
  variant: "default" as OverviewTextVariant,
  paragraphs: [] as string[],
};
