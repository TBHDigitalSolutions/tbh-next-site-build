// /src/portfolio/templates/PortfolioHubTemplate/PortfolioHubTemplate.types.ts

import type { CategorySlug, Project } from "../../lib/types";

/**
 * Viewer variant the hub will ask the orchestrator (PortfolioSection) to render.
 * Keep this in sync with the section orchestrator's accepted variants.
 */
export type HubSectionVariant = "gallery" | "video" | "interactive";

/**
 * Optional CTA button shown in the hero.
 */
export interface HeroButton {
  text: string;
  href: string;
  /** Optional visual variant if your button system supports it. */
  variant?: "primary" | "secondary";
}

/**
 * A single hub subsection (e.g., a category or curated slice).
 * The hub maps over these to render multiple PortfolioSection instances.
 */
export interface HubSection {
  /** Canonical slug for the slice (matches CategorySlug when applicable). */
  slug: CategorySlug | string;
  /** Human-readable label used as the section heading. */
  label: string;
  /** Which viewer to use (gallery/video/interactive). */
  variant: HubSectionVariant;
  /** Path to the full listing for this slice. */
  viewAllHref: string;
  /** Featured items to display. */
  items: readonly Project[];
  /** Optional supporting copy under the heading. */
  subtitle?: string;
  /**
   * Sort key for Hub display; lower = earlier. If omitted,
   * the template falls back to natural order.
   */
  priority?: number;
}

/**
 * Optional meta content for the Hub hero and intro copy.
 */
export interface HubMeta {
  /** Big heading in the hero. */
  title?: string;
  /** Supporting copy under the hero title. */
  subtitle?: string;
  /** Primary CTA button for the hero. */
  heroButton?: HeroButton;
}

/**
 * Feature toggles that affect which blocks render on the Hub page.
 */
export interface HubFeatures {
  /** Show the search banner region. */
  showSearch?: boolean;
  /** Show the overview/intro section. */
  showOverview?: boolean;
  /** Show the closing CTA block. */
  showCTA?: boolean;
}

/**
 * Analytics/instrumentation configuration.
 */
export interface HubAnalyticsOptions {
  /**
   * Base analytics context (e.g., "portfolio_hub").
   * Passed down to child sections; keep stable for event joins.
   */
  context?: string;
  /** If true, enable per-section impression tracking. */
  trackSectionViews?: boolean;
}

/**
 * Props expected by the PortfolioHubTemplate.
 * This template is layout-only (no fetching).
 */
export interface PortfolioHubTemplateProps {
  /** The ordered list of hub slices to render. */
  sections: readonly HubSection[];

  /** Optional meta content for the hero. */
  meta?: HubMeta;

  /** Optional feature flags controlling which blocks appear. */
  features?: HubFeatures;

  /** Optional analytics configuration. */
  analytics?: HubAnalyticsOptions;

  /** Optional DOM hooks for advanced layouts/tests. */
  className?: string;
  id?: string;
  "data-testid"?: string;
}

/* ---------- Safe defaults exported for reuse ---------- */

/** Sensible default feature flags for the hub. */
export const DEFAULT_HUB_FEATURES: Readonly<Required<HubFeatures>> = Object.freeze({
  showSearch: true,
  showOverview: true,
  showCTA: true,
});

/** Sensible default analytics options for the hub. */
export const DEFAULT_HUB_ANALYTICS: Readonly<Required<Pick<HubAnalyticsOptions, "trackSectionViews">>> =
  Object.freeze({
    trackSectionViews: true,
  });

/**
 * Optional default meta copy for the hero. Exported separately so you can
 * reuse/override at the page level without hard-coding strings in the template.
 */
export const DEFAULT_HUB_META: Readonly<Required<Pick<HubMeta, "title" | "subtitle" | "heroButton">>> =
  Object.freeze({
    title: "Portfolio",
    subtitle:
      "Real results across web, video, SEO, content, lead gen, and automation.",
    heroButton: { text: "Start Your Project", href: "/contact" },
  });
