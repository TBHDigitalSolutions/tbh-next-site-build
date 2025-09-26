// src/data/modules/recommendations.ts
// ------------------------------------------------------------------
// UI-facing helpers for “Recommended” rails.
// Depends ONLY on the SSOT façade (`@/data/packages`) and the bridge.
// ------------------------------------------------------------------

import {
  BUNDLES as ALL_BUNDLES,
  FEATURED_BUNDLE_SLUGS,
  getBundleBySlug,
} from "@/data/packages";
import type { PackageBundle } from "@/data/packages/_types/packages.types";
import {
  bundleToGrowthPackage,
  type GrowthPackage,
} from "@/packages/lib/bridge-growth";

// Back-compat alias used by some components
export type Package = GrowthPackage;

/** Internal: add if not present (by slug) while under the cap. */
function pushIfRoom(
  map: Map<string, GrowthPackage>,
  gp: GrowthPackage,
  n: number,
) {
  if (map.size >= n) return;
  if (!map.has(gp.slug)) map.set(gp.slug, gp);
}

/** Local helper: convert bundles → GrowthPackage[] (stable order). */
function toGrowthPackages(bundles: PackageBundle[]): GrowthPackage[] {
  return bundles.map(bundleToGrowthPackage);
}

/** Strategy: curated FEATURED_BUNDLE_SLUGS first, then fill from remaining ALL_BUNDLES. */
export function getRecommendedPackages(n = 3): GrowthPackage[] {
  const deduped = new Map<string, GrowthPackage>();

  // 1) Curated
  for (const b of FEATURED_BUNDLE_SLUGS.map(getBundleBySlug).filter(
    (x): x is NonNullable<ReturnType<typeof getBundleBySlug>> => Boolean(x),
  )) {
    pushIfRoom(deduped, bundleToGrowthPackage(b), n);
    if (deduped.size >= n) break;
  }

  // 2) Fill
  if (deduped.size < n) {
    for (const b of ALL_BUNDLES) {
      pushIfRoom(deduped, bundleToGrowthPackage(b), n);
      if (deduped.size >= n) break;
    }
  }

  return Array.from(deduped.values());
}

/**
 * Service-scoped recommendations.
 * Match rule (loose, deterministic):
 *   - Prefer exact match on `bundle.service`
 *   - Fallback: `bundle.tags` includes the service slug
 */
export function getRecommendedForService(
  serviceSlug: string,
  n = 3,
): GrowthPackage[] {
  const matchesService = (b: PackageBundle) =>
    (b.service && b.service === serviceSlug) ||
    (Array.isArray(b.tags) && b.tags.includes(serviceSlug));

  const deduped = new Map<string, GrowthPackage>();

  // 1) Curated subset for service
  for (const b of FEATURED_BUNDLE_SLUGS.map(getBundleBySlug).filter(
    (x): x is NonNullable<ReturnType<typeof getBundleBySlug>> =>
      Boolean(x) && matchesService(x),
  )) {
    pushIfRoom(deduped, bundleToGrowthPackage(b), n);
    if (deduped.size >= n) break;
  }

  // 2) Fill from all bundles matching service
  if (deduped.size < n) {
    for (const b of ALL_BUNDLES) {
      if (!matchesService(b)) continue;
      pushIfRoom(deduped, bundleToGrowthPackage(b), n);
      if (deduped.size >= n) break;
    }
  }

  return Array.from(deduped.values());
}

/** Convenience: map specific bundle slugs → GrowthPackage[] in order. */
export function mapBundlesToGrowthPackages(slugs: string[]): GrowthPackage[] {
  const bundles = slugs
    .map(getBundleBySlug)
    .filter(
      (b): b is NonNullable<ReturnType<typeof getBundleBySlug>> => Boolean(b),
    );
  return toGrowthPackages(bundles);
}
