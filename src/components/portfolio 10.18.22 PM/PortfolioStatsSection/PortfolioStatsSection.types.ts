// ===================================================================
// /src/components/portfolio/PortfolioStatsSection/PortfolioStatsSection.types.ts
// ===================================================================

import type { StatItem } from "@/components/ui/organisms/ResultsStatsStrip/ResultsStatsStrip";

/**
 * Presentational props consumed by PortfolioStatsSection.tsx.
 * Provide either `customStats` directly OR pass through layout/flags only.
 * Component renders nothing if no stats are provided (by design).
 */
export interface PortfolioStatsSectionProps {
  /** Provide the exact stats to render (already adapted to StatItem). */
  customStats?: StatItem[];

  /** Layout and UI flags forwarded to ResultsStatsStrip */
  layout?: "horizontal" | "grid";
  showTrends?: boolean;
  showIcons?: boolean;
  animated?: boolean;
  className?: string;

  /**
   * @deprecated Avoid using internal presets. Move any “variant” logic to adapters/data.
   * Kept temporarily for backward compatibility; has no effect if `customStats` is provided.
   */
  variant?: "portfolio" | "company" | "services" | "performance";
}
