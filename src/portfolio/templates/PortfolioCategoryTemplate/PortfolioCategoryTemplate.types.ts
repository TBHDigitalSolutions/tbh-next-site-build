// /src/portfolio/templates/PortfolioCategoryTemplate/PortfolioCategoryTemplate.types.ts

import type { CategorySlug, Project } from "../../lib/types";

/**
 * A lightweight reference to a tool used in this category.
 * Keep it decoupled from any external CMS schema.
 */
export interface ToolItem {
  /** Stable identifier (slug/uuid). */
  id: string;
  /** Human-readable name, e.g., "Next.js". */
  name: string;
  /** Optional small icon (24–40px); served from /public or CDN. */
  iconUrl?: string;
  /** Optional link for more details. */
  href?: string;
}

/**
 * A minimal case study reference for linking out from the category page.
 */
export interface CaseStudy {
  /** Stable identifier (slug/uuid). */
  id: string;
  /** Title shown to users. */
  title: string;
  /** Optional summary (1–2 sentences). */
  summary?: string;
  /** Optional link to the full case study. */
  href?: string;
}

/**
 * A lightweight package reference (cross-sell from the category page).
 */
export interface PackageRef {
  /** Stable identifier (slug/uuid). */
  id: string;
  /** Package display title, e.g., "Growth Starter". */
  title: string;
  /** Optional label shown with price (e.g., "$1,999+" or "Custom"). */
  priceLabel?: string;
  /** Optional link to the package details. */
  href?: string;
}

/**
 * Optional summary metrics for the category.
 * Keep values as formatted strings so the template can render them directly.
 */
export interface CategoryMetrics {
  /** Total projects in this category (raw count). */
  totalProjects: number;
  /** e.g., "6–10 weeks". */
  avgProjectDuration?: string;
  /** e.g., "92%". */
  successRate?: string;
  /** e.g., "4.9/5". */
  clientSatisfaction?: string;
}

/**
 * All data the template needs to render its content area.
 * Items are readonly to discourage mutation in the template.
 */
export interface CategoryPageData {
  /** Portfolio items to render (use the orchestrator to display). */
  items: readonly Project[];
  /** Optional supporting content blocks. */
  tools?: readonly ToolItem[];
  caseStudies?: readonly CaseStudy[];
  recommendedPackages?: readonly PackageRef[];
  /** Optional summary metrics to highlight. */
  metrics?: CategoryMetrics;
}

/**
 * Visual/layout toggles for the template.
 */
export interface CategoryLayoutOptions {
  /** Show the "Tools we use" section if data.tools present. */
  showTools?: boolean;
  /** Show the Case Studies section if data.caseStudies present. */
  showCaseStudies?: boolean;
  /** Show the Recommended Packages section if data.recommendedPackages present. */
  showPackages?: boolean;
  /**
   * Optional column override for grid-based variants (advisory; the section
   * may still choose the best responsive grid).
   */
  gridColumns?: number;
}

/**
 * Analytics and instrumentation knobs.
 */
export interface CategoryAnalyticsOptions {
  /**
   * Base analytics context (e.g., "portfolio_category_web").
   * Passed down to sections; keep stable for event joins.
   */
  context?: string;
  /** If true, enable per-item impression tracking in sections. */
  trackItemViews?: boolean;
}

/**
 * Props expected by the PortfolioCategoryTemplate.
 * This template is **layout-only** and does not fetch data.
 */
export interface PortfolioCategoryTemplateProps {
  /** Canonical category slug (used to pick the viewer variant). */
  category: CategorySlug;
  /** Heading text shown in the hero and header. */
  title: string;
  /** Short description under the title. */
  subtitle: string;

  /** Primary content payload for the page. */
  data: CategoryPageData;

  /** Optional layout toggles. */
  layout?: CategoryLayoutOptions;

  /** Optional analytics configuration. */
  analytics?: CategoryAnalyticsOptions;

  /** Optional DOM hooks for advanced layouts/tests. */
  className?: string;
  id?: string;
  "data-testid"?: string;
}

/** Reasonable defaults the template may use if no layout options provided. */
export const DEFAULT_CATEGORY_LAYOUT: Readonly<Required<Pick<CategoryLayoutOptions,
  "showTools" | "showCaseStudies" | "showPackages"
>>> = Object.freeze({
  showTools: false,
  showCaseStudies: false,
  showPackages: false,
});

/** Default analytics options when none are provided. */
export const DEFAULT_CATEGORY_ANALYTICS: Readonly<Required<Pick<CategoryAnalyticsOptions,
  "trackItemViews"
>>> = Object.freeze({
  trackItemViews: true,
});
