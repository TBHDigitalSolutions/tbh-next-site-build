// ============================================================================
// /src/data/packages/index.ts  (production-ready, SSOT-aligned)
// ----------------------------------------------------------------------------
// Requirements:
// - tsconfig.json: "resolveJsonModule": true, "verbatimModuleSyntax": true (recommended)
// - JSON authoring files live alongside this module:
//     ./addOns.json, ./bundles.json, ./featured.json
// - Normalizers & types from /src/data/packages/_types and _adapters
// ============================================================================

// Import authored JSON (Next/TS w/ resolveJsonModule + ESM assertions)
import addOnsJson from "./addOns.json" assert { type: "json" };
import bundlesJson from "./bundles.json" assert { type: "json" };
import featuredJson from "./featured.json" assert { type: "json" };

// Domain types (SSOT) and raw JSON shapes
import type { AddOn, Bundle, PackageBundle } from "./_types/domain";
import type { RawAddOnJson, RawBundleJson, RawFeaturedJson } from "./_types/raw";

// Normalizers to convert raw JSON -> canonical domain types
import {
  normalizeAddOn,
  normalizeBundleHeaders,
  normalizeFeatured,
  toPackageBundle,
} from "./_adapters/normalize";

// Optional bridge for Growth components (kept for compatibility)
import { bundleToGrowthPackage, type GrowthPackage } from "@/src/packages/lib/bridge-growth";

// ============================================================================
// Canonical data (normalized from raw JSON authoring)
// ============================================================================

/** All add-ons as canonical domain entities (slug → id, setup → oneTime). */
export const ADD_ONS: AddOn[] = (addOnsJson as RawAddOnJson[]).map(normalizeAddOn);

/** Bundle headers (page/presentation data; composition gets attached in build). */
export const BUNDLES_HEADERS: Bundle[] = (bundlesJson as RawBundleJson[]).map(
  normalizeBundleHeaders,
);

/** Curated slugs (featured rails, service rails). */
const featured = normalizeFeatured(featuredJson as RawFeaturedJson);
export const FEATURED_BUNDLE_SLUGS: string[] = featured.featuredBundleSlugs;
export const SERVICE_FEATURED_SLUGS: string[] = featured.serviceFeaturedSlugs;

/**
 * Presentation mapping for existing components expecting `PackageBundle`.
 * (This is a lightweight view over Bundle headers; full enrichment happens
 * during build to produce __generated__/bundles.enriched.json.)
 */
export const BUNDLES: PackageBundle[] = BUNDLES_HEADERS.map(toPackageBundle);

// ============================================================================
// Lookups
// ============================================================================

/** Find a bundle by slug (presentation model). */
export function getBundleBySlug(slug: string): PackageBundle | undefined {
  return BUNDLES.find((b) => b.slug === slug);
}

/** Find an add-on by canonical id (equals authored slug). */
export function getAddOnById(id: string): AddOn | undefined {
  return ADD_ONS.find((a) => a.id === id);
}

/** Back-compat alias: find an add-on by authored slug. */
export function getAddOnBySlug(slug: string): AddOn | undefined {
  return getAddOnById(slug);
}

// ============================================================================
// Search (header-level only)
// For the hub, prefer the generated search index: __generated__/packages.search.json
// ============================================================================

/** Simple text search across bundle title/subtitle/summary. */
export function searchBundles(query: string): PackageBundle[] {
  const q = query.trim().toLowerCase();
  if (!q) return BUNDLES;
  return BUNDLES.filter((b) =>
    [b.title, b.subtitle, b.summary]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

// ============================================================================
// Curation utilities
// ============================================================================

/** Top-N bundles prioritizing curated FEATURED_BUNDLE_SLUGS, then filling from all. */
export function topN(n = 3): PackageBundle[] {
  const curated = FEATURED_BUNDLE_SLUGS.map(getBundleBySlug).filter(
    Boolean,
  ) as PackageBundle[];

  const out: PackageBundle[] = [];
  for (const b of curated) {
    if (out.length >= n) break;
    if (!out.find((x) => x.slug === b.slug)) out.push(b);
  }
  if (out.length < n) {
    for (const b of BUNDLES) {
      if (out.length >= n) break;
      if (!out.find((x) => x.slug === b.slug)) out.push(b);
    }
  }
  return out.slice(0, n);
}

// ============================================================================
// Growth bridge (compat with components expecting GrowthPackage)
// ============================================================================

/** Convert presentation bundles → GrowthPackage (bridge for Growth components). */
export function toGrowthPackages(bundles: PackageBundle[]): GrowthPackage[] {
  return bundles.map(bundleToGrowthPackage);
}

// ============================================================================
// Exposed types (quality-of-life re-exports)
// ============================================================================

export type { PackageBundle } from "./_types/domain";
export type { GrowthPackage } from "@/src/packages/lib/bridge-growth";
