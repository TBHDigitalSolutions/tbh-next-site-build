// ============================================================================
// /src/data/packages/recommendations.ts
// ----------------------------------------------------------------------------
// UI-facing helpers to power “Recommended” rails.
// - Depends ONLY on the data facade (`./index`) and the Growth bridge
// - No deep coupling to raw data or legacy modules
// - Deterministic ordering: prefer curated slugs, then fill from all bundles
// ============================================================================

import {
  BUNDLES,
  FEATURED_BUNDLE_SLUGS,
  getBundleBySlug,
  toGrowthPackages,
} from "./index";
import { bundleToGrowthPackage, type GrowthPackage } from "@/packages/lib/bridge-growth";

/** Back-compat alias for components importing `type Package` from here. */
export type Package = GrowthPackage;

/** Internal: add to map if not already present (by slug), stop when size hits n. */
function pushIfRoom(
  map: Map<string, GrowthPackage>,
  gp: GrowthPackage,
  n: number,
): void {
  if (map.size >= n) return;
  if (!map.has(gp.slug)) map.set(gp.slug, gp);
}

/** Strategy: prefer curated FEATURED_BUNDLE_SLUGS; fallback to remaining BUNDLES. */
export function getRecommendedPackages(n = 3): GrowthPackage[] {
  const deduped = new Map<string, GrowthPackage>();

  // 1) Curated first
  for (const b of FEATURED_BUNDLE_SLUGS.map(getBundleBySlug).filter(
    (x): x is NonNullable<ReturnType<typeof getBundleBySlug>> => Boolean(x),
  )) {
    pushIfRoom(deduped, bundleToGrowthPackage(b), n);
    if (deduped.size >= n) break;
  }

  // 2) Fill from remaining bundles (stable order)
  if (deduped.size < n) {
    for (const b of BUNDLES) {
      pushIfRoom(deduped, bundleToGrowthPackage(b), n);
      if (deduped.size >= n) break;
    }
  }

  return Array.from(deduped.values());
}

/**
 * Service-scoped recommendations.
 * Strategy: curated slugs that match the service, then remaining bundles that match.
 * Match rule: (b.services ?? []).includes(serviceSlug) — deterministic and simple.
 */
export function getRecommendedForService(
  serviceSlug: string,
  n = 3,
): GrowthPackage[] {
  const matchesService = (b: { services?: string[] }) =>
    Array.isArray(b.services) && b.services.includes(serviceSlug);

  const deduped = new Map<string, GrowthPackage>();

  // 1) Curated subset for the given service
  for (const b of FEATURED_BUNDLE_SLUGS.map(getBundleBySlug).filter(
    (x): x is NonNullable<ReturnType<typeof getBundleBySlug>> =>
      Boolean(x) && matchesService(x as unknown as { services?: string[] }),
  )) {
    pushIfRoom(deduped, bundleToGrowthPackage(b), n);
    if (deduped.size >= n) break;
  }

  // 2) Fill from all bundles that match the service
  if (deduped.size < n) {
    for (const b of BUNDLES) {
      if (!matchesService(b as unknown as { services?: string[] })) continue;
      pushIfRoom(deduped, bundleToGrowthPackage(b), n);
      if (deduped.size >= n) break;
    }
  }

  return Array.from(deduped.values());
}

/** Convenience: map specific bundle slugs → GrowthPackage[] in given order. */
export function mapBundlesToGrowthPackages(slugs: string[]): GrowthPackage[] {
  return toGrowthPackages(
    slugs
      .map(getBundleBySlug)
      .filter(
        (b): b is NonNullable<ReturnType<typeof getBundleBySlug>> => Boolean(b),
      ),
  );
}
