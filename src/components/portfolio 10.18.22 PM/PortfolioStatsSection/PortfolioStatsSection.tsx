// ===================================================================
// /src/components/portfolio/PortfolioStatsSection/PortfolioStatsSection.tsx
// ===================================================================
// Pure presentational wrapper around ResultsStatsStrip.
// No hard-coded demo data. Renders nothing if no stats.
// ===================================================================

"use client";

import React from "react";
import { ResultsStatsStrip } from "@/components/ui/organisms/ResultsStatsStrip/ResultsStatsStrip";
import type { PortfolioStatsSectionProps } from "./PortfolioStatsSection.types";

export default function PortfolioStatsSection({
  customStats,
  layout = "horizontal",
  showTrends = false,
  showIcons = true,
  animated = true,
  className = "",
}: PortfolioStatsSectionProps) {
  if (!customStats || customStats.length === 0) {
    // Intentionally render nothing to avoid misleading placeholders
    return null;
  }

  return (
    <ResultsStatsStrip
      stats={customStats}
      layout={layout}
      animateOnScroll={animated}
      showIcons={showIcons}
      showTrends={showTrends}
      background="transparent"
      size="medium"
      centered={true}
      className={className}
    />
  );
}
