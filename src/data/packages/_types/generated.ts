// ============================================================================
// /src/data/packages/_types/generated.ts
// ----------------------------------------------------------------------------
// Types for _generated JSON artifacts used by search, sitemaps, and caching.
// This file contains **types only** (no runtime). It is safe to import in
// both Node and browser code.
// ============================================================================

import type { Bundle } from "./domain";
import type { ServiceSlug, Tier } from "./primitives";

/* ----------------------------------------------------------------------------
 * Common primitives for generated artifacts
 * --------------------------------------------------------------------------*/

export type HtmlFragment = string;

/** Minimal content payload attached to bundles for search/SEO. */
export type BundleContent = {
  /** Route slug that this HTML belongs to (e.g., "bundle-content-growth"). */
  slug: string;
  /** Compiled HTML fragment (single, safe injection point in templates). */
  html?: HtmlFragment;
  /** Short excerpt derived from the HTML for previews/snippets. */
  excerpt?: string;
  /** Rough word count of `html` for analytics/scoring. */
  wordCount?: number;
  /** ISO date (YYYY-MM-DD) of last content update. */
  updatedAt?: string;
};

/* ----------------------------------------------------------------------------
 * Enriched bundles (bundle base + compiled content)
 * --------------------------------------------------------------------------*/

export type EnrichedBundle = {
  /** Bundle route slug (also used as search/document key). */
  slug: string;
} & Partial<Bundle> & {
  /** Optional compiled content attached during the build. */
  content?: BundleContent;
};

/** JSON written to `src/data/packages/__generated__/bundles.enriched.json` */
export type BundlesEnrichedJson = EnrichedBundle[];

/* ----------------------------------------------------------------------------
 * Compiled content map (non-bundle documents by slug)
 * --------------------------------------------------------------------------*/

export type ContentMapEntry = {
  slug: string;
  title: string;
  summary?: string;
  html: HtmlFragment;
  excerpt: string;
  wordCount: number;
  /** ISO date (YYYY-MM-DD). */
  updatedAt: string;
  headings?: Array<{ depth: number; text: string; id?: string }>;
};

/** JSON written to `src/data/packages/__generated__/content.map.json` */
export type ContentMapJson = Record<string, ContentMapEntry>;

/* ----------------------------------------------------------------------------
 * Unified search index
 * --------------------------------------------------------------------------*/

export type SearchDocType = "bundle" | "package" | "addon" | "doc";

/**
 * A single, flattened record suitable for client-side search.
 * `contentText` is plain text (HTML stripped & entities decoded).
 */
export type PackagesSearchRecord = {
  /** One of: bundle | package | addon | doc  */
  docType: SearchDocType;

  /**
   * Stable unique ID for the search document.
   * Convention: `${docType}:${slugOrId}`
   *  - bundle: `bundle:<bundleSlug>`
   *  - package: `package:<packageId>`
   *  - addon: `addon:<addOnId>`
   *  - doc: `doc:<slug>`
   */
  id: string;

  /** Route slug for navigable docs (bundles, docs). */
  slug: string;

  /** Primary title shown in search results. */
  title: string;

  /** Optional supporting summary/strapline. */
  summary?: string;

  /** Bundles only; kept for display ranking. */
  subtitle?: string;

  /** Bundles only; storefront grouping (optional). */
  category?: string;

  /** Service affinity for filtering/boosting. */
  service?: ServiceSlug;

  /** Freeform tags to improve filtering & relevance. */
  tags?: string[];

  /** Optional legacy tier for package filtering (not for public tier tables). */
  tier?: Tier;

  /** ISO date; used for freshness scoring. */
  updatedAt?: string;

  /** Approximate word count of the source HTML. */
  wordCount?: number;

  /** Flattened headings (H1–H6) for navigable snippets. */
  headings?: string[];

  /** Full plain-text body used for querying (no HTML). */
  contentText: string;
};

/** JSON written to `src/data/packages/__generated__/packages.search.json` */
export type PackagesSearchJson = PackagesSearchRecord[];

/* ----------------------------------------------------------------------------
 * Optional JSON catalogs (kept for compatibility with some pipelines)
 * --------------------------------------------------------------------------*/

/**
 * Minimal package catalog entry when exporting a flat JSON list
 * (e.g., legacy `packages.json`). Prefer importing TS modules directly
 * in new code; this is for caches/static feeds only.
 */
export type PackageCatalogEntry = {
  id: string;
  service: ServiceSlug;
  name: string;
  tier?: Tier;
  summary?: string;
  price?: { oneTime?: number; monthly?: number; currency?: "USD" };
  tags?: string[];
  badges?: string[];
};

/** If produced, written to `src/data/packages/packages.json`. */
export type PackagesCatalogJson = PackageCatalogEntry[];

/** Featured rails as plain JSON (IDs/slugs only; no object duplication). */
export type FeaturedListsJson = {
  /** Global featured bundle slugs for hub rails. */
  featuredBundleSlugs: string[];
  /**
   * Optional per-service featured slugs
   * (if a service-specific page wants its own rail).
   */
  serviceFeaturedSlugs?: string[];
};

/** Curated “Under $1K” slice of packages (IDs only). */
export type Under1KJson = {
  packageIds: string[];
};
