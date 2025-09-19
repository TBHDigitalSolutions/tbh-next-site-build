// ===================================================================
// /src/components/portfolio/PortfolioOverviewSection/PortfolioOverviewSection.tsx
// ===================================================================
// Complete portfolio overview section combining text and stats
// - Pure presentational component (no adapters, no validators)
// - Imports its prop type from *.types.ts to avoid cycles
// ===================================================================

"use client";

import React, { useId } from "react";
import PortfolioOverviewText from "../PortfolioOverviewText/PortfolioOverviewText";
import PortfolioStatsSection from "../PortfolioStatsSection/PortfolioStatsSection";
import TwoColumnSection from "@/components/sections/section-layouts/TwoColumnSection/TwoColumnSection";
import type { PortfolioOverviewSectionProps } from "./PortfolioOverviewSection.types";

export default function PortfolioOverviewSection({
  // Section shell
  sectionTitle = "Driving Results Across Every Industry",
  sectionId,
  background = "var(--color-neutral-50)",

  // Child props (already adapted)
  textProps = {},
  statsProps = {},

  // Layout
  layout = "two-column",
  reverse = false,

  // Styling
  className = "",
}: PortfolioOverviewSectionProps) {
  // Ensure a stable accessible label if no explicit id is provided
  const autoId = useId();
  const resolvedSectionId = sectionId || `portfolio-overview-${autoId}`;
  const headingId = `${resolvedSectionId}-heading`;

  const textComponent = <PortfolioOverviewText {...textProps} />;
  const statsComponent = <PortfolioStatsSection {...statsProps} />;

  // Stacked (text above stats)
  if (layout === "stacked") {
    return (
      <section
        id={resolvedSectionId}
        className={className}
        aria-labelledby={headingId}
        role="region"
        style={{ background }}
      >
        {sectionTitle && (
          <h2 id={headingId} style={{ margin: "0 0 1.25rem 0" }}>
            {sectionTitle}
          </h2>
        )}
        <div style={{ marginBottom: "3rem" }}>{textComponent}</div>
        <div>{statsComponent}</div>
      </section>
    );
  }

  // Stats-first (stats above text)
  if (layout === "stats-first") {
    return (
      <section
        id={resolvedSectionId}
        className={className}
        aria-labelledby={headingId}
        role="region"
        style={{ background }}
      >
        {sectionTitle && (
          <h2 id={headingId} style={{ margin: "0 0 1.25rem 0" }}>
            {sectionTitle}
          </h2>
        )}
        <div style={{ marginBottom: "3rem" }}>{statsComponent}</div>
        <div>{textComponent}</div>
      </section>
    );
  }

  // Default: two-column layout using shared layout component
  return (
    <TwoColumnSection
      sectionTitle={sectionTitle}
      sectionId={resolvedSectionId}
      leftContent={reverse ? statsComponent : textComponent}
      rightContent={reverse ? textComponent : statsComponent}
      lightBg={background}
      isReverse={reverse}
      className={className}
      headingId={headingId} // if TwoColumnSection supports passing heading id
    />
  );
}
