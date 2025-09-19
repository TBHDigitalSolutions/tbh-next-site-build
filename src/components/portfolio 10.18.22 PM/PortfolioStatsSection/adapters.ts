// ===================================================================
// /src/components/portfolio/PortfolioStatsSection/adapters.ts
// ===================================================================
// Map domain/computed stats → ResultsStatsStrip.StatItem[] for the section.
// Keep ALL opinionated defaults/presets here or in /src/data (not in the .tsx).
// ===================================================================

import type { StatItem } from "@/components/ui/organisms/ResultsStatsStrip/ResultsStatsStrip";
import type { PortfolioStatsSectionProps } from "./PortfolioStatsSection.types";

/** Example domain shape — adjust to your actual computed stats contract */
export interface PortfolioStats {
  projectsCompleted?: number;
  serviceAreas?: number;
  clientSatisfactionPct?: number;
  avgPerformanceIncreasePct?: number;
  avgConversionImprovementPct?: number;
  avgRoiPct?: number;
}

/** Minimal guard to coerce values to StatItem.value (string | number) */
const asValue = (v: unknown) =>
  typeof v === "number" ? v : typeof v === "string" ? v : undefined;

/**
 * fromStats:
 * Map a normalized/computed PortfolioStats object into StatItem[].
 * Only produce items for fields that are present. No hard-coded copy here.
 */
export function fromStats(stats: PortfolioStats): StatItem[] {
  const out: StatItem[] = [];

  if (stats.projectsCompleted != null) {
    out.push({
      id: "projects",
      label: "Projects Completed",
      value: asValue(stats.projectsCompleted)!,
      suffix: "+",
      icon: "projects",
      color: "primary",
      animationType: "counter",
    });
  }

  if (stats.serviceAreas != null) {
    out.push({
      id: "service_areas",
      label: "Service Areas",
      value: asValue(stats.serviceAreas)!,
      icon: "api",
      color: "secondary",
      animationType: "counter",
    });
  }

  if (stats.clientSatisfactionPct != null) {
    out.push({
      id: "satisfaction",
      label: "Client Satisfaction",
      value: asValue(stats.clientSatisfactionPct)!,
      suffix: "%",
      icon: "satisfaction",
      color: "success",
      animationType: "counter",
      highlight: true,
    });
  }

  if (stats.avgPerformanceIncreasePct != null) {
    out.push({
      id: "avg_performance",
      label: "Avg. Performance Increase",
      value: asValue(stats.avgPerformanceIncreasePct)!,
      suffix: "%",
      icon: "performance",
      color: "success",
      animationType: "counter",
    });
  }

  if (stats.avgConversionImprovementPct != null) {
    out.push({
      id: "conversion_improvement",
      label: "Avg. Conversion Improvement",
      value: asValue(stats.avgConversionImprovementPct)!,
      suffix: "%",
      icon: "conversion",
      color: "primary",
      animationType: "counter",
    });
  }

  if (stats.avgRoiPct != null) {
    out.push({
      id: "roi",
      label: "Average ROI",
      value: asValue(stats.avgRoiPct)!,
      suffix: "%",
      icon: "roi",
      color: "warning",
      animationType: "counter",
      highlight: true,
    });
  }

  return out;
}

/**
 * makeSectionProps:
 * Helper to assemble the section props in one go.
 * Use this in page-level composers after computing stats.
 */
export function makeSectionProps(
  stats: PortfolioStats,
  opts?: Omit<PortfolioStatsSectionProps, "customStats">
): PortfolioStatsSectionProps {
  return {
    customStats: fromStats(stats),
    layout: opts?.layout ?? "horizontal",
    showTrends: opts?.showTrends ?? false,
    showIcons: opts?.showIcons ?? true,
    animated: opts?.animated ?? true,
    className: opts?.className ?? "",
  };
}
